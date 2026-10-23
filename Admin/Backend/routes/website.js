const express=require('express');
const {sql,poolPromise}=require('../../../Shared/Backend/config/database');
const {authenticate,authorizeApi}=require('../../../Shared/Backend/middleware/auth');
const {deliverOrderEmail,emailConfigured,emailPreviewHtml}=require('../../../Shared/Backend/services/order-email');
const {wrap,fail,text,imagePath,settingsQuery,productQuery}=require('../../../Shared/Backend/services/website-common');
const router=express.Router();
router.use((req,res,next)=>{
 if(!req.path.startsWith('/cau-hinh-website'))return next('router');
 next();
},authenticate,authorizeApi);
router.get('/cau-hinh-website/partners',wrap(async(_req,res)=>{const r=await (await poolPromise).request().query("SELECT NoiDung FROM WEB_NOI_DUNG WHERE Ma='partners'");res.json({success:true,data:r.recordset[0]?JSON.parse(r.recordset[0].NoiDung):[]});}));
router.put('/cau-hinh-website/partners',wrap(async(req,res)=>{
 const rows=req.body.partners;if(!Array.isArray(rows)||rows.length>30)fail('Tối đa 30 khách hàng/đối tác.');
 const safe=rows.map(p=>{if(!p||typeof p!=='object'||!text(p.name,100))fail('Nhập tên khách hàng/đối tác.');if(!['Đã trải nghiệm','Đang sử dụng'].includes(p.status))fail('Trạng thái sử dụng không hợp lệ.');if(!Number.isInteger(p.order)||p.order<0||p.order>99999)fail('Thứ tự không hợp lệ.');const source=text(p.source,512);if(source&&!/^https:\/\/[^\s<>"']+$/.test(source))fail('Nguồn phải là liên kết HTTPS.');return {name:text(p.name,100),sector:text(p.sector,100),description:text(p.description,350),image:imagePath(p.image),source,status:p.status,order:p.order,visible:p.visible===true};});
 await (await poolPromise).request().input('Content',sql.NVarChar(sql.MAX),JSON.stringify(safe)).query("UPDATE WEB_NOI_DUNG SET NoiDung=@Content,NgayCapNhat=SYSDATETIME() WHERE Ma='partners'; IF @@ROWCOUNT=0 INSERT INTO WEB_NOI_DUNG(Ma,NoiDung) VALUES('partners',@Content);");res.json({success:true});
}));
router.get('/cau-hinh-website',wrap(async(req,res)=>{const pool=await poolPromise;const [products,posts,settings,emails]=await Promise.all([
 pool.request().query(productQuery+' ORDER BY sp.MaSP'),pool.request().query('SELECT * FROM WEB_BAI_VIET ORDER BY NgayCapNhat DESC'),pool.request().query(settingsQuery),
 pool.request().query('SELECT TOP 15 ID,MaDH,NguoiNhan,TieuDe,TrangThai,SoLanThu,NgayTao,NgayGui FROM WEB_EMAIL ORDER BY ID DESC')]);
 res.json({success:true,data:{products:products.recordset,posts:posts.recordset,settings:settings.recordset[0],emails:emails.recordset,emailConfigured:emailConfigured()}});}));
router.post('/cau-hinh-website/images',express.raw({type:['image/png','image/jpeg','image/webp'],limit:'5mb'}),wrap(async(req,res)=>{
 const buffer=req.body;if(!Buffer.isBuffer(buffer)||!buffer.length)fail('Chọn ảnh PNG, JPG hoặc WebP.');
 const type=req.get('content-type').split(';')[0];const valid=type==='image/png'?buffer.subarray(0,8).toString('hex')==='89504e470d0a1a0a':type==='image/jpeg'?buffer.subarray(0,3).toString('hex')==='ffd8ff':type==='image/webp'&&buffer.subarray(0,4).toString()==='RIFF'&&buffer.subarray(8,12).toString()==='WEBP';
 if(!valid)fail('Định dạng ảnh không hợp lệ.');
 const fs=require('fs/promises'),path=require('path'),crypto=require('crypto');const ext=type==='image/png'?'png':type==='image/jpeg'?'jpg':'webp';const filename=crypto.randomUUID()+'.'+ext;const directory=path.join(require('../../../Shared/Backend/config/paths').sharedFrontend,'images/uploads');
 await fs.mkdir(directory,{recursive:true});await fs.writeFile(path.join(directory,filename),buffer,{flag:'wx'});res.status(201).json({success:true,data:{path:'/images/uploads/'+filename}});
}));
router.put('/cau-hinh-website/products/:id',wrap(async(req,res)=>{const b=req.body;if(!['NoiBat','CaPhe','MayPha','PhuKien'].includes(b.viTri))fail('Vị trí hiển thị không hợp lệ.');const order=Number(b.thuTu);if(!Number.isInteger(order)||order<0||order>99999)fail('Thứ tự phải từ 0 đến 99999.');
 const pool=await poolPromise;const r=await pool.request().input('MaSP',sql.Char(5),req.params.id).input('HienThi',sql.Bit,!!b.hienThi).input('ViTri',sql.NVarChar(30),b.viTri).input('ThuTu',sql.Int,order).input('MoTa',sql.NVarChar(1500),text(b.moTa,1500)).input('HinhAnh',sql.NVarChar(512),imagePath(b.hinhAnh)).query(`
 IF NOT EXISTS(SELECT 1 FROM SAN_PHAM WHERE MaSP=@MaSP) THROW 50001,'Product not found',1;
 UPDATE WEB_SAN_PHAM SET HienThi=@HienThi,ViTri=@ViTri,ThuTu=@ThuTu,MoTa=@MoTa,HinhAnh=@HinhAnh,NgayCapNhat=SYSDATETIME() WHERE MaSP=@MaSP;
 IF @@ROWCOUNT=0 INSERT INTO WEB_SAN_PHAM(MaSP,HienThi,ViTri,ThuTu,MoTa,HinhAnh) VALUES(@MaSP,@HienThi,@ViTri,@ThuTu,@MoTa,@HinhAnh);`);res.json({success:true,message:'Đã lưu cấu hình sản phẩm.'});}));
router.put('/cau-hinh-website/settings',wrap(async(req,res)=>{const b=req.body;const shipping=Number(b.phiVanChuyen);if(!Number.isFinite(shipping)||shipping<0||shipping>10000000)fail('Phí giao hàng không hợp lệ.');const pool=await poolPromise;
 await pool.request().input('GioiThieu',sql.NVarChar(1500),text(b.gioiThieu,1500)).input('NganHang',sql.NVarChar(100),text(b.tenNganHang,100)).input('SoTK',sql.VarChar(50),text(b.soTaiKhoan,50)).input('ChuTK',sql.NVarChar(100),text(b.chuTaiKhoan,100)).input('Phi',sql.Decimal(19,3),shipping).query('UPDATE WEB_CAU_HINH SET GioiThieu=@GioiThieu,TenNganHang=@NganHang,SoTaiKhoan=@SoTK,ChuTaiKhoan=@ChuTK,PhiVanChuyen=@Phi WHERE ID=1');res.json({success:true});}));
async function savePost(req,res){const b=req.body;const title=text(b.tieuDe,200),slug=text(b.slug,200);if(!title||!slug||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))fail('Nhập tiêu đề và đường dẫn dạng chu-khong-dau.');if(!['Nháp','Đã xuất bản'].includes(b.trangThai))fail('Trạng thái bài viết không hợp lệ.');if(!text(b.noiDung,60000)||!text(b.tomTat,600))fail('Nhập tóm tắt và nội dung bài viết.');
 if(!['Tin tức','Bài truyền thông','Cà phê','Máy pha','Chuyện JAVI'].includes(b.chuyenMuc))fail('Chuyên mục không hợp lệ.');
 const pool=await poolPromise;const request=pool.request().input('ID',sql.Int,Number(req.params.id)||0).input('Title',sql.NVarChar(200),title).input('Slug',sql.VarChar(200),slug).input('Category',sql.NVarChar(50),text(b.chuyenMuc,50)||'Cà phê').input('Summary',sql.NVarChar(600),text(b.tomTat,600)).input('Content',sql.NVarChar(sql.MAX),text(b.noiDung,60000)).input('Image',sql.NVarChar(512),imagePath(b.anhBia)).input('Status',sql.NVarChar(20),b.trangThai);
 const duplicate=await pool.request().input('Slug',sql.VarChar(200),slug).input('ID',sql.Int,Number(req.params.id)||0).query('SELECT ID FROM WEB_BAI_VIET WHERE Slug=@Slug AND ID<>@ID');if(duplicate.recordset.length)fail('Đường dẫn bài viết đã tồn tại.');
 if(req.params.id){const exists=await request.query('SELECT ID FROM WEB_BAI_VIET WHERE ID=@ID');if(!exists.recordset.length)fail('Bài viết không tồn tại.',404);await request.query(`UPDATE WEB_BAI_VIET SET TieuDe=@Title,Slug=@Slug,ChuyenMuc=@Category,TomTat=@Summary,NoiDung=@Content,AnhBia=@Image,TrangThai=@Status,NgayDang=CASE WHEN @Status=N'Đã xuất bản' THEN COALESCE(NgayDang,SYSDATETIME()) ELSE NULL END,NgayCapNhat=SYSDATETIME() WHERE ID=@ID`);}
 else await request.query(`INSERT INTO WEB_BAI_VIET(TieuDe,Slug,ChuyenMuc,TomTat,NoiDung,AnhBia,TrangThai,NgayDang) VALUES(@Title,@Slug,@Category,@Summary,@Content,@Image,@Status,CASE WHEN @Status=N'Đã xuất bản' THEN SYSDATETIME() ELSE NULL END)`);
 res.json({success:true,message:'Đã lưu bài viết.'});}
router.post('/cau-hinh-website/blog',wrap(savePost));router.put('/cau-hinh-website/blog/:id',wrap(savePost));
router.delete('/cau-hinh-website/blog/:id',wrap(async(req,res)=>{const pool=await poolPromise;await pool.request().input('ID',sql.Int,Number(req.params.id)).query('DELETE FROM WEB_BAI_VIET WHERE ID=@ID');res.json({success:true});}));
router.get('/cau-hinh-website/emails/:id',wrap(async(req,res)=>{const pool=await poolPromise;const r=await pool.request().input('ID',sql.Int,Number(req.params.id)).query('SELECT NoiDung FROM WEB_EMAIL WHERE ID=@ID');if(!r.recordset[0])fail('Email không tồn tại.',404);res.set('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; img-src data:").type('html').send(emailPreviewHtml(r.recordset[0].NoiDung));}));
router.post('/cau-hinh-website/emails/:id/retry',wrap(async(req,res)=>{if(!emailConfigured())fail('Chưa có SMTP_PASS trên máy chủ.');const pool=await poolPromise;const r=await pool.request().input('ID',sql.Int,Number(req.params.id)).query("SELECT MaDH FROM WEB_EMAIL WHERE ID=@ID AND TrangThai IN ('preview','failed','pending')");if(!r.recordset[0])fail('Email đã gửi hoặc đang xử lý.',409);await deliverOrderEmail(r.recordset[0].MaDH,true);res.json({success:true,message:'Đã xử lý yêu cầu gửi email.'});}));
module.exports=router;
