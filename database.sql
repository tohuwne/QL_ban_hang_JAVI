
-- I. XÓA CÁC ĐỐI TƯỢNG CŨ (Nếu đã tồn tại để tránh xung đột khi chạy lại)
-- Xóa Triggers --
IF OBJECT_ID('trg_AutoMaKH', 'TR') IS NOT NULL DROP TRIGGER trg_AutoMaKH;
IF OBJECT_ID('trg_AutoMaNV', 'TR') IS NOT NULL DROP TRIGGER trg_AutoMaNV;
IF OBJECT_ID('trg_AutoMaDH', 'TR') IS NOT NULL DROP TRIGGER trg_AutoMaDH;
IF OBJECT_ID('trg_AutoMaHD', 'TR') IS NOT NULL DROP TRIGGER trg_AutoMaHD;
IF OBJECT_ID('trg_AutoMaPX', 'TR') IS NOT NULL DROP TRIGGER trg_AutoMaPX;
IF OBJECT_ID('trg_AutoMaCN', 'TR') IS NOT NULL DROP TRIGGER trg_AutoMaCN;
IF OBJECT_ID('trg_AutoMaPT', 'TR') IS NOT NULL DROP TRIGGER trg_AutoMaPT;
IF OBJECT_ID('trg_AutoMaNCC', 'TR') IS NOT NULL DROP TRIGGER trg_AutoMaNCC;
IF OBJECT_ID('trg_AutoMaPN', 'TR') IS NOT NULL DROP TRIGGER trg_AutoMaPN;
IF OBJECT_ID('trg_AutoMaPC', 'TR') IS NOT NULL DROP TRIGGER trg_AutoMaPC;

-- Xóa Triggers Nghiệp vụ --
IF OBJECT_ID('trg_Web_CapNhatKhoKhiDatHang', 'TR') IS NOT NULL DROP TRIGGER trg_Web_CapNhatKhoKhiDatHang;
IF OBJECT_ID('trg_Web_CapNhatCongNoKhiThuChi', 'TR') IS NOT NULL DROP TRIGGER trg_Web_CapNhatCongNoKhiThuChi;
IF OBJECT_ID('trg_Web_CapNhatCongNoKhiPhieuChi', 'TR') IS NOT NULL DROP TRIGGER trg_Web_CapNhatCongNoKhiPhieuChi;
IF OBJECT_ID('trg_CapNhatKhoKhiXuat', 'TR') IS NOT NULL DROP TRIGGER trg_CapNhatKhoKhiXuat;
GO

-- Xóa Views --
IF OBJECT_ID('v_DanhSachSanPham', 'V') IS NOT NULL DROP VIEW v_DanhSachSanPham;
IF OBJECT_ID('v_CongNoKhachHang', 'V') IS NOT NULL DROP VIEW v_CongNoKhachHang;
IF OBJECT_ID('v_DoanhThu_ChiPhi', 'V') IS NOT NULL DROP VIEW v_DoanhThu_ChiPhi;
GO

-- Xóa Stored Procedures --
IF OBJECT_ID('sp_XuLyNhapKho', 'P') IS NOT NULL DROP PROCEDURE sp_XuLyNhapKho;
IF OBJECT_ID('sp_LapHoaDon', 'P') IS NOT NULL DROP PROCEDURE sp_LapHoaDon;
GO

-- Xóa Tables (Xóa ngược từ bảng con lên bảng cha để tránh khóa ngoại) --
IF OBJECT_ID('PHIEU_CHI', 'U') IS NOT NULL DROP TABLE PHIEU_CHI;
IF OBJECT_ID('PHIEU_THU', 'U') IS NOT NULL DROP TABLE PHIEU_THU;
IF OBJECT_ID('CONG_NO', 'U') IS NOT NULL DROP TABLE CONG_NO;
IF OBJECT_ID('PHIEU_XUAT', 'U') IS NOT NULL DROP TABLE PHIEU_XUAT;
IF OBJECT_ID('HOA_DON', 'U') IS NOT NULL DROP TABLE HOA_DON;
IF OBJECT_ID('CT_DON_HANG', 'U') IS NOT NULL DROP TABLE CT_DON_HANG;
IF OBJECT_ID('DON_HANG', 'U') IS NOT NULL DROP TABLE DON_HANG;
IF OBJECT_ID('TAI_KHOAN', 'U') IS NOT NULL DROP TABLE TAI_KHOAN;
IF OBJECT_ID('NHAN_VIEN', 'U') IS NOT NULL DROP TABLE NHAN_VIEN;
IF OBJECT_ID('KHACH_HANG', 'U') IS NOT NULL DROP TABLE KHACH_HANG;
IF OBJECT_ID('LOAI_KHACH_HANG', 'U') IS NOT NULL DROP TABLE LOAI_KHACH_HANG;
IF OBJECT_ID('CT_PHIEU_NHAP', 'U') IS NOT NULL DROP TABLE CT_PHIEU_NHAP;
IF OBJECT_ID('PHIEU_NHAP', 'U') IS NOT NULL DROP TABLE PHIEU_NHAP;
IF OBJECT_ID('NHA_CUNG_CAP', 'U') IS NOT NULL DROP TABLE NHA_CUNG_CAP;
IF OBJECT_ID('SAN_PHAM', 'U') IS NOT NULL DROP TABLE SAN_PHAM;
IF OBJECT_ID('LOAI_SAN_PHAM', 'U') IS NOT NULL DROP TABLE LOAI_SAN_PHAM;
GO


-- II. ĐỊNH NGHĨA CẤU TRÚC BẢNG DỮ LIỆU & RÀNG BUỘC (TABLES)

-- 1. BẢNG LOẠI SẢN PHẨM: Phân loại nhóm hàng hóa (Hạt, Rang xay, Máy pha...)
CREATE TABLE LOAI_SAN_PHAM (
    MaLoaiSP CHAR(3) NOT NULL PRIMARY KEY,         -- Mã loại sản phẩm (Ví dụ: CFH, CFX, MPH...) [cite: 11]
    TenLoaiSP NVARCHAR(50) NOT NULL                -- Tên loại sản phẩm [cite: 11]
);

-- 2. BẢNG NHÀ CUNG CẤP: Thông tin đối tác cung cấp nguyên liệu, vật tư đầu vào
CREATE TABLE NHA_CUNG_CAP (
    MaNCC CHAR(5) NOT NULL PRIMARY KEY,            -- Mã nhà cung cấp (Trigger tự tăng NCCxx) [cite: 46]
    TenNCC NVARCHAR(100) NOT NULL,                 -- Tên đơn vị nhà cung cấp [cite: 47]
    SoDTNCC VARCHAR(50)NOT NULL,                           -- Điện thoại liên hệ
    EmailNCC VARCHAR(100),                         -- Thư điện tử liên hệ
    DiaChiNCC NVARCHAR(255) NOT NULL,                       -- Địa chỉ kho bãi/văn phòng đối tác
    GhiChu NVARCHAR(255)                           -- Ghi chú bổ sung nghiệp vụ
);

-- 3. BẢNG SẢN PHẨM: Chi tiết thông tin các sản phẩm hạt cà phê, máy móc kinh doanh
CREATE TABLE SAN_PHAM (
    MaSP CHAR(5) NOT NULL PRIMARY KEY,             -- Mã sản phẩm định danh [cite: 12]
    TenSP NVARCHAR(50) NOT NULL,                   -- Tên sản phẩm [cite: 12]
    DonViTinh NVARCHAR(50) NOT NULL,               -- Đơn vị đo lường (Kg, Máy, Cái, Hộp...) [cite: 12]
    TrongLuong DECIMAL(10, 2),                     -- Khối lượng tịnh [cite: 12]
    GiaBan DECIMAL(19, 3) NOT NULL,                -- Đơn giá niêm yết bán lẻ cho khách [cite: 12]
    SoLuongTon DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,-- Hàng tồn thực tế nằm trong kho vật lý [cite: 12]
    SoLuongKD DECIMAL(10, 2) DEFAULT 0.00 NOT NULL, -- Hàng khả dụng để bán (Đã trừ đi hàng khách đặt giữ chỗ) [cite: 12]
    GhiChu NVARCHAR(255),                          -- Ghi chú cấu hình [cite: 12]
    MaLoaiSP CHAR(3) NOT NULL,                     -- Mã liên kết phân loại danh mục [cite: 12]
    FOREIGN KEY (MaLoaiSP) REFERENCES LOAI_SAN_PHAM(MaLoaiSP), -- [cite: 12]
    -- RÀNG BUỘC: Giá bán không được âm; Số lượng khả dụng bán không được vượt quá số tồn kho thực tế [cite: 12]
    CONSTRAINT CHK_SAN_PHAM_Logic CHECK (GiaBan >= 0 AND SoLuongKD <= SoLuongTon) -- [cite: 12, 13]
);

-- 4. BẢNG LOẠI KHÁCH HÀNG: Phân hạng khách hàng (Lẻ, Sỉ, VIP) áp dụng chiết khấu tự động
CREATE TABLE LOAI_KHACH_HANG (
    MaLoaiKH CHAR(3) NOT NULL PRIMARY KEY,         -- Mã phân nhóm khách (L01, S01, V01) [cite: 14]
    TenLoaiKH NVARCHAR(50) NOT NULL,               -- Tên gọi nhóm khách hàng [cite: 14]
    TyLeChietKhau DECIMAL(5, 2) DEFAULT 0,         -- LƯU DẠNG THẬP PHÂN: 0.05 tương ứng giảm 5%, 0.1 tương ứng giảm 10%
    CONSTRAINT CHK_LOAI_KHACH_HANG_Rate CHECK (TyLeChietKhau >= 0 AND TyLeChietKhau <= 1.0)
);

-- 5. BẢNG KHÁCH HÀNG: Danh bạ hồ sơ thông tin khách hàng giao dịch
CREATE TABLE KHACH_HANG (
    MaKH CHAR(5) NOT NULL PRIMARY KEY,             -- Mã khách hàng định danh (Trigger tự tăng KHxxx) [cite: 15]
    TenKH NVARCHAR(50) NOT NULL,                   -- Họ và tên khách hàng [cite: 15]
    SoDTKH VARCHAR(50) NOT NULL,                            -- Điện thoại liên lạc [cite: 15]
    EmailKH VARCHAR(100),                          -- Địa chỉ hòm thư [cite: 15]
    GioiTinhKH NVARCHAR(10),                       -- Giới tính (Nam/Nữ) [cite: 15]
    DiaChiKH NVARCHAR(100) NOT NULL,                        -- Địa chỉ thường trú hoặc giao nhận [cite: 15]
    MaLoaiKH CHAR(3) NOT NULL,                     -- Khóa ngoại liên kết phân hạng khách [cite: 15]
    FOREIGN KEY (MaLoaiKH) REFERENCES LOAI_KHACH_HANG(MaLoaiKH) -- [cite: 15]
);

-- 6. BẢNG NHÂN VIÊN: Quản lý nhân sự vận hành hệ thống chuỗi cửa hàng
CREATE TABLE NHAN_VIEN (
    MaNV CHAR(5) NOT NULL PRIMARY KEY,             -- Mã nhân viên định danh (Trigger tự tăng NVxxx) [cite: 16]
    HoTenNV NVARCHAR(50) NOT NULL,                 -- Họ và tên nhân sự [cite: 16]
    CCCD VARCHAR(20) UNIQUE,                       -- Số Căn cước công dân [cite: 16]
    GioiTinh NVARCHAR(5) NOT NULL,                          -- Giới tính nhân sự [cite: 16]
    ChucVu NVARCHAR(30) NOT NULL,                  -- Bộ phận làm việc: Quản lý, Bán hàng, Kế toán, Kho... [cite: 16]
    SoDTNV VARCHAR(50) NOT NULL,                            -- Số điện thoại nội bộ [cite: 16]
    EmailNV VARCHAR(100),                          -- Email doanh nghiệp cấp [cite: 16]
    DiaChiNV NVARCHAR(100) NOT NULL,                        -- Địa chỉ tạm trú/thường trú [cite: 16]
    TrangThai NVARCHAR(20) DEFAULT N'Đang làm việc'-- Trạng thái làm việc (Hỗ trợ Khóa/Mở tài khoản trên giao diện Web) [cite: 99]
);

-- 7. BẢNG TÀI KHOẢN: Chứng thực thông tin đăng nhập phân quyền hệ thống bảo mật
CREATE TABLE TAI_KHOAN (
    TenDangNhap VARCHAR(50) NOT NULL PRIMARY KEY,  -- Tài khoản viết liền độc nhất [cite: 17]
    MatKhau VARCHAR(255) NOT NULL,                 -- Mật khẩu băm bảo mật cao (Độ dài 255 phục vụ chuỗi mã hóa Bcrypt Node.js) [cite: 109]
    MaNV CHAR(5) NOT NULL,                         -- Tài khoản thuộc quyền sở hữu của nhân viên nào [cite: 17]
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV)  -- [cite: 17]
);

-- 8. BẢNG PHIẾU NHẬP KHO: Chứng từ ghi nhận lô hàng bốc nhập kho tổng từ đối tác Nhà cung cấp
CREATE TABLE PHIEU_NHAP (
    MaPN CHAR(5) NOT NULL PRIMARY KEY,             -- Mã phiếu nhập kho (Trigger tự tăng PNxxx) [cite: 46]
    NgayNhap DATETIME NOT NULL,                    -- Thời điểm nhập hàng bốc dỡ [cite: 52]
    SoHoaDonNCC VARCHAR(50),                       -- Mã chứng từ/Số hóa đơn giấy của nhà cung cấp để đối chiếu [cite: 68]
    TongTienNhap DECIMAL(19, 3) DEFAULT 0,         -- Tổng chi phí hàng của phiếu nhập kho (Số lượng * Giá nhập) [cite: 47]
    SoTienDaTraNCC DECIMAL(19, 3) DEFAULT 0,       -- Số tiền thực chi từ két tiền công ty trả cho đối tác [cite: 199]
    TrangThaiThanhToan NVARCHAR(50) DEFAULT N'Chưa thanh toán', -- Trạng thái: Chưa thanh toán, Thanh toán một phần, Đã thanh toán [cite: 68]
    GhiChu NVARCHAR(255),                          -- Ghi chú thông tin lô nhập [cite: 47]
    MaNV CHAR(5) NOT NULL,                         -- Nhân viên thủ kho bốc dỡ nhận hàng [cite: 47]
    MaNCC CHAR(5) NOT NULL,                        -- Đối tác nhà cung cấp giao lô hàng [cite: 47]
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV), -- [cite: 47]
    FOREIGN KEY (MaNCC) REFERENCES NHA_CUNG_CAP(MaNCC) -- [cite: 47]
);

-- 9. BẢNG CHI TIẾT PHIẾU NHẬP: Lưu danh mục hàng hóa chi tiết trong một phiên nhập kho
CREATE TABLE CT_PHIEU_NHAP (
    MaPN CHAR(5) NOT NULL,                         -- Mã phiếu nhập kho cha liên kết [cite: 47]
    MaSP CHAR(5) NOT NULL,                         -- Mặt hàng được bốc nhập [cite: 47]
    SoLuong INT NOT NULL,                          -- Số lượng nhập kho thực tế [cite: 47]
    GiaNhap DECIMAL(19, 3) NOT NULL,               -- Giá gốc mua vào tính trên một đơn vị mặt hàng [cite: 47]
    PRIMARY KEY (MaPN, MaSP),                      -- [cite: 47]
    FOREIGN KEY (MaPN) REFERENCES PHIEU_NHAP(MaPN),-- [cite: 47]
    FOREIGN KEY (MaSP) REFERENCES SAN_PHAM(MaSP),  -- [cite: 47]
    -- RÀNG BUỘC TOÀN VẸN: Số lượng nhập bốc kho bắt buộc phải dương (>0) và giá nhập vào không âm (>=0)
    CONSTRAINT CHK_CT_PHIEU_NHAP_Qty CHECK (SoLuong > 0 AND GiaNhap >= 0)
);

-- 10. BẢNG PHIẾU CHI: Chứng từ xuất tiền chi trả nợ tiền mua hàng cho Nhà cung cấp
CREATE TABLE PHIEU_CHI (
    MaPC CHAR(5) NOT NULL PRIMARY KEY,             -- Mã chứng từ chi tiền quỹ (Trigger tự tăng PCxxx) [cite: 210]
    NgayChi DATETIME NOT NULL,                     -- Ngày giờ xuất tiền khỏi quỹ tài chính [cite: 209]
    SoTienThucChi DECIMAL(19, 3) NOT NULL,         -- Số tiền thực tế chi đi giải ngân nợ [cite: 209]
    HinhThucThanhToan NVARCHAR(50),                -- Phương thức thanh toán: Tiền mặt, Chuyển khoản ngân hàng [cite: 209]
    GhiChu NVARCHAR(255),                          -- Lý do lập chứng từ chi quỹ
    MaPN CHAR(5) NOT NULL,                         -- Chứng từ chi tiền trả nợ hàng cho Phiếu Nhập kho nào [cite: 211]
    MaNV CHAR(5) NOT NULL,                         -- Nhân viên/Kế toán viên lập phiếu chi quỹ tiền [cite: 211]
    FOREIGN KEY (MaPN) REFERENCES PHIEU_NHAP(MaPN),
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV),
    -- RÀNG BUỘC TOÀN VẸN: Số tiền chi ra bắt buộc phải không âm
    CONSTRAINT CHK_PHIEU_CHI_Money CHECK (SoTienThucChi >= 0)
);

-- 11. BẢNG ĐƠN HÀNG: Lưu hồ sơ đặt sắm sản phẩm từ khách lẻ hoặc khách sỉ đại lý
CREATE TABLE DON_HANG (
    MaDH CHAR(5) NOT NULL PRIMARY KEY,             -- Mã đơn hàng quản lý (Trigger tự tăng DHxxx) [cite: 18]
    NgayDat DATE NOT NULL,                         -- Ngày khách đặt sắm đơn hàng [cite: 18]
    TongTienDonHang DECIMAL(19, 3) DEFAULT 0,      -- Nguyên giá đơn hàng khi chưa giảm trừ chiết khấu [cite: 18]
    TongGiamGiaSP DECIMAL(19, 3) DEFAULT 0,        -- Tổng giá trị tiền được giảm trừ chiết khấu quy đổi [cite: 18]
    TongTienSauGiam DECIMAL(19, 3) DEFAULT 0,      -- Số tiền thực tế ghi nhận thu từ khách cuối cùng [cite: 18]
    TrangThaiDonHang NVARCHAR(50),                 -- Trạng thái: Hoàn thành, giao sau, không hoàn thành [cite: 18]
    MaNV CHAR(5) NOT NULL,                         -- Nhân viên sales/kinh doanh lập đơn hỗ trợ [cite: 18]
    MaKH CHAR(5) NOT NULL,                         -- Đối tượng khách hàng đặt đơn sắm [cite: 18]
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV), -- [cite: 18]
    FOREIGN KEY (MaKH) REFERENCES KHACH_HANG(MaKH), -- [cite: 18]
    -- RÀNG BUỘC TOÀN VẸN: Tiền chiết khấu không vượt tổng hóa đơn gốc; Tiền sau giảm phải đúng logic = (Tổng đơn - Giảm giá) [cite: 18, 19]
    CONSTRAINT CHK_DON_HANG_Money CHECK (TongGiamGiaSP <= TongTienDonHang AND TongTienSauGiam = (TongTienDonHang - TongGiamGiaSP)) -- [cite: 19]
);

-- 12. BẢNG CHI TIẾT ĐƠN HÀNG: Danh mục chi tiết hàng sắm trong một giỏ đơn đặt hàng của khách
CREATE TABLE CT_DON_HANG (
    MaDH CHAR(5) NOT NULL,                         -- Khóa ngoại liên kết mã đơn hàng cha [cite: 20]
    MaSP CHAR(5) NOT NULL,                         -- Mã sản phẩm hàng khách sắm [cite: 20]
    SoLuong INT NOT NULL,                          -- Số lượng đặt sắm hàng mặt hàng [cite: 20]
    GiamGiaSP DECIMAL(5, 4) DEFAULT 0,             -- LƯU DẠNG THẬP PHÂN HỆ SỐ 0.1: 0.1 tương ứng giảm 10%, 0.05 tương ứng giảm 5%
    PRIMARY KEY (MaDH, MaSP),                      -- [cite: 20]
    FOREIGN KEY (MaDH) REFERENCES DON_HANG(MaDH),  -- [cite: 20]
    FOREIGN KEY (MaSP) REFERENCES SAN_PHAM(MaSP),  -- [cite: 20]
    -- RÀNG BUỘC TOÀN VẸN: Số lượng mua bắt buộc phải lớn hơn 0; tỷ lệ giảm giá nằm trong khoảng từ 0.0 đến 1.0 (0% - 100%) [cite: 20]
    CONSTRAINT CHK_CT_DON_HANG_Qty CHECK (SoLuong > 0), -- [cite: 20]
    CONSTRAINT CHK_CT_DON_HANG_Discount CHECK (GiamGiaSP >= 0 AND GiamGiaSP <= 1.0)
);

-- 13. BẢNG HÓA ĐƠN: Chứng từ tài chính thu tiền đầu ra xuất ra giao cho khách hàng
CREATE TABLE HOA_DON (
    MaHD CHAR(5) NOT NULL PRIMARY KEY,             -- Mã hóa đơn tài chính (Trigger tự tăng HDxxx) [cite: 21]
    NgayLap DATE NOT NULL,                         -- Ngày xuất lập hóa đơn chứng từ [cite: 21]
    HinhThucThanhToan NVARCHAR(50) NOT NULL,                -- Phương thức: Tiền mặt, Chuyển khoản qua ngân hàng, Ví điện tử [cite: 21]
    TongTienGiamGia DECIMAL(19, 3) DEFAULT 0,      -- Tiền giảm trừ trực tiếp hóa đơn chứng từ [cite: 21]
    TongTienThanhToan DECIMAL(19, 3) NOT NULL,     -- Số tiền hóa đơn thực thu từ khách [cite: 21]
    TrangThaiThanhToan NVARCHAR(50),               -- Tình trạng nợ nần: Đã thanh toán, Chưa thanh toán (Ghi nợ) [cite: 21]
    MaNV CHAR(5) NOT NULL,                         -- Thu ngân/Nhân viên kế toán lập xuất hóa đơn [cite: 21]
    MaDH CHAR(5) NOT NULL,                         -- Hóa đơn tài chính lập trên đơn đặt hàng nào [cite: 21]
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV), -- [cite: 21]
    FOREIGN KEY (MaDH) REFERENCES DON_HANG(MaDH)   -- [cite: 21]
);

-- 14. BẢNG PHIẾU XUẤT KHO: Chứng từ quản lý việc bốc dỡ hàng xuất kho đi giao bưu tá vận chuyển
CREATE TABLE PHIEU_XUAT (
    MaPX CHAR(5) NOT NULL PRIMARY KEY,             -- Mã phiếu bốc hàng xuất kho (Trigger tự tăng PXxxx) [cite: 22]
    NgayXuat DATE NOT NULL,                        -- Ngày xuất kho vật lý [cite: 22]
    TrangThaiGiaoHang NVARCHAR(50),                -- Tình trạng bưu tá vận chuyển: Đang xử lý, Đang giao, Đã giao hàng thành công... [cite: 22]
    MaNV CHAR(5) NOT NULL,                         -- Nhân viên phụ trách kho đứng tên xuất bốc [cite: 22]
    MaDH CHAR(5) NOT NULL,                         -- Xuất hàng dựa theo đơn hàng cụ thể nào [cite: 22]
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV), -- [cite: 22]
    FOREIGN KEY (MaDH) REFERENCES DON_HANG(MaDH)   -- [cite: 22]
);

-- 15. BẢNG CÔNG NỢ KHÁCH HÀNG: Sổ nợ theo dõi các đại lý sỉ, khách thành viên VIP mua chịu nợ
CREATE TABLE CONG_NO (
    MaCN CHAR(5) NOT NULL PRIMARY KEY,             -- Mã sổ nợ quản lý (Trigger tự tăng CNxxx) [cite: 23]
    HanThanhToan DATE,                             -- Hạn chót bắt buộc phải dứt điểm nợ toán [cite: 23]
    NgayGhiNhan DATE NOT NULL,                     -- Ngày mở hồ sơ ghi nhận khoản nợ [cite: 23]
    SoTienDaTra DECIMAL(19, 3) DEFAULT 0,          -- Tiền khách nợ đã hoàn trả bớt qua các kỳ [cite: 23]
    TongNo DECIMAL(19, 3) NOT NULL,                -- Số tiền gốc nợ ban đầu phát sinh từ hóa đơn mua chịu [cite: 23]
    SoDuCN DECIMAL(19, 3) DEFAULT 0,               -- Tiền dư nợ hiện tại còn phải tiếp tục đòi khách [cite: 23]
    TrangThaiCN NVARCHAR(50),                      -- Tình trạng sổ nợ: Còn nợ, Hoàn tất [cite: 23]
    MaHD CHAR(5),                                  -- Khóa ngoại liên kết hóa đơn mua chịu của khách [cite: 23]
    FOREIGN KEY (MaHD) REFERENCES HOA_DON(MaHD),  -- [cite: 23]
    -- RÀNG BUỘC TOÀN VẸN: Số dư nợ hiện tại không âm; Phải đúng công thức toán học khít khớp = (Tổng nợ gốc - Đã hoàn trả bớt) [cite: 23]
    CONSTRAINT CHK_CONG_NO_Logic CHECK (SoDuCN >= 0 AND SoDuCN = (TongNo - SoTienDaTra)) -- [cite: 23]
);

-- 16. BẢNG PHIẾU THU: Chứng từ kế toán ghi nhận dòng tiền mặt/tiền gửi thu hồi nợ từ phía khách sỉ
CREATE TABLE PHIEU_THU (
    MaPT CHAR(5) NOT NULL PRIMARY KEY,             -- Mã phiếu thu quỹ tiền mặt (Trigger tự tăng PTxxx) [cite: 24]
    NgayThu DATETIME NOT NULL,                     -- Ngày giờ thực hiện thu tiền mặt/tiền gửi nổi [cite: 24]
    SoTienThucThu DECIMAL(19, 3) NOT NULL,         -- Số tiền mặt thu hồi nợ thực tế bốc về [cite: 24]
    HinhThucThanhToan NVARCHAR(50),                -- Phương thức thu hồi: Tiền mặt / Chuyển khoản ngân hàng [cite: 24]
    GhiChu NVARCHAR(255),                          -- Lý do viết chứng từ thu tiền [cite: 24]
    MaCN CHAR(5) NOT NULL,                         -- Thu tiền nhằm xóa giảm trừ bợ nợ cho mã sổ nợ nào [cite: 24]
    MaNV CHAR(5) NOT NULL,                         -- Kế toán viên hoặc thu ngân lập viết phiếu thu [cite: 24]
    FOREIGN KEY (MaCN) REFERENCES CONG_NO(MaCN),   -- [cite: 24]
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV), -- [cite: 24]
    -- RÀNG BUỘC TOÀN VẸN: Số tiền thu về két tiền không được phép âm [cite: 24]
    CONSTRAINT CHK_PHIEU_THU_Money CHECK (SoTienThucThu >= 0) -- [cite: 24]
);
GO


-- III. CÁC TRIGGER TỰ ĐỘNG SINH MÃ TĂNG DẦN 

-- 1. Tự tăng mã Khách Hàng (KHxxx) [cite: 25]
CREATE TRIGGER trg_AutoMaKH ON KHACH_HANG INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaKH, 3, 3) AS INT)), 0) FROM KHACH_HANG); -- [cite: 25]
    INSERT INTO KHACH_HANG 
    SELECT 'KH' + RIGHT('000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS VARCHAR(3)), 3), -- [cite: 26]
           TenKH, SoDTKH, EmailKH, GioiTinhKH, DiaChiKH, MaLoaiKH FROM inserted; -- [cite: 26]
END;
GO

-- 2. Tự tăng mã Nhân Viên (NVxxx) [cite: 28]
CREATE TRIGGER trg_AutoMaNV ON NHAN_VIEN INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaNV, 3, 3) AS INT)), 0) FROM NHAN_VIEN); -- [cite: 28]
    INSERT INTO NHAN_VIEN 
    SELECT 'NV' + RIGHT('000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS VARCHAR(3)), 3), -- [cite: 29]
           HoTenNV, CCCD, GioiTinh, ChucVu, SoDTNV, EmailNV, DiaChiNV, TrangThai FROM inserted;
END;
GO

-- 3. Tự tăng mã Đơn Hàng (DHxxx) [cite: 30]
CREATE TRIGGER trg_AutoMaDH ON DON_HANG INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaDH, 3, 3) AS INT)), 0) FROM DON_HANG); -- [cite: 30]
    INSERT INTO DON_HANG 
    SELECT 'DH' + RIGHT('000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS VARCHAR(3)), 3), -- [cite: 31]
           NgayDat, TongTienDonHang, TongGiamGiaSP, TongTienSauGiam, TrangThaiDonHang, MaNV, MaKH FROM inserted; -- [cite: 31]
END;
GO

-- 4. Tự tăng mã Hóa Đơn (HDxxx) [cite: 33]
CREATE TRIGGER trg_AutoMaHD ON HOA_DON INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaHD, 3, 3) AS INT)), 0) FROM HOA_DON); -- [cite: 33]
    INSERT INTO HOA_DON 
    SELECT 'HD' + RIGHT('000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS VARCHAR(3)), 3), -- [cite: 34]
           NgayLap, HinhThucThanhToan, TongTienGiamGia, TongTienThanhToan, TrangThaiThanhToan, MaNV, MaDH FROM inserted; -- [cite: 34]
END;
GO

-- 5. Tự tăng mã Phiếu Xuất Kho (PXxxx) [cite: 35]
CREATE TRIGGER trg_AutoMaPX ON PHIEU_XUAT INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaPX, 3, 3) AS INT)), 0) FROM PHIEU_XUAT); -- [cite: 35]
    INSERT INTO PHIEU_XUAT 
    SELECT 'PX' + RIGHT('000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS VARCHAR(3)), 3), -- [cite: 36]
           NgayXuat, TrangThaiGiaoHang, MaNV, MaDH FROM inserted; -- [cite: 36]
END;
GO

-- 6. Tự tăng mã Công Nợ Khách Hàng (CNxxx) [cite: 38]
CREATE TRIGGER trg_AutoMaCN ON CONG_NO INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaCN, 3, 3) AS INT)), 0) FROM CONG_NO); -- [cite: 38]
    INSERT INTO CONG_NO 
    SELECT 'CN' + RIGHT('000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS VARCHAR(3)), 3), -- [cite: 39]
           HanThanhToan, NgayGhiNhan, SoTienDaTra, TongNo, SoDuCN, TrangThaiCN, MaHD FROM inserted; -- [cite: 39]
END;
GO

-- 7. Tự tăng mã Phiếu Thu Tiền (PTxxx) [cite: 40]
CREATE TRIGGER trg_AutoMaPT ON PHIEU_THU INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaPT, 3, 3) AS INT)), 0) FROM PHIEU_THU); -- [cite: 40]
    INSERT INTO PHIEU_THU 
    SELECT 'PT' + RIGHT('000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS VARCHAR(3)), 3), -- [cite: 41]
           NgayThu, SoTienThucThu, HinhThucThanhToan, GhiChu, MaCN, MaNV FROM inserted; -- [cite: 41]
END;
GO

-- 8. Tự tăng mã Nhà Cung Cấp (Định dạng NCCxx) [cite: 46]
CREATE TRIGGER trg_AutoMaNCC ON NHA_CUNG_CAP INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaNCC, 4, 2) AS INT)), 0) FROM NHA_CUNG_CAP);
    INSERT INTO NHA_CUNG_CAP 
    SELECT 'NCC' + RIGHT('00' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS VARCHAR(2)), 2), 
           TenNCC, SoDTNCC, EmailNCC, DiaChiNCC, GhiChu FROM inserted;
END;
GO

-- 9. Tự tăng mã Phiếu Nhập Kho (PNxxx) [cite: 46]
CREATE TRIGGER trg_AutoMaPN ON PHIEU_NHAP INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaPN, 3, 3) AS INT)), 0) FROM PHIEU_NHAP);
    INSERT INTO PHIEU_NHAP 
    SELECT 'PN' + RIGHT('000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS VARCHAR(3)), 3), 
           NgayNhap, SoHoaDonNCC, TongTienNhap, SoTienDaTraNCC, TrangThaiThanhToan, GhiChu, MaNV, MaNCC FROM inserted;
END;
GO

-- 10. Tự tăng mã Phiếu Chi Tiền Trả Nợ NCC (PCxxx) [cite: 210]
CREATE TRIGGER trg_AutoMaPC ON PHIEU_CHI INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaPC, 3, 3) AS INT)), 0) FROM PHIEU_CHI);
    INSERT INTO PHIEU_CHI 
    SELECT 'PC' + RIGHT('000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS VARCHAR(3)), 3), 
           NgayChi, SoTienThucChi, HinhThucThanhToan, GhiChu, MaPN, MaNV FROM inserted;
END;
GO


-- IV. CÁC TRIGGER NGHIỆP VỤ BÁN HÀNG & KHO 

-- 1. TRIGGER TỰ ĐỘNG TRỪ SỐ LƯỢNG KHẢ DỤNG (SoLuongKD) KHI ĐẶT HÀNG
CREATE TRIGGER trg_Web_CapNhatKhoKhiDatHang
ON CT_DON_HANG
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 1. Giảm Số lượng Khả Dụng (luôn luôn giảm khi có đơn đặt hàng mới để giữ chỗ)
    UPDATE SP
    SET SP.SoLuongKD = SP.SoLuongKD - I.SoLuong
    FROM SAN_PHAM SP
    JOIN inserted I ON SP.MaSP = I.MaSP;

    -- 2. Nếu là đơn bán "Tại quầy" (Trạng thái đơn: Hoàn thành), khách lấy hàng đi ngay 
    -- -> Trừ luôn Tồn Kho thực tế (Bỏ qua khâu lập Phiếu Xuất)
    UPDATE SP
    SET SP.SoLuongTon = SP.SoLuongTon - I.SoLuong
    FROM SAN_PHAM SP
    JOIN inserted I ON SP.MaSP = I.MaSP
    JOIN DON_HANG DH ON I.MaDH = DH.MaDH
    WHERE DH.TrangThaiDonHang = N'Hoàn thành';
END;
GO

-- 2. TRIGGER TỰ ĐỘNG TRỪ CÔNG NỢ VÀ CẬP NHẬT HÓA ĐƠN KHI LẬP PHIẾU THU
CREATE TRIGGER trg_Web_CapNhatCongNoKhiThuChi
ON PHIEU_THU
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Cập nhật số tiền đã trả và cấn trừ số dư trong CÔNG NỢ
    UPDATE CN
    SET CN.SoTienDaTra = CN.SoTienDaTra + I.SoTienThucThu,
        CN.SoDuCN = CN.SoDuCN - I.SoTienThucThu,
        CN.TrangThaiCN = CASE 
                            WHEN (CN.SoDuCN - I.SoTienThucThu) <= 0 THEN N'Hoàn tất' 
                            ELSE N'Còn nợ' 
                         END
    FROM CONG_NO CN
    JOIN inserted I ON CN.MaCN = I.MaCN;

    -- Nếu CÔNG NỢ đã trả đủ thì tự động vòng sang cập nhật HÓA ĐƠN thành Đã thanh toán
    UPDATE HD
    SET HD.TrangThaiThanhToan = N'Đã thanh toán'
    FROM HOA_DON HD
    JOIN CONG_NO CN ON HD.MaHD = CN.MaHD
    WHERE CN.SoDuCN <= 0 AND HD.TrangThaiThanhToan <> N'Đã thanh toán';
END;
GO

-- 3. TRIGGER TỰ ĐỘNG CẬP NHẬT ĐÃ THANH TOÁN CHO PHIẾU NHẬP KHI LẬP PHIẾU CHI
CREATE TRIGGER trg_Web_CapNhatCongNoKhiPhieuChi
ON PHIEU_CHI
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE PN
    SET PN.SoTienDaTraNCC = PN.SoTienDaTraNCC + I.SoTienThucChi,
        PN.TrangThaiThanhToan = CASE 
                                   WHEN (PN.SoTienDaTraNCC + I.SoTienThucChi) >= PN.TongTienNhap THEN N'Đã thanh toán' 
                                   ELSE N'Chưa thanh toán' 
                                END
    FROM PHIEU_NHAP PN
    JOIN inserted I ON PN.MaPN = I.MaPN;
END;
GO

-- 4. TRIGGER NGHIỆP VỤ XUẤT KHO: TRỪ TỒN KHO & CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (Cover mọi nghiệp vụ Xuất kho)
CREATE TRIGGER trg_CapNhatKhoKhiXuat 
ON PHIEU_XUAT 
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- a. Trừ số lượng tồn kho (SoLuongTon) khi trạng thái giao hàng thành công
    UPDATE SP
    SET SP.SoLuongTon = SP.SoLuongTon - CT.SoLuong
    FROM SAN_PHAM SP
    JOIN CT_DON_HANG CT ON SP.MaSP = CT.MaSP
    JOIN inserted I ON CT.MaDH = I.MaDH
    LEFT JOIN deleted D ON I.MaPX = D.MaPX
    WHERE (I.TrangThaiGiaoHang = N'Đã giao hàng' OR I.TrangThaiGiaoHang = N'Giao thành công')
      AND (D.TrangThaiGiaoHang IS NULL OR (D.TrangThaiGiaoHang <> N'Đã giao hàng' AND D.TrangThaiGiaoHang <> N'Giao thành công'));

    -- b. Hoàn trả lại số lượng khả dụng (SoLuongKD) nếu không giao được hàng (Hủy xuất kho)
    UPDATE SP
    SET SP.SoLuongKD = SP.SoLuongKD + CT.SoLuong
    FROM SAN_PHAM SP
    JOIN CT_DON_HANG CT ON SP.MaSP = CT.MaSP
    JOIN inserted I ON CT.MaDH = I.MaDH
    LEFT JOIN deleted D ON I.MaPX = D.MaPX
    WHERE I.TrangThaiGiaoHang = N'Hủy xuất kho'
      AND (D.TrangThaiGiaoHang IS NULL OR D.TrangThaiGiaoHang <> N'Hủy xuất kho');

    -- c. Tự động móc nối để cập nhật Đơn Hàng thành 'Hoàn thành' khi giao thành công
    UPDATE DH
    SET DH.TrangThaiDonHang = N'Hoàn thành'
    FROM DON_HANG DH
    JOIN inserted I ON DH.MaDH = I.MaDH
    LEFT JOIN deleted D ON I.MaPX = D.MaPX
    WHERE (I.TrangThaiGiaoHang = N'Đã giao hàng' OR I.TrangThaiGiaoHang = N'Giao thành công')
      AND (D.TrangThaiGiaoHang IS NULL OR (D.TrangThaiGiaoHang <> N'Đã giao hàng' AND D.TrangThaiGiaoHang <> N'Giao thành công'));

    -- d. Tự động cập nhật Đơn Hàng thành 'Không hoàn thành' khi Hủy xuất kho
    UPDATE DH
    SET DH.TrangThaiDonHang = N'Không hoàn thành'
    FROM DON_HANG DH
    JOIN inserted I ON DH.MaDH = I.MaDH
    LEFT JOIN deleted D ON I.MaPX = D.MaPX
    WHERE I.TrangThaiGiaoHang = N'Hủy xuất kho'
      AND (D.TrangThaiGiaoHang IS NULL OR D.TrangThaiGiaoHang <> N'Hủy xuất kho');
END;
GO


-- V. CÁC VIEWS

-- VIEW 1: Đổ danh sách sản phẩm kèm tên loại và thẻ trạng thái kho lên lưới UI [cite: 129]
CREATE VIEW v_DanhSachSanPham AS
SELECT 
    sp.MaSP,
    sp.TenSP,
    lsp.TenLoaiSP,
    sp.DonViTinh,
    sp.GiaBan,
    sp.SoLuongTon,
    sp.SoLuongKD,
    CASE 
        WHEN sp.SoLuongTon <= 5 THEN N'Sắp hết hàng' -- Cảnh báo icon đỏ trên HTML POS [cite: 130]
        ELSE N'Sẵn sàng kinh doanh'
    END AS TrangThaiKho
FROM SAN_PHAM sp
JOIN LOAI_SAN_PHAM lsp ON sp.MaLoaiSP = lsp.MaLoaiSP;
GO

-- VIEW 2: Tổng hợp dữ liệu sổ nợ Công nợ Phải thu của Khách sỉ (Dùng cho Kế toán thu nợ) [cite: 111]
CREATE VIEW v_CongNoKhachHang AS
SELECT 
    kh.MaKH,
    kh.TenKH,
    kh.SoDTKH,
    COUNT(cn.MaCN) AS SoPhieuNo,
    SUM(cn.TongNo) AS TongTienNo,
    SUM(cn.SoTienDaTra) AS TongDaTra,
    SUM(cn.SoDuCN) AS TongConNo
FROM KHACH_HANG kh
JOIN DON_HANG dh ON kh.MaKH = dh.MaKH
JOIN HOA_DON hd ON dh.MaDH = hd.MaDH
JOIN CONG_NO cn ON hd.MaHD = cn.MaHD
GROUP BY kh.MaKH, kh.TenKH, kh.SoDTKH;
GO

-- VIEW 3: Báo cáo dòng tiền Doanh thu bán hàng và Chi phí sắm hàng đầu vào (Dùng vẽ biểu đồ Dashboard) [cite: 111]
CREATE VIEW v_DoanhThu_ChiPhi AS
SELECT 
    ThoiGian.Thang,
    ThoiGian.Nam,
    ISNULL(DoanhThu.TongDoanhThu, 0) AS DoanhThuBanHang,
    ISNULL(ChiPhi.TongChiPhi, 0) AS ChiPhiNhapHang,
    (ISNULL(DoanhThu.TongDoanhThu, 0) - ISNULL(ChiPhi.TongChiPhi, 0)) AS LoiNhuanThuan
FROM (
    SELECT MONTH(NgayLap) AS Thang, YEAR(NgayLap) AS Nam FROM HOA_DON
    UNION
    SELECT MONTH(NgayNhap) AS Thang, YEAR(NgayNhap) AS Nam FROM PHIEU_NHAP
) ThoiGian
LEFT JOIN (
    SELECT MONTH(NgayLap) AS Thang, YEAR(NgayLap) AS Nam, SUM(TongTienThanhToan) AS TongDoanhThu
    FROM HOA_DON
    GROUP BY MONTH(NgayLap), YEAR(NgayLap)
) DoanhThu ON ThoiGian.Thang = DoanhThu.Thang AND ThoiGian.Nam = DoanhThu.Nam
LEFT JOIN (
    SELECT MONTH(NgayNhap) AS Thang, YEAR(NgayNhap) AS Nam, SUM(TongTienNhap) AS TongChiPhi
    FROM PHIEU_NHAP
    GROUP BY MONTH(NgayNhap), YEAR(NgayNhap)
) ChiPhi ON ThoiGian.Thang = ChiPhi.Thang AND ThoiGian.Nam = ChiPhi.Nam;
GO

-- VI. CÁC THỦ TỤC NGHIỆP VỤ (PROCEDURES)
-- PROCEDURE 1: Vận hành Phân hệ Nhập kho đầu vào từ đối tác Nhà cung cấp [cite: 110, 160]
CREATE PROCEDURE sp_XuLyNhapKho
    @MaNV CHAR(5),
    @MaNCC CHAR(5),
    @SoHoaDonNCC VARCHAR(50),
    @GhiChu NVARCHAR(255),
    @MaSP CHAR(5),
    @SoLuong INT,
    @GiaNhap DECIMAL(19, 3)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @NewMaPN CHAR(5);
        
        -- Tạo mới phiếu nhập đầu vào (Mã PN tự động tăng qua trigger PNxxx) [cite: 110]
        INSERT INTO PHIEU_NHAP (NgayNhap, SoHoaDonNCC, TongTienNhap, SoTienDaTraNCC, TrangThaiThanhToan, GhiChu, MaNV, MaNCC)
        VALUES (GETDATE(), @SoHoaDonNCC, (@SoLuong * @GiaNhap), 0, N'Chưa thanh toán', @GhiChu, @MaNV, @MaNCC);
        
        SELECT @NewMaPN = MaPN FROM PHIEU_NHAP WHERE MaPN = (SELECT 'PN' + RIGHT('000' + CAST(MAX(CAST(SUBSTRING(MaPN, 3, 3) AS INT)) AS VARCHAR(3)), 3) FROM PHIEU_NHAP);

        -- Đẩy dữ liệu hàng hóa cụ thể vào bảng chi tiết [cite: 110]
        INSERT INTO CT_PHIEU_NHAP (MaPN, MaSP, SoLuong, GiaNhap)
        VALUES (@NewMaPN, @MaSP, @SoLuong, @GiaNhap);

        -- Cộng dồn kho hàng sản phẩm tự động [cite: 110]
        UPDATE SAN_PHAM
        SET SoLuongTon = SoLuongTon + @SoLuong,
            SoLuongKD = SoLuongKD + @SoLuong
        WHERE MaSP = @MaSP;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrMs NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMs, 16, 1);
    END CATCH
END;
GO

-- PROCEDURE 3: Vận hành Phân hệ Lập hóa đơn xuất toán tài chính [cite: 160]
CREATE PROCEDURE sp_LapHoaDon
    @MaDH CHAR(5),
    @MaNV CHAR(5),
    @HinhThucThanhToan NVARCHAR(50),
    @TrangThaiThanhToan NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @TongTienSauGiam DECIMAL(19, 3);
        SELECT @TongTienSauGiam = TongTienSauGiam FROM DON_HANG WHERE MaDH = @MaDH;

        DECLARE @NewMaHD CHAR(5);
        INSERT INTO HOA_DON (NgayLap, HinhThucThanhToan, TongTienGiamGia, TongTienThanhToan, TrangThaiThanhToan, MaNV, MaDH)
        VALUES (GETDATE(), @HinhThucThanhToan, 0, @TongTienSauGiam, @TrangThaiThanhToan, @MaNV, @MaDH);

        SELECT @NewMaHD = MaHD FROM HOA_DON WHERE MaHD = (SELECT 'HD' + RIGHT('000' + CAST(MAX(CAST(SUBSTRING(MaHD, 3, 3) AS INT)) AS VARCHAR(3)), 3) FROM HOA_DON);

        IF @TrangThaiThanhToan = N'Chưa thanh toán'
        BEGIN
            INSERT INTO CONG_NO (HanThanhToan, NgayGhiNhan, SoTienDaTra, TongNo, SoDuCN, TrangThaiCN, MaHD)
            VALUES (DATEADD(day, 30, GETDATE()), GETDATE(), 0, @TongTienSauGiam, @TongTienSauGiam, N'Còn nợ', @NewMaHD);
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrMs NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMs, 16, 1);
    END CATCH
END;
GO

-- VII. TẬP DỮ LIỆU MẪU 

-- Bảng Loại SP

INSERT INTO LOAI_SAN_PHAM (MaLoaiSP, TenLoaiSP) VALUES 
('CFX', N'Cà phê rang xay'),
('CFH', N'Cà phê rang hạt'),
('CFT', N'Cà phê thô'),
('MOR', N'Mật ong rừng'),
('MPH', N'Máy pha'),
('BBI', N'Bao bì & Vật tư tiêu hao');

-- Bảng Sản Phẩm
INSERT INTO SAN_PHAM (MaSP, TenSP, DonViTinh, TrongLuong, GiaBan, SoLuongTon, SoLuongKD, MaLoaiSP) VALUES 
('CFH31', N'Cà phê ĐẬM MẠNH (1kg - HẠT)', N'Kg', 1.00, 395000, 150, 140, 'CFH'),
('CFH35', N'Cà phê ĐẬM MẠNH (500gr - HẠT)', N'Kg', 0.50, 197500, 200, 190, 'CFH'),
('CFH32', N'Cà phê ĐẬM MẠNH (200gr - HẠT)', N'Kg', 0.20, 79000, 300, 290, 'CFH'),
('CFH41', N'Cà phê ĐẬM NGỌT (1kg - HẠT)', N'Kg', 1.00, 495000, 100, 95, 'CFH'),
('CFH45', N'Cà phê ĐẬM NGỌT (500gr - HẠT)', N'Kg', 0.50, 247500, 150, 145, 'CFH'),
('CFH42', N'Cà phê ĐẬM NGỌT (200gr - HẠT)', N'Kg', 0.20, 99000, 250, 240, 'CFH'),
('CFH71', N'Cà phê CÂN BẰNG (1kg - HẠT)', N'Kg', 1.00, 645000, 80, 75, 'CFH'),
('CFH75', N'Cà phê CÂN BẰNG (500gr - HẠT)', N'Kg', 0.50, 322500, 120, 115, 'CFH'),
('CFH72', N'Cà phê CÂN BẰNG (200gr - HẠT)', N'Kg', 0.20, 129000, 180, 170, 'CFH'),
('CFH81', N'Cà phê THƠM NGỌT (1kg - HẠT)', N'Kg', 1.00, 995000, 50, 45, 'CFH'),
('CFH85', N'Cà phê THƠM NGỌT (500gr - HẠT)', N'Kg', 0.50, 497500, 70, 65, 'CFH'),
('CFH82', N'Cà phê THƠM NGỌT (200gr - HẠT)', N'Kg', 0.20, 199000, 100, 95, 'CFH'),
('CFX31', N'Cà phê ĐẬM MẠNH (1kg - XAY)', N'Kg', 1.00, 395000, 120, 110, 'CFX'),
('CFX35', N'Cà phê ĐẬM MẠNH (500gr - XAY)', N'Kg', 0.50, 197500, 180, 175, 'CFX'),
('CFX32', N'Cà phê ĐẬM MẠNH (200gr - XAY)', N'Kg', 0.20, 79000, 250, 240, 'CFX'),
('CFX41', N'Cà phê ĐẬM NGỌT (1kg - XAY)', N'Kg', 1.00, 495000, 90, 85, 'CFX'),
('CFX45', N'Cà phê ĐẬM NGỌT (500gr - XAY)', N'Kg', 0.50, 247500, 140, 135, 'CFX'),
('CFX42', N'Cà phê ĐẬM NGỌT (200gr - XAY)', N'Kg', 0.20, 99000, 200, 190, 'CFX'),
('CFX71', N'Cà phê CÂN BẰNG (1kg - XAY)', N'Kg', 1.00, 645000, 70, 65, 'CFX'),
('CFX75', N'Cà phê CÂN BẰNG (500gr - XAY)', N'Kg', 0.50, 322500, 110, 105, 'CFX'),
('CFX72', N'Cà phê CÂN BẰNG (200gr - XAY)', N'Kg', 0.20, 129000, 160, 155, 'CFX'),
('CFX81', N'Cà phê THƠM NGỌT (1kg - XAY)', N'Kg', 1.00, 995000, 40, 35, 'CFX'),
('CFX85', N'Cà phê THƠM NGỌT (500gr - XAY)', N'Kg', 0.50, 497500, 60, 55, 'CFX'),
('CFX82', N'Cà phê THƠM NGỌT (200gr - XAY)', N'Kg', 0.20, 199000, 90, 85, 'CFX'),
('MPTD9', N'JAVI PRO TD 4.9', N'Máy', NULL, 49600000, 5, 4, 'MPH'),
('MPM30', N'JAVI M30', N'Máy', NULL, 279000000, 2, 1, 'MPH'),
('MPST8', N'JAVI PRO S4.99', N'Máy', NULL, 89000000, 3, 3, 'MPH'),
('MPI49', N'JAVI PRO I4.9', N'Máy', NULL, 59800000, 4, 3, 'MPH'),
('MPF05', N'JAVI PRO 2F05', N'Máy', NULL, 19900000, 10, 8, 'MPH'),
('NVCFT', N'Cà phê Robusta Thô', N'Kg', 1.00, 65000, 1000, 1000, 'CFT'),
('NVMOR', N'Mật ong rừng nguyên chất', N'Lít', 1.00, 150000, 100, 95, 'MOR'),
('BBI01', N'Ly nhựa PP 500ml', N'Cái', NULL, 1500, 5000, 5000, 'BBI'),
('BBI02', N'Ly giấy 250ml', N'Cái', NULL, 2000, 4000, 4000, 'BBI'),
('BBI03', N'Nắp cầu nhựa 500ml', N'Cái', NULL, 300, 5000, 5000, 'BBI'),
('BBI05', N'Hộp quà tặng cứng', N'Hộp', NULL, 15000, 500, 480, 'BBI'),
('BBI06', N'Túi tote họa tiết', N'Cái', NULL, 25000, 300, 290, 'BBI');

-- Bảng nhà cung cấp
INSERT INTO NHA_CUNG_CAP (TenNCC, SoDTNCC, EmailNCC, DiaChiNCC, GhiChu) VALUES 
(N'Nông trại Cà phê Javi Đà Lạt', '02633111222', 'dalat@javi.com', N'Xuân Thọ, TP. Đà Lạt', N'Cung cấp cà phê Arabica nhân thô'),
(N'Hợp tác xã Cà phê Cư M''gar', '02623444555', 'cumgar@coffee.vn', N'Huyện Cư M''gar, Đắk Lắk', N'Nguồn Robusta thô chủ lực'),
(N'Tổng công ty Bao bì Tín Phát', '02838999888', 'contact@tinphatpack.com', N'KCN Tân Bình, TP. HCM', N'Cung cấp cốc ly và bao bì túi giấy'),
(N'Mật ong rừng Tây Nguyên Group', '0918223344', 'taynguyenhoney@gmail.com', N'Gia Nghĩa, Đắk Nông', N'Mật ong thô tự nhiên'),
(N'Nhà phân phối Máy pha Javi Toàn Cầu', '02839991111', 'machinery@javi.vn', N'Quận 7, TP. HCM', N'Nhập khẩu máy pha chính hãng'),
(N'Cơ sở Nông sản sạch Lâm Đồng', '0905123456', 'lamdongclean@gmail.com', N'Bảo Lộc, Lâm Đồng', N'Cà phê thô và mật ong secondary'),
(N'Nhà in Bao Bì Xanh', '0988224466', 'inbox@baobixanh.vn', N'Bình Chánh, TP. HCM', N'In túi tote quà tặng'),
(N'Nông trại Robusta Buôn Ma Thuột', '02623888999', 'bmt@robustafarm.vn', N'TP. Buôn Ma Thuột', N'Hạt Robusta sàng 18 chất lượng cao'),
(N'Công ty Thiết bị Cơ điện Hoàng Long', '02437776666', 'hoanglong@me.com', N'Thanh Xuân, Hà Nội', N'Linh kiện máy pha thay thế'),
(N'Hợp tác xã Mật Ong Gia Lai', '02693555666', 'gialai@honeyhtx.com', N'Chư Prông, Gia Lai', N'Mật ong hoa cà phê'),
(N'Tổng kho Vật tư Cà phê Sài Gòn', '0933445566', 'kho@vattucafe.vn', N'Quận 12, TP. HCM', N'Ống hút, màng bọc, muỗng nhựa'),
(N'Nông sản Hữu cơ Đắk Mil', '0944001122', 'dakmil@organic.vn', N'Đắk Mil, Đắk Nông', N'Cà phê Cherry đặc sản thô'),
(N'Công ty TNHH Nhựa Đại Đồng Tiến', '02838555444', 'sales@daidongtien.com.vn', N'Quận 5, TP. HCM', N'Khay nhựa phụ trợ kho'),
(N'Xưởng Gỗ Quà Tặng Việt', '0902888999', 'xuonggo@quatang.vn', N'Thuận An, Bình Dương', N'Gia công hộp quà gỗ đựng cà phê'),
(N'Đại lý Cà phê Cầu Đất', '0912999000', 'caudat@farm.vn', N'Cầu Đất, TP. Đà Lạt', N'Arabica Cầu Đất thô cao cấp'),
(N'Công ty Tem Nhãn Toàn Diện', '0908776655', 'temnhan@tdpack.com', N'Tân Phú, TP. HCM', N'Decal cuộn dán bao bì'),
(N'Hợp tác xã Nông nghiệp Sơn La', '02123855855', 'sonla@cafe.vn', N'Mai Sơn, Sơn La', N'Arabica vùng cao phía Bắc'),
(N'Nhà phân phối Ly giấy ECO', '0938112233', 'eco@lygiay.vn', N'Thủ Đức, TP. HCM', N'Ly giấy thân thiện môi trường'),
(N'Cơ khí Chế tạo Máy rang Javi Tech', '02837334455', 'tech@javi.vn', N'Khu công nghệ cao, Q9', N'Thiết bị bảo trì dây chuyền xay'),
(N'Vật tư nông nghiệp Tây Nguyên', '02623777888', 'vattutn@gmail.com', N'Ea Kar, Đắk Lắk', N'Bao tải đay lưu kho thô');

-- Bảng loại khách hàng
INSERT INTO LOAI_KHACH_HANG (MaLoaiKH, TenLoaiKH, TyLeChietKhau) VALUES 
('L01', N'Khách lẻ', 0.0000),
('S01', N'Khách sỉ', 0.0500),
('V01', N'Khách VIP', 0.1000);

-- Bảng nhân viên

INSERT INTO NHAN_VIEN (HoTenNV, CCCD, GioiTinh, ChucVu, SoDTNV, EmailNV, DiaChiNV) VALUES 
(N'Lê Văn Phát', '123456789001', N'Nam', N'Quản lý', '0901234567', 'phat.le@javi.vn', N'11 Trương Định, Q3'),
(N'Phạm Thị Linh', '123456789002', N'Nữ', N'Bán hàng', '0907654321', 'linh.pham@javi.vn', N'25 Trần Hưng Đạo, Q1'),
(N'Nguyễn Hoàng Sơn', '123456789003', N'Nam', N'Kế toán', '0912345678', 'son.nguyen@javi.vn', N'78 Nguyễn Huệ, Q1'),
(N'Trần Thu Hiền', '123456789004', N'Nữ', N'Kho', '0987654321', 'hien.tran@javi.vn', N'99 Lý Thường Kiệt, TB'),
(N'Vũ Đình Khang', '123456789005', N'Nam', N'Bán hàng', '0977889900', 'khang.vu@javi.vn', N'12 Huỳnh Tấn Phát, Q7'),
(N'Lý Hoàng Nam', '123456789006', N'Nam', N'Kho', '0901010101', 'nam.ly@javi.vn', N'200 Cộng Hòa, TB'),
(N'Võ Thị Thanh Thảo', '123456789007', N'Nữ', N'Bán hàng', '0919445566', 'thao.vo@javi.vn', N'33 Hai Bà Trưng, Q1'),
(N'Đỗ Minh Quân', '123456789008', N'Nam', N'Kế toán', '0911223344', 'quan.do@javi.vn', N'88 Phạm Văn Đồng, Thủ Đức'),
(N'Mai Văn Đức', '123456789009', N'Nam', N'Quản lý', '0909112233', 'duc.mai@javi.vn', N'50 Đinh Tiên Hoàng, BT'),
(N'Cao Minh Trí', '123456789010', N'Nam', N'Quản lý', '0988776655', 'tri.cao@javi.vn', N'45 Nam Kỳ Khởi Nghĩa, Q3'),
(N'Nguyễn Thị Kim', '123456789011', N'Nữ', N'Bán hàng', '0901000111', 'kim@javi.vn', N'Q4, HCM'),
(N'Trần Anh Tuấn', '123456789012', N'Nam', N'Kho', '0901000222', 'tuan@javi.vn', N'Gò Vấp, HCM'),
(N'Lê Ngọc Hân', '123456789013', N'Nữ', N'Kế toán', '0901000333', 'han@javi.vn', N'Q5, HCM'),
(N'Phan Bửu Long', '123456789014', N'Nam', N'Bán hàng', '0901000444', 'long@javi.vn', N'Q8, HCM'),
(N'Đặng Thu Hà', '123456789015', N'Nữ', N'Bán hàng', '0901000555', 'ha@javi.vn', N'Q11, HCM'),
(N'Hồ Bảo Trâm', '123456789016', N'Nữ', N'Kho', '0901000666', 'tram@javi.vn', N'Phú Nhuận, HCM'),
(N'Ngô Gia Bảo', '123456789017', N'Nam', N'Bán hàng', '0901000777', 'bao@javi.vn', N'Bình Chánh, HCM'),
(N'Bùi Vĩnh Phát', '123456789018', N'Nam', N'Quản lý', '0901000888', 'phatb@javi.vn', N'Hóc Môn, HCM'),
(N'Đỗ Thanh Bình', '123456789019', N'Nữ', N'Bán hàng', '0901000999', 'binh@javi.vn', N'Nhà Bè, HCM'),
(N'Lưu Tiến Dũng', '123456789020', N'Nam', N'Kế toán', '0901001000', 'dung@javi.vn', N'Q1, HCM');

-- Bảng khách hàng 

INSERT INTO KHACH_HANG (TenKH, SoDTKH, EmailKH, GioiTinhKH, DiaChiKH, MaLoaiKH) VALUES 
(N'Nguyễn Thanh Tùng', '0903111001', 'tung.nt@gmail.com', N'Nam', N'20 Phan Xích Long, PN', 'L01'),
(N'Lê Thị Hương Giang', '0903111002', 'giang.le@gmail.com', N'Nữ', N'55 Lê Lợi, Q1', 'L01'),
(N'Trần Đình Khôi', '0903111003', 'khoi.tr@gmail.com', N'Nam', N'1A Nguyễn Văn Cừ, Q5', 'S01'),
(N'Phan Văn Tài', '0903111004', 'tai.p@gmail.com', N'Nam', N'100 Hoàng Văn Thụ, TB', 'L01'),
(N'Đỗ Thanh Mai', '0903111005', 'mai.do@gmail.com', N'Nữ', N'300 CMT8, Q10', 'L01'),
(N'Hoàng Anh Thư', '0903111006', 'thu.h@gmail.com', N'Nữ', N'45 Bùi Thị Xuân, Q1', 'L01'),
(N'Võ Trung Kiên', '0903111007', 'kien.vo@gmail.com', N'Nam', N'15 Nguyễn Chí Thanh, Q5', 'S01'),
(N'Ngô Tấn Lộc', '0903111008', 'loc.ngo@gmail.com', N'Nam', N'77 Lê Quang Định, BT', 'L01'),
(N'Bùi Thị Ngọc', '0903111009', 'ngoc.b@gmail.com', N'Nữ', N'22 Sư Vạn Hạnh, Q10', 'L01'),
(N'Dương Chí Dũng', '0903111010', 'dung.d@gmail.com', N'Nam', N'90 Hậu Giang, Q6', 'S01'),
(N'Phạm Minh Triết', '0903111011', 'triet.pham@gmail.com', N'Nam', N'Quận 7, HCM', 'L01'),
(N'Vũ Hoàng Trọng', '0903111012', 'trong.vu@gmail.com', N'Nam', N'Quận 8, HCM', 'S01'),
(N'Trần Kim Tuyến', '0903111013', 'tuyen.tran@gmail.com', N'Nữ', N'Quận 9, HCM', 'L01'),
(N'Nguyễn Thúy Vân', '0903111014', 'van.nguyen@gmail.com', N'Nữ', N'Quận 10, HCM', 'L01'),
(N'Đặng Quốc Hải', '0903111015', 'hai.dang@gmail.com', N'Nam', N'Quận 11, HCM', 'S01'),
(N'Trịnh Đăng Khoa', '0903111016', 'khoa.trinh@gmail.com', N'Nam', N'Quận 12, HCM', 'L01'),
(N'Đỗ Diễm My', '0903111017', 'my.do@gmail.com', N'Nữ', N'Bình Chánh, HCM', 'S01'),
(N'Vũ Kim Liên', '0903111018', 'lien.vu@gmail.com', N'Nữ', N'Nhà Bè, HCM', 'L01'),
(N'Võ Hoàng Hùng', '0903111019', 'hung.vo@gmail.com', N'Nam', N'Hóc Môn, HCM', 'L01'),
(N'Phan Văn Giang', '0903111020', 'giang.phan@gmail.com', N'Nam', N'Cần Giờ, HCM', 'S01');

-- Bảng tài khoản

INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, MaNV) VALUES 
('admin_phat', 'javi123', 'NV001'),
('linh.pham', 'sale123', 'NV002'),
('son.nguyen', 'ketoan123', 'NV003'),
('hien.tran', 'kho123', 'NV004'),
('sale_khang', '123', 'NV005'),
('kho_nam', '123', 'NV006'),
('sale_thao', '123', 'NV007'),
('ketoan_quan', '123', 'NV008'),
('admin_duc', '123', 'NV009'),
('admin_tri', '123', 'NV010');

-- Bảng Phiếu nhập

INSERT INTO PHIEU_NHAP (NgayNhap, SoHoaDonNCC, TongTienNhap, SoTienDaTraNCC, TrangThaiThanhToan, GhiChu, MaNV, MaNCC) VALUES 
('2026-03-01 08:30:00', 'HDNCC-001', 65000000, 65000000, N'Đã thanh toán', N'Nhập Robusta thô đầu tháng', 'NV004', 'NCC02'),
('2026-03-02 09:15:00', 'HDNCC-002', 39500000, 39500000, N'Đã thanh toán', N'Nhập Arabica Đà Lạt', 'NV004', 'NCC01'),
('2026-03-05 14:00:00', 'HDNCC-003', 7500000, 7500000, N'Đã thanh toán', N'Nhập ly nhựa PP', 'NV006', 'NCC03'),
('2026-03-07 10:30:00', 'HDNCC-004', 15000000, 15000000, N'Đã thanh toán', N'Nhập mật ong rừng thô', 'NV006', 'NCC04'),
('2026-03-10 11:00:00', 'HDNCC-005', 248000000, 248000000, N'Đã thanh toán', N'Lô máy pha cao cấp Javi', 'NV004', 'NCC05'),
('2026-03-12 15:30:00', 'HDNCC-006', 8000000, 8000000, N'Đã thanh toán', N'Túi tote quà tặng', 'NV012', 'NCC07'),
('2026-03-15 09:00:00', 'HDNCC-007', 3000000, 3000000, N'Đã thanh toán', N'Tem nhãn decal dán bao bì', 'NV012', 'NCC16'),
('2026-03-18 16:20:00', 'HDNCC-008', 45000000, 45000000, N'Đã thanh toán', N'Nhập thêm Robusta BMT sàng 18', 'NV016', 'NCC08'),
('2026-03-20 13:45:00', 'HDNCC-009', 6000000, 0, N'Chưa thanh toán', N'Ly giấy thân thiện môi trường', 'NV016', 'NCC18'),
('2026-03-22 10:00:00', 'HDNCC-010', 12000000, 12000000, N'Đã thanh toán', N'Mật ong hoa cà phê Gia Lai', 'NV004', 'NCC10'),
('2026-03-25 14:10:00', 'HDNCC-011', 19750000, 19750000, N'Đã thanh toán', N'Cà phê Arabica thô Sơn La', 'NV006', 'NCC17'),
('2026-03-28 11:30:00', 'HDNCC-012', 4000000, 4000000, N'Đã thanh toán', N'Hộp quà tặng cứng cao cấp', 'NV006', 'NCC14'),
('2026-04-01 09:00:00', 'HDNCC-013', 32500000, 32500000, N'Đã thanh toán', N'Nhập Robusta thô đợt 2', 'NV004', 'NCC02'),
('2026-04-03 10:30:00', 'HDNCC-014', 15000000, 15000000, N'Đã thanh toán', N'Nhập bổ sung túi và phụ trợ', 'NV012', 'NCC11'),
('2026-04-05 13:00:00', 'HDNCC-015', 59800000, 59800000, N'Đã thanh toán', N'Nhập máy pha I4.9 phục vụ dự án', 'NV016', 'NCC05'),
('2026-04-08 14:45:00', 'HDNCC-016', 7500000, 0, N'Chưa thanh toán', N'Hộp quà tặng bổ sung', 'NV004', 'NCC14'),
('2026-04-10 16:00:00', 'HDNCC-017', 22500000, 22500000, N'Đã thanh toán', N'Hạt cà phê Đắk Mil hữu cơ', 'NV006', 'NCC12'),
('2026-04-12 09:15:00', 'HDNCC-018', 4500000, 4500000, N'Đã thanh toán', N'Bao tải đay lưu trữ thô', 'NV012', 'NCC20'),
('2026-04-15 11:00:00', 'HDNCC-019', 19750000, 19750000, N'Đã thanh toán', N'Nhập Arabica Cầu Đất', 'NV016', 'NCC15'),
('2026-04-18 15:20:00', 'HDNCC-020', 3000000, 3000000, N'Đã thanh toán', N'Khay nhựa phụ trợ bổ sung', 'NV004', 'NCC13');

-- Bảng chi tiết phiếu nhập

INSERT INTO CT_PHIEU_NHAP (MaPN, MaSP, SoLuong, GiaNhap) VALUES 
('PN001', 'NVCFT', 1000, 65000),
('PN002', 'CFH31', 100, 395000),
('PN003', 'BBI01', 5000, 1500),
('PN004', 'NVMOR', 100, 150000),
('PN005', 'MPM30', 1, 248000000),
('PN006', 'BBI06', 320, 25000),
('PN007', 'BBI03', 10000, 300),
('PN008', 'NVCFT', 692, 65000),
('PN009', 'BBI02', 3000, 2000),
('PN010', 'NVMOR', 80, 150000),
('PN011', 'NVCFT', 303, 65000),
('PN012', 'BBI05', 266, 15000),
('PN013', 'NVCFT', 500, 65000),
('PN014', 'BBI01', 10000, 1500),
('PN015', 'MPI49', 1, 59800000),
('PN016', 'BBI05', 500, 15000),
('PN017', 'NVCFT', 346, 65000),
('PN018', 'BBI01', 3000, 1500),
('PN019', 'CFH31', 50, 395000),
('PN020', 'BBI01', 2000, 1500);

-- Bảng Phiếu chi

INSERT INTO PHIEU_CHI (NgayChi, SoTienThucChi, HinhThucThanhToan, GhiChu, MaPN, MaNV) VALUES 
('2026-03-01 10:00:00', 65000000, N'Chuyển khoản', N'Thanh toán dứt điểm lô hàng Robusta thô', 'PN001', 'NV003'),
('2026-03-02 11:30:00', 39500000, N'Chuyển khoản', N'Tất toán toàn bộ tiền Arabica Đà Lạt', 'PN002', 'NV003'),
('2026-03-05 15:00:00', 7500000, N'Tiền mặt', N'Thanh toán tiền ly nhựa PP', 'PN003', 'NV008'),
('2026-03-07 16:30:00', 15000000, N'Tiền mặt', N'Thanh toán tiền mật ong rừng thô', 'PN004', 'NV020'),
('2026-03-10 13:00:00', 248000000, N'Chuyển khoản', N'Thanh toán lô máy pha Javi chính hãng', 'PN005', 'NV013'),
('2026-03-12 16:00:00', 8000000, N'Tiền mặt', N'Chi tiền nhập túi tote quà tặng', 'PN006', 'NV013'),
('2026-03-15 10:15:00', 3000000, N'Tiền mặt', N'Thanh toán tem nhãn bao bì', 'PN007', 'NV020'),
('2026-03-18 17:00:00', 45000000, N'Chuyển khoản', N'Thanh toán tiền Robusta BMT', 'PN008', 'NV020'),
('2026-03-22 11:00:00', 12000000, N'Chuyển khoản', N'Thanh toán tiền mật ong Gia Lai', 'PN010', 'NV003'),
('2026-03-25 15:30:00', 19750000, N'Chuyển khoản', N'Thanh toán tiền Arabica Sơn La thô', 'PN011', 'NV008'),
('2026-03-28 13:00:00', 4000000, N'Tiền mặt', N'Thanh toán tiền hộp quà tặng cứng', 'PN012', 'NV013'),
('2026-04-01 10:30:00', 32500000, N'Chuyển khoản', N'Thanh toán tiền Robusta thô đợt 2', 'PN013', 'NV003'),
('2026-04-03 14:00:00', 15000000, N'Tiền mặt', N'Thanh toán tiền vật tư túi giấy', 'PN014', 'NV008'),
('2026-04-05 15:00:00', 59800000, N'Chuyển khoản', N'Thanh toán máy pha I4.9 dự án', 'PN015', 'NV013'),
('2026-04-10 16:30:00', 22500000, N'Chuyển khoản', N'Thanh toán hạt cà phê Đắk Mil hữu cơ', 'PN017', 'NV020'),
('2026-04-12 10:00:00', 4500000, N'Tiền mặt', N'Thanh toán tiền mua bao tải đay', 'PN018', 'NV003'),
('2026-04-15 13:30:00', 19750000, N'Chuyển khoản', N'Thanh toán dứt điểm lô Arabica Cầu Đất thô', 'PN019', 'NV008'),
('2026-04-18 16:00:00', 3000000, N'Tiền mặt', N'Thanh toán tiền khay nhựa phụ trợ kho', 'PN020', 'NV013'),
('2026-04-22 09:30:00', 3000000, N'Tiền mặt', N'Chi tiền sửa chữa máy móc kho bảo trì', 'PN002', 'NV003'),
('2026-04-25 11:15:00', 6000000, N'Chuyển khoản', N'Tất toán lô tiền nợ ly giấy ECO', 'PN009', 'NV008');

-- Bảng đơn hàng

INSERT INTO DON_HANG (NgayDat, TongTienDonHang, TongGiamGiaSP, TongTienSauGiam, TrangThaiDonHang, MaNV, MaKH) VALUES 
('2026-04-01', 500000, 50000, 450000, N'Chờ giao', 'NV002', 'KH001'),
('2026-04-02', 49600000, 1000000, 48600000, N'Chờ giao', 'NV002', 'KH003'),
('2026-04-03', 1000000, 0, 1000000, N'Chờ giao', 'NV005', 'KH002'),
('2026-04-04', 150000, 0, 150000, N'Chờ giao', 'NV005', 'KH004'),
('2026-04-05', 800000, 40000, 760000, N'Chờ giao', 'NV007', 'KH005'),
('2026-04-06', 200000, 0, 200000, N'Chờ giao', 'NV007', 'KH006'),
('2026-04-07', 279000000, 5000000, 274000000, N'Chờ giao', 'NV002', 'KH007'),
('2026-04-08', 500000, 0, 500000, N'Chờ giao', 'NV011', 'KH008'),
('2026-04-09', 300000, 0, 300000, N'Chờ giao', 'NV011', 'KH009'),
('2026-04-10', 1200000, 60000, 1140000, N'Chờ giao', 'NV002', 'KH010'),
('2026-04-11', 400000, 0, 400000, N'Chờ giao', 'NV014', 'KH011'),
('2026-04-12', 650000, 0, 650000, N'Chờ giao', 'NV014', 'KH012'),
('2026-04-13', 1500000, 100000, 1400000, N'Chờ giao', 'NV005', 'KH013'),
('2026-04-14', 900000, 0, 900000, N'Chờ giao', 'NV007', 'KH014'),
('2026-04-15', 50000000, 2000000, 48000000, N'Chờ giao', 'NV002', 'KH015'),
('2026-04-16', 300000, 0, 300000, N'Chờ giao', 'NV011', 'KH016'),
('2026-04-17', 2500000, 125000, 2375000, N'Chờ giao', 'NV015', 'KH017'),
('2026-04-18', 100000, 0, 100000, N'Chờ giao', 'NV015', 'KH018'),
('2026-04-19', 450000, 0, 450000, N'Chờ giao', 'NV017', 'KH019'),
('2026-04-20', 89000000, 1000000, 88000000, N'Chờ giao', 'NV002', 'KH020');

-- Bảng chi tiết đơn hàng

INSERT INTO CT_DON_HANG (MaDH, MaSP, SoLuong, GiamGiaSP) VALUES 
('DH001', 'CFH31', 1, 0.1000),
('DH002', 'MPTD9', 1, 0.0202),
('DH003', 'CFH32', 12, 0.0000),
('DH004', 'NVCFT', 1, 0.0000),
('DH005', 'CFH31', 2, 0.0500),
('DH006', 'CFH35', 1, 0.0000),
('DH007', 'MPM30', 1, 0.0179),
('DH008', 'CFH31', 1, 0.0000),
('DH009', 'CFH35', 1, 0.0000),
('DH010', 'CFH31', 1, 0.0500),
('DH011', 'BBI01', 100, 0.0000),
('DH012', 'BBI01', 50, 0.0000),
('DH013', 'CFH31', 2, 0.0667),
('DH014', 'CFH35', 3, 0.0000),
('DH015', 'MPTD9', 1, 0.0400),
('DH016', 'NVCFT', 5, 0.0000),
('DH017', 'CFH31', 10, 0.0500),
('DH018', 'BBI01', 50, 0.0000),
('DH019', 'CFH31', 1, 0.0000),
('DH020', 'MPTD9', 1, 0.0112);

-- Bảng hóa đơn 

INSERT INTO HOA_DON (NgayLap, HinhThucThanhToan, TongTienGiamGia, TongTienThanhToan, TrangThaiThanhToan, MaNV, MaDH) VALUES 
('2026-04-01', N'Tiền mặt', 50000, 450000, N'Đã thanh toán', 'NV003', 'DH001'),
('2026-04-02', N'Chuyển khoản', 1000000, 48600000, N'Chưa thanh toán', 'NV003', 'DH002'),
('2026-04-03', N'Tiền mặt', 0, 1000000, N'Đã thanh toán', 'NV003', 'DH003'),
('2026-04-04', N'Tiền mặt', 0, 150000, N'Đã thanh toán', 'NV008', 'DH004'),
('2026-04-05', N'Chuyển khoản', 40000, 760000, N'Đã thanh toán', 'NV008', 'DH005'),
('2026-04-06', N'Chuyển khoản', 0, 200000, N'Chưa thanh toán', 'NV013', 'DH006'),
('2026-04-07', N'Chuyển khoản', 5000000, 274000000, N'Đã thanh toán', 'NV013', 'DH007'),
('2026-04-08', N'Tiền mặt', 0, 500000, N'Đã thanh toán', 'NV020', 'DH008'),
('2026-04-09', N'Tiền mặt', 0, 300000, N'Chưa thanh toán', 'NV020', 'DH009'),
('2026-04-10', N'Chuyển khoản', 60000, 1140000, N'Đã thanh toán', 'NV003', 'DH010'),
('2026-04-11', N'Tiền mặt', 0, 400000, N'Đã thanh toán', 'NV003', 'DH011'),
('2026-04-12', N'Chuyển khoản', 0, 650000, N'Đã thanh toán', 'NV008', 'DH012'),
('2026-04-13', N'Chuyển khoản', 100000, 1400000, N'Chưa thanh toán', 'NV008', 'DH013'),
('2026-04-14', N'Tiền mặt', 0, 900000, N'Đã thanh toán', 'NV013', 'DH014'),
('2026-04-15', N'Chuyển khoản', 2000000, 48000000, N'Chưa thanh toán', 'NV013', 'DH015'),
('2026-04-16', N'Tiền mặt', 0, 300000, N'Đã thanh toán', 'NV020', 'DH016'),
('2026-04-17', N'Chuyển khoản', 125000, 2375000, N'Đã thanh toán', 'NV020', 'DH017'),
('2026-04-18', N'Tiền mặt', 0, 100000, N'Đã thanh toán', 'NV003', 'DH018'),
('2026-04-19', N'Chuyển khoản', 0, 450000, N'Đã thanh toán', 'NV003', 'DH019'),
('2026-04-20', N'Chuyển khoản', 1000000, 88000000, N'Chưa thanh toán', 'NV008', 'DH020');

-- Bảng Phiếu xuất

INSERT INTO PHIEU_XUAT (NgayXuat, TrangThaiGiaoHang, MaNV, MaDH) VALUES 
('2026-04-01', N'Đã giao hàng', 'NV004', 'DH001'),
('2026-04-02', N'Đã giao hàng', 'NV004', 'DH002'),
('2026-04-03', N'Đã giao hàng', 'NV006', 'DH003'),
('2026-04-04', N'Đã giao hàng', 'NV006', 'DH004'),
('2026-04-05', N'Đã giao hàng', 'NV012', 'DH005'),
('2026-04-06', N'Đã giao hàng', 'NV012', 'DH006'),
('2026-04-07', N'Đã giao hàng', 'NV016', 'DH007'),
('2026-04-08', N'Đã giao hàng', 'NV016', 'DH008'),
('2026-04-09', N'Đã giao hàng', 'NV004', 'DH009'),
('2026-04-10', N'Đã giao hàng', 'NV006', 'DH010'),
('2026-04-11', N'Đã giao hàng', 'NV012', 'DH011'),
('2026-04-12', N'Đã giao hàng', 'NV016', 'DH012'),
('2026-04-13', N'Đã giao hàng', 'NV004', 'DH013'),
('2026-04-14', N'Đã giao hàng', 'NV006', 'DH014'),
('2026-04-15', N'Đã giao hàng', 'NV012', 'DH015'),
('2026-04-16', N'Đã giao hàng', 'NV016', 'DH016'),
('2026-04-17', N'Đã giao hàng', 'NV004', 'DH017'),
('2026-04-18', N'Đã giao hàng', 'NV006', 'DH018'),
('2026-04-19', N'Đã giao hàng', 'NV012', 'DH019'),
('2026-04-20', N'Đã giao hàng', 'NV016', 'DH020');

-- Bảng Công nợ

INSERT INTO CONG_NO (HanThanhToan, NgayGhiNhan, SoTienDaTra, TongNo, SoDuCN, TrangThaiCN, MaHD) VALUES 
('2026-05-02', '2026-04-02', 0, 48600000, 48600000, N'Còn nợ', 'HD002'),
('2026-05-15', '2026-04-15', 0, 48000000, 48000000, N'Còn nợ', 'HD015'),
('2026-05-20', '2026-04-20', 0, 88000000, 88000000, N'Còn nợ', 'HD020'),
('2026-05-01', '2026-04-01', 0, 450000,    450000,    N'Còn nợ', 'HD001'),
('2026-05-05', '2026-04-05', 0, 760000,    760000,    N'Còn nợ', 'HD005'),
('2026-05-03', '2026-04-03', 0, 1000000,   1000000,   N'Còn nợ', 'HD003'),
('2026-05-12', '2026-04-12', 0, 650000,    650000,    N'Còn nợ', 'HD012'),
('2026-05-17', '2026-04-17', 0, 2375000,   2375000,   N'Còn nợ', 'HD017'),
('2026-05-19', '2026-04-19', 0, 450000,    450000,    N'Còn nợ', 'HD019'),
('2026-05-10', '2026-04-10', 0, 1140000,   1140000,   N'Còn nợ', 'HD010'),
('2026-05-06', '2026-04-06', 0, 200000,    200000,    N'Còn nợ', 'HD006'),
('2026-05-07', '2026-04-07', 0, 274000000, 274000000, N'Còn nợ', 'HD007'),
('2026-05-08', '2026-04-08', 0, 500000,    500000,    N'Còn nợ', 'HD008'),
('2026-05-09', '2026-04-09', 0, 300000,    300000,    N'Còn nợ', 'HD009'),
('2026-05-11', '2026-04-11', 0, 400000,    400000,    N'Còn nợ', 'HD011'),
('2026-05-13', '2026-04-13', 0, 1400000,   1400000,   N'Còn nợ', 'HD013'),
('2026-05-14', '2026-04-14', 0, 900000,    900000,    N'Còn nợ', 'HD014'),
('2026-05-16', '2026-04-16', 0, 300000,    300000,    N'Còn nợ', 'HD016'),
('2026-05-18', '2026-04-18', 0, 100000,    100000,    N'Còn nợ', 'HD018'),
('2026-05-25', '2026-04-25', 0, 1140000,   1140000,   N'Còn nợ', 'HD010');
GO

-- Bảng Phiếu thu

INSERT INTO PHIEU_THU (NgayThu, SoTienThucThu, HinhThucThanhToan, GhiChu, MaCN, MaNV) VALUES 
('2026-04-01 09:00:00', 450000,    N'Tiền mặt',    N'Thu hồi công nợ trực tiếp khi giao đơn HD001', 'CN004', 'NV003'),
('2026-04-05 10:30:00', 20000000,  N'Chuyển khoản', N'Thu tiền nợ đợt 1 hợp đồng đơn máy pha HD002', 'CN001', 'NV003'),
('2026-04-07 14:15:00', 1000000,   N'Tiền mặt',    N'Thu nợ dứt điểm đơn hàng hạt sỉ HD003',       'CN006', 'NV008'),
('2026-04-10 11:00:00', 1140000,   N'Chuyển khoản', N'Thu hồi công nợ hóa đơn hạt xay HD010',       'CN010', 'NV020'),
('2026-04-12 15:30:00', 650000,    N'Chuyển khoản', N'Thu hồi nợ thanh toán vật tư tiêu hao HD012', 'CN007', 'NV003'),
('2026-04-15 09:45:00', 10000000,  N'Chuyển khoản', N'Thu nợ đợt 1 đơn hàng lớn đại lý HD015',      'CN002', 'NV013'),
('2026-04-17 16:20:00', 2375000,   N'Tiền mặt',    N'Tất toán nợ đơn hàng hạt xay đặc sản HD017',   'CN008', 'NV020'),
('2026-04-19 13:00:00', 450000,    N'Tiền mặt',    N'Thu tiền thanh toán trực tiếp đơn lẻ HD019',    'CN009', 'NV003'),
('2026-04-22 10:10:00', 500000,    N'Tiền mặt',    N'Thu bồi thêm tiền nợ đơn hàng máy pha HD002',  'CN001', 'NV008'),
('2026-04-25 15:00:00', 274000000, N'Chuyển khoản', N'Tất toán hóa đơn máy pha JAVI M30 đơn HD007',  'CN012', 'NV013'),
('2026-04-26 11:30:00', 200000,    N'Tiền mặt',    N'Thu dứt điểm nợ hóa đơn bán lẻ HD006',        'CN011', 'NV003'),
('2026-04-27 14:00:00', 400000,    N'Chuyển khoản', N'Thu hồi nợ tiền bao bì đóng gói HD011',       'CN015', 'NV008'),
('2026-04-28 10:15:00', 900000,    N'Tiền mặt',    N'Khách sỉ thanh toán dứt điểm đơn HD014',       'CN017', 'NV020'),
('2026-04-29 16:00:00', 300000,    N'Tiền mặt',    N'Tất toán hóa đơn mua hạt thô đơn HD009',       'CN014', 'NV003'),
('2026-04-30 09:30:00', 100000,    N'Tiền mặt',    N'Thu hồi nợ tiền vật tư cốc ly đơn HD018',       'CN019', 'NV008'),
('2026-05-01 11:00:00', 760000,    N'Chuyển khoản', N'Tất toán tiền đơn hàng muộn đơn HD005',        'CN005', 'NV013'),
('2026-05-02 14:45:00', 1000000,   N'Tiền mặt',    N'Thu tiền nợ gối đầu đơn HD003',               'CN006', 'NV020'),
('2026-05-03 10:00:00', 300000,    N'Chuyển khoản', N'Thu hồi nợ hóa đơn lẻ bổ sung đơn HD009',     'CN014', 'NV003'),
('2026-05-04 15:20:00', 1400000,   N'Tiền mặt',    N'Đại lý dứt điểm tiền nợ đơn tháng HD013',      'CN016', 'NV008'),
('2026-05-05 16:10:00', 500000,    N'Chuyển khoản', N'Khách hàng tất toán nợ bồi đợt cuối đơn HD002', 'CN001', 'NV020');
GO