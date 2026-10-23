# Phạm vi áp dụng mã giảm giá

- Mỗi mã có thể giới hạn một **loại khách hàng** và một **mã sản phẩm cụ thể**. Chọn “Tất cả” tương ứng với giá trị NULL.
- Admin hiển thị sản phẩm bằng mã và tên, ví dụ `CFH31 · Cà phê ...`. Điều kiện này không áp dụng chung cho loại sản phẩm.
- Cột `WEB_MA_GIAM_GIA.MaLoaiKH` liên kết `LOAI_KHACH_HANG.MaLoaiKH`; cột `MaSP` liên kết `SAN_PHAM.MaSP`.
- Server đọc loại khách hàng và mã sản phẩm từ DB, không nhận thông tin phân loại do trình duyệt tự khai báo.
- Khi giỏ có nhiều sản phẩm, mã chỉ giảm trên phần tiền của đúng MaSP được chọn. Hai sản phẩm cùng loại vẫn không dùng chung phạm vi nếu khác MaSP.
- Ngưỡng tối thiểu, phần trăm giảm và trần giảm tính trên phần tiền đủ điều kiện. Giảm cố định không vượt phần tiền của sản phẩm đó.
- Nhân viên vẫn dùng giảm giá từng món, chiết khấu khách hàng và giảm tay. Phần giảm toàn đơn được phân bổ theo tỷ lệ tiền hàng trước khi tính ưu đãi của MaSP cụ thể, tránh giảm trùng phần tiền đã được giảm trước đó.
- Mã sai loại khách hàng hoặc không có sản phẩm đủ điều kiện bị từ chối. Ví mã hiển thị phạm vi khách hàng/sản phẩm; chỉ mã đúng loại khách hàng và còn hiệu lực mới được lưu hoặc sử dụng.

## Database

- `database.sql` đã cập nhật cấu trúc hoàn chỉnh.
Cấu trúc và dữ liệu đã gộp trong database.sql, file SQL duy nhất. Chọn đúng DB trước khi chạy; script xóa và tạo lại bảng.
- Đã chạy migration trên DB local BH_WEB2, giữ các mã cũ ở phạm vi Tất cả. Đã khởi động lại backend local.

## Kiểm tra

- Tính tiền mã giới hạn đúng/sai loại khách hàng, không có sản phẩm tương ứng, giỏ chứa hai MaSP khác nhau trong cùng loại, mức tối thiểu và trần giảm.
- Kiểm tra phối hợp giảm tay tại quầy và phạm vi MaSP.
- Kiểm tra trình duyệt: dropdown loại KH/mã SP khi tạo, khi sửa, và mặc định Tất cả.
- API local: báo giá, ví mã, danh mục 39 sản phẩm và 3 loại khách hàng trả thành công. Không tạo đơn hay gửi email trong kiểm tra này.
