// Update the four approved coffee image references without changing prices or stock.
const fs=require('fs');require('dotenv').config({quiet:true});const {sql,poolPromise}=require('../Shared/Backend/config/database');
const mapping={CFH31:'javi-dam-manh-v2.png',CFH41:'javi-dam-ngot-v2.png',CFH71:'javi-can-bang-v2.png',CFH81:'javi-thom-ngot-v2.png'};
(async()=>{for(const file of Object.values(mapping))if(!fs.existsSync('Shared/Frontend/images/products/'+file))throw Error('Missing asset '+file);
const pool=await poolPromise,tx=new sql.Transaction(pool);await tx.begin();try{const before=(await tx.request().query("SELECT s.MaSP,s.TenSP,s.AnhSP,w.HinhAnh,s.GiaBan,s.SoLuongTon,s.SoLuongKD FROM SAN_PHAM s LEFT JOIN WEB_SAN_PHAM w ON w.MaSP=s.MaSP WHERE s.MaSP IN('CFH31','CFH41','CFH71','CFH81')")).recordset;if(before.length!==4)throw Error('Expected four coffee products');
fs.mkdirSync('outputs/product-images',{recursive:true});fs.writeFileSync('outputs/product-images/before-'+Date.now()+'.json',JSON.stringify(before,null,2));
for(const [id,file] of Object.entries(mapping)){await tx.request().input('ID',sql.Char(5),id).input('File',sql.VarChar(255),file).input('Path',sql.NVarChar(512),'/images/products/'+file).query('UPDATE SAN_PHAM SET AnhSP=@File WHERE MaSP=@ID; UPDATE WEB_SAN_PHAM SET HinhAnh=@Path WHERE MaSP=@ID;');}
await tx.commit();console.log('Updated coffee images:',Object.keys(mapping).join(', '));}catch(e){await tx.rollback();throw e;}finally{await pool.close();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
