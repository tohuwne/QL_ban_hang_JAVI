# Cấu trúc dự án JAVI COFFEE

```text
Admin/
  Frontend/              HTML, CSS và JavaScript quản trị/POS
  Backend/
    api.js               Đăng ký API quản trị và kiểm tra quyền
    routes/              API nghiệp vụ
    services/            Kiểm tra, xử lý và ghi dữ liệu
    scripts/             Công cụ tái sử dụng, như tạo file Excel mẫu
    templates/import/    File Excel mẫu đang dùng
    storage/backups/     Bản sao lưu dữ liệu
    storage/logs/        Log khi chạy server; không đưa vào Git
User/
  Frontend/              Giao diện khách hàng
  Backend/
    api.js               Đăng ký API khách hàng
    routes/              Catalog, giỏ hàng, đặt hàng, tài khoản
    scripts/             Công cụ xem trước email
    storage/previews/    Email xem trước sinh tự động; không đưa vào Git
Shared/
  Frontend/              CSS nền, font/icon, hình ảnh và thư viện chung
  Backend/
    config/              Kết nối database và paths.js
    middleware/          Xác thực và phân quyền
    routes/              Đăng nhập, đăng ký dùng chung
    services/            Giá, tùy chọn, email và nghiệp vụ dùng chung
    data/                Danh mục địa lý
  
tests/                   Mã kiểm thử hồi quy
  .artifacts/            File sinh bởi kiểm thử; không đưa vào Git
docs/                    Đặc tả, hướng dẫn và tài liệu học phần
app.js                   Tạo Express app theo chế độ user/admin
app-api.js               Bộ ghép router tương thích được giữ lại
server.js                Khởi động hai tiến trình server
Admin/server.js          Khởi động riêng server quản trị
User/server.js           Khởi động riêng server khách hàng
database.sql             Cấu trúc và dữ liệu mẫu
package.json             Dependencies và các lệnh chạy
.env                     Cấu hình riêng; không đưa vào Git
```

## Chạy và kiểm tra

- `npm start`: chạy khách hàng cổng 3000 và quản trị cổng 3001.
- `npm run start:user`, `npm run start:admin`: chạy riêng từng server.
- Đổi cổng bằng USER_PORT/ADMIN_PORT; USER_ORIGIN là địa chỉ cửa hàng dùng cho chuyển hướng.
- Hai server dùng chung database, dependencies và tài nguyên Shared. app.js không tự mở cổng; chế độ server quyết định nhóm API được phục vụ.
- `npm test`: kiểm tra cấu trúc, cú pháp, tài nguyên và nghiệp vụ bằng fixture, không sửa database đang dùng.
- `npm run test:permissions`: kiểm tra quyền khách hàng.
- `npm run test:coffee:db`: chỉ chạy với database thử JAVI_COFFEE_TEST_ đã nạp database.sql.
- Các kiểm thử giao diện/live bổ sung trong tests cần môi trường riêng; xem tests/README.md.

## Quy ước

Mã mới nằm đúng Admin, User hoặc Shared. Không tạo lại cây fe/be cũ hay script sửa mã tạm ở gốc. Bộ kiểm thử tái sử dụng đặt trong tests; file chụp màn hình, XLSX/PDF thử nằm trong tests/.artifacts, không trộn với mã nguồn. Log nằm trong Admin/Backend/storage/logs. Bản sao lưu và ảnh upload là dữ liệu ứng dụng cần giữ, không dọn như file tạm.

File trong fe, scratch, output/outputs và công cụ tạo đề cương một lần đã được đưa vào bản lưu trữ ngoài dự án trong lần dọn 21/10/2026. Tài liệu đề cương thực tế vẫn giữ trong docs/kltn.

## Đường dẫn phục vụ

| URL | Nơi xử lý |
| --- | --- |
| / | Cửa hàng trên cổng khách; đăng nhập trên cổng quản trị |
| /admin/*.html | Admin/Frontend, chỉ cổng quản trị |
| /landing_page/*.html, /user/*.html | User/Frontend |
| /admin/css, /admin/js | Tài nguyên quản trị, có fallback Shared |
| /css, /js | Tài nguyên Shared/User và Admin tùy chế độ |
| /images, /vendor | Shared/Frontend |
| /api | Các router được đăng ký trong app.js theo chế độ server |

Không public backend, cấu hình môi trường, dependencies hoặc bản sao lưu. Mọi thao tác nghiệp vụ phải qua xác thực/phân quyền phía server.
