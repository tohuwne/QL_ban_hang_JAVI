const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function makeRouter(){const routes={};const router={use(){},get(path,...f){routes['GET '+path]=f.at(-1);},post(path,...f){routes['POST '+path]=f.at(-1);},put(path,...f){routes['PUT '+path]=f.at(-1);},delete(){}};return {router,routes};}
const sql={VarChar:()=>{},NVarChar:()=>{},Char:()=>{},Int:{},Decimal:()=>{},Bit:{},DateTime2:{}};
let calls=[],valid=true,duplicateWrites=0;
const pool={request(){const inputs={};return {input(k,t,v){inputs[k]=v;return this;},async query(query){assert(!query.includes('pool.request'),'SQL accidentally contains JavaScript');calls.push({query,inputs});if(query.includes('INSERT INTO WEB_MA_GIAM_GIA')&&duplicateWrites>0){duplicateWrites--;const e=new Error('duplicate');e.number=2627;throw e;}let recordset=[];if(query.startsWith('SELECT m.*,(SELECT COUNT'))recordset=valid?[{MaGiamGia:'JAVI10',SoLuong:null,SoLuotDaTinh:0}]:[];else if(query.includes('SELECT tk.TenDangNhap'))recordset=[{TenDangNhap:'owner',MaKH:'KH000001',TenKH:'Khách hàng'}];else if(query.startsWith('SELECT COUNT(*) AS SoDonHang'))recordset=[{SoDonHang:2}];else if(query.includes('SELECT m.MaGiamGia'))recordset=valid?[{MaGiamGia:'JAVI10'}]:[];return {recordset};}};}};
const {router,routes}=makeRouter(),moduleStub={exports:{}};
const dependencies={express:{Router:()=>router,raw:()=>()=>{}},'../../../Shared/Backend/config/database':{sql,poolPromise:Promise.resolve(pool)},'../../../Shared/Backend/middleware/auth':{authenticate(){},authorizeApi(){}},'../../../Shared/Backend/services/order-email':{},'../../../Shared/Backend/services/pos-pricing':{},'../../../Shared/Backend/services/checkout-pricing':{}};
dependencies['../../../Shared/Backend/services/product-options']={};
dependencies['../../../Shared/Backend/services/article-source']={};
dependencies['../../../Shared/Backend/services/website-common']=require('../Shared/Backend/services/website-common');
vm.runInNewContext(fs.readFileSync('User/Backend/routes/website.js','utf8'),{module:moduleStub,exports:moduleStub.exports,require:id=>{if(!(id in dependencies))throw Error(id);return dependencies[id];},console});
function invoke(method,path,{role='KHACH_HANG',body={},query={}}={}){calls=[];return new Promise((resolve,reject)=>{const res={statusCode:200,status(code){this.statusCode=code;return this;},json(result){resolve({status:this.statusCode,...result});}};try{routes[method+' '+path]({user:{sub:'owner',vaiTro:role,maKH:'KH000001'},body,query},res);}catch(e){reject(e);}});}
(async()=>{
 let r=await invoke('GET','/website/account');assert.equal(r.success,true);assert.equal(r.data.profile.MaKH,'KH000001');assert(calls.filter(c=>c.inputs.User).every(c=>c.inputs.User==='owner'));
 r=await invoke('GET','/website/account/orders',{query:{page:2}});assert.equal(r.success,true);assert.equal(calls[0].inputs.Offset,10);assert.equal(calls[0].inputs.User,'owner');assert(calls[0].query.includes('WHERE tk.TenDangNhap=@User'));
 r=await invoke('GET','/website/account/orders',{query:{page:-1}});assert.equal(r.status,400);
 r=await invoke('GET','/website/account',{role:'NHAN_VIEN'});assert.equal(r.status,403);assert.equal(calls.length,0);
 r=await invoke('POST','/website/account/coupons',{body:{code:'javi10',TenDangNhap:'victim'}});assert.equal(r.success,true);assert.equal(calls.at(-1).inputs.User,'owner');assert.equal(calls.at(-1).inputs.Code,'JAVI10');assert(calls.at(-1).query.includes('NOT EXISTS'));assert(calls.at(-1).query.includes('UPDLOCK,HOLDLOCK'));assert(!calls[0].query.includes('BatDau<=SYSUTCDATETIME()'),'Future active codes must be saveable');
 valid=false;r=await invoke('POST','/website/account/coupons',{body:{code:'EXPIRED'}});assert.equal(r.status,400);assert(!calls.some(c=>c.query.includes('INSERT')));
 r=await invoke('POST','/website/account/coupons',{body:{code:"bad'code"}});assert.equal(r.status,400);assert.equal(calls.length,0);
 const config=makeRouter();vm.runInNewContext(fs.readFileSync('Admin/Backend/routes/commerce-config.js','utf8'),{module:{exports:{}},require:id=>id==='express'?{Router:()=>config.router}:id==='crypto'?require('crypto'):dependencies[id],console});
 const save=body=>{calls=[];return new Promise(resolve=>{const res={statusCode:200,status(n){this.statusCode=n;return this;},json(result){resolve({status:this.statusCode,...result});}};config.routes['PUT /cau-hinh-website/commerce/coupon']({body},res);});};
 const body={create:true,code:'CLIENT-CODE',title:'Ưu đãi cuối tuần',description:'Thử mã',kind:'percent',value:10,minimum:200000,maximum:50000,start:'2026-01-01T00:00:00Z',end:'',active:true};
 r=await save(body);assert.equal(r.success,true);assert(/^[A-Z0-9]{6}$/.test(r.data.code));assert.notEqual(r.data.code,body.code);assert.equal(calls[0].inputs.Create,true);assert.equal(calls[0].inputs.Code,r.data.code);
 assert.equal(calls[0].inputs.Start,'2026-01-01T00:00:00.000Z');assert.equal(calls[0].inputs.End,null);assert(calls[0].query.includes('CONVERT(datetime2,@End,127)'));
 r=await save({...body,end:'2026-02-01T00:00:00Z'});assert.equal(r.success,true);assert.equal(calls[0].inputs.End,'2026-02-01T00:00:00.000Z');
 r=await save({...body,create:false,code:'JAVI10'});assert.equal(r.data.code,'JAVI10');assert.equal(calls[0].inputs.Create,false);
 r=await save({...body,autoCode:false,code:'summer10'});assert.equal(r.success,true);assert.equal(r.data.code,'SUMMER10');duplicateWrites=1;r=await save({...body,autoCode:false,code:'SUMMER10'});assert.equal(r.status,409);assert(r.message.includes('đã tồn tại'));duplicateWrites=1;r=await save({...body,autoCode:true});assert.equal(r.success,true);assert.equal(calls.length,2);assert.notEqual(calls[0].inputs.Code,calls[1].inputs.Code);r=await save({...body,autoCode:false,code:''});assert.equal(r.status,400);
 r=await save({...body,value:101});assert.equal(r.status,400);
 console.log('PASS: account scoping, order pagination, customer-only access, coupon validation and owner-only duplicate-safe saving');
})().catch(e=>{console.error(e);process.exitCode=1;});
