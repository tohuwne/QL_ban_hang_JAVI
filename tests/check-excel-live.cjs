// Regression for the actual app server: navigation + XLSX upload preview, never commit.
const assert=require('assert/strict'),path=require('path'),fs=require('fs');
require('../node_modules/dotenv').config({path:path.join(__dirname,'../.env'),quiet:true});
const {createToken}=require('../Shared/Backend/middleware/auth');
const {schema,importModules}=require('../Admin/Backend/services/import-schema');
const ExcelJS=require('../node_modules/exceljs');
const {chromium}=require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const token=createToken({TenDangNhap:'admin_phat',VaiTro:'NHAN_VIEN',ChucVu:'Quản lý'});
 for(const id of Object.keys(schema)){
  const response=await fetch('http://localhost:3000/api/excel/'+id+'/schema',{headers:{Authorization:'Bearer '+token}});
  assert.equal(response.status,importModules.has(id)?200:403,id);assert(response.headers.get('content-type').includes('application/json'));const result=await response.json();if(importModules.has(id))assert.equal(result.data.columns.length,schema[id].columns.length,id);
 }
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:960}});
  await context.addInitScript(token=>localStorage.setItem('currentUser',JSON.stringify({TenDangNhap:'admin_phat',VaiTro:'NHAN_VIEN',ChucVu:'Quản lý',AuthToken:token})),token);
  const page=await context.newPage();await page.goto('http://localhost:3000/admin/don-hang.html');
  await page.locator('[data-file-import]').waitFor({state:'attached'});
  const add=page.getByRole('button',{name:'Lên Đơn Hàng Mới'}),addBox=await add.boundingBox(),fileBox=await page.locator('.grid-file-menu').boundingBox();assert(fileBox.x-addBox.x-addBox.width<=12);assert(Math.abs(fileBox.y-addBox.y)<5);
  await add.click();await page.waitForURL('**/admin/ban-hang.html');assert.equal(await page.locator('.grid-file-menu').count(),0);
  await page.goto('http://localhost:3000/admin/nhan-vien.html');await page.locator('.grid-file-menu [data-file-export]').waitFor();assert.equal(await page.locator('[data-file-import]').count(),0);
  await page.goto('http://localhost:3000/admin/import-hoa-don.html');await page.waitForURL('**/admin/hoa-don.html');
  await page.goto('http://localhost:3000/admin/import-don-hang.html');await page.locator('#importPreview th').first().waitFor();
  assert(await page.locator('#downloadTemplate').isEnabled());assert.equal(await page.locator('#importPreview th:visible').filter({hasText:'KH mới'}).count(),0);
  const orderDownload=page.waitForEvent('download');await page.locator('#downloadTemplate').click();const orderFile=await orderDownload;
  const orderBook=new ExcelJS.Workbook();await orderBook.xlsx.readFile(await orderFile.path());orderBook.getWorksheet('Nhap lieu').getCell(2,1).value='DON01';
  await page.locator('#chooseFile').setInputFiles({name:'don-hang-kh-moi.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(await orderBook.xlsx.writeBuffer())});
  await page.locator('.import-row-error').waitFor();assert(await page.locator('#importPreview th:visible').filter({hasText:'KH mới'}).count()>0);assert(await page.locator('#commitImport').isDisabled());
  await page.goto('http://localhost:3000/admin/dia-diem-van-chuyen.html');
  for(const tab of ['tabProvince','tabWard','tabShipping']){
   await page.locator('#'+tab).click();const toolbar=page.locator('.web-tab-panel:not([hidden]) .directory-toolbar');
   try{await toolbar.locator('.grid-file-menu').waitFor({timeout:5000});}catch(e){await page.screenshot({path:'tests/.artifacts/location-file-menu-error.png',fullPage:true});console.log('Tab:',tab,await page.locator('.grid-file-menu').evaluateAll(nodes=>nodes.map(n=>({parent:n.parentElement.outerHTML.slice(0,180),display:getComputedStyle(n).display}))));throw e;}
   const addRect=await toolbar.locator('button.btn').first().boundingBox(),fileRect=await toolbar.locator('.grid-file-menu').boundingBox();assert(fileRect.x-addRect.x-addRect.width<=14);
  }
  await page.goto('http://localhost:3000/admin/loai-sp.html');
  await page.getByRole('button',{name:/Nhập \/ Xuất file/}).click();await page.locator('[data-file-import]').click();
  await page.waitForURL('**/admin/import-loai-sp.html');await page.locator('#importPreview th').first().waitFor();assert.equal(page.frames().length,1);
  assert(await page.locator('#downloadTemplate').isEnabled());assert.equal(await page.locator('.import-help').count(),0);
  const pending=page.waitForEvent('download');await page.locator('#downloadTemplate').click();const download=await pending;
  const book=new ExcelJS.Workbook();await book.xlsx.readFile(await download.path());
  book.getWorksheet('Nhap lieu').getCell('A2').value='TOOLONG';
  await page.locator('#chooseFile').setInputFiles({name:'kiem-tra.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(await book.xlsx.writeBuffer())});
  await page.locator('.import-row-error').waitFor();assert(await page.locator('#commitImport').isDisabled());assert(!await page.locator('#importMessage').textContent().then(s=>s.includes('Unexpected token')));
  fs.mkdirSync('tests/.artifacts',{recursive:true});await page.screenshot({path:'tests/.artifacts/excel-import-live.png',fullPage:true});
  await page.locator('#closeImport').click();await page.waitForURL('**/admin/loai-sp.html');
  console.log('PASS: order import enabled, file menu beside Add, no file buttons on POS, other documents/users export only, templates and validation work. No commit.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
