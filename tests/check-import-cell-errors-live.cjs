const path=require('path'),assert=require('assert/strict');
require('../node_modules/dotenv').config({path:path.join(__dirname,'../.env'),quiet:true});
const {createToken}=require('../Shared/Backend/middleware/auth');
const ExcelJS=require('../node_modules/exceljs');
const {schema}=require('../Admin/Backend/services/import-schema');
const {chromium}=require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:960}});
  const token=createToken({TenDangNhap:'admin_phat',VaiTro:'NHAN_VIEN',ChucVu:'Quản lý'});
  await context.addInitScript(token=>localStorage.setItem('currentUser',JSON.stringify({TenDangNhap:'admin_phat',VaiTro:'NHAN_VIEN',ChucVu:'Quản lý',AuthToken:token})),token);
  const page=await context.newPage();await page.goto('http://localhost:3000/admin/import-don-hang.html');await page.locator('#downloadTemplate:not([disabled])').waitFor();
  const values={MaDH:'DON01',MaKH:'KH000001',MaNV:'NV000001',MaSP:'CFH31',SoLuong:1,GiamGiaSP:0,TrangThaiDonHang:'Chờ giao'};
  async function upload(extra){
   const book=new ExcelJS.Workbook(),sheet=book.addWorksheet('Nhap lieu');
   sheet.addRow(schema['don-hang'].columns.map(c=>c.label+(c.required?' *':'')));
   sheet.addRow(schema['don-hang'].columns.map(c=>({...values,...extra})[c.key]??''));
   await page.locator('#chooseFile').setInputFiles({name:'cell-test.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(await book.xlsx.writeBuffer())});
  }
  await upload({EmailKH:'bad-email'});
  await page.locator('td[data-column="EmailKH"].import-cell-error').waitFor().catch(async error=>{console.error(await page.locator('#importMessage').innerText(),await page.locator('#importPreview tbody').innerText());throw error;});
  assert.equal(await page.locator('td.import-cell-error').count(),1);
  assert.equal(await page.locator('td[data-column="MaKH"].import-cell-error').count(),0);
  assert.match(await page.locator('td[data-column="EmailKH"]').getAttribute('title'),/email/i);
  assert(await page.locator('#commitImport').isDisabled());
  await page.screenshot({path:'tests/.artifacts/import-cell-error-live.png',fullPage:true});
  await upload({});await page.locator('#commitImport:not([disabled])').waitFor();
  assert.equal(await page.locator('td.import-cell-error').count(),0);
  console.log('PASS: live order import colors only the invalid email cell, reveals its column, blocks import, and clears errors after a valid upload. No commit.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
