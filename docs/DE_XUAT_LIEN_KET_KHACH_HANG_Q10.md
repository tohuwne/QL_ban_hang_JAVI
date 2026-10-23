> Đã được người dùng duyệt triển khai ngày 22/10/2026. Yêu cầu hiện hành và các lựa chọn triển khai xem KH-10 đến KH-13, DB-Q10 trong DAC_TA_YEU_CAU_HE_THONG.md. Nội dung dưới là bản đề xuất gốc.

# Đề xuất Q10: khách mua qua sale đăng ký tài khoản website

Ngày 22/10/2026 — **đề xuất, chưa triển khai liên kết tự động**.

## Phương án khuyến nghị

Giữ **một bảng KHACH_HANG**, dùng MaKH làm định danh khách xuyên suốt. TAI_KHOAN chứa thông tin đăng nhập và liên kết về MaKH như cấu trúc hiện tại. DON_HANG.MaKH, HOA_DON và CONG_NO giữ nguyên quan hệ, nên khách sau khi liên kết có thể xem chung đơn sale/web và công nợ theo quyền được chốt.

Không tách KH online và KH offline thành hai bảng: cùng người sẽ bị hai mã, khó tính chiết khấu, hợp nhất lịch sử, thu nợ và báo cáo. “Online/offline” là kênh giao dịch (đơn đã có NguonDon), không phải hai loại danh tính khách. MaLoaiKH tiếp tục phục vụ chính sách chiết khấu, không dùng để đánh dấu có tài khoản web hay chưa.

Không cần cột CoTaiKhoan trên KH vì có thể suy ra từ TAI_KHOAN.MaKH. Nếu cần thống kê nguồn tạo hồ sơ, có thể bổ sung NguonTao và thời điểm tạo theo yêu cầu báo cáo riêng; không dùng trường đó để xác minh quyền sở hữu.

## Luồng đề xuất

1. Chuẩn hóa SĐT khi lưu/tìm (ví dụ +84 và 0 về cùng quy ước), giữ dữ liệu hiển thị phù hợp. Tìm hồ sơ theo số chuẩn hóa trong giao dịch; xử lý các số trùng cũ trước khi thêm unique index.
2. Chưa có KH: xác thực email OTP → tạo KH mới + account trong cùng transaction như bình thường.
3. Có đúng một KH và chưa có account: cần xác minh quyền sở hữu **hồ sơ cũ**, không chỉ OTP của email người đăng ký tự nhập.
4. Khi email đăng ký trùng email đã lưu trên hồ sơ KH, không trống và không có hồ sơ trùng mơ hồ: gửi OTP tới chính email đó. Sau xác minh, tạo TAI_KHOAN trỏ về MaKH có sẵn; không INSERT KH mới, không ghi đè tên/loại KH/địa chỉ/công nợ chỉ bằng form đăng ký.
5. Email hồ sơ trống/khác, SĐT trùng nhiều hồ sơ, hoặc dữ liệu có dấu hiệu mâu thuẫn: tạo yêu cầu liên kết chờ nhân viên xác nhận. Chưa cấp quyền đọc lịch sử/công nợ của KH cũ cho đến khi được duyệt.
6. Khi OTP điện thoại được triển khai sau: dùng bằng chứng OTP được xác minh **phía server** đối với số cũ; vẫn cần xử lý số tái cấp, dùng chung hộ gia đình và hồ sơ trùng. Không tin kết quả xác minh do trình duyệt khai báo.
7. Nếu KH đã có account: hướng dẫn đăng nhập/khôi phục account; không tạo account thứ hai hoặc lộ tên account, lịch sử, công nợ trong phản hồi công khai.

## Dữ liệu cần bổ sung nếu duyệt phương án

| Thành phần | Đề xuất |
|---|---|
| TAI_KHOAN.MaKH | Unique index có điều kiện cho KHACH_HANG để một KH chỉ có một account web, sau khi xử lý dữ liệu trùng cũ |
| KHACH_HANG.SoDTChuanHoa | Trường chuẩn hóa + index, chỉ ràng buộc unique khi chốt một số/một hồ sơ; không vội ép dữ liệu cũ |
| YEU_CAU_LIEN_KET_KH | Lưu người yêu cầu, hồ sơ đích, kênh xác minh, trạng thái Chờ/Đã duyệt/Từ chối, ngày, nhân viên duyệt và lý do; không lưu OTP thô |
| Nhật ký liên kết | Lưu MaKH/account, phương thức xác minh, thời gian, người duyệt để truy vết; không chuyển công nợ hoặc sửa chủ đơn bằng thao tác liên kết |

Mọi thay đổi schema được bàn giao trong database.sql theo CF-05; không tự chạy lên database đang dùng. Nếu cần giữ dữ liệu hiện có, phải chốt riêng cách nâng cấp và xử lý hồ sơ trùng; không chạy file xóa/tạo bảng để giải quyết việc liên kết.

## Các điểm cần người dùng chốt

- Có cho tự liên kết khi OTP đúng email đã tồn tại trên hồ sơ sale không, hay mọi liên kết đều cần nhân viên duyệt?
- Một SĐT có được đại diện nhiều KH (gia đình/doanh nghiệp) không? Nếu có, số điện thoại chỉ là thông tin liên hệ, cần mã KH + quy trình xác minh riêng.
- Sau liên kết, khách được xem toàn bộ đơn sale và số dư công nợ hay chỉ đơn website? Backend hiện lịch sử tài khoản truy theo MaKH, nên quyền này phải được quyết định trước khi mở liên kết.
- Ai được duyệt, cần bằng chứng gì, và cơ chế khôi phục khi duyệt nhầm?

Trong bản sửa hiện tại, hệ thống chặn đăng ký trùng SĐT và không tự ghép hồ sơ. Đây là biện pháp giữ an toàn dữ liệu trong thời gian chưa chốt Q10.
