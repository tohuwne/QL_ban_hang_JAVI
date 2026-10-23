# Thư mục Ảnh Sản Phẩm - JAVI COFFEE

## 📁 Vị trí: `Shared/Frontend/images/products/`

Đây là thư mục chứa ảnh hiển thị cho từng sản phẩm trên trang **Mua Hàng** và **Giỏ Hàng** của khách hàng.

---

## 📌 Quy tắc đặt tên file ảnh

Tên file ảnh phải **trùng với MaSP** trong database, định dạng `.jpg`:

| MaSP   | Tên file ảnh  | Tên sản phẩm                          |
|--------|--------------|---------------------------------------|
| CFH31  | CFH31.jpg    | Cà phê ĐẬM MẠNH (1kg - HẠT)          |
| CFH35  | CFH35.jpg    | Cà phê ĐẬM MẠNH (500gr - HẠT)        |
| CFX31  | CFX31.jpg    | Cà phê ĐẬM MẠNH (1kg - XAY)          |
| MPTD9  | MPTD9.jpg    | JAVI PRO TD 4.9 (Máy pha)             |
| MPM30  | MPM30.jpg    | JAVI M30                              |
| NVMOR  | NVMOR.jpg    | Mật ong rừng nguyên chất             |
| BBI01  | BBI01.jpg    | Ly nhựa PP 500ml                      |
| ...    | ...          | ...                                   |

> **Lưu ý:** Nếu không có file ảnh cho sản phẩm, hệ thống sẽ tự động hiển thị icon thay thế (không bị lỗi).

---

## 🖼️ Yêu cầu ảnh

- **Kích thước khuyến nghị:** 600×600 px (vuông) hoặc 800×600 px
- **Định dạng:** `.jpg` hoặc `.png` (đổi tên thành `.jpg`)
- **Dung lượng tối đa:** < 500 KB mỗi file để tải nhanh
- **Nội dung:** Ảnh chụp sản phẩm trên nền trắng/tối hoặc ảnh thực tế

---

## ✅ Cách thêm ảnh sản phẩm mới

1. Chuẩn bị file ảnh → đổi tên theo `MaSP.jpg` (ví dụ: `CFH31.jpg`)
2. Copy file vào thư mục này: `Shared/Frontend/images/products/`
3. Ảnh sẽ **tự động hiển thị** trên trang mua hàng — không cần restart server

---

## 🔧 Cột AnhSP trong Database

Cấu trúc và dữ liệu đã gộp trong database.sql, file SQL duy nhất. Chọn đúng DB trước khi chạy; script xóa và tạo lại bảng.
- Giá trị mặc định sau migration: `MaSP + '.jpg'` (ví dụ: `CFH31.jpg`)
- Có thể thay đổi tên file ảnh cho từng sản phẩm qua giao diện Admin (tương lai)
