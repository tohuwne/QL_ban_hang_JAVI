const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const ExcelJS=require('../node_modules/exceljs');
const workbook=require('../Admin/Backend/services/import-workbook');
const {schema}=require('../Admin/Backend/services/import-schema');
const {validate}=require('../Admin/Backend/services/import-validation');
(async()=>{
 fs.mkdirSync('tests/.artifacts',{recursive:true});
 const def=schema['loai-sp'],buffer=Buffer.from(await workbook.template(def,{}));
 const book=new ExcelJS.Workbook();await book.xlsx.load(buffer);book.getWorksheet('Nhap lieu').getRow(2).values=['CFH','Cà phê hạt mới'];const input=Buffer.from(await book.xlsx.writeBuffer());
 let exports,commits=0;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:960}});
 await context.addInitScript(()=>localStorage.setItem('currentUser',JSON.stringify({TenDangNhap:'admin_phat',VaiTro:'NHAN_VIEN',ChucVu:'Quản lý',AuthToken:'test'})));
 await context.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());if(url.hostname!=='javi.test')return route.abort();
  if(url.pathname.startsWith('/api/')){
   let data=[];
   if(url.pathname==='/api/loai-sp')data=[{MaLoaiSP:'CFH',TenLoaiSP:'Cà phê hạt'}];
   if(url.pathname.endsWith('/schema'))data={title:def.title,columns:def.columns,document:false,maxRows:500};
   if(url.pathname.endsWith('/template'))return route.fulfill({contentType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',body:buffer});
   if(url.pathname.endsWith('/preview')){const source=await workbook.parse(request.postDataBuffer(),def);const rows=validate(def,source,[{MaLoaiSP:'CFH',TenLoaiSP:'Cũ'}],{},url.searchParams.get('policy'));const valid=!rows.some(r=>r.errors.length);data={rows,valid,token:valid?'preview-token':null};}
   if(url.pathname.endsWith('/commit')){commits++;data={counts:{insert:0,update:1,skip:0}};}
   if(url.pathname.endsWith('/export')){exports=request.postDataJSON();return route.fulfill({contentType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',body:Buffer.from(await workbook.exportGrid('test',exports.columns,exports.rows))});}
   return route.fulfill({json:{success:true,data}});
  }
  const file=require('./frontend-path.cjs')(url.pathname);
  if(!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});
  return route.fulfill({body:fs.readFileSync(file),contentType:{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'}[path.extname(file)]||'application/octet-stream'});
 });
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://javi.test/admin/loai-sp.html');
 await page.locator('#dataTable tbody tr').filter({hasText:'CFH'}).waitFor();
 assert.equal((await page.locator('[data-file-import]').textContent()).trim(),'Nhập file');
 assert.equal((await page.locator('[data-file-export]').textContent()).trim(),'Xuất file');
 await page.screenshot({path:'tests/.artifacts/excel-file-menu.png',fullPage:true});
 const download=page.waitForEvent('download');await page.locator('[data-file-export]').click();await download;
 assert.equal(exports.rows.length,1);assert.equal(exports.columns.length,2);assert(exports.rows[0].includes('CFH'));
 await page.locator('[data-file-import]').click();
 await page.waitForURL('**/admin/import-loai-sp.html');const frame=page;
 assert.equal(page.frames().length,1);assert.equal(await page.locator('iframe').count(),0);
 await frame.locator('#importTitle').filter({hasText:'Loại sản phẩm'}).waitFor();
 const workspace=page.locator('.import-workspace');await workspace.evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
 const rect=await workspace.boundingBox();assert(rect.x>0&&rect.x<300);assert.equal(Math.round(rect.width+rect.x),1440);
 assert.equal(await page.locator('.import-help').count(),0);assert(await page.locator('#importMessage').isHidden());
 const templateDownload=page.waitForEvent('download');await page.locator('#downloadTemplate').click();assert.equal((await templateDownload).suggestedFilename(),'mau-loai-sp.xlsx');
 assert(await frame.locator('#commitImport').isDisabled());
 await frame.locator('#chooseFile').setInputFiles({name:'loai-sp.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:input});
 await frame.locator('#importPreview tbody tr').filter({hasText:'Bỏ qua'}).waitFor();
 assert.equal(await frame.locator('#importPreview thead th').first().textContent(),'STT');
 assert.equal(await frame.locator('#importPreview tbody tr td').first().textContent(),'1');
 await frame.locator('#duplicatePolicy').selectOption('update');await frame.locator('#importPreview tbody tr').filter({hasText:'Cập nhật'}).waitFor();
 assert(await frame.locator('#commitImport').isEnabled());
 book.getWorksheet('Nhap lieu').getCell('B2').value='';book.getWorksheet('Nhap lieu').getCell('A2').value='TOOLONG';
 await frame.locator('#chooseFile').setInputFiles({name:'loi.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(await book.xlsx.writeBuffer())});
 await frame.locator('.import-row-error').waitFor();assert(await frame.locator('#commitImport').isDisabled());assert.equal(commits,0);
 assert.equal(await frame.locator('td.import-cell-error').count(),2);
 assert.equal(await frame.locator('td[data-column="MaLoaiSP"]').getAttribute('aria-invalid'),'true');
 assert.equal(await frame.locator('td[data-column="TenLoaiSP"]').getAttribute('aria-invalid'),'true');
 assert((await frame.locator('td[data-column="MaLoaiSP"]').getAttribute('title')).includes('tối đa'));
 await page.screenshot({path:'tests/.artifacts/excel-import-errors.png',fullPage:true});
 await frame.locator('#chooseFile').setInputFiles({name:'loai-sp.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:input});
 await frame.locator('#commitImport:not([disabled])').waitFor();await frame.locator('#commitImport').click();
 assert.equal(await frame.locator('td.import-cell-error').count(),0);
 await frame.locator('#importMessage').filter({hasText:'Đã nhập thành công'}).waitFor();assert.equal(commits,1);assert(await frame.locator('#commitImport').isDisabled());
 await frame.locator('#closeImport').click();await page.waitForURL('**/admin/loai-sp.html');assert.equal(await page.locator('#importPreview').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS: file menu, XLSX export, separate import URL without iframe/help text, template download, duplicate dropdown, red-row lock, commit and return.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
