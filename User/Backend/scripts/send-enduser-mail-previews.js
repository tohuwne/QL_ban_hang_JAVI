const fs=require('fs'),path=require('path'),nodemailer=require('nodemailer');
require('dotenv').config({path:path.resolve(__dirname,'../../../.env'),quiet:true});
const {renderRegistrationEmail}=require('../../../Shared/Backend/services/registration-email-template');
const {renderOrderEmail,renderOrderText}=require('../../../Shared/Backend/services/order-email-template');
const out=path.resolve(__dirname,'../storage/previews/enduser');
const recipient=process.argv.find(x=>x.startsWith('--to='))?.slice(5);
if(!recipient||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient))throw Error('Provide --to=email');
const banner='<div style="padding:14px;background:#fff2c6;color:#624700;text-align:center;font:600 13px Arial">GỬI THỬ GIAO DIỆN · Tài khoản mẫu enduser_demo · Không phát sinh đơn, thanh toán hoặc giao hàng. OTP minh họa không có hiệu lực.</div>';
const logo=path.resolve(__dirname,'../../../Shared/Frontend/images/logo-javi-auth.png');
const items=[{MaSP:'MAU-CF01',TenSP:'Cà phê Đậm mạnh',TrongLuongGram:200,LoaiXay:'Nguyên hạt',GiaBan:79000,SoLuong:2},{MaSP:'MAU-CF01',TenSP:'Cà phê Đậm mạnh',TrongLuongGram:500,LoaiXay:'Xay sẵn pha phin',GiaBan:197500,SoLuong:1}];
const samples=[{id:'01-otp',subject:'[GỬI THỬ 1/3] JAVI COFFEE · OTP đăng ký enduser',html:banner+renderRegistrationEmail({fullName:'Khách hàng enduser',otp:'123456'}),text:'GỬI THỬ giao diện đăng ký enduser_demo. OTP minh họa 123456 không có hiệu lực.'}];
for(const [i,method] of ['Chuyển khoản','Tiền mặt'].entries()){
 const order={MaDH:i?'TEST-COD-20261022':'TEST-CK-20261022',NgayTao:new Date(),NguoiNhan:'Khách hàng enduser',SoDT:'Số điện thoại mẫu',Email:recipient,DiaChi:'Địa chỉ giao hàng minh họa',HinhThucTT:method,TrangThaiThanhToan:i?'Chưa thanh toán':'Đã thanh toán',PhiVanChuyen:25000,TienGiam:30000,MaGiamGia:'MAU30000',TongThanhToan:350500,GhiChu:'Email thử giao diện. Không có giao dịch thực tế.'};
 const html=renderOrderEmail(order,items).replace(/(<body[^>]*>)/,'$1'+banner);
 samples.push({id:i?'03-cod':'02-ck',subject:`[GỬI THỬ ${i+2}/3] JAVI COFFEE · ${i?'COD đặt hàng thành công':'Chuyển khoản thành công'}`,html,text:'GỬI THỬ, không phát sinh giao dịch.\n'+renderOrderText(order,items),attachments:[{filename:'javi-logo.png',path:logo,cid:'javi-logo'}]});
}
(async()=>{fs.mkdirSync(out,{recursive:true});for(const m of samples)fs.writeFileSync(path.join(out,m.id+'.html'),m.html.replaceAll('cid:javi-logo','data:image/png;base64,'+fs.readFileSync(logo).toString('base64')));
 if(!process.argv.includes('--send'))return console.log('Đã tạo 3 preview');
 const port=Number(process.env.SMTP_PORT||465),sender=process.env.SMTP_FROM||process.env.SMTP_USER;
 const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port,secure:port===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},connectionTimeout:10000,socketTimeout:20000});
 try{for(const {id,...mail} of samples){const receiptFile=path.join(out,id+'-receipt.json');if(fs.existsSync(receiptFile)&&JSON.parse(fs.readFileSync(receiptFile)).to===recipient){console.log(id+' already sent');continue;}const r=await transport.sendMail({...mail,from:{name:'JAVI COFFEE',address:sender},to:recipient});const receipt={to:recipient,messageId:r.messageId,accepted:r.accepted,rejected:r.rejected,sentAt:new Date().toISOString()};fs.writeFileSync(receiptFile,JSON.stringify(receipt,null,2));console.log(JSON.stringify({id,...receipt}));if(!r.accepted?.length)throw Error('Recipient not accepted');}}finally{transport.close();}
})().catch(e=>{console.error(e.code||e.message);process.exitCode=1;});
