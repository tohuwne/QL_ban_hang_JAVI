const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("./config/database");
// ==========================================================
// 1. ĐĂNG NHẬP
// ==========================================================
router.post("/login", async (req, res) => {
  try {
    // Hỗ trợ đọc tham số theo nhiều kiểu tên gọi từ Frontend và loại bỏ khoảng trắng thừa
    const username = req.body.TenDangNhap || req.body.username || "";
    const password = req.body.MatKhau || req.body.password || "";

    console.log("Dữ liệu gửi lên từ form Login:", req.body);

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
      .input("MatKhau", sql.VarChar, password.trim())
      .query(
        `SELECT tk.TenDangNhap, tk.MaNV, nv.HoTenNV, nv.ChucVu, nv.SoDTNV, nv.EmailNV 
         FROM TAI_KHOAN tk 
         JOIN NHAN_VIEN nv ON tk.MaNV = nv.MaNV 
         WHERE tk.TenDangNhap = @TenDangNhap AND tk.MatKhau = @MatKhau`,
      );

    if (result.recordset.length > 0) {
      res.json({
        success: true,
        message: "Đăng nhập thành công",
        data: result.recordset[0],
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

// ==========================================================
// 2. SẢN PHẨM (CRUD)
// ==========================================================
router.get("/san-pham", async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT 
        sp.MaSP, sp.TenSP, sp.DonViTinh, sp.TrongLuong, sp.GiaBan, 
        sp.SoLuongTon, sp.SoLuongKD, sp.GhiChu, sp.MaLoaiSP, 
        lsp.TenLoaiSP
      FROM SAN_PHAM sp
      LEFT JOIN LOAI_SAN_PHAM lsp ON sp.MaLoaiSP = lsp.MaLoaiSP
      ORDER BY sp.MaSP DESC
    `;
    const result = await pool.request().query(query);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi lấy DS Sản Phẩm: " + err.message });
  }
});

router.post("/san-pham", async (req, res) => {
  try {
    const { maSP, tenSP, dvt, trongLuong, giaBan, ghiChu, loaiSP } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaSP", sql.Char(5), maSP)
      .input("TenSP", sql.NVarChar(50), tenSP)
      .input("DonViTinh", sql.NVarChar(50), dvt)
      .input("TrongLuong", sql.Decimal(10, 2), trongLuong ? trongLuong : null)
      .input("GiaBan", sql.Decimal(19, 3), giaBan)
      .input("GhiChu", sql.NVarChar(255), ghiChu ? ghiChu : "")
      .input("MaLoaiSP", sql.Char(3), loaiSP).query(`
        INSERT INTO SAN_PHAM (MaSP, TenSP, DonViTinh, TrongLuong, GiaBan, GhiChu, MaLoaiSP) 
        VALUES (@MaSP, @TenSP, @DonViTinh, @TrongLuong, @GiaBan, @GhiChu, @MaLoaiSP)
      `);
    res.json({ success: true, message: "Thêm sản phẩm thành công!" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi thêm Sản Phẩm: " + err.message });
  }
});

router.put("/san-pham/:id", async (req, res) => {
  try {
    const { tenSP, dvt, trongLuong, giaBan, ghiChu, loaiSP } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaSP", sql.Char(5), req.params.id)
      .input("TenSP", sql.NVarChar(50), tenSP)
      .input("DonViTinh", sql.NVarChar(50), dvt)
      .input("TrongLuong", sql.Decimal(10, 2), trongLuong ? trongLuong : null)
      .input("GiaBan", sql.Decimal(19, 3), giaBan)
      .input("GhiChu", sql.NVarChar(255), ghiChu ? ghiChu : "")
      .input("MaLoaiSP", sql.Char(3), loaiSP).query(`
        UPDATE SAN_PHAM 
        SET TenSP=@TenSP, DonViTinh=@DonViTinh, TrongLuong=@TrongLuong, 
            GiaBan=@GiaBan, GhiChu=@GhiChu, MaLoaiSP=@MaLoaiSP 
        WHERE MaSP=@MaSP
      `);
    res.json({ success: true, message: "Cập nhật sản phẩm thành công!" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật Sản Phẩm: " + err.message,
    });
  }
});

router.delete("/san-pham/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaSP", sql.Char(5), req.params.id)
      .query("DELETE FROM SAN_PHAM WHERE MaSP = @MaSP");
    res.json({ success: true, message: "Xóa sản phẩm thành công!" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Không thể xóa do sản phẩm đã phát sinh giao dịch/tồn kho!",
    });
  }
});

// ==========================================================
// 3. NHẬP KHO (Gọi Stored Procedure)
// ==========================================================
router.get("/nhap-kho", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM PHIEU_NHAP ORDER BY NgayNhap DESC");
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/nhap-kho", async (req, res) => {
  try {
    const { maNV, maNCC, soHoaDonNCC, ghiChu, maSP, soLuong, giaNhap } =
      req.body;
    const pool = await poolPromise;

    // Gọi Stored Procedure xử lý nhập kho (Tự động tính tiền và cộng kho)
    await pool
      .request()
      .input("MaNV", sql.Char(5), maNV)
      .input("MaNCC", sql.Char(5), maNCC)
      .input("SoHoaDonNCC", sql.VarChar(50), soHoaDonNCC)
      .input("GhiChu", sql.NVarChar(255), ghiChu)
      .input("MaSP", sql.Char(5), maSP)
      .input("SoLuong", sql.Int, soLuong)
      .input("GiaNhap", sql.Decimal(19, 3), giaNhap)
      .execute("sp_XuLyNhapKho");

    res.json({ success: true, message: "Nhập kho thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================================
// 4. ĐƠN HÀNG (POS)
// ==========================================================
router.get("/don-hang", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT dh.*, px.MaPX, hd.TrangThaiThanhToan 
        FROM DON_HANG dh 
        LEFT JOIN PHIEU_XUAT px ON dh.MaDH = px.MaDH 
        LEFT JOIN HOA_DON hd ON dh.MaDH = hd.MaDH
        ORDER BY dh.NgayDat DESC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/don-hang", async (req, res) => {
  try {
    const {
      maKH,
      maNV,
      cartItems,
      tongTienDonHang,
      tongGiamGiaSP,
      tongTienSauGiam,
      tienKhachDua,
      hinhThucTT,
      trangThaiDonHang,
    } = req.body;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Tạo Đơn hàng mới
      await transaction
        .request()
        .input("TongTienDonHang", sql.Decimal(19, 3), tongTienDonHang)
        .input("TongGiamGiaSP", sql.Decimal(19, 3), tongGiamGiaSP)
        .input("TongTienSauGiam", sql.Decimal(19, 3), tongTienSauGiam)
        .input(
          "TrangThaiDonHang",
          sql.NVarChar(50),
          trangThaiDonHang || "Hoàn thành",
        )
        .input("MaNV", sql.Char(5), maNV)
        .input("MaKH", sql.Char(5), maKH)
        .query(`INSERT INTO DON_HANG (NgayDat, TongTienDonHang, TongGiamGiaSP, TongTienSauGiam, TrangThaiDonHang, MaNV, MaKH) 
                VALUES (GETDATE(), @TongTienDonHang, @TongGiamGiaSP, @TongTienSauGiam, @TrangThaiDonHang, @MaNV, @MaKH)`);

      // Lấy Mã DH vừa tự động sinh
      const dhResult = await transaction
        .request()
        .query(
          "SELECT TOP 1 MaDH FROM DON_HANG ORDER BY CAST(SUBSTRING(MaDH, 3, 3) AS INT) DESC",
        );
      const newMaDH = dhResult.recordset[0].MaDH;

      // 2. Thêm Chi tiết ĐH và Trừ Tồn Kho
      for (let item of cartItems) {
        const stockCheck = await transaction
          .request()
          .input("MaSP", sql.Char(5), item.maSP)
          .query("SELECT SoLuongKD FROM SAN_PHAM WHERE MaSP = @MaSP");
        if (stockCheck.recordset[0].SoLuongKD < item.qty)
          throw new Error(`Kho không đủ SP ${item.tenSP}!`);

        await transaction
          .request()
          .input("MaDH", sql.Char(5), newMaDH)
          .input("MaSP", sql.Char(5), item.maSP)
          .input("SoLuong", sql.Int, item.qty)
          .input("GiamGiaSP", sql.Decimal(5, 4), item.itemDiscount || 0)
          .query(
            `INSERT INTO CT_DON_HANG (MaDH, MaSP, SoLuong, GiamGiaSP) VALUES (@MaDH, @MaSP, @SoLuong, @GiamGiaSP)`,
          );
      }

      await transaction.commit();

      res.json({
        success: true,
        message: "Lên đơn hàng thành công!",
        data: { maDH: newMaDH },
      });
    } catch (err) {
      await transaction.rollback();
      res
        .status(500)
        .json({ success: false, message: "Lỗi tạo đơn: " + err.message });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách đơn hàng chưa lập hóa đơn
router.get("/don-hang/chua-lap-hoa-don", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT dh.*, kh.TenKH 
      FROM DON_HANG dh 
      LEFT JOIN KHACH_HANG kh ON dh.MaKH = kh.MaKH
      WHERE dh.MaDH NOT IN (SELECT MaDH FROM HOA_DON WHERE MaDH IS NOT NULL)
      ORDER BY dh.NgayDat DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy chi tiết đơn hàng
router.get("/don-hang/:id/chi-tiet", async (req, res) => {
  try {
    const pool = await poolPromise;
    const dhResult = await pool
      .request()
      .input("MaDH", sql.Char(5), req.params.id.trim())
      .query(`SELECT dh.*, kh.TenKH, kh.SoDTKH, kh.DiaChiKH, nv.HoTenNV AS NguoiLapPhieu 
              FROM DON_HANG dh
              LEFT JOIN KHACH_HANG kh ON dh.MaKH = kh.MaKH
              LEFT JOIN NHAN_VIEN nv ON dh.MaNV = nv.MaNV
              WHERE dh.MaDH = @MaDH`);
    if (dhResult.recordset.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy" });

    const donHang = dhResult.recordset[0];
    const itemsResult = await pool
      .request()
      .input("MaDH", sql.Char(5), req.params.id.trim())
      .query(`SELECT ct.MaSP, sp.TenSP AS name, ct.SoLuong AS quantity, sp.DonViTinh AS unit, sp.GiaBan AS price, ct.GiamGiaSP, 
              (ct.SoLuong * sp.GiaBan) * (1 - ISNULL(ct.GiamGiaSP, 0)) AS ThanhTien
              FROM CT_DON_HANG ct JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP WHERE ct.MaDH = @MaDH`);
    donHang.items = itemsResult.recordset;
    res.json({ success: true, data: donHang });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Xóa đơn hàng (chỉ khi chưa lập HĐ và PX)
router.delete("/don-hang/:id", async (req, res) => {
  try {
    const maDH = req.params.id.trim();
    const pool = await poolPromise;

    // 1. Kiểm tra hóa đơn hoặc phiếu xuất
    const hdCheck = await pool
      .request()
      .input("MaDH", sql.Char(5), maDH)
      .query("SELECT COUNT(*) AS count FROM HOA_DON WHERE MaDH = @MaDH");
    
    const pxCheck = await pool
      .request()
      .input("MaDH", sql.Char(5), maDH)
      .query("SELECT COUNT(*) AS count FROM PHIEU_XUAT WHERE MaDH = @MaDH");

    if (hdCheck.recordset[0].count > 0 || pxCheck.recordset[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa đơn hàng đã lập hóa đơn hoặc phiếu xuất kho!",
      });
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 2. Lấy danh sách sản phẩm và trạng thái đơn hàng để trả lại kho
      const oldItemsResult = await transaction
        .request()
        .input("MaDH", sql.Char(5), maDH)
        .query("SELECT MaSP, SoLuong FROM CT_DON_HANG WHERE MaDH = @MaDH");

      const oldOrderResult = await transaction
        .request()
        .input("MaDH", sql.Char(5), maDH)
        .query("SELECT TrangThaiDonHang FROM DON_HANG WHERE MaDH = @MaDH");

      if (oldOrderResult.recordset.length === 0) {
        throw new Error("Không tìm thấy đơn hàng cần xóa.");
      }

      const trangThaiDonHang = oldOrderResult.recordset[0].TrangThaiDonHang;

      // 3. Trả lại số lượng kho (cập nhật đồng thời tránh vi phạm CHECK constraint)
      for (let item of oldItemsResult.recordset) {
        await transaction
          .request()
          .input("MaSP", sql.Char(5), item.MaSP)
          .input("SoLuong", sql.Int, item.SoLuong)
          .input("TrangThai", sql.NVarChar(50), trangThaiDonHang)
          .query(`
            UPDATE SAN_PHAM 
            SET SoLuongKD = SoLuongKD + @SoLuong,
                SoLuongTon = SoLuongTon + (CASE WHEN @TrangThai = N'Hoàn thành' THEN @SoLuong ELSE 0 END)
            WHERE MaSP = @MaSP
          `);
      }

      // 4. Xóa chi tiết và đơn hàng
      await transaction
        .request()
        .input("MaDH", sql.Char(5), maDH)
        .query("DELETE FROM CT_DON_HANG WHERE MaDH = @MaDH");

      await transaction
        .request()
        .input("MaDH", sql.Char(5), maDH)
        .query("DELETE FROM DON_HANG WHERE MaDH = @MaDH");

      await transaction.commit();
      res.json({ success: true, message: "Xóa đơn hàng thành công!" });
    } catch (err) {
      await transaction.rollback();
      res.status(500).json({ success: false, message: "Lỗi xóa đơn hàng: " + err.message });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Chỉnh sửa đơn hàng (chỉ khi chưa lập HĐ và PX)
router.put("/don-hang/:id", async (req, res) => {
  try {
    const maDH = req.params.id.trim();
    const {
      maKH,
      maNV,
      cartItems,
      tongTienDonHang,
      tongGiamGiaSP,
      tongTienSauGiam,
      trangThaiDonHang,
    } = req.body;
    const pool = await poolPromise;

    // 1. Kiểm tra hóa đơn hoặc phiếu xuất
    const hdCheck = await pool
      .request()
      .input("MaDH", sql.Char(5), maDH)
      .query("SELECT COUNT(*) AS count FROM HOA_DON WHERE MaDH = @MaDH");
    
    const pxCheck = await pool
      .request()
      .input("MaDH", sql.Char(5), maDH)
      .query("SELECT COUNT(*) AS count FROM PHIEU_XUAT WHERE MaDH = @MaDH");

    if (hdCheck.recordset[0].count > 0 || pxCheck.recordset[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể chỉnh sửa đơn hàng đã lập hóa đơn hoặc phiếu xuất kho!",
      });
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 2. Lấy danh sách sản phẩm và trạng thái đơn hàng cũ để trả lại kho
      const oldItemsResult = await transaction
        .request()
        .input("MaDH", sql.Char(5), maDH)
        .query("SELECT MaSP, SoLuong FROM CT_DON_HANG WHERE MaDH = @MaDH");

      const oldOrderResult = await transaction
        .request()
        .input("MaDH", sql.Char(5), maDH)
        .query("SELECT TrangThaiDonHang FROM DON_HANG WHERE MaDH = @MaDH");

      if (oldOrderResult.recordset.length === 0) {
        throw new Error("Không tìm thấy đơn hàng cần cập nhật.");
      }

      const oldTrangThai = oldOrderResult.recordset[0].TrangThaiDonHang;

      // Trả lại kho theo thông tin cũ (cập nhật đồng thời tránh vi phạm CHECK constraint)
      for (let item of oldItemsResult.recordset) {
        await transaction
          .request()
          .input("MaSP", sql.Char(5), item.MaSP)
          .input("SoLuong", sql.Int, item.SoLuong)
          .input("TrangThai", sql.NVarChar(50), oldTrangThai)
          .query(`
            UPDATE SAN_PHAM 
            SET SoLuongKD = SoLuongKD + @SoLuong,
                SoLuongTon = SoLuongTon + (CASE WHEN @TrangThai = N'Hoàn thành' THEN @SoLuong ELSE 0 END)
            WHERE MaSP = @MaSP
          `);
      }

      // 3. Xóa chi tiết đơn hàng cũ
      await transaction
        .request()
        .input("MaDH", sql.Char(5), maDH)
        .query("DELETE FROM CT_DON_HANG WHERE MaDH = @MaDH");

      // 4. Cập nhật Đơn hàng
      await transaction
        .request()
        .input("MaDH", sql.Char(5), maDH)
        .input("TongTienDonHang", sql.Decimal(19, 3), tongTienDonHang)
        .input("TongGiamGiaSP", sql.Decimal(19, 3), tongGiamGiaSP)
        .input("TongTienSauGiam", sql.Decimal(19, 3), tongTienSauGiam)
        .input("TrangThaiDonHang", sql.NVarChar(50), trangThaiDonHang || "Hoàn thành")
        .input("MaNV", sql.Char(5), maNV)
        .input("MaKH", sql.Char(5), maKH)
        .query(`UPDATE DON_HANG 
                SET TongTienDonHang = @TongTienDonHang, 
                    TongGiamGiaSP = @TongGiamGiaSP, 
                    TongTienSauGiam = @TongTienSauGiam, 
                    TrangThaiDonHang = @TrangThaiDonHang, 
                    MaNV = @MaNV, 
                    MaKH = @MaKH 
                WHERE MaDH = @MaDH`);

      // 5. Thêm Chi tiết ĐH mới và Trừ Tồn Kho mới
      for (let item of cartItems) {
        // Kiểm tra tồn kho khả dụng mới
        const stockCheck = await transaction
          .request()
          .input("MaSP", sql.Char(5), item.maSP)
          .query("SELECT SoLuongKD FROM SAN_PHAM WHERE MaSP = @MaSP");
        
        if (stockCheck.recordset[0].SoLuongKD < item.qty) {
          throw new Error(`Kho không đủ sản phẩm ${item.tenSP || item.maSP}!`);
        }

        // Chèn CT_DON_HANG mới
        await transaction
          .request()
          .input("MaDH", sql.Char(5), maDH)
          .input("MaSP", sql.Char(5), item.maSP)
          .input("SoLuong", sql.Int, item.qty)
          .input("GiamGiaSP", sql.Decimal(5, 4), item.itemDiscount || 0)
          .query(`INSERT INTO CT_DON_HANG (MaDH, MaSP, SoLuong, GiamGiaSP) 
                  VALUES (@MaDH, @MaSP, @SoLuong, @GiamGiaSP)`);

        // Khấu trừ kho mới (cập nhật đồng thời tránh vi phạm CHECK constraint)
        await transaction
          .request()
          .input("MaSP", sql.Char(5), item.maSP)
          .input("SoLuong", sql.Int, item.qty)
          .input("TrangThai", sql.NVarChar(50), trangThaiDonHang)
          .query(`
            UPDATE SAN_PHAM 
            SET SoLuongKD = SoLuongKD - @SoLuong,
                SoLuongTon = SoLuongTon - (CASE WHEN @TrangThai = N'Hoàn thành' THEN @SoLuong ELSE 0 END)
            WHERE MaSP = @MaSP
          `);
      }

      await transaction.commit();
      res.json({ success: true, message: "Cập nhật đơn hàng thành công!" });
    } catch (err) {
      await transaction.rollback();
      res.status(500).json({ success: false, message: "Lỗi cập nhật: " + err.message });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================================
// 5. XUẤT KHO (Kích hoạt Trigger)
// ==========================================================
router.get("/xuat-kho", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM PHIEU_XUAT ORDER BY NgayXuat DESC");
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/xuat-kho", async (req, res) => {
  try {
    const { ngayXuat, trangThai, maNV, maDH } = req.body;
    const pool = await poolPromise;

    // LƯU Ý: Lệnh INSERT này sẽ tự động KÍCH HOẠT TRIGGER `trg_CapNhatKhoKhiXuat` trong SQL Server
    // Giúp trừ đi SoLuongTon thực tế trong kho sau khi đã xuất.
    await pool
      .request()
      .input("NgayXuat", sql.Date, ngayXuat)
      .input("TrangThaiGiaoHang", sql.NVarChar(50), trangThai)
      .input("MaNV", sql.Char(5), maNV)
      .input("MaDH", sql.Char(5), maDH)
      .query(`INSERT INTO PHIEU_XUAT (NgayXuat, TrangThaiGiaoHang, MaNV, MaDH) 
                    VALUES (@NgayXuat, @TrangThaiGiaoHang, @MaNV, @MaDH)`);

    res.json({ success: true, message: "Tạo phiếu xuất thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy chi tiết phiếu xuất
router.get("/xuat-kho/:id/chi-tiet", async (req, res) => {
  try {
    const pool = await poolPromise;
    const pxResult = await pool
      .request()
      .input("MaPX", sql.Char(5), req.params.id.trim())
      .query(`SELECT px.*, nv.HoTenNV AS NguoiLapPhieu, kh.TenKH, kh.SoDTKH, kh.DiaChiKH 
              FROM PHIEU_XUAT px 
              LEFT JOIN NHAN_VIEN nv ON px.MaNV = nv.MaNV 
              LEFT JOIN DON_HANG dh ON px.MaDH = dh.MaDH
              LEFT JOIN KHACH_HANG kh ON dh.MaKH = kh.MaKH
              WHERE px.MaPX = @MaPX`);
    if (pxResult.recordset.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiếu xuất" });

    const phieuXuat = pxResult.recordset[0];
    const itemsResult = await pool
      .request()
      .input("MaPX", sql.Char(5), req.params.id.trim()).query(`
        SELECT ct.MaSP, sp.TenSP, sp.DonViTinh, ct.SoLuong FROM PHIEU_XUAT px
        JOIN CT_DON_HANG ct ON px.MaDH = ct.MaDH JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP WHERE px.MaPX = @MaPX`);

    phieuXuat.items = itemsResult.recordset;
    res.json({ success: true, data: phieuXuat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Chuyển trạng thái tất cả
router.put("/xuat-kho/status/all", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("FromStatus", sql.NVarChar(50), req.body.fromStatus)
      .input("ToStatus", sql.NVarChar(50), req.body.toStatus)
      .query(
        "UPDATE PHIEU_XUAT SET TrangThaiGiaoHang = @ToStatus WHERE TrangThaiGiaoHang = @FromStatus",
      );
    res.json({ success: true, message: "Chuyển đổi trạng thái thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Chuyển trạng thái 1 phiếu xuất
router.put("/xuat-kho/:id/status", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaPX", sql.Char(5), req.params.id)
      .input("TrangThai", sql.NVarChar(50), req.body.nextStatus)
      .query(
        "UPDATE PHIEU_XUAT SET TrangThaiGiaoHang = @TrangThai WHERE MaPX = @MaPX",
      );
    res.json({ success: true, message: "Cập nhật trạng thái thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================================
// 6. HÓA ĐƠN & CÔNG NỢ (Kế toán)
// ==========================================================
router.get("/hoa-don", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT hd.MaHD, hd.NgayLap, hd.HinhThucThanhToan, hd.TongTienGiamGia, hd.TongTienThanhToan, hd.TrangThaiThanhToan, hd.MaDH, hd.MaNV, 
               nv.HoTenNV AS NguoiLapPhieu, cn.MaCN, cn.SoDuCN
        FROM HOA_DON hd 
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
      .input("MaHD", sql.Char(5), req.params.id.trim()).query(`
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

    const itemsResult = await pool.request().input("MaDH", sql.Char(5), maDH)
      .query(`
        SELECT sp.TenSP AS name, sp.DonViTinh AS unit, ct.SoLuong AS quantity, sp.GiaBan AS price, ct.GiamGiaSP,
               (ct.SoLuong * sp.GiaBan) * (1 - ISNULL(ct.GiamGiaSP, 0)) AS ThanhTien
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
        .input("MaKH", sql.Char(5), maKH)
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
      .input("MaDH", sql.Char(5), maDH)
      .input("MaNV", sql.Char(5), maNV)
      .input("HinhThucThanhToan", sql.NVarChar(50), hinhThucTT)
      .input("TrangThaiThanhToan", sql.NVarChar(50), trangThaiTT)
      .execute("sp_LapHoaDon");

    // Lấy mã hóa đơn vừa tạo để trả về cho client (phục vụ chức năng in ngay lập tức)
    const hdResult = await pool
      .request()
      .input("MaDH", sql.Char(5), maDH)
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
        .input("MaHD", sql.Char(5), newMaHD)
        .query("SELECT MaCN FROM CONG_NO WHERE MaHD = @MaHD");
      
      if (cnResult.recordset.length > 0) {
        const maCN = cnResult.recordset[0].MaCN;
        await pool
          .request()
          .input("SoTienThucThu", sql.Decimal(19, 3), cleanSoTienKhachTra)
          .input("HinhThucThanhToan", sql.NVarChar(50), hinhThucTT)
          .input("GhiChu", sql.NVarChar(255), "Khách trả trước một phần khi lập hóa đơn")
          .input("MaCN", sql.Char(5), maCN)
          .input("MaNV", sql.Char(5), maNV)
          .query(`
            INSERT INTO PHIEU_THU (NgayThu, SoTienThucThu, HinhThucThanhToan, GhiChu, MaCN, MaNV)
            VALUES (GETDATE(), @SoTienThucThu, @HinhThucThanhToan, @GhiChu, @MaCN, @MaNV)
          `);
      }
    }

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
    const result = await pool.request().input("MaKH", sql.VarChar, maKH_clean)
      .query(`
        SELECT cn.MaCN, hd.MaHD, dh.MaDH, cn.SoDuCN, cn.TongNo, cn.NgayGhiNhan, cn.SoTienDaTra, cn.TrangThaiCN 
        FROM CONG_NO cn
        JOIN HOA_DON hd ON cn.MaHD = hd.MaHD
        JOIN DON_HANG dh ON hd.MaDH = dh.MaDH
        WHERE dh.MaKH = @MaKH
        ORDER BY cn.NgayGhiNhan DESC
      `);
    res.json({ success: true, data: result.recordset });
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
               cn.MaHD, dh.MaDH, kh.TenKH, nv.HoTenNV AS NguoiLapPhieu 
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
      .input("MaPT", sql.Char(5), req.params.id.trim())
      .query(`SELECT pt.*, cn.MaHD, dh.MaDH, kh.TenKH, nv.HoTenNV AS NguoiLapPhieu 
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
            .input("MaCN", sql.Char(5), cn.MaCN)
            .input("MaNV", sql.Char(5), maNV)
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
          .input("MaCN", sql.Char(5), maCN)
          .input("MaNV", sql.Char(5), maNV)
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
      .input("MaPC", sql.Char(5), req.params.id.trim())
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
      .input("MaPN", sql.Char(5), maPN)
      .input("MaNV", sql.Char(5), maNV)
      .query(`INSERT INTO PHIEU_CHI (NgayChi, SoTienThucChi, HinhThucThanhToan, GhiChu, MaPN, MaNV)
              VALUES (GETDATE(), @SoTienThucChi, @HinhThucThanhToan, @GhiChu, @MaPN, @MaNV)`);

    res.json({ success: true, message: "Lập phiếu chi thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================================
// 7. KHÁCH HÀNG (CRUD)
// ==========================================================
// Lấy danh sách khách hàng đang có công nợ cần thu
router.get("/khach-hang/co-no", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT DISTINCT kh.MaKH, kh.TenKH, kh.SoDTKH
        FROM KHACH_HANG kh
        JOIN DON_HANG dh ON kh.MaKH = dh.MaKH
        JOIN HOA_DON hd ON dh.MaDH = hd.MaDH
        JOIN CONG_NO cn ON hd.MaHD = cn.MaHD
        WHERE cn.SoDuCN > 0
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/khach-hang", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT kh.*, lkh.TenLoaiKH, lkh.TyLeChietKhau 
        FROM KHACH_HANG kh 
        JOIN LOAI_KHACH_HANG lkh ON kh.MaLoaiKH = lkh.MaLoaiKH
        ORDER BY CAST(SUBSTRING(kh.MaKH, 3, 3) AS INT) DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/khach-hang", async (req, res) => {
  try {
    const { tenKH, soDT, email, gioiTinh, diaChi, maLoai } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("TenKH", sql.NVarChar(50), tenKH)
      .input("SoDTKH", sql.VarChar(50), soDT)
      .input("EmailKH", sql.VarChar(100), email)
      .input("GioiTinhKH", sql.NVarChar(10), gioiTinh)
      .input("DiaChiKH", sql.NVarChar(100), diaChi)
      .input("MaLoaiKH", sql.Char(3), maLoai || "L01")
      .query(`INSERT INTO KHACH_HANG (TenKH, SoDTKH, EmailKH, GioiTinhKH, DiaChiKH, MaLoaiKH) 
              VALUES (@TenKH, @SoDTKH, @EmailKH, @GioiTinhKH, @DiaChiKH, @MaLoaiKH)`);
    res.json({ success: true, message: "Thêm khách hàng thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/khach-hang/:id", async (req, res) => {
  try {
    const { tenKH, soDT, email, gioiTinh, diaChi, maLoai } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaKH", sql.Char(5), req.params.id)
      .input("TenKH", sql.NVarChar(50), tenKH)
      .input("SoDTKH", sql.VarChar(50), soDT)
      .input("EmailKH", sql.VarChar(100), email)
      .input("GioiTinhKH", sql.NVarChar(10), gioiTinh)
      .input("DiaChiKH", sql.NVarChar(100), diaChi)
      .input("MaLoaiKH", sql.Char(3), maLoai)
      .query(
        `UPDATE KHACH_HANG SET TenKH=@TenKH, SoDTKH=@SoDTKH, EmailKH=@EmailKH, GioiTinhKH=@GioiTinhKH, DiaChiKH=@DiaChiKH, MaLoaiKH=@MaLoaiKH WHERE MaKH=@MaKH`,
      );
    res.json({ success: true, message: "Cập nhật khách hàng thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/khach-hang/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaKH", sql.Char(5), req.params.id)
      .query(`DELETE FROM KHACH_HANG WHERE MaKH=@MaKH`);
    res.json({ success: true, message: "Xóa khách hàng thành công!" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Không thể xóa do khách hàng đã phát sinh giao dịch!",
    });
  }
});

// ==========================================================
// 8. NHÀ CUNG CẤP (CRUD)
// ==========================================================
router.get("/nha-cung-cap", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(
        "SELECT * FROM NHA_CUNG_CAP ORDER BY CAST(SUBSTRING(MaNCC, 4, 2) AS INT) DESC",
      );
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/nha-cung-cap", async (req, res) => {
  try {
    const { tenNCC, soDT, email, diaChi, ghiChu } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("TenNCC", sql.NVarChar(100), tenNCC)
      .input("SoDTNCC", sql.VarChar(50), soDT)
      .input("EmailNCC", sql.VarChar(100), email)
      .input("DiaChiNCC", sql.NVarChar(255), diaChi)
      .input("GhiChu", sql.NVarChar(255), ghiChu)
      .query(`INSERT INTO NHA_CUNG_CAP (TenNCC, SoDTNCC, EmailNCC, DiaChiNCC, GhiChu) 
              VALUES (@TenNCC, @SoDTNCC, @EmailNCC, @DiaChiNCC, @GhiChu)`);
    res.json({ success: true, message: "Thêm nhà cung cấp thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/nha-cung-cap/:id", async (req, res) => {
  try {
    const { tenNCC, soDT, email, diaChi, ghiChu } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaNCC", sql.Char(5), req.params.id)
      .input("TenNCC", sql.NVarChar(100), tenNCC)
      .input("SoDTNCC", sql.VarChar(50), soDT)
      .input("EmailNCC", sql.VarChar(100), email)
      .input("DiaChiNCC", sql.NVarChar(255), diaChi)
      .input("GhiChu", sql.NVarChar(255), ghiChu)
      .query(
        `UPDATE NHA_CUNG_CAP SET TenNCC=@TenNCC, SoDTNCC=@SoDTNCC, EmailNCC=@EmailNCC, DiaChiNCC=@DiaChiNCC, GhiChu=@GhiChu WHERE MaNCC=@MaNCC`,
      );
    res.json({ success: true, message: "Cập nhật nhà cung cấp thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/nha-cung-cap/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaNCC", sql.Char(5), req.params.id)
      .query(`DELETE FROM NHA_CUNG_CAP WHERE MaNCC=@MaNCC`);
    res.json({ success: true, message: "Xóa nhà cung cấp thành công!" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Không thể xóa do Nhà cung cấp đã phát sinh phiếu nhập!",
    });
  }
});

// ==========================================================
// 9. NHÂN VIÊN (CRUD)
// ==========================================================
router.get("/nhan-vien", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT nv.*, tk.TenDangNhap 
        FROM NHAN_VIEN nv 
        LEFT JOIN TAI_KHOAN tk ON nv.MaNV = tk.MaNV 
        ORDER BY CAST(SUBSTRING(nv.MaNV, 3, 3) AS INT) DESC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/nhan-vien", async (req, res) => {
  try {
    const {
      hoTen,
      cccd,
      soDT,
      chucVu,
      tenDangNhap,
      matKhau,
      gioiTinh,
      emailNV,
      diaChiNV,
    } = req.body;
    const pool = await poolPromise;

    // 1. Thêm thông tin Nhân viên mới
    await pool
      .request()
      .input("HoTenNV", sql.NVarChar(50), hoTen)
      .input("CCCD", sql.VarChar(20), cccd)
      .input("GioiTinh", sql.NVarChar(5), gioiTinh)
      .input("SoDTNV", sql.VarChar(50), soDT)
      .input("EmailNV", sql.VarChar(100), emailNV)
      .input("DiaChiNV", sql.NVarChar(100), diaChiNV)
      .input("ChucVu", sql.NVarChar(30), chucVu)
      .query(`INSERT INTO NHAN_VIEN (HoTenNV, CCCD, GioiTinh, SoDTNV, EmailNV, DiaChiNV, ChucVu) 
              VALUES (@HoTenNV, @CCCD, @GioiTinh, @SoDTNV, @EmailNV, @DiaChiNV, @ChucVu)`);

    // 2. Nếu quản lý có cấp tài khoản, tạo ngay bản ghi liên kết vào TAI_KHOAN
    if (tenDangNhap && matKhau) {
      // Lấy Mã NV vừa được Trigger tự động sinh ra (Mã mới nhất)
      const nvResult = await pool
        .request()
        .query(
          "SELECT TOP 1 MaNV FROM NHAN_VIEN ORDER BY CAST(SUBSTRING(MaNV, 3, 3) AS INT) DESC",
        );
      const newMaNV = nvResult.recordset[0].MaNV;

      await pool
        .request()
        .input("TenDangNhap", sql.VarChar(50), tenDangNhap)
        .input("MatKhau", sql.VarChar(255), matKhau)
        .input("MaNV", sql.Char(5), newMaNV)
        .query(`INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, MaNV) 
                VALUES (@TenDangNhap, @MatKhau, @MaNV)`);
    }

    res.json({ success: true, message: "Thêm nhân viên thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/nhan-vien/:id", async (req, res) => {
  try {
    const {
      hoTen,
      cccd,
      soDT,
      chucVu,
      gioiTinh,
      emailNV,
      diaChiNV,
      tenDangNhap,
      matKhau,
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaNV", sql.Char(5), req.params.id)
      .input("HoTenNV", sql.NVarChar(50), hoTen)
      .input("CCCD", sql.VarChar(20), cccd)
      .input("GioiTinh", sql.NVarChar(5), gioiTinh)
      .input("SoDTNV", sql.VarChar(50), soDT)
      .input("EmailNV", sql.VarChar(100), emailNV)
      .input("DiaChiNV", sql.NVarChar(100), diaChiNV)
      .input("ChucVu", sql.NVarChar(30), chucVu)
      .query(
        `UPDATE NHAN_VIEN SET HoTenNV=@HoTenNV, CCCD=@CCCD, GioiTinh=@GioiTinh, SoDTNV=@SoDTNV, EmailNV=@EmailNV, DiaChiNV=@DiaChiNV, ChucVu=@ChucVu WHERE MaNV=@MaNV`,
      );
    res.json({ success: true, message: "Cập nhật nhân viên thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/nhan-vien/lock/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaNV", sql.Char(5), req.params.id)
      .query(
        `UPDATE NHAN_VIEN SET TrangThai = CASE WHEN TrangThai = N'Đang làm việc' THEN N'Đã nghỉ việc' ELSE N'Đang làm việc' END WHERE MaNV=@MaNV`,
      );
    res.json({
      success: true,
      message: "Cập nhật trạng thái nhân viên thành công!",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy chi tiết phiếu nhập
router.get("/nhap-kho/:id/chi-tiet", async (req, res) => {
  try {
    const pool = await poolPromise;
    const pnResult = await pool
      .request()
      .input("MaPN", sql.Char(5), req.params.id.trim())
      .query(`SELECT pn.*, ncc.TenNCC, nv.HoTenNV AS NguoiLapPhieu
              FROM PHIEU_NHAP pn 
              LEFT JOIN NHA_CUNG_CAP ncc ON pn.MaNCC = ncc.MaNCC 
              LEFT JOIN NHAN_VIEN nv ON pn.MaNV = nv.MaNV 
              WHERE pn.MaPN = @MaPN`);
    if (pnResult.recordset.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiếu nhập" });

    const phieuNhap = pnResult.recordset[0];
    const itemsResult = await pool
      .request()
      .input("MaPN", sql.Char(5), req.params.id.trim()).query(`
        SELECT ct.MaSP, sp.TenSP, ct.SoLuong, ct.GiaNhap, (ct.SoLuong * ct.GiaNhap) AS ThanhTien 
        FROM CT_PHIEU_NHAP ct JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP WHERE ct.MaPN = @MaPN`);

    phieuNhap.items = itemsResult.recordset;
    res.json({ success: true, data: phieuNhap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================================
// 10. DASHBOARD CHARTS (DỮ LIỆU BIỂU ĐỒ)
// ==========================================================
router.get("/dashboard/chart-data", async (req, res) => {
  try {
    const { year } = req.query;
    let query = `SELECT TOP 12 Thang, Nam, DoanhThuBanHang, ChiPhiNhapHang, LoiNhuanThuan FROM v_DoanhThu_ChiPhi WHERE 1=1`;
    if (year && year !== "all") query += ` AND Nam = ${parseInt(year)}`;
    query += ` ORDER BY Nam DESC, Thang DESC`;

    const pool = await poolPromise;
    const result = await pool.request().query(query);
    const data = result.recordset.sort((a, b) => {
      if (a.Nam === b.Nam) return a.Thang - b.Thang;
      return a.Nam - b.Nam;
    });
    res.json({ success: true, data: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// BỔ SUNG: Lấy danh sách các năm có phát sinh giao dịch
router.get("/dashboard/years", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT DISTINCT Nam FROM v_DoanhThu_ChiPhi ORDER BY Nam DESC
    `);
    const years = result.recordset.map((r) => r.Nam);
    res.json({ success: true, data: years });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// BỔ SUNG: Lấy dữ liệu top sản phẩm bán chạy
router.get("/dashboard/top-products", async (req, res) => {
  try {
    const { year, month, limit } = req.query;
    const topLimit = parseInt(limit) || 10;

    let query = `
      SELECT TOP ${topLimit}
        sp.MaSP,
        sp.TenSP,
        sp.DonViTinh,
        SUM(ct.SoLuong) AS SoLuongDaBan
      FROM CT_DON_HANG ct
      JOIN DON_HANG dh ON ct.MaDH = dh.MaDH
      JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP
      WHERE dh.TrangThaiDonHang = N'Hoàn thành'
    `;

    if (year && year !== "all")
      query += ` AND YEAR(dh.NgayDat) = ${parseInt(year)}`;
    if (month && month !== "all")
      query += ` AND MONTH(dh.NgayDat) = ${parseInt(month)}`;

    query += ` GROUP BY sp.MaSP, sp.TenSP, sp.DonViTinh ORDER BY SoLuongDaBan DESC`;

    const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// BỔ SUNG: Lấy dữ liệu tổng quan cho các thẻ Dashboard
router.get("/dashboard/stats", async (req, res) => {
  try {
    const { year } = req.query;
    const pool = await poolPromise;

    let revQuery =
      "SELECT ISNULL(SUM(TongTienThanhToan), 0) AS Total FROM HOA_DON WHERE 1=1";
    let expQuery =
      "SELECT ISNULL(SUM(TongTienNhap), 0) AS Total FROM PHIEU_NHAP WHERE 1=1";

    if (year && year !== "all") {
      revQuery += ` AND YEAR(NgayLap) = ${parseInt(year)}`;
      expQuery += ` AND YEAR(NgayNhap) = ${parseInt(year)}`;
    }

    const rev = await pool.request().query(revQuery);
    const exp = await pool.request().query(expQuery);
    const debt = await pool
      .request()
      .query(
        "SELECT ISNULL(SUM(SoDuCN), 0) AS Total FROM CONG_NO WHERE TrangThaiCN = N'Còn nợ'",
      );
    const warning = await pool
      .request()
      .query("SELECT COUNT(*) AS Total FROM SAN_PHAM WHERE SoLuongTon <= 5");

    res.json({
      success: true,
      data: {
        doanhThu: rev.recordset[0].Total,
        chiPhi: exp.recordset[0].Total,
        congNo: debt.recordset[0].Total,
        canhBao: warning.recordset[0].Total,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================================
// 11. LOẠI KHÁCH HÀNG (CRUD)
// ==========================================================
router.get("/loai-kh", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM LOAI_KHACH_HANG");
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/loai-kh", async (req, res) => {
  try {
    const { maLoaiKH, tenLoaiKH, tyLeChietKhau } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaLoaiKH", sql.Char(3), maLoaiKH)
      .input("TenLoaiKH", sql.NVarChar(50), tenLoaiKH)
      .input("TyLeChietKhau", sql.Decimal(5, 2), tyLeChietKhau)
      .query(
        `INSERT INTO LOAI_KHACH_HANG (MaLoaiKH, TenLoaiKH, TyLeChietKhau) VALUES (@MaLoaiKH, @TenLoaiKH, @TyLeChietKhau)`,
      );
    res.json({ success: true, message: "Thêm loại khách hàng thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/loai-kh/:id", async (req, res) => {
  try {
    const { tenLoaiKH, tyLeChietKhau } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaLoaiKH", sql.Char(3), req.params.id)
      .input("TenLoaiKH", sql.NVarChar(50), tenLoaiKH)
      .input("TyLeChietKhau", sql.Decimal(5, 2), tyLeChietKhau)
      .query(
        `UPDATE LOAI_KHACH_HANG SET TenLoaiKH=@TenLoaiKH, TyLeChietKhau=@TyLeChietKhau WHERE MaLoaiKH=@MaLoaiKH`,
      );
    res.json({
      success: true,
      message: "Cập nhật loại khách hàng thành công!",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/loai-kh/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaLoaiKH", sql.Char(3), req.params.id)
      .query(`DELETE FROM LOAI_KHACH_HANG WHERE MaLoaiKH=@MaLoaiKH`);
    res.json({ success: true, message: "Xóa loại khách hàng thành công!" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Không thể xóa do loại khách hàng này đã phát sinh giao dịch!",
    });
  }
});

// ==========================================================
// 12. LOẠI SẢN PHẨM (CRUD)
// ==========================================================
router.get("/loai-sp", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM LOAI_SAN_PHAM");
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/loai-sp", async (req, res) => {
  try {
    const { maLoaiSP, tenLoaiSP } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaLoaiSP", sql.Char(3), maLoaiSP)
      .input("TenLoaiSP", sql.NVarChar(50), tenLoaiSP)
      .query(
        `INSERT INTO LOAI_SAN_PHAM (MaLoaiSP, TenLoaiSP) VALUES (@MaLoaiSP, @TenLoaiSP)`,
      );
    res.json({ success: true, message: "Thêm loại sản phẩm thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/loai-sp/:id", async (req, res) => {
  try {
    const { tenLoaiSP } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaLoaiSP", sql.Char(3), req.params.id)
      .input("TenLoaiSP", sql.NVarChar(50), tenLoaiSP)
      .query(
        `UPDATE LOAI_SAN_PHAM SET TenLoaiSP=@TenLoaiSP WHERE MaLoaiSP=@MaLoaiSP`,
      );
    res.json({ success: true, message: "Cập nhật loại sản phẩm thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/loai-sp/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaLoaiSP", sql.Char(3), req.params.id)
      .query(`DELETE FROM LOAI_SAN_PHAM WHERE MaLoaiSP=@MaLoaiSP`);
    res.json({ success: true, message: "Xóa loại sản phẩm thành công!" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Không thể xóa do loại sản phẩm này đã được sử dụng!",
    });
  }
});

// ==========================================================
// 8. QUẢN TRỊ HỆ THỐNG - SAO LƯU & KHÔI PHỤC DỮ LIỆU
// ==========================================================

// Lấy thông số thống kê cơ sở dữ liệu
router.get("/backup/stats", async (req, res) => {
  try {
    const pool = await poolPromise;
    const dbNameRes = await pool.request().query("SELECT DB_NAME() AS dbName");
    const dbName = dbNameRes.recordset[0]?.dbName || "BH_WEB2";

    const productsRes = await pool.request().query("SELECT COUNT(*) AS count FROM SAN_PHAM");
    const customersRes = await pool.request().query("SELECT COUNT(*) AS count FROM KHACH_HANG");
    const ordersRes = await pool.request().query("SELECT COUNT(*) AS count FROM DON_HANG");
    const employeesRes = await pool.request().query("SELECT COUNT(*) AS count FROM NHAN_VIEN");

    res.json({
      success: true,
      data: {
        dbName,
        products: productsRes.recordset[0]?.count || 0,
        customers: customersRes.recordset[0]?.count || 0,
        orders: ordersRes.recordset[0]?.count || 0,
        employees: employeesRes.recordset[0]?.count || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách các bản sao lưu hiện có
router.get("/backup/list", async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const dirPath = path.join(__dirname, "public", "backups");

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const files = fs.readdirSync(dirPath);
    const data = files
      .filter(f => f.endsWith(".json"))
      .map(f => {
        const filePath = path.join(dirPath, f);
        const stat = fs.statSync(filePath);
        return {
          name: f,
          size: stat.size,
          createdAt: stat.birthtime || stat.mtime
        };
      });

    // Sắp xếp bản sao lưu mới nhất lên đầu
    data.sort((a, b) => b.createdAt - a.createdAt);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tạo một bản sao lưu mới dưới dạng JSON
router.post("/backup/create", async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const pool = await poolPromise;

    const tables = [
      'LOAI_SAN_PHAM',
      'LOAI_KHACH_HANG',
      'NHA_CUNG_CAP',
      'SAN_PHAM',
      'KHACH_HANG',
      'NHAN_VIEN',
      'TAI_KHOAN',
      'PHIEU_NHAP',
      'CT_PHIEU_NHAP',
      'DON_HANG',
      'CT_DON_HANG',
      'HOA_DON',
      'PHIEU_XUAT',
      'CONG_NO',
      'PHIEU_THU',
      'PHIEU_CHI'
    ];

    const backupData = {
      backup_time: new Date().toISOString(),
      database: "BH_WEB2",
      tables: {}
    };

    for (let tbl of tables) {
      const result = await pool.request().query(`SELECT * FROM ${tbl}`);
      backupData.tables[tbl] = result.recordset;
    }

    const dirPath = path.join(__dirname, "public", "backups");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Định dạng tên file: backup_YYYYMMDD_HHMMSS.json
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const filename = `backup_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.json`;

    fs.writeFileSync(path.join(dirPath, filename), JSON.stringify(backupData, null, 2), "utf-8");

    res.json({ success: true, filename });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Nhận file sao lưu được upload lên từ client
router.post("/backup/upload", async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const { filename, content } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ success: false, message: "Thiếu tên file hoặc nội dung sao lưu!" });
    }

    const dirPath = path.join(__dirname, "public", "backups");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const cleanName = path.basename(filename);
    fs.writeFileSync(path.join(dirPath, cleanName), content, "utf-8");

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Xóa file sao lưu khỏi bộ nhớ máy chủ
router.delete("/backup/:filename", async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const filename = req.params.filename;

    const cleanName = path.basename(filename);
    const filePath = path.join(__dirname, "public", "backups", cleanName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Không tìm thấy bản sao lưu cần xóa!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Khôi phục dữ liệu từ bản sao lưu JSON được chọn
router.post("/backup/restore", async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ success: false, message: "Thiếu tên file để khôi phục!" });
    }

    const cleanName = path.basename(filename);
    const filePath = path.join(__dirname, "public", "backups", cleanName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Không tìm thấy file sao lưu!" });
    }

    const fileData = fs.readFileSync(filePath, "utf-8");
    const backupData = JSON.parse(fileData);

    if (!backupData.tables) {
      return res.status(400).json({ success: false, message: "Cấu trúc file sao lưu không hợp lệ!" });
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const tablesInReverse = [
      'PHIEU_CHI',
      'PHIEU_THU',
      'CONG_NO',
      'PHIEU_XUAT',
      'HOA_DON',
      'CT_DON_HANG',
      'DON_HANG',
      'TAI_KHOAN',
      'NHAN_VIEN',
      'KHACH_HANG',
      'LOAI_KHACH_HANG',
      'CT_PHIEU_NHAP',
      'PHIEU_NHAP',
      'NHA_CUNG_CAP',
      'SAN_PHAM',
      'LOAI_SAN_PHAM'
    ];

    const tablesInDirect = [...tablesInReverse].reverse();
    const logs = [];

    try {
      logs.push("[DB] Vô hiệu hóa tất cả trigger hệ thống...");
      for (let tbl of tablesInDirect) {
        await transaction.request().query(`ALTER TABLE ${tbl} DISABLE TRIGGER ALL`);
      }

      logs.push("[DB] Xóa dữ liệu các bảng hiện tại...");
      for (let tbl of tablesInReverse) {
        await transaction.request().query(`DELETE FROM ${tbl}`);
      }

      logs.push("[DB] Phục hồi dữ liệu từ bản sao lưu...");
      const dateFields = ['NgayDat', 'NgayLap', 'NgayNhap', 'NgayChi', 'NgayThu', 'NgayGhiNhan', 'NgayXuat', 'HanThanhToan'];

      for (let tbl of tablesInDirect) {
        const rows = backupData.tables[tbl];
        if (rows && rows.length > 0) {
          logs.push(`[DB] Khôi phục bảng: ${tbl} (${rows.length} dòng)...`);
          for (let row of rows) {
            const request = transaction.request();
            const cols = [];
            const vals = [];
            for (let key in row) {
              cols.push(key);
              if (row[key] === null) {
                vals.push('NULL');
              } else {
                vals.push(`@${key}`);
                if (dateFields.includes(key) && row[key]) {
                  request.input(key, sql.DateTime, new Date(row[key]));
                } else {
                  request.input(key, row[key]);
                }
              }
            }
            const queryText = `INSERT INTO ${tbl} (${cols.join(', ')}) VALUES (${vals.join(', ')})`;
            await request.query(queryText);
          }
        }
      }

      logs.push("[DB] Kích hoạt lại tất cả trigger hệ thống...");
      for (let tbl of tablesInDirect) {
        await transaction.request().query(`ALTER TABLE ${tbl} ENABLE TRIGGER ALL`);
      }

      await transaction.commit();
      res.json({ success: true, logs });
    } catch (err) {
      try {
        await transaction.rollback();
      } catch (rollErr) {
        console.error("Rollback error:", rollErr);
      }
      try {
        for (let tbl of tablesInDirect) {
          await pool.request().query(`ALTER TABLE ${tbl} ENABLE TRIGGER ALL`);
        }
      } catch (e) { }
      throw err;
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

