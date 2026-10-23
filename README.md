# JAVI COFFEE

Ứng dụng quản trị bán hàng và cửa hàng trực tuyến, dùng Node.js/Express và SQL Server.

```text
Admin/Frontend   Giao diện quản trị
Admin/Backend    API và nghiệp vụ quản trị
User/Frontend    Giao diện mua hàng
User/Backend     API khách hàng và đặt hàng
Shared/          Database, xác thực, dịch vụ và tài nguyên dùng chung
```

Tại thư mục gốc, cấu hình `.env` theo `.env.example`, chạy `npm install` rồi `npm start`. Nếu server đang chạy trước khi chuyển thư mục, dừng và khởi động lại.

Chạy `npm test` để kiểm tra cấu trúc và nghiệp vụ. Chi tiết đường dẫn, cách thêm chức năng và kiểm tra khác: [Cấu trúc dự án](docs/CAU_TRUC_DU_AN.md).

## Chạy hai server

Đọc [Đặc tả yêu cầu hệ thống](docs/DAC_TA_YEU_CAU_HE_THONG.md) trước mỗi lần sửa; cập nhật khi người dùng chốt yêu cầu.

npm start chạy cửa hàng tại http://localhost:3000 và đăng nhập nhân viên tại http://localhost:3001. Chạy riêng bằng npm run start:user và npm run start:admin. Cấu hình USER_PORT, ADMIN_PORT, USER_ORIGIN trong .env; hai cổng phải khác nhau. Khi đổi cổng khách, cập nhật cả USER_ORIGIN.

Hai server dùng chung SQL Server (DB_SERVER, DB_NAME). Đơn website lưu vào dữ liệu đơn quản trị; tải/làm mới danh sách để thấy đơn mới. Khách xem cửa hàng không cần đăng nhập; giỏ hàng và thanh toán giữ cơ chế tài khoản hiện có.

## Cấu hình cà phê và tạo lại dữ liệu mẫu

Chạy trực tiếp toàn bộ `database.sql` trong database đích bằng SSMS. File chứa CREATE TABLE và INSERT mẫu mới, xóa/tạo lại bảng; không có bước gộp hoặc migration. Bộ mẫu gồm bốn cà phê, giá và tồn cơ sở 100g, ba loại xay và bốn trọng lượng.

Trong menu Danh mục, quản lý Loại xay và Trọng lượng ở hai màn hình riêng. Trong Loại sản phẩm, bật checkbox “Cho phép chọn trọng lượng và loại xay”, sau đó chọn các mục được áp dụng. Giỏ hàng gộp theo tài khoản + mã sản phẩm + số gram + tên loại xay; thao tác từng dòng bằng MaGH.

Kiểm tra SQL tích hợp bằng `npm run test:coffee:db` chỉ trên database thử có tên bắt đầu JAVI_COFFEE_TEST_, đã nạp database.sql. Bài kiểm tra không gửi email và rollback các đơn thử. Trước khi dùng các chức năng này, database phải có cấu trúc mới trong database.sql.

## Giữ cây nguồn gọn

Không đặt ảnh kiểm thử, log hoặc script sửa tạm ở gốc. Mã kiểm thử nằm trong `tests/`, kết quả sinh trong `tests/.artifacts/`; log server trong `Admin/Backend/storage/logs/`; email xem trước trong `User/Backend/storage/previews/`. Những thư mục sinh tự động này không đưa vào Git. Giữ nguyên ảnh upload, tài liệu học phần, file Excel mẫu và bản sao lưu dữ liệu.
