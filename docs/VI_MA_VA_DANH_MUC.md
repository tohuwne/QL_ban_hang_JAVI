# Ví mã và danh mục dùng chung

- `WEB_MA_KHACH_HANG`: ví mã theo tài khoản, khóa chính `(TenDangNhap, MaGiamGia)`, hai khóa ngoại đến tài khoản và mã, có `NgayLuu`. API lấy tài khoản từ token, không cho khách đọc/ghi ví của người khác
Cấu trúc và dữ liệu đã gộp trong database.sql, file SQL duy nhất. Chọn đúng DB trước khi chạy; script xóa và tạo lại bảng.
- `WEB_MA_GIAM_GIA.SoLuong`: NULL là không giới hạn, số nguyên dương là tổng lượt đặt hàng. Lưu ví không chiếm lượt; đơn tạo thành công giữ lượt, hoàn thành chuyển sang đã dùng, hủy trả lượt. Đơn chờ vẫn giữ lượt đến khi xử lý/hủy thực sự
- `v_MaGiamGiaLuotDung` tính số đã dùng/đang giữ từ đơn hiện tại. Khóa giao dịch và trigger chặn vượt số lượng, hạ giới hạn dưới số đã chiếm, khôi phục đơn hủy khi mã hết lượt/hiệu lực
- Ví luôn tải từ DB, không phụ thuộc bộ nhớ trình duyệt. Mã không phù hợp giỏ hàng, loại KH, chưa đến ngày, hết hạn, hết lượt hoặc tạm ngưng hiện mờ kèm lý do. Báo giá và đặt hàng kiểm tra lại điều kiện
- Menu nghiệp vụ đặt trước Danh mục; Danh mục gom mã giảm giá, địa điểm và phí vận chuyển; Cấu hình website đặt ngay trước Hệ thống. Website chỉ còn cấu hình sản phẩm/blog/nội dung
- Ba danh mục dùng lưới toàn vùng nội dung, lọc/phân trang theo hệ thống. Thêm mới hoặc sửa/bấm đúp dòng mới mở form
- Địa điểm dùng `WEB_TINH_THANH`, `WEB_PHUONG_XA`; tỉnh liên kết phường qua khóa ngoại. Mã và tỉnh cha không đổi khi sửa để giữ các liên kết địa chỉ đã lưu. Dropdown khách hàng đọc DB cùng nguồn với danh mục
- Phí dùng `WEB_PHI_VAN_CHUYEN`; mức riêng theo tỉnh ưu tiên hơn mặc định. Có thể tạm ngưng mức phí, không xóa các địa điểm đang được tham chiếu

Đã áp dụng migration ví mã và số lượng trên DB local BH_WEB2. Kiểm tra API local xác nhận lưu trùng không tạo thêm dòng, mở lại có mã, tính tiền giảm và đọc địa điểm đúng. Kiểm tra không tạo đơn hàng hoặc gửi email
## Thẻ mã và điều kiện kết hợp

- Thẻ ví và hộp chọn mã chỉ hiện mức giảm, hạn dùng, link Điều kiện; mã/đối tượng/sản phẩm/đơn tối thiểu/trần giảm/thời gian/quy tắc kết hợp nằm trong popup
- Mã không đủ điều kiện vẫn mờ kèm lý do và mở được Điều kiện
- `ChoPhepKetHop BIT NOT NULL DEFAULT 0` lưu chính sách cho phép kết hợp với mã khác, cấu hình trong form quản trị. Migration bổ sung: `database.sql`
- Luồng hiện tại vẫn chọn một mã trên mỗi đơn, chưa có tính toán cộng dồn nhiều mã. Cột này không chặn giảm tay của nhân viên và chiết khấu khách hàng đã có
- Trang thanh toán dùng nút Quay lại giỏ hàng, bỏ tiêu đề lớn/breadcrumb và danh sách sản phẩm lặp trong tóm tắt

- Cập nhật hiển thị: điều kiện là đoạn chữ thay cho bảng thuộc tính, không hiển thị mô tả quản trị hoặc ngày bắt đầu khi mã đã đến thời gian dùng
- Mã đang hoạt động, chưa hết hạn và đúng đối tượng được lưu trước ngày áp dụng; báo giá/đặt hàng vẫn chặn trước ngày bắt đầu
- Trước ngày bắt đầu: thẻ và điều kiện ghi Áp dụng từ; khi đã đến ngày: ghi HSD nếu có KetThuc; không có KetThuc thì không hiện dòng thời hạn

- Tạo mã: checkbox Tự sinh bật mặc định; backend tạo 6 ký tự A–Z/0–9 có cả chữ lẫn số, thử lại nếu va chạm khóa chính. Bỏ chọn để nhập mã riêng (chuẩn hóa chữ hoa), trùng mã trả 409. Sửa mã cũ không đổi khóa mã
- Lựa chọn tự sinh/nhập tay là trạng thái form; dữ liệu lưu vẫn là MaGiamGia. database.sql cập nhật DEFAULT mã SQL dài 6 ký tự, khóa chính bảo đảm không trùng; database.sql cập nhật DB có sẵn
