const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' đ';
const lineTotal = item => Number(item.ThanhTien ?? Number(item.GiaBan) * Number(item.SoLuong));
const display = value => escape(String(value ?? '').trim() || '—');
const orderDate = order => {
  const value = new Date(order.NgayTao || order.NgayDat || Date.now());
  return Number.isNaN(value.getTime()) ? '—' : new Intl.DateTimeFormat('vi-VN', {
    day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Asia/Ho_Chi_Minh',
  }).format(value);
};

function renderOrderEmail(order, items, settings = {}) {
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const cell = 'padding:15px 10px;border-bottom:1px solid #e5e7eb;vertical-align:top;';
  const lines = items.map((item, index) => `<tr>
    <td class="item-cell" style="${cell}color:#8a8a8a;text-align:center;">${index + 1}</td>
    <td class="item-cell" style="${cell}word-break:break-word;"><strong style="font-weight:600;color:#181818;">${escape(item.TenSP)}</strong>${item.TrongLuongGram?'<br><span style="font-size:12px;color:#777;">'+Number(item.TrongLuongGram)+'g / '+escape(item.LoaiXay)+'</span>':''}${item.MaSP ? `<br><span style="font-size:11px;color:#777;">Mã SP: ${escape(String(item.MaSP).trim())}</span>` : ''}</td>
    <td class="item-cell" style="${cell}text-align:center;">${Number(item.SoLuong)}</td>
    <td class="item-cell" style="${cell}text-align:right;white-space:nowrap;">${money(item.GiaBan)}</td>
    <td class="item-cell" style="${cell}text-align:right;white-space:nowrap;font-weight:600;">${money(lineTotal(item))}</td>
  </tr>`).join('');
  const bank = order.IsPreview && order.HinhThucTT === 'Chuyển khoản' && settings.SoTaiKhoan
    ? `<p style="margin:12px 0 0;font-size:12px;line-height:1.8;">Ngân hàng: <strong>${display(settings.TenNganHang)}</strong><br>Số tài khoản: <strong>${display(settings.SoTaiKhoan)}</strong><br>Chủ tài khoản: <strong>${display(settings.ChuTaiKhoan)}</strong><br>Nội dung chuyển khoản: <strong>${display(order.MaDH)}</strong></p>` : '';
  const method = order.HinhThucTT === 'Tiền mặt' ? 'Thanh toán khi nhận hàng (COD)' : order.HinhThucTT;
  const preview = order.IsPreview ? '<div style="padding:12px 24px;background:#fff6d6;color:#795c00;text-align:center;font-size:12px;font-weight:bold;">EMAIL GỬI THỬ · ĐƠN HÀNG MẪU · KHÔNG CẦN THANH TOÁN</div>' : '';
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>JAVI COFFEE · Đơn hàng ${escape(order.MaDH)}</title>
<style>@media only screen and (max-width:600px){.mail-padding{padding-left:16px!important;padding-right:16px!important}.info-column{display:block!important;width:100%!important;padding-right:0!important;padding-bottom:18px!important}.item-cell{padding:12px 5px!important;font-size:11px!important}.invoice-title{font-size:23px!important}.mail-shell{border-radius:0!important}}</style>
</head><body style="margin:0;padding:0;background:#f1f2f4;color:#303030;font-family:Arial,Helvetica,sans-serif;line-height:1.6;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${order.IsPreview ? 'Bản gửi thử. ' : ''}Đơn ${escape(order.MaDH)} · ${items.length} mặt hàng · Tổng cộng ${money(order.TongThanhToan)}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f2f4;"><tr><td align="center" style="padding:24px 0;">
<table role="presentation" class="mail-shell" width="700" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:700px;background:#fff;border:1px solid #e0e2e5;border-radius:12px;overflow:hidden;">
<tr><td class="mail-padding" style="padding:22px 32px;background:#0d0d0d;border-bottom:3px solid #ffd700;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:middle;"><img src="cid:javi-logo" alt="JAVI COFFEE" width="104" height="66" style="display:block;width:104px;height:66px;border:0;"></td><td align="right" style="vertical-align:middle;color:#bbb;font-size:10px;letter-spacing:1px;">JAVI COFFEE<br><span style="color:#ffd700;">NĂNG LƯỢNG KHAI SÁNG</span></td></tr></table>
</td></tr>
<tr><td>${preview}</td></tr>
<tr><td class="mail-padding" style="padding:28px 32px 22px;">
  <p style="margin:0 0 6px;color:#9b7b13;font-size:10px;font-weight:bold;letter-spacing:2px;">XÁC NHẬN ĐẶT HÀNG</p>
  <h1 class="invoice-title" style="margin:0 0 20px;color:#171717;font-size:29px;line-height:1.3;font-weight:700;">Chi tiết đơn hàng</h1>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:12px;background:#f7f7f8;border:1px solid #e7e7e9;border-radius:8px;"><tr><td style="padding:14px 16px;color:#777;">Mã đơn hàng<br><strong style="font-size:16px;color:#171717;">${display(order.MaDH)}</strong></td><td align="right" style="padding:14px 16px;color:#777;">Ngày đặt hàng<br><strong style="color:#333;font-weight:500;">${orderDate(order)}</strong></td></tr></table>
  <p style="margin:22px 0 6px;font-size:13px;">Xin chào <strong>${display(order.NguoiNhan)}</strong>,</p>
  <p style="margin:0;color:#666;font-size:13px;">${order.IsPreview ? 'Đây là bản mẫu để bạn kiểm tra giao diện email đơn hàng của JAVI.' : 'Cảm ơn bạn đã chọn JAVI. Chúng tôi đã tiếp nhận đơn hàng với thông tin chi tiết bên dưới.'}</p>
</td></tr>
<tr><td class="mail-padding" style="padding:0 32px 24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:12px;"><tr>
    <td class="info-column" width="55%" style="width:55%;padding-right:24px;vertical-align:top;"><h2 style="font-size:11px;color:#777;letter-spacing:.6px;margin:0 0 8px;">THÔNG TIN NHẬN HÀNG</h2><p style="margin:0;font-size:13px;line-height:1.8;"><strong>${display(order.NguoiNhan)}</strong><br>${display(order.SoDT)}<br><span style="overflow-wrap:anywhere;">${display(order.Email)}</span><br>${display(order.DiaChi)}</p></td>
    <td class="info-column" width="45%" style="width:45%;vertical-align:top;"><h2 style="font-size:11px;color:#777;letter-spacing:.6px;margin:0 0 8px;">THANH TOÁN</h2><p style="margin:0;font-size:13px;"><strong>${display(method)}</strong><br><span style="display:inline-block;margin-top:7px;padding:3px 9px;background:#fff4cf;border-radius:4px;color:#856300;font-size:11px;">${order.IsPreview ? 'Đơn mẫu · Không thanh toán' : 'Đã thanh toán'}</span></p>${bank}</td>
  </tr></table>
</td></tr>
<tr><td class="mail-padding" style="padding:0 32px;">
  <table aria-label="Chi tiết sản phẩm trong đơn hàng" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-size:12px;color:#333;">
    <thead><tr style="background:#171717;color:#fff;">
      <th class="item-cell" scope="col" style="padding:11px 10px;text-align:center;width:24px;font-size:10px;">STT</th>
      <th class="item-cell" scope="col" style="padding:11px 10px;text-align:left;">Sản phẩm</th>
      <th class="item-cell" scope="col" style="padding:11px 10px;text-align:center;width:28px;">SL</th>
      <th class="item-cell" scope="col" style="padding:11px 10px;text-align:right;white-space:nowrap;">Đơn giá</th>
      <th class="item-cell" scope="col" style="padding:11px 10px;text-align:right;white-space:nowrap;">Thành tiền</th>
    </tr></thead><tbody>${lines}</tbody>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;">
    <tr><td style="padding:16px 10px 5px;color:#666;">Tạm tính</td><td align="right" style="padding:16px 10px 5px;">${money(subtotal)}</td></tr>
    <tr><td style="padding:5px 10px 16px;color:#666;">Phí giao hàng</td><td align="right" style="padding:5px 10px 16px;">${money(order.PhiVanChuyen)}</td></tr>
${Number(order.TienGiam)>0?`<tr><td style="padding:5px 10px;color:#666;">Giảm giá (${escape(order.MaGiamGia||'')})</td><td align="right" style="padding:5px 10px;">−${money(order.TienGiam)}</td></tr>`:''}
    <tr style="background:#fff8dc;"><td style="padding:16px 10px;border-top:1px solid #efdfa1;font-weight:bold;color:#171717;">TỔNG THANH TOÁN</td><td align="right" style="padding:16px 10px;border-top:1px solid #efdfa1;font-size:21px;font-weight:bold;color:#171717;white-space:nowrap;">${money(order.TongThanhToan)}</td></tr>
  </table>
</td></tr>
<tr><td class="mail-padding" style="padding:24px 32px 30px;">
  ${order.GhiChu ? `<div style="padding:12px 16px;background:#f7f7f8;border-left:3px solid #d4b344;font-size:12px;white-space:pre-line;"><strong>Ghi chú đơn hàng</strong><br>${escape(order.GhiChu)}</div>` : ''}
  <p style="margin:18px 0 0;font-size:12px;color:#777;">${order.IsPreview ? 'Đơn hàng này chỉ dùng để kiểm tra email, không phát sinh giao dịch hoặc giao hàng.' : 'Đơn hàng đang chờ JAVI kiểm tra và xác nhận giao hàng. Thanh toán đã thành công. JAVI sẽ tiếp tục xử lý giao hàng.'}</p>
  <p style="margin:12px 0 0;font-size:12px;color:#777;">Cần hỗ trợ hoặc thay đổi thông tin? Hãy phản hồi email này và ghi kèm mã đơn hàng.</p>
</td></tr>
<tr><td class="mail-padding" style="padding:20px 32px;background:#fafafa;border-top:1px solid #e7e7e9;text-align:center;"><strong style="font-size:12px;letter-spacing:1px;color:#333;">JAVI COFFEE</strong><br><span style="font-size:11px;color:#888;">Trân trọng từng lựa chọn. Hẹn gặp ở một tách cà phê.</span></td></tr>
</table></td></tr></table></body></html>`;
}

function renderOrderText(order, items) {
  return [
    'JAVI COFFEE · XÁC NHẬN ĐẶT HÀNG',
    order.IsPreview ? 'EMAIL GỬI THỬ · ĐƠN HÀNG MẪU · KHÔNG CẦN THANH TOÁN' : '',
    `Mã đơn: ${order.MaDH} | Ngày đặt: ${orderDate(order)}`,
    `Người nhận: ${order.NguoiNhan || '—'}`,
    `Điện thoại: ${order.SoDT || '—'} | Email: ${order.Email || '—'}`,
    `Địa chỉ: ${order.DiaChi || '—'}`, '',
    ...items.map((item, index) => `${index + 1}. ${item.TenSP} | SL: ${item.SoLuong} | Đơn giá: ${money(item.GiaBan)} | Thành tiền: ${money(lineTotal(item))}`), '',
    `Tạm tính: ${money(items.reduce((sum, item) => sum + lineTotal(item), 0))}`,
    `Phí giao hàng: ${money(order.PhiVanChuyen)}`,
    `TỔNG THANH TOÁN: ${money(order.TongThanhToan)}`,
    `Phương thức: ${order.HinhThucTT}`,
    order.GhiChu ? `Ghi chú: ${order.GhiChu}` : '',
    order.IsPreview ? 'Không phát sinh giao dịch hoặc giao hàng.' : 'Đơn hàng đang chờ JAVI xác nhận. Thanh toán đã thành công.',
  ].filter(Boolean).join('\n');
}

module.exports = { renderOrderEmail, renderOrderText };

