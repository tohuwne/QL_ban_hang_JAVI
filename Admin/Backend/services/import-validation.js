const norm=v=>String(v??'').trim().toLocaleLowerCase('vi');
function addError(row,fields,message){
 if(!row.errors.includes(message))row.errors.push(message);
 row.cellErrors||={};
 for(const key of Array.isArray(fields)?fields:[fields])if(key){row.cellErrors[key]||=[];if(!row.cellErrors[key].includes(message))row.cellErrors[key].push(message);}
}
function validate(def,rows,existing,lookups,policy){
 const seen=new Map();
 for(const [index,row] of rows.entries()){
  row.stt=index+1;
  row.errors=[...(row.parseErrors||row.errors||[])];row.cellErrors=structuredClone(row.parseCellErrors||{});row.data={};
  const key=norm(row.values[def.key]);
  const old=existing.find(r=>norm(r[def.key])===key && (key!==''||def.nullableKey));
  row.action=old?(policy==='skip'?'skip':'update'):'insert';row.old=old;
  if(old&&policy==='update'&&def.document)addError(row,def.key,'Chứng từ đã tồn tại: không thể ghi đè qua Excel vì ảnh hưởng kho/công nợ. Chọn Bỏ qua hoặc sửa từ form nghiệp vụ.');
  if(!old&&(def.auto||def.document)&&key&&!def.groupBy)addError(row,def.key,'Mã này chưa tồn tại. Để trống mã khi tạo mới để hệ thống tự sinh.');
  const group=norm(row.values[def.groupBy||'NhomChungTu']);
  if(key||def.nullableKey){
   if(seen.has(key)&&!(def.document&&group&&group===norm(seen.get(key).values[def.groupBy||'NhomChungTu']))){
    addError(row,def.key,'Mã trùng trong file với STT '+seen.get(key).stt+'.');
    addError(seen.get(key),def.key,'Mã trùng trong file với STT '+row.stt+'.');
   }else seen.set(key,row);
  }
  for(const c of def.columns){
   let v=row.values[c.key];
   if(v===''||v==null){
    if(def.orderCustomers&&c.newCustomer&&row.values.MaKH){row.data[c.key]=null;continue;}
    if(row.action==='update'&&old[c.key]!=null){row.data[c.key]=old[c.key];continue;}
    if(c.default!==undefined)v=c.default;
    else if(c.required||(def.orderCustomers&&c.requiredForNew&&!String(row.values.MaKH||'').trim()))addError(row,c.key,c.label+': bắt buộc nhập.');
    else {row.data[c.key]=null;continue;}
   }
   const str=String(v).trim();
   if(c.type==='number'){
    const n=Number(v);
    if(!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(str)||!Number.isFinite(n)||n<c.min||(c.max!=null&&n>c.max)||(c.integer&&!Number.isInteger(n))||Math.abs(n)>=1e15)addError(row,c.key,c.label+': số không hợp lệ'+(c.min!=null?' (tối thiểu '+c.min+')':'')+'.');
    row.data[c.key]=n/(c.scale||1);
   }else if(c.type==='date'){
    const d=new Date(str+'T00:00:00Z');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(str)||!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==str)addError(row,c.key,c.label+': dùng ngày hợp lệ dạng YYYY-MM-DD.');
    row.data[c.key]=str;
   }else{
    if(str.length>c.max)addError(row,c.key,c.label+': tối đa '+c.max+' ký tự.');
    if(c.values&&!c.values.includes(str))addError(row,c.key,c.label+': chọn đúng giá trị trong danh sách.');
    if(c.format==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str))addError(row,c.key,c.label+': email không hợp lệ.');
    if(c.format==='phone'&&str&&!/^0\d{9}$/.test(str))addError(row,c.key,c.label+': nhập 10 chữ số bắt đầu bằng 0, giữ định dạng văn bản trong Excel.');
    if(c.format==='cccd'&&!/^\d{12}$/.test(str))addError(row,c.key,c.label+': nhập 12 chữ số.');
    if(c.format==='coupon'&&!/^[A-Z0-9_-]{1,30}$/.test(str))addError(row,c.key,c.label+': chỉ dùng chữ in hoa, số, dấu gạch dưới hoặc gạch ngang.');
    if(c.format==='username'&&!/^[A-Za-z0-9_.-]+$/.test(str))addError(row,c.key,c.label+': không dùng khoảng trắng hoặc ký tự đặc biệt.');
    if(c.pattern&&!new RegExp('^(?:'+c.pattern+')$').test(str))addError(row,c.key,c.label+': không đúng định dạng của form thêm mới.');
    row.data[c.key]=str;
   }
   if(c.ref){
    const found=(lookups[c.key]||[]).find(r=>norm(r.id)===norm(str));
    if(!found)addError(row,c.key,c.label+': mã không tồn tại trong database.');
    else row.data[c.key]=found.id;
   }
  }
  if(def.coupon){
   const d=row.data;
   if(d.LoaiGiam==='percent'&&d.GiaTri>100)addError(row,'GiaTri','Giá trị giảm theo phần trăm không được vượt 100.');
   if(d.BatDau&&d.KetThuc&&new Date(d.KetThuc)<new Date(d.BatDau))addError(row,'KetThuc','Đến ngày phải từ ngày bắt đầu trở đi.');
  }
  if(def.table==='NHAN_VIEN'&&!!row.data.TenDangNhap!==!!row.data.MatKhau)addError(row,row.data.TenDangNhap?'MatKhau':'TenDangNhap','Cấp tài khoản: cần nhập cả tên đăng nhập và mật khẩu.');
 }
 if(def.orderCustomers)validateOrderCustomers(def,rows,lookups.customers||[]);
 return rows;
}
function validateOrderCustomers(def,rows,customers){
 const fields=def.columns.filter(c=>c.newCustomer),seenPhones=new Map();
 for(const row of rows){
  const code=norm(row.values.MaKH),phone=norm(row.data.SoDTKH);
  if(code){
   const customer=customers.find(c=>norm(c.MaKH)===code);
   if(!customer){addError(row,'MaKH','Mã khách hàng không tồn tại. Nếu là khách mới, để trống mã và nhập thông tin khách hàng.');continue;}
   row.data.MaKH=String(customer.MaKH).trim();row.customerSnapshot=customer;
   for(const field of fields)if(String(row.values[field.key]||'').trim()&&norm(row.data[field.key])!==norm(customer[field.key]))addError(row,field.key,field.label+': không khớp mã khách hàng '+row.data.MaKH+'.');
  }else if(phone){
   const customer=customers.find(c=>norm(c.SoDTKH)===phone);
   if(customer){addError(row,'SoDTKH','Số điện thoại đã tồn tại, vui lòng nhập mã khách hàng '+String(customer.MaKH).trim()+'.');continue;}
   const signature=JSON.stringify(fields.map(c=>norm(row.data[c.key])));
   if(seenPhones.has(phone)&&signature!==seenPhones.get(phone).signature){
    const previous=seenPhones.get(phone).row,different=fields.filter(c=>norm(row.data[c.key])!==norm(previous.data[c.key])).map(c=>c.key);
    addError(row,different,'Thông tin khách hàng cùng SĐT không thống nhất với STT '+previous.stt+'.');
    addError(previous,different,'Thông tin khách hàng cùng SĐT không thống nhất với STT '+row.stt+'.');
   }else seenPhones.set(phone,{signature,row});
  }
 }
}
function groups(def,rows){
 const grouped=new Map();
 for(const row of rows.filter(r=>r.action!=='skip')){
  const key=def.groupBy?norm(row.data[def.groupBy]):row.data.NhomChungTu||String(row.line);
  if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(row);
 }
 if(['DON_HANG','PHIEU_NHAP'].includes(def.table))for(const group of grouped.values()){
  const head=def.table==='DON_HANG'?['MaDH','MaKH','MaNV','TrangThaiDonHang']:['MaPN','NgayNhap','MaNV','MaNCC','SoHoaDonNCC','GhiChu'];
  if(def.orderCustomers&&!group[0].data.MaKH)head.push(...def.columns.filter(c=>c.newCustomer).map(c=>c.key));
  for(const row of group){const different=head.filter(k=>norm(row.data[k])!==norm(group[0].data[k]));if(different.length)addError(row,different,'Các dòng cùng nhóm phải có cùng thông tin đầu chứng từ.');}
  const products=new Map();for(const row of group){const key=def.table==='DON_HANG'?JSON.stringify([norm(row.data.MaSP),row.data.TrongLuongGram||null,norm(row.data.LoaiXay)]):norm(row.data.MaSP);if(products.has(key)){addError(row,'MaSP','Sản phẩm bị trùng trong nhóm chứng từ.');addError(products.get(key),'MaSP','Sản phẩm bị trùng trong nhóm chứng từ.');}else products.set(key,row);}
 }
 return [...grouped.values()];
}
module.exports={validate,groups,norm,addError};
