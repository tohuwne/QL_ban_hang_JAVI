const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const JSZip=require('../node_modules/jszip'),ExcelJS=require('../node_modules/exceljs');
const workbook=require('../Admin/Backend/services/import-workbook');
const {schema}=require('../Admin/Backend/services/import-schema');
(async()=>{
 const source=new ExcelJS.Workbook();await source.xlsx.load(await workbook.template(schema['don-hang'],{}));
 source.getWorksheet('Nhap lieu').getRow(2).values=schema['don-hang'].columns.map(c=>({MaDH:'DON01',MaKH:'KH000001',MaNV:'NV000001',MaSP:'CFH31',SoLuong:1,GiamGiaSP:0,TrangThaiDonHang:'Chờ giao'}[c.key]??''));
 const bytes=Buffer.from(await source.xlsx.writeBuffer());
 const expected=await workbook.parse(bytes,schema['don-hang']);assert.equal(expected.length,1);
 const zip=await JSZip.loadAsync(bytes),namespace='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
 for(const entry of Object.values(zip.files))if(!entry.dir&&entry.name.endsWith('.xml')){
  let text=await entry.async('string');if(text.includes('xmlns="'+namespace+'"')){
   text=text.replace('xmlns="'+namespace+'"','xmlns:x="'+namespace+'"').replace(/<(\/?)([A-Za-z][\w.-]*)(?=[\s/>])/g,'<$1x:$2');zip.file(entry.name,text);
  }
 }
 for(const name of ['_rels/.rels','xl/_rels/workbook.xml.rels']){
  let text=await zip.file(name).async('string');
  text=text.replace(/Target="([^"/][^"]*)"/g,(_all,value)=>'Target="/'+(name.startsWith('xl/')?'xl/':'')+value+'"');
  zip.file(name,text);
 }
 // Irrelevant comments/metadata must not prevent reading the input sheet.
 zip.file('xl/comments/unneeded.xml','unreadable presentation metadata');
 const prefixed=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'});
 assert.deepEqual(await workbook.parse(prefixed,schema['don-hang']),expected);
 let failed=false;try{await new ExcelJS.Workbook().xlsx.load(prefixed);}catch(e){failed=true;}assert(failed,'Regression fixture should exercise the legacy-reader failure.');
 fs.mkdirSync('tests/.artifacts',{recursive:true});fs.writeFileSync('tests/.artifacts/don-hang-test-prefixed.xlsx',prefixed);
 fs.writeFileSync('tests/.artifacts/don-hang-test-standard.xlsx',bytes);
 const dateBook=new ExcelJS.Workbook();await dateBook.xlsx.load(await workbook.template(schema['ma-giam-gia'],{}));
 const row=schema['ma-giam-gia'].columns.map(c=>({MaGiamGia:'TEST',TenMaGiamGia:'Ưu đãi',LoaiGiam:'percent',GiaTri:10,DonToiThieu:0,BatDau:new Date('2026-10-18T00:00:00Z'),ChoPhepKetHop:'0',TrangThai:'Hoạt động'}[c.key]??''));
 dateBook.getWorksheet('Nhap lieu').getRow(2).values=row;
 const dates=await workbook.parse(Buffer.from(await dateBook.xlsx.writeBuffer()),schema['ma-giam-gia']);assert.equal(dates[0].values.BatDau,'2026-10-18');
 console.log('PASS: standard and namespace-prefixed XLSX, absolute relationships, irrelevant metadata, exact one-order values and Excel date cells.');
})().catch(e=>{console.error(e);process.exitCode=1;});
