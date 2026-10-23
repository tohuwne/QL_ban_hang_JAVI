const {sql} = require('../config/database');
const {validateOptions,factor:weightFactor,optionKey}=require('./product-options');
const {priceOrder} = require('./checkout-pricing');
function reject(message) {const e=new Error(message);e.status=400;throw e;}
async function posPricing(db, body, orderId=null) {
  const items=body.cartItems;
  if(!Array.isArray(items)||!items.length||items.length>100)reject('Chọn từ 1 đến 100 sản phẩm.');
  if(new Set(items.map(i=>optionKey({MaSP:i.maSP,TrongLuongGram:i.trongLuongGram,LoaiXay:i.loaiXay}))).size!==items.length)reject('Sản phẩm bị trùng trong đơn hàng.');
  let raw=0,lineDiscount=0;const lines=[],resolved=[];
  for(const item of items){
    const qty=Number(item.qty),discount=Number(item.itemDiscount||0);
    if(!Number.isInteger(qty)||qty<1||qty>999||!Number.isFinite(discount)||discount<0||discount>1)reject('Số lượng hoặc giảm giá sản phẩm không hợp lệ.');
    const r=await db.request().input('SP',sql.Char(5),item.maSP).query('SELECT s.GiaBan,s.MaLoaiSP,l.ApDungTuyChon FROM SAN_PHAM s JOIN LOAI_SAN_PHAM l ON s.MaLoaiSP=l.MaLoaiSP WHERE s.MaSP=@SP');
    if(!r.recordset[0])reject('Sản phẩm không tồn tại.');
    const options=await validateOptions(db,r.recordset[0],item.trongLuongGram,item.loaiXay);const unitPrice=Number(r.recordset[0].GiaBan)*weightFactor(options);resolved.push({...item,...options,DonGia:unitPrice});
    const total=unitPrice*qty;raw+=total;lineDiscount+=total*discount;lines.push({productId:item.maSP,amount:total*(1-discount)});
  }
  const r=await db.request().input('KH',sql.Char(8),body.maKH).query('SELECT k.MaLoaiKH,ISNULL(l.TyLeChietKhau,0) AS Rate FROM KHACH_HANG k LEFT JOIN LOAI_KHACH_HANG l ON l.MaLoaiKH=k.MaLoaiKH WHERE k.MaKH=@KH');
  if(!r.recordset[0])reject('Khách hàng không tồn tại.');
  const customerDiscount=(raw-lineDiscount)*Number(r.recordset[0].Rate);
  const value=Number(body.giamThuCong||0),kind=body.loaiGiamThuCong||'VNĐ';
  if(!Number.isFinite(value)||value<0||!['VNĐ','%'].includes(kind)||(kind==='%'&&value>100))reject('Giảm giá thủ công không hợp lệ.');
  const remaining=raw-lineDiscount-customerDiscount;
  const manual=Math.min(remaining,kind==='%'?remaining*value/100:value);
  const factor=raw>lineDiscount?(remaining-manual)/(raw-lineDiscount):0;
  if(body.maGiamGias!==undefined&&!Array.isArray(body.maGiamGias))reject('Danh sách mã giảm giá không hợp lệ.');
  const codes=(body.maGiamGias??(body.maGiamGia?[body.maGiamGia]:[])).map(code=>String(code).trim().toUpperCase()).sort();
  if(codes.length>20||codes.some(code=>!code)||new Set(codes).size!==codes.length)reject('Chọn tối đa 20 mã khác nhau.');
  if(codes.length>1){
    const schema=await db.request().query("SELECT COUNT(*) AS KeyColumns FROM sys.indexes i JOIN sys.index_columns c ON c.object_id=i.object_id AND c.index_id=i.index_id WHERE i.object_id=OBJECT_ID('WEB_AP_DUNG_MA') AND i.is_primary_key=1 AND c.key_ordinal>0");
    if(Number(schema.recordset[0]?.KeyColumns)!==2)reject('Cấu trúc dữ liệu hiện tại chỉ hỗ trợ một mã trên đơn. Cần chạy bản database.sql mới để dùng nhiều mã.');
  }
  let balance=remaining-manual,couponDiscount=0;
  const couponLines=lines.map(line=>({...line,amount:line.amount*factor})),coupons=[];
  for(const code of codes){
    const quote=await priceOrder(db,balance,{maGiamGia:code},false,{orderId,lockCoupons:true,customerType:r.recordset[0].MaLoaiKH,lines:couponLines});
    if(codes.length>1&&!quote.allowsCombination)reject('Mã '+code+' không cho phép kết hợp với mã khác.');
    if(quote.discount<=0)reject('Mã '+code+' không còn số tiền hợp lệ để giảm.');
    coupons.push({code:quote.code,discount:quote.discount});couponDiscount+=quote.discount;balance=Math.max(0,balance-quote.discount);
    // Each next code sees only the remaining value of its eligible products.
    const eligible=couponLines.filter(line=>!quote.productId||String(line.productId).trim()===quote.productId),total=eligible.reduce((sum,line)=>sum+line.amount,0);
    eligible.forEach(line=>{line.amount=Math.max(0,line.amount*(1-quote.discount/total));});
  }
  const totalDiscount=Math.round((lineDiscount+customerDiscount+manual+couponDiscount)*1000)/1000;
  return {items:resolved,raw,totalDiscount,finalTotal:Math.round((raw-totalDiscount)*1000)/1000,couponDiscount,coupons,codes:coupons.map(c=>c.code),code:coupons.length===1?coupons[0].code:''};
}
async function saveAppliedCoupon(db,id,pricing){
  const coupons=pricing.coupons??(pricing.code&&pricing.couponDiscount>0?[{code:pricing.code,discount:pricing.couponDiscount}]:[]);
  for(const applied of [...coupons].sort((a,b)=>a.code.localeCompare(b.code))){
    // Call inside the order transaction, before inserting/updating the usage row.
    const r=await db.request().input('Code',sql.VarChar(30),applied.code).input('ID',sql.Char(8),id).query(`SELECT m.SoLuong,m.TrangThai,m.BatDau,m.KetThuc,m.ChoPhepKetHop,(SELECT COUNT(*) FROM WEB_AP_DUNG_MA a JOIN DON_HANG d ON d.MaDH=a.MaDH WHERE a.MaGiamGia=m.MaGiamGia AND a.MaDH<>@ID AND ISNULL(d.TrangThaiDonHang,N'') NOT IN(N'Không hoàn thành',N'Không thành công',N'Đã hủy',N'Hủy')) AS SoLuotDaTinh FROM WEB_MA_GIAM_GIA m WITH(UPDLOCK,HOLDLOCK) WHERE m.MaGiamGia=@Code`);
    const coupon=r.recordset[0];
    if(!coupon||coupon.TrangThai!=='Hoạt động')reject('Mã đang tạm ngưng hoạt động');
    if(coupons.length>1&&!coupon.ChoPhepKetHop)reject('Mã '+applied.code+' không cho phép kết hợp với mã khác.');
    const now=Date.now();if(new Date(coupon.BatDau).getTime()>now)reject('Mã chưa đến ngày áp dụng');
    if(coupon.KetThuc&&new Date(coupon.KetThuc).getTime()<=now)reject('Mã đã hết hạn sử dụng');
    if(coupon.SoLuong!=null&&Number(coupon.SoLuotDaTinh)>=Number(coupon.SoLuong))reject('Mã đã hết lượt sử dụng');
  }
  await db.request().input('ID',sql.Char(8),id).query('DELETE FROM WEB_AP_DUNG_MA WHERE MaDH=@ID');
  for(const applied of coupons)await db.request().input('ID',sql.Char(8),id).input('Code',sql.VarChar(30),applied.code).input('Amount',sql.Decimal(19,3),applied.discount).query('INSERT INTO WEB_AP_DUNG_MA(MaDH,MaGiamGia,TienGiam) VALUES(@ID,@Code,@Amount)');
}
module.exports={posPricing,saveAppliedCoupon};
