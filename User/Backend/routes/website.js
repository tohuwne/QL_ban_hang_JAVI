const express = require('express');
const {sql, poolPromise} = require('../../../Shared/Backend/config/database');
const {authenticate, authorizeApi} = require('../../../Shared/Backend/middleware/auth');
const {renderOrderEmail, orderEmailSubject, deliverOrderEmail, emailPreviewHtml} = require('../../../Shared/Backend/services/order-email');
const {saveAppliedCoupon} = require('../../../Shared/Backend/services/pos-pricing');
const {divisions, resolveAddress, databaseLocations,resolveDatabaseAddress, priceOrder, couponUnavailableReason, discountAmount, eligibleSubtotal} = require('../../../Shared/Backend/services/checkout-pricing');
const router = express.Router();
const {articleSource}=require('../../../Shared/Backend/services/article-source');
const {catalog,validateOptions,checkStock,factor}=require('../../../Shared/Backend/services/product-options');
const {wrap,fail,text,settingsQuery,productQuery}=require('../../../Shared/Backend/services/website-common');
const walletQuery=`SELECT m.*,lk.TenLoaiKH,sp.TenSP,v.NgayLuu,ISNULL(q.SoLuotDaTinh,0) AS SoLuotDaTinh,ISNULL(q.SoLuotDaDung,0) AS SoLuotDaDung,ISNULL(q.SoLuotDangGiu,0) AS SoLuotDangGiu FROM WEB_MA_KHACH_HANG v JOIN WEB_MA_GIAM_GIA m ON m.MaGiamGia=v.MaGiamGia LEFT JOIN LOAI_KHACH_HANG lk ON lk.MaLoaiKH=m.MaLoaiKH LEFT JOIN SAN_PHAM sp ON sp.MaSP=m.MaSP LEFT JOIN v_MaGiamGiaLuotDung q ON q.MaGiamGia=m.MaGiamGia WHERE v.TenDangNhap=@User ORDER BY v.NgayLuu DESC`;
const savedCoupons=(pool,username)=>pool.request().input('User',sql.VarChar(50),username).query(walletQuery);
function couponOption(coupon,subtotal,context,checkProducts=true){const reason=couponUnavailableReason(coupon,subtotal,context,checkProducts);return {...coupon,CoTheApDung:!reason,ConHieuLuc:!reason,LyDoKhongApDung:reason,LuotConLai:coupon.SoLuong==null?null:Math.max(0,Number(coupon.SoLuong)-Number(coupon.SoLuotDaTinh||0)),TienGiamDuKien:!reason&&checkProducts?discountAmount(eligibleSubtotal(subtotal,coupon,context),coupon):0};}
async function selectedCart(db,username,ids){
 if(!Array.isArray(ids)||!ids.length||ids.length>100||ids.some(id=>!Number.isSafeInteger(Number(id))||Number(id)<1))fail('Chọn dòng sản phẩm trong giỏ hàng.');
 const r=await db.request().input('User',sql.VarChar(50),username).query(`SELECT g.MaGH,g.MaSP,g.SoLuong,g.TrongLuongGram,g.LoaiXay,s.TenSP,s.GiaBan,s.MaLoaiSP,s.SoLuongKD,l.ApDungTuyChon,ISNULL(w.HienThi,0) AS HienThi FROM GIO_HANG g WITH(UPDLOCK,HOLDLOCK) JOIN SAN_PHAM s WITH(UPDLOCK,HOLDLOCK) ON s.MaSP=g.MaSP JOIN LOAI_SAN_PHAM l ON l.MaLoaiSP=s.MaLoaiSP LEFT JOIN WEB_SAN_PHAM w ON w.MaSP=s.MaSP WHERE g.TenDangNhap=@User`);
 const items=[...new Set(ids.map(Number))].map(id=>{const item=r.recordset.find(row=>Number(row.MaGH)===id);if(!item||!item.HienThi)fail('Dòng giỏ hàng hoặc sản phẩm đã thay đổi.',409);return item;});
 checkStock(items);
 for(const item of items){await validateOptions(db,item,item.TrongLuongGram,item.LoaiXay);item.GiaBan=Number(item.GiaBan)*factor(item);}
 return items;
}
async function selectionContext(pool,username,ids){
 const items=await selectedCart(pool,username,ids);
 const customer=await pool.request().input('User',sql.VarChar(50),username).query('SELECT k.MaLoaiKH FROM TAI_KHOAN t JOIN KHACH_HANG k ON k.MaKH=t.MaKH WHERE t.TenDangNhap=@User');if(!customer.recordset[0])fail('Không tìm thấy hồ sơ khách hàng.',403);
 return {items,subtotal:items.reduce((sum,i)=>sum+Number(i.GiaBan)*i.SoLuong,0),context:{customerType:customer.recordset[0].MaLoaiKH,lines:items.map(i=>({productId:i.MaSP,amount:Number(i.GiaBan)*i.SoLuong}))}};
}
router.get('/website/product-options',wrap(async(_req,res)=>res.json({success:true,data:await catalog(await poolPromise)})));
router.get('/website/products/:id',wrap(async(req,res)=>{const id=String(req.params.id).trim();if(!id||id.length>10)fail('Không tìm thấy sản phẩm.',404);const pool=await poolPromise;const result=await pool.request().input('Product',sql.VarChar(10),id).query(productQuery+' WHERE w.HienThi=1 AND sp.MaSP=@Product');if(!result.recordset[0])fail('Sản phẩm không còn được bán hoặc không tồn tại.',404);res.json({success:true,data:result.recordset[0]});}));
router.get('/website/products',wrap(async(req,res)=>{const pool=await poolPromise;const result=await pool.request().query(productQuery+' WHERE w.HienThi=1 ORDER BY w.ThuTu,sp.MaSP');res.json({success:true,data:result.recordset});}));
router.get('/website/partners',wrap(async(_req,res)=>{const r=await (await poolPromise).request().query("SELECT NoiDung FROM WEB_NOI_DUNG WHERE Ma='partners'");const rows=r.recordset[0]?JSON.parse(r.recordset[0].NoiDung):[];res.json({success:true,data:rows.filter(p=>p.visible).sort((a,b)=>a.order-b.order)});}));
router.get('/website/settings',wrap(async(req,res)=>{const pool=await poolPromise;const r=await pool.request().query(settingsQuery);res.json({success:true,data:r.recordset[0]});}));
router.get('/website/blog',wrap(async(req,res)=>{const pool=await poolPromise;const r=await pool.request().query(`SELECT ID,TieuDe,Slug,ChuyenMuc,TomTat,AnhBia,NgayDang,NoiDung FROM WEB_BAI_VIET WHERE TrangThai=N'Đã xuất bản' AND NgayDang<=SYSDATETIME() ORDER BY NgayDang DESC,ID DESC`);res.json({success:true,data:r.recordset.map(post=>{const {NoiDung,...summary}=post;return {...summary,LienKetNguon:articleSource(post)};})});}));
router.get('/website/blog/:slug',wrap(async(req,res)=>{const pool=await poolPromise;const r=await pool.request().input('Slug',sql.VarChar(200),req.params.slug).query(`SELECT * FROM WEB_BAI_VIET WHERE Slug=@Slug AND TrangThai=N'Đã xuất bản' AND NgayDang<=SYSDATETIME()`);if(!r.recordset[0])fail('Bài viết chưa được xuất bản hoặc không tồn tại.',404);res.json({success:true,data:r.recordset[0]});}));
router.get('/website/locations',wrap(async(req,res)=>res.json({success:true,data:await databaseLocations(await poolPromise)})));
router.use((req,res,next)=>{
 if(!req.path.startsWith('/website/'))return next('router');
 next();
},authenticate,authorizeApi);
router.get('/website/account',wrap(async(req,res)=>{
 if(req.user.vaiTro!=='KHACH_HANG')fail('Vui lòng dùng tài khoản khách hàng.',403);
 const pool=await poolPromise;
 const profile=await pool.request().input('User',sql.VarChar(50),req.user.sub).query('SELECT tk.TenDangNhap,k.MaKH,k.TenKH,k.SoDTKH,k.EmailKH,k.DiaChiKH,k.GioiTinhKH,k.MaLoaiKH FROM TAI_KHOAN tk JOIN KHACH_HANG k ON k.MaKH=tk.MaKH WHERE tk.TenDangNhap=@User');
 if(!profile.recordset[0])fail('Không tìm thấy thông tin khách hàng.',404);
 const [summary,wallet]=await Promise.all([pool.request().input('KH',sql.Char(8),profile.recordset[0].MaKH).query('SELECT COUNT(*) AS SoDonHang FROM DON_HANG WHERE MaKH=@KH'),savedCoupons(pool,req.user.sub)]);
 res.json({success:true,data:{profile:profile.recordset[0],summary:summary.recordset[0],coupons:wallet.recordset.map(c=>couponOption(c,0,{customerType:profile.recordset[0].MaLoaiKH},false))}});
}));
router.get('/website/account/orders',wrap(async(req,res)=>{
 if(req.user.vaiTro!=='KHACH_HANG')fail('Vui lòng dùng tài khoản khách hàng.',403);
 const page=Number(req.query.page||1);if(!Number.isInteger(page)||page<1||page>100000)fail('Trang không hợp lệ.');
 const r=await (await poolPromise).request().input('User',sql.VarChar(50),req.user.sub).input('Offset',sql.Int,(page-1)*10).query(`SELECT dh.MaDH,dh.NgayDat,dh.TongTienDonHang,dh.TongGiamGiaSP,dh.TongTienSauGiam,dh.TrangThaiDonHang,CASE WHEN w.MaDH IS NULL THEN 0 ELSE 1 END AS DonWebsite,CASE WHEN w.HinhThucTT=N'Chuyển khoản' AND dh.TrangThaiDonHang=N'Chờ giao' AND NOT EXISTS(SELECT 1 FROM HOA_DON h WHERE h.MaDH=dh.MaDH) THEN 1 ELSE 0 END AS ChoThanhToanQR FROM DON_HANG dh JOIN TAI_KHOAN tk ON tk.MaKH=dh.MaKH LEFT JOIN WEB_DON_HANG w ON w.MaDH=dh.MaDH WHERE tk.TenDangNhap=@User ORDER BY dh.NgayDat DESC,dh.MaDH DESC OFFSET @Offset ROWS FETCH NEXT 10 ROWS ONLY`);
 res.json({success:true,data:r.recordset});
}));
router.post('/website/account/coupons',wrap(async(req,res)=>{
 if(req.user.vaiTro!=='KHACH_HANG')fail('Vui lòng dùng tài khoản khách hàng.',403);
 const code=String(req.body.code||'').trim().toUpperCase();if(!/^[A-Z0-9_-]{1,30}$/.test(code))fail('Nhập mã giảm giá hợp lệ.');
 const pool=await poolPromise;
 const coupon=await pool.request().input('Code',sql.VarChar(30),code).input('User',sql.VarChar(50),req.user.sub).query(`SELECT m.*,(SELECT COUNT(*) FROM WEB_AP_DUNG_MA a JOIN DON_HANG d ON d.MaDH=a.MaDH WHERE a.MaGiamGia=m.MaGiamGia AND ISNULL(d.TrangThaiDonHang,N'') NOT IN(N'Không hoàn thành',N'Không thành công',N'Đã hủy',N'Hủy')) AS SoLuotDaTinh FROM WEB_MA_GIAM_GIA m WHERE m.MaGiamGia=@Code AND (m.MaLoaiKH IS NULL OR m.MaLoaiKH=(SELECT k.MaLoaiKH FROM TAI_KHOAN t JOIN KHACH_HANG k ON k.MaKH=t.MaKH WHERE t.TenDangNhap=@User)) AND TrangThai=N'Hoạt động' AND (KetThuc IS NULL OR KetThuc>SYSUTCDATETIME())`);if(!coupon.recordset.length)fail('Mã không hợp lệ, ngoài thời hạn hoặc không áp dụng cho loại khách hàng của bạn.');
 if(coupon.recordset[0].SoLuong!=null&&Number(coupon.recordset[0].SoLuotDaTinh)>=Number(coupon.recordset[0].SoLuong))fail('Mã đã hết lượt sử dụng');
 await pool.request().input('User',sql.VarChar(50),req.user.sub).input('Code',sql.VarChar(30),code).query('INSERT INTO WEB_MA_KHACH_HANG(TenDangNhap,MaGiamGia) SELECT @User,@Code WHERE NOT EXISTS(SELECT 1 FROM WEB_MA_KHACH_HANG WITH(UPDLOCK,HOLDLOCK) WHERE TenDangNhap=@User AND MaGiamGia=@Code)');
 res.json({success:true,data:{code},message:'Đã lưu mã giảm giá vào tài khoản'});
}));

router.get('/website/addresses',wrap(async(req,res)=>{
 const r=await (await poolPromise).request().input('User',sql.VarChar(50),req.user.sub).query('SELECT * FROM WEB_DIA_CHI WHERE TenDangNhap=@User ORDER BY NgayCapNhat DESC,ID DESC');res.json({success:true,data:r.recordset});
}));
router.post('/website/coupons/available',wrap(async(req,res)=>{
 const pool=await poolPromise;const selected=await selectionContext(pool,req.user.sub,req.body.maGioHang);const wallet=await savedCoupons(pool,req.user.sub);res.json({success:true,data:wallet.recordset.map(c=>couponOption(c,selected.subtotal,selected.context))});
}));
router.post('/website/quote',wrap(async(req,res)=>{
 const pool=await poolPromise;const selected=await selectionContext(pool,req.user.sub,req.body.maGioHang);const quote=await priceOrder(pool,selected.subtotal,req.body,!!req.body.tinhThanh,selected.context);res.json({success:true,data:quote});
}));

router.post('/website/checkout',wrap(async(req,res)=>{
 if(req.user.vaiTro!=='KHACH_HANG')fail('Vui lòng dùng tài khoản khách hàng để đặt hàng.',403);
 const b=req.body;const delivery=await resolveDatabaseAddress(await poolPromise,b);const name=text(b.nguoiNhan,100),phone=text(b.soDT,20),email=text(b.email,100),address=delivery.full,note=text(b.ghiChu,1000),key=text(b.maYeuCau,64);
 if(!name||!address||!/^[0-9+(). -]{9,20}$/.test(phone)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^[a-zA-Z0-9-]{16,64}$/.test(key))fail('Kiểm tra họ tên, số điện thoại, email và địa chỉ nhận hàng.');
 if(phone.replace(/\D/g,'').length<9)fail('Số điện thoại nhận hàng không hợp lệ.');
 if(!['Tiền mặt','Chuyển khoản'].includes(b.hinhThucTT))fail('Phương thức thanh toán không hợp lệ.');
 if(!Array.isArray(b.maGioHang)||!b.maGioHang.length||b.maGioHang.length>100)fail('Chọn dòng sản phẩm trong giỏ hàng.');
 const ids=b.maGioHang;
 const pool=await poolPromise;const tx=new sql.Transaction(pool);await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);let order;
 try{
  const lock=await tx.request().input('Key',sql.VarChar(64),key).query("SELECT MaDH,TenDangNhap,HinhThucTT FROM WEB_DON_HANG WITH(UPDLOCK,HOLDLOCK) WHERE MaYeuCau=@Key");
  if(lock.recordset[0]){if(lock.recordset[0].TenDangNhap!==req.user.sub)fail('Mã yêu cầu không hợp lệ.',409);await tx.commit();return res.json({success:true,data:{maDH:lock.recordset[0].MaDH,hinhThucTT:lock.recordset[0].HinhThucTT,duplicate:true}});}
  const maDH=(await tx.request().query("SELECT 'DH'+RIGHT('000000'+CAST(ISNULL(MAX(CAST(SUBSTRING(MaDH,3,6) AS INT)),0)+1 AS VARCHAR(6)),6) AS MaDH FROM DON_HANG WITH(TABLOCKX,HOLDLOCK)")).recordset[0].MaDH;
  const items=await selectedCart(tx,req.user.sub,ids);
  const customer=await tx.request().input('MaKH',sql.Char(8),req.user.maKH).query('SELECT kh.MaKH,kh.MaLoaiKH FROM KHACH_HANG kh WHERE kh.MaKH=@MaKH');if(!customer.recordset.length)fail('Hồ sơ khách hàng không tồn tại.',409);
  const settings=(await tx.request().query(settingsQuery)).recordset[0];
  const staff=(await tx.request().input('NV',sql.Char(8),process.env.WEB_ORDER_EMPLOYEE||null).query(`SELECT TOP 1 MaNV FROM NHAN_VIEN WHERE TrangThai=N'Đang làm việc' AND ChucVu IN (N'Bán hàng',N'Quản lý') AND (@NV IS NULL OR MaNV=@NV) ORDER BY CASE ChucVu WHEN N'Bán hàng' THEN 0 WHEN N'Quản lý' THEN 1 ELSE 2 END,MaNV`)).recordset[0];if(!staff)fail('Chưa cấu hình nhân viên tiếp nhận đơn website.',409);
  const subtotal=items.reduce((sum,item)=>sum+Number(item.GiaBan)*item.SoLuong,0);const pricing=await priceOrder(tx,subtotal,b,true,{customerType:customer.recordset[0].MaLoaiKH,lines:items.map(i=>({productId:i.MaSP,amount:Number(i.GiaBan)*i.SoLuong}))});const shipping=pricing.shipping,discount=pricing.discount,total=pricing.total;
  if(!Number.isFinite(subtotal)||subtotal<=0)fail('Tổng giá trị đơn hàng không hợp lệ.');
  if(b.tongDuKien!==undefined && (!Number.isFinite(Number(b.tongDuKien)) || Math.abs(Number(b.tongDuKien)-(total))>0.001))fail('Giá sản phẩm hoặc phí giao hàng đã thay đổi. Vui lòng kiểm tra lại giỏ hàng trước khi đặt.',409);
  await tx.request().input('MaDH',sql.Char(8),maDH).input('Total',sql.Decimal(19,3),subtotal+shipping).input('Discount',sql.Decimal(19,3),discount).input('Net',sql.Decimal(19,3),total).input('NV',sql.Char(8),staff.MaNV).input('KH',sql.Char(8),req.user.maKH).query(`INSERT INTO DON_HANG(MaDH,NgayDat,TongTienDonHang,TongGiamGiaSP,TongTienSauGiam,TrangThaiDonHang,NguonDon,MaNV,MaKH) VALUES(@MaDH,GETDATE(),@Total,@Discount,@Net,N'Chờ giao','Website',@NV,@KH)`);
  await tx.request().input('MaDH',sql.Char(8),maDH).input('Key',sql.VarChar(64),key).input('User',sql.VarChar(50),req.user.sub).input('Name',sql.NVarChar(100),name).input('Phone',sql.VarChar(20),phone).input('Email',sql.VarChar(100),email).input('Address',sql.NVarChar(500),address).input('Note',sql.NVarChar(1000),note).input('Method',sql.NVarChar(50),b.hinhThucTT).input('Shipping',sql.Decimal(19,3),shipping).input('Total',sql.Decimal(19,3),total).query(`INSERT INTO WEB_DON_HANG(MaDH,MaYeuCau,TenDangNhap,NguoiNhan,SoDT,Email,DiaChi,GhiChu,HinhThucTT,PhiVanChuyen,TongThanhToan) VALUES(@MaDH,@Key,@User,@Name,@Phone,@Email,@Address,@Note,@Method,@Shipping,@Total)`);

  await tx.request().input('ID',sql.Char(8),maDH).input('Code',sql.VarChar(30),pricing.code||null).input('Discount',sql.Decimal(19,3),discount).input('Province',sql.Int,delivery.province.code).input('ProvinceName',sql.NVarChar(100),delivery.province.name).input('Ward',sql.Int,delivery.ward.code).input('WardName',sql.NVarChar(100),delivery.ward.name).input('Detail',sql.NVarChar(250),delivery.detail).query('INSERT INTO WEB_UU_DAI_DON_HANG(MaDH,MaGiamGia,TienGiam,MaTinhThanh,TenTinhThanh,MaPhuongXa,TenPhuongXa,DiaChiChiTiet) VALUES(@ID,@Code,@Discount,@Province,@ProvinceName,@Ward,@WardName,@Detail)');
  if(b.luuDiaChi){await tx.request().input('User',sql.VarChar(50),req.user.sub).input('Name',sql.NVarChar(100),name).input('Phone',sql.VarChar(20),phone).input('Province',sql.Int,delivery.province.code).input('ProvinceName',sql.NVarChar(100),delivery.province.name).input('Ward',sql.Int,delivery.ward.code).input('WardName',sql.NVarChar(100),delivery.ward.name).input('Detail',sql.NVarChar(250),delivery.detail).query(`IF NOT EXISTS(SELECT 1 FROM WEB_DIA_CHI WHERE TenDangNhap=@User AND MaPhuongXa=@Ward AND DiaChiChiTiet=@Detail AND NguoiNhan=@Name AND SoDT=@Phone) INSERT INTO WEB_DIA_CHI(TenDangNhap,NguoiNhan,SoDT,MaTinhThanh,TenTinhThanh,MaPhuongXa,TenPhuongXa,DiaChiChiTiet) VALUES(@User,@Name,@Phone,@Province,@ProvinceName,@Ward,@WardName,@Detail)`);}

  for(const item of items){
   await tx.request().input('MaDH',sql.Char(8),maDH).input('SP',sql.Char(5),item.MaSP).input('Line',sql.Int,item.MaGH).input('Gram',sql.Int,item.TrongLuongGram).input('Grind',sql.NVarChar(80),item.LoaiXay).input('Qty',sql.Int,item.SoLuong).input('Name',sql.NVarChar(100),item.TenSP).input('Price',sql.Decimal(19,3),item.GiaBan).input('Total',sql.Decimal(19,3),Number(item.GiaBan)*item.SoLuong).input('User',sql.VarChar(50),req.user.sub).query(`INSERT INTO CT_DON_HANG(MaDH,MaSP,SoLuong,GiamGiaSP,TrongLuongGram,LoaiXay,DonGia) VALUES(@MaDH,@SP,@Qty,0,@Gram,@Grind,@Price); INSERT INTO WEB_CT_DON_HANG(MaDH,MaSP,TenSP,GiaBan,SoLuong,ThanhTien,TrongLuongGram,LoaiXay) VALUES(@MaDH,@SP,@Name,@Price,@Qty,@Total,@Gram,@Grind); DELETE FROM GIO_HANG WHERE TenDangNhap=@User AND MaGH=@Line;`);
  }
  await saveAppliedCoupon(tx,maDH,{code:pricing.code,couponDiscount:discount});
  // COD: unpaid invoice (+ receivable via sp_LapHoaDon) and order email right away.
  // Bank transfer: no invoice until the VietQR payment is confirmed (routes/thanh-toan-qr.js).
  const cod=b.hinhThucTT==='Tiền mặt';
  order={MaDH:maDH,NguoiNhan:name,SoDT:phone,Email:email,DiaChi:address,GhiChu:note,HinhThucTT:b.hinhThucTT,PhiVanChuyen:shipping,TienGiam:discount,MaGiamGia:pricing.code,TongThanhToan:total,TrangThaiThanhToan:'Chưa thanh toán'};
  if(cod){
   await tx.request().input('MaDH',sql.Char(8),maDH).input('MaNV',sql.Char(8),staff.MaNV).input('HinhThucThanhToan',sql.NVarChar(50),'Tiền mặt').input('TrangThaiThanhToan',sql.NVarChar(50),'Chưa thanh toán').execute('sp_LapHoaDon');
   await tx.request().input('MaDH',sql.Char(8),maDH).input('To',sql.VarChar(100),email).input('Subject',sql.NVarChar(250),orderEmailSubject(order)).input('Html',sql.NVarChar(sql.MAX),renderOrderEmail(order,items,settings)).query('INSERT INTO WEB_EMAIL(MaDH,NguoiNhan,TieuDe,NoiDung) VALUES(@MaDH,@To,@Subject,@Html)');
  }
  await tx.commit();
 }catch(err){try{await tx.rollback();}catch(_){}throw err;}
 // A mail failure must never turn a committed order into a failed checkout.
 if(order.HinhThucTT==='Tiền mặt')try{await deliverOrderEmail(order.MaDH);}catch(err){console.error('[WEB EMAIL] Không gửi được email cho',order.MaDH);}
 res.status(201).json({success:true,data:{maDH:order.MaDH,hinhThucTT:order.HinhThucTT}});
}));
router.get('/website/orders/:id',wrap(async(req,res)=>{const pool=await poolPromise;const r=await pool.request().input('ID',sql.Char(8),req.params.id).input('User',sql.VarChar(50),req.user.sub).query(`SELECT w.*,u.TienGiam,u.MaGiamGia,dh.TrangThaiDonHang,(SELECT TOP 1 hd.TrangThaiThanhToan FROM HOA_DON hd WHERE hd.MaDH=w.MaDH ORDER BY hd.MaHD DESC) AS TrangThaiThanhToan,e.TrangThai AS TrangThaiEmail FROM WEB_DON_HANG w LEFT JOIN WEB_UU_DAI_DON_HANG u ON u.MaDH=w.MaDH JOIN DON_HANG dh ON dh.MaDH=w.MaDH LEFT JOIN WEB_EMAIL e ON e.MaDH=w.MaDH WHERE w.MaDH=@ID AND w.TenDangNhap=@User`);if(!r.recordset[0])fail('Không tìm thấy đơn hàng.',404);const items=await pool.request().input('ID',sql.Char(8),req.params.id).query('SELECT * FROM WEB_CT_DON_HANG WHERE MaDH=@ID');res.json({success:true,data:{...r.recordset[0],items:items.recordset}});}));
router.get('/website/orders/:id/email',wrap(async(req,res)=>{const pool=await poolPromise;const r=await pool.request().input('ID',sql.Char(8),req.params.id).input('User',sql.VarChar(50),req.user.sub).query(`SELECT e.NoiDung FROM WEB_EMAIL e JOIN WEB_DON_HANG w ON w.MaDH=e.MaDH WHERE w.MaDH=@ID AND w.TenDangNhap=@User AND EXISTS(SELECT 1 FROM HOA_DON h WHERE h.MaDH=w.MaDH)`);if(!r.recordset[0])fail('Không tìm thấy email.',404);res.set('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; img-src data:").type('html').send(emailPreviewHtml(r.recordset[0].NoiDung));}));
module.exports=router;



