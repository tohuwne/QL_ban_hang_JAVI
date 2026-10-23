const {sql} = require('../config/database');
const {fail} = require('./website-common');
const clean = value => String(value ?? '').trim();
function factor(item){return item.TrongLuongGram == null ? 1 : Number(item.TrongLuongGram)/100;}
function stockUnits(item){return Number(item.SoLuong)*factor(item);}
function optionKey(item){return JSON.stringify([clean(item.MaSP),item.TrongLuongGram==null?null:Number(item.TrongLuongGram),item.LoaiXay==null?null:clean(item.LoaiXay)]);}
async function catalog(db){
 const r=await db.request().query(`SELECT x.*,m.MaLoaiSP FROM LOAI_XAY x JOIN LOAI_SP_LOAI_XAY m ON x.MaLoaiXay=m.MaLoaiXay WHERE x.HoatDong=1 ORDER BY x.ThuTu,x.MaLoaiXay;
 SELECT t.*,m.MaLoaiSP FROM TRONG_LUONG t JOIN LOAI_SP_TRONG_LUONG m ON t.MaTrongLuong=m.MaTrongLuong WHERE t.HoatDong=1 ORDER BY t.ThuTu,t.TrongLuongGram;`);
 return {loaiXay:r.recordsets[0],trongLuong:r.recordsets[1]};
}
async function validateOptions(db,product,gram,grind){
 const suppliedGram=gram!==undefined&&gram!==null&&gram!=='';
 const suppliedGrind=clean(grind);
 if(!product.ApDungTuyChon){if(suppliedGram||suppliedGrind)fail('Sản phẩm không áp dụng trọng lượng và loại xay.');return {TrongLuongGram:null,LoaiXay:null};}
 gram=Number(gram);
 if(!suppliedGram||!Number.isSafeInteger(gram)||gram<=0||gram%100!==0||!suppliedGrind||suppliedGrind.length>80)fail('Chọn trọng lượng và loại xay hợp lệ.');
 const r=await db.request().input('Type',sql.Char(3),product.MaLoaiSP).input('Gram',sql.Int,gram).input('Grind',sql.NVarChar(80),suppliedGrind).query(`SELECT x.TenLoaiXay FROM LOAI_XAY x WHERE x.TenLoaiXay=@Grind AND x.HoatDong=1 AND EXISTS(SELECT 1 FROM TRONG_LUONG t JOIN LOAI_SP_TRONG_LUONG m ON t.MaTrongLuong=m.MaTrongLuong WHERE m.MaLoaiSP=@Type AND t.TrongLuongGram=@Gram AND t.HoatDong=1) AND EXISTS(SELECT 1 FROM LOAI_XAY x JOIN LOAI_SP_LOAI_XAY m ON x.MaLoaiXay=m.MaLoaiXay WHERE m.MaLoaiSP=@Type AND x.TenLoaiXay=@Grind AND x.HoatDong=1)`);
 if(!r.recordset.length)fail('Lựa chọn đã ngừng áp dụng. Vui lòng chọn lại trọng lượng và loại xay.',409);
 return {TrongLuongGram:gram,LoaiXay:r.recordset[0].TenLoaiXay};
}
function checkStock(items){
 const totals=new Map();
 for(const item of items){if(!Number.isInteger(item.SoLuong)||item.SoLuong<1||item.SoLuong>999)fail('Số lượng không hợp lệ.');const key=clean(item.MaSP);totals.set(key,(totals.get(key)||0)+stockUnits(item));}
 for(const item of items)if(totals.get(clean(item.MaSP))>Number(item.SoLuongKD))fail('Không đủ tồn khả dụng cho '+(item.TenSP||clean(item.MaSP))+'.',409);
}
module.exports={factor,stockUnits,optionKey,catalog,validateOptions,checkStock};
