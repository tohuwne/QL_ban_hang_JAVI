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
  await page.goto(`http://localhost:3000/admin/${name}.html`);await page.waitForTimeout(650);
  const table=page.locator('.main-content .table-responsive table').first();
  const widths=()=>table.locator('thead tr').first().locator('th').evaluateAll(cells=>cells.map(cell=>cell.getBoundingClientRect().width));
  const initial=await widths();
  assert.equal(await table.locator('thead input, thead details, thead select').count(),0,'no per-column quick filters');
  const search=page.locator('.list-toolbar .grid-search input');
  if(await search.count()){
   await search.fill('no-match-for-grid');assert.equal(await table.locator('tbody tr:not(.grid-search-hidden):not(.filter-hidden)').count(),0);assert.deepEqual(await widths(),initial);
   await search.fill('');assert.deepEqual(await widths(),initial);
  }
  const cards=page.locator('.main-content > .stat-cards');
  if(await cards.count()){
   assert.equal(await cards.first().isVisible(),false,'cards hidden by default');
   await page.locator('.list-toolbar .dashboard-toggle').click();assert.equal(await cards.first().isVisible(),true);
   await page.locator('.list-toolbar .dashboard-toggle').click();assert.equal(await cards.first().isVisible(),false);
  }
  const panel=page.locator('.report-filters .multi-filter').first();if(await panel.count()){
   const opts=panel.locator('[role=option]:not([data-value=""])');
   if(await opts.count()>1){await panel.locator('summary').click();await opts.nth(0).click();await opts.nth(1).click();assert.equal(await panel.locator('[role=option][aria-selected=true]:not([data-value=""])').count(),2);assert.equal(await panel.locator('.selection-extra').innerText(),'+1');}
  }
  if(name==='don-hang'){await page.mouse.click(110,80);await page.screenshot({path:'tests/.artifacts/grid-filter-boxes.png',fullPage:true});}
  console.log('PASS',name,'toolbar search, dashboard toggle, stable columns during filtering');
 }
 assert.deepEqual(errors,[]);console.log('PASS: no browser runtime errors; toolbar search without per-column filters; cards behind Dashboard toggle; report panels; inventory threshold.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
