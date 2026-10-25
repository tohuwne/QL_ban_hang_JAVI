const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const {sql,poolPromise} = require('../config/database');
const {renderOrderEmail} = require('./order-email-template');
const emailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
// An order email is ready once the order has an invoice: COD gets an unpaid invoice at checkout,
// bank transfer gets its invoice only after the QR payment succeeds.
const invoicePredicate="EXISTS(SELECT 1 FROM HOA_DON h WHERE h.MaDH=WEB_EMAIL.MaDH)";
const paid=order=>order.TrangThaiThanhToan==='Đã thanh toán';
const orderEmailSubject=order=>(paid(order)?'JAVI COFFEE · Đơn đã thanh toán ':'JAVI COFFEE · Đặt hàng thành công ')+String(order.MaDH).trim();
async function queueOrderEmail(maDH){
 const pool=await poolPromise;
 const result=await pool.request().input('ID',sql.Char(8),maDH).query(`SELECT w.*,u.TienGiam,u.MaGiamGia,h.TrangThaiThanhToan FROM WEB_DON_HANG w
 LEFT JOIN WEB_UU_DAI_DON_HANG u ON u.MaDH=w.MaDH
 CROSS APPLY(SELECT TOP 1 TrangThaiThanhToan FROM HOA_DON WHERE MaDH=w.MaDH ORDER BY MaHD DESC) h
 WHERE w.MaDH=@ID`);
 const order=result.recordset[0];if(!order)return false;
 const items=(await pool.request().input('ID',sql.Char(8),maDH).query('SELECT * FROM WEB_CT_DON_HANG WHERE MaDH=@ID ORDER BY MaDong')).recordset;
 const settings=(await pool.request().query('SELECT * FROM WEB_CAU_HINH WHERE ID=1')).recordset[0];
 const html=renderOrderEmail(order,items,settings);
 await pool.request().input('ID',sql.Char(8),maDH).input('To',sql.VarChar(100),order.Email).input('Title',sql.NVarChar(250),orderEmailSubject(order)).input('Html',sql.NVarChar(sql.MAX),html)
  .query(`UPDATE WEB_EMAIL SET NguoiNhan=@To,TieuDe=@Title,NoiDung=@Html WHERE MaDH=@ID AND TrangThai IN('pending','preview','failed');
  INSERT WEB_EMAIL(MaDH,NguoiNhan,TieuDe,NoiDung) SELECT @ID,@To,@Title,@Html WHERE NOT EXISTS(SELECT 1 FROM WEB_EMAIL WITH(UPDLOCK,HOLDLOCK) WHERE MaDH=@ID)`);
 return true;
}
// Only paid orders get a missing email row created late; unpaid COD rows are created at checkout.
async function sendPaidOrderEmails(){
 const pool=await poolPromise;
 const r=await pool.request().query("SELECT TOP 20 w.MaDH FROM WEB_DON_HANG w WHERE EXISTS(SELECT 1 FROM HOA_DON h WHERE h.MaDH=w.MaDH AND h.TrangThaiThanhToan=N'Đã thanh toán') AND NOT EXISTS(SELECT 1 FROM WEB_EMAIL e WHERE e.MaDH=w.MaDH) ORDER BY w.MaDH");
 for(const row of r.recordset){await queueOrderEmail(row.MaDH);await deliverOrderEmail(row.MaDH);}
}
async function deliverOrderEmail(maDH,manual=false){
 if(!await queueOrderEmail(maDH))return 'not-ready';
 const pool=await poolPromise;
 if(!emailConfigured()){
  await pool.request().input('ID',sql.Char(8),maDH).query("UPDATE WEB_EMAIL SET TrangThai='preview' WHERE MaDH=@ID AND TrangThai IN ('pending','failed') AND "+invoicePredicate);return 'preview';
 }
 const r=await pool.request().input('ID',sql.Char(8),maDH).input('Manual',sql.Bit,manual).query(`UPDATE WEB_EMAIL WITH(ROWLOCK) SET TrangThai='sending',SoLanThu=SoLanThu+1,Loi=NULL OUTPUT inserted.* WHERE MaDH=@ID AND TrangThai IN ('pending','preview','failed') AND (SoLanThu<3 OR @Manual=1) AND ${invoicePredicate}`);
 const mail=r.recordset[0];if(!mail)return 'unchanged';
 try{
  const port=Number(process.env.SMTP_PORT||465);
  const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port,secure:port===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000});
  const result=await transport.sendMail({from:{name:'JAVI COFFEE',address:process.env.SMTP_FROM||process.env.SMTP_USER},to:mail.NguoiNhan,subject:mail.TieuDe,html:mail.NoiDung,attachments:[{filename:'javi-logo.png',path:path.join(require('../config/paths').sharedFrontend,'images/logo-javi-auth.png'),cid:'javi-logo'}],text:`${mail.TieuDe}. Vui lòng xem thông tin chi tiết trong email HTML hoặc trên website.`,messageId:`<javi-${mail.MaDH.trim()}@${(process.env.SMTP_FROM||process.env.SMTP_USER).split('@')[1]}>`});
  if(!result.accepted?.length)throw new Error('SMTP did not accept recipient');
  await pool.request().input('ID',sql.Int,mail.ID).query("UPDATE WEB_EMAIL SET TrangThai='sent',NgayGui=SYSDATETIME(),Loi=NULL WHERE ID=@ID");return 'sent';
 }catch(error){
  const code=String(error.code||'SMTP_ERROR').slice(0,50);
  await pool.request().input('ID',sql.Int,mail.ID).input('Error',sql.NVarChar(1000),`Không gửi được email (${code}). Kiểm tra cấu hình SMTP và thử gửi lại.`).query("UPDATE WEB_EMAIL SET TrangThai='failed',Loi=@Error WHERE ID=@ID");return 'failed';
 }
}
function startEmailWorker(){
 let running=false;
 const tick=async()=>{if(running||!emailConfigured())return;running=true;try{await sendPaidOrderEmails();const pool=await poolPromise;const r=await pool.request().query("SELECT TOP 5 MaDH FROM WEB_EMAIL WHERE TrangThai IN ('pending','preview','failed') AND SoLanThu<3 AND "+invoicePredicate+" ORDER BY ID");for(const row of r.recordset)await deliverOrderEmail(row.MaDH);}catch(_){console.error('[WEB EMAIL] Hàng đợi email chưa sẵn sàng.');}finally{running=false;}};
 const timer=setInterval(tick,60000);timer.unref();return timer;
}
function emailPreviewHtml(html){return String(html).replaceAll('cid:javi-logo','data:image/png;base64,'+fs.readFileSync(path.join(require('../config/paths').sharedFrontend,'images/logo-javi-auth.png')).toString('base64'));}
module.exports={renderOrderEmail,orderEmailSubject,deliverOrderEmail,emailConfigured,startEmailWorker,emailPreviewHtml,sendPaidOrderEmails};
