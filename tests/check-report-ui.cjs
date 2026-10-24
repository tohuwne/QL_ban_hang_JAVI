require('fs').mkdirSync('tests/.artifacts',{recursive:true});
const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base={MaKH:'KH000001',TenKH:'Nguyễn Minh Thư Khách hàng tên dài',MaNV:'NV000001',NguoiLapPhieu:'Quản lý',NgayLap:'2026-10-16T12:00:00',NgayThu:'2026-10-16T12:00:00',NgayChi:'2026-10-16T12:00:00',NgayNhap:'2026-10-16T12:00:00',NgayXuat:'2026-10-16T12:00:00',NgayDat:'2026-10-16T12:00:00',HinhThucThanhToan:'Tiền mặt',TrangThaiThanhToan:'Đã thanh toán',TongTienThanhToan:100000,SoTienThucThu:100000,SoTienThucChi:100000,TongTienNhap:100000,SoTienDaTraNCC:100000,MaNCC:'NCC00001',MaCN:'CN000001',SoDuCN:0,MaPN:'PN000001',MaPX:'PX000001',MaDH:'DH000001',MaHD:'HD000001',MaPT:'PT000001',MaPC:'PC000001',TrangThaiDonHang:'Hoàn thành',TrangThaiGiaoHang:'Chờ lấy hàng',NguonDon:'Sale',TongTienDonHang:110000,TongGiamGiaSP:10000,TongTienSauGiam:100000};
const second={...base,MaDH:'DH000002',MaHD:'HD000002',MaPT:'PT000002',MaPC:'PC000002',MaPN:'PN000002',MaPX:'PX000002',NguonDon:'Website',HinhThucThanhToan:'Chuyển khoản',TrangThaiDonHang:'Chờ giao',TrangThaiGiaoHang:'Đã giao hàng',TrangThaiThanhToan:'Chưa thanh toán',SoDuCN:100000};
const product={MaSP:'SP001',TenSP:'Cà phê kiểm thử',DonViTinh:'Gói',SoLuongTon:8,SoLuongKD:8,TonToiThieu:10,MaLoaiSP:'CFH',TenLoaiSP:'Cà phê hạt',GiaBan:100000};
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.addInitScript(()=>localStorage.setItem('currentUser',JSON.stringify({TenDangNhap:'test',VaiTro:'NHAN_VIEN',ChucVu:'Quản lý',HoTenNV:'Kiểm thử',MaNV:'NV000001',AuthToken:'test'})));
 await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.hostname!=='localhost')return route.abort();if(url.pathname.startsWith('/api/')){
 let data=[base,second];if(url.pathname==='/api/san-pham')data=[product];else if(url.pathname==='/api/loai-sp')data=[{MaLoaiSP:'CFH',TenLoaiSP:'Cà phê hạt'}];else if(url.pathname.includes('/chi-tiet')) data={...base,items:[]};else if(url.pathname.includes('nha-cung-cap'))data=[];
 return route.fulfill({json:{success:true,data}});
 }let name=decodeURIComponent(url.pathname);if(name.startsWith('/admin/'))name=name.slice(6);else if(name.endsWith('.html')&&!name.startsWith('/landing_page'))name='/admin'+name;
 let file=require('./frontend-path.cjs')('/'+name);if(!fs.existsSync(file)){file=require('./frontend-path.cjs')(url.pathname);}if(!fs.existsSync(file))return route.fulfill({status:404,body:''});const ext=path.extname(file);return route.fulfill({body:fs.readFileSync(file),contentType:ext==='.html'?'text/html; charset=utf-8':ext==='.css'?'text/css':ext==='.js'?'text/javascript':'application/octet-stream'});
 });
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const name of ['don-hang','hoa-don','nhap-kho','xuat-kho','phieu-thu','phieu-chi','ton-kho','san-pham','cong-no']){
  await page.goto(`http://localhost:3000/admin/${name}.html`);await page.waitForTimeout(750);
  await page.waitForFunction(()=>document.querySelectorAll('tbody tr').length>0);
  if(name==='hoa-don'){
   const panel=page.locator('.report-filters');const before=await panel.boundingBox();const tableBefore=await page.locator('#invoiceTable').boundingBox();
   await page.locator('#invoiceFrom').fill('2026-10-17');await page.locator('#invoiceTo').fill('2026-10-16');
   await page.locator('#invoiceFromError').waitFor({state:'visible'});const after=await panel.boundingBox();assert.equal(before.height,after.height);assert.equal(tableBefore.y,(await page.locator('#invoiceTable').boundingBox()).y);
   await page.locator('#invoiceFrom').fill('2026-10-16');await page.locator('#invoiceFromError').waitFor({state:'hidden'});
   const fromBox=await page.locator('#invoiceFrom').boundingBox(),btn=await page.locator('.report-filters > button').boundingBox();await page.screenshot({path:'tests/.artifacts/filter-alignment.png',fullPage:true});assert(Math.abs(fromBox.y-btn.y)<2,'button alignment');
   const widths=await panel.locator('input[type=date], .multi-filter').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));assert(widths.every(w=>Math.abs(w-widths[0])<1));
   const dateClear=page.locator('#invoiceFrom').locator('..').locator('.filter-clear');
   await dateClear.hover();await page.waitForTimeout(150);assert.equal(await dateClear.evaluate(el=>getComputedStyle(el).opacity),'1');await dateClear.click();assert.equal(await page.locator('#invoiceFrom').inputValue(),'');await page.locator('#invoiceFrom').fill('2026-10-16');
   await page.locator('#invoiceMethods summary').click();
   await page.locator('#invoiceMethods [role=option][data-value="Tiền mặt"]').click();
   await page.locator('#invoiceMethods [role=option][data-value="Chuyển khoản"]').click();
   assert.equal(await page.locator('#invoiceMethods .selection-value').innerText(),'Tiền mặt');
   assert.equal(await page.locator('#invoiceMethods .selection-extra').innerText(),'+1');
   const clearMethods=page.locator('#invoiceMethods summary .filter-clear');await clearMethods.hover();await page.waitForTimeout(150);assert.equal(await clearMethods.evaluate(el=>getComputedStyle(el).opacity),'1');await clearMethods.click();
   assert.equal(await page.locator('#invoiceMethods [role=option][aria-selected=true]:not([data-value=""])').count(),0);
   assert.equal(await page.locator('#invoiceMethods .selection-value').innerText(),'Tất cả');
   await page.locator('#invoiceMethods summary').click();await page.locator('#invoiceMethods [role=option][data-value="Tiền mặt"]').click();await page.locator('.report-filters > button').click();
   assert.equal(await page.locator('#invoiceTable tbody tr:not(.filter-hidden)').count(),1);
   assert.equal(await page.locator('#invoiceTable thead input, #invoiceTable thead details').count(),0);
   await page.locator('.list-toolbar .grid-search input').fill('khong-co-hoa-don');assert.equal(await page.locator('#invoiceTable tbody tr:not(.filter-hidden):not(.grid-search-hidden)').count(),0);
   await page.locator('.list-toolbar .grid-search input').fill('');assert.equal(await page.locator('#invoiceTable tbody tr:not(.filter-hidden):not(.grid-search-hidden)').count(),1);

   await page.screenshot({path:'tests/.artifacts/invoice-filters.png',fullPage:true});
   await page.locator('#invoiceTable tbody tr:not(.filter-hidden):not(.grid-search-hidden)').first().dblclick();await page.waitForTimeout(100);assert(await page.locator('.document-detail').count());await page.screenshot({path:'tests/.artifacts/invoice-detail.png',fullPage:true});
  }
  if(['nhap-kho','xuat-kho','phieu-thu','phieu-chi'].includes(name)){
   assert.equal(await page.locator('#searchInput').count(),0);
   const table=page.locator('.main-content .table-responsive table').first();const summary=page.locator('.report-filters .multi-filter summary');await summary.click();const choice=page.locator('.report-filters [role=option]').nth(1);await choice.click();await page.locator('.report-filters > button').click();assert.equal(await table.locator('tbody tr:not(.filter-hidden)').count(),1);
   const dates=page.locator('.report-filters input[type=date]');await dates.nth(0).fill('2026-10-17');await dates.nth(1).fill('2026-10-16');
   const y=(await table.boundingBox()).y;await page.locator('.date-range-error').waitFor({state:'visible'});assert.equal(y,(await table.boundingBox()).y);
   await dates.nth(0).fill('2026-10-16');await page.locator('.report-filters > button').click();
   if(name==='nhap-kho'||name==='xuat-kho'){await table.locator('tbody tr:not(.filter-hidden)').first().dblclick();await page.locator('.document-detail').waitFor({state:'visible'});assert.equal(await page.locator('.document-detail > .modal-footer').count(),1);}

  }
  if(name==='cong-no') {
   await page.locator('#debtStatus').selectOption('outstanding');
   const clear=page.locator('#debtStatus').locator('..').locator('.filter-clear');await clear.hover();await clear.click();assert.equal(await page.locator('#debtStatus').inputValue(),'');
  }
  if(name==='don-hang')assert((await page.locator('#orderTable').innerText()).includes('Khách đặt web'));
  if(name==='ton-kho')assert((await page.locator('#inventoryTable').innerText()).includes('Sắp hết hàng'));
  if(name==='san-pham'){assert.equal(await page.locator('#tonToiThieu').count(),1);await page.locator('.main-content tbody tr').first().dblclick();assert.equal(await page.locator('#tonToiThieu').inputValue(),'10');}
  console.log('PASS',name);
 }
 assert.deepEqual(errors,[]);console.log('PASS: no browser runtime errors; stable validation layout; aligned equal-width filters; portal dropdown; date and multi-status column filters; all report panels; inventory threshold.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
