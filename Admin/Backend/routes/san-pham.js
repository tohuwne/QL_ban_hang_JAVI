const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../../../Shared/Backend/config/database");

// ==========================================================
// 2. SẢN PHẨM (CRUD)
// ==========================================================
router.get("/san-pham", async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT 
        sp.MaSP, sp.TenSP, sp.DonViTinh, sp.TrongLuong, sp.CongSuat, sp.GiaBan, 
        sp.SoLuongTon, sp.SoLuongKD, sp.TonToiThieu, sp.GhiChu, sp.MaLoaiSP, 
        lsp.TenLoaiSP,lsp.ApDungTuyChon
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
    const { maSP, tenSP, dvt, trongLuong, congSuat, giaBan, ghiChu, loaiSP, tonToiThieu = 5 } =
      req.body;
    const threshold = Number(tonToiThieu);
    if (!Number.isFinite(threshold) || threshold < 0) return res.status(400).json({success:false, message:'Tồn tối thiểu phải là số không âm.'});
    const pool = await poolPromise;
    const type=(await pool.request().input("Type",sql.Char(3),loaiSP).query("SELECT ApDungTuyChon FROM LOAI_SAN_PHAM WHERE MaLoaiSP=@Type")).recordset[0];
    if(!type)return res.status(400).json({success:false,message:"Loại sản phẩm không tồn tại."});
    await pool
      .request()
      .input("MaSP", sql.Char(5), maSP)
      .input("TenSP", sql.NVarChar(50), tenSP)
      .input("DonViTinh", sql.NVarChar(50), type.ApDungTuyChon?"Gói":dvt)
      .input("TrongLuong", sql.Decimal(10, 2), type.ApDungTuyChon?0.10:(trongLuong ? trongLuong : null))
      .input("CongSuat", sql.NVarChar(100), congSuat || null)
      .input("GiaBan", sql.Decimal(19, 3), giaBan)
      .input("TonToiThieu", sql.Decimal(10, 2), threshold)
      .input("GhiChu", sql.NVarChar(255), ghiChu ? ghiChu : "")
      .input("MaLoaiSP", sql.Char(3), loaiSP).query(`
        INSERT INTO SAN_PHAM (MaSP, TenSP, DonViTinh, TrongLuong, CongSuat, GiaBan, GhiChu, MaLoaiSP, TonToiThieu) 
        VALUES (@MaSP, @TenSP, @DonViTinh, @TrongLuong, @CongSuat, @GiaBan, @GhiChu, @MaLoaiSP, @TonToiThieu)
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
    const { tenSP, dvt, trongLuong, congSuat, giaBan, ghiChu, loaiSP, tonToiThieu = 5 } =
      req.body;
    const threshold = Number(tonToiThieu);
    if (!Number.isFinite(threshold) || threshold < 0) return res.status(400).json({success:false, message:'Tồn tối thiểu phải là số không âm.'});
    const pool = await poolPromise;
    const type=(await pool.request().input("Type",sql.Char(3),loaiSP).query("SELECT ApDungTuyChon FROM LOAI_SAN_PHAM WHERE MaLoaiSP=@Type")).recordset[0];
    if(!type)return res.status(400).json({success:false,message:"Loại sản phẩm không tồn tại."});
    await pool
      .request()
      .input("MaSP", sql.Char(5), req.params.id)
      .input("TenSP", sql.NVarChar(50), tenSP)
      .input("DonViTinh", sql.NVarChar(50), type.ApDungTuyChon?"Gói":dvt)
      .input("TrongLuong", sql.Decimal(10, 2), type.ApDungTuyChon?0.10:(trongLuong ? trongLuong : null))
      .input("CongSuat", sql.NVarChar(100), congSuat || null)
      .input("GiaBan", sql.Decimal(19, 3), giaBan)
      .input("TonToiThieu", sql.Decimal(10, 2), threshold)
      .input("GhiChu", sql.NVarChar(255), ghiChu ? ghiChu : "")
      .input("MaLoaiSP", sql.Char(3), loaiSP).query(`
        UPDATE SAN_PHAM 
        SET TenSP=@TenSP, DonViTinh=@DonViTinh, TrongLuong=@TrongLuong, CongSuat=@CongSuat,
            GiaBan=@GiaBan, GhiChu=@GhiChu, MaLoaiSP=@MaLoaiSP, TonToiThieu=@TonToiThieu 
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
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      await transaction.request().input("MaSP", sql.Char(5), req.params.id)
        .query("DELETE FROM WEB_SAN_PHAM WHERE MaSP=@MaSP; DELETE FROM SAN_PHAM WHERE MaSP=@MaSP;");
      await transaction.commit();
    } catch (error) { await transaction.rollback(); throw error; }
    res.json({ success: true, message: "Xóa sản phẩm thành công!" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Không thể xóa do sản phẩm đã phát sinh giao dịch/tồn kho!",
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

async function saveType(req,res){
 const {fail}=require('../../../Shared/Backend/services/website-common');
 const id=String(req.params.id||req.body.maLoaiSP||'').trim(),name=String(req.body.tenLoaiSP||'').trim();
 const enabled=req.body.apDungTuyChon===true;
 const grinds=[...new Set(req.body.loaiXay||[])],weights=[...new Set(req.body.trongLuong||[])];
 const tx=new sql.Transaction(await poolPromise);await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
 try{
  if(!/^[A-Za-z0-9]{1,3}$/.test(id)||!name||name.length>50)fail('Kiểm tra mã và tên loại sản phẩm.');
  if(enabled&&(!grinds.length||!weights.length))fail('Chọn ít nhất một loại xay và một trọng lượng.');
  for(const [values,table,col] of [[grinds,'LOAI_XAY','MaLoaiXay'],[weights,'TRONG_LUONG','MaTrongLuong']])for(const value of values){
   if(!Number.isInteger(value)||value<1)fail('Mã lựa chọn không hợp lệ.');
   const r=await tx.request().input('ID',sql.Int,value).query('SELECT 1 AS OK FROM '+table+' WHERE '+col+'=@ID AND HoatDong=1');if(!r.recordset.length)fail('Chỉ chọn các mục đang hoạt động.');
  }
  await tx.request().input('ID',sql.Char(3),id).input('Name',sql.NVarChar(50),name).input('Enabled',sql.Bit,enabled).query(req.params.id?'UPDATE LOAI_SAN_PHAM SET TenLoaiSP=@Name,ApDungTuyChon=@Enabled WHERE MaLoaiSP=@ID':'INSERT LOAI_SAN_PHAM(MaLoaiSP,TenLoaiSP,ApDungTuyChon) VALUES(@ID,@Name,@Enabled)');
  await tx.request().input('ID',sql.Char(3),id).query('DELETE LOAI_SP_LOAI_XAY WHERE MaLoaiSP=@ID;DELETE LOAI_SP_TRONG_LUONG WHERE MaLoaiSP=@ID');
  if(enabled){
   for(const value of grinds)await tx.request().input('ID',sql.Char(3),id).input('Value',sql.Int,value).query('INSERT LOAI_SP_LOAI_XAY VALUES(@ID,@Value)');
   for(const value of weights)await tx.request().input('ID',sql.Char(3),id).input('Value',sql.Int,value).query('INSERT LOAI_SP_TRONG_LUONG VALUES(@ID,@Value)');
  }
  await tx.commit();res.json({success:true,message:'Đã lưu loại sản phẩm.'});
 }catch(e){await tx.rollback();res.status(e.status||400).json({success:false,message:e.status?e.message:'Không lưu được loại sản phẩm. Kiểm tra dữ liệu trùng hoặc liên kết.'});}
}
router.post('/loai-sp',saveType);
router.put('/loai-sp/:id',saveType);

router.delete("/loai-sp/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("MaLoaiSP", sql.Char(3), req.params.id)
      .query(`IF EXISTS(SELECT 1 FROM SAN_PHAM WHERE MaLoaiSP=@MaLoaiSP) THROW 50020,N'Loại sản phẩm đang được sử dụng.',1; DELETE LOAI_SP_LOAI_XAY WHERE MaLoaiSP=@MaLoaiSP;DELETE LOAI_SP_TRONG_LUONG WHERE MaLoaiSP=@MaLoaiSP;DELETE FROM LOAI_SAN_PHAM WHERE MaLoaiSP=@MaLoaiSP`);
    res.json({ success: true, message: "Xóa loại sản phẩm thành công!" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Không thể xóa do loại sản phẩm này đã được sử dụng!",
    });
  }
});


module.exports = router;
