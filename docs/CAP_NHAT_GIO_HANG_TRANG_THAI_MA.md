# Giỏ hàng và trạng thái mã giảm giá

- Đã thu gọn tiêu đề giỏ hàng và danh sách sản phẩm; tăng chiều rộng khung thông tin đơn hàng, làm nổi bật tổng tiền và số tiền tiết kiệm.
- Bấm Chọn tại dòng Áp dụng mã giảm giá để mở popup nhập mã hoặc chọn mã đã lưu. Bấm Áp dụng để kiểm tra, rồi Xác nhận để dùng mã cho đơn. Mã không hợp lệ không ghi đè mã đang áp dụng.
- Tích/bỏ sản phẩm cập nhật tổng tạm tính theo giá và số lượng các mặt hàng đã chọn ngay trên giao diện. Không chọn mặt hàng nào thì tổng bằng 0 và nút thanh toán bị khóa.
- Nếu truy vấn ưu đãi gặp lỗi, tổng tiền vẫn hiển thị số tiền hàng; không thay số tiền bằng thông báo chữ. Checkout vẫn yêu cầu kiểm tra giá và phí thành công trên server.

## Trạng thái mã

- Thêm cột `WEB_MA_GIAM_GIA.TrangThai`: `Hoạt động` hoặc `Tạm ngưng`, có DEFAULT và CHECK.
- `TrangThai` là nguồn kiểm tra bật/tắt mã. Cột `HienThi` cũ được giữ để tương thích sao lưu và được đồng bộ khi quản lý lưu mã.
- Mã phải đang Hoạt động, nằm trong thời gian hiệu lực và đạt giá trị đơn tối thiểu mới áp dụng được. Giới hạn phần trăm, mức giảm tối đa và tổng giảm được giữ nguyên.
- Admin có ô chọn Trạng thái trong danh mục mã và phần cấu hình website.
Cấu trúc và dữ liệu đã gộp trong database.sql, file SQL duy nhất. Chọn đúng DB trước khi chạy; script xóa và tạo lại bảng.

## Đã cập nhật và kiểm tra local

- Đã chạy migration trạng thái trên DB local `BH_WEB2`, giữ nguyên dữ liệu; trạng thái cũ được ánh xạ từ `HienThi`.
- Tiến trình backend đang chạy mã cũ là nguyên nhân trả lỗi 403 dù mã nguồn đã cho phép khách tính tiền. Đã xác minh đúng tiến trình phục vụ dự án và khởi động lại để nạp bản hiện hành.
- Kiểm tra API thật với `enduser_demo`: toàn giỏ 987.500đ; một mặt hàng đầu 790.000đ; áp JAVI10 giảm 50.000đ, tổng còn 937.500đ trước phí giao hàng. Mã sai trả 400; API ví mã trả 200.
- Không tạo đơn hàng, không gửi email kiểm thử trong thao tác xác minh này.
- Kiểm tra router và middleware thật bằng DB mô phỏng: khách được quote/áp mã, khách không có quyền quản trị, phiên chưa đăng nhập bị chặn, mã tạm ngưng bị từ chối.
- Kiểm tra Chrome với API mô phỏng: tích/bỏ sản phẩm, tổng bằng 0, popup mã, xác nhận và từ chối mã sai, giao diện desktop/mobile.
