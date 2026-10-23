# JAVI COFFEE - TIÊU CHUẨN ĐỒNG BỘ GIAO DIỆN HỆ THỐNG (UI STANDARD GUIDE)

Tài liệu quy định và chuẩn hóa toàn bộ giao diện người dùng (UI/UX) cho hệ thống **JAVI COFFEE Admin & POS**. Mọi màn hình phân hệ phát triển mới hoặc chỉnh sửa bắt buộc phải tuân theo các quy tắc trong tài liệu này để đảm bảo trải nghiệm chuyên nghiệp, đồng bộ, hiện đại theo tiêu chuẩn SaaS Enterprise.

---

## 1. TRIẾT LÝ THIẾT KẾ CHUYÊN NGHIỆP (DESIGN PHILOSOPHY)

1. **Bảng màu chủ đạo (Brand Palette)**:
   - **Nền chính (Main Background)**: `#111111` (Đen nhám hạt cà phê)
   - **Nền thẻ / Thửa nội dung (Surface)**: `#1A1A18` / `#1E1E1E` (Xám tối sang trọng)
   - **Màu thương hiệu (Primary Accent)**: Gold `#FFD700` / `#CDA434` (Vàng hoàng gia JAVI)
   - **Đường viền mỏng (Border)**: `#2D2D2D` / `rgba(255,255,255,0.08)`
   - **Màu chữ chính**: Trắng ấm `#F5F3EE`, chữ mờ `#A7A49C`

2. **Nguyên tắc sử dụng Icon (Hạn chế xài Icon rác)**:
   - **Hạn chế tuyệt đối**: Không chèn icon rác vào trước tiêu đề từng cột của Bảng dữ liệu (Header Table), không chèn icon vào nhãn form nhập liệu (Form Labels) để tránh gây rối mắt và kém chuyên nghiệp.
   - **Các vị trí ĐƯỢC DÙNG Icon**:
     - Menu Sidebar (giúp nhận diện danh mục phân hệ nhanh)
     - Nút hành động chính (`.btn-primary` như `+ Thêm`, `Xuất Excel`, `In phiếu`)
     - Ô nhập tìm kiếm (kính lúp `fa-search`)
     - Tiêu đề Phân hệ Header và Modal Popup (icon vừa phải, tinh tế)

3. **Phông chữ & Kiểu chữ (Typography)**:
   - Phông chữ tiêu chuẩn: `Be Vietnam Pro`, `Inter`, sans-serif.
   - Không lạm dụng viết hoa (`UPPERCASE`) toàn bộ câu văn tiếng Việt, chỉ viết hoa chữ cái đầu hoặc tiêu đề chính ngắn.

---

## 2. QUY CHUẨN MÀN HÌNH CÓ LƯỚI DỮ LIỆU (GRID / TABLE SCREENS)

**Áp dụng cho**: Tất cả các màn hình danh mục & chứng từ (`san-pham.html`, `nhap-kho.html`, `xuat-kho.html`, `don-hang.html`, `hoa-don.html`, `cong-no.html`, `phieu-thu.html`, `phieu-chi.html`, `khach-hang.html`, `nha-cung-cap.html`, `nhan-vien.html`, `ton-kho.html`, `loai-sp.html`, `loai-kh.html`, `quan-tri.html`, `mua-hang.html`...).

### 2.1. Cấu trúc Layout 100vh Cố định (Fixed Screen SPA)
- **Toàn trang đứng yên (`overflow: hidden`)**, không xuất hiện thanh cuộn ngoài trang `window`.
- Thẻ nội dung chính `.main-content` xếp dọc theo dạng Flexbox (`display: flex; flex-direction: column; height: 100vh; padding: 16px 24px 10px 24px;`).

### 2.2. Tiêu đề Phân hệ (`.page-header`)
- Đặt ở trên cùng, chứa Tiêu đề chính bên trái (kèm 1 icon tinh tế) và Nút thao tác chính bên phải (VD: `+ Thêm Sản Phẩm`, `Lên Đơn Hàng Mới`).

### 2.3. Thẻ Thống kê Tinh gọn (`.stat-cards`)
- Đặt bên dưới Header, chiều cao cố định **58px**, hiển thị các số liệu tổng quan (Tổng số mục, Tổng giá trị, Đã thanh toán, Còn nợ...).

### 2.4. Thanh Lọc Trạng thái dạng Badge (`.filter-section`)
- Chiều cao thẻ `.filter-btn` đúng **28px**, viền mảnh bo góc 5px.
- Nền đen `#181818`, khi chọn (`.active`) chuyển màu chữ và viền sang **Vàng Gold** (`#FFD700`).

### 2.5. Lưới Bảng dữ liệu (`.table-responsive`)
- Tự động co dãn chiếm **100% không gian còn lại** giữa Thanh tìm kiếm và Thanh phân trang (`flex: 1 1 0%; min-height: 0; overflow-y: auto;`).
- **Sticky Header**: Tiêu đề bảng cố định dán sát viền trên cùng khi cuộn dọc.
- **Cột Checkbox**: Cột 1 rộng `40px` căn giữa để chọn hàng loạt.
- **Ẩn Cột Nhân viên**: Đã ẩn cột `Mã NV / Nhân viên` trên các lưới chứng từ để mở rộng không gian cho thông tin quan trọng.
- **Tương tác Double-Click (`ondblclick`)**: Bấm đúp vào bất kỳ dòng nào trên bảng để mở Modal xem chi tiết lập tức, loại bỏ nút "Xem" rườm rà trên từng hàng.

### 2.6. Thanh Phân trang (`.pagination-container`)
- Luôn dán cố định sát mép dưới cùng màn hình, chiều cao đúng **42px**, hiển thị thông tin số mục và các nút chuyển trang dạng pill gọn gàng.

---

## 3. QUY CHUẨN FORM / MODAL CHI TIẾT CHỨNG TỪ & PHIẾU (VOUCHER DETAIL STANDARD)

Tất cả các Form Chi Tiết Chứng Từ (Phiếu Thu, Phiếu Chi, Đơn Hàng, Phiếu Nhập Kho, Phiếu Xuất Kho, Hóa Đơn) được chuẩn hóa theo cấu trúc **Digital Voucher Card**:

```html
<div class="modal-overlay" id="detailModal">
  <div class="modal-content" style="max-width: 550px">
    <!-- 1. Header Modal tiêu chuẩn -->
    <div class="modal-header">
      <h3><i class="fas fa-receipt"></i> CHI TIẾT PHIẾU THU</h3>
      <button class="close-btn" onclick="closeDetailModal()">&times;</button>
    </div>

    <div class="detail-body">
      <!-- 2. Khung thông tin tổng quan dạng Lưới 2 Cột -->
      <div class="voucher-info-grid">
        <div class="voucher-info-item">
          <span class="voucher-label">Mã Chứng Từ</span>
          <span class="voucher-value" id="v-ma">PT001</span>
        </div>
        <div class="voucher-info-item">
          <span class="voucher-label">Ngày Lập</span>
          <span class="voucher-value" id="v-ngay">03/10/2026</span>
        </div>
        <div class="voucher-info-item">
          <span class="voucher-label">Đối Tác / Khách Hàng</span>
          <span class="voucher-value" id="v-doiTac">Nguyễn Văn A</span>
        </div>
        <div class="voucher-info-item">
          <span class="voucher-label">Hình Thức TT</span>
          <span class="voucher-value" id="v-hinhThuc">Chuyển khoản</span>
        </div>
        <div class="voucher-info-item full-width">
          <span class="voucher-label">Ghi Chú</span>
          <span class="voucher-value" id="v-ghiChu">Thu tiền đơn hàng DH001</span>
        </div>
      </div>

      <!-- 3. Banner Tổng tiền & Trạng thái nổi bật -->
      <div class="voucher-highlight-banner">
        <span class="voucher-highlight-label">Tổng Số Tiền</span>
        <span class="voucher-highlight-amount" id="v-soTien">1,500,000 VNĐ</span>
      </div>
    </div>

    <!-- 4. Footer chứa các nút thao tác tiêu chuẩn -->
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" onclick="closeDetailModal()">Đóng</button>
      <button type="button" class="btn btn-primary" onclick="printDetail()">
        <i class="fas fa-print"></i> In Chứng Từ (PDF)
      </button>
    </div>
  </div>
</div>
```

---

## 4. QUY CHUẨN MÀN HÌNH KHÔNG CÓ LƯỚI (NON-GRID SCREENS)

**Áp dụng cho**: Màn hình Trang Chủ / Dashboard (`dashboard.html`), Màn hình Bán hàng POS (`ban-hang.html`), Form Tạo mới / Chỉnh sửa, Màn hình In chứng từ...

### 4.1. Trang Chủ / Dashboard (`dashboard.html`)
- **Duy nhất trang này được bật cuộn dọc tự do (`body.scrollable-page`)**.
- **Khu vực Thẻ chỉ số (`.dashboard-cards`)**: Thiết kế lưới 4 cột, hiển thị Doanh thu, Đơn hàng, Hàng bán chạy, Cảnh báo tồn kho.
- **Khu vực Biểu đồ & Trạng thái (`.analysis-section`)**: Kết hợp Chart.js doanh thu theo tháng/năm + Thanh tiến độ trạng thái công việc.

### 4.2. Màn hình Bán hàng POS (`ban-hang.html`)
- Layout chia 2 cột Flexbox vừa vặn màn hình (Bên trái: Danh mục & Lưới sản phẩm; Bên phải: Giỏ hàng & Thanh toán).

---

## 5. HƯỚNG DẪN KHI TẠO MỚI MỘT PHÂN HỆ (DEVELOPER BOILERPLATE)

Khi tạo một file HTML phân hệ mới (ví dụ `khuyen-mai.html`), copy mẫu khung tiêu chuẩn dưới đây để tự động kế thừa 100% giao diện đẹp & đồng bộ:

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tên Phân Hệ Mới - JAVI COFFEE</title>
    <!-- Nhúng bộ CSS đồng bộ bắt buộc -->
    <link rel="stylesheet" href="/css/global.css" />
    <link rel="stylesheet" href="/css/sidebar.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <script src="/js/auth.js"></script>
  </head>
  <body>
    <!-- 1. SIDEBAR: auth.js tự động render -->
    <div class="sidebar"></div>

    <!-- 2. NỘI DUNG CHÍNH (MAIN CONTENT) -->
    <div class="main-content">
      <!-- HEADER PHÂN HỆ -->
      <div class="page-header">
        <h2><i class="fas fa-tag"></i> QUẢN LÝ TÊN PHÂN HỆ</h2>
        <button class="btn btn-primary" onclick="openCreateModal()">
          <i class="fas fa-plus"></i> Thêm Mới
        </button>
      </div>

      <!-- THẺ THỐNG KÊ NHANH (Nếu có) -->
      <div class="stat-cards">
        <div class="stat-card">
          <div class="card-title">Tổng Mục</div>
          <div class="card-value" id="st-tong">0</div>
        </div>
        <div class="stat-card">
          <div class="card-title">Đang Kích Hoạt</div>
          <div class="card-value" id="st-active">0</div>
        </div>
      </div>

      <!-- THANH TÌM KIẾM & BỘ LỌC -->
      <div class="filter-bar">
        <input type="text" id="searchInput" placeholder="Tìm kiếm nhanh..." onkeyup="filterTable()" style="flex:1;" />
      </div>

      <div class="filter-section">
        <button class="filter-btn active" data-status="Tất cả" onclick="filterStatus('Tất cả', this)">
          Tất cả <span class="status-badge" id="b-all">0</span>
        </button>
      </div>

      <!-- LƯỚI BẢNG DỮ LIỆU (Auto Flex 1) -->
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;"><input type="checkbox" class="check-all" /></th>
              <th>Mã Mục</th>
              <th>Tên Mục</th>
              <th>Ngày Tạo</th>
              <th>Trạng Thái</th>
              <th style="text-align: right;">Thao Tác</th>
            </tr>
          </thead>
          <tbody id="mainTableBody">
            <tr ondblclick="openDetailModal('MA001')">
              <td style="text-align: center;"><input type="checkbox" /></td>
              <td>MA001</td>
              <td>Ví Dụ Mục Mới</td>
              <td>03/10/2026</td>
              <td><span class="badge completed">Hoạt động</span></td>
              <td style="text-align: right;">
                <button class="btn-action-icon btn-edit-icon" title="Sửa"><i class="fas fa-pen"></i></button>
                <button class="btn-action-icon btn-delete-icon" title="Xóa"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- THANH PHÂN TRANG -->
      <div class="pagination-container">
        <div class="pagination-info">Hiển thị 1 - 20 / 20 mục</div>
        <div class="pagination-buttons">
          <button class="active">1</button>
        </div>
      </div>
    </div>
  </body>
</html>
```

---

## 6. TỔNG HỢP DANH SÁCH PHÂN HỆ VÀ TRẠNG THÁI ĐỒNG BỘ

| STT | Phân hệ (File HTML) | Loại màn hình | Form Chi Tiết | Trạng thái Đồng bộ |
|:---:|:---|:---:|:---:|:---:|
| 1 | `dashboard.html` | Trang Chủ / Overview | Overview Panels | ✅ Đã đồng bộ |
| 2 | `ban-hang.html` | POS Bán Hàng | Cart Summary | ✅ Đã đồng bộ |
| 3 | `don-hang.html` | Quản lý Đơn hàng | Voucher Detail Card | ✅ Đã đồng bộ |
| 4 | `san-pham.html` | Danh mục Sản phẩm | Standard Modal | ✅ Đã đồng bộ |
| 5 | `nhap-kho.html` | Quản lý Nhập kho | Voucher Detail Card | ✅ Đã đồng bộ |
| 6 | `xuat-kho.html` | Quản lý Xuất kho | Voucher Detail Card | ✅ Đã đồng bộ |
| 7 | `hoa-don.html` | Quản lý Hóa đơn | Voucher Detail Card | ✅ Đã đồng bộ |
| 8 | `cong-no.html` | Quản lý Công nợ | Debt Detail Card | ✅ Đã đồng bộ |
| 9 | `phieu-thu.html` | Quản lý Phiếu thu | Voucher Detail Card | ✅ Đã đồng bộ |
| 10 | `phieu-chi.html` | Quản lý Phiếu chi | Voucher Detail Card | ✅ Đã đồng bộ |
| 11 | `nha-cung-cap.html` | Danh mục Nhà cung cấp | Standard Modal | ✅ Đã đồng bộ |
| 12 | `khach-hang.html` | Danh mục Khách hàng | Standard Modal | ✅ Đã đồng bộ |
| 13 | `nhan-vien.html` | Danh mục Nhân viên | Standard Modal | ✅ Đã đồng bộ |
| 14 | `loai-sp.html` | Loại sản phẩm | Standard Modal | ✅ Đã đồng bộ |
| 15 | `loai-kh.html` | Loại khách hàng | Standard Modal | ✅ Đã đồng bộ |
| 16 | `ton-kho.html` | Quản lý Tồn kho | Standard Modal | ✅ Đã đồng bộ |
| 17 | `quan-tri.html` | Quản trị Hệ thống | System Panel | ✅ Đã đồng bộ |
| 18 | `mua-hang.html` | Quản lý Mua hàng | Standard Modal | ✅ Đã đồng bộ |
| 19 | `in-chung-tu.html` | In ấn chứng từ | Print Preview | ✅ Đã đồng bộ |
| 20 | `login.html` | Đăng nhập hệ thống | Auth Card | ✅ Đã đồng bộ |

---
*Tài liệu này là chuẩn mực giao diện của dự án JAVI COFFEE.*
