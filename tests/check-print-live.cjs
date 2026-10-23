const fs=require('fs'),assert=require('assert/strict');
require('../node_modules/dotenv').config({path:'.env',quiet:true});
const {createToken}=require('../Shared/Backend/middleware/auth');
const {chromium}=require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
fs.mkdirSync('tests/.artifacts/print/live',{recursive:true});
(async()=>{
 const token=createToken({TenDangNhap:'admin_phat',VaiTro:'NHAN_VIEN',ChucVu:'Quản lý'});
 const api=async endpoint=>{const response=await fetch('http://localhost:3000/api/'+endpoint,{headers:{Authorization:'Bearer '+token}});const result=await response.json();assert(result.success,endpoint);return result.data;};
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1000,height:1200}});
  await context.addInitScript(token=>{
   try{localStorage.setItem('currentUser',JSON.stringify({TenDangNhap:'admin_phat',VaiTro:'NHAN_VIEN',ChucVu:'Quản lý',HoTenNV:'Kiểm tra bản in',AuthToken:token}));}catch{}
   window.__printCount=0;window.print=()=>{window.__printCount++;window.__printedWithLogo=[...document.images].every(img=>img.complete&&img.naturalWidth>0);};
  },token);
  const errors=[];context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
  async function paper(page,name){
   await page.emulateMedia({media:'print'});
   const invalid=await page.locator('th,td').evaluateAll(nodes=>nodes.filter(n=>{const s=getComputedStyle(n);return s.color!=='rgb(0, 0, 0)'||s.backgroundColor!=='rgb(255, 255, 255)';}).map(n=>n.textContent));
   assert.deepEqual(invalid,[],name);assert(await page.evaluate(()=>window.__printedWithLogo),name+': logo ready');
   assert(!/NaN|undefined|Đang tải dữ liệu/.test(await page.locator('body').innerText()),name+': complete data');
   await page.pdf({path:'tests/.artifacts/print/live/'+name+'.pdf',preferCSSPageSize:true,printBackground:true});
  }
  const page=await context.newPage();
  for(const [type,module,key] of [['PN','nhap-kho','MaPN'],['PX','xuat-kho','MaPX'],['HD','hoa-don','MaHD'],['PT','phieu-thu','MaPT'],['PC','phieu-chi','MaPC'],['DH','don-hang','MaDH']]){
   const list=await api(module);assert(list.length,module+': existing data');const id=list[0][key].trim();const data=await api(module+'/'+encodeURIComponent(id)+'/chi-tiet');
   await page.goto('http://localhost:3000/admin/in-chung-tu.html?type='+type+'&id='+encodeURIComponent(id));await page.waitForFunction(()=>window.__printCount===1);
   if(type==='PN'){
    assert(data.items.every(item=>item.DonViTinh),'PN unit from DB');
    for(const item of data.items)assert((await page.locator('#table-body').innerText()).includes(item.DonViTinh));
   }
   await paper(page,type);console.log('PASS live',type);
  }
  await page.emulateMedia({media:'screen'});await page.goto('http://localhost:3000/admin/ton-kho.html');await page.waitForFunction(()=>!document.querySelector('#inventoryTable tbody').innerText.includes('Đang tải'));
  const inventoryPromise=context.waitForEvent('page');await page.evaluate(()=>printInventoryReport());const inventory=await inventoryPromise;await inventory.waitForFunction(()=>window.__printCount===1);await paper(inventory,'inventory');await inventory.close();console.log('PASS live inventory report');
  await page.goto('http://localhost:3000/admin/dashboard.html');await page.waitForFunction(()=>document.querySelector('#refreshStatus').textContent.includes('Cập nhật lúc'));
  for(const type of ['overview','revenue','inventory','top10']){
   await page.locator('#reportType').selectOption(type);const popupPromise=context.waitForEvent('page');await page.evaluate(()=>printDashboardReport());const popup=await popupPromise;
   await popup.waitForFunction(()=>window.__printCount===1);await paper(popup,'report-'+type);await popup.close();console.log('PASS live report',type);
  }
  assert.deepEqual(errors,[]);console.log('PASS: six real DB documents, inventory and four dashboard reports. PDFs verified; no actual printing or DB changes.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
