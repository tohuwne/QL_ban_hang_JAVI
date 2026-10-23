const divisions = require('../data/vietnam-divisions.json');
const {sql} = require('../config/database');
function invalid(message) { const e = new Error(message); e.status = 400; throw e; }
function resolveAddress(input, locations=divisions) {
  const province = locations.find(p => String(p.code) === String(input.tinhThanh));
  const ward = province?.wards.find(w => String(w.code) === String(input.phuongXa));
  const detail = String(input.diaChiChiTiet || '').trim();
  if (!province || !ward || detail.length < 5 || detail.length > 250) invalid('Chọn tỉnh/thành, phường/xã và nhập địa chỉ chi tiết (5–250 ký tự).');
  return {province, ward, detail, full: `${detail}, ${ward.name}, ${province.name}`};
}
async function databaseLocations(db){
 const p=await db.request().query('SELECT MaTinhThanh,TenTinhThanh FROM WEB_TINH_THANH ORDER BY TenTinhThanh');
 const w=await db.request().query('SELECT MaPhuongXa,MaTinhThanh,TenPhuongXa FROM WEB_PHUONG_XA ORDER BY TenPhuongXa');
 return p.recordset.map(p=>({code:p.MaTinhThanh,name:p.TenTinhThanh,wards:w.recordset.filter(w=>w.MaTinhThanh===p.MaTinhThanh).map(w=>({code:w.MaPhuongXa,name:w.TenPhuongXa}))}));
}
async function resolveDatabaseAddress(db,input){return resolveAddress(input,await databaseLocations(db));}
function discountAmount(subtotal, coupon) {
  if (!coupon) return 0;
  if (subtotal < Number(coupon.DonToiThieu)) invalid('Tiền hàng thuộc sản phẩm được áp dụng chưa đạt mức tối thiểu của mã.');
  const raw = coupon.LoaiGiam === 'percent' ? Math.floor(subtotal * Number(coupon.GiaTri) / 100) : Number(coupon.GiaTri);
  return Math.max(0, Math.min(subtotal, raw, coupon.GiamToiDa == null ? Infinity : Number(coupon.GiamToiDa)));
}
function eligibleSubtotal(subtotal, coupon, context = {}) {
  if (!coupon) return subtotal;
  const customerType=String(coupon.MaLoaiKH||'').trim();
  if(customerType && customerType!==String(context.customerType||'').trim()) invalid('Mã giảm giá không áp dụng cho loại khách hàng của bạn.');
  const productId=String(coupon.MaSP||'').trim();
  if(!productId) return subtotal;
  const amount=(context.lines||[]).filter(line=>String(line.productId||'').trim()===productId).reduce((sum,line)=>sum+Number(line.amount),0);
  if(!Number.isFinite(amount)||amount<=0) invalid('Các sản phẩm được chọn không thuộc loại sản phẩm áp dụng mã này.');
  return Math.min(subtotal,amount);
}
function couponUnavailableReason(coupon, subtotal, context={}, checkProducts=true, now=Date.now()) {
  if(coupon.TrangThai && coupon.TrangThai!=='Hoạt động') return 'Mã đang tạm ngưng hoạt động';
  if(coupon.BatDau && new Date(coupon.BatDau).getTime()>now) return 'Mã chưa đến ngày áp dụng';
  if(coupon.KetThuc && new Date(coupon.KetThuc).getTime()<=now) return 'Mã đã hết hạn sử dụng';
  if(coupon.SoLuong!=null && Number(coupon.SoLuotDaTinh||0)>=Number(coupon.SoLuong)) return 'Mã đã hết lượt sử dụng';
  if(coupon.MaLoaiKH && String(coupon.MaLoaiKH).trim()!==String(context.customerType||'').trim()) return 'Mã không áp dụng cho loại khách hàng của bạn';
  if(checkProducts){try{const eligible=eligibleSubtotal(subtotal,coupon,context);if(eligible<Number(coupon.DonToiThieu))return 'Tiền hàng của sản phẩm được áp dụng chưa đạt mức tối thiểu '+Number(coupon.DonToiThieu).toLocaleString('vi-VN')+'đ';}catch(e){return e.message;}}
  return '';
}
async function priceOrder(db, subtotal, input, requireAddress = true, context = {}) {
  const address = requireAddress ? await resolveDatabaseAddress(db,input) : null;
  let shipping = null;
  if (address) {
    const r = await db.request().input('Province', sql.Int, address.province.code).query('SELECT TOP 1 * FROM WEB_PHI_VAN_CHUYEN WHERE (MaTinhThanh=@Province OR MaTinhThanh IS NULL) ORDER BY CASE WHEN MaTinhThanh IS NULL THEN 1 ELSE 0 END, ID');
    const rate = r.recordset[0];
    if (!rate || !rate.HienThi) invalid('Khu vực này chưa có phí giao hàng. Vui lòng liên hệ JAVI.');
    shipping = rate.MienPhiTu != null && subtotal >= Number(rate.MienPhiTu) ? 0 : Number(rate.PhiVanChuyen);
  }
  const code = String(input.maGiamGia || '').trim().toUpperCase();
  if (code && !/^[A-Z0-9_-]{1,30}$/.test(code)) invalid('Mã giảm giá không hợp lệ.');
  let coupon = null;
  if (code) {
    const r = await db.request().input('Code', sql.VarChar(30), code).input('Exclude',sql.Char(8),context.orderId||null).query(`SELECT m.*,(SELECT COUNT(*) FROM WEB_AP_DUNG_MA a JOIN DON_HANG d ON d.MaDH=a.MaDH WHERE a.MaGiamGia=m.MaGiamGia AND (@Exclude IS NULL OR a.MaDH<>@Exclude) AND ISNULL(d.TrangThaiDonHang,N'') NOT IN(N'Không hoàn thành',N'Không thành công',N'Đã hủy',N'Hủy')) AS SoLuotDaTinh FROM WEB_MA_GIAM_GIA m${context.lockCoupons?' WITH(UPDLOCK,HOLDLOCK)':''} WHERE MaGiamGia=@Code`);
    coupon = r.recordset[0]; if (!coupon) invalid('Mã giảm giá không tồn tại');
    const reason=couponUnavailableReason(coupon,subtotal,context);if(reason)invalid(reason);
  }
  const eligible = eligibleSubtotal(subtotal,coupon,context);
  const discount = discountAmount(eligible, coupon);
  return {subtotal, eligibleSubtotal:eligible, shipping, discount, total: subtotal - discount + (shipping || 0), code: coupon?.MaGiamGia || '', allowsCombination:!!coupon?.ChoPhepKetHop,productId:String(coupon?.MaSP||'').trim(),address};
}
module.exports = {divisions, resolveAddress, databaseLocations,resolveDatabaseAddress, discountAmount, eligibleSubtotal, couponUnavailableReason, priceOrder};
