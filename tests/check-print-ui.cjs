const fs=require('fs'),assert=require('assert/strict');
const {chromium}=require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
fs.mkdirSync('tests/.artifacts/print',{recursive:true});
const product={MaSP:'CFH31',TenSP:'Cà phê hạt nguyên chất – túi 500g',DonViTinh:'Túi',MaLoaiSP:'CFH',SoLuongTon:50,SoLuongKD:45,TonToiThieu:5,GiaBan:100000};
const item={...product,name:product.TenSP,unit:'Túi',quantity:2,SoLuong:2,price:100000,GiaNhap:80000,GiamGiaSP:.1,ThanhTien:180000};
const detail={MaDH:'DH000018',TenKH:'Khách kiểm tra',DiaChiKH:'Nhà Bè, Thành phố Hồ Chí Minh',SoDTKH:'0903111018',TenNCC:'Nhà cung cấp kiểm tra',SoHoaDonNCC:'NCC/123',TongTienDonHang:200000,TongGiamGiaSP:20000,TongTienSauGiam:180000,TongTienThanhToan:180000,cusDiscountAmt:0,extraDiscountAmount:0,SoTienThucThu:180000,SoTienThucChi:160000,HinhThucThanhToan:'Chuyển khoản',GhiChu:'Thanh toán công nợ',items:[item]};
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const context=await browser.newContext({viewport:{width:1000,height:1200}});
 await context.addInitScript(()=>{
  try{localStorage.setItem('currentUser',JSON.stringify({TenDangNhap:'test',VaiTro:'NHAN_VIEN',ChucVu:'Quản lý',HoTenNV:'Người kiểm tra',AuthToken:'test'}));}catch{}
  window.__printCount=0;
  window.print=()=>{window.__printCount++;window.__printedWithLogo=[...document.images].every(img=>img.complete&&img.naturalWidth>0);};
 });
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(url.hostname!=='localhost')return route.abort();
  if(url.pathname.startsWith('/api/')){
   let data=[];
   if(url.pathname.includes('/chi-tiet')){
    data={...detail};
    if(url.pathname.includes('LONG'))data.items=Array.from({length:85},(_,i)=>({...item,TenSP:product.TenSP+' dòng '+(i+1),name:product.TenSP+' dòng '+(i+1)}));
    if(url.pathname.includes('MISSING'))return route.fulfill({status:404,json:{success:false,message:'Không tìm thấy'}});
   }else if(url.pathname==='/api/san-pham')data=[product];
   else if(url.pathname==='/api/dashboard/years')data=[2026];
   else if(url.pathname==='/api/dashboard/stats')data={doanhThu:200000,chiPhi:160000,congNo:0,canhBao:1};
   else if(url.pathname==='/api/dashboard/chart-data')data=[{Nam:2026,Thang:10,DoanhThuBanHang:200000,ChiPhiNhapHang:160000,LoiNhuanThuan:40000}];
   else if(url.pathname==='/api/dashboard/top-products')data=[{...product,SoLuongDaBan:2,TongDoanhThu:200000}];
   return route.fulfill({json:{success:true,data}});
  }
  return route.continue();
 });
 const errors=[];context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
 async function paper(page,name){
  await page.emulateMedia({media:'print'});
  const invalid=await page.locator('th,td').evaluateAll(cells=>cells.filter(cell=>{
   const s=getComputedStyle(cell);return s.color!=='rgb(0, 0, 0)'||s.backgroundColor!=='rgb(255, 255, 255)';
  }).map(cell=>cell.textContent));
  assert.deepEqual(invalid,[],name+': black text on white cells');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=Math.max(innerWidth,document.body.clientWidth)),name+': no horizontal overflow');
  await page.pdf({path:'tests/.artifacts/print/'+name+'.pdf',preferCSSPageSize:true,printBackground:true});
 }
 const page=await context.newPage();
 for(const type of ['PN','PX','HD','PT','PC','DH']){
  await page.goto('http://localhost:3000/admin/in-chung-tu.html?type='+type+'&id=TEST');
  await page.waitForFunction(()=>window.__printCount===1);
  assert(await page.evaluate(()=>window.__printedWithLogo),type+': logo loaded before print');
  assert.equal(await page.locator('link[href="/css/global.css"]').count(),0);
  assert(await page.locator('#printButton').isEnabled());
  if(!['PT','PC'].includes(type)){
   assert.match(await page.locator('#table-body').innerText(),/Cà phê hạt/);
   assert.match(await page.locator('#table-body').innerText(),/Túi/);
  }
  if(type==='PX')assert.equal(await page.locator('#table-body tr td').count(),4);
  await paper(page,type);
  if(type==='PX'||type==='PN')await page.screenshot({path:'tests/.artifacts/print/'+type+'.png',fullPage:true});
  console.log('PASS print',type);
 }
 await page.goto('http://localhost:3000/admin/in-chung-tu.html?type=PN&id=LONG');await page.waitForFunction(()=>window.__printCount===1);
 assert.equal(await page.locator('#table-body tr').count(),85);await paper(page,'PN-long');
 assert.equal(await page.locator('thead').evaluate(el=>getComputedStyle(el).display),'table-header-group');
 assert.equal(await page.locator('.signatures').evaluate(el=>getComputedStyle(el).breakInside),'avoid');
 await page.goto('http://localhost:3000/admin/in-chung-tu.html?type=PN&id=MISSING');await page.locator('#table-body').getByText('Không tìm thấy dữ liệu trên máy chủ!').waitFor();assert(await page.locator('#printButton').isDisabled());assert.equal(await page.evaluate(()=>window.__printCount),0);
 assert.deepEqual(errors,[]);
 console.log('PASS: all six document types, long multipage receipt and missing-data print lock. PDFs generated without printing or database writes.');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
