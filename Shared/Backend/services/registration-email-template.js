// Shared by registration delivery and explicitly requested sample emails.
function renderRegistrationEmail({fullName,otp}) { return `
          <div style="max-width:540px;margin:0 auto;background:#101418;color:#f3f4f6;font-family:'Segoe UI',Roboto,Arial,sans-serif;border:1px solid #3d3522;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.5);">
            <div style="background:linear-gradient(135deg,#1f1a12,#0e1114);padding:24px;text-align:center;border-bottom:1px solid rgba(229,193,107,0.2);">
              <h2 style="margin:0;color:#e5c16b;letter-spacing:1px;font-size:20px;">JAVI COFFEE</h2>
              <p style="margin:6px 0 0;color:#9da4ae;font-size:13px;">Xác thực tài khoản khách hàng</p>
            </div>
            <div style="padding:28px 24px;line-height:1.6;">
              <p style="margin-top:0;font-size:15px;color:#e1e4e8;">Xin chào <strong>${String(fullName || 'Quý khách').trim().replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</strong>,</p>
              <p style="color:#b0b7c3;font-size:14px;">Bạn đang thực hiện đăng ký tài khoản tại <strong>JAVI COFFEE</strong>. Dưới đây là mã xác thực (OTP) của bạn:</p>
              <div style="margin:24px 0;text-align:center;">
                <span style="display:inline-block;padding:14px 32px;background:linear-gradient(110deg,#b88d45,#f0d797 48%,#c49a50);color:#120e03;font-size:32px;font-weight:bold;letter-spacing:8px;border-radius:10px;box-shadow:0 4px 15px rgba(229,193,107,0.3);">${otp}</span>
              </div>
              <p style="color:#9da4ae;font-size:13px;margin-bottom:0;">• Mã OTP có hiệu lực trong <strong>5 phút</strong>.<br>• Tuyệt đối không cung cấp mã này cho bất kỳ ai để bảo vệ tài khoản của bạn.</p>
            </div>
            <div style="background:#090b0d;padding:16px;text-align:center;color:#6b7280;font-size:12px;border-top:1px solid #23272d;">
              © JAVI COFFEE • Hương vị cà phê nguyên bản
            </div>
          </div>
        `; }
module.exports={renderRegistrationEmail};
