const fs=require('fs/promises'),path=require('path');
const {schema}=require('./import-schema');
const directory=path.join(__dirname,'../templates/import');
async function writeTemplate(id,buffer){
 if(!Object.hasOwn(schema,id))throw Error('Phân hệ không hợp lệ.');
 await fs.mkdir(directory,{recursive:true});
 const target=path.join(directory,'mau-'+id+'.xlsx');
 await fs.writeFile(target,Buffer.from(buffer));
 return target;
}
module.exports={writeTemplate,directory};
