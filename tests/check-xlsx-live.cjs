const fs=require('fs'),path=require('path'),assert=require('assert/strict');
require('../node_modules/dotenv').config({path:path.join(__dirname,'../.env'),quiet:true});
const {createToken}=require('../Shared/Backend/middleware/auth');
const {chromium}=require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:960}});
  const token=createToken({TenDangNhap:'admin_phat',VaiTro:'NHAN_VIEN',ChucVu:'Quản lý'});
  await context.addInitScript(token=>localStorage.setItem('currentUser',JSON.stringify({TenDangNhap:'admin_phat',VaiTro:'NHAN_VIEN',ChucVu:'Quản lý',AuthToken:token})),token);
  const page=await context.newPage();await page.goto('http://localhost:3000/admin/import-don-hang.html');await page.locator('#downloadTemplate:not([disabled])').waitFor();
  for(const file of ['tests/.artifacts/don-hang-test-prefixed.xlsx','tests/.artifacts/don-hang-test-standard.xlsx']){
   await page.locator('#chooseFile').setInputFiles(path.resolve(file));
   await page.locator('#commitImport:not([disabled])').waitFor();
   assert.equal(await page.locator('#importPreview tbody tr').count(),1);assert.equal(await page.locator('.import-row-error').count(),0);
   assert((await page.locator('#importPreview tbody').innerText()).includes('CFH31'));assert(await page.locator('#importMessage').isHidden());
  }
  await page.screenshot({path:'tests/.artifacts/order-import-ready.png',fullPage:true});
  console.log('PASS: selecting both prefixed and standard sample XLSX in the live browser shows 1 valid order and enables Import. No commit.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
