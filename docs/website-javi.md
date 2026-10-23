# Website khách hàng & cấu hình JAVI

Các thay đổi nằm trong dự án local hiện có; không lấy danh mục hay sản phẩm từ website tham khảo.

## Xem thử

- Trang chủ: `http://localhost:3100/landing_page/mua-hang.html`
- Blog: `http://localhost:3100/landing_page/blog.html`
- Quản trị: `http://localhost:3100/admin/cau-hinh-website.html` (tài khoản Quản lý).

Bản xem thử do Codex mở dùng cổng 3100. Khi chạy `node server.js` bình thường, dùng cổng trong `.env` hoặc mặc định 3000. Sau khi đổi mã backend hoặc `.env`, khởi động lại đúng tiến trình server.

Menu khách hàng chỉ có Trang chủ và Blog. Giỏ hàng ở biểu tượng góc phải; giỏ hàng, thanh toán và xác nhận đơn là các file HTML riêng. Các trang khách hàng cuộn toàn trang. SF Pro được ưu tiên nếu máy có font; Be Vietnam Pro hỗ trợ đầy đủ tiếng Việt và làm font dự phòng/nét nhẹ. Không tải hoặc phân phối lại font Apple có bản quyền.

## Quản lý nội dung

1. Cấu hình website → Sản phẩm trên website → double-click sản phẩm: bật/ẩn, chọn JAVI tuyển chọn / Cà phê / Máy pha / Phụ kiện, thứ tự, mô tả và ảnh. Sản phẩm mới thêm ở danh mục chưa tự xuất hiện trên website cho đến khi được bật trong cấu hình.
2. Ảnh hỗ trợ tải lên JPG/PNG/WebP tối đa 5 MB hoặc URL HTTPS. Nếu chưa có ảnh hàng thực tế, site dùng hình minh hoạ có chú thích, không tự lấy ảnh sản phẩm từ site tham khảo.
3. Blog & câu chuyện → Viết bài mới hoặc double-click bài có sẵn. Lưu Nháp để chỉ người quản trị thấy; chọn Đã xuất bản để công khai. Nội dung là văn bản; dòng bắt đầu `## ` là tiêu đề mục. Dùng một dòng trống để ngăn đoạn. Nội dung người viết được escape, không chạy HTML/script.
4. Phần mở rộng ở tab Sản phẩm cho phép chỉnh giới thiệu ngắn, thông tin ngân hàng, phí vận chuyển; xem trạng thái email và gửi lại khi cần.

## Đặt hàng & dữ liệu

Khách chưa đăng nhập vẫn xem sản phẩm và blog. Đặt hàng cần tài khoản khách hàng. Máy chủ đọc giá/số lượng từ database, kiểm tra giỏ và tồn khả dụng trong transaction, giữ chỗ bằng trigger hiện có, lưu nguồn Website, thông tin người nhận, phương thức thanh toán, phí giao và ảnh chụp giá từng dòng. Đơn ở trạng thái Chờ giao; lựa chọn chuyển khoản chưa được coi là đã trả tiền. Gửi lại cùng mã yêu cầu trả cùng đơn, không giữ chỗ tồn hai lần. Khi giá hoặc phí vừa thay đổi, giao diện yêu cầu kiểm tra lại giỏ trước khi đặt.

Sao lưu/phục hồi đã bổ sung các bảng website và giỏ hàng; file ảnh trong `Shared/Frontend/images/uploads/` cần được lưu cùng thư mục dự án khi sao chép máy.

Cấu trúc và dữ liệu đã gộp trong database.sql, file SQL duy nhất. Chọn đúng DB trước khi chạy; script xóa và tạo lại bảng.

## Bật gửi email Gmail thật

Luồng gửi và bản xem trước đã sẵn sàng; chưa gửi thật khi `SMTP_PASS` trống. Mật khẩu không nhập vào trang cấu hình website và không gửi trong chat.

1. Với Gmail người dùng đã chọn, bật xác minh 2 bước rồi tạo mật khẩu ứng dụng theo [hướng dẫn Google](https://support.google.com/accounts/answer/185833?hl=vi).
2. Trên máy chủ, tự điền mật khẩu ứng dụng vào `SMTP_PASS` trong `.env`. Các trường SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_USER/SMTP_FROM đã được chuẩn bị theo địa chỉ gửi được yêu cầu. Không dùng mật khẩu Gmail thông thường. `.env` đã được Git bỏ qua.
3. Khởi động lại server. Đơn mới gửi email ngay sau khi commit; bản đã tạo ở trạng thái chờ cấu hình được worker xử lý mỗi phút. Có thể thử gửi lại ở Cấu hình website nếu trạng thái là gửi thất bại/chờ gửi.
4. Trạng thái “Đã gửi” chỉ được ghi sau khi SMTP chấp nhận người nhận, không đồng nghĩa chắc chắn đã vào hộp thư đến. Cần kiểm tra cả thư rác. Lỗi SMTP không làm mất đơn đã tạo; có thể xem bản email đã lưu từ đơn và quản trị.

Không có tích hợp cổng thanh toán điện tử thật. Thanh toán hiện hỗ trợ COD và chuyển khoản có xác nhận; cấu hình ngân hàng thực tế ở quản trị trước khi hướng dẫn khách chuyển tiền.

## Nội dung và hình ảnh

- Định hướng câu chuyện doanh nghiệp tham khảo https://mayphacafephin.com/; phần kể chuyện được viết lại riêng, không sao chép trang hoặc lấy sản phẩm/giá/ảnh của họ.
- Bố cục tìm kiếm/thẻ sản phẩm/giỏ được tham khảo ở mức tổ chức thao tác từ các site bán lẻ; giữ thương hiệu JAVI, không sao chép các giao diện đó.
- Hai ảnh editorial được tạo riêng bằng ImageGen và lưu trong `Shared/Frontend/images/`; không mô tả là ảnh hàng thực tế. Logo là asset JAVI có sẵn của dự án.

## Kiểm tra

`tests/check-website-integration.cjs` dùng SQL Server và Chrome thật trên local: tạo tài khoản, bài và đơn kiểm thử rồi dọn trong finally, hoàn lại tồn khả dụng. Bộ kiểm tra cố ý không chạy khi đã bật SMTP_PASS để tránh gửi email thử thật. Nó kiểm tra quyền, draft/publish, bật/ẩn sản phẩm, upload ảnh, số lượng, giá, tính idempotent, thông tin đơn chỉ chủ sở hữu thấy, escape nội dung email, trang desktop/mobile và editor quản trị.

## Giỏ hàng, ưu đãi và địa chỉ giao hàng

Xem `docs/GIO_HANG_UU_DAI_VAN_CHUYEN.md` để cập nhật các bảng mới, cấu hình mã/phí, quy tắc tính tiền và chạy kiểm tra. Phí giao hàng theo khu vực thay thế phí chung cũ khi thanh toán website.
