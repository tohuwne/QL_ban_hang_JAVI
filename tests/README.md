# Kiểm thử dự án

- Chạy bộ kiểm thử được duy trì bằng `npm test`; cấu trúc, token, giá, giỏ hàng, tùy chọn cà phê và import Excel dùng fixture, không ghi database đang dùng.
- `npm run test:permissions` kiểm tra quyền API khách hàng.
- `npm run test:coffee:db` yêu cầu database thử có tên JAVI_COFFEE_TEST_; không chạy bằng database thật.
- Những script có hậu tố ui/live hoặc kiểm tra trình duyệt là kiểm chứng bổ sung theo môi trường, có thể cần cấu hình trình duyệt và fixture riêng. Không xem chúng là bước bắt buộc của npm test.
- Ảnh, PDF và XLSX sinh trong kiểm thử đặt ở `tests/.artifacts/`, được bỏ qua trong Git. Thư mục này có thể dọn sau khi kiểm tra, không lưu dữ liệu nghiệp vụ vào đó.
