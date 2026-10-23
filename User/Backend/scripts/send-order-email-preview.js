// Preview is the default. Only --send transmits this one sample to the requested recipient.
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { renderOrderEmail, renderOrderText } = require('../../../Shared/Backend/services/order-email-template');
require('dotenv').config({ path:path.join(__dirname, '../../../.env'), quiet:true });

const sender = 'nguyenminhthu.invn@gmail.com';
const recipient = 'Tohuw3107@gmail.com';
const output = path.join(__dirname, '../storage/previews');
const items = [
  { MaSP:'MAU-01', TenSP:'Cà phê ĐẬM MẠNH (200gr - HẠT)', GiaBan:79000, SoLuong:2 },
  { MaSP:'MAU-02', TenSP:'Cà phê ĐẬM MẠNH (500gr - XAY)', GiaBan:197500, SoLuong:1 },
];
const order = {
  MaDH:'DEMO-171026', NgayTao:new Date(), NguoiNhan:'Khách hàng dùng thử',
  SoDT:'Chưa cung cấp', Email:recipient, DiaChi:'Địa chỉ giao hàng mẫu',
  GhiChu:'Bản gửi thử để kiểm tra bố cục bảng đơn hàng trong email.',
  HinhThucTT:'Tiền mặt', PhiVanChuyen:25000, TongThanhToan:380500, IsPreview:true,
};

async function main() {
  fs.mkdirSync(output, { recursive:true });
  const html = renderOrderEmail(order, items);
  const text = renderOrderText(order, items);
  const logo = path.join(__dirname, '../../../Shared/Frontend/images/logo-javi-auth.png');
  const previewHtml = html.replaceAll('cid:javi-logo', 'data:image/png;base64,' + fs.readFileSync(logo).toString('base64'));
  const previewPath = path.join(output, 'email-don-hang-mau.html');
  fs.writeFileSync(previewPath, previewHtml);
  fs.writeFileSync(path.join(output, 'email-don-hang-mau.txt'), text);
  console.log('Đã tạo bản xem trước: ' + previewPath);
  if (!process.argv.includes('--send')) return;

  const smtpUser = String(process.env.SMTP_USER || '').trim();
  const smtpFrom = String(process.env.SMTP_FROM || smtpUser).trim();
  if (smtpUser.toLowerCase() !== sender || smtpFrom.toLowerCase() !== sender) {
    throw new Error('SMTP_USER và SMTP_FROM phải là ' + sender + ' để gửi đúng email hệ thống được yêu cầu.');
  }
  if (!process.env.SMTP_HOST || !String(process.env.SMTP_PASS || '').trim()) {
    throw new Error('Chưa có SMTP_PASS trong .env. Hãy tự điền mật khẩu ứng dụng Gmail rồi chạy lại lệnh gửi thử.');
  }
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host:process.env.SMTP_HOST, port, secure:port === 465,
    auth:{ user:smtpUser, pass:process.env.SMTP_PASS },
    connectionTimeout:10000, greetingTimeout:10000, socketTimeout:20000,
  });
  try {
    const result = await transport.sendMail({
      from:{ name:'JAVI COFFEE', address:sender }, to:recipient, replyTo:sender,
      subject:'[GỬI THỬ] JAVI COFFEE · Chi tiết đơn hàng ' + order.MaDH,
      html, text, attachments:[{ filename:'javi-logo.png', path:logo, cid:'javi-logo' }],
    });
    if (!result.accepted?.some(address => String(address).toLowerCase() === recipient.toLowerCase())) {
      throw new Error('Máy chủ SMTP chưa chấp nhận địa chỉ nhận.');
    }
    const receipt = { from:sender, to:recipient, messageId:result.messageId, accepted:result.accepted, sentAt:new Date().toISOString() };
    fs.writeFileSync(path.join(output, 'email-don-hang-mau-send-result.json'), JSON.stringify(receipt, null, 2));
    console.log(JSON.stringify(receipt));
  } finally {
    transport.close();
  }
}

if (require.main === module) main().catch(error => {
  console.error('Không gửi được email thử: ' + (error.code ? error.code + ' · ' : '') + (error.code === 'EAUTH' ? 'Gmail từ chối xác thực. Kiểm tra SMTP_USER và mật khẩu ứng dụng trong SMTP_PASS.' : error.message));
  process.exitCode = 1;
});

module.exports = { order, items };
