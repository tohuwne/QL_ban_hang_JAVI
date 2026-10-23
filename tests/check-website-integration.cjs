require('fs').mkdirSync('tests/.artifacts',{recursive:true});
/* Real local integration checks. All QA accounts, orders and content are removed in finally. */
const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
require('../node_modules/dotenv').config({path:'.env',quiet:true});
const {sql,poolPromise}=require('../Shared/Backend/config/database'),{createToken}=require('../Shared/Backend/middleware/auth');
const {chromium}=require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin='http://localhost:3100';
const stamp=Date.now().toString(36),username='qa_web_'+stamp,email='qa-'+stamp+'@example.invalid',slug='qa-story-'+stamp;
const adminUser={TenDangNhap:'qa_manager',VaiTro:'NHAN_VIEN',ChucVu:'Quản lý',HoTenNV:'Kiểm thử cấu hình website'};adminUser.AuthToken=createToken(adminUser);
let customer,product,originalProduct,originalStock,pool,browser,postId,uploadedImage;
async function api(path,body,token,method){const r=await fetch(origin+'/api'+path,{method:method||(body?'POST':'GET'),headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});const result=await r.json();return {status:r.status,...result};}
async function restore(){if(uploadedImage && /^\/images\/uploads\/[a-f0-9-]+\.png$/.test(uploadedImage))fs.unlinkSync(require('./frontend-path.cjs')(uploadedImage));if(!pool)return;
 if(originalProduct){await api('/cau-hinh-website/products/'+product.MaSP.trim(),originalProduct,adminUser.AuthToken,'PUT');}
 if(postId)await api('/cau-hinh-website/blog/'+postId,null,adminUser.AuthToken,'DELETE');
 if(customer){await pool.request().input('User',sql.VarChar(50),username).input('KH',sql.Char(8),customer.MaKH).query(`
 BEGIN TRANSACTION;
 DECLARE @ids TABLE(MaDH CHAR(8)); INSERT INTO @ids SELECT MaDH FROM WEB_DON_HANG WHERE TenDangNhap=@User;
 DECLARE @restore TABLE(MaSP CHAR(5),Qty INT,BeforeQty DECIMAL(10,2));
 INSERT INTO @restore SELECT ct.MaSP,SUM(ct.SoLuong),MAX(sp.SoLuongKD) FROM CT_DON_HANG ct JOIN @ids ids ON ct.MaDH=ids.MaDH JOIN SAN_PHAM sp WITH(UPDLOCK,HOLDLOCK) ON sp.MaSP=ct.MaSP GROUP BY ct.MaSP;
 DELETE e FROM WEB_EMAIL e JOIN @ids ids ON e.MaDH=ids.MaDH;
 DELETE ct FROM WEB_CT_DON_HANG ct JOIN @ids ids ON ct.MaDH=ids.MaDH;
 DELETE w FROM WEB_DON_HANG w JOIN @ids ids ON w.MaDH=ids.MaDH;
 DELETE ct FROM CT_DON_HANG ct JOIN @ids ids ON ct.MaDH=ids.MaDH;
 UPDATE sp SET SoLuongKD=sp.SoLuongKD+r.Qty FROM SAN_PHAM sp JOIN @restore r ON r.MaSP=sp.MaSP WHERE sp.SoLuongKD=r.BeforeQty;
 DELETE dh FROM DON_HANG dh JOIN @ids ids ON dh.MaDH=ids.MaDH;
 DELETE FROM GIO_HANG WHERE TenDangNhap=@User;DELETE FROM TAI_KHOAN WHERE TenDangNhap=@User;DELETE FROM KHACH_HANG WHERE MaKH=@KH;
 COMMIT;`);const stock=(await pool.request().input('SP',sql.Char(5),product.MaSP).query('SELECT SoLuongKD,SoLuongTon FROM SAN_PHAM WHERE MaSP=@SP')).recordset[0];assert.deepEqual(stock,originalStock,'QA stock fully restored');}
}
(async()=>{assert(!process.env.SMTP_PASS,'Do not send real mail during QA');pool=await poolPromise;
 const fixture=await pool.request().input('Email',sql.VarChar(100),email).input('User',sql.VarChar(50),username).input('Hash',sql.VarChar(255),await require('../node_modules/bcryptjs').hash(crypto.randomBytes(20).toString('hex'),4)).query(`
 INSERT INTO KHACH_HANG(TenKH,SoDTKH,EmailKH,GioiTinhKH,DiaChiKH,MaLoaiKH) SELECT N'Kiểm thử website', '0900000000',@Email,N'Nữ',N'Địa chỉ kiểm thử',MaLoaiKH FROM (SELECT TOP 1 MaLoaiKH FROM LOAI_KHACH_HANG ORDER BY MaLoaiKH) x;
 DECLARE @KH CHAR(8)=(SELECT TOP 1 MaKH FROM KHACH_HANG WHERE EmailKH=@Email ORDER BY MaKH DESC);
 INSERT INTO TAI_KHOAN(TenDangNhap,MatKhau,MaKH,VaiTro) VALUES(@User,@Hash,@KH,'KHACH_HANG');
 SELECT @KH AS MaKH;
 `);customer={TenDangNhap:username,MaKH:fixture.recordset[0].MaKH,VaiTro:'KHACH_HANG',TenKH:'Kiểm thử website',SoDTKH:'0900000000',EmailKH:email,DiaChiKH:'Địa chỉ kiểm thử'};customer.AuthToken=createToken(customer);
 const publicProducts=await api('/website/products');assert.equal(publicProducts.status,200);assert.equal(publicProducts.data.length,39);product=publicProducts.data.find(p=>p.SoLuongKD>=4&&p.GiaBan>0);assert(product);
 originalStock=(await pool.request().input('SP',sql.Char(5),product.MaSP).query('SELECT SoLuongKD,SoLuongTon FROM SAN_PHAM WHERE MaSP=@SP')).recordset[0];
 const config=await api('/cau-hinh-website',null,adminUser.AuthToken);assert(config.success);const p=config.data.products.find(p=>p.MaSP.trim()===product.MaSP.trim());originalProduct={hienThi:!!p.HienThi,viTri:p.ViTri,thuTu:p.ThuTu,moTa:p.MoTa,hinhAnh:p.HinhAnh};
 assert.equal((await api('/cau-hinh-website',null,customer.AuthToken)).status,403);assert.equal((await api('/website/checkout',{})).status,401);
 assert.equal((await api('/gio-hang',{tenDangNhap:username,maSP:product.MaSP.trim(),soLuong:1.5},customer.AuthToken,'PUT')).status,400);
 assert((await api('/cau-hinh-website/products/'+product.MaSP.trim(),{...originalProduct,hienThi:false},adminUser.AuthToken,'PUT')).success);
 assert(!(await api('/website/products')).data.some(p=>p.MaSP===product.MaSP));
 assert.equal((await api('/gio-hang',{tenDangNhap:username,maSP:product.MaSP.trim(),soLuong:1},customer.AuthToken,'PUT')).status,404);
 await api('/cau-hinh-website/products/'+product.MaSP.trim(),originalProduct,adminUser.AuthToken,'PUT');
 const draft={tieuDe:'Câu chuyện kiểm thử tiếng Việt',slug,chuyenMuc:'Cà phê',tomTat:'Bản nháp dùng kiểm thử, sẽ tự động xóa.',noiDung:'## Một tiêu đề có dấu\n\nNội dung cà phê, máy pha và <script>không được thực thi</script>.',anhBia:'/images/javi-phin-hero.png',trangThai:'Nháp'};
 assert((await api('/cau-hinh-website/blog',draft,adminUser.AuthToken)).success);const updated=await api('/cau-hinh-website',null,adminUser.AuthToken);postId=updated.data.posts.find(post=>post.Slug===slug).ID;
 assert.equal((await api('/website/blog/'+slug)).status,404);assert((await api('/cau-hinh-website/blog/'+postId,{...draft,trangThai:'Đã xuất bản'},adminUser.AuthToken,'PUT')).success);assert.equal((await api('/website/blog/'+slug)).data.TieuDe,draft.tieuDe);
 assert((await api('/gio-hang',{tenDangNhap:username,maSP:product.MaSP.trim(),soLuong:2},customer.AuthToken,'PUT')).success);
 const imageUpload=await fetch(origin+'/api/cau-hinh-website/images',{method:'POST',headers:{Authorization:'Bearer '+adminUser.AuthToken,'Content-Type':'image/png'},body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRDsAAAAASUVORK5CYII=','base64')});assert.equal(imageUpload.status,201);uploadedImage=(await imageUpload.json()).data.path;assert.equal((await fetch(origin+uploadedImage)).status,200);
 const key=crypto.randomUUID(),body={maYeuCau:key,maSanPham:[product.MaSP.trim()],nguoiNhan:'Nguyễn Minh Thư kiểm thử',soDT:'0900000000',email,diaChi:'Địa chỉ kiểm thử — không giao hàng',ghiChu:'<script>không được thực thi</script>',hinhThucTT:'Tiền mặt',tongTienSauGiam:1};
 const stale=await api('/website/checkout',{...body,tongDuKien:1},customer.AuthToken);assert.equal(stale.status,409);
 const result=await api('/website/checkout',body,customer.AuthToken);assert.equal(result.status,201,JSON.stringify(result));assert(result.data.maDH);const id=result.data.maDH;
 const duplicate=await api('/website/checkout',body,customer.AuthToken);assert.equal(duplicate.data.maDH,id);assert(duplicate.data.duplicate);
 const order=await api('/website/orders/'+id,null,customer.AuthToken);assert.equal(order.data.TongThanhToan,Number(product.GiaBan)*2+Number(config.data.settings.PhiVanChuyen));assert.equal(order.data.NguoiNhan,body.nguoiNhan);assert.equal(order.data.TrangThaiEmail,'preview');assert.equal(order.data.HinhThucTT,'Tiền mặt');
 const after=(await pool.request().input('SP',sql.Char(5),product.MaSP).query('SELECT SoLuongKD,SoLuongTon FROM SAN_PHAM WHERE MaSP=@SP')).recordset[0];assert.equal(after.SoLuongKD,originalStock.SoLuongKD-2);assert.equal(after.SoLuongTon,originalStock.SoLuongTon);
 const stranger=createToken({...customer,TenDangNhap:username+'_other'});assert.equal((await api('/website/orders/'+id,null,stranger)).status,404);
 const mail=await fetch(origin+'/api/website/orders/'+id+'/email',{headers:{Authorization:'Bearer '+customer.AuthToken}});const html=await mail.text();assert(html.includes('&lt;script&gt;'));assert(!html.includes('<script>'));
 browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(origin+'/landing_page/mua-hang.html');await page.locator('.product-card').first().waitFor();assert.equal(await page.locator('.nav-inner a').count(),2);assert.equal(await page.locator('.top-note,.nav-help').count(),0);assert(await page.locator('.brand img').first().evaluate(img=>img.complete&&img.naturalWidth>0));
 assert(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight+100));await page.mouse.wheel(0,600);await page.waitForFunction(()=>scrollY>0);assert(await page.evaluate(()=>scrollY>0));await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:'tests/.artifacts/storefront-home.png',fullPage:false});await page.locator('#siteSearch').fill('khôngcósảnphẩmnày');assert.equal(await page.locator('.product-card').count(),0);await page.locator('#siteSearch').fill('');
 await page.goto(origin+'/landing_page/blog.html');await page.locator('.blog-card').first().waitFor();assert(await page.locator('.blog-card').count()>=3);await page.screenshot({path:'tests/.artifacts/storefront-blog.png',fullPage:true});await page.locator('.blog-card a').first().click();await page.locator('.article-body').waitFor();assert.equal(await page.locator('.article-body script').count(),0);
 const logged=await browser.newContext({viewport:{width:1440,height:1000}});await logged.addInitScript(user=>{if(window===window.top)localStorage.setItem('currentUser',JSON.stringify(user));},customer);const shop=await logged.newPage();shop.on('pageerror',error=>errors.push(error.message));
 await shop.goto(origin+'/landing_page/don-hang-thanh-cong.html?order='+id);await shop.locator('.success-heading').waitFor();assert((await shop.locator('#successContent').innerText()).includes(id));await shop.locator('#showOrderEmail').click();await shop.locator('#emailPreviewSection').waitFor({state:'visible'});await shop.screenshot({path:'tests/.artifacts/storefront-order.png',fullPage:true});
 // Exercise the actual multi-page shopping path without creating another order.
 await api('/gio-hang',{tenDangNhap:username,maSP:product.MaSP.trim(),soLuong:1},customer.AuthToken,'PUT');
 await shop.goto(origin+'/landing_page/gio-hang.html');await shop.locator('#goCheckout').waitFor();await shop.screenshot({path:'tests/.artifacts/storefront-cart.png',fullPage:true});await shop.locator('#goCheckout').click();await shop.locator('#placeOrderButton').waitFor();assert(shop.url().includes('thanh-toan.html'));assert.equal(await shop.locator('#receiverEmail').inputValue(),email);await shop.screenshot({path:'tests/.artifacts/storefront-checkout.png',fullPage:true});await shop.locator('#placeOrderButton').click();await shop.waitForURL('**/don-hang-thanh-cong.html?order=*');await shop.locator('.success-heading').waitFor();
 const admin=await browser.newContext({viewport:{width:1440,height:1000}});await admin.addInitScript(user=>{if(window===window.top)localStorage.setItem('currentUser',JSON.stringify(user));},adminUser);const adminPage=await admin.newPage();adminPage.on('pageerror',error=>errors.push(error.message));await adminPage.goto(origin+'/admin/cau-hinh-website.html');await adminPage.locator('#webProductsTable tbody tr[data-row-edit]').first().waitFor();assert.equal(await adminPage.locator('#webProductsTable tbody tr[data-row-edit]').count(),39);await adminPage.locator('#blogTab').click();await adminPage.locator('#newBlog').click();assert(await adminPage.locator('#webBlogModal').isVisible());await adminPage.locator('#blogTitle').fill('Một câu chuyện có dấu');assert.equal(await adminPage.locator('#blogSlug').inputValue(),'mot-cau-chuyen-co-dau');await adminPage.locator('[data-close="webBlogModal"]').first().click();await adminPage.screenshot({path:'tests/.artifacts/website-config-blog.png',fullPage:true});
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true});const mobilePage=await mobile.newPage();await mobilePage.goto(origin+'/landing_page/mua-hang.html');await mobilePage.locator('.product-card').first().waitFor();assert(await mobilePage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await mobilePage.screenshot({path:'tests/.artifacts/storefront-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: public browsing, UTF-8 blog publication, access control, product visibility, cart validation, authoritative prices, stock reservation, idempotent order, owner-only receipt, escaped email preview, desktop/mobile pages, admin tabs and editor.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();try{await restore();console.log('PASS: QA records removed and stock/config restored.');}catch(error){console.error('QA CLEANUP:',error);process.exitCode=1;}if(pool)await pool.close();});
