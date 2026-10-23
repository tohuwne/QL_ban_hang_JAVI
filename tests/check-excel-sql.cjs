// Integration check: template lookups + preview only. Never commits imported rows.
const path=require('path'),assert=require('assert/strict');
require('../node_modules/dotenv').config({path:path.join(__dirname,'../.env'),quiet:true});
const express=require('../node_modules/express'),ExcelJS=require('../node_modules/exceljs');
const {schema,importModules}=require('../Admin/Backend/services/import-schema');
const workbook=require('../Admin/Backend/services/import-workbook');
const {poolPromise}=require('../Shared/Backend/config/database');
const {createToken}=require('../Shared/Backend/middleware/auth');
const app=express();app.use(express.json());app.use('/api',require('../Admin/Backend/routes/excel'));
(async()=>{
 let server;const pool=await poolPromise;
 try{
  server=app.listen(0,'127.0.0.1');await new Promise(r=>server.on('listening',r));const base='http://127.0.0.1:'+server.address().port+'/api/excel/';
  const token=createToken({TenDangNhap:'import-test',VaiTro:'NHAN_VIEN',ChucVu:'Quản lý'}),headers={Authorization:'Bearer '+token};
  for(const id of Object.keys(schema)){const response=await fetch(base+id+'/template',{headers});if(!importModules.has(id)){assert.equal(response.status,403,id);continue;}assert.equal(response.status,200,id+': '+(response.ok?'':await response.text()));const book=new ExcelJS.Workbook();await book.xlsx.load(Buffer.from(await response.arrayBuffer()));assert(book.getWorksheet('Nhap lieu'));}
  const categories=(await pool.request().query('SELECT MaLoaiSP,TenLoaiSP FROM LOAI_SAN_PHAM ORDER BY MaLoaiSP')).recordset;
  const existing=new Set(categories.map(r=>r.MaLoaiSP.trim()));let key;for(let i=0;i<100;i++){const candidate='Z'+String(i).padStart(2,'0');if(!existing.has(candidate)){key=candidate;break;}}assert(key);
  const book=new ExcelJS.Workbook();await book.xlsx.load(await workbook.template(schema['loai-sp'],{}));book.getWorksheet('Nhap lieu').getRow(2).values=[key,'Kiểm tra hoàn tác Excel'];
  const response=await fetch(base+'loai-sp/preview?policy=skip',{method:'POST',headers:{...headers,'Content-Type':'application/octet-stream'},body:await book.xlsx.writeBuffer()});const result=await response.json();assert(result.success,JSON.stringify(result));assert(result.data.valid,JSON.stringify(result.data.rows));
  const after=(await pool.request().input('Key',key).query('SELECT MaLoaiSP FROM LOAI_SAN_PHAM WHERE MaLoaiSP=@Key')).recordset;assert.equal(after.length,0);
  const product=(await pool.request().query('SELECT TOP 1 MaSP,SoLuongKD,SoLuongTon FROM SAN_PHAM WHERE SoLuongKD>=3 AND GiaBan>0 ORDER BY MaSP')).recordset[0];
  const staff=(await pool.request().query('SELECT TOP 1 MaNV FROM NHAN_VIEN ORDER BY MaNV')).recordset[0];assert(product&&staff);
  const phone='09'+Date.now().toString().slice(-8);
  assert.equal((await pool.request().input('Phone',phone).query('SELECT MaKH FROM KHACH_HANG WHERE SoDTKH=@Phone')).recordset.length,0);
  const countBefore=(await pool.request().query('SELECT COUNT(*) AS N FROM DON_HANG')).recordset[0].N;
  const orderDef=schema['don-hang'],orders=new ExcelJS.Workbook();await orders.xlsx.load(await workbook.template(orderDef,{}));
  for(let i=0;i<2;i++){
   const values={MaDH:'TEST'+i,MaKH:'',TenKH:'Khách kiểm tra rollback',SoDTKH:phone,MaNV:staff.MaNV.trim(),MaSP:product.MaSP.trim(),SoLuong:1,GiamGiaSP:0,TrangThaiDonHang:'Chờ giao'};
   orders.getWorksheet('Nhap lieu').getRow(i+2).values=orderDef.columns.map(c=>values[c.key]??'');
  }
  const orderResponse=await fetch(base+'don-hang/preview?policy=skip',{method:'POST',headers:{...headers,'Content-Type':'application/octet-stream'},body:await orders.xlsx.writeBuffer()});const orderResult=await orderResponse.json();assert(orderResult.success,JSON.stringify(orderResult));assert(orderResult.data.valid,JSON.stringify(orderResult.data.rows));
  assert.equal((await pool.request().input('Phone',phone).query('SELECT MaKH FROM KHACH_HANG WHERE SoDTKH=@Phone')).recordset.length,0);
  assert.equal((await pool.request().query('SELECT COUNT(*) AS N FROM DON_HANG')).recordset[0].N,countBefore);
  const stockAfter=(await pool.request().input('SP',product.MaSP).query('SELECT SoLuongKD,SoLuongTon FROM SAN_PHAM WHERE MaSP=@SP')).recordset[0];assert.equal(stockAfter.SoLuongKD,product.SoLuongKD);assert.equal(stockAfter.SoLuongTon,product.SoLuongTon);
  console.log('PASS: 10 templates; order preview creates/reuses one customer for two orders and rolls back customers, orders and stock. No commits.');
 }finally{if(server)await new Promise(r=>server.close(r));await pool.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
