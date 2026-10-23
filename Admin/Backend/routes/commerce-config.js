const express=require('express');
const {randomInt}=require('crypto');
function randomCouponCode(){let value;do{value=Array.from({length:6},()=>"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[randomInt(36)]).join('');}while(!/[A-Z]/.test(value)||!/[0-9]/.test(value));return value;}
const {sql,poolPromise}=require('../../../Shared/Backend/config/database');
const {authenticate,authorizeApi}=require('../../../Shared/Backend/middleware/auth');
const router=express.Router();
router.use('/cau-hinh-website/commerce',authenticate,authorizeApi);
const wrap=fn=>(req,res)=>Promise.resolve(fn(req,res)).catch(e=>{const quota=[50011,50012,50013,50014].includes(e.number||e.originalError?.info?.number);res.status(e.status||(quota?409:500)).json({success:false,message:e.status||quota?e.message:'Không lưu được cấu hình. Kiểm tra dữ liệu và thử lại.'});});
function check(ok,message){if(!ok){const e=new Error(message);e.status=400;throw e;}}
router.get('/cau-hinh-website/commerce',wrap(async(req,res)=>{
 const pool=await poolPromise;
 const [coupons,rates,provinces,customerTypes,eligibleProducts]=await Promise.all([pool.request().query('SELECT m.*,k.TenLoaiKH,p.TenSP,ISNULL(q.SoLuotDaTinh,0) AS SoLuotDaTinh,ISNULL(q.SoLuotDaDung,0) AS SoLuotDaDung,ISNULL(q.SoLuotDangGiu,0) AS SoLuotDangGiu FROM WEB_MA_GIAM_GIA m LEFT JOIN LOAI_KHACH_HANG k ON k.MaLoaiKH=m.MaLoaiKH LEFT JOIN SAN_PHAM p ON p.MaSP=m.MaSP LEFT JOIN v_MaGiamGiaLuotDung q ON q.MaGiamGia=m.MaGiamGia ORDER BY m.MaGiamGia'),pool.request().query('SELECT * FROM WEB_PHI_VAN_CHUYEN ORDER BY ID'),pool.request().query('SELECT * FROM WEB_TINH_THANH ORDER BY TenTinhThanh'),pool.request().query('SELECT MaLoaiKH,TenLoaiKH FROM LOAI_KHACH_HANG ORDER BY TenLoaiKH'),pool.request().query('SELECT MaSP,TenSP FROM SAN_PHAM ORDER BY TenSP,MaSP')]);
 res.json({success:true,data:{coupons:coupons.recordset,rates:rates.recordset,provinces:provinces.recordset,customerTypes:customerTypes.recordset,eligibleProducts:eligibleProducts.recordset}});
}));
router.put('/cau-hinh-website/commerce/coupon',wrap(async(req,res)=>{
 const b=req.body,create=b.create===true,automatic=create&&b.autoCode!==false;let code=automatic?randomCouponCode():String(b.code||'').trim().toUpperCase();const value=Number(b.value),minimum=Number(b.minimum),maximum=b.maximum===''||b.maximum==null?null:Number(b.maximum);
 const quantity=b.quantity===''||b.quantity==null?null:Number(b.quantity);
 check(quantity===null||(Number.isInteger(quantity)&&quantity>0&&quantity<=2147483647),'Số lượng mã phải là số nguyên dương hoặc để trống để không giới hạn.');
 const title=String(b.title||'').trim();check(title.length>0&&title.length<=150,'Nhập tên mã giảm giá (tối đa 150 ký tự)');
 const start=new Date(b.start),end=b.end?new Date(b.end):null;
 check(b.combine===undefined||['0','1'].includes(String(b.combine)),'Điều kiện kết hợp không hợp lệ');
 check(!b.status||['Hoạt động','Tạm ngưng'].includes(b.status),'Trạng thái không hợp lệ.');
 check(/^[A-Z0-9_-]{1,30}$/.test(code),'Mã gồm 1–30 ký tự chữ, số, dấu gạch.');
 check(['percent','fixed'].includes(b.kind)&&Number.isFinite(value)&&value>0&&(b.kind!=='percent'||value<=100),'Giá trị giảm không hợp lệ.');
 check(Number.isFinite(minimum)&&minimum>=0&&(maximum===null||(Number.isFinite(maximum)&&maximum>=0)),'Giá trị tối thiểu hoặc giảm tối đa không hợp lệ.');
 check(Number.isFinite(start.getTime())&&(!end||(Number.isFinite(end.getTime())&&end>start)),'Khoảng thời gian áp dụng không hợp lệ.');
 const customerType=String(b.customerType||'').trim().toUpperCase()||null,productId=String(b.productId||'').trim().toUpperCase()||null;
 check((customerType===null||/^[A-Z0-9]{1,3}$/.test(customerType))&&(productId===null||/^[A-Z0-9]{1,5}$/.test(productId)),'Loại khách hàng hoặc mã sản phẩm không hợp lệ.');
 const pool=await poolPromise;
 if(quantity!==null){const used=await pool.request().input('Code',sql.VarChar(30),code).query('SELECT SoLuotDaTinh FROM v_MaGiamGiaLuotDung WHERE MaGiamGia=@Code');check(quantity>=Number(used.recordset[0]?.SoLuotDaTinh||0),'Số lượng không được nhỏ hơn số lượt đã dùng và đang giữ.');}
 if(customerType){const r=await pool.request().input('Type',sql.Char(3),customerType).query('SELECT MaLoaiKH FROM LOAI_KHACH_HANG WHERE MaLoaiKH=@Type');check(!!r.recordset[0],'Loại khách hàng không tồn tại.');}
 if(productId){const r=await pool.request().input('Type',sql.Char(5),productId).query('SELECT MaSP FROM SAN_PHAM WHERE MaSP=@Type');check(!!r.recordset[0],'Mã sản phẩm không tồn tại.');}
 for(let attempt=0;attempt<10;attempt++){try{
 await pool.request().input('Create',sql.Bit,create).input('Code',sql.VarChar(30),code).input('Title',sql.NVarChar(150),title).input('Description',sql.NVarChar(250),String(b.description||'').slice(0,250)).input('Kind',sql.VarChar(10),b.kind).input('Value',sql.Decimal(19,3),value).input('Min',sql.Decimal(19,3),minimum).input('Max',sql.Decimal(19,3),maximum).input('Start',sql.VarChar(33),start.toISOString()).input('End',sql.VarChar(33),end?end.toISOString():null).input('CustomerType',sql.Char(3),customerType).input('ProductId',sql.Char(5),productId).input('Combine',sql.Bit,String(b.combine)==='1').input('CombineProvided',sql.Bit,b.combine!==undefined).input('Quota',sql.Int,quantity).input('QuotaProvided',sql.Bit,b.quantity!==undefined).input('Status',sql.NVarChar(20),b.status||(b.active?'Hoạt động':'Tạm ngưng')).input('Active',sql.Bit,b.status?b.status==='Hoạt động':!!b.active).query(`IF @Create=1
BEGIN
 INSERT INTO WEB_MA_GIAM_GIA(MaGiamGia,TenMaGiamGia,MoTa,LoaiGiam,GiaTri,DonToiThieu,GiamToiDa,BatDau,KetThuc,HienThi,TrangThai,MaLoaiKH,MaSP,SoLuong,ChoPhepKetHop) VALUES(@Code,@Title,@Description,@Kind,@Value,@Min,@Max,CONVERT(datetime2,@Start,127),CONVERT(datetime2,@End,127),@Active,@Status,@CustomerType,@ProductId,@Quota,@Combine);
END
ELSE
BEGIN
 UPDATE WEB_MA_GIAM_GIA SET TenMaGiamGia=@Title,MoTa=@Description,LoaiGiam=@Kind,GiaTri=@Value,DonToiThieu=@Min,GiamToiDa=@Max,BatDau=CONVERT(datetime2,@Start,127),KetThuc=CONVERT(datetime2,@End,127),HienThi=@Active,TrangThai=@Status,MaLoaiKH=@CustomerType,MaSP=@ProductId,ChoPhepKetHop=CASE WHEN @CombineProvided=1 THEN @Combine ELSE ChoPhepKetHop END,SoLuong=CASE WHEN @QuotaProvided=1 THEN @Quota ELSE SoLuong END WHERE MaGiamGia=@Code;
 IF @@ROWCOUNT=0 THROW 50001, 'Coupon not found', 1;
END;`);
 break;
 }catch(error){const duplicate=[2601,2627].includes(error.number||error.originalError?.info?.number);if(!duplicate)throw error;if(!automatic){const e=new Error('Mã giảm giá đã tồn tại, vui lòng nhập mã khác');e.status=409;throw e;}if(attempt===9){const e=new Error('Chưa tạo được mã duy nhất, vui lòng thử lại');e.status=409;throw e;}code=randomCouponCode();}
 }
 res.json({success:true,data:{code}});
}));
router.put('/cau-hinh-website/commerce/shipping',wrap(async(req,res)=>{
 const b=req.body,province=b.province===''||b.province==null?null:Number(b.province),fee=Number(b.fee),free=b.free===''||b.free==null?null:Number(b.free);
 check((province===null||Number.isInteger(province))&&Number.isFinite(fee)&&fee>=0&&(free===null||(Number.isFinite(free)&&free>=0)),'Khu vực hoặc mức phí không hợp lệ.');
 const pool=await poolPromise;
 let name='Các tỉnh/thành khác';
 if(province!==null){const r=await pool.request().input('P',sql.Int,province).query('SELECT TenTinhThanh FROM WEB_TINH_THANH WHERE MaTinhThanh=@P');check(!!r.recordset[0],'Tỉnh/thành không tồn tại.');name=r.recordset[0].TenTinhThanh;}
 await pool.request().input('Province',sql.Int,province).input('Name',sql.NVarChar(100),name).input('Fee',sql.Decimal(19,3),fee).input('Free',sql.Decimal(19,3),free).input('Active',sql.Bit,!!b.active).query(`UPDATE WEB_PHI_VAN_CHUYEN SET TenKhuVuc=@Name,PhiVanChuyen=@Fee,MienPhiTu=@Free,HienThi=@Active WHERE MaTinhThanh=@Province OR (MaTinhThanh IS NULL AND @Province IS NULL);
 IF @@ROWCOUNT=0 INSERT INTO WEB_PHI_VAN_CHUYEN(MaTinhThanh,TenKhuVuc,PhiVanChuyen,MienPhiTu,HienThi) VALUES(@Province,@Name,@Fee,@Free,@Active);`);
 res.json({success:true});
}));
router.get('/cau-hinh-website/commerce/locations',wrap(async(req,res)=>{
 const pool=await poolPromise;const [p,w]=await Promise.all([pool.request().query('SELECT * FROM WEB_TINH_THANH ORDER BY TenTinhThanh'),pool.request().query('SELECT w.*,p.TenTinhThanh FROM WEB_PHUONG_XA w JOIN WEB_TINH_THANH p ON p.MaTinhThanh=w.MaTinhThanh ORDER BY w.TenPhuongXa')]);res.json({success:true,data:{provinces:p.recordset,wards:w.recordset}});
}));
router.put('/cau-hinh-website/commerce/location',wrap(async(req,res)=>{
 const b=req.body,code=Number(b.code),parent=Number(b.parent),name=String(b.name||'').trim();check(['province','ward'].includes(b.kind)&&Number.isInteger(code)&&code>0&&code<=2147483647&&name.length>0&&name.length<=100,'Mã hoặc tên địa điểm không hợp lệ');const ward=b.kind==='ward';check(!ward||(Number.isInteger(parent)&&parent>0),'Chọn tỉnh / thành phố');const pool=await poolPromise;
 if(ward){const p=await pool.request().input('Parent',sql.Int,parent).query('SELECT MaTinhThanh FROM WEB_TINH_THANH WHERE MaTinhThanh=@Parent');check(!!p.recordset[0],'Tỉnh / thành phố không tồn tại');}
 const table=ward?'WEB_PHUONG_XA':'WEB_TINH_THANH',key=ward?'MaPhuongXa':'MaTinhThanh',column=ward?'TenPhuongXa':'TenTinhThanh';
 const r=await pool.request().input('Code',sql.Int,code).input('Name',sql.NVarChar(100),name).input('Parent',sql.Int,parent||null).query(b.edit?`UPDATE ${table} SET ${column}=@Name WHERE ${key}=@Code${ward?' AND MaTinhThanh=@Parent':''}; SELECT @@ROWCOUNT AS Affected;`:`IF EXISTS(SELECT 1 FROM ${table} WHERE ${key}=@Code) THROW 50014,N'Mã địa điểm đã tồn tại',1; INSERT INTO ${table}(${key},${column}${ward?',MaTinhThanh':''}) VALUES(@Code,@Name${ward?',@Parent':''}); SELECT 1 AS Affected;`);
 check(!!r.recordset[0]?.Affected,'Không tìm thấy địa điểm cần sửa');res.json({success:true});
}));
module.exports=router;
