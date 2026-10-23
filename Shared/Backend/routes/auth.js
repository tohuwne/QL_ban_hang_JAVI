const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/database");

// ==========================================================
// 1. ĐĂNG NHẬP
// ==========================================================
const bcrypt = require("bcryptjs");
const { createToken } = require("../middleware/auth");

// The receiving server decides the login context; request fields cannot override it.
function loginDenial(req, user) {
  if (req.app?.locals?.loginMode === 'admin') {
    return !user.MaNV || user.VaiTro === 'KHACH_HANG'
      ? 'Vui lòng sử dụng tài khoản quản trị hoặc nhân viên.' : '';
  }
  return user.VaiTro !== 'KHACH_HANG' || !user.MaKH || user.MaNV
    ? 'Không tìm thấy tài khoản.' : '';
}

const safeUserFromRecord = (user) => {
  const safeUser = {
    TenDangNhap: user.TenDangNhap, VaiTro: user.VaiTro, MaNV: user.MaNV, MaKH: user.MaKH,
    HoTenNV: user.HoTenNV, ChucVu: user.ChucVu, SoDTNV: user.SoDTNV, EmailNV: user.EmailNV,
    TenKH: user.TenKH, EmailKH: user.EmailKH, SoDTKH: user.SoDTKH, DiaChiKH: user.DiaChiKH,
  };
  safeUser.AuthToken = createToken(safeUser);
  return safeUser;
};

async function ensureGoogleSubColumn(pool) {
  await pool.request().query(`
    IF COL_LENGTH('TAI_KHOAN', 'GoogleSub') IS NULL ALTER TABLE TAI_KHOAN ADD GoogleSub VARCHAR(64) NULL;
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_TAI_KHOAN_GoogleSub' AND object_id = OBJECT_ID('TAI_KHOAN'))
      CREATE UNIQUE INDEX UQ_TAI_KHOAN_GoogleSub ON TAI_KHOAN(GoogleSub) WHERE GoogleSub IS NOT NULL;
  `);
}

async function verifyGoogleCredential(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Google Sign-In chưa được cấu hình trên máy chủ.");
  if (!credential) throw new Error("Thiếu thông tin xác thực Google.");
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  if (!response.ok) throw new Error("Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn.");
  const profile = await response.json();
  if (profile.aud !== clientId || profile.email_verified !== "true" || !profile.sub) throw new Error("Không thể xác minh tài khoản Google.");
  return { sub: profile.sub, email: profile.email || "", fullName: profile.name || "" };
}

async function findGoogleAccount(pool, googleSub) {
  const result = await pool.request().input("GoogleSub", sql.VarChar(64), googleSub).query(
    `SELECT tk.TenDangNhap, tk.VaiTro, tk.MaNV, tk.MaKH, nv.HoTenNV, nv.ChucVu, nv.SoDTNV, nv.EmailNV, nv.TrangThai, kh.TenKH, kh.SoDTKH, kh.DiaChiKH, kh.EmailKH
     FROM TAI_KHOAN tk LEFT JOIN NHAN_VIEN nv ON tk.MaNV = nv.MaNV LEFT JOIN KHACH_HANG kh ON tk.MaKH = kh.MaKH WHERE tk.GoogleSub = @GoogleSub`,
  );
  return result.recordset[0] || null;
}

router.post("/login", async (req, res) => {
  try {
    const username = req.body.TenDangNhap || req.body.username || "";
    const password = req.body.MatKhau || req.body.password || "";

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!",
      });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("TenDangNhap", sql.VarChar, username.trim())
      .query(
        `SELECT tk.TenDangNhap, tk.MatKhau, tk.VaiTro, tk.MaNV, tk.MaKH, 
           nv.HoTenNV, nv.ChucVu, nv.SoDTNV, nv.EmailNV, nv.TrangThai,
           kh.TenKH, kh.SoDTKH, kh.DiaChiKH, kh.EmailKH
         FROM TAI_KHOAN tk 
         LEFT JOIN NHAN_VIEN nv ON tk.MaNV = nv.MaNV 
         LEFT JOIN KHACH_HANG kh ON tk.MaKH = kh.MaKH
         WHERE tk.TenDangNhap = @TenDangNhap`,
      );

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      const inputPass = password.trim();
      let match = false;
      try {
        if (user.MatKhau && user.MatKhau.startsWith('$2')) {
          match = await bcrypt.compare(inputPass, user.MatKhau);
        }
      } catch (e) {
        match = false;
      }
      if (!match && user.MatKhau === inputPass) {
        match = true;
      }
      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Tài khoản hoặc mật khẩu không chính xác!",
        });
      }

      if (user.MaNV && user.TrangThai && user.TrangThai !== "Đang làm việc") {
        return res.status(403).json({
          success: false,
          message: "Tài khoản nhân viên đã bị khóa.",
        });
      }

      const denied = loginDenial(req, user);
      if (denied) return res.status(403).json({ success: false, message: denied });

      // Nâng cấp tài khoản cũ đang lưu mật khẩu dạng thường sang bcrypt sau lần đăng nhập hợp lệ.
      if (user.MatKhau && !user.MatKhau.startsWith("$2")) {
        const hashedPassword = await bcrypt.hash(inputPass, 10);
        await pool
          .request()
          .input("TenDangNhap", sql.VarChar(50), user.TenDangNhap)
          .input("MatKhau", sql.VarChar(255), hashedPassword)
          .query(
            "UPDATE TAI_KHOAN SET MatKhau = @MatKhau WHERE TenDangNhap = @TenDangNhap",
          );
      }

      const safeUser = safeUserFromRecord(user);

      res.json({
        success: true,
        message: "Đăng nhập thành công",
        data: safeUser,
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Server: " + err.message });
  }
});

router.get("/google-config", (_req, res) => res.json({ clientId: process.env.GOOGLE_CLIENT_ID || "" }));

router.post("/google", async (req, res) => {
  try {
    const profile = await verifyGoogleCredential(req.body.credential);
    const pool = await poolPromise;
    await ensureGoogleSubColumn(pool);
    const account = await findGoogleAccount(pool, profile.sub);
    if (account) {
      const denied = loginDenial(req, account);
      if (denied) return res.status(403).json({ success: false, message: denied });
      if (account.MaNV && account.TrangThai && account.TrangThai !== "Đang làm việc") return res.status(403).json({ success: false, message: "Tài khoản nhân viên đã bị khóa." });
      return res.json({ success: true, data: safeUserFromRecord(account) });
    }
    const username = (profile.email.split("@")[0] || "javiuser").replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 35) || "javiuser";
    res.json({ success: true, requiresProfile: true, profile: { fullName: profile.fullName, email: profile.email, username } });
  } catch (err) { res.status(400).json({ success: false, message: err.message || "Không thể xác thực Google." }); }
});

router.post("/google/register", async (req, res) => {
  let proof;
  try {
    const { username, fullName, phone, address } = req.body;
    if (!username || !fullName || !phone) return res.status(400).json({ success: false, message: "Vui lòng bổ sung họ tên, số điện thoại và tên đăng nhập." });
    const profile = await verifyGoogleCredential(req.body.credential);
    const pool = await poolPromise;
    await ensureGoogleSubColumn(pool);
    const existingGoogleAccount = await findGoogleAccount(pool, profile.sub);
    if (existingGoogleAccount) {
      const denied = loginDenial(req, existingGoogleAccount);
      if (denied) return res.status(403).json({ success: false, message: denied });
      return res.json({ success: true, data: safeUserFromRecord(existingGoogleAccount) });
    }
    if(req.body.otpType!=='email'||String(req.body.email||'').trim().toLowerCase()!==profile.email.toLowerCase())throw Error('Cần xác thực OTP tới email Google đăng ký.');
    proof=registrationOtp(profile.email,req.body.otp);
    if(proof.record.inFlight)throw Error('Yêu cầu đang được xử lý.');proof.record.inFlight=true;
    const transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL?.SERIALIZABLE);
    try {
      const existingUsername = await transaction.request().input("TenDangNhap", sql.VarChar(50), username.trim()).query("SELECT 1 FROM TAI_KHOAN WHERE TenDangNhap = @TenDangNhap");
      if (existingUsername.recordset.length) throw new Error("Tên đăng nhập đã được sử dụng!");
      const systemPassword = await bcrypt.hash('google-'+require('crypto').randomBytes(32).toString('hex'),10);
      const resolution=await require('../services/customer-link').resolveCustomer(transaction,{username:username.trim(),hash:systemPassword,fullName:fullName.trim(),phone,address,email:profile.email,googleSub:profile.sub});
      let customer=resolution?.customer;
      if(!customer){
      await transaction.request().input("TenKH", sql.NVarChar(50), fullName.trim()).input("SoDTKH",sql.VarChar(50),require('../services/customer-link').normalizePhone(phone)).input("EmailKH",sql.VarChar(100),profile.email).input("DiaChiKH",sql.NVarChar(100),address?address.trim():'').query("INSERT INTO KHACH_HANG(TenKH,SoDTKH,EmailKH,DiaChiKH,MaLoaiKH) VALUES(@TenKH,@SoDTKH,@EmailKH,@DiaChiKH,'L01')");
      const customerResult=await transaction.request().query("SELECT TOP 1 * FROM KHACH_HANG ORDER BY MaKH DESC");customer=customerResult.recordset[0];
      }
      const maKH=customer.MaKH;
      await transaction.request().input("TenDangNhap", sql.VarChar(50), username.trim()).input("MatKhau", sql.VarChar(255), systemPassword).input("MaKH", sql.Char(8), maKH).input("GoogleSub", sql.VarChar(64), profile.sub).query("INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, MaKH, VaiTro, GoogleSub) VALUES (@TenDangNhap, @MatKhau, @MaKH, 'KHACH_HANG', @GoogleSub)");
      await transaction.commit();
      otpCache.delete(proof.key);
      res.json({ success: true, data: safeUserFromRecord({ TenDangNhap: username.trim(), VaiTro: "KHACH_HANG", MaKH: maKH, TenKH: customer.TenKH, SoDTKH: customer.SoDTKH, EmailKH:customer.EmailKH, DiaChiKH:customer.DiaChiKH }) });
    } catch (err) { await transaction.rollback(); res.status(400).json({ success: false, message: err.message }); }
  } catch (err) { res.status(400).json({ success: false, message: err.message || "Không thể đăng ký bằng Google." }); } finally {if(proof)proof.record.inFlight=false;}
});

// ==========================================================
// QUẢN LÝ MÃ XÁC THỰC OTP TRONG BỘ NHỚ
// ==========================================================
const otpCache = new Map();
function registrationOtp(email, code) {
  const key = String(email || '').trim().toLowerCase();
  const record = otpCache.get(key);
  if (!record || Date.now() > record.expiresAt) {
    otpCache.delete(key);
    throw new Error('Mã OTP không tồn tại hoặc đã hết hạn.');
  }
  if (record.attempts >= 5) {
    otpCache.delete(key);
    throw new Error('Bạn đã nhập sai mã quá số lần cho phép.');
  }
  if (!/^\d{6}$/.test(String(code || '')) || record.code !== String(code)) {
    record.attempts += 1;
    throw new Error('Mã OTP không chính xác.');
  }
  return {key, record};
}
if (typeof setInterval === "function") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, data] of otpCache.entries()) {
      if (now > data.expiresAt) otpCache.delete(key);
    }
  }, 300000);
  if (cleanupTimer && typeof cleanupTimer.unref === "function") cleanupTimer.unref();
}

// Kiểm tra tính hợp lệ và chống trùng lặp Bước 1
router.post("/register/check-step1", async (req, res) => {
  try {
    const { username, phone, email } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập tên đăng nhập." });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập số điện thoại." });
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||'').trim())||!/^\+?[0-9]{9,15}$/.test(String(phone).trim()))return res.status(400).json({success:false,message:'Vui lòng nhập email và số điện thoại hợp lệ.'});
    const cleanUser = username.trim();
    if (cleanUser.length < 4 || cleanUser.length > 30) {
      return res.status(400).json({ success: false, message: "Tên đăng nhập phải từ 4 đến 30 ký tự." });
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUser)) {
      return res.status(400).json({ success: false, message: "Tên đăng nhập chỉ chứa chữ cái, chữ số, dấu gạch dưới, gạch ngang hoặc dấu chấm." });
    }

    const pool = await poolPromise;
    const userCheck = await pool.request()
      .input("TenDangNhap", sql.VarChar(50), cleanUser)
      .query("SELECT 1 FROM TAI_KHOAN WHERE TenDangNhap = @TenDangNhap");
    if (userCheck.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "Tên đăng nhập đã được sử dụng! Vui lòng chọn tên khác." });
    }

    // Existing phone profiles continue to verified linking; never disclose profile/account details here.

    res.json({ success: true, message: "Thông tin bước 1 hợp lệ." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi kiểm tra thông tin: " + err.message });
  }
});

// Gửi mã OTP xác nhận qua Email
router.post("/otp/send-email", async (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Email nhận mã OTP không hợp lệ." });
    }
    const target = email.trim().toLowerCase();
    const now = Date.now();
    const existing = otpCache.get(target);

    if (existing && now - existing.createdAt < 45000) {
      const waitSec = Math.ceil((45000 - (now - existing.createdAt)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Vui lòng đợi ${waitSec} giây trước khi yêu cầu gửi lại mã.`
      });
    }

    const otp = require('crypto').randomInt(100000, 1000000).toString();
    otpCache.set(target, {
      code: otp,
      createdAt: now,
      expiresAt: now + 5 * 60 * 1000,
      attempts: 0
    });

    const isConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    if (isConfigured) {
      try {
        const nodemailer = require("nodemailer");
        const port = Number(process.env.SMTP_PORT || 465);
        const transport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port,
          secure: port === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          connectionTimeout: 10000,
          socketTimeout: 15000
        });

        const html = require('../services/registration-email-template').renderRegistrationEmail({fullName,otp});

        await transport.sendMail({
          from: { name: 'JAVI COFFEE', address: process.env.SMTP_FROM || process.env.SMTP_USER },
          to: target,
          subject: `[JAVI COFFEE] Mã xác nhận đăng ký tài khoản: ${otp}`,
          html,
          text: `Mã xác thực đăng ký tài khoản JAVI COFFEE của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`
        });

        return res.json({
          success: true,
          message: `Mã OTP đã được gửi đến email ${target}.`
        });
      } catch (mailErr) {
        console.error("[OTP EMAIL ERROR]", mailErr);
        otpCache.delete(target);
        return res.status(502).json({success:false,message:'Chưa gửi được email OTP. Vui lòng thử lại sau.'});
      }
    } else if (process.env.OTP_DEV_MODE === 'true' && process.env.NODE_ENV !== 'production') {
      console.log(`\n========================================\n[DEV OTP] Mã xác thực cho ${target}: ${otp}\n========================================\n`);
      return res.json({
        success: true,
        message: `Mã OTP đã được tạo (Chế độ dev: ${otp}).`,
        devOtp: otp
      });
    } else { otpCache.delete(target); return res.status(503).json({success:false,message:'Dịch vụ email OTP chưa được cấu hình.'}); }
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi gửi mã OTP: " + err.message });
  }
});

// Xác thực mã OTP
router.post("/otp/verify", async (req, res) => {
  try {
    const { type, target, otp } = req.body;
    if (!type || !target || !otp) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp mã OTP và thông tin nhận." });
    }
    if (type !== 'email') return res.status(400).json({success:false,message:'Hiện chỉ hỗ trợ xác thực OTP qua email.'});
    registrationOtp(target, otp);
    res.json({ success: true, message: "Xác thực OTP thành công." });
  } catch (err) {
    res.status(400).json({ success: false, message: "Lỗi xác thực: " + err.message });
  }
});

router.post("/register", async (req, res) => {
  let proof;
  try {
    const { username, password, fullName, phone, email, address, otp, otpType } = req.body;
    if (!username || !password || !fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đủ thông tin (Tài khoản, mật khẩu, họ tên, SĐT)!",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có độ dài tối thiểu 6 ký tự!",
      });
    }

    if (otpType !== 'email' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim()))
      return res.status(400).json({success:false,message:'Đăng ký yêu cầu xác thực OTP qua email.'});
    if (!/^[a-zA-Z0-9_.-]{4,30}$/.test(String(username).trim()) || !/^\+?[0-9]{9,15}$/.test(String(phone).trim()))
      return res.status(400).json({success:false,message:'Tên đăng nhập hoặc số điện thoại không hợp lệ.'});
    try { proof = registrationOtp(email, otp); } catch (e) { return res.status(400).json({success:false,message:e.message}); }
    if (proof.record.inFlight) return res.status(409).json({success:false,message:'Yêu cầu đăng ký đang được xử lý.'});
    proof.record.inFlight = true;

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL?.SERIALIZABLE);

    try {
      // 1. Kiểm tra username đã tồn tại
      const checkTk = await transaction
        .request()
        .input("TenDangNhap", sql.VarChar, username.trim())
        .query("SELECT * FROM TAI_KHOAN WITH(UPDLOCK,HOLDLOCK) WHERE TenDangNhap = @TenDangNhap");
      if (checkTk.recordset.length > 0)
        throw new Error("Tên đăng nhập đã được sử dụng!");
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      const resolution = await require('../services/customer-link').resolveCustomer(transaction,{username:username.trim(),hash:hashedPassword,fullName:fullName.trim(),phone,address,email:email.trim().toLowerCase()});
      let linkedCustomer=resolution?.customer;
      if(!linkedCustomer){
      // 2. Tạo Khách Hàng mới
      await transaction
        .request()
        .input("TenKH", sql.NVarChar(50), fullName.trim())
        .input("SoDTKH", sql.VarChar(50), phone.trim())
        .input("EmailKH", sql.VarChar(100), email ? email.trim() : "")
        .input("DiaChiKH", sql.NVarChar(100), address ? address.trim() : "")
        .input("MaLoaiKH", sql.Char(3), "L01")
        .query(`INSERT INTO KHACH_HANG (TenKH, SoDTKH, EmailKH, DiaChiKH, MaLoaiKH) 
                VALUES (@TenKH, @SoDTKH, @EmailKH, @DiaChiKH, @MaLoaiKH)`);

      const khResult = await transaction
        .request()
        .query(
          "SELECT TOP 1 MaKH FROM KHACH_HANG ORDER BY CAST(SUBSTRING(MaKH, 3, 6) AS INT) DESC",
        );
      linkedCustomer={MaKH:khResult.recordset[0].MaKH,TenKH:fullName.trim(),SoDTKH:phone.trim(),EmailKH:email.trim(),DiaChiKH:address?address.trim():''};
      }
      const newMaKH=linkedCustomer.MaKH;

      // 3. Tạo Tài Khoản
      await transaction
        .request()
        .input("TenDangNhap", sql.VarChar, username.trim())
        .input("MatKhau", sql.VarChar, hashedPassword)
        .input("MaKH", sql.Char(8), newMaKH)
        .query(`INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, MaKH, VaiTro) 
                VALUES (@TenDangNhap, @MatKhau, @MaKH, 'KHACH_HANG')`);

      await transaction.commit();
      otpCache.delete(proof.key);

      const safeUser = safeUserFromRecord({
        TenDangNhap: username.trim(),
        VaiTro: 'KHACH_HANG',
        MaKH: newMaKH,
        TenKH: linkedCustomer.TenKH,
        SoDTKH: linkedCustomer.SoDTKH,
        EmailKH: linkedCustomer.EmailKH,
        DiaChiKH: linkedCustomer.DiaChiKH
      });

      res.json({
        success: true,
        message: "Đăng ký thành công! Bạn có thể bắt đầu mua sắm.",
        data: safeUser
      });
    } catch (err) {
      await transaction.rollback();
      res.status(400).json({ success: false, message: err.message });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống: " + err.message });
  } finally { if (proof) proof.record.inFlight = false; }
});

module.exports = router;

