const assert=require('assert/strict');
const {schema,importModules}=require('../Admin/Backend/services/import-schema');
const {validate,groups}=require('../Admin/Backend/services/import-validation');
const row=(values,line=2)=>({values,line,errors:[]});
for(const id of importModules){
 const def=schema[id],required=def.columns.find(c=>c.required);
 const result=validate(def,[row({})],[],{},'skip')[0];
 assert(result.cellErrors[required.key]?.length,id+': required field');
 assert(Object.keys(result.cellErrors).every(key=>def.columns.some(c=>c.key===key)),id+': field keys');
}
let result=validate(schema['loai-sp'],[row({MaLoaiSP:'CFH',TenLoaiSP:''},90)],[],{},'skip');
assert.deepEqual(Object.keys(result[0].cellErrors),['TenLoaiSP']);assert.equal(result[0].stt,1);
const def=schema['don-hang'];
const lookups={customers:[{MaKH:'KH000001',TenKH:'Khách cũ',SoDTKH:'0901111111',EmailKH:'khach@example.com',GioiTinhKH:'Nam',MaLoaiKH:'L01'}],MaNV:[{id:'NV000001',name:'NV'}],MaSP:[{id:'CFH31',name:'SP'}],MaLoaiKH:[{id:'L01',name:'Lẻ'}]};
const base={MaDH:'DON01',MaKH:'KH000001',MaNV:'NV000001',MaSP:'CFH31',SoLuong:'1',GiamGiaSP:'0',TrangThaiDonHang:'Chờ giao'};
result=validate(def,[row({...base,EmailKH:'bad-email'})],[],lookups,'skip');
assert.deepEqual(Object.keys(result[0].cellErrors),['EmailKH']);assert(result[0].cellErrors.EmailKH.length>=2);assert(!result[0].cellErrors.MaKH);
result=validate(def,[row({...base,MaKH:'KH999999'})],[],lookups,'skip');assert.deepEqual(Object.keys(result[0].cellErrors),['MaKH']);
result=validate(def,[row(base),row(base,5)],[],lookups,'skip');groups(def,result);assert(result.every(r=>r.cellErrors.MaSP?.length));assert(!result[0].cellErrors.MaDH);
result=validate(def,[row({...base,MaKH:'',TenKH:'A',SoDTKH:'0902222222'}),row({...base,MaDH:'DON02',MaKH:'',TenKH:'B',SoDTKH:'0902222222'},4)],[],lookups,'skip');assert(result.every(r=>r.cellErrors.TenKH?.length));assert(result.every(r=>!r.cellErrors.SoDTKH));
console.log('PASS: cell-specific errors for all 10 imports, correct fields only, conditional customer errors, duplicate product cells and conflicting customer details.');
