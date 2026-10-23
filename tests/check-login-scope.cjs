const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const bcrypt=require('bcryptjs');
const routes={},router={post:(path,...handlers)=>routes[path]=handlers.at(-1),get(){}};
let account=null,issued=0,writes=0;
const pool={request(){return {input(){return this;},async query(query){if(/UPDATE TAI_KHOAN SET MatKhau/.test(query))writes++;return {recordset:query.includes('FROM TAI_KHOAN')&&account?[account]:[]};}};}};
const context={module:{exports:{}},process:{env:{GOOGLE_CLIENT_ID:'test-google-client'}},console,
 fetch:async()=>({ok:true,json:async()=>({aud:'test-google-client',email_verified:'true',sub:'test-sub',email:'test@example.test'})}),
 require:id=>{
  if(id==='express')return {Router:()=>router};
  if(id==='bcryptjs')return bcrypt;
  if(id==='../config/database')return {sql:{VarChar(){},NVarChar(){},Char(){}},poolPromise:Promise.resolve(pool)};
  if(id==='../middleware/auth')return {createToken:()=>{issued++;return 'test-only-token';}};
  throw Error(id);
 }};
vm.createContext(context);vm.runInContext(fs.readFileSync('Shared/Backend/routes/auth.js','utf8'),context);
async function login(path,mode,body={}){
 issued=0;writes=0;
 return new Promise((resolve,reject)=>{
  const res={statusCode:200,status(code){this.statusCode=code;return this;},json(data){resolve({status:this.statusCode,...data});}};
  Promise.resolve(routes[path]({app:{locals:{loginMode:mode}},body:{TenDangNhap:'test',MatKhau:'test-secret',credential:'test-google',username:'test',fullName:'Test',phone:'0900000000',...body}},res)).catch(reject);
 });
}
(async()=>{
 const password=await bcrypt.hash('test-secret',4);
 const employee={TenDangNhap:'test',VaiTro:'NHAN_VIEN',MaNV:'NV000001',MatKhau:password,TrangThai:'Đang làm việc'};
 const customer={TenDangNhap:'test',VaiTro:'KHACH_HANG',MaKH:'KH000001',MatKhau:password};
 for(const path of ['/login','/google','/google/register']){
  account=employee;
  for(const clientMode of [undefined,'customer','admin']){const r=await login(path,'customer',{loginMode:clientMode});assert.equal(r.status,403);assert.equal(r.message,'Không tìm thấy tài khoản.');assert(!r.data);assert.equal(issued,0);assert.equal(writes,0);}
  let r=await login(path,'admin',{loginMode:'customer'});assert.equal(r.success,true);assert.equal(issued,1);
  account=customer;r=await login(path,'customer');assert.equal(r.success,true);assert.equal(issued,1);
  r=await login(path,'admin',{loginMode:'customer'});assert.equal(r.status,403);assert.equal(issued,0);
 }
 account=employee;let r=await login('/login','admin',{MatKhau:'wrong'});assert.equal(r.status,401);assert.equal(issued,0);
 account={...employee,TrangThai:'Đã nghỉ việc'};r=await login('/login','admin');assert.equal(r.status,403);assert.equal(issued,0);
 account={...customer,MaNV:'NV000001'};r=await login('/login','customer');assert.equal(r.status,403);assert.equal(issued,0);
 const source=fs.readFileSync('User/Frontend/login.html','utf8'),start=source.indexOf('  const saveAndRedirect ='),end=source.indexOf('  const showMessage =',start);
 for(const adminLogin of [false,true]){
  const saved=[],location={search:'',href:''},frontend={adminLogin,localStorage:{setItem:(...args)=>saved.push(args)},location,window:{location},URLSearchParams,Date};
  vm.createContext(frontend);vm.runInContext(source.slice(start,end)+'\nthis.save=saveAndRedirect;',frontend);
  assert.throws(()=>frontend.save(adminLogin?customer:employee));assert.equal(saved.length,0);assert.equal(location.href,'');
  frontend.save(adminLogin?employee:customer);assert.equal(saved[0][0],'currentUser');assert.equal(location.href,adminLogin?'/admin/dashboard.html':'/landing_page/mua-hang.html');
 }
 console.log('PASS: password/Google login obey server scope, reject spoofed modes without issuing tokens, preserve admin/customer login, wrong-password/locked checks and frontend session guard.');
})().catch(err=>{console.error(err);process.exitCode=1;});
