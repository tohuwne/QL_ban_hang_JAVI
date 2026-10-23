# Tài khoản khách hàng và mã giảm giá

## Cập nhật DB

- Nếu dựng lại toàn bộ DB, dùng `database.sql` đã cập nhật 31 bảng, bao gồm dữ liệu mẫu. File này xóa dữ liệu cũ.
Cấu trúc và dữ liệu đã gộp trong database.sql, file SQL duy nhất. Chọn đúng DB trước khi chạy; script xóa và tạo lại bảng.
- Sau SQL, khởi động lại backend và tải lại trang bằng Ctrl+F5.
- Chưa chạy migration trên DB thật trong lần thay đổi này.

## Giao diện khách hàng

- Trang chủ và Góc cà phê nằm trong header. Header cố định khi cuộn, thanh danh mục/lọc sản phẩm bám bên dưới trong khu vực sản phẩm.
- Badge giỏ hàng hiển thị tổng số lượng sản phẩm, không chỉ số dòng hàng.
- Hồ sơ cá nhân mở `User/Frontend/tai-khoan.html`, thay cho popup cũ.
- Trang tài khoản có thông tin khách hàng, lịch sử đơn hàng và ví mã giảm giá. Lịch sử phân trang 10 đơn, dữ liệu chỉ lấy theo khách gắn với tài khoản đăng nhập. Có thể mở danh sách sản phẩm trong từng đơn.
- Khách nhập mã đã nhận từ JAVI để lưu vào ví, rồi bấm Dùng mã để mang mã sang giỏ hàng. Lưu mã không đồng nghĩa đủ điều kiện mua: server vẫn kiểm tra thời hạn, giá trị đơn tối thiểu và trạng thái mã lúc thanh toán.
- `WEB_MA_KHACH_HANG` có khóa chính kép `(TenDangNhap, MaGiamGia)` để không lưu trùng, khóa ngoại về tài khoản và danh mục mã. Bảng được đưa vào sao lưu/phục hồi.

## Quản lý mã

- Menu admin có mục **Mã Giảm Giá**, mở `Admin/Frontend/ma-giam-gia.html`.
- Bấm Tạo mã giảm giá, điền điều kiện và lưu. Server tự sinh mã dạng `JAVI-` và 12 ký tự hex; người dùng không cần đặt mã.
- Khi sửa, mã được giữ nguyên; có thể đổi mức giảm, điều kiện, thời hạn và bật/tắt. Bấm trực tiếp vào mã trong danh sách để sao chép, dùng nút Sửa để chỉnh điều kiện.
- SQL cũng có DEFAULT tự sinh mã khi INSERT mà không truyền MaGiamGia. Các mã mẫu cũ như JAVI10 vẫn hoạt động.
- Menu tạo/sửa mã dành cho quản lý. Nhân viên bán hàng tiếp tục nhập mã tại quầy và nhập giảm giá thủ công như trước.
- Ví lưu mã mà khách đã nhập, không tự phát mã. SoLuong là tổng lượt đặt đơn; NULL là không giới hạn. Lưu mã không trừ lượt. Đặt đơn thành công giữ lượt, hoàn thành tính đã dùng, hủy trả lượt. Mã đã lưu nhưng hết lượt/hạn hoặc sai sản phẩm vẫn hiển thị mờ kèm lý do.

## Kiểm tra

- `node tests/check-account-api.cjs`: giới hạn theo tài khoản, phân trang, chỉ khách được dùng API tài khoản, mã sai/hết hạn, lưu trùng an toàn, tự sinh mã mới và giữ mã khi sửa.
- `node tests/check-commerce-ui.cjs`: header và bộ lọc bám đúng vị trí, badge hiển thị số, chuyển sang trang hồ sơ, lịch sử đơn, lưu mã vào ví, danh mục admin, giỏ/checkout và giảm giá tại quầy; kiểm tra desktop/mobile với API mô phỏng.
- Đã rà thứ tự tạo/xóa bảng theo khóa ngoại. Chưa chạy SQL Server hoặc đơn hàng/email thật cho thay đổi này.
