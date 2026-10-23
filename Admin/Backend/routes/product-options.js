const router=require('express').Router();
const {sql,poolPromise}=require('../../../Shared/Backend/config/database');
const {wrap,fail}=require('../../../Shared/Backend/services/website-common');
const definitions={grinds:{table:'LOAI_XAY',id:'MaLoaiXay',value:'TenLoaiXay'},weights:{table:'TRONG_LUONG',id:'MaTrongLuong',value:'TrongLuongGram'}};
// Mounted after the administrator authentication/authorization middleware.
router.get('/loai-sp/options',wrap(async(_req,res)=>{
 const r=await(await poolPromise).request().query('SELECT * FROM LOAI_XAY ORDER BY ThuTu,MaLoaiXay;SELECT * FROM TRONG_LUONG ORDER BY ThuTu,TrongLuongGram;SELECT * FROM LOAI_SP_LOAI_XAY;SELECT * FROM LOAI_SP_TRONG_LUONG;');
 res.json({success:true,data:{grinds:r.recordsets[0],weights:r.recordsets[1],typeGrinds:r.recordsets[2],typeWeights:r.recordsets[3]}});
}));
router.post('/loai-sp/options/:kind',save);
router.put('/loai-sp/options/:kind/:id',save);
async function save(req,res,next){return wrap(async()=>{
 const d=definitions[req.params.kind];if(!d)fail('Danh mục không tồn tại.',404);
 const value=d.value==='TrongLuongGram'?Number(req.body.value):String(req.body.value||'').trim();
 if(d.value==='TrongLuongGram'?(!Number.isSafeInteger(value)||value<=0||value%100!==0||value>1000000):(!value||value.length>80))fail('Trọng lượng phải là bội số dương của 100; tên loại xay tối đa 80 ký tự.');
 const order=Number(req.body.order||0);if(!Number.isInteger(order)||order<0)fail('Thứ tự phải là số nguyên không âm.');
 const tx=new sql.Transaction(await poolPromise);await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
 try{
 const id=Number(req.params.id);if(req.params.id&&(!Number.isInteger(id)||id<1))fail('Mã không hợp lệ.');
 if(req.params.id){
  const current=(await tx.request().input('ID',sql.Int,id).query(`SELECT * FROM ${d.table} WITH(UPDLOCK,HOLDLOCK) WHERE ${d.id}=@ID`)).recordset[0];if(!current)fail('Không tìm thấy lựa chọn.',404);
  // Stable values are the cart identity. Keep used options immutable; create a new option instead.
  if(String(current[d.value])!==String(value)){
   const used=await tx.request().input('Value',d.value==='TrongLuongGram'?sql.Int:sql.NVarChar(80),current[d.value]).query(`SELECT TOP 1 1 AS Used FROM GIO_HANG WHERE ${d.value==='TrongLuongGram'?'TrongLuongGram':'LoaiXay'}=@Value UNION ALL SELECT TOP 1 1 FROM CT_DON_HANG WHERE ${d.value==='TrongLuongGram'?'TrongLuongGram':'LoaiXay'}=@Value`);
   if(used.recordset.length)fail('Lựa chọn đã được sử dụng. Hãy ngừng sử dụng và tạo lựa chọn mới.');
  }
 }
 const q=tx.request().input('Value',d.value==='TrongLuongGram'?sql.Int:sql.NVarChar(80),value).input('Order',sql.Int,order).input('Active',sql.Bit,req.body.active!==false).input('ID',sql.Int,req.params.id? id:null);
 await q.query(req.params.id?`UPDATE ${d.table} SET ${d.value}=@Value,ThuTu=@Order,HoatDong=@Active WHERE ${d.id}=@ID`:`INSERT ${d.table}(${d.value},ThuTu,HoatDong) VALUES(@Value,@Order,@Active)`);
 const invalid=await tx.request().query(`SELECT TOP 1 MaLoaiSP FROM LOAI_SAN_PHAM l WHERE ApDungTuyChon=1 AND (NOT EXISTS(SELECT 1 FROM LOAI_SP_LOAI_XAY m JOIN LOAI_XAY x ON m.MaLoaiXay=x.MaLoaiXay WHERE m.MaLoaiSP=l.MaLoaiSP AND x.HoatDong=1) OR NOT EXISTS(SELECT 1 FROM LOAI_SP_TRONG_LUONG m JOIN TRONG_LUONG t ON m.MaTrongLuong=t.MaTrongLuong WHERE m.MaLoaiSP=l.MaLoaiSP AND t.HoatDong=1))`);
 if(invalid.recordset.length)fail('Không thể tắt lựa chọn cuối cùng đang áp dụng cho loại sản phẩm.');
 await tx.commit();res.json({success:true,message:'Đã lưu cấu hình.'});
 }catch(e){await tx.rollback();if(e.number===2601||e.number===2627)fail('Giá trị đã tồn tại.');throw e;}
})(req,res,next);}
module.exports=router;
