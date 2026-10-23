const assert=require('node:assert/strict'),fs=require('fs');
require('dotenv').config({quiet:true});process.env.DB_NAME='JAVI_COFFEE_TEST_FIXES_20261022';
const {sql,poolPromise}=require('../Shared/Backend/config/database');
const {createToken}=require('../Shared/Backend/middleware/auth');
const {createApp}=require('../app');
let admin,user;
(async()=>{const pool=await poolPromise;await pool.request().query(fs.readFileSync('docs/sql/WEBSITE_NOI_DUNG.sql','utf8'));
 admin=createApp('admin').listen(0);user=createApp('user').listen(0);
 const token=role=>createToken({TenDangNhap:'qa_content',VaiTro:'NHAN_VIEN',MaNV:'NV000001',ChucVu:role});
 const call=async(server,path,method='GET',data,auth)=>{const response=await fetch('http://localhost:'+server.address().port+'/api'+path,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+auth}:{})},...(data?{body:JSON.stringify(data)}:{})});return {status:response.status,body:await response.json()};};
 const original=(await pool.request().query("SELECT NoiDung FROM WEB_NOI_DUNG WHERE Ma='partners'")).recordset[0];
 try{
 const sample=[{name:'Ẩn',sector:'QA',status:'Đang sử dụng',image:'',source:'',description:'',visible:false,order:0},{name:'Sau',sector:'QA',status:'Đã trải nghiệm',image:'',source:'https://mayphacafephin.com/',description:'An toàn <script>',visible:true,order:2},{name:'Trước',sector:'QA',status:'Đã trải nghiệm',image:'',source:'',description:'',visible:true,order:1}];
 assert.equal((await call(admin,'/cau-hinh-website/partners','PUT',{partners:sample})).status,401);
 assert.equal((await call(admin,'/cau-hinh-website/partners','PUT',{partners:sample},token('Bán hàng'))).status,403);
 assert.equal((await call(admin,'/cau-hinh-website/partners','PUT',{partners:sample},token('Quản lý'))).status,200);
 assert.deepEqual((await call(user,'/website/partners')).body.data.map(p=>p.name),['Trước','Sau']);
 for(const invalid of [{...sample[0],source:'javascript:alert(1)'},{...sample[0],image:'javascript:alert(1)'},{...sample[0],order:-1},{...sample[0],status:'Chưa xác nhận'},{...sample[0],name:''}])assert.equal((await call(admin,'/cau-hinh-website/partners','PUT',{partners:[invalid]},token('Quản lý'))).status,400);
 assert.equal((await call(admin,'/cau-hinh-website/partners')).status,401);
 const html=fs.readFileSync('User/Frontend/mua-hang.html','utf8');assert.equal((html.match(/data-slide aria-/g)||[]).length,4);assert.equal((html.match(/data-slide-to=/g)||[]).length,4);
 console.log('PASS: manager-only content writes, input validation, public visibility/order, persistence and four carousel slides.');
 }finally{if(original)await pool.request().input('Content',sql.NVarChar(sql.MAX),original.NoiDung).query("UPDATE WEB_NOI_DUNG SET NoiDung=@Content WHERE Ma='partners'");else await pool.request().query("DELETE FROM WEB_NOI_DUNG WHERE Ma='partners'");}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{admin?.close();user?.close();(await poolPromise).close();});
