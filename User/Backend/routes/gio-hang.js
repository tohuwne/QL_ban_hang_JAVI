const router=require('express').Router();
const {sql,poolPromise}=require('../../../Shared/Backend/config/database');
const {wrap,fail}=require('../../../Shared/Backend/services/website-common');
const {validateOptions,checkStock,factor}=require('../../../Shared/Backend/services/product-options');
router.get('/gio-hang/:tenDangNhap',wrap(async(req,res)=>{
 const r=await(await poolPromise).request().input('User',sql.VarChar(50),req.params.tenDangNhap).query(`
 SELECT g.*,s.TenSP,s.GiaBan AS GiaCoSo,s.GiaBan*ISNULL(g.TrongLuongGram/100,1) AS GiaBan,s.DonViTinh,s.SoLuongKD,s.AnhSP,l.TenLoaiSP,l.ApDungTuyChon,s.MaLoaiSP,
 ISNULL(w.HienThi,0) AS HienThi,w.ViTri,w.HinhAnh FROM GIO_HANG g JOIN SAN_PHAM s ON g.MaSP=s.MaSP JOIN LOAI_SAN_PHAM l ON l.MaLoaiSP=s.MaLoaiSP LEFT JOIN WEB_SAN_PHAM w ON w.MaSP=s.MaSP WHERE g.TenDangNhap=@User ORDER BY g.NgayThem DESC,g.MaGH DESC`);
 res.json({success:true,data:r.recordset});
}));
async function save(req,res){return wrap(async()=>{
 const username=req.body.tenDangNhap;
 const qty=Number(req.body.soLuong),line=req.body.maGH==null?null:Number(req.body.maGH);
 if(!username||!Number.isInteger(qty)||qty<1||qty>999)fail('Số lượng phải từ 1 đến 999.');
 if(line!==null&&(!Number.isInteger(line)||line<1))fail('Mã dòng giỏ hàng không hợp lệ.');
 const tx=new sql.Transaction(await poolPromise);await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
 try{
  const rows=(await tx.request().input('User',sql.VarChar(50),username).query('SELECT * FROM GIO_HANG WITH(UPDLOCK,HOLDLOCK) WHERE TenDangNhap=@User')).recordset;
  const current=line==null?null:rows.find(i=>Number(i.MaGH)===line);if(line!=null&&!current)fail('Không tìm thấy dòng giỏ hàng.',404);
  const sp=current?.MaSP||req.body.maSP;if(!sp)fail('Thiếu sản phẩm.');
  const product=(await tx.request().input('SP',sql.Char(5),sp).query('SELECT s.*,l.ApDungTuyChon FROM SAN_PHAM s WITH(UPDLOCK,HOLDLOCK) JOIN LOAI_SAN_PHAM l ON s.MaLoaiSP=l.MaLoaiSP JOIN WEB_SAN_PHAM w ON w.MaSP=s.MaSP AND w.HienThi=1 WHERE s.MaSP=@SP')).recordset[0];
  if(!product)fail('Sản phẩm không còn bán.',404);
  const option=await validateOptions(tx,product,current?current.TrongLuongGram:req.body.trongLuongGram,current?current.LoaiXay:req.body.loaiXay);
  const existing=current||rows.find(i=>i.MaSP.trim()===sp.trim()&&i.TrongLuongGram===option.TrongLuongGram&&i.LoaiXay===option.LoaiXay);
  const amount=req.method==='POST'?Number(existing?.SoLuong||0)+qty:qty;
  if(amount>999)fail('Tối đa 999 gói cho mỗi lựa chọn.');
  const demand=rows.filter(i=>i.MaSP.trim()===sp.trim()&&i.MaGH!==existing?.MaGH).concat({...option,MaSP:sp,SoLuong:amount});
  checkStock(demand.map(i=>({...product,...i})));
  const q=tx.request().input('User',sql.VarChar(50),username).input('SP',sql.Char(5),sp).input('Qty',sql.Int,amount).input('Gram',sql.Int,option.TrongLuongGram).input('Grind',sql.NVarChar(80),option.LoaiXay).input('ID',sql.Int,existing?.MaGH||null);
  const touched="DECLARE @Touched DATETIME=GETDATE(); SELECT @Touched=CASE WHEN MAX(NgayThem)>=@Touched THEN DATEADD(MILLISECOND,4,MAX(NgayThem)) ELSE @Touched END FROM GIO_HANG WHERE TenDangNhap=@User; ";
  const saved=await q.query(touched+(existing?'UPDATE GIO_HANG SET SoLuong=@Qty,NgayThem=@Touched OUTPUT INSERTED.MaGH WHERE MaGH=@ID AND TenDangNhap=@User':'INSERT GIO_HANG(TenDangNhap,MaSP,SoLuong,TrongLuongGram,LoaiXay,NgayThem) OUTPUT INSERTED.MaGH VALUES(@User,@SP,@Qty,@Gram,@Grind,@Touched)'));
  await tx.commit();res.json({success:true,data:{MaGH:Number(saved.recordset[0].MaGH),SoLuong:amount},message:'Đã cập nhật giỏ hàng.'});
 }catch(e){await tx.rollback();throw e;}
})(req,res);}
router.post('/gio-hang',save);
router.put('/gio-hang',save);
router.delete('/gio-hang/:tenDangNhap/:maGH',wrap(async(req,res)=>{
 const id=Number(req.params.maGH);if(!Number.isInteger(id)||id<1)fail('Mã dòng giỏ hàng không hợp lệ.');
 await(await poolPromise).request().input('User',sql.VarChar(50),req.params.tenDangNhap).input('ID',sql.Int,id).query('DELETE GIO_HANG WHERE TenDangNhap=@User AND MaGH=@ID');
 res.json({success:true,message:'Đã xóa dòng giỏ hàng.'});
}));
router.delete('/gio-hang/:tenDangNhap',wrap(async(req,res)=>{
 if(req.body?.maGioHang!==undefined){
  const ids=req.body.maGioHang;
  if(!Array.isArray(ids)||!ids.length||ids.length>100||ids.some(id=>!Number.isSafeInteger(id)||id<1))fail('Chọn từ 1 đến 100 dòng giỏ hàng hợp lệ.');
  const query=(await poolPromise).request().input('User',sql.VarChar(50),req.params.tenDangNhap);
  const names=[...new Set(ids)].map((id,i)=>{query.input('ID'+i,sql.Int,id);return '@ID'+i;});
  await query.query('DELETE GIO_HANG WHERE TenDangNhap=@User AND MaGH IN ('+names.join(',')+')');
  return res.json({success:true,message:'Đã xóa các mục đã chọn.'});
 }
 await(await poolPromise).request().input('User',sql.VarChar(50),req.params.tenDangNhap).query('DELETE GIO_HANG WHERE TenDangNhap=@User');res.json({success:true});
}));
module.exports=router;
