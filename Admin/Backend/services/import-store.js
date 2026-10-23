const {sql}=require('../../../Shared/Backend/config/database');
const {posPricing}=require('../../../Shared/Backend/services/pos-pricing');
function fail(message,fields,productId){const error=Error(message);error.fields=fields;error.productId=productId;throw error;}
async function query(db,text,values={}){
 const req=db.request();for(const [k,v] of Object.entries(values)){
  // The legacy Windows ODBC driver rejects datetime parameters; ISO text is
  // converted by SQL Server to the destination date/datetime column instead.
  const type=v instanceof Date?sql.NVarChar(33):typeof v==='number'?(k==='GiamGiaSP'?sql.Decimal(5,4):sql.Decimal(19,3)):sql.NVarChar(sql.MAX);
  req.input(k,type,v instanceof Date?v.toISOString().replace(/Z$/,''):v??null);
 }return (await req.query(text)).recordset;
}
async function insert(db,table,values){
 const keys=Object.keys(values);await query(db,`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(k=>'@'+k).join(',')})`,values);
}
async function newest(db,table,key){return (await query(db,`SELECT TOP 1 ${key} AS id FROM ${table} WITH(UPDLOCK,HOLDLOCK) ORDER BY ${key} DESC`))[0].id;}
async function lookups(db,def){
 const result={};for(const c of def.columns)if(c.ref){const r=c.ref;result[c.key]=(await query(db,`SELECT ${r.id} AS id,${r.name} AS name FROM ${r.table} ORDER BY ${r.id}`)).map(x=>({id:String(x.id).trim(),name:String(x.name).trim()}));}
 if(def.orderCustomers)result.customers=await query(db,'SELECT MaKH,TenKH,SoDTKH,EmailKH,GioiTinhKH,DiaChiKH,MaLoaiKH FROM KHACH_HANG');
 return result;
}
async function save(db,def,group,context={createdCustomers:new Map()}){
 const row=group[0],d={...row.data};
 if(def.table==='KHACH_HANG'){
  const duplicate=await query(db,'SELECT MaKH FROM KHACH_HANG WITH(UPDLOCK,HOLDLOCK) WHERE SoDTKH=@Phone AND (@ID IS NULL OR MaKH<>@ID)',{Phone:d.SoDTKH,ID:d.MaKH});
  if(duplicate.length)fail('Số điện thoại khách hàng đã tồn tại trong hệ thống.',['SoDTKH']);
 }
 if(def.document){
  if(def.table==='DON_HANG'){
   if(!d.MaKH){
    const phone=String(d.SoDTKH).trim();
    if(context.createdCustomers.has(phone))d.MaKH=context.createdCustomers.get(phone);
    else{
     const existing=await query(db,'SELECT MaKH FROM KHACH_HANG WITH(UPDLOCK,HOLDLOCK) WHERE SoDTKH=@Phone',{Phone:phone});
     if(existing.length)fail('Số điện thoại đã tồn tại. Vui lòng dùng mã khách hàng '+String(existing[0].MaKH).trim()+'.',['SoDTKH']);
     await insert(db,'KHACH_HANG',{TenKH:d.TenKH,SoDTKH:phone,EmailKH:d.EmailKH,GioiTinhKH:d.GioiTinhKH,DiaChiKH:d.DiaChiKH,MaLoaiKH:d.MaLoaiKH});
     d.MaKH=await newest(db,'KHACH_HANG','MaKH');context.createdCustomers.set(phone,d.MaKH);
    }
   }
   const items=group.map(r=>({maSP:r.data.MaSP,qty:r.data.SoLuong,trongLuongGram:r.data.TrongLuongGram,loaiXay:r.data.LoaiXay,itemDiscount:r.data.GiamGiaSP||0}));
   const pricing=await posPricing(db,{maKH:d.MaKH,cartItems:items});
   for(const item of items){const stock=(await query(db,'SELECT SoLuongKD FROM SAN_PHAM WITH(UPDLOCK,HOLDLOCK) WHERE MaSP=@MaSP',{MaSP:item.maSP}))[0];if(!stock||Number(stock.SoLuongKD)<item.qty)fail('Không đủ tồn khả dụng cho sản phẩm '+item.maSP,['SoLuong'],item.maSP);}
   await insert(db,'DON_HANG',{NgayDat:new Date(Date.now()+7*3600000),TongTienDonHang:pricing.raw,TongGiamGiaSP:pricing.totalDiscount,TongTienSauGiam:pricing.finalTotal,TrangThaiDonHang:d.TrangThaiDonHang,NguonDon:'Sale',MaNV:d.MaNV,MaKH:d.MaKH});
   const id=await newest(db,'DON_HANG','MaDH');
   for(const item of pricing.items)await insert(db,'CT_DON_HANG',{MaDH:id,MaSP:item.maSP,SoLuong:item.qty,GiamGiaSP:item.itemDiscount,TrongLuongGram:item.TrongLuongGram,LoaiXay:item.LoaiXay,DonGia:item.DonGia});
  }else if(def.table==='PHIEU_NHAP'){
   const total=group.reduce((s,r)=>s+r.data.SoLuong*r.data.GiaNhap,0);
   await insert(db,'PHIEU_NHAP',{NgayNhap:new Date(d.NgayNhap+'T00:00:00+07:00'),SoHoaDonNCC:d.SoHoaDonNCC,TongTienNhap:total,SoTienDaTraNCC:0,TrangThaiThanhToan:'Chưa thanh toán',GhiChu:d.GhiChu,MaNV:d.MaNV,MaNCC:d.MaNCC});
   const id=await newest(db,'PHIEU_NHAP','MaPN');
   for(const r of group){await insert(db,'CT_PHIEU_NHAP',{MaPN:id,MaSP:r.data.MaSP,SoLuong:r.data.SoLuong,GiaNhap:r.data.GiaNhap});await query(db,'UPDATE SAN_PHAM SET SoLuongTon=SoLuongTon+@Qty,SoLuongKD=SoLuongKD+@Qty WHERE MaSP=@SP',{Qty:r.data.SoLuong,SP:r.data.MaSP});}
  }else if(def.table==='HOA_DON'){
   if((await query(db,'SELECT MaHD FROM HOA_DON WITH(UPDLOCK,HOLDLOCK) WHERE MaDH=@MaDH',{MaDH:d.MaDH})).length)throw Error('Đơn hàng đã có hóa đơn.');
   const order=(await query(db,'SELECT TongTienSauGiam,TrangThaiDonHang FROM DON_HANG WHERE MaDH=@MaDH',{MaDH:d.MaDH}))[0];
   if(!order||['Đã hủy','Hủy','Không hoàn thành','Không thành công'].includes(order.TrangThaiDonHang))throw Error('Đơn hàng không thể lập hóa đơn.');
   if(d.SoTienKhachTra>Number(order.TongTienSauGiam))throw Error('Tiền trả trước không được vượt số tiền đơn hàng.');
   await insert(db,'HOA_DON',{NgayLap:new Date(),HinhThucThanhToan:d.HinhThucThanhToan,TongTienGiamGia:0,TongTienThanhToan:order.TongTienSauGiam,TrangThaiThanhToan:d.TrangThaiThanhToan,MaNV:d.MaNV,MaDH:d.MaDH});
   if(d.TrangThaiThanhToan==='Chưa thanh toán'){
    const id=await newest(db,'HOA_DON','MaHD');await insert(db,'CONG_NO',{HanThanhToan:new Date(Date.now()+30*86400000),NgayGhiNhan:new Date(),SoTienDaTra:0,TongNo:order.TongTienSauGiam,SoDuCN:order.TongTienSauGiam,TrangThaiCN:'Còn nợ',MaHD:id});
    if(d.SoTienKhachTra>0){const debt=await newest(db,'CONG_NO','MaCN');await insert(db,'PHIEU_THU',{NgayThu:new Date(),SoTienThucThu:d.SoTienKhachTra,HinhThucThanhToan:d.HinhThucThanhToan,GhiChu:'Khách trả trước khi lập hóa đơn',MaCN:debt,MaNV:d.MaNV});}
   }
  }else if(def.table==='PHIEU_XUAT'){
   if((await query(db,'SELECT MaPX FROM PHIEU_XUAT WITH(UPDLOCK,HOLDLOCK) WHERE MaDH=@MaDH',{MaDH:d.MaDH})).length)throw Error('Đơn hàng đã có phiếu xuất.');
   const order=(await query(db,'SELECT TrangThaiDonHang FROM DON_HANG WHERE MaDH=@MaDH',{MaDH:d.MaDH}))[0];
   if(!order||['Hoàn thành','Đã hủy','Hủy','Không hoàn thành','Không thành công'].includes(order.TrangThaiDonHang))throw Error('Trạng thái đơn hàng không cho phép tạo phiếu xuất.');
   await insert(db,'PHIEU_XUAT',{NgayXuat:new Date(d.NgayXuat+'T00:00:00+07:00'),TrangThaiGiaoHang:'Chờ lấy hàng',MaNV:d.MaNV,MaDH:d.MaDH});
  }else if(def.table==='PHIEU_THU'){
   const debt=(await query(db,'SELECT cn.SoDuCN,dh.MaKH FROM CONG_NO cn WITH(UPDLOCK,HOLDLOCK) JOIN HOA_DON hd ON hd.MaHD=cn.MaHD JOIN DON_HANG dh ON dh.MaDH=hd.MaDH WHERE cn.MaCN=@MaCN',{MaCN:d.MaCN}))[0];
   if(debt&&String(debt.MaKH).trim()!==String(d.MaKH).trim())throw Error('Mã công nợ không thuộc khách hàng đã chọn.');
   if(!debt||Number(debt.SoDuCN)<d.SoTienThucThu)throw Error('Số tiền thu vượt số dư công nợ.');
   await insert(db,'PHIEU_THU',{NgayThu:new Date(),SoTienThucThu:d.SoTienThucThu,HinhThucThanhToan:d.HinhThucThanhToan,GhiChu:d.GhiChu,MaCN:d.MaCN,MaNV:d.MaNV});
  }else if(def.table==='PHIEU_CHI'){
   const debt=(await query(db,'SELECT TongTienNhap-SoTienDaTraNCC AS SoDu FROM PHIEU_NHAP WITH(UPDLOCK,HOLDLOCK) WHERE MaPN=@MaPN',{MaPN:d.MaPN}))[0];
   if(!debt||Number(debt.SoDu)<d.SoTienThucChi)throw Error('Số tiền chi vượt số tiền còn phải trả NCC.');
   await insert(db,'PHIEU_CHI',{NgayChi:new Date(),SoTienThucChi:d.SoTienThucChi,HinhThucThanhToan:d.HinhThucThanhToan,GhiChu:d.GhiChu,MaPN:d.MaPN,MaNV:d.MaNV});
  }
  return;
 }
 if(def.coupon){
  d.BatDau=d.BatDau instanceof Date?d.BatDau:new Date(d.BatDau+'T00:00:00+07:00');
  d.KetThuc=d.KetThuc?(d.KetThuc instanceof Date?d.KetThuc:new Date(new Date(d.KetThuc+'T00:00:00+07:00').getTime()+86400000)):null;
  d.HienThi=d.TrangThai==='Hoạt động'?1:0;d.ChoPhepKetHop=Number(d.ChoPhepKetHop);
  d.MoTa=d.MoTa||'';
  if(!d.MaGiamGia)delete d.MaGiamGia;
 }
 if(def.table==='WEB_PHI_VAN_CHUYEN')d.TenKhuVuc=d.MaTinhThanh?(await query(db,'SELECT TenTinhThanh FROM WEB_TINH_THANH WHERE MaTinhThanh=@MaTinhThanh',{MaTinhThanh:d.MaTinhThanh}))[0].TenTinhThanh:'Khu vực mặc định';
 if(def.table==='WEB_PHUONG_XA'&&row.action==='update'&&String(row.old.MaTinhThanh).trim()!==String(d.MaTinhThanh).trim())fail('Không đổi tỉnh của phường/xã đã có, giống form chỉnh sửa.',['MaTinhThanh']);
 const account=def.table==='NHAN_VIEN'?{username:d.TenDangNhap,password:d.MatKhau}:null;
 if(account){delete d.TenDangNhap;delete d.MatKhau;}
 if(row.action==='update'){
  const keys=Object.keys(d).filter(k=>k!==def.key);
  await query(db,`UPDATE ${def.table} SET ${keys.map(k=>k+'=@'+k).join(',')} WHERE ${def.key}=@${def.key} OR (${def.key} IS NULL AND @${def.key} IS NULL)`,d);
 }else{
  if(def.auto)delete d[def.key];
  await insert(db,def.table,d);
 }
 if(account?.username){
  const id=row.action==='update'?d.MaNV:await newest(db,'NHAN_VIEN','MaNV');
  const linked=await query(db,'SELECT TenDangNhap,MaNV FROM TAI_KHOAN WITH(UPDLOCK,HOLDLOCK) WHERE TenDangNhap=@User OR MaNV=@ID',{User:account.username,ID:id});
  if(linked.some(a=>String(a.TenDangNhap).trim()!==account.username||String(a.MaNV||'').trim()!==String(id).trim()))throw Error('Tên đăng nhập đã thuộc tài khoản khác hoặc nhân viên đã có tài khoản khác.');
  const password=await require('bcryptjs').hash(account.password,10);
  if(linked.length)await query(db,'UPDATE TAI_KHOAN SET MatKhau=@Password WHERE TenDangNhap=@User AND MaNV=@ID',{Password:password,User:account.username,ID:id});
  else await insert(db,'TAI_KHOAN',{TenDangNhap:account.username,MatKhau:password,MaNV:id,VaiTro:'NHAN_VIEN'});
 }
}
module.exports={query,lookups,save};
