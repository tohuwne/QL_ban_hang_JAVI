const assert=require('assert/strict'),ExcelJS=require('../node_modules/exceljs');
const express=require('../node_modules/express');
const {schema}=require('../Admin/Backend/services/import-schema');
const workbook=require('../Admin/Backend/services/import-workbook');
let database=[{MaLoaiSP:'CFH',TenLoaiSP:'Cũ'}],commits=0,rollbacks=0;
class Tx{
 async begin(){this.data=structuredClone(database);}
 request(){return new Request(this);}
 async commit(){database=this.data;commits++;}
 async rollback(){rollbacks++;}
}
class Request{
 constructor(tx){this.tx=tx;this.values={};}
 input(key,type,value){this.values[key]=value;return this;}
 async query(text){const v=this.values;
  if(text.startsWith('SELECT * FROM LOAI_SAN_PHAM'))return {recordset:structuredClone(this.tx.data)};
  if(text.startsWith('INSERT INTO LOAI_SAN_PHAM')){
   if(v.TenLoaiSP==='DBFAIL')throw Error('Ràng buộc dữ liệu');
   this.tx.data.push({...v});return {recordset:[]};
  }
  if(text.startsWith('UPDATE LOAI_SAN_PHAM')){Object.assign(this.tx.data.find(r=>r.MaLoaiSP===v.MaLoaiSP),v);return {recordset:[]};}
  throw Error('Unexpected SQL: '+text);
 }
}
const dbPath=require.resolve('../Shared/Backend/config/database');
require.cache[dbPath]={id:dbPath,filename:dbPath,loaded:true,exports:{sql:{Transaction:Tx,ISOLATION_LEVEL:{SERIALIZABLE:4},NVarChar:()=>null,Decimal:()=>null,MAX:999},poolPromise:Promise.resolve({})}};
const {createToken}=require('../Shared/Backend/middleware/auth');
const app=express();app.use(express.json());app.use('/api',require('../Admin/Backend/routes/excel'));
const token=createToken({TenDangNhap:'manager',VaiTro:'NHAN_VIEN',ChucVu:'Quản lý'});
async function buffer(rows){const book=new ExcelJS.Workbook();await book.xlsx.load(await workbook.template(schema['loai-sp'],{}));for(let i=0;i<rows.length;i++)book.getWorksheet('Nhap lieu').getRow(i+2).values=rows[i];return Buffer.from(await book.xlsx.writeBuffer());}
(async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.on('listening',r));
 const base='http://127.0.0.1:'+server.address().port+'/api/excel/';
 const call=async(path,body,bearer=token)=>{const response=await fetch(base+path,{method:'POST',headers:{Authorization:'Bearer '+bearer,'Content-Type':Buffer.isBuffer(body)?'application/octet-stream':'application/json'},body:Buffer.isBuffer(body)?body:JSON.stringify(body)});return {status:response.status,...await response.json()};};
 try{
  let result=await call('loai-sp/preview?policy=skip',await buffer([['NEW','Mới']]));assert.equal(result.data.valid,true);assert.equal(database.length,1);assert.equal(commits,0);assert(rollbacks>0);
  const ticket=result.data.token;
  result=await call('loai-sp/commit',{token:ticket});assert(result.success);assert.equal(database.length,2);assert.equal(commits,1);
  result=await call('loai-sp/commit',{token:ticket});assert(result.success);assert.equal(commits,1);
  result=await call('loai-sp/preview?policy=update',await buffer([['CFH','Cập nhật']]));const stale=result.data.token;database[0].TenLoaiSP='Người khác sửa';
  result=await call('loai-sp/commit',{token:stale});assert.equal(result.status,409);assert.equal(database[0].TenLoaiSP,'Người khác sửa');
  result=await call('loai-sp/preview?policy=skip',await buffer([['N01','Hợp lệ'],['N02','DBFAIL']]));assert.equal(result.data.valid,false);assert(result.data.rows[1].errors.length);assert(!database.some(r=>r.MaLoaiSP==='N01'));assert.equal(commits,1);
  result=await call('loai-sp/preview?policy=skip',await buffer([['LONG','']]));assert.equal(result.data.valid,false);assert.equal(result.data.token,null);
  assert.deepEqual(Object.keys(result.data.rows[0].cellErrors).sort(),['MaLoaiSP','TenLoaiSP']);
  const customer=createToken({TenDangNhap:'customer',VaiTro:'KHACH_HANG'});
  result=await call('loai-sp/export',{columns:['Mã'],rows:[['CFH']]},customer);assert.equal(result.status,403);
  const staff=createToken({TenDangNhap:'sales',VaiTro:'NHAN_VIEN',ChucVu:'Bán hàng'});
  result=await call('san-pham/preview',Buffer.from('bad'),staff);assert.equal(result.status,403);
  result=await call('loai-sp/commit',{token:ticket},staff);assert.equal(result.status,400);
  result=await call('loai-sp/preview?policy=evil',Buffer.from('bad'));assert.equal(result.status,400);
  for(const id of ['hoa-don','nhap-kho','xuat-kho','phieu-thu','phieu-chi','nhan-vien','ton-kho']){
   result=await call(id+'/preview',Buffer.from('bad'));assert.equal(result.status,403,id);
   result=await call(id+'/commit',{token:ticket});assert.equal(result.status,403,id);
  }
  console.log('PASS: API authorization, preview rollback, all-or-nothing validation, commit idempotency, stale-data rejection and invalid policy.');
 }finally{await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
