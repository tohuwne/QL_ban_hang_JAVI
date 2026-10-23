const express=require('express'),crypto=require('crypto');
const router=express.Router();
const {authenticate,authorizeApi}=require('../../../Shared/Backend/middleware/auth');
const {sql,poolPromise}=require('../../../Shared/Backend/config/database');
const {schema,importModules}=require('../services/import-schema');
const workbook=require('../services/import-workbook');
const {writeTemplate}=require('../services/import-template-files');
const {validate,groups,addError}=require('../services/import-validation');
const store=require('../services/import-store');
const previews=new Map();
const reportPages=new Set(['ton-kho','cong-no','dashboard','ban-hang','cau-hinh-website','quan-tri']);
const wrap=fn=>async(req,res)=>{try{await fn(req,res);}catch(e){res.status(e.status||400).json({success:false,message:e.message});}};
function permission(req,res,next){
 if(req.user.vaiTro!=='NHAN_VIEN')return res.status(403).json({success:false,message:'Chức năng nhập/xuất dành cho nhân viên được cấp quyền.'});
 const id=req.params.module,def=Object.hasOwn(schema,id)?schema[id]:null;
 if(!def&&!reportPages.has(id))return res.status(404).json({success:false,message:'Phân hệ không tồn tại.'});
 const exporting=req.path.endsWith('/export');
 if(!exporting&&!importModules.has(id))return res.status(403).json({success:false,message:'Chỉ Danh mục và Đơn hàng được nhập file. Phân hệ này chỉ hỗ trợ xuất file.'});
 if(!def&&!exporting)return res.status(400).json({success:false,message:'Phân hệ tổng hợp chỉ xuất Excel; dữ liệu phát sinh từ chứng từ.'});
 const role=req.user.chucVu;
 if(!exporting&&((id==='san-pham'&&['Bán hàng','Kho'].includes(role))||(id==='nhan-vien'&&role!=='Quản lý')))return res.status(403).json({success:false,message:'Bạn chỉ có quyền xem phân hệ này.'});
 const page=def?.page||id;
 const mapped=['ma-giam-gia','dia-diem-van-chuyen','cau-hinh-website'].includes(page)?'cau-hinh-website':page==='ton-kho'?'san-pham':page==='ban-hang'?'don-hang':page;
 authorizeApi({user:req.user,path:'/'+mapped,method:exporting?'GET':'POST',body:{}},res,next);
}
const sendFile=(res,buffer,name)=>{res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').set('Content-Disposition','attachment; filename="'+name+'.xlsx"').send(Buffer.from(buffer));};
function prune(){const now=Date.now();for(const [id,p] of previews)if(p.expires<now&&!p.running)previews.delete(id);}
const publicRows=rows=>rows.map(({line,values,errors,cellErrors,action})=>({line,values,errors,cellErrors,action}));
function databaseFields(def,error){
 if(error.fields)return error.fields;
 const explicit=def.columns.filter(c=>new RegExp('\\b'+c.key+'\\b','i').test(error.message)).map(c=>c.key);
 if(explicit.length)return explicit;
 const number=error.number||error.originalError?.info?.number;
 if([2601,2627].includes(number))return [def.table==='NHAN_VIEN'?'CCCD':def.key];
 if(def.coupon&&[50011,50012].includes(number))return ['SoLuong'];
 return [];
}
async function processRows(def,source,policy,commit,expected){
 const tx=new sql.Transaction(await poolPromise);let open=false,rows;
 try{
  await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);open=true;
  // All SQL identifiers originate in the fixed registry, never the uploaded workbook.
  const existing=await store.query(tx,`SELECT * FROM ${def.table} WITH(UPDLOCK,HOLDLOCK)`);
  rows=validate(def,structuredClone(source),existing,await store.lookups(tx,def),policy);
  const fingerprint=crypto.createHash('sha256').update(JSON.stringify(rows.map(r=>({line:r.line,action:r.action,old:r.old||null,customer:r.customerSnapshot||null})))).digest('hex');
  if(expected&&expected!==fingerprint){await tx.rollback();open=false;return {rows:rows.map(r=>({...r,errors:[...r.errors,'Dữ liệu trong database đã thay đổi sau khi xem trước. Hãy kiểm tra lại file.']})),valid:false};}
  const batches=groups(def,rows);
  if(rows.some(r=>r.errors.length)){await tx.rollback();open=false;return {rows,valid:false};}
  const context={createdCustomers:new Map()};
  for(const group of batches){try{await store.save(tx,def,group,context);}catch(e){for(const row of group)if(!e.productId||row.data.MaSP===e.productId)addError(row,databaseFields(def,e),'Không thể lưu: '+e.message);throw e;}}
  if(commit)await tx.commit();else await tx.rollback();open=false;
  return {rows,valid:true,fingerprint,counts:{insert:rows.filter(r=>r.action==='insert').length,update:rows.filter(r=>r.action==='update').length,skip:rows.filter(r=>r.action==='skip').length,documents:def.document?batches.length:undefined}};
 }catch(e){if(open)try{await tx.rollback();}catch(_){}if(rows?.some(r=>r.errors.length))return {rows,valid:false};throw e;}
}
router.use('/excel',authenticate);
router.get('/excel/:module/schema',permission,wrap(async(req,res)=>{
 const def=schema[req.params.module];res.json({success:true,data:{title:def.title,columns:def.columns.map(c=>({key:c.key,label:c.label,required:c.required,secret:c.secret,newCustomer:c.newCustomer})),document:!!def.document,maxRows:workbook.MAX_ROWS}});
}));
router.get('/excel/:module/template',permission,wrap(async(req,res)=>{
 const id=req.params.module,def=schema[id],buffer=await workbook.template(def,await store.lookups(await poolPromise,def));
 await writeTemplate(id,buffer);sendFile(res,buffer,'mau-'+id);
}));
router.post('/excel/:module/preview',permission,express.raw({type:'application/octet-stream',limit:'5mb'}),wrap(async(req,res)=>{
 prune();if(previews.size>=200)throw Error('Hệ thống đang xử lý nhiều file, vui lòng thử lại sau.');
 const policy=req.query.policy||'skip';if(!['skip','update'].includes(policy))throw Error('Lựa chọn xử lý trùng không hợp lệ.');
 if(!Buffer.isBuffer(req.body))throw Error('Gửi file .xlsx hợp lệ.');
 const def=schema[req.params.module],source=await workbook.parse(req.body,def);
 source.forEach(r=>{r.parseErrors=[...r.errors];r.parseCellErrors=structuredClone(r.cellErrors||{});});
 const result=await processRows(def,source,policy,false);
 const token=result.valid?crypto.randomBytes(24).toString('hex'):null;
 if(token)previews.set(token,{source,policy,fingerprint:result.fingerprint,module:req.params.module,user:req.user.sub,expires:Date.now()+15*60000,running:false});
 res.json({success:true,data:{...result,rows:publicRows(result.rows),token}});
}));
router.post('/excel/:module/commit',permission,wrap(async(req,res)=>{
 prune();const p=previews.get(req.body.token);
 if(!p||p.user!==req.user.sub||p.module!==req.params.module)throw Error('Bản xem trước hết hạn hoặc không hợp lệ. Vui lòng kiểm tra lại file.');
 if(p.result)return res.json({success:true,data:p.result});
 if(p.running)throw Error('File này đang được nhập.');p.running=true;
 try{
  const result=await processRows(schema[p.module],p.source,p.policy,true,p.fingerprint);
  if(!result.valid){previews.delete(req.body.token);return res.status(409).json({success:false,message:'Dữ liệu đã thay đổi hoặc không còn hợp lệ. Chưa lưu dòng nào. Kiểm tra lại file.',data:{rows:publicRows(result.rows)}});}
  p.result={counts:result.counts};res.json({success:true,data:p.result});
 }finally{p.running=false;}
}));
router.post('/excel/:module/export',permission,wrap(async(req,res)=>{
 const {columns,rows}=req.body;
 if(!Array.isArray(columns)||!columns.length||columns.length>80||columns.some(c=>typeof c!=='string'||c.length>200)||!Array.isArray(rows)||rows.length>10000||rows.some(r=>!Array.isArray(r)||r.length!==columns.length||r.some(v=>typeof v!=='string'||v.length>32000)))throw Error('Lưới xuất không hợp lệ hoặc quá lớn. Tối đa 10.000 dòng.');
 sendFile(res,await workbook.exportGrid(req.params.module,columns,rows),'danh-sach-'+req.params.module);
}));
module.exports=router;
