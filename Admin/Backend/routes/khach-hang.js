const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../../../Shared/Backend/config/database");

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
        ORDER BY CAST(SUBSTRING(kh.MaKH, 3, 6) AS INT) DESC
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

    // Check duplicate phone number
    const checkPhone = await pool
      .request()
      .input("SoDTKH", sql.VarChar(50), soDT)
      .query("SELECT * FROM KHACH_HANG WHERE SoDTKH = @SoDTKH");

    if (checkPhone.recordset.length > 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Số điện thoại này đã tồn tại trong hệ thống!",
        });
    }

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
  let transaction;
  try {
    const { tenKH, soDT, email, gioiTinh, diaChi, maLoai } = req.body;
    const pool = await poolPromise;
    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    const duplicate = await transaction.request().input('Phone',sql.VarChar(50),String(soDT||'').trim()).input('ID',sql.Char(8),req.params.id)
      .query('SELECT MaKH FROM KHACH_HANG WITH(UPDLOCK,HOLDLOCK) WHERE SoDTKH=@Phone AND MaKH<>@ID');
    if(duplicate.recordset.length){await transaction.rollback();transaction=null;return res.status(409).json({success:false,message:'Số điện thoại này đã tồn tại trong hệ thống!'});}
    const updated = await transaction
      .request()
      .input("MaKH", sql.Char(8), req.params.id)
      .input("TenKH", sql.NVarChar(50), tenKH)
      .input("SoDTKH", sql.VarChar(50), soDT)
      .input("EmailKH", sql.VarChar(100), email)
      .input("GioiTinhKH", sql.NVarChar(10), gioiTinh)
      .input("DiaChiKH", sql.NVarChar(100), diaChi)
      .input("MaLoaiKH", sql.Char(3), maLoai)
      .query(
        `UPDATE KHACH_HANG SET TenKH=@TenKH, SoDTKH=@SoDTKH, EmailKH=@EmailKH, GioiTinhKH=@GioiTinhKH, DiaChiKH=@DiaChiKH, MaLoaiKH=@MaLoaiKH OUTPUT inserted.MaKH WHERE MaKH=@MaKH`,
      );
    if(!updated.recordset.length){await transaction.rollback();transaction=null;return res.status(404).json({success:false,message:'Không tìm thấy khách hàng.'});}
    await transaction.commit();transaction=null;
    res.json({ success: true, message: "Cập nhật khách hàng thành công!" });
  } catch (err) {
    if(transaction)await transaction.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/khach-hang/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaKH", sql.Char(8), req.params.id)
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
        "SELECT * FROM NHA_CUNG_CAP ORDER BY CAST(SUBSTRING(MaNCC, 4, 6) AS INT) DESC",
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
      .input("MaNCC", sql.Char(9), req.params.id)
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
      .input("MaNCC", sql.Char(9), req.params.id)
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


module.exports = router;
