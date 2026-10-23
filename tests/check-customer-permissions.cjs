const assert=require('assert/strict'),Module=require('module');
process.env.AUTH_SECRET='local-permission-test-secret';
const express=require('../node_modules/express');
let active=true,customerScope=null,productScope=null;
const sql=new Proxy({}, {get:()=>()=>{}});
const pool={request(){const inputs={};return {input(k,t,v){inputs[k]=v;return this;},async query(q){
 if(q.includes('SELECT k.MaLoaiKH FROM TAI_KHOAN'))return {recordset:[{MaLoaiKH:'L01'}]};
 if(q.includes('FROM GIO_HANG'))return {recordset:[{MaGH:1,MaSP:'CFH31',MaLoaiSP:'CFH',SoLuong:2,GiaBan:395000,SoLuongKD:20,HienThi:1}]};
 if(q.includes('FROM WEB_MA_GIAM_GIA')){return {recordset:active&&inputs.Code==='JAVI10'?[{MaGiamGia:'JAVI10',MaLoaiKH:customerScope,MaSP:productScope,TrangThai:'Hoạt động',SoLuong:null,LoaiGiam:'percent',GiaTri:10,DonToiThieu:200000,GiamToiDa:50000}]:[]};}
 return {recordset:[]};
}};}};
const original=Module._load;Module._load=function(name,parent,isMain){if(/(?:^|\/)config\/database$/.test(name))return {sql,poolPromise:Promise.resolve(pool)};return original.call(this,name,parent,isMain);};
const app=express();app.use(express.json());app.use('/api',require('../app-api'));Module._load=original;
const {createToken}=require('../Shared/Backend/middleware/auth');
(async()=>{const server=await new Promise(resolve=>{const instance=app.listen(0,'127.0.0.1',()=>resolve(instance));});try{
 const base='http://127.0.0.1:'+server.address().port;
 const token=createToken({TenDangNhap:'enduser_demo',VaiTro:'KHACH_HANG',MaKH:'KH000001'});
 async function quote(code,authenticated=true){const r=await fetch(base+'/api/website/quote',{method:'POST',headers:{'Content-Type':'application/json',...(authenticated?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({maGioHang:[1],maGiamGia:code})});return {status:r.status,body:await r.json()};}
 let r=await quote('');assert.equal(r.status,200);assert.equal(r.body.data.total,790000);
 r=await quote('JAVI10');assert.equal(r.status,200);assert.equal(r.body.data.total,740000);
 customerScope='S01';r=await quote('JAVI10');assert.equal(r.status,400);customerScope='L01';productScope='CFH35';r=await quote('JAVI10');assert.equal(r.status,400);productScope='CFH31';r=await quote('JAVI10');assert.equal(r.status,200);
 active=false;r=await quote('JAVI10');assert.equal(r.status,400);assert(!r.body.success);
 r=await quote('',false);assert.equal(r.status,401);
 const admin=await fetch(base+'/api/cau-hinh-website/commerce',{headers:{Authorization:'Bearer '+token}});assert.equal(admin.status,403);
 console.log('PASS: real API router + authentication allow customer quotes/coupons, reject inactive codes, reject guest access and customer admin access');
 }finally{await new Promise(resolve=>server.close(resolve));}})().catch(e=>{console.error(e);process.exitCode=1;});
