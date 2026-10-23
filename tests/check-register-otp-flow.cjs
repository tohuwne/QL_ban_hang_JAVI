const assert = require('assert/strict');
const bcrypt = require('bcryptjs');
const express = require('express');
process.env.OTP_DEV_MODE='true';

// Mock SQL pool
let users = [];
let customers = [];

const pool = {
  request() {
    const inputs = {};
    return {
      input(name, type, val) {
        inputs[name] = val;
        return this;
      },
      async query(q) {
        if (q.includes('SELECT 1 FROM TAI_KHOAN WHERE TenDangNhap = @TenDangNhap')) {
          const found = users.some(u => u.TenDangNhap === inputs.TenDangNhap);
          return { recordset: found ? [{ 1: 1 }] : [] };
        }
        if (q.includes('SELECT 1 FROM KHACH_HANG WHERE SoDTKH = @SoDTKH')) {
          const found = customers.some(c => c.SoDTKH === inputs.SoDTKH);
          return { recordset: found ? [{ 1: 1 }] : [] };
        }
        if (q.includes('SELECT TOP 1 MaKH FROM KHACH_HANG')) {
          const nextNum = customers.length;
          return { recordset: [{ MaKH: 'KH' + String(nextNum).padStart(6, '0') }] };
        }
        return { recordset: [] };
      }
    };
  },
  Transaction: class {
    constructor() {}
    async begin() {}
    request() {
      const inputs = {};
      return {
        input(name, type, val) {
          inputs[name] = val;
          return this;
        },
        async query(q) {
          if (q.includes('SELECT * FROM TAI_KHOAN') && q.includes('TenDangNhap = @TenDangNhap')) {
            const found = users.some(u => u.TenDangNhap === inputs.TenDangNhap);
            return { recordset: found ? [{ TenDangNhap: inputs.TenDangNhap }] : [] };
          }
          if(q.includes('SELECT 1 FROM KHACH_HANG'))return {recordset:customers.some(c=>c.SoDTKH===inputs.SoDTKH)?[{Used:1}]:[]};
          if (q.includes('INSERT INTO KHACH_HANG')) {
            const newKh = { MaKH: 'KH' + String(customers.length + 1).padStart(6, '0'), TenKH: inputs.TenKH, SoDTKH: inputs.SoDTKH, EmailKH: inputs.EmailKH, DiaChiKH: inputs.DiaChiKH };
            customers.push(newKh);
            return { rowsAffected: [1] };
          }
          if (q.includes('SELECT TOP 1 MaKH FROM KHACH_HANG')) {
            const last = customers[customers.length - 1];
            return { recordset: [last] };
          }
          if (q.includes('INSERT INTO TAI_KHOAN')) {
            users.push({ TenDangNhap: inputs.TenDangNhap, MatKhau: inputs.MatKhau, MaKH: inputs.MaKH, VaiTro: 'KHACH_HANG' });
            return { rowsAffected: [1] };
          }
          return { recordset: [] };
        }
      };
    }
    async commit() {}
    async rollback() {}
  }
};

// Đăng ký mock database
require.cache[require.resolve('../Shared/Backend/config/database')] = {
  exports: {
    sql: {
      VarChar: () => {},
      NVarChar: () => {},
      Char: () => {},
      Int: () => {},
      Bit: () => {},
      Transaction: pool.Transaction
    },
    poolPromise: Promise.resolve(pool)
  }
};

const authRouter = require('../Shared/Backend/routes/auth');
const app = express();
app.use(express.json());
app.use('/api', authRouter);

async function req(method, path, body = {}) {
  return new Promise((resolve, reject) => {
    const mockReq = {
      method,
      url: path,
      headers: { 'content-type': 'application/json' },
      body
    };
    const mockRes = {
      statusCode: 200,
      headers: {},
      status(code) { this.statusCode = code; return this; },
      setHeader(k, v) { this.headers[k] = v; },
      json(data) { resolve({ status: this.statusCode, ...data }); }
    };
    app(mockReq, mockRes, (err) => {
      if (err) reject(err);
      else resolve({ status: 404, message: 'Not found' });
    });
  });
}

(async () => {
  console.log('Testing Registration Step 1, Step 2, and OTP Flow...');
  for(const extra of [{},{otpType:'phone',otp:'123456'},{otpType:'email',skipOtpCheck:true}]){
    const blocked=await req('POST','/api/register',{username:'bypass_user',password:'password123',fullName:'Test',phone:'0909999988',email:'bypass@javi.vn',...extra});
    assert.equal(blocked.status,400);assert.equal(users.length,0);assert.equal(customers.length,0);
  }

  // 1. Kiểm tra Bước 1 (check-step1)
  let r = await req('POST', '/api/register/check-step1', { username: '', phone: '', email: '' });
  assert.equal(r.status, 400);

  r = await req('POST', '/api/register/check-step1', { username: 'abc', phone: '0901234567', email: 'test@javi.vn' });
  assert.equal(r.status, 400); // Username < 4 ký tự

  r = await req('POST', '/api/register/check-step1', { username: 'valid_user', phone: '0901234567', email: 'test@javi.vn' });
  assert.equal(r.status, 200);
  assert.equal(r.success, true);

  // 2. Gửi mã OTP qua email
  r = await req('POST', '/api/otp/send-email', { email: 'invalid-email' });
  assert.equal(r.status, 400);

  r = await req('POST', '/api/otp/send-email', { email: 'customer@javi.vn', fullName: 'Nguyen Van A' });
  assert.equal(r.status, 200);
  assert.equal(r.success, true);
  const otpCode = r.devOtp;
  assert.ok(otpCode && otpCode.length === 6);

  // Gửi lại quá nhanh (< 45s) -> Bị rate-limit 429
  r = await req('POST', '/api/otp/send-email', { email: 'customer@javi.vn' });
  assert.equal(r.status, 429);

  // 3. Xác thực OTP
  r = await req('POST', '/api/otp/verify', { type: 'email', target: 'customer@javi.vn', otp: '000000' });
  assert.equal(r.status, 400); // Sai OTP

  r = await req('POST', '/api/otp/verify', { type: 'email', target: 'customer@javi.vn', otp: otpCode });
  assert.equal(r.status, 200);
  assert.equal(r.success, true);

  // 4. Đăng ký tài khoản hoàn tất
  // Mật khẩu < 6 ký tự
  r = await req('POST', '/api/register', {
    username: 'valid_user',
    password: '123',
    fullName: 'Nguyen Van A',
    phone: '0901234567',
    email: 'customer@javi.vn',
    otp: otpCode,
    otpType: 'email'
  });
  assert.equal(r.status, 400);

  // Thành công với mật khẩu hợp lệ và OTP
  r = await req('POST', '/api/register', {
    username: 'valid_user',
    password: 'password123',
    fullName: 'Nguyen Van A',
    phone: '0901234567',
    email: 'customer@javi.vn',
    address: '123 Le Loi, Q1',
    otp: otpCode,
    otpType: 'email'
  });
  assert.equal(r.status, 200);
  assert.equal(r.success, true);
  assert.equal(r.data.TenDangNhap, 'valid_user');
  assert.equal(r.data.VaiTro, 'KHACH_HANG');
  assert.ok(r.data.MaKH);
  assert.ok(r.data.AuthToken);
  r=await req('POST','/api/register',{username:'replay_user',password:'password123',fullName:'Replay',phone:'0909999987',email:'customer@javi.vn',otpType:'email',otp:otpCode});
  assert.equal(r.status,400);assert.equal(users.length,1);
  const sent=await req('POST','/api/otp/send-email',{email:'locked@javi.vn'});
  for(let i=0;i<5;i++)assert.equal((await req('POST','/api/register',{username:'guess_user',password:'password123',fullName:'Guess',phone:'0909999986',email:'locked@javi.vn',otpType:'email',otp:'wrong'})).status,400);
  assert.equal((await req('POST','/api/register',{username:'guess_user',password:'password123',fullName:'Guess',phone:'0909999986',email:'locked@javi.vn',otpType:'email',otp:sent.devOtp})).status,400);assert.equal(users.length,1);

  // Không cho đăng ký trùng username vừa tạo
  r = await req('POST', '/api/register/check-step1', { username: 'valid_user', phone: '0909999999', email: 'other@javi.vn' });
  assert.equal(r.status, 400);
  assert.ok(r.message.includes('đã được sử dụng'));

  console.log('PASS: Multi-step registration, password validation, OTP generation, verification, and customer creation all verified.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
