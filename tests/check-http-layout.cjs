const assert = require('assert/strict');
const Module = require('module');
const originalLoad = Module._load;
// Exercise the real Express app without reading or modifying production data.
const sql = new Proxy({}, {get: () => () => {}});
const pool = {request() {return {input() {return this;}, async query(query) {
  return {recordset:query.startsWith('SELECT sp.TenSP, sp.SoLuongKD') ? [{TenSP:'Cà phê',SoLuongKD:10}] : []};
}};}};
Module._load = function(name, parent, isMain) {
  if (/(?:^|\/)config\/database$/.test(name)) return {sql, poolPromise:Promise.resolve(pool)};
  return originalLoad.call(this, name, parent, isMain);
};
let app;
try {app = require('../app');} finally {Module._load = originalLoad;}
const {createToken} = require('../Shared/Backend/middleware/auth');
(async () => {
  const server = await new Promise(resolve => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    for (const url of ['/', '/admin/dashboard.html', '/landing_page/mua-hang.html', '/landing_page/login.html', '/user/mua-hang.html', '/admin/js/auth.js', '/user/js/storefront.js', '/js/auth.js', '/js/storefront.js', '/admin/css/dashboard.css', '/user/css/storefront.css', '/css/global.css', '/css/brand-tokens.css', '/images/logo-javi-auth.png', '/vendor/remixicon/remixicon.css']) {
      const response = await fetch(base + url);
      assert.equal(response.status, 200, url);
      assert((await response.arrayBuffer()).byteLength > 0, url);
    }
    const login = await fetch(base + '/admin/login.html', {redirect:'manual'});
    assert.equal(login.status, 302);
    assert.equal(login.headers.get('location'), '/landing_page/login.html?mode=admin');
    for (const url of ['/Shared/Backend/config/database.js', '/Admin/Backend/routes/quan-tri.js', '/.env', '/package.json']) {
      assert.equal((await fetch(base + url)).status, 404, url);
    }
    for (const url of ['/api/website/products', '/api/website/settings', '/api/website/blog']) assert.equal((await fetch(base+url)).status, 200, url);
    assert.equal((await fetch(base+'/api/website/checkout', {method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status, 401);
    const customer = createToken({TenDangNhap:'test',VaiTro:'KHACH_HANG',MaKH:'KH01'});
    const admin = createToken({TenDangNhap:'admin',VaiTro:'NHAN_VIEN',MaNV:'NV01',ChucVu:'Quản lý'});
    assert.equal((await fetch(base+'/api/gio-hang/test', {headers:{Authorization:'Bearer '+customer}})).status, 200);
    assert.equal((await fetch(base+'/api/gio-hang/other', {headers:{Authorization:'Bearer '+customer}})).status, 403);
    const cart = await fetch(base+'/api/gio-hang', {method:'PUT',headers:{Authorization:'Bearer '+customer,'Content-Type':'application/json'},body:JSON.stringify({tenDangNhap:'test',maSP:'CFH31',soLuong:1})});
    assert.equal(cart.status, 200, await cart.text());
    assert.equal((await fetch(base+'/api/cau-hinh-website', {headers:{Authorization:'Bearer '+customer}})).status, 403);
    assert.equal((await fetch(base+'/api/cau-hinh-website', {headers:{Authorization:'Bearer '+admin}})).status, 200);
    console.log('PASS: production HTTP page/assets, legacy URLs, backend isolation, public catalog, guest checkout and admin permissions');
  } finally {await new Promise(resolve => server.close(resolve));}
})().catch(error => {console.error(error);process.exitCode=1;});
