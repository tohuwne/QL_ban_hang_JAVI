// One registry for workbook columns, preview validation and database writes.
const text=(key,label,required=false,max=100,extra={})=>({key,label,required,max,type:'text',...extra});
const number=(key,label,required=false,min=0,extra={})=>({key,label,required,type:'number',min,...extra});
const choice=(key,label,values,required=true)=>text(key,label,required,100,{values});
const ref=(key,label,table,id,name,required=true)=>text(key,label,required,50,{ref:{table,id,name}});
const date=(key,label,required=true)=>({key,label,required,type:'date'});
const nv=()=>ref('MaNV','Mã nhân viên','NHAN_VIEN','MaNV','HoTenNV');
const sp=()=>ref('MaSP','Mã sản phẩm','SAN_PHAM','MaSP','TenSP');
const sex=key=>choice(key,'Giới tính',['Nam','Nữ']);
const pay=()=>choice('HinhThucThanhToan','Hình thức thanh toán',['Tiền mặt','Chuyển khoản']);
const note=()=>text('GhiChu','Ghi chú',false,255);
const schema={
 'loai-sp':{title:'Loại sản phẩm',table:'LOAI_SAN_PHAM',key:'MaLoaiSP',columns:[text('MaLoaiSP','Mã loại sản phẩm',true,3),text('TenLoaiSP','Tên loại sản phẩm',true,50)]},
 'loai-kh':{title:'Loại khách hàng',table:'LOAI_KHACH_HANG',key:'MaLoaiKH',columns:[text('MaLoaiKH','Mã loại khách hàng',true,3),text('TenLoaiKH','Tên loại khách hàng',true,50),number('TyLeChietKhau','Chiết khấu (%)',true,0,{max:100,scale:100})]},
 'san-pham':{title:'Sản phẩm',table:'SAN_PHAM',key:'MaSP',columns:[text('MaSP','Mã sản phẩm',true,5),text('TenSP','Tên sản phẩm',true,50),text('DonViTinh','Đơn vị tính',true,50),number('TrongLuong','Trọng lượng'),text('CongSuat','Công suất',false,100),number('GiaBan','Giá bán',true),number('TonToiThieu','Tồn tối thiểu',false,0,{default:5}),ref('MaLoaiSP','Mã loại sản phẩm','LOAI_SAN_PHAM','MaLoaiSP','TenLoaiSP'),note()]},
 'khach-hang':{title:'Khách hàng',table:'KHACH_HANG',key:'MaKH',auto:true,columns:[text('MaKH','Mã khách hàng',false,8),text('TenKH','Tên khách hàng',true,50),text('SoDTKH','Số điện thoại',true,50,{format:'phone'}),text('EmailKH','Email',false,100,{format:'email'}),sex('GioiTinhKH'),text('DiaChiKH','Địa chỉ',true,100),ref('MaLoaiKH','Mã loại khách hàng','LOAI_KHACH_HANG','MaLoaiKH','TenLoaiKH')]},
 'nha-cung-cap':{title:'Nhà cung cấp',table:'NHA_CUNG_CAP',key:'MaNCC',auto:true,columns:[text('MaNCC','Mã nhà cung cấp',false,9),text('TenNCC','Tên nhà cung cấp',true,100),text('SoDTNCC','Số điện thoại',true,50,{format:'phone'}),text('EmailNCC','Email',false,100,{format:'email'}),text('DiaChiNCC','Địa chỉ',true,255),note()]},
 'nhan-vien':{title:'Nhân viên',table:'NHAN_VIEN',key:'MaNV',auto:true,columns:[text('MaNV','Mã nhân viên',false,8),text('HoTenNV','Họ tên nhân viên',true,50),text('CCCD','CCCD',true,20,{format:'cccd'}),sex('GioiTinh'),text('SoDTNV','Số điện thoại',true,50,{format:'phone'}),text('EmailNV','Email',false,100,{format:'email'}),text('DiaChiNV','Địa chỉ',true,100),choice('ChucVu','Chức vụ',['Quản lý','Bán hàng','Kho','Kế toán'])]},
 'ma-giam-gia':{title:'Mã giảm giá',table:'WEB_MA_GIAM_GIA',key:'MaGiamGia',coupon:true,columns:[text('MaGiamGia','Mã giảm giá',true,30,{format:'coupon'}),text('TenMaGiamGia','Tên mã giảm giá',true,150),text('MoTa','Mô tả',false,250),choice('LoaiGiam','Loại giảm',['percent','fixed']),number('GiaTri','Giá trị giảm',true,0.001),number('DonToiThieu','Đơn tối thiểu',true),number('GiamToiDa','Giảm tối đa'),date('BatDau','Từ ngày'),date('KetThuc','Đến ngày',false),ref('MaLoaiKH','Mã loại khách hàng','LOAI_KHACH_HANG','MaLoaiKH','TenLoaiKH',false),ref('MaSP','Mã sản phẩm','SAN_PHAM','MaSP','TenSP',false),number('SoLuong','Số lượng mã',false,1,{integer:true,max:2147483647}),choice('ChoPhepKetHop','Cho phép kết hợp',['0','1']),choice('TrangThai','Trạng thái',['Hoạt động','Tạm ngưng'])]},
 'tinh-thanh':{title:'Tỉnh / Thành phố',page:'dia-diem-van-chuyen',table:'WEB_TINH_THANH',key:'MaTinhThanh',columns:[number('MaTinhThanh','Mã tỉnh thành',true,1,{integer:true,max:2147483647}),text('TenTinhThanh','Tên tỉnh / thành phố',true,100)]},
 'phuong-xa':{title:'Phường / Xã',page:'dia-diem-van-chuyen',table:'WEB_PHUONG_XA',key:'MaPhuongXa',columns:[number('MaPhuongXa','Mã phường xã',true,1,{integer:true,max:2147483647}),text('TenPhuongXa','Tên phường / xã',true,100),ref('MaTinhThanh','Mã tỉnh thành','WEB_TINH_THANH','MaTinhThanh','TenTinhThanh')]},
 'phi-giao-hang':{title:'Phí giao hàng',page:'dia-diem-van-chuyen',table:'WEB_PHI_VAN_CHUYEN',key:'MaTinhThanh',columns:[ref('MaTinhThanh','Mã tỉnh thành','WEB_TINH_THANH','MaTinhThanh','TenTinhThanh'),number('PhiVanChuyen','Phí vận chuyển',true),number('MienPhiTu','Miễn phí từ'),choice('HienThi','Hoạt động',['0','1'])]},
 'nhap-kho':{title:'Nhập kho',table:'PHIEU_NHAP',key:'MaPN',document:true,columns:[text('MaPN','Mã phiếu nhập',false,8),nv(),ref('MaNCC','Mã nhà cung cấp','NHA_CUNG_CAP','MaNCC','TenNCC'),text('SoHoaDonNCC','Số hóa đơn NCC',true,50),sp(),number('SoLuong','Số lượng',true,1,{integer:true}),number('GiaNhap','Giá nhập',true),note()]},
 'xuat-kho':{title:'Xuất kho',table:'PHIEU_XUAT',key:'MaPX',document:true,columns:[text('MaPX','Mã phiếu xuất',false,8),date('NgayXuat','Ngày xuất'),nv(),ref('MaDH','Mã đơn hàng','DON_HANG','MaDH','MaDH')]},
 'hoa-don':{title:'Hóa đơn',table:'HOA_DON',key:'MaHD',document:true,columns:[text('MaHD','Mã hóa đơn',false,8),ref('MaDH','Mã đơn hàng','DON_HANG','MaDH','MaDH'),nv(),pay(),choice('TrangThaiThanhToan','Trạng thái thanh toán',['Đã thanh toán','Chưa thanh toán'])]},
 'phieu-thu':{title:'Phiếu thu',table:'PHIEU_THU',key:'MaPT',document:true,columns:[text('MaPT','Mã phiếu thu',false,8),ref('MaCN','Mã công nợ','CONG_NO','MaCN','MaCN'),nv(),number('SoTienThucThu','Số tiền thực thu',true,0.001),pay(),note()]},
 'phieu-chi':{title:'Phiếu chi',table:'PHIEU_CHI',key:'MaPC',document:true,columns:[text('MaPC','Mã phiếu chi',false,8),ref('MaPN','Mã phiếu nhập','PHIEU_NHAP','MaPN','MaPN'),nv(),number('SoTienThucChi','Số tiền thực chi',true,0.001),pay(),note()]},
 'don-hang':{title:'Đơn hàng',table:'DON_HANG',key:'MaDH',document:true,columns:[text('MaDH','Mã đơn hàng',false,8),ref('MaKH','Mã khách hàng','KHACH_HANG','MaKH','TenKH'),nv(),sp(),number('TrongLuongGram','Trọng lượng mỗi gói (gram)',false,100,{integer:true,max:1000000}),text('LoaiXay','Loại xay',false,80),number('SoLuong','Số lượng',true,1,{integer:true,max:999}),number('GiamGiaSP','Giảm giá sản phẩm (%)',false,0,{max:100,scale:100,default:0}),choice('TrangThaiDonHang','Trạng thái',['Chờ giao','Hoàn thành'])]},
};
// Match optional fields/defaults in the existing add forms.
for(const id of ['khach-hang','nha-cung-cap','nhan-vien']){
 for(const c of schema[id].columns){
  if(['DiaChiKH','DiaChiNCC','DiaChiNV'].includes(c.key)){c.required=false;c.default='';}
  if(['GioiTinhKH','GioiTinh'].includes(c.key)){c.required=false;c.default='Nam';}
  if(c.key==='SoDTNV'){c.required=false;c.default='';}
  if(c.key==='MaLoaiKH'){c.required=false;c.default='L01';}
 }
}
schema['nhap-kho'].columns.find(c=>c.key==='SoHoaDonNCC').required=false;
schema['nhap-kho'].columns.splice(1,0,date('NgayNhap','Ngày nhập'));
schema['nhap-kho'].columns.splice(1,0,text('NhomChungTu','Nhóm chứng từ',true,50));
schema['hoa-don'].columns.push(number('SoTienKhachTra','Số tiền trả trước',false,0,{default:0}));
schema['nhan-vien'].columns.push(text('TenDangNhap','Tên đăng nhập',false,50,{format:'username'}),text('MatKhau','Mật khẩu',false,128,{secret:true}));
schema['phieu-thu'].columns.splice(1,0,ref('MaKH','Mã khách hàng','KHACH_HANG','MaKH','TenKH'));
schema['ma-giam-gia'].columns.find(c=>c.key==='MaGiamGia').required=false;
schema['ma-giam-gia'].generatedKey=true;
schema['phi-giao-hang'].nullableKey=true;
// Source forms are explicit per module; the same registry drives .xlsx and server validation.
const forms={
 'loai-sp':['loai-sp','addForm'],'loai-kh':['loai-kh','addForm'],'san-pham':['san-pham','productForm'],
 'khach-hang':['khach-hang','addForm'],'nha-cung-cap':['nha-cung-cap','addForm'],'nhan-vien':['nhan-vien','addForm'],
 'ma-giam-gia':['ma-giam-gia','couponConfigForm'],'tinh-thanh':['dia-diem-van-chuyen','formProvince'],
 'phuong-xa':['dia-diem-van-chuyen','formWard'],'phi-giao-hang':['dia-diem-van-chuyen','formShipping'],
 'nhap-kho':['nhap-kho','receiptForm'],'xuat-kho':['xuat-kho','createExportForm'],'hoa-don':['hoa-don','createInvoiceForm'],
 'phieu-thu':['phieu-thu','phieuThuForm'],'phieu-chi':['phieu-chi','createForm'],'don-hang':['ban-hang','pos-layout'],
};
for(const [id,def] of Object.entries(schema))def.sourceForm={page:forms[id][0],id:forms[id][1]};
// Bind editable columns to the actual create-form controls, retaining database limits.
const controls={
 'loai-sp':{MaLoaiSP:'maLoaiSP',TenLoaiSP:'tenLoaiSP'},
 'loai-kh':{MaLoaiKH:'maLoaiKH',TenLoaiKH:'tenLoaiKH',TyLeChietKhau:'tyLeChietKhau'},
 'san-pham':{MaSP:'maSP',TenSP:'tenSP',DonViTinh:'dvt',TrongLuong:'trongLuong',CongSuat:'congSuat',GiaBan:'giaBan',TonToiThieu:'tonToiThieu',MaLoaiSP:'loaiSP',GhiChu:'ghiChu'},
 'khach-hang':{TenKH:'tenKH',SoDTKH:'soDT',EmailKH:'email',GioiTinhKH:'gioiTinh',DiaChiKH:'diaChi',MaLoaiKH:'maLoai'},
 'nha-cung-cap':{TenNCC:'tenNCC',SoDTNCC:'soDT',EmailNCC:'email',DiaChiNCC:'diaChi',GhiChu:'ghiChu'},
 'nhan-vien':{HoTenNV:'hoTen',CCCD:'cccd',GioiTinh:'gioiTinh',SoDTNV:'soDT',EmailNV:'emailNV',DiaChiNV:'diaChiNV',ChucVu:'chucVu',TenDangNhap:'tenDangNhap',MatKhau:'matKhau'},
 'ma-giam-gia':{MaGiamGia:'@code',TenMaGiamGia:'@title',MoTa:'@description',LoaiGiam:'@kind',GiaTri:'@value',DonToiThieu:'@minimum',GiamToiDa:'@maximum',BatDau:'@start',KetThuc:'@end',MaLoaiKH:'@customerType',MaSP:'@productId',SoLuong:'@quantity',ChoPhepKetHop:'@combine',TrangThai:'@status'},
 'tinh-thanh':{MaTinhThanh:'@code',TenTinhThanh:'@name'},
 'phuong-xa':{MaPhuongXa:'@code',TenPhuongXa:'@name',MaTinhThanh:'@parent'},
 'phi-giao-hang':{MaTinhThanh:'@province',PhiVanChuyen:'@fee',MienPhiTu:'@free',HienThi:'@active'},
 'nhap-kho':{NgayNhap:'ngayNhap',SoHoaDonNCC:'soHoaDonNCC',MaSP:'spInput',SoLuong:'soLuong',GiaNhap:'giaNhap'},
 'xuat-kho':{NgayXuat:'newNgayXuat',MaDH:'dhInput',MaNV:'nvInput'},
 'hoa-don':{MaDH:'lapHdMaDH',HinhThucThanhToan:'lapHdHinhThuc',TrangThaiThanhToan:'lapHdTrangThai',SoTienKhachTra:'lapHdSoTienTra'},
 'phieu-thu':{MaKH:'maKH',MaCN:'maCN',SoTienThucThu:'soTienThu',HinhThucThanhToan:'hinhThuc',GhiChu:'ghiChu'},
 'phieu-chi':{MaPN:'pcMaPN',MaNV:'pcMaNV',SoTienThucChi:'pcSoTien',HinhThucThanhToan:'pcHinhThuc',GhiChu:'pcGhiChu'},
};
const fs=require('fs'),path=require('path');
for(const [id,mapping] of Object.entries(controls)){
 const def=schema[id],html=fs.readFileSync(path.join(require('../../../Shared/Backend/config/paths').adminFrontend,def.sourceForm.page+'.html'),'utf8');
 const form=html.match(new RegExp('<form\\b[^>]*id="'+def.sourceForm.id+'"[^>]*>[\\s\\S]*?<\\/form>'))?.[0]||html;
 for(const c of def.columns){
  const selector=mapping[c.key];if(!selector)continue;
  const attribute=selector.startsWith('@')?'name':'id',value=selector.replace(/^@/,'');
  const tag=[...form.matchAll(/<(?:input|select|textarea)\b[^>]*>/g)].find(m=>new RegExp('\\b'+attribute+'="'+value+'"').test(m[0]))?.[0];
  if(!tag)throw Error('Không tìm thấy control '+def.sourceForm.page+': '+selector);
  c.formControl=selector;c.required=/\srequired(?:\s|>|=)/.test(tag);
  if(!c.required&&c.values&&c.default===undefined)c.default=c.values[0];
  const attr=name=>tag.match(new RegExp('\\b'+name+'="([^"]+)"'))?.[1];
  if(attr('maxlength'))c.max=Math.min(c.max||Infinity,Number(attr('maxlength')));
  if(c.type==='number'){
   if(attr('min')!==undefined)c.min=Math.max(c.min??-Infinity,Number(attr('min')));
   if(attr('max')!==undefined)c.max=Math.min(c.max??Infinity,Number(attr('max')));
  }
  if(attr('pattern'))c.pattern=attr('pattern');
 }
}
// Only entries inside the sidebar's Danh Mục group accept Excel imports.
const masterModules=new Set(['san-pham','loai-sp','khach-hang','loai-kh','nha-cung-cap','ma-giam-gia','tinh-thanh','phuong-xa','phi-giao-hang']);
const importModules=new Set([...masterModules,'don-hang']);
const order=schema['don-hang'];order.orderCustomers=true;order.groupBy='MaDH';
order.columns[order.columns.findIndex(c=>c.key==='MaDH')]=text('MaDH','Mã đơn hàng',true,50);
order.columns[order.columns.findIndex(c=>c.key==='MaKH')]=text('MaKH','Mã khách hàng',false,8);
const customerFields=schema['khach-hang'].columns.filter(c=>c.key!=='MaKH').map(c=>({...c,label:c.label+' (KH mới)',required:false,requiredForNew:c.required,newCustomer:true}));
order.columns.splice(order.columns.findIndex(c=>c.key==='MaKH')+1,0,...customerFields);
module.exports={schema,masterModules,importModules};
