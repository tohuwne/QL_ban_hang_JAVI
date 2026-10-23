// Real SQL Server integration. All schema/data changes are rolled back.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
require('dotenv').config({quiet:true});
if(!/^JAVI_COFFEE_TEST_[A-Z0-9_]+$/.test(process.env.DB_NAME||''))throw Error('Integration tests require a disposable JAVI_COFFEE_TEST_ database. Never run against live data.');
const {sql,poolPromise}=require('../Shared/Backend/config/database');
function loadRoutes(file,db){
 const routes={};const router={get:(p,...f)=>routes['GET '+p]=f.at(-1),post:(p,...f)=>routes['POST '+p]=f.at(-1),put:(p,...f)=>routes['PUT '+p]=f.at(-1),delete:(p,...f)=>routes['DELETE '+p]=f.at(-1),use(){}};
 class ScopedTransaction{async begin(){}async commit(){}async rollback(){}request(){return db.request();}}
 const fakeSql={...sql,Transaction:ScopedTransaction};
 const localRequire=require('module').createRequire(require('path').resolve(file));
 const moduleStub={exports:{}};
 vm.runInNewContext(fs.readFileSync(file,'utf8'),{module:moduleStub,exports:moduleStub.exports,require:id=>id==='express'?{Router:()=>router}:id.endsWith('/config/database')?{sql:fakeSql,poolPromise:Promise.resolve(db)}:id.endsWith('/services/order-email')?{renderOrderEmail:()=>'<p>test</p>',deliverOrderEmail:async()=>{}}:localRequire(id),console,process},{filename:file});
 return async(method,path,req={})=>new Promise((resolve,reject)=>{
  const res={code:200,status(code){this.code=code;return this;},json(body){resolve({status:this.code,...body});}};
  try{Promise.resolve(routes[method+' '+path]({method,body:{},params:{},query:{},...req},res)).catch(reject);}catch(e){reject(e);}
 });
}
(async()=>{
 const pool=await poolPromise,tx=new sql.Transaction(pool);await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
 try{
  // The disposable database must first be initialized with database.sql.

  const query=async text=>(await tx.request().query(text)).recordset;
  assert.equal((await query("SELECT COUNT(*) AS n FROM SAN_PHAM WHERE MaLoaiSP='CAP'"))[0].n,4);
  console.log('PASS: direct CREATE/INSERT schema');
  const account=(await query("SELECT TOP 1 * FROM TAI_KHOAN WHERE TenDangNhap='enduser_demo'"))[0];assert(account);
  const user={sub:account.TenDangNhap,vaiTro:'KHACH_HANG',maKH:account.MaKH};
  const cart=loadRoutes('User/Backend/routes/gio-hang.js',tx),web=loadRoutes('User/Backend/routes/website.js',tx);
  const admin=loadRoutes('Admin/Backend/routes/ban-hang.js',tx);
  const types=loadRoutes('Admin/Backend/routes/san-pham.js',tx);
  const config=loadRoutes('Admin/Backend/routes/product-options.js',tx);
  const options=await config('GET','/loai-sp/options');assert(options.success);assert.equal(options.data.grinds.length,3);assert.equal(options.data.weights.length,4);
  const publicOptions=await web('GET','/website/product-options');assert(publicOptions.success);assert.equal(publicOptions.data.trongLuong.length,4);
  let invalidType=await types('POST','/loai-sp',{body:{maLoaiSP:'TST',tenLoaiSP:'Test type',apDungTuyChon:true,loaiXay:[],trongLuong:[]}});assert.equal(invalidType.status,400);
  await query("DELETE GIO_HANG WHERE TenDangNhap='enduser_demo';UPDATE SAN_PHAM SET SoLuongKD=1000,SoLuongTon=2000 WHERE MaSP='CFH31'");
  const body={tenDangNhap:'enduser_demo',maSP:'CFH31',trongLuongGram:200,loaiXay:'Nguyên hạt',soLuong:1};
  async function add(extra={}){const r=await cart('POST','/gio-hang',{body:{...body,...extra}});assert.equal(r.success,true,r.message);assert(Number.isSafeInteger(r.data.MaGH));}
  const rows=async()=>(await cart('GET','/gio-hang/:tenDangNhap',{params:{tenDangNhap:'enduser_demo'}})).data;
  await add();console.log('PASS: first add');await add({soLuong:2});console.log('PASS: repeated add');let items=await rows();assert.equal(items.length,1);assert.equal(items[0].SoLuong,3);
  await add({trongLuongGram:500,loaiXay:'Xay sẵn pha phin',soLuong:2});items=await rows();assert.equal(items.length,2);assert.equal(items[0].TrongLuongGram,500);assert.equal(items.find(x=>x.TrongLuongGram===500).GiaBan,197500);
  console.log('PASS: split options');const first=items.find(x=>x.TrongLuongGram===200).MaGH;
  let r=await cart('PUT','/gio-hang',{body:{tenDangNhap:'enduser_demo',maGH:first,soLuong:4}});assert(r.success,r.message);assert.equal(Number((await rows())[0].MaGH),Number(first));assert.equal((await rows()).find(x=>x.TrongLuongGram===500).SoLuong,2);
  console.log('PASS: individual update');
  r=await cart('DELETE','/gio-hang/:tenDangNhap/:maGH',{params:{tenDangNhap:'enduser_demo',maGH:String(first)}});assert(r.success);assert.equal((await rows()).length,1);
  await query("UPDATE SAN_PHAM SET SoLuongKD=12 WHERE MaSP='CFH31'");
  r=await cart('POST','/gio-hang',{body:{...body,soLuong:2}});assert.equal(r.status,409);assert.equal((await rows()).length,1);
  await query("UPDATE SAN_PHAM SET SoLuongKD=1000 WHERE MaSP='CFH31'");await add();items=await rows();
  console.log('PASS: cart merge/split/update/delete and aggregate stock');
  const ids=items.map(x=>x.MaGH);
  r=await web('POST','/website/quote',{user,body:{maGioHang:ids}});assert(r.success,r.message);assert.equal(r.data.subtotal,474000);
  // Reject forged/disabled options and foreign row selection.
  r=await cart('POST','/gio-hang',{body:{...body,trongLuongGram:300}});assert.equal(r.status,409);
  r=await web('POST','/website/quote',{user,body:{maGioHang:[2147483646]}});assert.equal(r.status,409);
  console.log('PASS: quote and invalid option/row validation');
  const location=(await query('SELECT TOP 1 w.MaTinhThanh,w.MaPhuongXa FROM WEB_PHUONG_XA w WHERE EXISTS(SELECT 1 FROM WEB_PHI_VAN_CHUYEN r WHERE r.HienThi=1 AND (r.MaTinhThanh=w.MaTinhThanh OR r.MaTinhThanh IS NULL)) ORDER BY w.MaTinhThanh,w.MaPhuongXa'))[0];assert(location);
  await query('SAVE TRANSACTION CartFocusTest');
  r=await cart('POST','/gio-hang',{body:{...body,trongLuongGram:500,loaiXay:'Xay sẵn pha phin',soLuong:1}});assert(r.success,r.message);
  const focusId=r.data.MaGH;assert.equal(Number((await rows())[0].MaGH),focusId);assert(Number.isSafeInteger(focusId));assert.equal(r.data.SoLuong,3);
  assert.equal(focusId,Number(items.find(x=>x.TrongLuongGram===500).MaGH));
  const onlyFocused=await web('POST','/website/quote',{user,body:{maGioHang:[focusId]}});assert(onlyFocused.success,onlyFocused.message);assert.equal(onlyFocused.data.subtotal,592500);
  const other=(await rows()).find(x=>x.TrongLuongGram===200);assert.equal(other.SoLuong,1);
  await query('ROLLBACK TRANSACTION CartFocusTest');
  console.log('PASS: cart add returns exact merged row ID/quantity; quoting only that row excludes the same product with different options.');
  r=await web('POST','/website/checkout',{user,body:{maGioHang:ids,tinhThanh:location.MaTinhThanh,phuongXa:location.MaPhuongXa,diaChiChiTiet:'123 Duong thu nghiem',nguoiNhan:'Integration test',soDT:'0901234567',email:'integration@example.test',hinhThucTT:'Tiền mặt',maYeuCau:'coffee-integration-rollback-20261019'}});assert(r.success,r.message);
  console.log('PASS: checkout response');
  const order=r.data.maDH;
  const lines=await query("SELECT * FROM CT_DON_HANG WHERE MaDH='"+order+"'");assert.equal(lines.length,2);assert.equal(new Set(lines.map(x=>x.MaSP)).size,1);assert.equal(new Set(lines.map(x=>x.MaCTDH)).size,2);
  assert.equal((await query("SELECT SoLuongKD FROM SAN_PHAM WHERE MaSP='CFH31'"))[0].SoLuongKD,988);assert.equal((await rows()).length,0);
  r=await admin('GET','/don-hang/:id/chi-tiet',{user:{vaiTro:'NHAN_VIEN',chucVu:'Quản lý'},params:{id:order}});assert(r.success,r.message);assert.equal(r.data.items.length,2);assert.equal(r.data.items.reduce((sum,x)=>sum+x.ThanhTien,0),474000);
  const staff=(await query("SELECT TOP 1 MaNV FROM NHAN_VIEN WHERE TrangThai=N'Đang làm việc'"))[0].MaNV;
  await query('SAVE TRANSACTION ShippingTest');
  await tx.request().input('Order',sql.Char(8),order).input('Staff',sql.Char(8),staff).query("INSERT PHIEU_XUAT(MaPX,NgayXuat,TrangThaiGiaoHang,MaNV,MaDH) VALUES('PX999998',GETDATE(),N'Đang xử lý',@Staff,@Order)");
  await query("UPDATE PHIEU_XUAT SET TrangThaiGiaoHang=N'Hủy xuất kho' WHERE MaDH='"+order+"'");
  assert.equal((await query("SELECT SoLuongKD FROM SAN_PHAM WHERE MaSP='CFH31'"))[0].SoLuongKD,1000);
  await query("UPDATE PHIEU_XUAT SET TrangThaiGiaoHang=N'Hủy xuất kho' WHERE MaDH='"+order+"'");
  assert.equal((await query("SELECT SoLuongKD FROM SAN_PHAM WHERE MaSP='CFH31'"))[0].SoLuongKD,1000);
  await query('ROLLBACK TRANSACTION ShippingTest');
  await query('SAVE TRANSACTION ShippingTest');
  await tx.request().input('Order',sql.Char(8),order).input('Staff',sql.Char(8),staff).query("INSERT PHIEU_XUAT(MaPX,NgayXuat,TrangThaiGiaoHang,MaNV,MaDH) VALUES('PX999998',GETDATE(),N'Đang xử lý',@Staff,@Order)");
  await query("UPDATE PHIEU_XUAT SET TrangThaiGiaoHang=N'Đang giao hàng' WHERE MaDH='"+order+"'");
  await query("UPDATE PHIEU_XUAT SET TrangThaiGiaoHang=N'Đã giao hàng' WHERE MaDH='"+order+"'");
  const stock=(await query("SELECT SoLuongTon,SoLuongKD FROM SAN_PHAM WHERE MaSP='CFH31'"))[0];assert.equal(stock.SoLuongTon,1988);assert.equal(stock.SoLuongKD,988);
  await query('ROLLBACK TRANSACTION ShippingTest');
  console.log('PASS: direct SQL schema, 4 coffee products, atomic cart merge/split, individual update/delete, aggregate stock, server prices, invalid options, checkout snapshots, admin detail without duplicate joins.');
 }finally{await tx.rollback();await pool.close();console.log('ROLLBACK: no test orders or schema/data changes retained.');}
})().catch(e=>{console.error(e);process.exitCode=1});
