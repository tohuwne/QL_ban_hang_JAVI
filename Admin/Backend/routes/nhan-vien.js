const router = require('express').Router();
const {sql,poolPromise}=require('../../../Shared/Backend/config/database');
const bcrypt=require('bcryptjs');
router.get('/nhan-vien',async(req,res)=>{
 try{const r=await(await poolPromise).request().query(`SELECT nv.*,tk.TenDangNhap FROM NHAN_VIEN nv LEFT JOIN TAI_KHOAN tk ON nv.MaNV=tk.MaNV ORDER BY nv.MaNV DESC`);res.json({success:true,data:r.recordset});}
 catch(e){res.status(500).json({success:false,message:'Không tải được nhân viên.'});}
});
async function save(req,res){
 const b=req.body,editing=!!req.params.id,username=String(b.tenDangNhap||'').trim(),password=String(b.matKhau||'');
 if(!String(b.hoTen||'').trim()||!String(b.cccd||'').trim()||!String(b.chucVu||'').trim())return res.status(400).json({success:false,message:'Nhập họ tên, CCCD và chức vụ.'});
 if((username&&!/^[a-zA-Z0-9_.-]{4,50}$/.test(username))||(password&&password.length<6)||(!username&&password))return res.status(400).json({success:false,message:'Kiểm tra tài khoản và mật khẩu (tối thiểu 6 ký tự).'});
 const tx=new sql.Transaction(await poolPromise);await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
 try{
  let id=req.params.id;
  if(editing){const exists=await tx.request().input('ID',sql.Char(8),id).query('SELECT MaNV FROM NHAN_VIEN WITH(UPDLOCK,HOLDLOCK) WHERE MaNV=@ID');if(!exists.recordset.length){const e=Error('Không tìm thấy nhân viên.');e.status=404;throw e;}}
  if(username){const duplicate=await tx.request().input('Name',sql.VarChar(50),username).input('ID',sql.Char(8),id||null).query('SELECT TenDangNhap FROM TAI_KHOAN WITH(UPDLOCK,HOLDLOCK) WHERE TenDangNhap=@Name AND (@ID IS NULL OR MaNV IS NULL OR MaNV<>@ID)');if(duplicate.recordset.length)throw Error('Tên đăng nhập đã được sử dụng.');}
  if(!editing){const next=await tx.request().query("SELECT 'NV'+RIGHT('000000'+CAST(ISNULL(MAX(CAST(SUBSTRING(MaNV,3,6) AS INT)),0)+1 AS VARCHAR(6)),6) MaNV FROM NHAN_VIEN WITH(TABLOCKX,HOLDLOCK)");id=next.recordset[0].MaNV;}
  await tx.request().input('ID',sql.Char(8),id).input('Name',sql.NVarChar(50),String(b.hoTen).trim()).input('CCCD',sql.VarChar(20),b.cccd).input('Gender',sql.NVarChar(5),b.gioiTinh||null).input('Phone',sql.VarChar(50),b.soDT||null).input('Email',sql.VarChar(100),b.emailNV||null).input('Address',sql.NVarChar(100),b.diaChiNV||null).input('Role',sql.NVarChar(30),b.chucVu)
   .query(editing?`UPDATE NHAN_VIEN SET HoTenNV=@Name,CCCD=@CCCD,GioiTinh=@Gender,SoDTNV=@Phone,EmailNV=@Email,DiaChiNV=@Address,ChucVu=@Role WHERE MaNV=@ID`:`INSERT NHAN_VIEN(MaNV,HoTenNV,CCCD,GioiTinh,SoDTNV,EmailNV,DiaChiNV,ChucVu) VALUES(@ID,@Name,@CCCD,@Gender,@Phone,@Email,@Address,@Role)`);
  const accounts=await tx.request().input('ID',sql.Char(8),id).query('SELECT TenDangNhap FROM TAI_KHOAN WITH(UPDLOCK,HOLDLOCK) WHERE MaNV=@ID');
  if(accounts.recordset.length>1)throw Error('Nhân viên có nhiều tài khoản, cần kiểm tra lại dữ liệu.');
  const account=accounts.recordset[0];
  if(username){
   if(!account&&!password)throw Error('Nhập mật khẩu để cấp tài khoản mới.');
   const hash=password?await bcrypt.hash(password,10):null;
   const r=tx.request().input('ID',sql.Char(8),id).input('Username',sql.VarChar(50),username).input('Hash',sql.VarChar(255),hash);
   await r.query(account?`UPDATE TAI_KHOAN SET TenDangNhap=@Username,MatKhau=COALESCE(@Hash,MatKhau) WHERE MaNV=@ID`:`INSERT TAI_KHOAN(TenDangNhap,MatKhau,MaNV,VaiTro) VALUES(@Username,@Hash,@ID,'NHAN_VIEN')`);
  }
  await tx.commit();res.json({success:true,message:editing?'Cập nhật nhân viên thành công!':'Thêm nhân viên thành công!',data:{maNV:id}});
 }catch(e){await tx.rollback();res.status(e.status||400).json({success:false,message:[2601,2627].includes(e.number)?'Tài khoản hoặc CCCD đã tồn tại.':e.message});}
}
router.post('/nhan-vien',save);router.put('/nhan-vien/:id',save);
router.put('/nhan-vien/lock/:id',async(req,res)=>{
 try{const r=await(await poolPromise).request().input('MaNV',sql.Char(8),req.params.id).query("UPDATE NHAN_VIEN SET TrangThai=CASE WHEN TrangThai=N'Đang làm việc' THEN N'Đã nghỉ việc' ELSE N'Đang làm việc' END OUTPUT inserted.MaNV WHERE MaNV=@MaNV");if(!r.recordset.length)return res.status(404).json({success:false,message:'Không tìm thấy nhân viên.'});res.json({success:true,message:'Cập nhật trạng thái nhân viên thành công!'});}
 catch(e){res.status(500).json({success:false,message:'Không cập nhật được trạng thái nhân viên.'});}
});
module.exports=router;
