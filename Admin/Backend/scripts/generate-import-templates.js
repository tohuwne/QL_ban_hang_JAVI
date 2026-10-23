const path=require('path');
require('dotenv').config({path:path.join(__dirname,'../../../.env'),quiet:true});
const {poolPromise}=require('../../../Shared/Backend/config/database');
const {schema,importModules}=require('../services/import-schema');
const {lookups}=require('../services/import-store');
const {template}=require('../services/import-workbook');
const {writeTemplate}=require('../services/import-template-files');
(async()=>{
 const pool=await poolPromise;
 try{
  for(const [id,def] of Object.entries(schema)){
   if(!importModules.has(id))continue;
   const file=await writeTemplate(id,await template(def,await lookups(pool,def)));
   console.log(path.basename(file));
  }
  console.log('Đã tạo '+importModules.size+' file Excel mẫu danh mục và đơn hàng từ DB hiện tại.');
 }finally{await pool.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
