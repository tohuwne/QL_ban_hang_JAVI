const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../../../Shared/Backend/config/database");
const {canTransition}=require('../../../Shared/Backend/services/shipping-status');

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
      .input("MaNV", sql.Char(8), maNV)
      .input("MaNCC", sql.Char(9), maNCC)
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
  let tx;
  try {
    const { ngayXuat, trangThai, maNV, maDH } = req.body;
    const pool = await poolPromise;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(ngayXuat))||!Number.isFinite(Date.parse(ngayXuat))||new Date(ngayXuat).toISOString().slice(0,10)!==ngayXuat||trangThai!=='Chờ lấy hàng')return res.status(400).json({success:false,message:'Ngày xuất không hợp lệ hoặc trạng thái phải là Chờ lấy hàng.'});
    tx=new sql.Transaction(pool);await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    const order=await tx.request().input('ID',sql.Char(8),maDH).query('SELECT TrangThaiDonHang FROM DON_HANG WITH(UPDLOCK,HOLDLOCK) WHERE MaDH=@ID');
    if(!order.recordset.length){await tx.rollback();tx=null;return res.status(404).json({success:false,message:'Không tìm thấy đơn hàng.'});}
    if(order.recordset[0].TrangThaiDonHang!=='Chờ giao')throw Object.assign(Error('Chỉ tạo phiếu xuất cho đơn Chờ giao.'),{status:409});
    const existing=await tx.request().input('ID',sql.Char(8),maDH).query('SELECT MaPX FROM PHIEU_XUAT WITH(UPDLOCK,HOLDLOCK) WHERE MaDH=@ID');
    if(existing.recordset.length)throw Object.assign(Error('Đơn hàng đã có phiếu xuất. Vui lòng xử lý trên phiếu hiện có.'),{status:409});
    await tx
      .request()
      .input("NgayXuat", sql.VarChar(10), ngayXuat)
      .input("TrangThaiGiaoHang", sql.NVarChar(50), trangThai)
      .input("MaNV", sql.Char(8), maNV)
      .input("MaDH", sql.Char(8), maDH)
      .query(`INSERT INTO PHIEU_XUAT (NgayXuat, TrangThaiGiaoHang, MaNV, MaDH) 
                    VALUES (CONVERT(date,@NgayXuat,23), @TrangThaiGiaoHang, @MaNV, @MaDH)`);
    await tx.commit();tx=null;
    res.json({ success: true, message: "Tạo phiếu xuất thành công!" });
  } catch (err) {
    if(tx)await tx.rollback();
    res.status(err.status||500).json({ success: false, message: err.message });
  }
});

// Lấy chi tiết phiếu xuất
router.get("/xuat-kho/:id/chi-tiet", async (req, res) => {
  try {
    const pool = await poolPromise;
    const pxResult = await pool
      .request()
      .input("MaPX", sql.Char(8), req.params.id.trim())
      .query(`SELECT px.*, nv.HoTenNV AS NguoiLapPhieu, COALESCE(w.NguoiNhan,kh.TenKH) AS TenKH, COALESCE(w.SoDT,kh.SoDTKH) AS SoDTKH, COALESCE(w.DiaChi,kh.DiaChiKH) AS DiaChiKH,
              w.NguoiNhan,w.SoDT AS SoDTNhan,w.DiaChi AS DiaChiGiaoHang,w.Email AS EmailNhan,w.GhiChu AS GhiChuGiaoHang
              FROM PHIEU_XUAT px 
              LEFT JOIN NHAN_VIEN nv ON px.MaNV = nv.MaNV 
              LEFT JOIN DON_HANG dh ON px.MaDH = dh.MaDH
              LEFT JOIN WEB_DON_HANG w ON w.MaDH=dh.MaDH
              LEFT JOIN KHACH_HANG kh ON dh.MaKH = kh.MaKH
              WHERE px.MaPX = @MaPX`);
    if (pxResult.recordset.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiếu xuất" });

    const phieuXuat = pxResult.recordset[0];
    const itemsResult = await pool
      .request()
      .input("MaPX", sql.Char(8), req.params.id.trim()).query(`
        SELECT ct.MaCTDH,ct.TrongLuongGram,ct.LoaiXay,ct.MaSP,CONCAT(sp.TenSP,CASE WHEN ct.TrongLuongGram IS NOT NULL THEN CONCAT(N' / ',ct.TrongLuongGram,N'g / ',ct.LoaiXay) ELSE N'' END) AS TenSP, sp.DonViTinh, ct.SoLuong FROM PHIEU_XUAT px
        JOIN CT_DON_HANG ct ON px.MaDH = ct.MaDH JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP WHERE px.MaPX = @MaPX`);

    phieuXuat.items = itemsResult.recordset;
    res.json({ success: true, data: phieuXuat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Chuyển trạng thái tất cả
router.put("/xuat-kho/status/all", async (req, res) => {
  let tx;
  try {
    const {fromStatus,toStatus}=req.body;
    if(!canTransition(fromStatus,toStatus)||fromStatus===toStatus)return res.status(409).json({success:false,message:'Không thể chuyển trạng thái này.'});
    const pool = await poolPromise;
    tx=new sql.Transaction(pool);await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    await tx
      .request()
      .input("FromStatus", sql.NVarChar(50), req.body.fromStatus)
      .input("ToStatus", sql.NVarChar(50), req.body.toStatus)
      .query(
        "UPDATE PHIEU_XUAT SET TrangThaiGiaoHang = @ToStatus WHERE TrangThaiGiaoHang = @FromStatus",
      );
    await tx.commit();tx=null;
    res.json({ success: true, message: "Chuyển đổi trạng thái thành công!" });
  } catch (err) {
    if(tx)await tx.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
});

// Chuyển trạng thái 1 phiếu xuất
router.put("/xuat-kho/:id/status", async (req, res) => {
  let tx;
  try {
    const pool = await poolPromise;
    tx=new sql.Transaction(pool);await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    const r=await tx.request().input('ID',sql.Char(8),req.params.id).query('SELECT TrangThaiGiaoHang FROM PHIEU_XUAT WITH(UPDLOCK,HOLDLOCK) WHERE MaPX=@ID');
    if(!r.recordset.length){await tx.rollback();tx=null;return res.status(404).json({success:false,message:'Không tìm thấy phiếu xuất.'});}
    const before=r.recordset[0].TrangThaiGiaoHang;
    if(!canTransition(before,req.body.nextStatus))throw Object.assign(Error('Không thể chuyển trạng thái này. Phiếu có thể đã được xử lý, vui lòng tải lại.'),{status:409});
    if(before!==req.body.nextStatus)await tx
      .request()
      .input("MaPX", sql.Char(8), req.params.id)
      .input("TrangThai", sql.NVarChar(50), req.body.nextStatus)
      .query(
        "UPDATE PHIEU_XUAT SET TrangThaiGiaoHang = @TrangThai WHERE MaPX = @MaPX",
      );
    await tx.commit();tx=null;
    res.json({ success: true, message: "Cập nhật trạng thái thành công!" });
  } catch (err) {
    if(tx)await tx.rollback();
    res.status(err.status||500).json({ success: false, message: err.message });
  }
});


router.get("/nhap-kho/:id/chi-tiet", async (req, res) => {
  try {
    const pool = await poolPromise;
    const pnResult = await pool
      .request()
      .input("MaPN", sql.Char(8), req.params.id.trim())
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
      .input("MaPN", sql.Char(8), req.params.id.trim()).query(`
        SELECT ct.MaSP, sp.TenSP, sp.DonViTinh, ct.SoLuong, ct.GiaNhap, (ct.SoLuong * ct.GiaNhap) AS ThanhTien 
        FROM CT_PHIEU_NHAP ct JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP WHERE ct.MaPN = @MaPN`);

    phieuNhap.items = itemsResult.recordset;
    res.json({ success: true, data: phieuNhap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
