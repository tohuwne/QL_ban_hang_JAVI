# Quy Tắc Chung Phát Triển Dự Án

Tài liệu này tổng hợp các quy tắc chung về giao diện (Frontend), mã nguồn (Backend) và nguyên tắc thiết kế để đảm bảo sự đồng bộ trong toàn bộ dự án.

---

## 1. Nguyên Tắc Giao Diện (Frontend)

### 1.1. Cố định toàn màn hình & Bố cục Flexbox (Fixed Screen Standard)
- **Cố định màn hình (Không cuộn trang):** Tất cả các màn hình phân hệ quản lý (Danh mục, Quản lý kho: Tồn kho/Nhập kho/Xuất kho, Bán hàng/Đơn hàng, Hóa đơn, Công nợ, Phiếu thu, Phiếu chi...) phải đứng yên hoàn toàn trong khung hình:
  ```css
  html, body {
    height: 100%;
    overflow: hidden;
  }
  .main-content {
    height: 100vh;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 16px 24px 10px 24px !important;
    box-sizing: border-box;
  }
  ```
- **Tự động co giãn lưới:** Lưới bảng dữ liệu (`.table-responsive`) tự động co giãn chiếm trọn toàn bộ chiều cao còn lại của màn hình (`flex: 1 1 0% !important; min-height: 0 !important; overflow-y: auto !important; overflow-x: auto !important;`). Tuyệt đối không dùng chiều cao cố định kiểu `calc(100vh - 240px)` làm đẩy thanh phân trang ra ngoài mép dưới.

### 1.2. Tối ưu bảng dữ liệu (Grid Standard)
- **Cấu trúc:** Luôn sử dụng thẻ `<div class="table-responsive">` bọc ngoài các thẻ `<table>` để hỗ trợ cuộn mượt mà mà không làm vỡ bố cục trang.
- **Tiêu chuẩn lưới:**
  - Cột đầu tiên: Luôn là ô Checkbox để hỗ trợ tính năng chọn hàng loạt (`width: 40px !important; text-align: center;`).
  - Cột cuối cùng: Là các nút Thao tác (Xem, Sửa, Xóa). Chỗ này chỉ dùng icon, **không** để tên tiêu đề cho cột này nhằm tối ưu không gian.
  - Kích thước dòng: Sử dụng padding nhỏ (`8px 10px`) để các dòng thu gọn lại, giúp hiển thị tối đa dữ liệu trên một màn hình.
  - **Sticky Header không kẽ hở:** Header bảng phải luôn dính sát mép trên cùng (`position: sticky; top: 0; z-index: 10; background-color: #1a1a1a !important; box-shadow: 0 1px 0 var(--color-border);`). Bảng phải áp dụng `border-collapse: separate; border-spacing: 0; table-layout: fixed !important;` và `.table-responsive` có `padding: 0 !important; margin: 0 !important;` để triệt tiêu mọi kẽ hở khi cuộn dọc.
  - **Khóa cố định header và cột khi lọc:** Tiêu đề header và độ rộng các cột trên lưới PHẢI CỐ ĐỊNH HOÀN TOÀN, không được co giãn/xê dịch khi lọc dữ liệu.

### 1.3. Thống nhất kích thước Thẻ thống kê (`.stat-cards`)
- **Phạm vi áp dụng:** Toàn bộ các màn hình phân hệ có thẻ thống kê (Tồn kho, Nhập kho, Hóa đơn...), **ngoại trừ màn hình Dashboard** (vì Dashboard sử dụng `.dashboard-cards` với kích thước riêng).
- **Quy chuẩn kích thước:**
  - Chiều cao cố định: `height: 58px !important; min-height: 58px !important; max-height: 58px !important;`
  - Đệm lề bên trong: `padding: 8px 16px !important;`
  - Khoảng cách giữa các thẻ: `gap: 12px; margin-bottom: 10px !important; flex-shrink: 0;`
  - Tiêu đề `.card-title`: Font `11px !important; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px;` kèm icon nhỏ tinh tế.
  - Số liệu `.card-value`: Font `19px !important; font-weight: 700; color: var(--color-primary); line-height: 1.2;` sắc nét, dễ nhìn.

### 1.4. Thống nhất kích thước Thanh phân trang (`.pagination-container`)
- **Phạm vi áp dụng:** Toàn bộ tất cả các màn hình có phân trang trong hệ thống.
- **Quy chuẩn kích thước:**
  - Chiều cao cố định: `height: 42px !important; min-height: 42px !important; max-height: 42px !important;`
  - Căn lề: `margin: 6px 0 0 0 !important; padding: 0 4px !important; flex-shrink: 0 !important; border-top: 1px solid rgba(255, 255, 255, 0.08);`
  - Vị trí: Luôn cố định sát mép đáy màn hình, nhìn thấy ngay mà không cần phải cuộn trang.
  - Thông tin số dòng (`.pagination-info`): Font `13px !important; color: var(--color-text-muted, #999);`.
  - Nút chuyển trang (`.pagination-buttons button`): `height: 30px !important; min-width: 30px !important; padding: 0 10px !important; font-size: 12.5px !important; border-radius: 4px;`.
  - Khử viết hoa: Bắt buộc `text-transform: none !important;` để số trang 1, 2, 3... hiển thị kích thước bình thường, không bị to đột biến.
  - Mặc định: Phân trang 20 dòng / 1 trang.

### 1.5. Thống nhất Badge lọc tin dạng thẻ Card (`.filter-section` & `.filter-btn`)
- **Phạm vi áp dụng:** Các màn hình có bộ lọc trạng thái nhanh theo badge dạng thẻ (Xuất kho, Đơn hàng, Hóa đơn...).
- **Quy chuẩn thiết kế:**
  - Chiều cao thẻ `.filter-btn`: Tinh gọn đúng **`28px`** (`height: 28px !important; min-height: 28px !important; max-height: 28px !important;`), đệm lề `padding: 0 10px !important; border-radius: 5px;`.
  - Nền & Viền: Nền đen nhám `#181818`, viền mảnh `#2d2d2d`, chữ trạng thái font `12px; font-weight: 500;`.
  - Huy hiệu số đếm `.status-badge`: Kích thước pill siêu nhỏ gọn `height: 18px !important; min-width: 18px !important; padding: 0 5px !important; border-radius: 9px; font-size: 10.5px !important; font-weight: 600; margin-left: 2px;`.
  - Trạng thái Active: Nền vàng nhẹ (`rgba(255, 215, 0, 0.12)`), viền và chữ vàng Gold; huy hiệu số đếm đổi sang nền vàng Gold nguyên khối chữ đen (`#000`).
  - Khoảng cách thanh lọc `.filter-section`: `gap: 6px !important; margin-bottom: 8px !important; flex-shrink: 0;` tối ưu diện tích dọc cho bảng dữ liệu bên dưới.
  - **Logic lọc nút trạng thái:** Phải luôn gắn thuộc tính `data-status="..."` và logic lấy trạng thái lọc phải ưu tiên đọc từ `data-status` (hoặc bóc tách bỏ thẻ con `.status-badge`). Khi lọc "Tất cả" / "Tất cả phiếu", điều kiện `isAll` phải luôn kiểm tra cả `activeStatus === "Tất cả"` hoặc `activeStatus.startsWith("Tất cả")` để đảm bảo lưới hiển thị lại toàn bộ dữ liệu đầy đủ.

### 1.6. Thanh tìm kiếm & Trải nghiệm người dùng (UX)
- **Thanh tìm kiếm tối ưu diện tích:** Không bọc thêm thẻ panel/box có background hay border dày bên ngoài làm tốn diện tích màn hình. Thanh tìm kiếm được đồng bộ tinh gọn (`.filter-bar`), chiều cao input `38px`, viền mảnh bo góc 6px.
- **Menu Sidebar:** Phải có hiệu ứng mở rộng mượt mà khi rê chuột (hover). Không sử dụng các thuộc tính CSS ép cứng kích thước (`!important`) làm hỏng hiệu ứng co giãn.
- **Tự động tính số lượng Badge:** Số lượng các mục trên badge bộ lọc trạng thái phải tự động tính toán dựa trên dữ liệu thật của bảng chính và cập nhật tự động. Bảng phụ trong Modal/Popup không được làm nhiễu số liệu của Badge ngoài màn hình chính.

---

## 2. Quy Trình Chỉnh Sửa Mã Nguồn (Workflow)
- **Cấu trúc thư mục chuẩn:** `Admin/` và `User/` đều có `Frontend/` và `Backend/` riêng; thành phần dùng chung đặt tại `Shared/`. Xem `docs/CAU_TRUC_DU_AN.md`.
  - Giao diện quản trị: sửa trực tiếp tại `Admin/Frontend/*.html`.
  - Giao diện khách hàng: sửa trực tiếp tại `User/Frontend/*.html`.
  - CSS/JS quản trị: `Admin/Frontend/css/`, `Admin/Frontend/js/`; cửa hàng: `User/Frontend/css/`, `User/Frontend/js/`.
  - CSS thương hiệu, ảnh và thư viện dùng chung: `Shared/Frontend/`.
  - Bản sao lưu JSON: lưu duy nhất tại `Admin/Backend/storage/backups/`.
  - Backend API: thêm route vào backend tương ứng; `app-api.js` chỉ ghép router, `app.js` cấu hình HTTP, `server.js` khởi động.
  - `.env`, `package.json` và dependencies nằm tại gốc; chạy bằng `npm start`.
- **Tuyệt đối không tạo file script trung gian:** Sửa trực tiếp module thuộc `Admin/`, `User/` hoặc `Shared/`; script tái sử dụng phải có thư mục và mục đích rõ ràng.

---

## 3. Nguyên Tắc Backend & API (Node.js)

### 3.1. Chuẩn hóa dữ liệu đầu vào
- **Bắt buộc kiểm tra trùng lặp:** Trước khi tạo mới bất kỳ thực thể nào (Khách hàng, Nhân viên, Sản phẩm...), hệ thống backend BẮT BUỘC phải truy vấn kiểm tra trùng lặp thông tin (như trùng Số điện thoại, Email, Mã định danh).
- Nếu phát hiện trùng, chặn lưu và trả về lỗi HTTP 400 kèm thông báo rõ ràng (VD: *"Số điện thoại này đã tồn tại trong hệ thống!"*).

### 3.2. Format dữ liệu trả về (Response Standard)
Mọi API trả về (dù thành công hay thất bại) đều phải tuân theo cấu trúc chuẩn:
```json
{
  "success": true, // hoặc false
  "message": "Mô tả ngắn gọn kết quả",
  "data": [] // Hoặc đối tượng dữ liệu nếu có
}
```

---

## 4. Nguyên Tắc Cơ Sở Dữ Liệu
- Tuyệt đối không cộng chuỗi trực tiếp khi thực hiện câu lệnh SQL (Tránh SQL Injection). Luôn sử dụng tham số hóa (Parameterized Queries) trong thư viện `mssql` (ví dụ: `request.input('param', value)`).
- Tên các trạng thái (VD: "Hoàn thành", "Chờ giao") phải được chuẩn hóa đúng chính tả để Frontend có thể lấy ra sử dụng làm class CSS đổi màu, cũng như gom nhóm đếm số lượng cho bộ lọc.

## Đồng bộ dữ liệu với giao diện

Theo yêu cầu người dùng: mỗi khi thêm hoặc sửa UI có dữ liệu cần lưu, phải cập nhật trực tiếp cấu trúc bảng, ràng buộc và dữ liệu mẫu liên quan trong database.sql, không chờ nhắc lại. Giữ thứ tự tạo bảng trước rồi đến dữ liệu mẫu. Migration chỉ bổ sung cho DB hiện có, không thay thế việc đồng bộ database.sql.
