const {sql}=require('../config/database');
const normalizePhone=value=>{let p=String(value||'').trim().replace(/[\s().-]/g,'');return p.startsWith('+84')?'0'+p.slice(3):p;};
const phoneExpression="CASE WHEN LEFT(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(SoDTKH)),' ',''),'-',''),'(',''),')',''),'.',''),3)='+84' THEN '0'+SUBSTRING(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(SoDTKH)),' ',''),'-',''),'(',''),')',''),'.',''),4,50) ELSE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(SoDTKH)),' ',''),'-',''),'(',''),')',''),'.','') END";
async function candidates(tx,phone){return (await tx.request().input('Phone',sql.VarChar(50),normalizePhone(phone)).query(`SELECT * FROM KHACH_HANG WITH(UPDLOCK,HOLDLOCK) WHERE ${phoneExpression}=@Phone`)).recordset;}
async function resolveCustomer(tx,p){
 const rows=await candidates(tx,p.phone);
 if(!rows.length)return null;
 if(rows.length!==1)throw Error('Số điện thoại khớp nhiều hồ sơ. Vui lòng liên hệ cửa hàng để điều chỉnh dữ liệu.');
 const kh=rows[0];
 const accounts=await tx.request().input('KH',sql.Char(8),kh.MaKH).query("SELECT TenDangNhap FROM TAI_KHOAN WITH(UPDLOCK,HOLDLOCK) WHERE MaKH=@KH");
 if(accounts.recordset.length)throw Error('Thông tin này đã có tài khoản. Vui lòng đăng nhập hoặc liên hệ cửa hàng.');
 await tx.request().input('KH',sql.Char(8),kh.MaKH).input('Name',sql.NVarChar(50),p.fullName.trim()).input('Phone',sql.VarChar(50),normalizePhone(p.phone)).input('Email',sql.VarChar(100),p.email.trim().toLowerCase()).input('Address',sql.NVarChar(100),String(p.address||'').trim()).query('UPDATE KHACH_HANG SET TenKH=@Name,SoDTKH=@Phone,EmailKH=@Email,DiaChiKH=@Address WHERE MaKH=@KH');
 return {customer:{...kh,TenKH:p.fullName.trim(),SoDTKH:normalizePhone(p.phone),EmailKH:p.email.trim().toLowerCase(),DiaChiKH:String(p.address||'').trim()}};
}
module.exports={normalizePhone,candidates,resolveCustomer};
