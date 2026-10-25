// Website bank-transfer payment by VietQR. Each QR has its own transfer reference and expiry;
// "Thanh toán thành công" is a demo of the bank confirming payment for exactly that reference.
const express = require('express');
const crypto = require('crypto');
const {sql, poolPromise} = require('../../../Shared/Backend/config/database');
const {authenticate, authorizeApi} = require('../../../Shared/Backend/middleware/auth');
const {deliverOrderEmail} = require('../../../Shared/Backend/services/order-email');
const {generateVietQR} = require('../../../Shared/Backend/services/vietqr');
const {wrap, fail, settingsQuery} = require('../../../Shared/Backend/services/website-common');
const router = express.Router();

const PENDING = 'Chờ thanh toán', PAID = 'Đã thanh toán', EXPIRED = 'Hết hạn';
const expirySeconds = () => {
  const minutes = Number(process.env.VIETQR_EXPIRE_MINUTES || 5);
  return Math.round((Number.isFinite(minutes) && minutes >= 1 && minutes <= 60 ? minutes : 5) * 60);
};
const orderId = value => {
  const id = String(value || '').trim().toUpperCase();
  if (!/^DH\d{6}$/.test(id)) fail('Không tìm thấy đơn hàng.', 404);
  return id;
};
const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const reference = id => 'JAVI ' + id + ' ' + Array.from(crypto.randomBytes(6), byte => REF_CHARS[byte % REF_CHARS.length]).join('');
const qrColumns = `MaQR,MaThamChieu,SoTien,MaNganHang,SoTaiKhoan,ChuTaiKhoan,AnhQR,TrangThai,NgayTao,HetHan,NgayThanhToan,
 CASE WHEN TrangThai=N'${PENDING}' THEN DATEDIFF(SECOND,SYSDATETIME(),HetHan) ELSE 0 END AS ConLaiGiay`;
const view = row => row ? {
  maQR: row.MaQR, maThamChieu: row.MaThamChieu, soTien: Number(row.SoTien), maNganHang: row.MaNganHang,
  soTaiKhoan: row.SoTaiKhoan, chuTaiKhoan: row.ChuTaiKhoan, anhQR: row.AnhQR, trangThai: row.TrangThai,
  ngayTao: row.NgayTao, hetHan: row.HetHan, ngayThanhToan: row.NgayThanhToan, conLaiGiay: Math.max(0, Number(row.ConLaiGiay) || 0),
} : null;

async function loadOrder(db, id, username, lock = false) {
  const hint = lock ? ' WITH(UPDLOCK,HOLDLOCK)' : '';
  const r = await db.request().input('ID', sql.Char(8), id).input('User', sql.VarChar(50), username).query(`SELECT w.MaDH,w.HinhThucTT,w.TongThanhToan,dh.TrangThaiDonHang,dh.MaNV,
   (SELECT TOP 1 h.TrangThaiThanhToan FROM HOA_DON h WHERE h.MaDH=w.MaDH ORDER BY h.MaHD DESC) AS TrangThaiThanhToan
   FROM WEB_DON_HANG w${hint} JOIN DON_HANG dh${hint} ON dh.MaDH=w.MaDH WHERE w.MaDH=@ID AND w.TenDangNhap=@User`);
  const order = r.recordset[0];
  if (!order) fail('Không tìm thấy đơn hàng.', 404);
  if (order.HinhThucTT !== 'Chuyển khoản') fail('Đơn hàng này thanh toán khi nhận hàng, không dùng mã chuyển khoản.', 409);
  return order;
}
const expireStale = (db, id) => db.request().input('ID', sql.Char(8), id)
  .query(`UPDATE WEB_THANH_TOAN_QR SET TrangThai=N'${EXPIRED}' WHERE MaDH=@ID AND TrangThai=N'${PENDING}' AND HetHan<=SYSDATETIME()`);
async function latestQr(db, id) {
  const r = await db.request().input('ID', sql.Char(8), id).query(`SELECT TOP 1 ${qrColumns} FROM WEB_THANH_TOAN_QR WHERE MaDH=@ID
   ORDER BY CASE TrangThai WHEN N'${PAID}' THEN 0 ELSE 1 END, MaQR DESC`);
  return r.recordset[0];
}
function payableReason(order) {
  if (order.TrangThaiThanhToan === PAID) return 'Đơn hàng đã được thanh toán.';
  if (order.TrangThaiThanhToan) return 'Đơn hàng đã được lập hóa đơn, vui lòng liên hệ JAVI để thanh toán.';
  if (order.TrangThaiDonHang !== 'Chờ giao') return 'Đơn hàng không còn chờ thanh toán.';
  return '';
}
const state = (order, qr) => ({
  maDH: order.MaDH, tongThanhToan: Number(order.TongThanhToan), trangThaiDonHang: order.TrangThaiDonHang,
  daThanhToan: order.TrangThaiThanhToan === PAID, lyDoKhongThanhToan: payableReason(order), qr: view(qr),
});

const customer = (req, res, next) => req.user.vaiTro === 'KHACH_HANG' ? next() : res.status(403).json({success: false, message: 'Vui lòng dùng tài khoản khách hàng.'});
const guard = [authenticate, authorizeApi, customer];

router.get('/website/orders/:id/payment', guard, wrap(async (req, res) => {
  const id = orderId(req.params.id), pool = await poolPromise;
  const order = await loadOrder(pool, id, req.user.sub);
  await expireStale(pool, id);
  res.json({success: true, data: state(order, await latestQr(pool, id))});
}));

// Returns the still-valid QR, otherwise asks VietQR for a new one (initial load or refresh after expiry).
router.post('/website/orders/:id/payment/qr', guard, wrap(async (req, res) => {
  const id = orderId(req.params.id), pool = await poolPromise;
  const order = await loadOrder(pool, id, req.user.sub);
  const reason = payableReason(order);
  if (reason) fail(reason, 409);
  await expireStale(pool, id);
  const current = await latestQr(pool, id);
  if (current?.TrangThai === PENDING) return res.json({success: true, data: state(order, current)});
  const settings = (await pool.request().query(settingsQuery)).recordset[0] || {};
  const amount = Math.round(Number(order.TongThanhToan));
  const ref = reference(id);
  const qr = await generateVietQR({bankName: settings.TenNganHang, accountNo: settings.SoTaiKhoan, accountName: settings.ChuTaiKhoan, amount, addInfo: ref});
  // Only the newest QR of an order stays payable.
  const saved = await pool.request().input('ID', sql.Char(8), id).input('Ref', sql.VarChar(25), ref).input('Amount', sql.Decimal(19, 3), amount)
    .input('Bin', sql.VarChar(10), qr.bin).input('Account', sql.VarChar(50), qr.accountNo).input('Name', sql.NVarChar(100), qr.accountName)
    .input('Payload', sql.VarChar(1000), qr.qrCode).input('Image', sql.VarChar(sql.MAX), qr.qrDataURL).input('Seconds', sql.Int, expirySeconds())
    .query(`UPDATE WEB_THANH_TOAN_QR SET TrangThai=N'${EXPIRED}' WHERE MaDH=@ID AND TrangThai=N'${PENDING}';
     INSERT INTO WEB_THANH_TOAN_QR(MaDH,MaThamChieu,SoTien,MaNganHang,SoTaiKhoan,ChuTaiKhoan,NoiDungQR,AnhQR,HetHan)
     VALUES(@ID,@Ref,@Amount,@Bin,@Account,@Name,@Payload,@Image,DATEADD(SECOND,@Seconds,SYSDATETIME()));
     SELECT ${qrColumns} FROM WEB_THANH_TOAN_QR WHERE MaThamChieu=@Ref`);
  res.status(201).json({success: true, data: state(order, saved.recordset[0])});
}));

// Demo bank confirmation for one QR reference: unpaid invoice + full receipt (trigger settles it to paid).
router.post('/website/orders/:id/payment/confirm', guard, wrap(async (req, res) => {
  const id = orderId(req.params.id), ref = String(req.body?.maThamChieu || '').trim().toUpperCase();
  if (!/^[A-Z0-9 ]{1,25}$/.test(ref)) fail('Mã QR không hợp lệ.');
  const pool = await poolPromise, tx = new sql.Transaction(pool);
  await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  let result;
  try {
    const order = await loadOrder(tx, id, req.user.sub, true);
    const found = await tx.request().input('ID', sql.Char(8), id).input('Ref', sql.VarChar(25), ref)
      .query(`SELECT MaQR,TrangThai,CASE WHEN HetHan<=SYSDATETIME() THEN 1 ELSE 0 END AS DaHetHan FROM WEB_THANH_TOAN_QR WITH(UPDLOCK,HOLDLOCK) WHERE MaDH=@ID AND MaThamChieu=@Ref`);
    const qr = found.recordset[0];
    if (!qr) fail('Không tìm thấy mã QR của đơn hàng.', 404);
    if (qr.TrangThai === PAID) fail('Mã QR này đã được thanh toán, không thể quét lại.', 409);
    if (qr.TrangThai === EXPIRED || qr.DaHetHan) {
      await tx.request().input('QR', sql.Int, qr.MaQR).query(`UPDATE WEB_THANH_TOAN_QR SET TrangThai=N'${EXPIRED}' WHERE MaQR=@QR`);
      await tx.commit();
      fail('Mã QR đã hết hạn, vui lòng làm mới mã để thanh toán.', 410);
    }
    const reason = payableReason(order);
    if (reason) fail(reason, 409);
    await tx.request().query('SELECT TOP 0 1 FROM HOA_DON WITH(TABLOCKX,HOLDLOCK); SELECT TOP 0 1 FROM CONG_NO WITH(TABLOCKX,HOLDLOCK); SELECT TOP 0 1 FROM PHIEU_THU WITH(TABLOCKX,HOLDLOCK)');
    await tx.request().input('MaDH', sql.Char(8), id).input('MaNV', sql.Char(8), order.MaNV).input('HinhThucThanhToan', sql.NVarChar(50), 'Chuyển khoản')
      .input('TrangThaiThanhToan', sql.NVarChar(50), 'Chưa thanh toán').execute('sp_LapHoaDon');
    const debt = (await tx.request().input('ID', sql.Char(8), id).query('SELECT TOP 1 h.MaHD,c.MaCN,c.SoDuCN FROM HOA_DON h JOIN CONG_NO c ON c.MaHD=h.MaHD WHERE h.MaDH=@ID ORDER BY h.MaHD DESC')).recordset[0];
    if (!debt) fail('Không lập được hóa đơn cho đơn hàng.', 500);
    await tx.request().input('Amount', sql.Decimal(19, 3), debt.SoDuCN).input('Note', sql.NVarChar(255), 'Thu chuyển khoản VietQR ' + ref)
      .input('CN', sql.Char(8), debt.MaCN).input('NV', sql.Char(8), order.MaNV)
      .query(`INSERT INTO PHIEU_THU(NgayThu,SoTienThucThu,HinhThucThanhToan,GhiChu,MaCN,MaNV) VALUES(GETDATE(),@Amount,N'Chuyển khoản',@Note,@CN,@NV)`);
    const receipt = (await tx.request().input('CN', sql.Char(8), debt.MaCN).query('SELECT TOP 1 MaPT FROM PHIEU_THU WHERE MaCN=@CN ORDER BY MaPT DESC')).recordset[0];
    await tx.request().input('ID', sql.Char(8), id).input('QR', sql.Int, qr.MaQR).input('PT', sql.Char(8), receipt.MaPT)
      .query(`UPDATE WEB_THANH_TOAN_QR SET TrangThai=N'${PAID}',NgayThanhToan=SYSDATETIME(),MaPT=@PT WHERE MaQR=@QR;
       UPDATE WEB_THANH_TOAN_QR SET TrangThai=N'${EXPIRED}' WHERE MaDH=@ID AND TrangThai=N'${PENDING}'`);
    const settled = (await tx.request().input('HD', sql.Char(8), debt.MaHD).query('SELECT TrangThaiThanhToan FROM HOA_DON WHERE MaHD=@HD')).recordset[0];
    if (settled?.TrangThaiThanhToan !== PAID) fail('Không ghi nhận được thanh toán cho hóa đơn.', 500);
    await tx.commit();
    result = {maDH: id, maHD: debt.MaHD, maPT: receipt.MaPT};
  } catch (err) {
    try { await tx.rollback(); } catch (_) {}
    throw err;
  }
  // Mail failure never undoes a recorded payment; the worker retries.
  try { await deliverOrderEmail(id); } catch (_) { console.error('[WEB EMAIL] Không gửi được email cho', id); }
  res.json({success: true, data: result});
}));

module.exports = router;
