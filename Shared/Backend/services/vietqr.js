// VietQR.io v2: GET /banks (BIN lookup) and POST /generate (EMVCo payload + PNG data URL).
const API = (process.env.VIETQR_API_URL || 'https://api.vietqr.io/v2').replace(/\/+$/, '');
const BANK_CACHE_MS = 12 * 60 * 60 * 1000;
let bankCache = null;

function failure(message, status = 502) {
  const error = new Error(message);
  error.status = status;
  return error;
}
const fold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd');
const key = value => fold(value).toLowerCase().replace(/[^a-z0-9]/g, '');

async function call(path, init = {}) {
  const headers = {'Content-Type': 'application/json'};
  if (process.env.VIETQR_CLIENT_ID && process.env.VIETQR_API_KEY) {
    headers['x-client-id'] = process.env.VIETQR_CLIENT_ID;
    headers['x-api-key'] = process.env.VIETQR_API_KEY;
  }
  let response;
  try {
    response = await fetch(API + path, {...init, headers, signal: AbortSignal.timeout(15000)});
  } catch (_err) {
    throw failure('Không kết nối được VietQR. Vui lòng thử lại sau ít phút.');
  }
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.code !== '00' || !body.data) throw failure('VietQR chưa tạo được mã thanh toán. Vui lòng thử lại.');
  return body.data;
}

async function bankBin(bankName) {
  const wanted = key(bankName);
  if (!wanted) throw failure('Cửa hàng chưa cấu hình ngân hàng nhận chuyển khoản.', 409);
  if (/^\d{6}$/.test(wanted)) return wanted;
  if (!bankCache || bankCache.expires < Date.now()) bankCache = {banks: await call('/banks'), expires: Date.now() + BANK_CACHE_MS};
  const bank = bankCache.banks.find(b => [b.bin, b.code, b.shortName, b.short_name, b.name].some(value => key(value) === wanted));
  if (!bank) throw failure('Tên ngân hàng nhận chuyển khoản không khớp danh sách VietQR. Quản trị cần nhập mã BIN, mã hoặc tên viết tắt ngân hàng.', 409);
  return String(bank.bin);
}

// Amount is embedded in the QR so the banking app displays it when scanning.
async function generateVietQR({bankName, accountNo, accountName, amount, addInfo}) {
  const account = String(accountNo || '').trim();
  const name = fold(accountName).toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!/^[A-Za-z0-9]{6,19}$/.test(account) || name.length < 5 || name.length > 50) throw failure('Cửa hàng chưa cấu hình đủ số tài khoản và chủ tài khoản nhận chuyển khoản.', 409);
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 9999999999999) throw failure('Số tiền thanh toán không hợp lệ.', 409);
  if (!/^[A-Z0-9 ]{1,25}$/.test(addInfo)) throw failure('Nội dung chuyển khoản không hợp lệ.', 500);
  const bin = await bankBin(bankName);
  const data = await call('/generate', {method: 'POST', body: JSON.stringify({accountNo: account, accountName: name, acqId: Number(bin), amount, addInfo, format: 'text', template: 'compact2'})});
  if (typeof data.qrCode !== 'string' || !data.qrCode || data.qrCode.length > 1000 || typeof data.qrDataURL !== 'string' || !data.qrDataURL.startsWith('data:image/png;base64,') || data.qrDataURL.length > 2000000) {
    throw failure('VietQR trả về mã thanh toán không hợp lệ.');
  }
  return {bin, accountNo: account, accountName: name, qrCode: data.qrCode, qrDataURL: data.qrDataURL};
}

module.exports = {generateVietQR};
