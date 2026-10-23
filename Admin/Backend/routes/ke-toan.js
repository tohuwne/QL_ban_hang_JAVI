const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../../../Shared/Backend/config/database");
const {sendPaidOrderEmails}=require('../../../Shared/Backend/services/order-email');
async function notifyPaidOrders(){try{await sendPaidOrderEmails();}catch(e){console.error('[WEB EMAIL] Đơn đã thanh toán, email đang chờ xử lý.');}}

// ==========================================================
// 6. HÓA ĐƠN & CÔNG NỢ (Kế toán)
// ==========================================================
router.get("/hoa-don", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT hd.MaHD, hd.NgayLap, hd.HinhThucThanhToan, hd.TongTienGiamGia, hd.TongTienThanhToan, hd.TrangThaiThanhToan, hd.MaDH, hd.MaNV, 
               nv.HoTenNV AS NguoiLapPhieu, cn.MaCN, cn.SoDuCN, dh.MaKH, kh.TenKH
        FROM HOA_DON hd 
        LEFT JOIN DON_HANG dh ON hd.MaDH = dh.MaDH
        LEFT JOIN KHACH_HANG kh ON dh.MaKH = kh.MaKH
        LEFT JOIN NHAN_VIEN nv ON hd.MaNV = nv.MaNV 
        LEFT JOIN CONG_NO cn ON hd.MaHD = cn.MaHD
        ORDER BY hd.NgayLap DESC, hd.MaHD DESC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// API Lấy chi tiết một Hóa đơn để In ấn
router.get("/hoa-don/:id/chi-tiet", async (req, res) => {
  try {
    const pool = await poolPromise;
    const hdResult = await pool
      .request()
      .input("MaHD", sql.Char(8), req.params.id.trim()).query(`
        SELECT hd.*, dh.MaKH, dh.TongTienDonHang, dh.TongGiamGiaSP, kh.TenKH, kh.SoDTKH, kh.DiaChiKH, nv.HoTenNV AS NguoiLapPhieu
        FROM HOA_DON hd
        LEFT JOIN DON_HANG dh ON hd.MaDH = dh.MaDH
        LEFT JOIN KHACH_HANG kh ON dh.MaKH = kh.MaKH
        LEFT JOIN NHAN_VIEN nv ON hd.MaNV = nv.MaNV
        WHERE hd.MaHD = @MaHD
      `);

    if (hdResult.recordset.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy!" });

    const hoaDon = hdResult.recordset[0];
    const maDH = hoaDon.MaDH ? hoaDon.MaDH.trim() : "";
    const maKH = hoaDon.MaKH ? hoaDon.MaKH.trim() : "";

    const itemsResult = await pool.request().input("MaDH", sql.Char(8), maDH)
      .query(`
        SELECT CONCAT(sp.TenSP,CASE WHEN ct.TrongLuongGram IS NOT NULL THEN CONCAT(N' / ',ct.TrongLuongGram,N'g / ',ct.LoaiXay) ELSE N'' END) AS name, sp.DonViTinh AS unit, ct.SoLuong AS quantity, COALESCE(ct.DonGia,sp.GiaBan) AS price, ct.GiamGiaSP,
               (ct.SoLuong * COALESCE(ct.DonGia,sp.GiaBan)) * (1 - ISNULL(ct.GiamGiaSP, 0)) AS ThanhTien
        FROM CT_DON_HANG ct 
        JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP 
        WHERE ct.MaDH = @MaDH
      `);

    hoaDon.items = itemsResult.recordset;

    // Tính toán lại chi tiết các loại giảm giá để hiển thị trên hóa đơn in ấn
    let itemDiscountTotal = 0;
    for (const item of hoaDon.items) {
      itemDiscountTotal += item.quantity * item.price * (item.GiamGiaSP || 0);
    }
    const subtotalAfterItemDiscounts =
      hoaDon.TongTienDonHang - itemDiscountTotal;

    let cusDiscountAmt = 0;
    if (maKH) {
      const khRes = await pool
        .request()
        .input("MaKH", sql.Char(8), maKH)
        .query(
          `SELECT lkh.TyLeChietKhau FROM KHACH_HANG kh JOIN LOAI_KHACH_HANG lkh ON kh.MaLoaiKH = lkh.MaLoaiKH WHERE kh.MaKH = @MaKH`,
        );
      if (khRes.recordset.length > 0) {
        const tyLe = parseFloat(khRes.recordset[0].TyLeChietKhau) || 0;
        cusDiscountAmt = subtotalAfterItemDiscounts * tyLe;
      }
    }
    const extraDiscountAmount =
      hoaDon.TongGiamGiaSP - itemDiscountTotal - cusDiscountAmt;

    hoaDon.cusDiscountAmt = cusDiscountAmt;
    hoaDon.extraDiscountAmount = extraDiscountAmount;

    res.json({ success: true, data: hoaDon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/hoa-don", async (req, res) => {
  try {
    const { maDH, maNV, hinhThucTT, trangThaiTT, soTienKhachTra } = req.body;
    const pool = await poolPromise;

    // sp_LapHoaDon sẽ tự động đẩy qua bảng CONG_NO nếu TrangThaiTT = "Chưa thanh toán"
    await pool
      .request()
      .input("MaDH", sql.Char(8), maDH)
      .input("MaNV", sql.Char(8), maNV)
      .input("HinhThucThanhToan", sql.NVarChar(50), hinhThucTT)
      .input("TrangThaiThanhToan", sql.NVarChar(50), trangThaiTT)
      .execute("sp_LapHoaDon");

    // Lấy mã hóa đơn vừa tạo để trả về cho client (phục vụ chức năng in ngay lập tức)
    const hdResult = await pool
      .request()
      .input("MaDH", sql.Char(8), maDH)
      .query("SELECT MaHD FROM HOA_DON WHERE MaDH = @MaDH");

    if (hdResult.recordset.length === 0) {
      throw new Error("Không thể tìm thấy hóa đơn vừa được tạo.");
    }
    const newMaHD = hdResult.recordset[0].MaHD;

    // Nếu là ghi nợ và có trả trước 1 phần, lập phiếu thu tự động cấn trừ
    const cleanSoTienKhachTra = parseFloat(soTienKhachTra) || 0;
    if (trangThaiTT === "Chưa thanh toán" && cleanSoTienKhachTra > 0) {
      const cnResult = await pool
        .request()
        .input("MaHD", sql.Char(8), newMaHD)
        .query("SELECT MaCN FROM CONG_NO WHERE MaHD = @MaHD");

      if (cnResult.recordset.length > 0) {
        const maCN = cnResult.recordset[0].MaCN;
        await pool
          .request()
          .input("SoTienThucThu", sql.Decimal(19, 3), cleanSoTienKhachTra)
          .input("HinhThucThanhToan", sql.NVarChar(50), hinhThucTT)
          .input(
            "GhiChu",
            sql.NVarChar(255),
            "Khách trả trước một phần khi lập hóa đơn",
          )
          .input("MaCN", sql.Char(8), maCN)
          .input("MaNV", sql.Char(8), maNV).query(`
            INSERT INTO PHIEU_THU (NgayThu, SoTienThucThu, HinhThucThanhToan, GhiChu, MaCN, MaNV)
            VALUES (GETDATE(), @SoTienThucThu, @HinhThucThanhToan, @GhiChu, @MaCN, @MaNV)
          `);
      }
    }

    await notifyPaidOrders();
    res.json({
      success: true,
      message: "Lập hóa đơn thành công!",
      data: { maHD: newMaHD },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy tổng hợp Công Nợ Khách Hàng
router.get("/cong-no", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT 
            kh.MaKH,
            kh.TenKH,
            kh.SoDTKH,
            COUNT(cn.MaCN) AS SoPhieuNo,
            SUM(cn.TongNo) AS TongTienNo,
            SUM(cn.SoTienDaTra) AS TongDaTra,
            SUM(cn.SoDuCN) AS TongConNo
        FROM KHACH_HANG kh
        JOIN DON_HANG dh ON kh.MaKH = dh.MaKH
        JOIN HOA_DON hd ON dh.MaDH = hd.MaDH
        JOIN CONG_NO cn ON hd.MaHD = cn.MaHD
        GROUP BY kh.MaKH, kh.TenKH, kh.SoDTKH
      `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách chi tiết các công nợ của 1 khách hàng
router.get("/cong-no/khach-hang/:maKH", async (req, res) => {
  try {
    const pool = await poolPromise;
    const maKH_clean = String(req.params.maKH).trim();
    const profile=await pool.request().input('MaKH',sql.VarChar,maKH_clean).query(`SELECT kh.MaKH,kh.TenKH,kh.SoDTKH,kh.EmailKH,kh.DiaChiKH,kh.GioiTinhKH,lkh.TenLoaiKH
      FROM KHACH_HANG kh LEFT JOIN LOAI_KHACH_HANG lkh ON lkh.MaLoaiKH=kh.MaLoaiKH WHERE kh.MaKH=@MaKH`);
    const result = await pool.request().input("MaKH", sql.VarChar, maKH_clean)
      .query(`
        SELECT cn.MaCN, hd.MaHD, dh.MaDH, cn.SoDuCN, cn.TongNo, cn.NgayGhiNhan, cn.SoTienDaTra, cn.TrangThaiCN 
        FROM CONG_NO cn
        JOIN HOA_DON hd ON cn.MaHD = hd.MaHD
        JOIN DON_HANG dh ON hd.MaDH = dh.MaDH
        WHERE dh.MaKH = @MaKH
        ORDER BY cn.NgayGhiNhan DESC
      `);
    res.json({ success: true, data: result.recordset, customer:profile.recordset[0]||null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách Phiếu Thu
router.get("/phieu-thu", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT pt.MaPT, pt.NgayThu, pt.SoTienThucThu, pt.HinhThucThanhToan, pt.GhiChu, pt.MaCN, pt.MaNV, 
               cn.MaHD, dh.MaDH, dh.MaKH, kh.TenKH, nv.HoTenNV AS NguoiLapPhieu 
        FROM PHIEU_THU pt 
        LEFT JOIN CONG_NO cn ON pt.MaCN = cn.MaCN
        LEFT JOIN HOA_DON hd ON cn.MaHD = hd.MaHD
        LEFT JOIN DON_HANG dh ON hd.MaDH = dh.MaDH
        LEFT JOIN KHACH_HANG kh ON dh.MaKH = kh.MaKH
        LEFT JOIN NHAN_VIEN nv ON pt.MaNV = nv.MaNV
        ORDER BY pt.NgayThu DESC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy chi tiết phiếu thu
router.get("/phieu-thu/:id/chi-tiet", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("MaPT", sql.Char(8), req.params.id.trim())
      .query(`SELECT pt.*, cn.MaHD, dh.MaDH, dh.MaKH, kh.TenKH, nv.HoTenNV AS NguoiLapPhieu 
              FROM PHIEU_THU pt 
              LEFT JOIN CONG_NO cn ON pt.MaCN = cn.MaCN
              LEFT JOIN HOA_DON hd ON cn.MaHD = hd.MaHD
              LEFT JOIN DON_HANG dh ON hd.MaDH = dh.MaDH
              LEFT JOIN KHACH_HANG kh ON dh.MaKH = kh.MaKH
              LEFT JOIN NHAN_VIEN nv ON pt.MaNV = nv.MaNV
              WHERE pt.MaPT = @MaPT`);
    if (result.recordset.length > 0)
      res.json({ success: true, data: result.recordset[0] });
    else
      res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiếu thu." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Phiếu Thu Nợ
router.post("/phieu-thu", async (req, res) => {
  try {
    const { soTienThucThu, hinhThucTT, ghiChu, maCN, maKH, maNV } = req.body;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      let remainingAmount = parseFloat(soTienThucThu);
      const maKH_clean = maKH ? String(maKH).trim() : null;

      if (maKH_clean) {
        // TỰ ĐỘNG CẤN TRỪ NỢ THEO FIFO (KHÔNG CẦN CHỌN MÃ HÓA ĐƠN)
        const cnResult = await transaction
          .request()
          .input("MaKH", sql.VarChar, maKH_clean).query(`
            SELECT cn.MaCN, cn.SoDuCN 
            FROM CONG_NO cn
            JOIN HOA_DON hd ON cn.MaHD = hd.MaHD
            JOIN DON_HANG dh ON hd.MaDH = dh.MaDH
            WHERE dh.MaKH = @MaKH AND cn.SoDuCN > 0
            ORDER BY cn.NgayGhiNhan ASC, cn.MaCN ASC
          `);

        const congNoList = cnResult.recordset;
        if (congNoList.length === 0)
          throw new Error("Khách hàng này không có nợ!");

        let totalDebt = congNoList.reduce((sum, cn) => sum + cn.SoDuCN, 0);
        if (remainingAmount > totalDebt)
          throw new Error(
            "Số tiền thu (" +
              remainingAmount +
              ") vượt quá tổng nợ (" +
              totalDebt +
              ")!",
          );

        for (let cn of congNoList) {
          if (remainingAmount <= 0) break;
          let payAmount =
            remainingAmount >= cn.SoDuCN ? cn.SoDuCN : remainingAmount;
          remainingAmount -= payAmount;

          await transaction
            .request()
            .input("SoTienThucThu", sql.Decimal(19, 3), payAmount)
            .input("HinhThucThanhToan", sql.NVarChar(50), hinhThucTT)
            .input("GhiChu", sql.NVarChar(255), ghiChu || "Cấn trừ nợ tự động")
            .input("MaCN", sql.Char(8), cn.MaCN)
            .input("MaNV", sql.Char(8), maNV)
            .query(`INSERT INTO PHIEU_THU (NgayThu, SoTienThucThu, HinhThucThanhToan, GhiChu, MaCN, MaNV)
                    VALUES (GETDATE(), @SoTienThucThu, @HinhThucThanhToan, @GhiChu, @MaCN, @MaNV)`);

          // BÙ ĐẮP LOGIC DB: Tự động cập nhật Hóa Đơn thành 'Đã thanh toán' nếu thu đủ tiền nợ
          if (payAmount >= cn.SoDuCN) {
            await transaction.request().input("MaCN_Upd", sql.Char(5), cn.MaCN)
              .query(`
                UPDATE HD
                SET HD.TrangThaiThanhToan = N'Đã thanh toán'
                FROM HOA_DON HD
                JOIN CONG_NO CN ON HD.MaHD = CN.MaHD
                WHERE CN.MaCN = @MaCN_Upd
              `);
          }
        }
      } else if (maCN) {
        await transaction
          .request()
          .input("SoTienThucThu", sql.Decimal(19, 3), soTienThucThu)
          .input("HinhThucThanhToan", sql.NVarChar(50), hinhThucTT)
          .input("GhiChu", sql.NVarChar(255), ghiChu)
          .input("MaCN", sql.Char(8), maCN)
          .input("MaNV", sql.Char(8), maNV)
          .query(`INSERT INTO PHIEU_THU (NgayThu, SoTienThucThu, HinhThucThanhToan, GhiChu, MaCN, MaNV)
                  VALUES (GETDATE(), @SoTienThucThu, @HinhThucThanhToan, @GhiChu, @MaCN, @MaNV)`);

        // BÙ ĐẮP LOGIC DB: Kiểm tra và gạch nợ Hóa Đơn (Dành cho chức năng bấm Thu Nợ trực tiếp từ Hóa Đơn)
        await transaction.request().input("MaCN_Upd2", sql.Char(5), maCN)
          .query(`
            UPDATE HD
            SET HD.TrangThaiThanhToan = N'Đã thanh toán'
            FROM HOA_DON HD
            JOIN CONG_NO CN ON HD.MaHD = CN.MaHD
            WHERE CN.MaCN = @MaCN_Upd2 AND CN.SoDuCN <= 0
          `);
      } else {
        throw new Error("Vui lòng cung cấp Mã KH hoặc Mã CN!");
      }

      await transaction.commit();
      await notifyPaidOrders();
      res.json({
        success: true,
        message: "Lập phiếu thu thành công!",
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================================
// 6.5. PHIẾU CHI (Trả nợ Nhà cung cấp)
// ==========================================================
router.get("/phieu-chi", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM PHIEU_CHI ORDER BY NgayChi DESC");
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/phieu-chi/:id/chi-tiet", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("MaPC", sql.Char(8), req.params.id.trim())
      .query(`SELECT pc.*, pn.SoHoaDonNCC, ncc.TenNCC, nv.HoTenNV AS NguoiLapPhieu 
              FROM PHIEU_CHI pc
              LEFT JOIN PHIEU_NHAP pn ON pc.MaPN = pn.MaPN
              LEFT JOIN NHA_CUNG_CAP ncc ON pn.MaNCC = ncc.MaNCC
              LEFT JOIN NHAN_VIEN nv ON pc.MaNV = nv.MaNV
              WHERE pc.MaPC = @MaPC`);
    if (result.recordset.length > 0)
      res.json({ success: true, data: result.recordset[0] });
    else
      res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiếu chi." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/phieu-chi", async (req, res) => {
  try {
    const { soTienChi, hinhThucTT, ghiChu, maPN, maNV } = req.body;
    const pool = await poolPromise;

    // Kích hoạt tự động Trigger trg_Web_CapNhatCongNoKhiPhieuChi
    await pool
      .request()
      .input("SoTienThucChi", sql.Decimal(19, 3), soTienChi)
      .input("HinhThucThanhToan", sql.NVarChar(50), hinhThucTT)
      .input("GhiChu", sql.NVarChar(255), ghiChu)
      .input("MaPN", sql.Char(8), maPN)
      .input("MaNV", sql.Char(8), maNV)
      .query(`INSERT INTO PHIEU_CHI (NgayChi, SoTienThucChi, HinhThucThanhToan, GhiChu, MaPN, MaNV)
              VALUES (GETDATE(), @SoTienThucChi, @HinhThucThanhToan, @GhiChu, @MaPN, @MaNV)`);

    res.json({ success: true, message: "Lập phiếu chi thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
