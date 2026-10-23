SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET ARITHABORT ON;
SET NUMERIC_ROUNDABORT OFF;
GO
-- FILE SQL DUY NHẤT CỦA DỰ ÁN
-- Chứa toàn bộ bảng, khóa ngoại, view, trigger, procedure và dữ liệu khởi tạo.
-- Chọn database đích trước khi chạy trong SSMS. Script này XÓA VÀ TẠO LẠI các bảng.
-- Bao gồm tài khoản enduser_demo và 5 mã JAVI lưu trong ví tài khoản.


-- I. XÓA CÁC ĐỐI TƯỢNG CŨ (Nếu đã tồn tại để tránh xung đột khi chạy lại)
-- Xóa Triggers --
IF OBJECT_ID('trg_Q10_MotTaiKhoanWeb','TR') IS NOT NULL DROP TRIGGER trg_Q10_MotTaiKhoanWeb;
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
IF OBJECT_ID('v_MaGiamGiaLuotDung','V') IS NOT NULL DROP VIEW v_MaGiamGiaLuotDung;
IF OBJECT_ID('v_DanhSachSanPham', 'V') IS NOT NULL DROP VIEW v_DanhSachSanPham;
IF OBJECT_ID('v_CongNoKhachHang', 'V') IS NOT NULL DROP VIEW v_CongNoKhachHang;
IF OBJECT_ID('v_DoanhThu_ChiPhi', 'V') IS NOT NULL DROP VIEW v_DoanhThu_ChiPhi;
GO

-- Xóa Stored Procedures --
IF OBJECT_ID('sp_XuLyNhapKho', 'P') IS NOT NULL DROP PROCEDURE sp_XuLyNhapKho;
IF OBJECT_ID('sp_LapHoaDon', 'P') IS NOT NULL DROP PROCEDURE sp_LapHoaDon;
GO

-- Xóa Tables (bảng con trước, bảng cha sau để đúng khóa ngoại)
IF OBJECT_ID('LOAI_SP_LOAI_XAY','U') IS NOT NULL DROP TABLE LOAI_SP_LOAI_XAY;
IF OBJECT_ID('LOAI_SP_TRONG_LUONG','U') IS NOT NULL DROP TABLE LOAI_SP_TRONG_LUONG;
IF OBJECT_ID('LOAI_XAY','U') IS NOT NULL DROP TABLE LOAI_XAY;
IF OBJECT_ID('TRONG_LUONG','U') IS NOT NULL DROP TABLE TRONG_LUONG;
IF OBJECT_ID('WEB_UU_DAI_DON_HANG', 'U') IS NOT NULL DROP TABLE WEB_UU_DAI_DON_HANG;
IF OBJECT_ID('YEU_CAU_LIEN_KET_KH', 'U') IS NOT NULL DROP TABLE YEU_CAU_LIEN_KET_KH;
IF OBJECT_ID('WEB_AP_DUNG_MA', 'U') IS NOT NULL DROP TABLE WEB_AP_DUNG_MA;
IF OBJECT_ID('WEB_MA_KHACH_HANG', 'U') IS NOT NULL DROP TABLE WEB_MA_KHACH_HANG;
IF OBJECT_ID('WEB_MA_GIAM_GIA', 'U') IS NOT NULL DROP TABLE WEB_MA_GIAM_GIA;
IF OBJECT_ID('WEB_PHI_VAN_CHUYEN', 'U') IS NOT NULL DROP TABLE WEB_PHI_VAN_CHUYEN;
IF OBJECT_ID('WEB_DIA_CHI', 'U') IS NOT NULL DROP TABLE WEB_DIA_CHI;
IF OBJECT_ID('WEB_PHUONG_XA', 'U') IS NOT NULL DROP TABLE WEB_PHUONG_XA;
IF OBJECT_ID('WEB_TINH_THANH', 'U') IS NOT NULL DROP TABLE WEB_TINH_THANH;
IF OBJECT_ID('WEB_EMAIL', 'U') IS NOT NULL DROP TABLE WEB_EMAIL;
IF OBJECT_ID('WEB_CT_DON_HANG', 'U') IS NOT NULL DROP TABLE WEB_CT_DON_HANG;
IF OBJECT_ID('WEB_DON_HANG', 'U') IS NOT NULL DROP TABLE WEB_DON_HANG;
IF OBJECT_ID('WEB_CAU_HINH', 'U') IS NOT NULL DROP TABLE WEB_CAU_HINH;
IF OBJECT_ID('WEB_BAI_VIET', 'U') IS NOT NULL DROP TABLE WEB_BAI_VIET;
IF OBJECT_ID('WEB_SAN_PHAM', 'U') IS NOT NULL DROP TABLE WEB_SAN_PHAM;
IF OBJECT_ID('GIO_HANG', 'U') IS NOT NULL DROP TABLE GIO_HANG;
IF OBJECT_ID('PHIEU_THU', 'U') IS NOT NULL DROP TABLE PHIEU_THU;
IF OBJECT_ID('CONG_NO', 'U') IS NOT NULL DROP TABLE CONG_NO;
IF OBJECT_ID('PHIEU_XUAT', 'U') IS NOT NULL DROP TABLE PHIEU_XUAT;
IF OBJECT_ID('HOA_DON', 'U') IS NOT NULL DROP TABLE HOA_DON;
IF OBJECT_ID('CT_DON_HANG', 'U') IS NOT NULL DROP TABLE CT_DON_HANG;
IF OBJECT_ID('DON_HANG', 'U') IS NOT NULL DROP TABLE DON_HANG;
IF OBJECT_ID('PHIEU_CHI', 'U') IS NOT NULL DROP TABLE PHIEU_CHI;
IF OBJECT_ID('CT_PHIEU_NHAP', 'U') IS NOT NULL DROP TABLE CT_PHIEU_NHAP;
IF OBJECT_ID('PHIEU_NHAP', 'U') IS NOT NULL DROP TABLE PHIEU_NHAP;
IF OBJECT_ID('TAI_KHOAN', 'U') IS NOT NULL DROP TABLE TAI_KHOAN;
IF OBJECT_ID('NHAN_VIEN', 'U') IS NOT NULL DROP TABLE NHAN_VIEN;
IF OBJECT_ID('KHACH_HANG', 'U') IS NOT NULL DROP TABLE KHACH_HANG;
IF OBJECT_ID('LOAI_KHACH_HANG', 'U') IS NOT NULL DROP TABLE LOAI_KHACH_HANG;
IF OBJECT_ID('SAN_PHAM', 'U') IS NOT NULL DROP TABLE SAN_PHAM;
IF OBJECT_ID('NHA_CUNG_CAP', 'U') IS NOT NULL DROP TABLE NHA_CUNG_CAP;
IF OBJECT_ID('LOAI_SAN_PHAM', 'U') IS NOT NULL DROP TABLE LOAI_SAN_PHAM;
GO


-- II. ĐỊNH NGHĨA CẤU TRÚC BẢNG DỮ LIỆU & RÀNG BUỘC (TABLES)

-- 1. BẢNG LOẠI SẢN PHẨM: Một checkbox áp dụng đồng thời trọng lượng và loại xay
CREATE TABLE LOAI_SAN_PHAM (
    MaLoaiSP CHAR(3) NOT NULL PRIMARY KEY,         -- Mã loại sản phẩm (Ví dụ: CAP, MPH, BBI...) [cite: 11]
    TenLoaiSP NVARCHAR(50) NOT NULL,               -- Tên loại sản phẩm
    ApDungTuyChon BIT NOT NULL DEFAULT 0
);


CREATE TABLE LOAI_XAY(MaLoaiXay INT IDENTITY PRIMARY KEY,TenLoaiXay NVARCHAR(80) NOT NULL UNIQUE,ThuTu INT NOT NULL DEFAULT 0,HoatDong BIT NOT NULL DEFAULT 1);
CREATE TABLE TRONG_LUONG(MaTrongLuong INT IDENTITY PRIMARY KEY,TrongLuongGram INT NOT NULL UNIQUE CHECK(TrongLuongGram>0 AND TrongLuongGram%100=0 AND TrongLuongGram<=1000000),ThuTu INT NOT NULL DEFAULT 0,HoatDong BIT NOT NULL DEFAULT 1);
CREATE TABLE LOAI_SP_LOAI_XAY(MaLoaiSP CHAR(3) NOT NULL REFERENCES LOAI_SAN_PHAM(MaLoaiSP),MaLoaiXay INT NOT NULL REFERENCES LOAI_XAY(MaLoaiXay),PRIMARY KEY(MaLoaiSP,MaLoaiXay));
CREATE TABLE LOAI_SP_TRONG_LUONG(MaLoaiSP CHAR(3) NOT NULL REFERENCES LOAI_SAN_PHAM(MaLoaiSP),MaTrongLuong INT NOT NULL REFERENCES TRONG_LUONG(MaTrongLuong),PRIMARY KEY(MaLoaiSP,MaTrongLuong));
GO

-- 2. BẢNG NHÀ CUNG CẤP: Thông tin đối tác cung cấp nguyên liệu, vật tư đầu vào
CREATE TABLE NHA_CUNG_CAP (
    MaNCC CHAR(9) NOT NULL PRIMARY KEY,            -- Mã nhà cung cấp (Trigger tự tăng NCCxx) [cite: 46]
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
    CongSuat NVARCHAR(100) NULL,                    -- Công suất phục vụ, ví dụ số ly/giờ
    GiaBan DECIMAL(19, 3) NOT NULL,                -- Đơn giá niêm yết bán lẻ cho khách [cite: 12]
    SoLuongTon DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,-- Hàng tồn thực tế nằm trong kho vật lý [cite: 12]
    SoLuongKD DECIMAL(10, 2) DEFAULT 0.00 NOT NULL, -- Hàng khả dụng để bán (Đã trừ đi hàng khách đặt giữ chỗ) [cite: 12]
    TonToiThieu DECIMAL(10, 2) NOT NULL DEFAULT 5 CHECK (TonToiThieu >= 0), -- Ngưỡng cảnh báo tồn kho
    AnhSP VARCHAR(255) NULL,                       -- Tên file ảnh sản phẩm (lưu trong fe/images/products/)
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
    MaKH CHAR(8) NOT NULL PRIMARY KEY,             -- Mã khách hàng định danh (Trigger tự tăng KHxxx) [cite: 15]
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
    MaNV CHAR(8) NOT NULL PRIMARY KEY,             -- Mã nhân viên định danh (Trigger tự tăng NVxxx) [cite: 16]
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
    GoogleSub VARCHAR(64) NULL,                   -- Mã liên kết đăng nhập Google
    MatKhau VARCHAR(255) NOT NULL,                 -- Mật khẩu băm bảo mật cao (Độ dài 255 phục vụ chuỗi mã hóa Bcrypt Node.js) [cite: 109]
    MaNV CHAR(8) NULL,                             -- Tài khoản thuộc quyền sở hữu của nhân viên nào [cite: 17]
    MaKH CHAR(8) NULL,                             -- Tài khoản của khách hàng (nếu là khách)
    VaiTro VARCHAR(20) DEFAULT 'NHAN_VIEN',        -- Vai trò: NHAN_VIEN hoặc KHACH_HANG
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV), -- [cite: 17]
    FOREIGN KEY (MaKH) REFERENCES KHACH_HANG(MaKH)
);

CREATE UNIQUE INDEX UQ_TAI_KHOAN_GoogleSub
ON TAI_KHOAN(GoogleSub) WHERE GoogleSub IS NOT NULL;
GO

-- Q10 additive upgrade. Does not delete or merge existing business data.
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF NOT EXISTS(SELECT MaKH FROM TAI_KHOAN WHERE MaKH IS NOT NULL AND VaiTro='KHACH_HANG' GROUP BY MaKH HAVING COUNT(*)>1)
AND NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('TAI_KHOAN') AND name='UQ_TAI_KHOAN_KhachWeb')
 CREATE UNIQUE INDEX UQ_TAI_KHOAN_KhachWeb ON TAI_KHOAN(MaKH) WHERE MaKH IS NOT NULL AND VaiTro='KHACH_HANG';
EXEC(N'CREATE OR ALTER TRIGGER trg_Q10_MotTaiKhoanWeb ON TAI_KHOAN AFTER INSERT,UPDATE AS
BEGIN
 SET NOCOUNT ON;
 IF NOT UPDATE(MaKH) AND NOT UPDATE(VaiTro) RETURN;
 IF EXISTS(SELECT tk.MaKH FROM TAI_KHOAN tk WITH(UPDLOCK,HOLDLOCK)
 JOIN (SELECT DISTINCT MaKH FROM inserted WHERE MaKH IS NOT NULL AND VaiTro=''KHACH_HANG'') i ON i.MaKH=tk.MaKH
 WHERE tk.VaiTro=''KHACH_HANG'' GROUP BY tk.MaKH HAVING COUNT(*)>1)
 THROW 51001,N''Ho so khach hang da co tai khoan website.'',1;
END');
COMMIT;

GO
-- 8. BẢNG PHIẾU NHẬP KHO: Chứng từ ghi nhận lô hàng bốc nhập kho tổng từ đối tác Nhà cung cấp
CREATE TABLE PHIEU_NHAP (
    MaPN CHAR(8) NOT NULL PRIMARY KEY,             -- Mã phiếu nhập kho (Trigger tự tăng PNxxx) [cite: 46]
    NgayNhap DATETIME NOT NULL,                    -- Thời điểm nhập hàng bốc dỡ [cite: 52]
    SoHoaDonNCC VARCHAR(50),                       -- Mã chứng từ/Số hóa đơn giấy của nhà cung cấp để đối chiếu [cite: 68]
    TongTienNhap DECIMAL(19, 3) DEFAULT 0,         -- Tổng chi phí hàng của phiếu nhập kho (Số lượng * Giá nhập) [cite: 47]
    SoTienDaTraNCC DECIMAL(19, 3) DEFAULT 0,       -- Số tiền thực chi từ két tiền công ty trả cho đối tác [cite: 199]
    TrangThaiThanhToan NVARCHAR(50) DEFAULT N'Chưa thanh toán', -- Trạng thái: Chưa thanh toán, Thanh toán một phần, Đã thanh toán [cite: 68]
    GhiChu NVARCHAR(255),                          -- Ghi chú thông tin lô nhập [cite: 47]
    MaNV CHAR(8) NOT NULL,                         -- Nhân viên thủ kho bốc dỡ nhận hàng [cite: 47]
    MaNCC CHAR(9) NOT NULL,                        -- Đối tác nhà cung cấp giao lô hàng [cite: 47]
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV), -- [cite: 47]
    FOREIGN KEY (MaNCC) REFERENCES NHA_CUNG_CAP(MaNCC) -- [cite: 47]
);

-- 9. BẢNG CHI TIẾT PHIẾU NHẬP: Lưu danh mục hàng hóa chi tiết trong một phiên nhập kho
CREATE TABLE CT_PHIEU_NHAP (
    MaPN CHAR(8) NOT NULL,                         -- Mã phiếu nhập kho cha liên kết [cite: 47]
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
    MaPC CHAR(8) NOT NULL PRIMARY KEY,             -- Mã chứng từ chi tiền quỹ (Trigger tự tăng PCxxx) [cite: 210]
    NgayChi DATETIME NOT NULL,                     -- Ngày giờ xuất tiền khỏi quỹ tài chính [cite: 209]
    SoTienThucChi DECIMAL(19, 3) NOT NULL,         -- Số tiền thực tế chi đi giải ngân nợ [cite: 209]
    HinhThucThanhToan NVARCHAR(50),                -- Phương thức thanh toán: Tiền mặt, Chuyển khoản ngân hàng [cite: 209]
    GhiChu NVARCHAR(255),                          -- Lý do lập chứng từ chi quỹ
    MaPN CHAR(8) NOT NULL,                         -- Chứng từ chi tiền trả nợ hàng cho Phiếu Nhập kho nào [cite: 211]
    MaNV CHAR(8) NOT NULL,                         -- Nhân viên/Kế toán viên lập phiếu chi quỹ tiền [cite: 211]
    FOREIGN KEY (MaPN) REFERENCES PHIEU_NHAP(MaPN),
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV),
    -- RÀNG BUỘC TOÀN VẸN: Số tiền chi ra bắt buộc phải không âm
    CONSTRAINT CHK_PHIEU_CHI_Money CHECK (SoTienThucChi >= 0)
);

-- 11. BẢNG ĐƠN HÀNG: Lưu hồ sơ đặt sắm sản phẩm từ khách lẻ hoặc khách sỉ đại lý
CREATE TABLE DON_HANG (
    MaDH CHAR(8) NOT NULL PRIMARY KEY,             -- Mã đơn hàng quản lý (Trigger tự tăng DHxxx) [cite: 18]
    NgayDat DATE NOT NULL,                         -- Ngày khách đặt sắm đơn hàng [cite: 18]
    TongTienDonHang DECIMAL(19, 3) DEFAULT 0,      -- Nguyên giá đơn hàng khi chưa giảm trừ chiết khấu [cite: 18]
    TongGiamGiaSP DECIMAL(19, 3) DEFAULT 0,        -- Tổng giá trị tiền được giảm trừ chiết khấu quy đổi [cite: 18]
    TongTienSauGiam DECIMAL(19, 3) DEFAULT 0,      -- Số tiền thực tế ghi nhận thu từ khách cuối cùng [cite: 18]
    TrangThaiDonHang NVARCHAR(50),                 -- Trạng thái: Hoàn thành, giao sau, không hoàn thành [cite: 18]
    NguonDon VARCHAR(20) NOT NULL DEFAULT 'Sale',  -- Nguồn đơn hàng: Sale (nhân viên lập) hoặc Online (khách đặt web)
    MaNV CHAR(8) NOT NULL,                         -- Nhân viên sales/kinh doanh lập đơn hỗ trợ [cite: 18]
    MaKH CHAR(8) NOT NULL,                         -- Đối tượng khách hàng đặt đơn sắm [cite: 18]
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV), -- [cite: 18]
    FOREIGN KEY (MaKH) REFERENCES KHACH_HANG(MaKH), -- [cite: 18]
    -- RÀNG BUỘC TOÀN VẸN: Tiền chiết khấu không vượt tổng hóa đơn gốc; Tiền sau giảm phải đúng logic = (Tổng đơn - Giảm giá) [cite: 18, 19]
    CONSTRAINT CHK_DON_HANG_Money CHECK (TongGiamGiaSP <= TongTienDonHang AND TongTienSauGiam = (TongTienDonHang - TongGiamGiaSP)) -- [cite: 19]
);

-- 12. BẢNG CHI TIẾT ĐƠN HÀNG: Danh mục chi tiết hàng sắm trong một giỏ đơn đặt hàng của khách
CREATE TABLE CT_DON_HANG (
    MaCTDH BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TrongLuongGram INT NULL,
    LoaiXay NVARCHAR(80) NULL,
    DonGia DECIMAL(19,3) NULL,
    MaDH CHAR(8) NOT NULL,                         -- Khóa ngoại liên kết mã đơn hàng cha [cite: 20]
    MaSP CHAR(5) NOT NULL,                         -- Mã sản phẩm hàng khách sắm [cite: 20]
    SoLuong INT NOT NULL,                          -- Số lượng đặt sắm hàng mặt hàng [cite: 20]
    GiamGiaSP DECIMAL(5, 4) DEFAULT 0,             -- LƯU DẠNG THẬP PHÂN HỆ SỐ 0.1: 0.1 tương ứng giảm 10%, 0.05 tương ứng giảm 5%
    FOREIGN KEY (MaDH) REFERENCES DON_HANG(MaDH),  -- [cite: 20]
    FOREIGN KEY (MaSP) REFERENCES SAN_PHAM(MaSP),  -- [cite: 20]
    -- RÀNG BUỘC TOÀN VẸN: Số lượng mua bắt buộc phải lớn hơn 0; tỷ lệ giảm giá nằm trong khoảng từ 0.0 đến 1.0 (0% - 100%) [cite: 20]
    CONSTRAINT CHK_CT_DON_HANG_Qty CHECK (SoLuong > 0), -- [cite: 20]
    CONSTRAINT CHK_CT_DON_HANG_Discount CHECK (GiamGiaSP >= 0 AND GiamGiaSP <= 1.0),
    CONSTRAINT CHK_CT_DON_HANG_Options CHECK ((TrongLuongGram IS NULL AND LoaiXay IS NULL) OR (TrongLuongGram IS NOT NULL AND TrongLuongGram>0 AND TrongLuongGram%100=0 AND LoaiXay IS NOT NULL AND LEN(LoaiXay)>0))
);

-- 13. BẢNG HÓA ĐƠN: Chứng từ tài chính thu tiền đầu ra xuất ra giao cho khách hàng
CREATE TABLE HOA_DON (
    MaHD CHAR(8) NOT NULL PRIMARY KEY,             -- Mã hóa đơn tài chính (Trigger tự tăng HDxxx) [cite: 21]
    NgayLap DATE NOT NULL,                         -- Ngày xuất lập hóa đơn chứng từ [cite: 21]
    HinhThucThanhToan NVARCHAR(50) NOT NULL,                -- Phương thức: Tiền mặt, Chuyển khoản qua ngân hàng, Ví điện tử [cite: 21]
    TongTienGiamGia DECIMAL(19, 3) DEFAULT 0,      -- Tiền giảm trừ trực tiếp hóa đơn chứng từ [cite: 21]
    TongTienThanhToan DECIMAL(19, 3) NOT NULL,     -- Số tiền hóa đơn thực thu từ khách [cite: 21]
    TrangThaiThanhToan NVARCHAR(50),               -- Tình trạng nợ nần: Đã thanh toán, Chưa thanh toán (Ghi nợ) [cite: 21]
    MaNV CHAR(8) NOT NULL,                         -- Thu ngân/Nhân viên kế toán lập xuất hóa đơn [cite: 21]
    MaDH CHAR(8) NOT NULL,                         -- Hóa đơn tài chính lập trên đơn đặt hàng nào [cite: 21]
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV), -- [cite: 21]
    FOREIGN KEY (MaDH) REFERENCES DON_HANG(MaDH)   -- [cite: 21]
);

-- 14. BẢNG PHIẾU XUẤT KHO: Chứng từ quản lý việc bốc dỡ hàng xuất kho đi giao bưu tá vận chuyển
CREATE TABLE PHIEU_XUAT (
    MaPX CHAR(8) NOT NULL PRIMARY KEY,             -- Mã phiếu bốc hàng xuất kho (Trigger tự tăng PXxxx) [cite: 22]
    NgayXuat DATE NOT NULL,                        -- Ngày xuất kho vật lý [cite: 22]
    TrangThaiGiaoHang NVARCHAR(50),                -- Tình trạng bưu tá vận chuyển: Đang xử lý, Đang giao, Đã giao hàng thành công... [cite: 22]
    MaNV CHAR(8) NOT NULL,                         -- Nhân viên phụ trách kho đứng tên xuất bốc [cite: 22]
    MaDH CHAR(8) NOT NULL UNIQUE,                  -- Một phiếu xử lý toàn bộ đơn; giao lại dùng cùng phiếu.
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV), -- [cite: 22]
    FOREIGN KEY (MaDH) REFERENCES DON_HANG(MaDH)   -- [cite: 22]
);

-- 15. BẢNG CÔNG NỢ KHÁCH HÀNG: Sổ nợ theo dõi các đại lý sỉ, khách thành viên VIP mua chịu nợ
CREATE TABLE CONG_NO (
    MaCN CHAR(8) NOT NULL PRIMARY KEY,             -- Mã sổ nợ quản lý (Trigger tự tăng CNxxx) [cite: 23]
    HanThanhToan DATE,                             -- Hạn chót bắt buộc phải dứt điểm nợ toán [cite: 23]
    NgayGhiNhan DATE NOT NULL,                     -- Ngày mở hồ sơ ghi nhận khoản nợ [cite: 23]
    SoTienDaTra DECIMAL(19, 3) DEFAULT 0,          -- Tiền khách nợ đã hoàn trả bớt qua các kỳ [cite: 23]
    TongNo DECIMAL(19, 3) NOT NULL,                -- Số tiền gốc nợ ban đầu phát sinh từ hóa đơn mua chịu [cite: 23]
    SoDuCN DECIMAL(19, 3) DEFAULT 0,               -- Tiền dư nợ hiện tại còn phải tiếp tục đòi khách [cite: 23]
    TrangThaiCN NVARCHAR(50),                      -- Tình trạng sổ nợ: Còn nợ, Hoàn tất [cite: 23]
    MaHD CHAR(8),                                  -- Khóa ngoại liên kết hóa đơn mua chịu của khách [cite: 23]
    FOREIGN KEY (MaHD) REFERENCES HOA_DON(MaHD),  -- [cite: 23]
    -- RÀNG BUỘC TOÀN VẸN: Số dư nợ hiện tại không âm; Phải đúng công thức toán học khít khớp = (Tổng nợ gốc - Đã hoàn trả bớt) [cite: 23]
    CONSTRAINT CHK_CONG_NO_Logic CHECK (SoDuCN >= 0 AND SoDuCN = (TongNo - SoTienDaTra)) -- [cite: 23]
);

-- 16. BẢNG PHIẾU THU: Chứng từ kế toán ghi nhận dòng tiền mặt/tiền gửi thu hồi nợ từ phía khách sỉ
CREATE TABLE PHIEU_THU (
    MaPT CHAR(8) NOT NULL PRIMARY KEY,             -- Mã phiếu thu quỹ tiền mặt (Trigger tự tăng PTxxx) [cite: 24]
    NgayThu DATETIME NOT NULL,                     -- Ngày giờ thực hiện thu tiền mặt/tiền gửi nổi [cite: 24]
    SoTienThucThu DECIMAL(19, 3) NOT NULL,         -- Số tiền mặt thu hồi nợ thực tế bốc về [cite: 24]
    HinhThucThanhToan NVARCHAR(50),                -- Phương thức thu hồi: Tiền mặt / Chuyển khoản ngân hàng [cite: 24]
    GhiChu NVARCHAR(255),                          -- Lý do viết chứng từ thu tiền [cite: 24]
    MaCN CHAR(8) NOT NULL,                         -- Thu tiền nhằm xóa giảm trừ bợ nợ cho mã sổ nợ nào [cite: 24]
    MaNV CHAR(8) NOT NULL,                         -- Kế toán viên hoặc thu ngân lập viết phiếu thu [cite: 24]
    FOREIGN KEY (MaCN) REFERENCES CONG_NO(MaCN),   -- [cite: 24]
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV), -- [cite: 24]
    -- RÀNG BUỘC TOÀN VẸN: Số tiền thu về két tiền không được phép âm [cite: 24]
    CONSTRAINT CHK_PHIEU_THU_Money CHECK (SoTienThucThu >= 0) -- [cite: 24]
);

-- 17. BẢNG GIỎ HÀNG: Lưu sản phẩm khách hàng thêm vào giỏ trên web (persistent theo tài khoản)
CREATE TABLE GIO_HANG (
    MaGH        INT IDENTITY(1,1) NOT NULL PRIMARY KEY, -- Mã giỏ hàng tự tăng
    TenDangNhap VARCHAR(50) NOT NULL,                   -- Tài khoản sở hữu giỏ hàng này
    MaSP        CHAR(5) NOT NULL,                       -- Sản phẩm được thêm vào giỏ
    TrongLuongGram INT NULL,
    LoaiXay NVARCHAR(80) NULL,
    SoLuong     INT NOT NULL DEFAULT 1,                 -- Số lượng sản phẩm trong giỏ
    NgayThem    DATETIME NOT NULL DEFAULT GETDATE(),    -- Thời điểm thêm vào giỏ
    FOREIGN KEY (TenDangNhap) REFERENCES TAI_KHOAN(TenDangNhap) ON DELETE CASCADE,
    FOREIGN KEY (MaSP) REFERENCES SAN_PHAM(MaSP),
    -- RÀNG BUỘC: Số lượng trong giỏ phải lớn hơn 0
    CONSTRAINT CHK_GIO_HANG_Qty CHECK (SoLuong > 0),
    -- Một dòng cho mỗi tài khoản + sản phẩm + trọng lượng + loại xay
    CONSTRAINT UQ_GIO_HANG_Options UNIQUE (TenDangNhap, MaSP, TrongLuongGram, LoaiXay),
    CONSTRAINT CHK_GIO_HANG_Options CHECK ((TrongLuongGram IS NULL AND LoaiXay IS NULL) OR (TrongLuongGram IS NOT NULL AND TrongLuongGram>0 AND TrongLuongGram%100=0 AND LoaiXay IS NOT NULL AND LEN(LoaiXay)>0))
);
GO


-- 18. BẢNG CẤU HÌNH SẢN PHẨM WEBSITE
CREATE TABLE WEB_SAN_PHAM (
    MaSP CHAR(5) NOT NULL PRIMARY KEY,
    HienThi BIT NOT NULL DEFAULT 1,
    ViTri NVARCHAR(30) NOT NULL DEFAULT N'CaPhe' CHECK (ViTri IN (N'NoiBat',N'CaPhe',N'MayPha',N'PhuKien')),
    ThuTu INT NOT NULL DEFAULT 0 CHECK (ThuTu>=0),
    MoTa NVARCHAR(1500) NOT NULL DEFAULT N'',
    HinhAnh NVARCHAR(512) NOT NULL DEFAULT N'',
    NgayCapNhat DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (MaSP) REFERENCES SAN_PHAM(MaSP)
);

-- 19. BẢNG BÀI VIẾT BLOG
IF OBJECT_ID('WEB_NOI_DUNG','U') IS NOT NULL DROP TABLE WEB_NOI_DUNG;
IF OBJECT_ID(N'WEB_NOI_DUNG',N'U') IS NULL
 CREATE TABLE WEB_NOI_DUNG (Ma VARCHAR(30) NOT NULL PRIMARY KEY, NoiDung NVARCHAR(MAX) NOT NULL CHECK(ISJSON(NoiDung)=1), NgayCapNhat DATETIME2 NOT NULL DEFAULT SYSDATETIME());

GO
INSERT INTO WEB_NOI_DUNG(Ma,NoiDung) VALUES('partners',N'[{"name":"The Cliff","sector":"Resort","status":"Đã trải nghiệm","image":"/images/partners/the-cliff.jpg","description":"Trải nghiệm cà phê JAVI tại sự kiện của resort.","source":"https://mayphacafephin.com/","visible":true,"order":1},{"name":"Hoàng Yến","sector":"Chuỗi nhà hàng","status":"Đã trải nghiệm","image":"/images/partners/hoang-yen.jpg","description":"Góc nhìn từ không gian ẩm thực và dịch vụ.","source":"https://mayphacafephin.com/","visible":true,"order":2},{"name":"Kana 24h","sector":"Chuỗi cà phê","status":"Đã trải nghiệm","image":"/images/partners/kana.jpg","description":"Trải nghiệm máy pha trong nhịp vận hành quán.","source":"https://mayphacafephin.com/","visible":true,"order":3},{"name":"GC Food","sector":"Doanh nghiệp","status":"Đã trải nghiệm","image":"/images/partners/gc-food.jpg","description":"Cà phê và máy pha trong kết nối doanh nghiệp.","source":"https://mayphacafephin.com/","visible":true,"order":4}]');
GO
CREATE TABLE WEB_BAI_VIET (
    ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TieuDe NVARCHAR(200) NOT NULL,
    Slug VARCHAR(200) NOT NULL UNIQUE,
    ChuyenMuc NVARCHAR(50) NOT NULL,
    TomTat NVARCHAR(600) NOT NULL,
    NoiDung NVARCHAR(MAX) NOT NULL,
    AnhBia NVARCHAR(512) NOT NULL DEFAULT N'',
    TrangThai NVARCHAR(20) NOT NULL DEFAULT N'Nháp' CHECK (TrangThai IN (N'Nháp',N'Đã xuất bản')),
    NgayDang DATETIME2 NULL,
    NgayCapNhat DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 20. BẢNG CẤU HÌNH WEBSITE
CREATE TABLE WEB_CAU_HINH (
    ID INT PRIMARY KEY CHECK (ID=1),
    TenThuongHieu NVARCHAR(100) NOT NULL DEFAULT N'JAVI COFFEE',
    GioiThieu NVARCHAR(1500) NOT NULL DEFAULT N'',
    EmailLienHe VARCHAR(100) NOT NULL DEFAULT '',
    TenNganHang NVARCHAR(100) NOT NULL DEFAULT N'',
    SoTaiKhoan VARCHAR(50) NOT NULL DEFAULT '',
    ChuTaiKhoan NVARCHAR(100) NOT NULL DEFAULT N'',
    PhiVanChuyen DECIMAL(19,3) NOT NULL DEFAULT 0 CHECK (PhiVanChuyen>=0)
);

-- 21. BẢNG THÔNG TIN ĐƠN HÀNG WEBSITE
CREATE TABLE WEB_DON_HANG (
    MaDH CHAR(8) NOT NULL PRIMARY KEY,
    MaYeuCau VARCHAR(64) NOT NULL UNIQUE,
    TenDangNhap VARCHAR(50) NOT NULL,
    NguoiNhan NVARCHAR(100) NOT NULL,
    SoDT VARCHAR(20) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    DiaChi NVARCHAR(500) NOT NULL,
    GhiChu NVARCHAR(1000) NOT NULL DEFAULT N'',
    HinhThucTT NVARCHAR(50) NOT NULL CHECK (HinhThucTT IN (N'Tiền mặt',N'Chuyển khoản')),
    PhiVanChuyen DECIMAL(19,3) NOT NULL DEFAULT 0,
    TongThanhToan DECIMAL(19,3) NOT NULL,
    NgayTao DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (MaDH) REFERENCES DON_HANG(MaDH)
);

-- 22. BẢNG CHI TIẾT ĐƠN HÀNG WEBSITE
CREATE TABLE WEB_CT_DON_HANG (
    MaDong BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TrongLuongGram INT NULL,
    LoaiXay NVARCHAR(80) NULL,
    MaDH CHAR(8) NOT NULL,
    MaSP CHAR(5) NOT NULL,
    TenSP NVARCHAR(100) NOT NULL,
    GiaBan DECIMAL(19,3) NOT NULL,
    SoLuong INT NOT NULL,
    ThanhTien DECIMAL(19,3) NOT NULL,
    FOREIGN KEY (MaDH) REFERENCES WEB_DON_HANG(MaDH),
    CONSTRAINT CHK_WEB_CT_DON_HANG_Options CHECK ((TrongLuongGram IS NULL AND LoaiXay IS NULL) OR (TrongLuongGram IS NOT NULL AND TrongLuongGram>0 AND TrongLuongGram%100=0 AND LoaiXay IS NOT NULL AND LEN(LoaiXay)>0))
);

-- 23. BẢNG HÀNG ĐỢI EMAIL XÁC NHẬN
CREATE TABLE WEB_EMAIL (
    ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    MaDH CHAR(8) NOT NULL UNIQUE,
    NguoiNhan VARCHAR(100) NOT NULL,
    TieuDe NVARCHAR(250) NOT NULL,
    NoiDung NVARCHAR(MAX) NOT NULL,
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (TrangThai IN ('pending','preview','sending','sent','failed')),
    SoLanThu INT NOT NULL DEFAULT 0,
    Loi NVARCHAR(1000) NULL,
    NgayTao DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    NgayGui DATETIME2 NULL,
    FOREIGN KEY (MaDH) REFERENCES WEB_DON_HANG(MaDH)
);
GO

-- 24. BẢNG TỈNH / THÀNH PHỐ (dữ liệu hành chính hai cấp)
CREATE TABLE WEB_TINH_THANH (
    MaTinhThanh INT NOT NULL PRIMARY KEY,
    TenTinhThanh NVARCHAR(100) NOT NULL
);
-- 25. BẢNG PHƯỜNG / XÃ
CREATE TABLE WEB_PHUONG_XA (
    MaPhuongXa INT NOT NULL PRIMARY KEY,
    MaTinhThanh INT NOT NULL,
    TenPhuongXa NVARCHAR(100) NOT NULL,
    UNIQUE (MaTinhThanh, MaPhuongXa),
    FOREIGN KEY (MaTinhThanh) REFERENCES WEB_TINH_THANH(MaTinhThanh)
);
GO

-- 26. BẢNG SỔ ĐỊA CHỈ KHÁCH HÀNG
CREATE TABLE WEB_DIA_CHI (
    ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenDangNhap VARCHAR(50) NOT NULL,
    NguoiNhan NVARCHAR(100) NOT NULL,
    SoDT VARCHAR(20) NOT NULL,
    MaTinhThanh INT NOT NULL,
    TenTinhThanh NVARCHAR(100) NOT NULL,
    MaPhuongXa INT NOT NULL,
    TenPhuongXa NVARCHAR(100) NOT NULL,
    DiaChiChiTiet NVARCHAR(250) NOT NULL,
    NgayCapNhat DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (TenDangNhap) REFERENCES TAI_KHOAN(TenDangNhap),
    FOREIGN KEY (MaTinhThanh, MaPhuongXa) REFERENCES WEB_PHUONG_XA(MaTinhThanh, MaPhuongXa)
);

-- 27. BẢNG PHÍ VẬN CHUYỂN (MaTinhThanh NULL: mức mặc định)
CREATE TABLE WEB_PHI_VAN_CHUYEN (
    ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    MaTinhThanh INT NULL UNIQUE,
    TenKhuVuc NVARCHAR(100) NOT NULL,
    PhiVanChuyen DECIMAL(19,3) NOT NULL CHECK (PhiVanChuyen >= 0),
    MienPhiTu DECIMAL(19,3) NULL CHECK (MienPhiTu >= 0),
    HienThi BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (MaTinhThanh) REFERENCES WEB_TINH_THANH(MaTinhThanh)
);

-- 28. BẢNG MÃ GIẢM GIÁ
CREATE TABLE WEB_MA_GIAM_GIA (
    MaGiamGia VARCHAR(30) NOT NULL DEFAULT (UPPER(LEFT(REPLACE(CONVERT(VARCHAR(36),NEWID()),'-',''),6))) PRIMARY KEY,
    TenMaGiamGia NVARCHAR(150) NOT NULL DEFAULT N'Ưu đãi JAVI' CHECK (LEN(LTRIM(RTRIM(TenMaGiamGia)))>0),
    MoTa NVARCHAR(250) NOT NULL,
    MaLoaiKH CHAR(3) NULL, -- NULL: tất cả loại khách hàng
    MaSP CHAR(5) NULL, -- NULL: tất cả sản phẩm
    LoaiGiam VARCHAR(10) NOT NULL CHECK (LoaiGiam IN ('percent','fixed')),
    GiaTri DECIMAL(19,3) NOT NULL CHECK (GiaTri > 0),
    DonToiThieu DECIMAL(19,3) NOT NULL DEFAULT 0 CHECK (DonToiThieu >= 0),
    GiamToiDa DECIMAL(19,3) NULL CHECK (GiamToiDa >= 0),
    ChoPhepKetHop BIT NOT NULL DEFAULT 0, -- Cho phép dùng cùng mã giảm giá khác
    SoLuong INT NULL CONSTRAINT CK_WEB_MA_GIAM_GIA_SoLuong CHECK (SoLuong IS NULL OR SoLuong > 0), -- NULL: không giới hạn
    BatDau DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), -- Từ ngày (UTC)
    KetThuc DATETIME2 NULL, -- Hết hiệu lực tại đầu ngày tiếp theo của Đến ngày
    HienThi BIT NOT NULL DEFAULT 1, -- Tương thích cấu hình cũ
    TrangThai NVARCHAR(20) NOT NULL CONSTRAINT DF_WEB_MA_GIAM_GIA_TrangThai DEFAULT N'Hoạt động' CONSTRAINT CK_WEB_MA_GIAM_GIA_TrangThai CHECK (TrangThai IN (N'Hoạt động',N'Tạm ngưng')),
    FOREIGN KEY (MaLoaiKH) REFERENCES LOAI_KHACH_HANG(MaLoaiKH),
    FOREIGN KEY (MaSP) REFERENCES SAN_PHAM(MaSP),
    CHECK (LoaiGiam <> 'percent' OR GiaTri <= 100),
    CHECK (KetThuc IS NULL OR KetThuc > BatDau)
);

-- 29. BẢNG ÁP DỤNG MÃ GIẢM GIÁ (website và nhân viên)
CREATE TABLE WEB_AP_DUNG_MA (
    MaDH CHAR(8) NOT NULL,
    MaGiamGia VARCHAR(30) NOT NULL,
    TienGiam DECIMAL(19,3) NOT NULL CHECK (TienGiam > 0),
    PRIMARY KEY (MaDH, MaGiamGia),
    FOREIGN KEY (MaDH) REFERENCES DON_HANG(MaDH),
    FOREIGN KEY (MaGiamGia) REFERENCES WEB_MA_GIAM_GIA(MaGiamGia)
);
GO

-- 30. BẢNG MÃ GIẢM GIÁ KHÁCH HÀNG ĐÃ LƯU
CREATE TABLE WEB_MA_KHACH_HANG (
    TenDangNhap VARCHAR(50) NOT NULL,
    MaGiamGia VARCHAR(30) NOT NULL,
    NgayLuu DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (TenDangNhap, MaGiamGia),
    FOREIGN KEY (TenDangNhap) REFERENCES TAI_KHOAN(TenDangNhap),
    FOREIGN KEY (MaGiamGia) REFERENCES WEB_MA_GIAM_GIA(MaGiamGia)
);
GO

-- 31. BẢNG ĐỊA CHỈ VÀ ƯU ĐÃI TẠI THỜI ĐIỂM ĐẶT ĐƠN
CREATE TABLE WEB_UU_DAI_DON_HANG (
    MaDH CHAR(8) NOT NULL PRIMARY KEY,
    MaGiamGia VARCHAR(30) NULL,
    TienGiam DECIMAL(19,3) NOT NULL DEFAULT 0 CHECK (TienGiam >= 0),
    MaTinhThanh INT NOT NULL,
    TenTinhThanh NVARCHAR(100) NOT NULL,
    MaPhuongXa INT NOT NULL,
    TenPhuongXa NVARCHAR(100) NOT NULL,
    DiaChiChiTiet NVARCHAR(250) NOT NULL,
    FOREIGN KEY (MaDH) REFERENCES WEB_DON_HANG(MaDH),
    FOREIGN KEY (MaGiamGia) REFERENCES WEB_MA_GIAM_GIA(MaGiamGia),
    FOREIGN KEY (MaTinhThanh, MaPhuongXa) REFERENCES WEB_PHUONG_XA(MaTinhThanh, MaPhuongXa)
);
GO

CREATE OR ALTER VIEW v_MaGiamGiaLuotDung AS
SELECT m.MaGiamGia,
 COUNT(CASE WHEN a.MaDH IS NOT NULL AND d.TrangThaiDonHang=N'Hoàn thành' THEN 1 END) AS SoLuotDaDung,
 COUNT(CASE WHEN a.MaDH IS NOT NULL AND ISNULL(d.TrangThaiDonHang,N'') NOT IN (N'Hoàn thành',N'Không hoàn thành',N'Không thành công',N'Đã hủy',N'Hủy') THEN 1 END) AS SoLuotDangGiu,
 COUNT(CASE WHEN a.MaDH IS NOT NULL AND ISNULL(d.TrangThaiDonHang,N'') NOT IN (N'Không hoàn thành',N'Không thành công',N'Đã hủy',N'Hủy') THEN 1 END) AS SoLuotDaTinh
FROM WEB_MA_GIAM_GIA m LEFT JOIN WEB_AP_DUNG_MA a ON a.MaGiamGia=m.MaGiamGia LEFT JOIN DON_HANG d ON d.MaDH=a.MaDH
GROUP BY m.MaGiamGia;
GO
CREATE OR ALTER TRIGGER trg_MaGiamGia_KiemTraLuot ON WEB_AP_DUNG_MA AFTER INSERT,UPDATE AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @locked INT;
 SELECT @locked=COUNT(*) FROM WEB_MA_GIAM_GIA m WITH(UPDLOCK,HOLDLOCK) WHERE m.MaGiamGia IN (SELECT MaGiamGia FROM inserted);
 IF EXISTS(SELECT 1 FROM WEB_MA_GIAM_GIA m JOIN v_MaGiamGiaLuotDung v ON v.MaGiamGia=m.MaGiamGia WHERE m.MaGiamGia IN(SELECT MaGiamGia FROM inserted) AND m.SoLuong IS NOT NULL AND v.SoLuotDaTinh>m.SoLuong)
   THROW 50011,N'Mã đã hết lượt sử dụng',1;
END;
GO
CREATE OR ALTER TRIGGER trg_MaGiamGia_KiemTraGioiHan ON WEB_MA_GIAM_GIA AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM inserted m JOIN v_MaGiamGiaLuotDung v ON v.MaGiamGia=m.MaGiamGia WHERE m.SoLuong IS NOT NULL AND m.SoLuong<v.SoLuotDaTinh)
   THROW 50012,N'Số lượng không được nhỏ hơn số lượt đã dùng và đang giữ',1;
END;
GO
CREATE OR ALTER TRIGGER trg_MaGiamGia_KhoiPhucDon ON DON_HANG AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 IF NOT UPDATE(TrangThaiDonHang) RETURN;
 DECLARE @locked INT;
 SELECT @locked=COUNT(*) FROM WEB_MA_GIAM_GIA m WITH(UPDLOCK,HOLDLOCK) JOIN WEB_AP_DUNG_MA a ON a.MaGiamGia=m.MaGiamGia JOIN inserted i ON i.MaDH=a.MaDH;
 IF EXISTS(SELECT 1 FROM inserted i JOIN deleted old ON old.MaDH=i.MaDH JOIN WEB_AP_DUNG_MA a ON a.MaDH=i.MaDH JOIN WEB_MA_GIAM_GIA m ON m.MaGiamGia=a.MaGiamGia
 WHERE old.TrangThaiDonHang IN(N'Không hoàn thành',N'Không thành công',N'Đã hủy',N'Hủy') AND ISNULL(i.TrangThaiDonHang,N'') NOT IN(N'Không hoàn thành',N'Không thành công',N'Đã hủy',N'Hủy') AND (m.TrangThai<>N'Hoạt động' OR m.BatDau>SYSUTCDATETIME() OR (m.KetThuc IS NOT NULL AND m.KetThuc<=SYSUTCDATETIME())))
   THROW 50013,N'Không thể khôi phục ưu đãi đã ngừng hoặc hết hạn',1;
 IF EXISTS(SELECT 1 FROM WEB_MA_GIAM_GIA m JOIN v_MaGiamGiaLuotDung v ON v.MaGiamGia=m.MaGiamGia JOIN WEB_AP_DUNG_MA a ON a.MaGiamGia=m.MaGiamGia JOIN inserted i ON i.MaDH=a.MaDH WHERE m.SoLuong IS NOT NULL AND v.SoLuotDaTinh>m.SoLuong)
   THROW 50011,N'Mã đã hết lượt sử dụng',1;
END;
GO

-- III. CÁC TRIGGER TỰ ĐỘNG SINH MÃ TĂNG DẦN 

-- 1. Tự tăng mã Khách Hàng (KHxxx) [cite: 25]
CREATE TRIGGER trg_AutoMaKH ON KHACH_HANG INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaKH, 3, 6) AS INT)), 0) FROM KHACH_HANG); -- [cite: 25]
    INSERT INTO KHACH_HANG 
    SELECT 'KH' + RIGHT('000000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL))  AS VARCHAR(6)), 6), -- [cite: 26]
           TenKH, SoDTKH, EmailKH, GioiTinhKH, DiaChiKH, MaLoaiKH FROM inserted; -- [cite: 26]
END;
GO

-- 2. Tự tăng mã Nhân Viên (NVxxx) [cite: 28]
CREATE TRIGGER trg_AutoMaNV ON NHAN_VIEN INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaNV, 3, 6) AS INT)), 0) FROM NHAN_VIEN); -- [cite: 28]
    INSERT INTO NHAN_VIEN 
    SELECT 'NV' + RIGHT('000000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL))  AS VARCHAR(6)), 6), -- [cite: 29]
           HoTenNV, CCCD, GioiTinh, ChucVu, SoDTNV, EmailNV, DiaChiNV, TrangThai FROM inserted;
END;
GO

-- 3. Tự tăng mã Đơn Hàng (DHxxx) [cite: 30]
CREATE TRIGGER trg_AutoMaDH ON DON_HANG INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaDH, 3, 6) AS INT)), 0) FROM DON_HANG);
    INSERT INTO DON_HANG 
        (MaDH, NgayDat, TongTienDonHang, TongGiamGiaSP, TongTienSauGiam,
         TrangThaiDonHang, NguonDon, MaNV, MaKH)
    SELECT 'DH' + RIGHT('000000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS VARCHAR(6)), 6),
           NgayDat, TongTienDonHang, TongGiamGiaSP, TongTienSauGiam,
           TrangThaiDonHang, NguonDon, MaNV, MaKH
    FROM inserted;
END;
GO

-- 4. Tự tăng mã Hóa Đơn (HDxxx) [cite: 33]
CREATE TRIGGER trg_AutoMaHD ON HOA_DON INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaHD, 3, 6) AS INT)), 0) FROM HOA_DON); -- [cite: 33]
    INSERT INTO HOA_DON 
    SELECT 'HD' + RIGHT('000000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL))  AS VARCHAR(6)), 6), -- [cite: 34]
           NgayLap, HinhThucThanhToan, TongTienGiamGia, TongTienThanhToan, TrangThaiThanhToan, MaNV, MaDH FROM inserted; -- [cite: 34]
END;
GO

-- 5. Tự tăng mã Phiếu Xuất Kho (PXxxx) [cite: 35]
CREATE TRIGGER trg_AutoMaPX ON PHIEU_XUAT INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaPX, 3, 6) AS INT)), 0) FROM PHIEU_XUAT); -- [cite: 35]
    INSERT INTO PHIEU_XUAT 
    SELECT 'PX' + RIGHT('000000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL))  AS VARCHAR(6)), 6), -- [cite: 36]
           NgayXuat, TrangThaiGiaoHang, MaNV, MaDH FROM inserted; -- [cite: 36]
END;
GO

-- 6. Tự tăng mã Công Nợ Khách Hàng (CNxxx) [cite: 38]
CREATE TRIGGER trg_AutoMaCN ON CONG_NO INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaCN, 3, 6) AS INT)), 0) FROM CONG_NO); -- [cite: 38]
    INSERT INTO CONG_NO 
    SELECT 'CN' + RIGHT('000000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL))  AS VARCHAR(6)), 6), -- [cite: 39]
           HanThanhToan, NgayGhiNhan, SoTienDaTra, TongNo, SoDuCN, TrangThaiCN, MaHD FROM inserted; -- [cite: 39]
END;
GO

-- 7. Tự tăng mã Phiếu Thu Tiền (PTxxx) [cite: 40]
CREATE TRIGGER trg_AutoMaPT ON PHIEU_THU INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaPT, 3, 6) AS INT)), 0) FROM PHIEU_THU); -- [cite: 40]
    INSERT INTO PHIEU_THU 
    SELECT 'PT' + RIGHT('000000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL))  AS VARCHAR(6)), 6), -- [cite: 41]
           NgayThu, SoTienThucThu, HinhThucThanhToan, GhiChu, MaCN, MaNV FROM inserted; -- [cite: 41]
END;
GO

-- 8. Tự tăng mã Nhà Cung Cấp (Định dạng NCCxx) [cite: 46]
CREATE TRIGGER trg_AutoMaNCC ON NHA_CUNG_CAP INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaNCC, 4, 6) AS INT)), 0) FROM NHA_CUNG_CAP);
    INSERT INTO NHA_CUNG_CAP 
    SELECT 'NCC' + RIGHT('000000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL))  AS VARCHAR(6)), 6), 
           TenNCC, SoDTNCC, EmailNCC, DiaChiNCC, GhiChu FROM inserted;
END;
GO

-- 9. Tự tăng mã Phiếu Nhập Kho (PNxxx) [cite: 46]
CREATE TRIGGER trg_AutoMaPN ON PHIEU_NHAP INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaPN, 3, 6) AS INT)), 0) FROM PHIEU_NHAP);
    INSERT INTO PHIEU_NHAP 
    SELECT 'PN' + RIGHT('000000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL))  AS VARCHAR(6)), 6), 
           NgayNhap, SoHoaDonNCC, TongTienNhap, SoTienDaTraNCC, TrangThaiThanhToan, GhiChu, MaNV, MaNCC FROM inserted;
END;
GO

-- 10. Tự tăng mã Phiếu Chi Tiền Trả Nợ NCC (PCxxx) [cite: 210]
CREATE TRIGGER trg_AutoMaPC ON PHIEU_CHI INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaxID INT = (SELECT ISNULL(MAX(CAST(SUBSTRING(MaPC, 3, 6) AS INT)), 0) FROM PHIEU_CHI);
    INSERT INTO PHIEU_CHI 
    SELECT 'PC' + RIGHT('000000' + CAST(@MaxID + ROW_NUMBER() OVER (ORDER BY (SELECT NULL))  AS VARCHAR(6)), 6), 
           NgayChi, SoTienThucChi, HinhThucThanhToan, GhiChu, MaPN, MaNV FROM inserted;
END;
GO


-- IV. CÁC TRIGGER NGHIỆP VỤ BÁN HÀNG & KHO 

-- 1. TRIGGER TỰ ĐỘNG TRỪ SỐ LƯỢNG KHẢ DỤNG (SoLuongKD) KHI ĐẶT HÀNG
CREATE TRIGGER trg_Web_CapNhatKhoKhiDatHang ON CT_DON_HANG AFTER INSERT AS
BEGIN
 SET NOCOUNT ON;
 ;WITH q AS(SELECT MaSP,SUM(SoLuong*ISNULL(TrongLuongGram/100,1)) AS Qty FROM inserted GROUP BY MaSP)
 UPDATE s SET SoLuongKD=SoLuongKD-q.Qty FROM SAN_PHAM s JOIN q ON s.MaSP=q.MaSP;
 IF EXISTS(SELECT 1 FROM SAN_PHAM s JOIN inserted i ON i.MaSP=s.MaSP WHERE s.SoLuongKD<0) THROW 50021,N'Không đủ tồn khả dụng.',1;
 ;WITH q AS(SELECT i.MaSP,SUM(i.SoLuong*ISNULL(i.TrongLuongGram/100,1)) AS Qty FROM inserted i JOIN DON_HANG d ON i.MaDH=d.MaDH WHERE d.TrangThaiDonHang=N'Hoàn thành' GROUP BY i.MaSP)
 UPDATE s SET SoLuongTon=SoLuongTon-q.Qty FROM SAN_PHAM s JOIN q ON s.MaSP=q.MaSP;
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
CREATE TRIGGER trg_CapNhatKhoKhiXuat ON PHIEU_XUAT AFTER INSERT,UPDATE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM inserted i JOIN deleted d ON d.MaPX=i.MaPX WHERE i.MaDH<>d.MaDH)
   THROW 50022,N'Không được đổi đơn hàng của phiếu xuất.',1;
 IF EXISTS(SELECT 1 FROM inserted i JOIN deleted d ON d.MaPX=i.MaPX WHERE ISNULL(i.TrangThaiGiaoHang,N'')<>ISNULL(d.TrangThaiGiaoHang,N'') AND NOT (
  (d.TrangThaiGiaoHang IN(N'Chờ lấy hàng',N'Đang xử lý') AND i.TrangThaiGiaoHang IN(N'Đang giao hàng',N'Hủy xuất kho')) OR
  (d.TrangThaiGiaoHang=N'Đang giao hàng' AND i.TrangThaiGiaoHang IN(N'Đã giao hàng',N'Giao thành công',N'Giao hàng không thành công')) OR
  (d.TrangThaiGiaoHang=N'Giao hàng không thành công' AND i.TrangThaiGiaoHang IN(N'Chờ lấy hàng',N'Hủy xuất kho'))))
   THROW 50023,N'Chuyển trạng thái phiếu xuất không hợp lệ.',1;
 ;WITH q AS(SELECT ct.MaSP,SUM(ct.SoLuong*ISNULL(ct.TrongLuongGram/100,1)) AS Qty FROM CT_DON_HANG ct JOIN inserted i ON ct.MaDH=i.MaDH LEFT JOIN deleted d ON i.MaPX=d.MaPX
 WHERE i.TrangThaiGiaoHang IN(N'Đã giao hàng',N'Giao thành công') AND ISNULL(d.TrangThaiGiaoHang,N'') NOT IN(N'Đã giao hàng',N'Giao thành công') GROUP BY ct.MaSP)
 UPDATE s SET SoLuongTon=SoLuongTon-q.Qty FROM SAN_PHAM s JOIN q ON s.MaSP=q.MaSP;
 ;WITH q AS(SELECT ct.MaSP,SUM(ct.SoLuong*ISNULL(ct.TrongLuongGram/100,1)) AS Qty FROM CT_DON_HANG ct JOIN inserted i ON ct.MaDH=i.MaDH LEFT JOIN deleted d ON i.MaPX=d.MaPX
 WHERE i.TrangThaiGiaoHang=N'Hủy xuất kho' AND ISNULL(d.TrangThaiGiaoHang,N'')<>N'Hủy xuất kho' GROUP BY ct.MaSP)
 UPDATE s SET SoLuongKD=SoLuongKD+q.Qty FROM SAN_PHAM s JOIN q ON s.MaSP=q.MaSP;
 UPDATE dh SET TrangThaiDonHang=CASE WHEN i.TrangThaiGiaoHang IN(N'Đã giao hàng',N'Giao thành công') THEN N'Hoàn thành' ELSE N'Không hoàn thành' END
 FROM DON_HANG dh JOIN inserted i ON dh.MaDH=i.MaDH LEFT JOIN deleted d ON i.MaPX=d.MaPX
 WHERE (i.TrangThaiGiaoHang IN(N'Đã giao hàng',N'Giao thành công') AND ISNULL(d.TrangThaiGiaoHang,N'') NOT IN(N'Đã giao hàng',N'Giao thành công')) OR(i.TrangThaiGiaoHang=N'Hủy xuất kho' AND ISNULL(d.TrangThaiGiaoHang,N'')<>N'Hủy xuất kho');
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
    sp.TrongLuong,
    sp.CongSuat,
    sp.GiaBan,
    sp.SoLuongTon,
    sp.SoLuongKD,
    sp.AnhSP,
    CASE 
        WHEN sp.SoLuongTon <= sp.TonToiThieu THEN N'Sắp hết hàng' -- Cảnh báo icon đỏ trên HTML POS [cite: 130]
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
    @MaNV CHAR(8),
    @MaNCC CHAR(9),
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
        DECLARE @NewMaPN CHAR(8);
        
        -- Tạo mới phiếu nhập đầu vào (Mã PN tự động tăng qua trigger PNxxx) [cite: 110]
        INSERT INTO PHIEU_NHAP (NgayNhap, SoHoaDonNCC, TongTienNhap, SoTienDaTraNCC, TrangThaiThanhToan, GhiChu, MaNV, MaNCC)
        VALUES (GETDATE(), @SoHoaDonNCC, (@SoLuong * @GiaNhap), 0, N'Chưa thanh toán', @GhiChu, @MaNV, @MaNCC);
        
        SELECT @NewMaPN = MaPN FROM PHIEU_NHAP WHERE MaPN = (SELECT 'PN' + RIGHT('000000' + CAST(MAX(CAST(SUBSTRING(MaPN, 3, 6) AS INT))  AS VARCHAR(6)), 6) FROM PHIEU_NHAP);

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
    @MaDH CHAR(8),
    @MaNV CHAR(8),
    @HinhThucThanhToan NVARCHAR(50),
    @TrangThaiThanhToan NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @TongTienSauGiam DECIMAL(19, 3);
        SELECT @TongTienSauGiam = TongTienSauGiam FROM DON_HANG WHERE MaDH = @MaDH;

        DECLARE @NewMaHD CHAR(8);
        INSERT INTO HOA_DON (NgayLap, HinhThucThanhToan, TongTienGiamGia, TongTienThanhToan, TrangThaiThanhToan, MaNV, MaDH)
        VALUES (GETDATE(), @HinhThucThanhToan, 0, @TongTienSauGiam, @TrangThaiThanhToan, @MaNV, @MaDH);

        SELECT @NewMaHD = MaHD FROM HOA_DON WHERE MaHD = (SELECT 'HD' + RIGHT('000000' + CAST(MAX(CAST(SUBSTRING(MaHD, 3, 6) AS INT))  AS VARCHAR(6)), 6) FROM HOA_DON);

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

INSERT INTO LOAI_SAN_PHAM (MaLoaiSP, TenLoaiSP, ApDungTuyChon) VALUES 
('CAP', N'Cà phê', 1),
('CFT', N'Nguyên liệu', 0),
('MOR', N'Mật ong rừng', 0),
('MPH', N'Máy pha', 0),
('BBI', N'Bao bì & Vật tư tiêu hao', 0);
INSERT LOAI_XAY(TenLoaiXay,ThuTu) VALUES(N'Nguyên hạt',1),(N'Xay sẵn pha máy',2),(N'Xay sẵn pha phin',3);
INSERT TRONG_LUONG(TrongLuongGram,ThuTu) VALUES(200,1),(500,2),(1000,3),(2000,4);
INSERT LOAI_SP_LOAI_XAY SELECT 'CAP',MaLoaiXay FROM LOAI_XAY;
INSERT LOAI_SP_TRONG_LUONG SELECT 'CAP',MaTrongLuong FROM TRONG_LUONG;


-- Bảng Sản Phẩm
INSERT INTO SAN_PHAM (MaSP, TenSP, DonViTinh, TrongLuong, CongSuat, GiaBan, SoLuongTon, SoLuongKD, AnhSP, MaLoaiSP) VALUES 
('CFH31', N'Cà phê ĐẬM MẠNH', N'Gói', 0.10, NULL, 39500, 5700, 5385, 'javi-dam-manh-v2.png', 'CAP'),
('CFH41', N'Cà phê ĐẬM NGỌT', N'Gói', 0.10, NULL, 49500, 4250, 4060, 'javi-dam-ngot-v2.png', 'CAP'),
('CFH71', N'Cà phê CÂN BẰNG', N'Gói', 0.10, NULL, 64500, 3330, 3150, 'javi-can-bang-v2.png', 'CAP'),
('CFH81', N'Cà phê THƠM NGỌT', N'Gói', 0.10, NULL, 99500, 1930, 1760, 'javi-thom-ngot-v2.png', 'CAP'),
-- Dòng Máy pha cà phê JAVI chính hãng (Dữ liệu chuẩn từ mayphacafephin.com)
('MPTD9', N'JAVI PRO TD 4.9',  N'Máy', NULL, N'Công suất từ 3 - 4 ly', 49600000,  5,  4, 'MPTD9.jpg', 'MPH'),
('MPST8', N'JAVI PRO S4.99',   N'Máy', NULL, N'Công suất từ 3 - 4 ly', 89000000,  3,  3, 'MPST8.jpg', 'MPH'),
('MPI49', N'JAVI PRO I4.9',    N'Máy', NULL, N'Công suất từ 3 - 4 ly', 59800000,  4,  3, 'MPI49.jpg', 'MPH'),
('MPTD3', N'JAVI PRO TD3.9',   N'Máy', NULL, N'Công suất từ 3 - 4 ly', 47000000,  4,  4, 'MPTD3.jpg', 'MPH'),
('MPM30', N'JAVI M30',         N'Máy', NULL, N'Máy 30 ly',            279000000, 2,  1, 'MPM30.jpg', 'MPH'),
('MPM16', N'JAVI M16',         N'Máy', NULL, N'Máy 16 ly',            199200000, 3,  3, 'MPM16.jpg', 'MPH'),
('MPF05', N'JAVI PRO 2F05',    N'Máy', NULL, N'Máy 1 ly',              19900000, 10,  8, 'MPF05.jpg', 'MPH'),
('MPTD2', N'JAVI PRO TD2.9',   N'Máy', NULL, N'Máy 2 ly',              29900000,  5,  5, 'MPTD2.jpg', 'MPH'),
-- Nguyên liệu thô và bao bì
('NVCFT', N'Cà phê Robusta Thô', N'Kg', 1.00, NULL, 65000, 1000, 1000, 'NVCFT.jpg', 'CFT'),
('NVMOR', N'Mật ong rừng nguyên chất', N'Lít', 1.00, NULL, 150000, 100, 95, 'NVMOR.jpg', 'MOR'),
('BBI01', N'Ly nhựa PP 500ml', N'Cái', NULL, NULL, 1500, 5000, 5000, 'BBI01.jpg', 'BBI'),
('BBI02', N'Ly giấy 250ml', N'Cái', NULL, NULL, 2000, 4000, 4000, 'BBI02.jpg', 'BBI'),
('BBI03', N'Nắp cầu nhựa 500ml', N'Cái', NULL, NULL, 300, 5000, 5000, 'BBI03.jpg', 'BBI'),
('BBI05', N'Hộp quà tặng cứng', N'Hộp', NULL, NULL, 15000, 500, 480, 'BBI05.jpg', 'BBI'),
('BBI06', N'Túi tote họa tiết', N'Cái', NULL, NULL, 25000, 300, 290, 'BBI06.jpg', 'BBI');

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
(N'Nguyễn Minh Thư', '0903111001', 'nguyenminhthu.invn@gmail.com', N'Nữ', N'20 Phan Xích Long, PN', 'L01'),
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

-- Bảng tài khoản (Nhân viên hệ thống & Khách hàng demo)

INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, MaNV, MaKH, VaiTro) VALUES 
('admin_phat', '$2b$10$ZB78B3VzRf5313mH5ZdPtubnLFvCM78NoTbqxLG4Mo/bwHQqUEEWa', 'NV000001', NULL, 'NHAN_VIEN'),
('linh.pham', '$2b$10$XE8osxSPXi8wNAAThs1Cke3GkOYI8ijgqaXO38XlyLukIUjxpGF9u', 'NV000002', NULL, 'NHAN_VIEN'),
('son.nguyen', '$2b$10$VDNt9/hL/RgosttMBc/4Cua9axB7ObcEtmmkYsEGMO1rQ1LCHdi86', 'NV000003', NULL, 'NHAN_VIEN'),
('hien.tran', '$2b$10$5EyY6pnT4ZS15GuOqEcfm.oWgy0xglpKfDqRK6Nv7BxXgP9TvEC6y', 'NV000004', NULL, 'NHAN_VIEN'),
('sale_khang', '$2b$10$lHic5Mim/4JqLH7T/ycZ5.2EOjtpW8bkDSkqAFFyGx19xVkuMCjCm', 'NV000005', NULL, 'NHAN_VIEN'),
('kho_nam', '$2b$10$wChM2dSYFz0o8uoYKKAIEOQtfsAzhg8k1Dbpn.FIo7ihKWw9c0GEG', 'NV000006', NULL, 'NHAN_VIEN'),
('sale_thao', '$2b$10$g1NnJIjgm3QlKlOisyOYMOLE3u.gPtEuiWSvUJfy/Dryygvjl8BZu', 'NV000007', NULL, 'NHAN_VIEN'),
('ketoan_quan', '$2b$10$KZQ8D3BAOw.krQSqCX.O1e.QWMTwlFlEoylZZ/KsF73ToMC0Nn55C', 'NV000008', NULL, 'NHAN_VIEN'),
('admin_duc', '$2b$10$Ca/svHHzfaobU/LeRbJ5FO446jjCJy6Ffh3JFmMsPegruBbBBAqnS', 'NV000009', NULL, 'NHAN_VIEN'),
('admin_tri', '$2b$10$nECd9.2SQZ.lhltmqTOOSu5.EVnQMkMv8EWzVpBn1ga1lfjPMosOi', 'NV000010', NULL, 'NHAN_VIEN'),
-- Tài khoản khách hàng mẫu đăng nhập web/mua hàng (Mật khẩu mặc định: javi123)
('enduser_demo', '$2b$10$YKNLxanOPyedmRNllN4LfODeMLQ9H8T/24mXCQ2dpRBLxxIdr.P2W', NULL, 'KH000001', 'KHACH_HANG'),
('khachhang1',   '$2b$10$YKNLxanOPyedmRNllN4LfODeMLQ9H8T/24mXCQ2dpRBLxxIdr.P2W', NULL, 'KH000004', 'KHACH_HANG'),
('khachhang2',   '$2b$10$YKNLxanOPyedmRNllN4LfODeMLQ9H8T/24mXCQ2dpRBLxxIdr.P2W', NULL, 'KH000002', 'KHACH_HANG'),
('khachhang3',   '$2b$10$YKNLxanOPyedmRNllN4LfODeMLQ9H8T/24mXCQ2dpRBLxxIdr.P2W', NULL, 'KH000003', 'KHACH_HANG');

-- Bảng Phiếu nhập

INSERT INTO PHIEU_NHAP (NgayNhap, SoHoaDonNCC, TongTienNhap, SoTienDaTraNCC, TrangThaiThanhToan, GhiChu, MaNV, MaNCC) VALUES 
('2026-03-01 08:30:00', 'HDNCC-001', 65000000, 65000000, N'Đã thanh toán', N'Nhập Robusta thô đầu tháng', 'NV000004', 'NCC000002'),
('2026-03-02 09:15:00', 'HDNCC-002', 39500000, 39500000, N'Đã thanh toán', N'Nhập Arabica Đà Lạt', 'NV000004', 'NCC000001'),
('2026-03-05 14:00:00', 'HDNCC-003', 7500000, 7500000, N'Đã thanh toán', N'Nhập ly nhựa PP', 'NV000006', 'NCC000003'),
('2026-03-07 10:30:00', 'HDNCC-004', 15000000, 15000000, N'Đã thanh toán', N'Nhập mật ong rừng thô', 'NV000006', 'NCC000004'),
('2026-03-10 11:00:00', 'HDNCC-005', 248000000, 248000000, N'Đã thanh toán', N'Lô máy pha cao cấp Javi', 'NV000004', 'NCC000005'),
('2026-03-12 15:30:00', 'HDNCC-006', 8000000, 8000000, N'Đã thanh toán', N'Túi tote quà tặng', 'NV000012', 'NCC000007'),
('2026-03-15 09:00:00', 'HDNCC-007', 3000000, 3000000, N'Đã thanh toán', N'Tem nhãn decal dán bao bì', 'NV000012', 'NCC000016'),
('2026-03-18 16:20:00', 'HDNCC-008', 45000000, 45000000, N'Đã thanh toán', N'Nhập thêm Robusta BMT sàng 18', 'NV000016', 'NCC000008'),
('2026-03-20 13:45:00', 'HDNCC-009', 6000000, 0, N'Chưa thanh toán', N'Ly giấy thân thiện môi trường', 'NV000016', 'NCC000018'),
('2026-03-22 10:00:00', 'HDNCC-010', 12000000, 12000000, N'Đã thanh toán', N'Mật ong hoa cà phê Gia Lai', 'NV000004', 'NCC000010'),
('2026-03-25 14:10:00', 'HDNCC-011', 19750000, 19750000, N'Đã thanh toán', N'Cà phê Arabica thô Sơn La', 'NV000006', 'NCC000017'),
('2026-03-28 11:30:00', 'HDNCC-012', 4000000, 4000000, N'Đã thanh toán', N'Hộp quà tặng cứng cao cấp', 'NV000006', 'NCC000014'),
('2026-04-01 09:00:00', 'HDNCC-013', 32500000, 32500000, N'Đã thanh toán', N'Nhập Robusta thô đợt 2', 'NV000004', 'NCC000002'),
('2026-04-03 10:30:00', 'HDNCC-014', 15000000, 15000000, N'Đã thanh toán', N'Nhập bổ sung túi và phụ trợ', 'NV000012', 'NCC000011'),
('2026-04-05 13:00:00', 'HDNCC-015', 59800000, 59800000, N'Đã thanh toán', N'Nhập máy pha I4.9 phục vụ dự án', 'NV000016', 'NCC000005'),
('2026-04-08 14:45:00', 'HDNCC-016', 7500000, 0, N'Chưa thanh toán', N'Hộp quà tặng bổ sung', 'NV000004', 'NCC000014'),
('2026-04-10 16:00:00', 'HDNCC-017', 22500000, 22500000, N'Đã thanh toán', N'Hạt cà phê Đắk Mil hữu cơ', 'NV000006', 'NCC000012'),
('2026-04-12 09:15:00', 'HDNCC-018', 4500000, 4500000, N'Đã thanh toán', N'Bao tải đay lưu trữ thô', 'NV000012', 'NCC000020'),
('2026-04-15 11:00:00', 'HDNCC-019', 19750000, 19750000, N'Đã thanh toán', N'Nhập Arabica Cầu Đất', 'NV000016', 'NCC000015'),
('2026-04-18 15:20:00', 'HDNCC-020', 3000000, 3000000, N'Đã thanh toán', N'Khay nhựa phụ trợ bổ sung', 'NV000004', 'NCC000013');

-- Bảng chi tiết phiếu nhập

INSERT INTO CT_PHIEU_NHAP (MaPN, MaSP, SoLuong, GiaNhap) VALUES 
('PN000001', 'NVCFT', 1000, 65000),
('PN000002', 'CFH31', 100, 395000),
('PN000003', 'BBI01', 5000, 1500),
('PN000004', 'NVMOR', 100, 150000),
('PN000005', 'MPM30', 1, 248000000),
('PN000006', 'BBI06', 320, 25000),
('PN000007', 'BBI03', 10000, 300),
('PN000008', 'NVCFT', 692, 65000),
('PN000009', 'BBI02', 3000, 2000),
('PN000010', 'NVMOR', 80, 150000),
('PN000011', 'NVCFT', 303, 65000),
('PN000012', 'BBI05', 266, 15000),
('PN000013', 'NVCFT', 500, 65000),
('PN000014', 'BBI01', 10000, 1500),
('PN000015', 'MPI49', 1, 59800000),
('PN000016', 'BBI05', 500, 15000),
('PN000017', 'NVCFT', 346, 65000),
('PN000018', 'BBI01', 3000, 1500),
('PN000019', 'CFH31', 50, 395000),
('PN000020', 'BBI01', 2000, 1500);

-- Bảng Phiếu chi

INSERT INTO PHIEU_CHI (NgayChi, SoTienThucChi, HinhThucThanhToan, GhiChu, MaPN, MaNV) VALUES 
('2026-03-01 10:00:00', 65000000, N'Chuyển khoản', N'Thanh toán dứt điểm lô hàng Robusta thô', 'PN000001', 'NV000003'),
('2026-03-02 11:30:00', 39500000, N'Chuyển khoản', N'Tất toán toàn bộ tiền Arabica Đà Lạt', 'PN000002', 'NV000003'),
('2026-03-05 15:00:00', 7500000, N'Tiền mặt', N'Thanh toán tiền ly nhựa PP', 'PN000003', 'NV000008'),
('2026-03-07 16:30:00', 15000000, N'Tiền mặt', N'Thanh toán tiền mật ong rừng thô', 'PN000004', 'NV000020'),
('2026-03-10 13:00:00', 248000000, N'Chuyển khoản', N'Thanh toán lô máy pha Javi chính hãng', 'PN000005', 'NV000013'),
('2026-03-12 16:00:00', 8000000, N'Tiền mặt', N'Chi tiền nhập túi tote quà tặng', 'PN000006', 'NV000013'),
('2026-03-15 10:15:00', 3000000, N'Tiền mặt', N'Thanh toán tem nhãn bao bì', 'PN000007', 'NV000020'),
('2026-03-18 17:00:00', 45000000, N'Chuyển khoản', N'Thanh toán tiền Robusta BMT', 'PN000008', 'NV000020'),
('2026-03-22 11:00:00', 12000000, N'Chuyển khoản', N'Thanh toán tiền mật ong Gia Lai', 'PN000010', 'NV000003'),
('2026-03-25 15:30:00', 19750000, N'Chuyển khoản', N'Thanh toán tiền Arabica Sơn La thô', 'PN000011', 'NV000008'),
('2026-03-28 13:00:00', 4000000, N'Tiền mặt', N'Thanh toán tiền hộp quà tặng cứng', 'PN000012', 'NV000013'),
('2026-04-01 10:30:00', 32500000, N'Chuyển khoản', N'Thanh toán tiền Robusta thô đợt 2', 'PN000013', 'NV000003'),
('2026-04-03 14:00:00', 15000000, N'Tiền mặt', N'Thanh toán tiền vật tư túi giấy', 'PN000014', 'NV000008'),
('2026-04-05 15:00:00', 59800000, N'Chuyển khoản', N'Thanh toán máy pha I4.9 dự án', 'PN000015', 'NV000013'),
('2026-04-10 16:30:00', 22500000, N'Chuyển khoản', N'Thanh toán hạt cà phê Đắk Mil hữu cơ', 'PN000017', 'NV000020'),
('2026-04-12 10:00:00', 4500000, N'Tiền mặt', N'Thanh toán tiền mua bao tải đay', 'PN000018', 'NV000003'),
('2026-04-15 13:30:00', 19750000, N'Chuyển khoản', N'Thanh toán dứt điểm lô Arabica Cầu Đất thô', 'PN000019', 'NV000008'),
('2026-04-18 16:00:00', 3000000, N'Tiền mặt', N'Thanh toán tiền khay nhựa phụ trợ kho', 'PN000020', 'NV000013'),
('2026-04-22 09:30:00', 3000000, N'Tiền mặt', N'Chi tiền sửa chữa máy móc kho bảo trì', 'PN000002', 'NV000003'),
('2026-04-25 11:15:00', 6000000, N'Chuyển khoản', N'Tất toán lô tiền nợ ly giấy ECO', 'PN000009', 'NV000008');

-- Bảng đơn hàng

INSERT INTO DON_HANG (NgayDat, TongTienDonHang, TongGiamGiaSP, TongTienSauGiam, TrangThaiDonHang, NguonDon, MaNV, MaKH) VALUES 
('2026-04-01', 500000, 50000, 450000, N'Chờ giao', 'Sale', 'NV000002', 'KH000001'),
('2026-04-02', 49600000, 1000000, 48600000, N'Chờ giao', 'Sale', 'NV000002', 'KH000003'),
('2026-04-03', 1000000, 0, 1000000, N'Chờ giao', 'Sale', 'NV000005', 'KH000002'),
('2026-04-04', 150000, 0, 150000, N'Chờ giao', 'Sale', 'NV000005', 'KH000004'),
('2026-04-05', 800000, 40000, 760000, N'Chờ giao', 'Sale', 'NV000007', 'KH000005'),
('2026-04-06', 200000, 0, 200000, N'Chờ giao', 'Sale', 'NV000007', 'KH000006'),
('2026-04-07', 279000000, 5000000, 274000000, N'Chờ giao', 'Sale', 'NV000002', 'KH000007'),
('2026-04-08', 500000, 0, 500000, N'Chờ giao', 'Sale', 'NV000011', 'KH000008'),
('2026-04-09', 300000, 0, 300000, N'Chờ giao', 'Sale', 'NV000011', 'KH000009'),
('2026-04-10', 1200000, 60000, 1140000, N'Chờ giao', 'Sale', 'NV000002', 'KH000010'),
('2026-04-11', 400000, 0, 400000, N'Chờ giao', 'Sale', 'NV000014', 'KH000011'),
('2026-04-12', 650000, 0, 650000, N'Chờ giao', 'Sale', 'NV000014', 'KH000012'),
('2026-04-13', 1500000, 100000, 1400000, N'Chờ giao', 'Sale', 'NV000005', 'KH000013'),
('2026-04-14', 900000, 0, 900000, N'Chờ giao', 'Sale', 'NV000007', 'KH000014'),
('2026-04-15', 50000000, 2000000, 48000000, N'Chờ giao', 'Sale', 'NV000002', 'KH000015'),
('2026-04-16', 300000, 0, 300000, N'Chờ giao', 'Sale', 'NV000011', 'KH000016'),
('2026-04-17', 2500000, 125000, 2375000, N'Chờ giao', 'Sale', 'NV000015', 'KH000017'),
('2026-04-18', 100000, 0, 100000, N'Chờ giao', 'Sale', 'NV000015', 'KH000018'),
('2026-04-19', 450000, 0, 450000, N'Chờ giao', 'Sale', 'NV000017', 'KH000019'),
('2026-04-20', 89000000, 1000000, 88000000, N'Chờ giao', 'Sale', 'NV000002', 'KH000020');

-- Bảng chi tiết đơn hàng

INSERT INTO CT_DON_HANG (MaDH, MaSP, SoLuong, GiamGiaSP, TrongLuongGram, LoaiXay, DonGia) VALUES 
('DH000001', 'CFH31', 1, 0.1000, 1000, N'Nguyên hạt', 395000),
('DH000002', 'MPTD9', 1, 0.0202, NULL, NULL, (SELECT GiaBan FROM SAN_PHAM WHERE MaSP='MPTD9')),
('DH000003', 'CFH31', 12, 0.0000, 200, N'Nguyên hạt', 79000),
('DH000004', 'NVCFT', 1, 0.0000, NULL, NULL, (SELECT GiaBan FROM SAN_PHAM WHERE MaSP='NVCFT')),
('DH000005', 'CFH31', 2, 0.0500, 1000, N'Nguyên hạt', 395000),
('DH000006', 'CFH31', 1, 0.0000, 500, N'Nguyên hạt', 197500),
('DH000007', 'MPM30', 1, 0.0179, NULL, NULL, (SELECT GiaBan FROM SAN_PHAM WHERE MaSP='MPM30')),
('DH000008', 'CFH31', 1, 0.0000, 1000, N'Nguyên hạt', 395000),
('DH000009', 'CFH31', 1, 0.0000, 500, N'Nguyên hạt', 197500),
('DH000010', 'CFH31', 1, 0.0500, 1000, N'Nguyên hạt', 395000),
('DH000011', 'BBI01', 100, 0.0000, NULL, NULL, (SELECT GiaBan FROM SAN_PHAM WHERE MaSP='BBI01')),
('DH000012', 'BBI01', 50, 0.0000, NULL, NULL, (SELECT GiaBan FROM SAN_PHAM WHERE MaSP='BBI01')),
('DH000013', 'CFH31', 2, 0.0667, 1000, N'Nguyên hạt', 395000),
('DH000014', 'CFH31', 3, 0.0000, 500, N'Nguyên hạt', 197500),
('DH000015', 'MPTD9', 1, 0.0400, NULL, NULL, (SELECT GiaBan FROM SAN_PHAM WHERE MaSP='MPTD9')),
('DH000016', 'NVCFT', 5, 0.0000, NULL, NULL, (SELECT GiaBan FROM SAN_PHAM WHERE MaSP='NVCFT')),
('DH000017', 'CFH31', 10, 0.0500, 1000, N'Nguyên hạt', 395000),
('DH000018', 'BBI01', 50, 0.0000, NULL, NULL, (SELECT GiaBan FROM SAN_PHAM WHERE MaSP='BBI01')),
('DH000019', 'CFH31', 1, 0.0000, 1000, N'Nguyên hạt', 395000),
('DH000020', 'MPTD9', 1, 0.0112, NULL, NULL, (SELECT GiaBan FROM SAN_PHAM WHERE MaSP='MPTD9'));

-- Bảng hóa đơn 

INSERT INTO HOA_DON (NgayLap, HinhThucThanhToan, TongTienGiamGia, TongTienThanhToan, TrangThaiThanhToan, MaNV, MaDH) VALUES 
('2026-04-01', N'Tiền mặt', 50000, 450000, N'Đã thanh toán', 'NV000003', 'DH000001'),
('2026-04-02', N'Chuyển khoản', 1000000, 48600000, N'Chưa thanh toán', 'NV000003', 'DH000002'),
('2026-04-03', N'Tiền mặt', 0, 1000000, N'Đã thanh toán', 'NV000003', 'DH000003'),
('2026-04-04', N'Tiền mặt', 0, 150000, N'Đã thanh toán', 'NV000008', 'DH000004'),
('2026-04-05', N'Chuyển khoản', 40000, 760000, N'Đã thanh toán', 'NV000008', 'DH000005'),
('2026-04-06', N'Chuyển khoản', 0, 200000, N'Chưa thanh toán', 'NV000013', 'DH000006'),
('2026-04-07', N'Chuyển khoản', 5000000, 274000000, N'Đã thanh toán', 'NV000013', 'DH000007'),
('2026-04-08', N'Tiền mặt', 0, 500000, N'Đã thanh toán', 'NV000020', 'DH000008'),
('2026-04-09', N'Tiền mặt', 0, 300000, N'Chưa thanh toán', 'NV000020', 'DH000009'),
('2026-04-10', N'Chuyển khoản', 60000, 1140000, N'Đã thanh toán', 'NV000003', 'DH000010'),
('2026-04-11', N'Tiền mặt', 0, 400000, N'Đã thanh toán', 'NV000003', 'DH000011'),
('2026-04-12', N'Chuyển khoản', 0, 650000, N'Đã thanh toán', 'NV000008', 'DH000012'),
('2026-04-13', N'Chuyển khoản', 100000, 1400000, N'Chưa thanh toán', 'NV000008', 'DH000013'),
('2026-04-14', N'Tiền mặt', 0, 900000, N'Đã thanh toán', 'NV000013', 'DH000014'),
('2026-04-15', N'Chuyển khoản', 2000000, 48000000, N'Chưa thanh toán', 'NV000013', 'DH000015'),
('2026-04-16', N'Tiền mặt', 0, 300000, N'Đã thanh toán', 'NV000020', 'DH000016'),
('2026-04-17', N'Chuyển khoản', 125000, 2375000, N'Đã thanh toán', 'NV000020', 'DH000017'),
('2026-04-18', N'Tiền mặt', 0, 100000, N'Đã thanh toán', 'NV000003', 'DH000018'),
('2026-04-19', N'Chuyển khoản', 0, 450000, N'Đã thanh toán', 'NV000003', 'DH000019'),
('2026-04-20', N'Chuyển khoản', 1000000, 88000000, N'Chưa thanh toán', 'NV000008', 'DH000020');

-- Bảng Phiếu xuất

INSERT INTO PHIEU_XUAT (NgayXuat, TrangThaiGiaoHang, MaNV, MaDH) VALUES 
('2026-04-01', N'Đã giao hàng', 'NV000004', 'DH000001'),
('2026-04-02', N'Đã giao hàng', 'NV000004', 'DH000002'),
('2026-04-03', N'Đã giao hàng', 'NV000006', 'DH000003'),
('2026-04-04', N'Đã giao hàng', 'NV000006', 'DH000004'),
('2026-04-05', N'Đã giao hàng', 'NV000012', 'DH000005'),
('2026-04-06', N'Đã giao hàng', 'NV000012', 'DH000006'),
('2026-04-07', N'Đã giao hàng', 'NV000016', 'DH000007'),
('2026-04-08', N'Đã giao hàng', 'NV000016', 'DH000008'),
('2026-04-09', N'Đã giao hàng', 'NV000004', 'DH000009'),
('2026-04-10', N'Đã giao hàng', 'NV000006', 'DH000010'),
('2026-04-11', N'Đã giao hàng', 'NV000012', 'DH000011'),
('2026-04-12', N'Đã giao hàng', 'NV000016', 'DH000012'),
('2026-04-13', N'Đã giao hàng', 'NV000004', 'DH000013'),
('2026-04-14', N'Đã giao hàng', 'NV000006', 'DH000014'),
('2026-04-15', N'Đã giao hàng', 'NV000012', 'DH000015'),
('2026-04-16', N'Đã giao hàng', 'NV000016', 'DH000016'),
('2026-04-17', N'Đã giao hàng', 'NV000004', 'DH000017'),
('2026-04-18', N'Đã giao hàng', 'NV000006', 'DH000018'),
('2026-04-19', N'Đã giao hàng', 'NV000012', 'DH000019'),
('2026-04-20', N'Đã giao hàng', 'NV000016', 'DH000020');

-- Bảng Công nợ

INSERT INTO CONG_NO (HanThanhToan, NgayGhiNhan, SoTienDaTra, TongNo, SoDuCN, TrangThaiCN, MaHD) VALUES 
('2026-05-02', '2026-04-02', 0, 48600000, 48600000, N'Còn nợ', 'HD000002'),
('2026-05-15', '2026-04-15', 0, 48000000, 48000000, N'Còn nợ', 'HD000015'),
('2026-05-20', '2026-04-20', 0, 88000000, 88000000, N'Còn nợ', 'HD000020'),
('2026-05-01', '2026-04-01', 0, 450000,    450000,    N'Còn nợ', 'HD000001'),
('2026-05-05', '2026-04-05', 0, 760000,    760000,    N'Còn nợ', 'HD000005'),
('2026-05-03', '2026-04-03', 0, 1000000,   1000000,   N'Còn nợ', 'HD000003'),
('2026-05-12', '2026-04-12', 0, 650000,    650000,    N'Còn nợ', 'HD000012'),
('2026-05-17', '2026-04-17', 0, 2375000,   2375000,   N'Còn nợ', 'HD000017'),
('2026-05-19', '2026-04-19', 0, 450000,    450000,    N'Còn nợ', 'HD000019'),
('2026-05-10', '2026-04-10', 0, 1140000,   1140000,   N'Còn nợ', 'HD000010'),
('2026-05-06', '2026-04-06', 0, 200000,    200000,    N'Còn nợ', 'HD000006'),
('2026-05-07', '2026-04-07', 0, 274000000, 274000000, N'Còn nợ', 'HD000007'),
('2026-05-08', '2026-04-08', 0, 500000,    500000,    N'Còn nợ', 'HD000008'),
('2026-05-09', '2026-04-09', 0, 300000,    300000,    N'Còn nợ', 'HD000009'),
('2026-05-11', '2026-04-11', 0, 400000,    400000,    N'Còn nợ', 'HD000011'),
('2026-05-13', '2026-04-13', 0, 1400000,   1400000,   N'Còn nợ', 'HD000013'),
('2026-05-14', '2026-04-14', 0, 900000,    900000,    N'Còn nợ', 'HD000014'),
('2026-05-16', '2026-04-16', 0, 300000,    300000,    N'Còn nợ', 'HD000016'),
('2026-05-18', '2026-04-18', 0, 100000,    100000,    N'Còn nợ', 'HD000018'),
('2026-05-25', '2026-04-25', 0, 1140000,   1140000,   N'Còn nợ', 'HD000010');
GO

-- Bảng Phiếu thu

INSERT INTO PHIEU_THU (NgayThu, SoTienThucThu, HinhThucThanhToan, GhiChu, MaCN, MaNV) VALUES 
('2026-04-01 09:00:00', 450000,    N'Tiền mặt',    N'Thu hồi công nợ trực tiếp khi giao đơn HD000001', 'CN000004', 'NV000003'),
('2026-04-05 10:30:00', 20000000,  N'Chuyển khoản', N'Thu tiền nợ đợt 1 hợp đồng đơn máy pha HD000002', 'CN000001', 'NV000003'),
('2026-04-07 14:15:00', 1000000,   N'Tiền mặt',    N'Thu nợ dứt điểm đơn hàng hạt sỉ HD000003',       'CN000006', 'NV000008'),
('2026-04-10 11:00:00', 1140000,   N'Chuyển khoản', N'Thu hồi công nợ hóa đơn hạt xay HD000010',       'CN000010', 'NV000020'),
('2026-04-12 15:30:00', 650000,    N'Chuyển khoản', N'Thu hồi nợ thanh toán vật tư tiêu hao HD000012', 'CN000007', 'NV000003'),
('2026-04-15 09:45:00', 10000000,  N'Chuyển khoản', N'Thu nợ đợt 1 đơn hàng lớn đại lý HD000015',      'CN000002', 'NV000013'),
('2026-04-17 16:20:00', 2375000,   N'Tiền mặt',    N'Tất toán nợ đơn hàng hạt xay đặc sản HD000017',   'CN000008', 'NV000020'),
('2026-04-19 13:00:00', 450000,    N'Tiền mặt',    N'Thu tiền thanh toán trực tiếp đơn lẻ HD000019',    'CN000009', 'NV000003'),
('2026-04-22 10:10:00', 500000,    N'Tiền mặt',    N'Thu bồi thêm tiền nợ đơn hàng máy pha HD000002',  'CN000001', 'NV000008'),
('2026-04-25 15:00:00', 274000000, N'Chuyển khoản', N'Tất toán hóa đơn máy pha JAVI M30 đơn HD000007',  'CN000012', 'NV000013'),
('2026-04-26 11:30:00', 200000,    N'Tiền mặt',    N'Thu dứt điểm nợ hóa đơn bán lẻ HD000006',        'CN000011', 'NV000003'),
('2026-04-27 14:00:00', 400000,    N'Chuyển khoản', N'Thu hồi nợ tiền bao bì đóng gói HD000011',       'CN000015', 'NV000008'),
('2026-04-28 10:15:00', 900000,    N'Tiền mặt',    N'Khách sỉ thanh toán dứt điểm đơn HD000014',       'CN000017', 'NV000020'),
('2026-04-29 16:00:00', 300000,    N'Tiền mặt',    N'Tất toán hóa đơn mua hạt thô đơn HD000009',       'CN000014', 'NV000003'),
('2026-04-30 09:30:00', 100000,    N'Tiền mặt',    N'Thu hồi nợ tiền vật tư cốc ly đơn HD000018',       'CN000019', 'NV000008'),
('2026-05-01 11:00:00', 760000,    N'Chuyển khoản', N'Tất toán tiền đơn hàng muộn đơn HD000005',        'CN000005', 'NV000013'),
('2026-05-02 14:45:00', 1000000,   N'Tiền mặt',    N'Thu tiền nợ gối đầu đơn HD000003',               'CN000006', 'NV000020'),
('2026-05-03 10:00:00', 300000,    N'Chuyển khoản', N'Thu hồi nợ hóa đơn lẻ bổ sung đơn HD000009',     'CN000014', 'NV000003'),
('2026-05-04 15:20:00', 1400000,   N'Tiền mặt',    N'Đại lý dứt điểm tiền nợ đơn tháng HD000013',      'CN000016', 'NV000008'),
('2026-05-05 16:10:00', 500000,    N'Chuyển khoản', N'Khách hàng tất toán nợ bồi đợt cuối đơn HD000002', 'CN000001', 'NV000020');
GO

-- Bảng Giỏ hàng (Dữ liệu mẫu sản phẩm trong giỏ của khách hàng)
INSERT INTO GIO_HANG (TenDangNhap, MaSP, SoLuong, TrongLuongGram, LoaiXay) VALUES 
('enduser_demo', 'CFH31', 2, 1000, N'Nguyên hạt'),
('enduser_demo', 'CFH31', 1, 500, N'Xay sẵn pha phin'),
('khachhang1', 'CFH31', 2, 1000, N'Nguyên hạt'),
('khachhang1', 'CFH31', 1, 500, N'Xay sẵn pha phin'),
('khachhang2', 'CFH71', 1, 1000, N'Nguyên hạt'),
('khachhang2', 'BBI06', 2, NULL, NULL),
('khachhang3', 'MPTD9', 1, NULL, NULL);
GO

-- Bảng Cấu hình sản phẩm website
INSERT INTO WEB_SAN_PHAM(MaSP,HienThi,ViTri,ThuTu,MoTa)
SELECT sp.MaSP,CASE WHEN sp.MaSP='NVCFT' THEN 0 ELSE 1 END, CASE WHEN lsp.TenLoaiSP LIKE N'%máy%' THEN N'MayPha' WHEN sp.MaLoaiSP='CAP' THEN N'CaPhe' ELSE N'PhuKien' END,
 ROW_NUMBER() OVER(ORDER BY sp.MaSP), N'Tìm hương vị và lựa chọn phù hợp với nhịp sống của bạn. Liên hệ JAVI để được tư vấn cách sử dụng và bảo quản.'
FROM SAN_PHAM sp LEFT JOIN LOAI_SAN_PHAM lsp ON lsp.MaLoaiSP=sp.MaLoaiSP
WHERE NOT EXISTS(SELECT 1 FROM WEB_SAN_PHAM w WHERE w.MaSP=sp.MaSP);
-- Bảng Cấu hình website
INSERT INTO WEB_CAU_HINH(ID,GioiThieu,EmailLienHe) VALUES(1,N'Từ cảm hứng cà phê phin Việt, JAVI kết nối văn hóa thưởng thức với sự sáng tạo trong cách pha. Chúng tôi mong mỗi lựa chọn cà phê, mỗi chiếc máy trở thành một phần gần gũi của cuộc sống thường ngày.','javicoffee0@gmail.com');
-- Bảng Bài viết blog
INSERT INTO WEB_BAI_VIET(TieuDe,Slug,ChuyenMuc,TomTat,NoiDung,AnhBia,TrangThai,NgayDang) VALUES(
 N'Chọn cà phê cho một ngày thật vừa vặn','chon-ca-phe-cho-moi-ngay',N'Cà phê',
 N'Không cần bắt đầu bằng những thuật ngữ phức tạp. Hãy bắt đầu bằng hương vị bạn thích và cách pha bạn dùng mỗi ngày.',
 N'## Bắt đầu từ điều bạn thích
Một tách cà phê ngon trước hết là một tách cà phê hợp khẩu vị. Bạn thích vị đậm, cảm giác tròn đầy hay một tách nhẹ và thanh hơn? Ghi nhớ cảm nhận của chính mình là cách dễ nhất để lựa chọn ở lần tiếp theo.

## Hạt hay xay sẵn?
Nếu có máy xay, mua cà phê hạt giúp bạn chủ động điều chỉnh độ xay theo cách pha. Nếu chưa có, cà phê xay sẵn vẫn là lựa chọn thuận tiện. Hãy chọn độ xay phù hợp với phin, máy espresso hoặc dụng cụ lọc; cùng một cỡ xay không phù hợp với tất cả.

## Mua lượng vừa đủ và bảo quản đúng
Chọn dung lượng phù hợp với mức sử dụng để hạn chế mở bao quá lâu. Giữ cà phê trong bao bì kín, tránh ánh nắng, hơi nước và nguồn nhiệt. Đóng kín sau mỗi lần sử dụng và làm theo thông tin trên nhãn sản phẩm.

## Hỏi thêm, thử thêm, tìm vị riêng
Bạn không cần chọn đúng ngay từ lần đầu. Hãy bắt đầu từ một gói nhỏ và ghi lại công thức pha. JAVI mong muốn giúp bạn hiểu lựa chọn của mình trước khi quyết định mua.',
 '/images/javi-editorial-hero.png',N'Đã xuất bản',SYSDATETIME());
INSERT INTO WEB_BAI_VIET(TieuDe,Slug,ChuyenMuc,TomTat,NoiDung,AnhBia,TrangThai,NgayDang) VALUES(
 N'Một chiếc máy pha phù hợp, hơn là một chiếc máy thật lớn','may-pha-phu-hop-voi-ban',N'Máy pha',
 N'Từ góc bếp đến quầy nhỏ: ba câu hỏi nên trả lời trước khi chọn máy pha cà phê.',
 N'## Bạn pha bao nhiêu ly mỗi ngày?
Nhu cầu sử dụng là điểm khởi đầu. Máy cho gia đình thường có ưu tiên khác với máy dành cho quán phục vụ liên tục. Hãy cân nhắc số ly trong giờ cao điểm, thời gian chờ và khả năng sử dụng đồng thời vòi đánh sữa.

## Đừng quên máy xay và không gian đặt máy
Máy xay phù hợp giúp bạn kiểm soát độ mịn tốt hơn. Khi dự trù ngân sách, hãy tính cả máy xay, dụng cụ vệ sinh và không gian thao tác. Đọc kỹ thông số điện, kích thước và hướng dẫn lắp đặt của nhà sản xuất trước khi mua.

## Chăm sóc máy là một phần của trải nghiệm
Vệ sinh sau mỗi ngày sử dụng và làm theo lịch bảo dưỡng được hướng dẫn giúp giữ ổn định hương vị và quá trình vận hành. Không tự tháo lắp bộ phận điện hoặc áp lực nếu không có chuyên môn.

## Lựa chọn cùng người tư vấn
Hãy mô tả nhu cầu thật của bạn thay vì chỉ so sánh công suất trên giấy. JAVI có thể cùng bạn xem thông số của từng sản phẩm và tìm phương án phù hợp với mục đích sử dụng.',
 '/images/javi-editorial-hero.png',N'Đã xuất bản',SYSDATETIME());
INSERT INTO WEB_BAI_VIET(TieuDe,Slug,ChuyenMuc,TomTat,NoiDung,AnhBia,TrangThai,NgayDang) VALUES(
 N'JAVI và những khoảng dừng bên tách cà phê','javi-va-nhung-khoang-dung',N'Chuyện JAVI',
 N'Chúng tôi muốn việc chọn cà phê trở nên gần gũi hơn: rõ thông tin, dễ lựa chọn và có người đồng hành.',
 N'## Giữ nét riêng của phin Việt
Câu chuyện JAVI bắt đầu từ sự trân trọng văn hóa cà phê phin và mong muốn đưa tinh thần ấy vào những giải pháp pha hiện đại. Theo giới thiệu của doanh nghiệp, cảm hứng từ phin Việt được kết hợp với tìm tòi kỹ thuật và hoạt động chế tác tại Việt Nam. Điều đáng chú ý ở đây là cách giữ lại một thói quen quen thuộc trong nhịp sống mới.

## Một khoảng dừng trong ngày
Giữa những lịch trình bận rộn, vài phút chuẩn bị cà phê có thể trở thành một thói quen dễ chịu. Điều JAVI muốn chia sẻ không chỉ là sản phẩm mà còn là sự tò mò và niềm vui khi tìm ra hương vị riêng.

## Thông tin rõ ràng, lựa chọn vừa đủ
Chúng tôi xây dựng website với mong muốn giúp bạn xem thông tin sản phẩm, tìm hiểu cách pha và cân nhắc nhu cầu trước khi mua. Những bài viết trên góc cà phê là điểm khởi đầu cho cuộc trò chuyện ấy.

## Từ một đơn hàng đến một cuộc trò chuyện
Sau khi đặt hàng, bạn nhận được thông tin xác nhận để dễ kiểm tra sản phẩm và địa chỉ giao. Với các câu hỏi về độ xay, dụng cụ hay cách dùng máy, hãy liên hệ để được hỗ trợ theo thông tin của từng sản phẩm.

## Cùng viết tiếp câu chuyện
Chúng tôi trân trọng phản hồi của bạn về trải nghiệm mua hàng và nội dung muốn tìm hiểu. Mỗi góp ý giúp JAVI xây dựng một không gian cà phê hữu ích và gần gũi hơn.',
 '/images/javi-editorial-hero.png',N'Đã xuất bản',SYSDATETIME());
GO


-- Các bảng WEB_DON_HANG, WEB_CT_DON_HANG và WEB_EMAIL phát sinh khi khách đặt hàng.
-- SMTP và mật khẩu ứng dụng được cấu hình riêng trong be/.env.


-- Danh mục lấy từ provinces.open-api.vn/api/v2/, lưu ngày 17/10/2026.
INSERT INTO WEB_TINH_THANH (MaTinhThanh, TenTinhThanh) VALUES
(1, N'Thành phố Hà Nội'),
(4, N'Tỉnh Cao Bằng'),
(8, N'Tỉnh Tuyên Quang'),
(11, N'Tỉnh Điện Biên'),
(12, N'Tỉnh Lai Châu'),
(14, N'Tỉnh Sơn La'),
(15, N'Tỉnh Lào Cai'),
(19, N'Tỉnh Thái Nguyên'),
(20, N'Tỉnh Lạng Sơn'),
(22, N'Tỉnh Quảng Ninh'),
(24, N'Tỉnh Bắc Ninh'),
(25, N'Tỉnh Phú Thọ'),
(31, N'Thành phố Hải Phòng'),
(33, N'Tỉnh Hưng Yên'),
(37, N'Tỉnh Ninh Bình'),
(38, N'Tỉnh Thanh Hóa'),
(40, N'Tỉnh Nghệ An'),
(42, N'Tỉnh Hà Tĩnh'),
(44, N'Tỉnh Quảng Trị'),
(46, N'Thành phố Huế'),
(48, N'Thành phố Đà Nẵng'),
(51, N'Tỉnh Quảng Ngãi'),
(52, N'Tỉnh Gia Lai'),
(56, N'Tỉnh Khánh Hòa'),
(66, N'Tỉnh Đắk Lắk'),
(68, N'Tỉnh Lâm Đồng'),
(75, N'Tỉnh Đồng Nai'),
(79, N'Thành phố Hồ Chí Minh'),
(80, N'Tỉnh Tây Ninh'),
(82, N'Tỉnh Đồng Tháp'),
(86, N'Tỉnh Vĩnh Long'),
(91, N'Tỉnh An Giang'),
(92, N'Thành phố Cần Thơ'),
(96, N'Tỉnh Cà Mau');
GO
INSERT INTO WEB_PHUONG_XA (MaPhuongXa, MaTinhThanh, TenPhuongXa) VALUES
(4, 1, N'Phường Ba Đình'),
(8, 1, N'Phường Ngọc Hà'),
(25, 1, N'Phường Giảng Võ'),
(70, 1, N'Phường Hoàn Kiếm'),
(82, 1, N'Phường Cửa Nam'),
(91, 1, N'Phường Phú Thượng'),
(97, 1, N'Phường Hồng Hà'),
(103, 1, N'Phường Tây Hồ'),
(118, 1, N'Phường Bồ Đề'),
(127, 1, N'Phường Việt Hưng'),
(136, 1, N'Phường Phúc Lợi'),
(145, 1, N'Phường Long Biên'),
(160, 1, N'Phường Nghĩa Đô'),
(166, 1, N'Phường Cầu Giấy'),
(175, 1, N'Phường Yên Hòa'),
(190, 1, N'Phường Ô Chợ Dừa'),
(199, 1, N'Phường Láng'),
(226, 1, N'Phường Văn Miếu - Quốc Tử Giám'),
(229, 1, N'Phường Kim Liên'),
(235, 1, N'Phường Đống Đa'),
(256, 1, N'Phường Hai Bà Trưng'),
(283, 1, N'Phường Vĩnh Tuy'),
(292, 1, N'Phường Bạch Mai'),
(301, 1, N'Phường Vĩnh Hưng'),
(316, 1, N'Phường Định Công'),
(322, 1, N'Phường Tương Mai'),
(328, 1, N'Phường Lĩnh Nam'),
(331, 1, N'Phường Hoàng Mai'),
(337, 1, N'Phường Hoàng Liệt'),
(340, 1, N'Phường Yên Sở'),
(352, 1, N'Phường Phương Liệt'),
(364, 1, N'Phường Khương Đình'),
(367, 1, N'Phường Thanh Xuân'),
(376, 1, N'Xã Sóc Sơn'),
(382, 1, N'Xã Kim Anh'),
(385, 1, N'Xã Trung Giã'),
(430, 1, N'Xã Đa Phúc'),
(433, 1, N'Xã Nội Bài'),
(454, 1, N'Xã Đông Anh'),
(466, 1, N'Xã Phúc Thịnh'),
(475, 1, N'Xã Thư Lâm'),
(493, 1, N'Xã Thiên Lộc'),
(508, 1, N'Xã Vĩnh Thanh'),
(541, 1, N'Xã Phù Đổng'),
(562, 1, N'Xã Thuận An'),
(565, 1, N'Xã Gia Lâm'),
(577, 1, N'Xã Bát Tràng'),
(592, 1, N'Phường Từ Liêm'),
(598, 1, N'Phường Thượng Cát'),
(602, 1, N'Phường Đông Ngạc'),
(611, 1, N'Phường Xuân Đỉnh'),
(613, 1, N'Phường Tây Tựu'),
(619, 1, N'Phường Phú Diễn'),
(622, 1, N'Phường Xuân Phương'),
(634, 1, N'Phường Tây Mỗ'),
(637, 1, N'Phường Đại Mỗ'),
(640, 1, N'Xã Thanh Trì'),
(643, 1, N'Phường Thanh Liệt'),
(664, 1, N'Xã Đại Thanh'),
(679, 1, N'Xã Ngọc Hồi'),
(685, 1, N'Xã Nam Phù'),
(4930, 1, N'Xã Yên Xuân'),
(8974, 1, N'Xã Quang Minh'),
(8980, 1, N'Xã Yên Lãng'),
(8995, 1, N'Xã Tiến Thắng'),
(9022, 1, N'Xã Mê Linh'),
(9552, 1, N'Phường Kiến Hưng'),
(9556, 1, N'Phường Hà Đông'),
(9562, 1, N'Phường Yên Nghĩa'),
(9568, 1, N'Phường Phú Lương'),
(9574, 1, N'Phường Sơn Tây'),
(9604, 1, N'Phường Tùng Thiện'),
(9616, 1, N'Xã Đoài Phương'),
(9619, 1, N'Xã Quảng Oai'),
(9634, 1, N'Xã Cổ Đô'),
(9661, 1, N'Xã Minh Châu'),
(9664, 1, N'Xã Vật Lại'),
(9676, 1, N'Xã Bất Bạt'),
(9694, 1, N'Xã Suối Hai'),
(9700, 1, N'Xã Ba Vì'),
(9706, 1, N'Xã Yên Bài'),
(9715, 1, N'Xã Phúc Thọ'),
(9739, 1, N'Xã Phúc Lộc'),
(9772, 1, N'Xã Hát Môn'),
(9784, 1, N'Xã Đan Phượng'),
(9787, 1, N'Xã Liên Minh'),
(9817, 1, N'Xã Ô Diên'),
(9832, 1, N'Xã Hoài Đức'),
(9856, 1, N'Xã Dương Hòa'),
(9871, 1, N'Xã Sơn Đồng'),
(9877, 1, N'Xã An Khánh'),
(9886, 1, N'Phường Dương Nội'),
(9895, 1, N'Xã Quốc Oai'),
(9910, 1, N'Xã Kiều Phú'),
(9931, 1, N'Xã Hưng Đạo'),
(9952, 1, N'Xã Phú Cát'),
(9955, 1, N'Xã Thạch Thất'),
(9982, 1, N'Xã Hạ Bằng'),
(9988, 1, N'Xã Hòa Lạc'),
(10003, 1, N'Xã Tây Phương'),
(10015, 1, N'Phường Chương Mỹ'),
(10030, 1, N'Xã Phú Nghĩa'),
(10045, 1, N'Xã Xuân Mai'),
(10072, 1, N'Xã Quảng Bị'),
(10081, 1, N'Xã Trần Phú'),
(10096, 1, N'Xã Hòa Phú'),
(10114, 1, N'Xã Thanh Oai'),
(10126, 1, N'Xã Bình Minh'),
(10144, 1, N'Xã Tam Hưng'),
(10180, 1, N'Xã Dân Hòa'),
(10183, 1, N'Xã Thường Tín'),
(10210, 1, N'Xã Hồng Vân'),
(10231, 1, N'Xã Thượng Phúc'),
(10237, 1, N'Xã Chương Dương'),
(10273, 1, N'Xã Phú Xuyên'),
(10279, 1, N'Xã Phượng Dực'),
(10330, 1, N'Xã Chuyên Mỹ'),
(10342, 1, N'Xã Đại Xuyên'),
(10354, 1, N'Xã Vân Đình'),
(10369, 1, N'Xã Ứng Thiên'),
(10402, 1, N'Xã Ứng Hòa'),
(10417, 1, N'Xã Hòa Xá'),
(10441, 1, N'Xã Mỹ Đức'),
(10459, 1, N'Xã Phúc Sơn'),
(10465, 1, N'Xã Hồng Sơn'),
(10489, 1, N'Xã Hương Sơn'),
(1273, 4, N'Phường Thục Phán'),
(1279, 4, N'Phường Nùng Trí Cao'),
(1288, 4, N'Phường Tân Giang'),
(1290, 4, N'Xã Bảo Lâm'),
(1294, 4, N'Xã Lý Bôn'),
(1297, 4, N'Xã Nam Quang'),
(1304, 4, N'Xã Quảng Lâm'),
(1318, 4, N'Xã Yên Thổ'),
(1321, 4, N'Xã Bảo Lạc'),
(1324, 4, N'Xã Cốc Pàng'),
(1327, 4, N'Xã Cô Ba'),
(1336, 4, N'Xã Khánh Xuân'),
(1339, 4, N'Xã Xuân Trường'),
(1351, 4, N'Xã Hưng Đạo'),
(1354, 4, N'Xã Huy Giáp'),
(1360, 4, N'Xã Sơn Lộ'),
(1363, 4, N'Xã Thông Nông'),
(1366, 4, N'Xã Cần Yên'),
(1387, 4, N'Xã Thanh Long'),
(1392, 4, N'Xã Trường Hà'),
(1393, 4, N'Xã Lũng Nặm'),
(1414, 4, N'Xã Tổng Cọt'),
(1438, 4, N'Xã Hà Quảng'),
(1447, 4, N'Xã Trà Lĩnh'),
(1456, 4, N'Xã Quang Hán'),
(1465, 4, N'Xã Quang Trung'),
(1477, 4, N'Xã Trùng Khánh'),
(1489, 4, N'Xã Đình Phong'),
(1501, 4, N'Xã Đàm Thủy'),
(1525, 4, N'Xã Đoài Dương'),
(1537, 4, N'Xã Lý Quốc'),
(1552, 4, N'Xã Quang Long'),
(1558, 4, N'Xã Hạ Lang'),
(1561, 4, N'Xã Vinh Quý'),
(1576, 4, N'Xã Quảng Uyên'),
(1594, 4, N'Xã Độc Lập'),
(1618, 4, N'Xã Hạnh Phúc'),
(1636, 4, N'Xã Bế Văn Đàn'),
(1648, 4, N'Xã Phục Hòa'),
(1654, 4, N'Xã Hòa An'),
(1660, 4, N'Xã Nam Tuấn'),
(1699, 4, N'Xã Nguyễn Huệ'),
(1708, 4, N'Xã Bạch Đằng'),
(1726, 4, N'Xã Nguyên Bình'),
(1729, 4, N'Xã Tĩnh Túc'),
(1738, 4, N'Xã Ca Thành'),
(1747, 4, N'Xã Minh Tâm'),
(1768, 4, N'Xã Phan Thanh'),
(1774, 4, N'Xã Tam Kim'),
(1777, 4, N'Xã Thành Công'),
(1786, 4, N'Xã Đông Khê'),
(1789, 4, N'Xã Canh Tân'),
(1792, 4, N'Xã Kim Đồng'),
(1795, 4, N'Xã Minh Khai'),
(1807, 4, N'Xã Thạch An'),
(1822, 4, N'Xã Đức Long'),
(691, 8, N'Phường Hà Giang 2'),
(694, 8, N'Phường Hà Giang 1'),
(700, 8, N'Xã Ngọc Đường'),
(706, 8, N'Xã Phú Linh'),
(715, 8, N'Xã Lũng Cú'),
(721, 8, N'Xã Đồng Văn'),
(733, 8, N'Xã Sà Phìn'),
(745, 8, N'Xã Phố Bảng'),
(763, 8, N'Xã Lũng Phìn'),
(769, 8, N'Xã Mèo Vạc'),
(778, 8, N'Xã Sơn Vĩ'),
(787, 8, N'Xã Sủng Máng'),
(802, 8, N'Xã Khâu Vai'),
(808, 8, N'Xã Tát Ngà'),
(817, 8, N'Xã Niêm Sơn'),
(820, 8, N'Xã Yên Minh'),
(829, 8, N'Xã Thắng Mố'),
(832, 8, N'Xã Bạch Đích'),
(847, 8, N'Xã Mậu Duệ'),
(859, 8, N'Xã Ngọc Long'),
(865, 8, N'Xã Đường Thượng'),
(871, 8, N'Xã Du Già'),
(874, 8, N'Xã Quản Bạ'),
(883, 8, N'Xã Cán Tỷ'),
(889, 8, N'Xã Nghĩa Thuận'),
(892, 8, N'Xã Tùng Vài'),
(901, 8, N'Xã Lùng Tám'),
(913, 8, N'Xã Vị Xuyên'),
(919, 8, N'Xã Minh Tân'),
(922, 8, N'Xã Thuận Hoà'),
(925, 8, N'Xã Tùng Bá'),
(928, 8, N'Xã Thanh Thủy'),
(937, 8, N'Xã Lao Chải'),
(952, 8, N'Xã Cao Bồ'),
(958, 8, N'Xã Thượng Sơn'),
(967, 8, N'Xã Việt Lâm'),
(970, 8, N'Xã Linh Hồ'),
(976, 8, N'Xã Bạch Ngọc'),
(982, 8, N'Xã Minh Sơn'),
(985, 8, N'Xã Giáp Trung'),
(991, 8, N'Xã Bắc Mê'),
(994, 8, N'Xã Minh Ngọc'),
(1006, 8, N'Xã Yên Cường'),
(1012, 8, N'Xã Đường Hồng'),
(1021, 8, N'Xã Hoàng Su Phì'),
(1024, 8, N'Xã Bản Máy'),
(1033, 8, N'Xã Thàng Tín'),
(1051, 8, N'Xã Tân Tiến'),
(1057, 8, N'Xã Pờ Ly Ngài'),
(1075, 8, N'Xã Nậm Dịch'),
(1084, 8, N'Xã Hồ Thầu'),
(1090, 8, N'Xã Thông Nguyên'),
(1096, 8, N'Xã Pà Vầy Sủ'),
(1108, 8, N'Xã Xín Mần'),
(1117, 8, N'Xã Trung Thịnh'),
(1141, 8, N'Xã Nấm Dẩn'),
(1144, 8, N'Xã Quảng Nguyên'),
(1147, 8, N'Xã Khuôn Lùng'),
(1153, 8, N'Xã Bắc Quang'),
(1156, 8, N'Xã Vĩnh Tuy'),
(1165, 8, N'Xã Đồng Tâm'),
(1171, 8, N'Xã Tân Quang'),
(1180, 8, N'Xã Bằng Hành'),
(1192, 8, N'Xã Liên Hiệp'),
(1201, 8, N'Xã Hùng An'),
(1216, 8, N'Xã Đồng Yên'),
(1225, 8, N'Xã Tiên Nguyên'),
(1234, 8, N'Xã Yên Thành'),
(1237, 8, N'Xã Quang Bình'),
(1243, 8, N'Xã Tân Trịnh'),
(1246, 8, N'Xã Bằng Lang'),
(1255, 8, N'Xã Xuân Giang'),
(1261, 8, N'Xã Tiên Yên'),
(2212, 8, N'Phường Nông Tiến'),
(2215, 8, N'Phường Minh Xuân'),
(2221, 8, N'Xã Nà Hang'),
(2239, 8, N'Xã Thượng Nông'),
(2245, 8, N'Xã Côn Lôn'),
(2248, 8, N'Xã Yên Hoa'),
(2260, 8, N'Xã Hồng Thái'),
(2266, 8, N'Xã Lâm Bình'),
(2269, 8, N'Xã Thượng Lâm'),
(2287, 8, N'Xã Chiêm Hoá'),
(2296, 8, N'Xã Bình An'),
(2302, 8, N'Xã Minh Quang'),
(2305, 8, N'Xã Trung Hà'),
(2308, 8, N'Xã Tân Mỹ'),
(2317, 8, N'Xã Yên Lập'),
(2320, 8, N'Xã Tân An'),
(2332, 8, N'Xã Kiên Đài'),
(2350, 8, N'Xã Kim Bình'),
(2353, 8, N'Xã Hoà An'),
(2359, 8, N'Xã Tri Phú'),
(2365, 8, N'Xã Yên Nguyên'),
(2374, 8, N'Xã Hàm Yên'),
(2380, 8, N'Xã Bạch Xa'),
(2392, 8, N'Xã Phù Lưu'),
(2398, 8, N'Xã Yên Phú'),
(2404, 8, N'Xã Bình Xa'),
(2407, 8, N'Xã Thái Sơn'),
(2419, 8, N'Xã Thái Hoà'),
(2425, 8, N'Xã Hùng Đức'),
(2434, 8, N'Xã Lực Hành'),
(2437, 8, N'Xã Kiến Thiết'),
(2449, 8, N'Xã Xuân Vân'),
(2455, 8, N'Xã Hùng Lợi'),
(2458, 8, N'Xã Trung Sơn'),
(2470, 8, N'Xã Tân Long'),
(2473, 8, N'Xã Yên Sơn'),
(2494, 8, N'Xã Thái Bình'),
(2509, 8, N'Phường Mỹ Lâm'),
(2512, 8, N'Phường An Tường'),
(2524, 8, N'Phường Bình Thuận'),
(2530, 8, N'Xã Nhữ Khê'),
(2536, 8, N'Xã Sơn Dương'),
(2545, 8, N'Xã Tân Trào'),
(2548, 8, N'Xã Bình Ca'),
(2554, 8, N'Xã Minh Thanh'),
(2572, 8, N'Xã Đông Thọ'),
(2578, 8, N'Xã Tân Thanh'),
(2608, 8, N'Xã Hồng Sơn'),
(2611, 8, N'Xã Phú Lương'),
(2620, 8, N'Xã Sơn Thuỷ'),
(2623, 8, N'Xã Trường Sinh'),
(3127, 11, N'Phường Điện Biên Phủ'),
(3151, 11, N'Phường Mường Lay'),
(3158, 11, N'Xã Sín Thầu'),
(3160, 11, N'Xã Mường Nhé'),
(3162, 11, N'Xã Nậm Kè'),
(3163, 11, N'Xã Mường Toong'),
(3164, 11, N'Xã Quảng Lâm'),
(3166, 11, N'Xã Mường Chà'),
(3169, 11, N'Xã Nà Hỳ'),
(3172, 11, N'Xã Na Sang'),
(3175, 11, N'Xã Chà Tở'),
(3176, 11, N'Xã Nà Bủng'),
(3181, 11, N'Xã Mường Tùng'),
(3193, 11, N'Xã Pa Ham'),
(3194, 11, N'Xã Nậm Nèn'),
(3199, 11, N'Xã Si Pa Phìn'),
(3202, 11, N'Xã Mường Pồn'),
(3203, 11, N'Xã Na Son'),
(3208, 11, N'Xã Xa Dung'),
(3214, 11, N'Xã Mường Luân'),
(3217, 11, N'Xã Tủa Chùa'),
(3220, 11, N'Xã Tủa Thàng'),
(3226, 11, N'Xã Sín Chải'),
(3241, 11, N'Xã Sính Phình'),
(3244, 11, N'Xã Sáng Nhè'),
(3253, 11, N'Xã Tuần Giáo'),
(3256, 11, N'Xã Mường Ảng'),
(3260, 11, N'Xã Pú Nhung'),
(3268, 11, N'Xã Mường Mùn'),
(3283, 11, N'Xã Chiềng Sinh'),
(3295, 11, N'Xã Quài Tở'),
(3301, 11, N'Xã Búng Lao'),
(3313, 11, N'Xã Mường Lạn'),
(3316, 11, N'Xã Nà Tấu'),
(3325, 11, N'Xã Mường Phăng'),
(3328, 11, N'Xã Thanh Nưa'),
(3334, 11, N'Phường Mường Thanh'),
(3349, 11, N'Xã Thanh Yên'),
(3352, 11, N'Xã Thanh An'),
(3356, 11, N'Xã Sam Mứn'),
(3358, 11, N'Xã Núa Ngam'),
(3368, 11, N'Xã Mường Nhà'),
(3370, 11, N'Xã Pu Nhi'),
(3382, 11, N'Xã Phình Giàng'),
(3385, 11, N'Xã Tìa Dình'),
(3388, 12, N'Phường Đoàn Kết'),
(3390, 12, N'Xã Bình Lư'),
(3394, 12, N'Xã Sin Suối Hồ'),
(3405, 12, N'Xã Tả Lèng'),
(3408, 12, N'Phường Tân Phong'),
(3424, 12, N'Xã Bản Bo'),
(3430, 12, N'Xã Khun Há'),
(3433, 12, N'Xã Bum Tở'),
(3434, 12, N'Xã Nậm Hàng'),
(3439, 12, N'Xã Thu Lũm'),
(3442, 12, N'Xã Pa Ủ'),
(3445, 12, N'Xã Mường Tè'),
(3451, 12, N'Xã Mù Cả'),
(3460, 12, N'Xã Hua Bum'),
(3463, 12, N'Xã Tà Tổng'),
(3466, 12, N'Xã Bum Nưa'),
(3472, 12, N'Xã Mường Mô'),
(3478, 12, N'Xã Sìn Hồ'),
(3487, 12, N'Xã Lê Lợi'),
(3503, 12, N'Xã Pa Tần'),
(3508, 12, N'Xã Hồng Thu'),
(3517, 12, N'Xã Nậm Tăm'),
(3529, 12, N'Xã Tủa Sín Chải'),
(3532, 12, N'Xã Pu Sam Cáp'),
(3538, 12, N'Xã Nậm Mạ'),
(3544, 12, N'Xã Nậm Cuổi'),
(3549, 12, N'Xã Phong Thổ'),
(3562, 12, N'Xã Sì Lở Lầu'),
(3571, 12, N'Xã Dào San'),
(3583, 12, N'Xã Khổng Lào'),
(3595, 12, N'Xã Than Uyên'),
(3598, 12, N'Xã Tân Uyên'),
(3601, 12, N'Xã Mường Khoa'),
(3613, 12, N'Xã Nậm Sỏ'),
(3616, 12, N'Xã Pắc Ta'),
(3618, 12, N'Xã Mường Than'),
(3637, 12, N'Xã Mường Kim'),
(3640, 12, N'Xã Khoen On'),
(3646, 14, N'Phường Tô Hiệu'),
(3664, 14, N'Phường Chiềng An'),
(3670, 14, N'Phường Chiềng Cơi'),
(3679, 14, N'Phường Chiềng Sinh'),
(3688, 14, N'Xã Mường Chiên'),
(3694, 14, N'Xã Mường Giôn'),
(3703, 14, N'Xã Quỳnh Nhai'),
(3712, 14, N'Xã Mường Sại'),
(3721, 14, N'Xã Thuận Châu'),
(3724, 14, N'Xã Bình Thuận'),
(3727, 14, N'Xã Mường É'),
(3754, 14, N'Xã Chiềng La'),
(3757, 14, N'Xã Mường Khiêng'),
(3760, 14, N'Xã Mường Bám'),
(3763, 14, N'Xã Long Hẹ'),
(3781, 14, N'Xã Co Mạ'),
(3784, 14, N'Xã Nậm Lầu'),
(3799, 14, N'Xã Muổi Nọi'),
(3808, 14, N'Xã Mường La'),
(3814, 14, N'Xã Chiềng Lao'),
(3820, 14, N'Xã Ngọc Chiến'),
(3847, 14, N'Xã Mường Bú'),
(3850, 14, N'Xã Chiềng Hoa'),
(3856, 14, N'Xã Bắc Yên'),
(3862, 14, N'Xã Xím Vàng'),
(3868, 14, N'Xã Tà Xùa'),
(3871, 14, N'Xã Pắc Ngà'),
(3880, 14, N'Xã Tạ Khoa'),
(3892, 14, N'Xã Chiềng Sại'),
(3901, 14, N'Xã Suối Tọ'),
(3907, 14, N'Xã Mường Cơi'),
(3910, 14, N'Xã Phù Yên'),
(3922, 14, N'Xã Gia Phù'),
(3943, 14, N'Xã Mường Bang'),
(3958, 14, N'Xã Tường Hạ'),
(3961, 14, N'Xã Kim Bon'),
(3970, 14, N'Xã Tân Phong'),
(3979, 14, N'Phường Mộc Sơn'),
(3980, 14, N'Phường Mộc Châu'),
(3982, 14, N'Phường Thảo Nguyên'),
(3985, 14, N'Xã Chiềng Sơn'),
(3997, 14, N'Xã Tân Yên'),
(4000, 14, N'Xã Đoàn Kết'),
(4006, 14, N'Xã Song Khủa'),
(4018, 14, N'Xã Tô Múa'),
(4033, 14, N'Phường Vân Sơn'),
(4045, 14, N'Xã Lóng Sập'),
(4048, 14, N'Xã Vân Hồ'),
(4057, 14, N'Xã Xuân Nha'),
(4075, 14, N'Xã Yên Châu'),
(4078, 14, N'Xã Chiềng Hặc'),
(4087, 14, N'Xã Yên Sơn'),
(4096, 14, N'Xã Lóng Phiêng'),
(4099, 14, N'Xã Phiêng Khoài'),
(4105, 14, N'Xã Mai Sơn'),
(4108, 14, N'Xã Chiềng Sung'),
(4117, 14, N'Xã Mường Chanh'),
(4123, 14, N'Xã Chiềng Mung'),
(4132, 14, N'Xã Chiềng Mai'),
(4136, 14, N'Xã Tà Hộc'),
(4144, 14, N'Xã Phiêng Cằm'),
(4159, 14, N'Xã Phiêng Pằn'),
(4168, 14, N'Xã Sông Mã'),
(4171, 14, N'Xã Bó Sinh'),
(4183, 14, N'Xã Mường Lầm'),
(4186, 14, N'Xã Nậm Ty'),
(4195, 14, N'Xã Chiềng Sơ'),
(4204, 14, N'Xã Chiềng Khoong'),
(4210, 14, N'Xã Huổi Một'),
(4219, 14, N'Xã Mường Hung'),
(4222, 14, N'Xã Chiềng Khương'),
(4228, 14, N'Xã Púng Bánh'),
(4231, 14, N'Xã Sốp Cộp'),
(4240, 14, N'Xã Mường Lèo'),
(4246, 14, N'Xã Mường Lạn'),
(2647, 15, N'Phường Lào Cai'),
(2671, 15, N'Phường Cam Đường'),
(2680, 15, N'Xã Hợp Thành'),
(2683, 15, N'Xã Bát Xát'),
(2686, 15, N'Xã A Mú Sung'),
(2695, 15, N'Xã Trịnh Tường'),
(2701, 15, N'Xã Y Tý'),
(2707, 15, N'Xã Dền Sáng'),
(2725, 15, N'Xã Bản Xèo'),
(2728, 15, N'Xã Mường Hum'),
(2746, 15, N'Xã Cốc San'),
(2752, 15, N'Xã Pha Long'),
(2761, 15, N'Xã Mường Khương'),
(2782, 15, N'Xã Cao Sơn'),
(2788, 15, N'Xã Bản Lầu'),
(2809, 15, N'Xã Si Ma Cai'),
(2824, 15, N'Xã Sín Chéng'),
(2839, 15, N'Xã Bắc Hà'),
(2842, 15, N'Xã Tả Củ Tỷ'),
(2848, 15, N'Xã Lùng Phình'),
(2869, 15, N'Xã Bản Liền'),
(2890, 15, N'Xã Bảo Nhai'),
(2896, 15, N'Xã Cốc Lầu'),
(2902, 15, N'Xã Phong Hải'),
(2905, 15, N'Xã Bảo Thắng'),
(2908, 15, N'Xã Tằng Loỏng'),
(2923, 15, N'Xã Gia Phú'),
(2926, 15, N'Xã Xuân Quang'),
(2947, 15, N'Xã Bảo Yên'),
(2953, 15, N'Xã Nghĩa Đô'),
(2962, 15, N'Xã Xuân Hòa'),
(2968, 15, N'Xã Thượng Hà'),
(2989, 15, N'Xã Bảo Hà'),
(2998, 15, N'Xã Phúc Khánh'),
(3004, 15, N'Xã Ngũ Chỉ Sơn'),
(3006, 15, N'Phường Sa Pa');
GO
INSERT INTO WEB_PHUONG_XA (MaPhuongXa, MaTinhThanh, TenPhuongXa) VALUES
(3013, 15, N'Xã Tả Phìn'),
(3037, 15, N'Xã Tả Van'),
(3043, 15, N'Xã Mường Bo'),
(3046, 15, N'Xã Bản Hồ'),
(3061, 15, N'Xã Võ Lao'),
(3076, 15, N'Xã Nậm Chày'),
(3082, 15, N'Xã Văn Bàn'),
(3085, 15, N'Xã Nậm Xé'),
(3091, 15, N'Xã Chiềng Ken'),
(3103, 15, N'Xã Khánh Yên'),
(3106, 15, N'Xã Dương Quỳ'),
(3121, 15, N'Xã Minh Lương'),
(4252, 15, N'Phường Yên Bái'),
(4273, 15, N'Phường Nam Cường'),
(4279, 15, N'Phường Văn Phú'),
(4288, 15, N'Phường Nghĩa Lộ'),
(4303, 15, N'Xã Lục Yên'),
(4309, 15, N'Xã Lâm Thượng'),
(4336, 15, N'Xã Tân Lĩnh'),
(4342, 15, N'Xã Khánh Hòa'),
(4345, 15, N'Xã Mường Lai'),
(4363, 15, N'Xã Phúc Lợi'),
(4375, 15, N'Xã Mậu A'),
(4381, 15, N'Xã Lâm Giang'),
(4387, 15, N'Xã Châu Quế'),
(4399, 15, N'Xã Đông Cuông'),
(4402, 15, N'Xã Phong Dụ Hạ'),
(4423, 15, N'Xã Phong Dụ Thượng'),
(4429, 15, N'Xã Tân Hợp'),
(4441, 15, N'Xã Xuân Ái'),
(4450, 15, N'Xã Mỏ Vàng'),
(4456, 15, N'Xã Mù Cang Chải'),
(4462, 15, N'Xã Nậm Có'),
(4465, 15, N'Xã Khao Mang'),
(4474, 15, N'Xã Lao Chải'),
(4489, 15, N'Xã Chế Tạo'),
(4492, 15, N'Xã Púng Luông'),
(4498, 15, N'Xã Trấn Yên'),
(4531, 15, N'Xã Quy Mông'),
(4537, 15, N'Xã Lương Thịnh'),
(4543, 15, N'Phường Âu Lâu'),
(4564, 15, N'Xã Việt Hồng'),
(4576, 15, N'Xã Hưng Khánh'),
(4585, 15, N'Xã Hạnh Phúc'),
(4603, 15, N'Xã Tà Xi Láng'),
(4606, 15, N'Xã Trạm Tấu'),
(4609, 15, N'Xã Phình Hồ'),
(4630, 15, N'Xã Tú Lệ'),
(4636, 15, N'Xã Gia Hội'),
(4651, 15, N'Xã Sơn Lương'),
(4660, 15, N'Xã Liên Sơn'),
(4663, 15, N'Phường Trung Tâm'),
(4672, 15, N'Xã Văn Chấn'),
(4681, 15, N'Phường Cầu Thia'),
(4693, 15, N'Xã Cát Thịnh'),
(4699, 15, N'Xã Chấn Thịnh'),
(4705, 15, N'Xã Thượng Bằng La'),
(4711, 15, N'Xã Nghĩa Tâm'),
(4714, 15, N'Xã Yên Bình'),
(4717, 15, N'Xã Thác Bà'),
(4726, 15, N'Xã Cảm Nhân'),
(4744, 15, N'Xã Yên Thành'),
(4750, 15, N'Xã Bảo Ái'),
(1840, 19, N'Phường Đức Xuân'),
(1843, 19, N'Phường Bắc Kạn'),
(1849, 19, N'Xã Phong Quang'),
(1864, 19, N'Xã Bằng Thành'),
(1879, 19, N'Xã Cao Minh'),
(1882, 19, N'Xã Nghiên Loan'),
(1894, 19, N'Xã Phúc Lộc'),
(1906, 19, N'Xã Ba Bể'),
(1912, 19, N'Xã Chợ Rã'),
(1921, 19, N'Xã Thượng Minh'),
(1933, 19, N'Xã Đồng Phúc'),
(1936, 19, N'Xã Nà Phặc'),
(1942, 19, N'Xã Bằng Vân'),
(1954, 19, N'Xã Ngân Sơn'),
(1957, 19, N'Xã Thượng Quan'),
(1960, 19, N'Xã Hiệp Lực'),
(1969, 19, N'Xã Phủ Thông'),
(1981, 19, N'Xã Vĩnh Thông'),
(2008, 19, N'Xã Cẩm Giàng'),
(2014, 19, N'Xã Bạch Thông'),
(2020, 19, N'Xã Chợ Đồn'),
(2026, 19, N'Xã Nam Cường'),
(2038, 19, N'Xã Quảng Bạch'),
(2044, 19, N'Xã Yên Thịnh'),
(2071, 19, N'Xã Nghĩa Tá'),
(2083, 19, N'Xã Yên Phong'),
(2086, 19, N'Xã Chợ Mới'),
(2101, 19, N'Xã Thanh Mai'),
(2104, 19, N'Xã Tân Kỳ'),
(2107, 19, N'Xã Thanh Thịnh'),
(2116, 19, N'Xã Yên Bình'),
(2143, 19, N'Xã Văn Lang'),
(2152, 19, N'Xã Cường Lợi'),
(2155, 19, N'Xã Na Rì'),
(2176, 19, N'Xã Trần Phú'),
(2185, 19, N'Xã Côn Minh'),
(2191, 19, N'Xã Xuân Dương'),
(5443, 19, N'Phường Phan Đình Phùng'),
(5455, 19, N'Phường Quyết Thắng'),
(5467, 19, N'Phường Gia Sàng'),
(5482, 19, N'Phường Quan Triều'),
(5488, 19, N'Xã Đại Phúc'),
(5500, 19, N'Phường Tích Lương'),
(5503, 19, N'Xã Tân Cương'),
(5518, 19, N'Phường Sông Công'),
(5528, 19, N'Phường Bách Quang'),
(5533, 19, N'Phường Bá Xuyên'),
(5542, 19, N'Xã Lam Vỹ'),
(5551, 19, N'Xã Kim Phượng'),
(5563, 19, N'Xã Phượng Tiến'),
(5569, 19, N'Xã Định Hóa'),
(5581, 19, N'Xã Trung Hội'),
(5587, 19, N'Xã Bình Yên'),
(5602, 19, N'Xã Phú Đình'),
(5605, 19, N'Xã Bình Thành'),
(5611, 19, N'Xã Phú Lương'),
(5620, 19, N'Xã Yên Trạch'),
(5632, 19, N'Xã Hợp Thành'),
(5641, 19, N'Xã Vô Tranh'),
(5662, 19, N'Xã Trại Cau'),
(5665, 19, N'Xã Văn Lăng'),
(5674, 19, N'Xã Quang Sơn'),
(5680, 19, N'Xã Văn Hán'),
(5692, 19, N'Xã Đồng Hỷ'),
(5707, 19, N'Xã Nam Hòa'),
(5710, 19, N'Phường Linh Sơn'),
(5716, 19, N'Xã Võ Nhai'),
(5719, 19, N'Xã Sảng Mộc'),
(5722, 19, N'Xã Nghinh Tường'),
(5725, 19, N'Xã Thần Sa'),
(5740, 19, N'Xã La Hiên'),
(5746, 19, N'Xã Tràng Xá'),
(5755, 19, N'Xã Dân Tiến'),
(5773, 19, N'Xã Phú Xuyên'),
(5776, 19, N'Xã Đức Lương'),
(5788, 19, N'Xã Phú Lạc'),
(5800, 19, N'Xã Phú Thịnh'),
(5809, 19, N'Xã An Khánh'),
(5818, 19, N'Xã La Bằng'),
(5830, 19, N'Xã Đại Từ'),
(5845, 19, N'Xã Vạn Phú'),
(5851, 19, N'Xã Quân Chu'),
(5857, 19, N'Phường Phúc Thuận'),
(5860, 19, N'Phường Phổ Yên'),
(5881, 19, N'Xã Thành Công'),
(5890, 19, N'Phường Vạn Xuân'),
(5899, 19, N'Phường Trung Thành'),
(5908, 19, N'Xã Phú Bình'),
(5917, 19, N'Xã Tân Khánh'),
(5923, 19, N'Xã Tân Thành'),
(5941, 19, N'Xã Điềm Thụy'),
(5953, 19, N'Xã Kha Sơn'),
(5977, 20, N'Phường Đông Kinh'),
(5983, 20, N'Phường Lương Văn Tri'),
(5986, 20, N'Phường Tam Thanh'),
(6001, 20, N'Xã Đoàn Kết'),
(6004, 20, N'Xã Quốc Khánh'),
(6019, 20, N'Xã Tân Tiến'),
(6037, 20, N'Xã Kháng Chiến'),
(6040, 20, N'Xã Thất Khê'),
(6046, 20, N'Xã Tràng Định'),
(6058, 20, N'Xã Quốc Việt'),
(6073, 20, N'Xã Hoa Thám'),
(6076, 20, N'Xã Quý Hòa'),
(6079, 20, N'Xã Hồng Phong'),
(6085, 20, N'Xã Thiện Hòa'),
(6091, 20, N'Xã Thiện Thuật'),
(6103, 20, N'Xã Thiện Long'),
(6112, 20, N'Xã Bình Gia'),
(6115, 20, N'Xã Tân Văn'),
(6124, 20, N'Xã Na Sầm'),
(6148, 20, N'Xã Thụy Hùng'),
(6151, 20, N'Xã Hội Hoan'),
(6154, 20, N'Xã Văn Lãng'),
(6172, 20, N'Xã Hoàng Văn Thụ'),
(6184, 20, N'Xã Đồng Đăng'),
(6187, 20, N'Phường Kỳ Lừa'),
(6196, 20, N'Xã Ba Sơn'),
(6211, 20, N'Xã Cao Lộc'),
(6220, 20, N'Xã Công Sơn'),
(6253, 20, N'Xã Văn Quan'),
(6280, 20, N'Xã Điềm He'),
(6286, 20, N'Xã Khánh Khê'),
(6298, 20, N'Xã Yên Phúc'),
(6313, 20, N'Xã Tri Lễ'),
(6316, 20, N'Xã Tân Đoàn'),
(6325, 20, N'xã Bắc Sơn'),
(6337, 20, N'Xã Tân Tri'),
(6349, 20, N'Xã Hưng Vũ'),
(6364, 20, N'Xã Vũ Lễ'),
(6367, 20, N'Xã Vũ Lăng'),
(6376, 20, N'Xã Nhất Hòa'),
(6385, 20, N'Xã Hữu Lũng'),
(6391, 20, N'Xã Yên Bình'),
(6400, 20, N'Xã Hữu Liên'),
(6415, 20, N'Xã Vân Nham'),
(6427, 20, N'Xã Cai Kinh'),
(6436, 20, N'Xã Thiện Tân'),
(6445, 20, N'Xã Tân Thành'),
(6457, 20, N'Xã Tuấn Sơn'),
(6463, 20, N'Xã Chi Lăng'),
(6475, 20, N'Xã Bằng Mạc'),
(6481, 20, N'Xã Chiến Thắng'),
(6496, 20, N'Xã Nhân Lý'),
(6505, 20, N'Xã Vạn Linh'),
(6517, 20, N'Xã Quan Sơn'),
(6526, 20, N'Xã Na Dương'),
(6529, 20, N'Xã Lộc Bình'),
(6541, 20, N'Xã Mẫu Sơn'),
(6565, 20, N'Xã Khuất Xá'),
(6577, 20, N'Xã Thống Nhất'),
(6601, 20, N'Xã Lợi Bác'),
(6607, 20, N'Xã Xuân Dương'),
(6613, 20, N'Xã Đình Lập'),
(6616, 20, N'Xã Thái Bình'),
(6625, 20, N'Xã Kiên Mộc'),
(6637, 20, N'Xã Châu Sơn'),
(6652, 22, N'Phường Hà Tu'),
(6658, 22, N'Phường Cao Xanh'),
(6661, 22, N'Phường Việt Hưng'),
(6673, 22, N'Phường Bãi Cháy'),
(6676, 22, N'Phường Hà Lầm'),
(6685, 22, N'Phường Hồng Gai'),
(6688, 22, N'Phường Hạ Long'),
(6706, 22, N'Phường Tuần Châu'),
(6709, 22, N'Phường Móng Cái 2'),
(6712, 22, N'Phường Móng Cái 1'),
(6724, 22, N'Xã Hải Sơn'),
(6733, 22, N'Xã Hải Ninh'),
(6736, 22, N'Phường Móng Cái 3'),
(6757, 22, N'Xã Vĩnh Thực'),
(6760, 22, N'Phường Mông Dương'),
(6778, 22, N'Phường Quang Hanh'),
(6781, 22, N'Phường Cửa Ông'),
(6793, 22, N'Phường Cẩm Phả'),
(6799, 22, N'Xã Hải Hòa'),
(6811, 22, N'Phường Uông Bí'),
(6820, 22, N'Phường Vàng Danh'),
(6832, 22, N'Phường Yên Tử'),
(6838, 22, N'Xã Bình Liêu'),
(6841, 22, N'Xã Hoành Mô'),
(6856, 22, N'Xã Lục Hồn'),
(6862, 22, N'Xã Tiên Yên'),
(6874, 22, N'Xã Điền Xá'),
(6877, 22, N'Xã Đông Ngũ'),
(6886, 22, N'Xã Hải Lạng'),
(6895, 22, N'Xã Đầm Hà'),
(6913, 22, N'Xã Quảng Tân'),
(6922, 22, N'Xã Quảng Hà'),
(6931, 22, N'Xã Quảng Đức'),
(6946, 22, N'Xã Đường Hoa'),
(6967, 22, N'Xã Cái Chiên'),
(6970, 22, N'Xã Ba Chẽ'),
(6979, 22, N'Xã Kỳ Thượng'),
(6985, 22, N'Xã Lương Minh'),
(6994, 22, N'Đặc khu Vân Đồn'),
(7030, 22, N'Phường Hoành Bồ'),
(7054, 22, N'Xã Quảng La'),
(7060, 22, N'Xã Thống Nhất'),
(7069, 22, N'Phường Mạo Khê'),
(7081, 22, N'Phường Bình Khê'),
(7090, 22, N'Phường An Sinh'),
(7093, 22, N'Phường Đông Triều'),
(7114, 22, N'Phường Hoàng Quế'),
(7132, 22, N'Phường Quảng Yên'),
(7135, 22, N'Phường Đông Mai'),
(7147, 22, N'Phường Hiệp Hòa'),
(7168, 22, N'Phường Hà An'),
(7180, 22, N'Phường Liên Hòa'),
(7183, 22, N'Phường Phong Cốc'),
(7192, 22, N'Đặc khu Cô Tô'),
(7210, 24, N'Phường Bắc Giang'),
(7228, 24, N'Phường Đa Mai'),
(7246, 24, N'Xã Xuân Lương'),
(7264, 24, N'Xã Tam Tiến'),
(7282, 24, N'Xã Đồng Kỳ'),
(7288, 24, N'Xã Yên Thế'),
(7294, 24, N'Xã Bố Hạ'),
(7306, 24, N'Xã Nhã Nam'),
(7330, 24, N'Xã Phúc Hòa'),
(7333, 24, N'Xã Quang Trung'),
(7339, 24, N'Xã Tân Yên'),
(7351, 24, N'Xã Ngọc Thiện'),
(7375, 24, N'Xã Lạng Giang'),
(7381, 24, N'Xã Tiên Lục'),
(7399, 24, N'Xã Kép'),
(7420, 24, N'Xã Mỹ Thái'),
(7432, 24, N'Xã Tân Dĩnh'),
(7444, 24, N'Xã Lục Nam'),
(7450, 24, N'Xã Đông Phú'),
(7462, 24, N'Xã Bảo Đài'),
(7486, 24, N'Xã Nghĩa Phương'),
(7489, 24, N'Xã Trường Sơn'),
(7492, 24, N'Xã Lục Sơn'),
(7498, 24, N'Xã Bắc Lũng'),
(7519, 24, N'Xã Cẩm Lý'),
(7525, 24, N'Phường Chũ'),
(7531, 24, N'Xã Tân Sơn'),
(7534, 24, N'Xã Sa Lý'),
(7537, 24, N'Xã Biên Sơn'),
(7543, 24, N'Xã Sơn Hải'),
(7552, 24, N'Xã Kiên Lao'),
(7573, 24, N'Xã Biển Động'),
(7582, 24, N'Xã Lục Ngạn'),
(7594, 24, N'Xã Đèo Gia'),
(7603, 24, N'Xã Nam Dương'),
(7612, 24, N'Phường Phượng Sơn'),
(7615, 24, N'Xã Sơn Động'),
(7616, 24, N'Xã Tây Yên Tử'),
(7621, 24, N'Xã Vân Sơn'),
(7627, 24, N'Xã Đại Sơn'),
(7642, 24, N'Xã Yên Định'),
(7654, 24, N'Xã An Lạc'),
(7663, 24, N'Xã Tuấn Đạo'),
(7672, 24, N'Xã Dương Hưu'),
(7681, 24, N'Phường Yên Dũng'),
(7682, 24, N'Phường Tân An'),
(7696, 24, N'Phường Tiền Phong'),
(7699, 24, N'Phường Tân Tiến'),
(7735, 24, N'Xã Đồng Việt'),
(7738, 24, N'Phường Cảnh Thụy'),
(7774, 24, N'Phường Tự Lạn'),
(7777, 24, N'Phường Việt Yên'),
(7795, 24, N'Phường Nếnh'),
(7798, 24, N'Phường Vân Hà'),
(7822, 24, N'Xã Hoàng Vân'),
(7840, 24, N'Xã Hiệp Hoà'),
(7864, 24, N'Xã Hợp Thịnh'),
(7870, 24, N'Xã Xuân Cẩm'),
(9169, 24, N'Phường Vũ Ninh'),
(9187, 24, N'Phường Kinh Bắc'),
(9190, 24, N'Phường Võ Cường'),
(9193, 24, N'Xã Yên Phong'),
(9202, 24, N'Xã Tam Giang'),
(9205, 24, N'Xã Yên Trung'),
(9208, 24, N'Xã Tam Đa'),
(9238, 24, N'Xã Văn Môn'),
(9247, 24, N'Phường Quế Võ'),
(9253, 24, N'Phường Nhân Hòa'),
(9265, 24, N'Phường Phương Liễu'),
(9286, 24, N'Phường Nam Sơn'),
(9292, 24, N'Xã Phù Lãng'),
(9295, 24, N'Phường Bồng Lai'),
(9301, 24, N'Phường Đào Viên'),
(9313, 24, N'Xã Chi Lăng'),
(9319, 24, N'Xã Tiên Du'),
(9325, 24, N'Phường Hạp Lĩnh'),
(9334, 24, N'Xã Liên Bão'),
(9340, 24, N'Xã Đại Đồng'),
(9343, 24, N'Xã Tân Chi'),
(9349, 24, N'Xã Phật Tích'),
(9367, 24, N'Phường Từ Sơn'),
(9370, 24, N'Phường Tam Sơn'),
(9379, 24, N'Phường Phù Khê'),
(9385, 24, N'Phường Đồng Nguyên'),
(9400, 24, N'Phường Thuận Thành'),
(9409, 24, N'Phường Mão Điền'),
(9427, 24, N'Phường Trí Quả'),
(9430, 24, N'Phường Trạm Lộ'),
(9433, 24, N'Phường Song Liễu'),
(9445, 24, N'Phường Ninh Xá'),
(9454, 24, N'Xã Gia Bình'),
(9466, 24, N'Xã Cao Đức'),
(9469, 24, N'Xã Đại Lai'),
(9475, 24, N'Xã Nhân Thắng'),
(9487, 24, N'Xã Đông Cứu'),
(9496, 24, N'Xã Lương Tài'),
(9499, 24, N'Xã Trung Kênh'),
(9523, 24, N'Xã Trung Chính'),
(9529, 24, N'Xã Lâm Thao'),
(4792, 25, N'Phường Tân Hòa'),
(4795, 25, N'Phường Hòa Bình'),
(4828, 25, N'Phường Thống Nhất'),
(4831, 25, N'Xã Đà Bắc'),
(4846, 25, N'Xã Đức Nhàn'),
(4849, 25, N'Xã Tân Pheo'),
(4873, 25, N'Xã Quy Đức'),
(4876, 25, N'Xã Cao Sơn'),
(4891, 25, N'Xã Tiền Phong'),
(4894, 25, N'Phường Kỳ Sơn'),
(4897, 25, N'Xã Thịnh Minh'),
(4924, 25, N'Xã Lương Sơn'),
(4960, 25, N'Xã Liên Sơn'),
(4978, 25, N'Xã Kim Bôi'),
(4990, 25, N'Xã Nật Sơn'),
(5014, 25, N'Xã Mường Động'),
(5047, 25, N'Xã Cao Dương'),
(5068, 25, N'Xã Hợp Kim'),
(5086, 25, N'Xã Dũng Tiến'),
(5089, 25, N'Xã Cao Phong'),
(5092, 25, N'Xã Thung Nai'),
(5116, 25, N'Xã Mường Thàng'),
(5128, 25, N'Xã Tân Lạc'),
(5134, 25, N'Xã Mường Hoa'),
(5152, 25, N'Xã Vân Sơn'),
(5158, 25, N'Xã Mường Bi'),
(5191, 25, N'Xã Toàn Thắng'),
(5200, 25, N'Xã Mai Châu'),
(5206, 25, N'Xã Tân Mai'),
(5212, 25, N'Xã Pà Cò'),
(5245, 25, N'Xã Bao La'),
(5251, 25, N'Xã Mai Hạ'),
(5266, 25, N'Xã Lạc Sơn'),
(5287, 25, N'Xã Mường Vang'),
(5290, 25, N'Xã Nhân Nghĩa'),
(5293, 25, N'Xã Thượng Cốc'),
(5305, 25, N'Xã Yên Phú'),
(5323, 25, N'Xã Quyết Thắng'),
(5329, 25, N'Xã Ngọc Sơn'),
(5347, 25, N'Xã Đại Đồng'),
(5353, 25, N'Xã Yên Thủy'),
(5362, 25, N'Xã Lạc Lương'),
(5386, 25, N'Xã Yên Trị'),
(5392, 25, N'Xã Lạc Thủy'),
(5395, 25, N'Xã An Nghĩa'),
(5425, 25, N'Xã An Bình'),
(7894, 25, N'Phường Nông Trang'),
(7900, 25, N'Phường Việt Trì'),
(7909, 25, N'Phường Thanh Miếu'),
(7918, 25, N'Phường Vân Phú'),
(7942, 25, N'Phường Phú Thọ'),
(7948, 25, N'Phường Âu Cơ'),
(7954, 25, N'Phường Phong Châu'),
(7969, 25, N'Xã Đoan Hùng'),
(7996, 25, N'Xã Bằng Luân'),
(7999, 25, N'Xã Chí Đám'),
(8023, 25, N'Xã Tây Cốc'),
(8038, 25, N'Xã Chân Mộng'),
(8053, 25, N'Xã Hạ Hòa'),
(8071, 25, N'Xã Đan Thượng'),
(8110, 25, N'Xã Hiền Lương'),
(8113, 25, N'Xã Yên Kỳ'),
(8134, 25, N'Xã Văn Lang'),
(8143, 25, N'Xã Vĩnh Chân'),
(8152, 25, N'Xã Thanh Ba'),
(8173, 25, N'Xã Quảng Yên'),
(8203, 25, N'Xã Hoàng Cương'),
(8209, 25, N'Xã Đông Thành'),
(8218, 25, N'Xã Chí Tiên'),
(8227, 25, N'Xã Liên Minh'),
(8230, 25, N'Xã Phù Ninh'),
(8236, 25, N'Xã Phú Mỹ'),
(8245, 25, N'Xã Trạm Thản'),
(8254, 25, N'Xã Dân Chủ'),
(8275, 25, N'Xã Bình Phú'),
(8290, 25, N'Xã Yên Lập'),
(8296, 25, N'Xã Sơn Lương'),
(8305, 25, N'Xã Xuân Viên'),
(8311, 25, N'Xã Trung Sơn'),
(8323, 25, N'Xã Thượng Long'),
(8338, 25, N'Xã Minh Hòa'),
(8341, 25, N'Xã Cẩm Khê'),
(8344, 25, N'Xã Tiên Lương'),
(8377, 25, N'Xã Vân Bán'),
(8398, 25, N'Xã Phú Khê'),
(8416, 25, N'Xã Hùng Việt'),
(8431, 25, N'Xã Đồng Lương'),
(8434, 25, N'Xã Tam Nông'),
(8443, 25, N'Xã Hiền Quan'),
(8467, 25, N'Xã Vạn Xuân'),
(8479, 25, N'Xã Thọ Văn'),
(8494, 25, N'Xã Lâm Thao'),
(8500, 25, N'Xã Xuân Lũng'),
(8515, 25, N'Xã Hy Cương'),
(8521, 25, N'Xã Phùng Nguyên'),
(8527, 25, N'Xã Bản Nguyên'),
(8542, 25, N'Xã Thanh Sơn'),
(8545, 25, N'Xã Thu Cúc'),
(8560, 25, N'Xã Lai Đồng'),
(8566, 25, N'Xã Tân Sơn'),
(8584, 25, N'Xã Võ Miếu'),
(8590, 25, N'Xã Xuân Đài'),
(8593, 25, N'Xã Minh Đài'),
(8611, 25, N'Xã Văn Miếu'),
(8614, 25, N'Xã Cự Đồng'),
(8620, 25, N'Xã Long Cốc'),
(8632, 25, N'Xã Hương Cần'),
(8635, 25, N'Xã Khả Cửu'),
(8656, 25, N'Xã Yên Sơn'),
(8662, 25, N'Xã Đào Xá'),
(8674, 25, N'Xã Thanh Thủy'),
(8686, 25, N'Xã Tu Vũ'),
(8707, 25, N'Phường Vĩnh Yên'),
(8716, 25, N'Phường Vĩnh Phúc'),
(8740, 25, N'Phường Phúc Yên'),
(8746, 25, N'Phường Xuân Hòa'),
(8761, 25, N'Xã Lập Thạch'),
(8770, 25, N'Xã Hợp Lý'),
(8773, 25, N'Xã Yên Lãng'),
(8782, 25, N'Xã Hải Lựu'),
(8788, 25, N'Xã Thái Hòa'),
(8812, 25, N'Xã Liên Hòa'),
(8824, 25, N'Xã Tam Sơn'),
(8842, 25, N'Xã Tiên Lữ'),
(8848, 25, N'Xã Sông Lô'),
(8866, 25, N'Xã Sơn Đông'),
(8869, 25, N'Xã Tam Dương');
GO
INSERT INTO WEB_PHUONG_XA (MaPhuongXa, MaTinhThanh, TenPhuongXa) VALUES
(8872, 25, N'Xã Tam Dương Bắc'),
(8896, 25, N'Xã Hoàng An'),
(8905, 25, N'Xã Hội Thịnh'),
(8911, 25, N'Xã Tam Đảo'),
(8914, 25, N'Xã Đạo Trù'),
(8923, 25, N'Xã Đại Đình'),
(8935, 25, N'Xã Bình Nguyên'),
(8944, 25, N'Xã Bình Tuyền'),
(8950, 25, N'Xã Bình Xuyên'),
(8971, 25, N'Xã Xuân Lãng'),
(9025, 25, N'Xã Yên Lạc'),
(9040, 25, N'Xã Tề Lỗ'),
(9043, 25, N'Xã Tam Hồng'),
(9052, 25, N'Xã Nguyệt Đức'),
(9064, 25, N'Xã Liên Châu'),
(9076, 25, N'Xã Vĩnh Tường'),
(9079, 25, N'Xã Vĩnh An'),
(9100, 25, N'Xã Vĩnh Hưng'),
(9106, 25, N'Xã Vĩnh Thành'),
(9112, 25, N'Xã Thổ Tang'),
(9154, 25, N'Xã Vĩnh Phú'),
(10507, 31, N'Phường Thành Đông'),
(10525, 31, N'Phường Hải Dương'),
(10532, 31, N'Phường Lê Thanh Nghị'),
(10537, 31, N'Phường Tân Hưng'),
(10543, 31, N'Phường Việt Hòa'),
(10546, 31, N'Phường Chí Linh'),
(10549, 31, N'Phường Chu Văn An'),
(10552, 31, N'Phường Nguyễn Trãi'),
(10570, 31, N'Phường Trần Hưng Đạo'),
(10573, 31, N'Phường Trần Nhân Tông'),
(10603, 31, N'Phường Lê Đại Hành'),
(10606, 31, N'Xã Nam Sách'),
(10615, 31, N'Xã Hợp Tiến'),
(10633, 31, N'Xã Trần Phú'),
(10642, 31, N'Xã Thái Tân'),
(10645, 31, N'Xã An Phú'),
(10660, 31, N'Phường Ái Quốc'),
(10675, 31, N'Phường Kinh Môn'),
(10678, 31, N'Phường Bắc An Phụ'),
(10705, 31, N'Xã Nam An Phụ'),
(10714, 31, N'Phường Nhị Chiểu'),
(10726, 31, N'Phường Phạm Sư Mạnh'),
(10729, 31, N'Phường Trần Liễu'),
(10744, 31, N'Phường Nguyễn Đại Năng'),
(10750, 31, N'Xã Phú Thái'),
(10756, 31, N'Xã Lai Khê'),
(10792, 31, N'Xã An Thành'),
(10804, 31, N'Xã Kim Thành'),
(10813, 31, N'Xã Thanh Hà'),
(10816, 31, N'Xã Hà Bắc'),
(10837, 31, N'Phường Nam Đồng'),
(10843, 31, N'Xã Hà Nam'),
(10846, 31, N'Xã Hà Tây'),
(10882, 31, N'Xã Hà Đông'),
(10888, 31, N'Xã Cẩm Giang'),
(10891, 31, N'Phường Tứ Minh'),
(10903, 31, N'Xã Cẩm Giàng'),
(10909, 31, N'Xã Tuệ Tĩnh'),
(10930, 31, N'Xã Mao Điền'),
(10945, 31, N'Xã Kẻ Sặt'),
(10966, 31, N'Xã Bình Giang'),
(10972, 31, N'Xã Đường An'),
(10993, 31, N'Xã Thượng Hồng'),
(10999, 31, N'Xã Gia Lộc'),
(11002, 31, N'Phường Thạch Khôi'),
(11020, 31, N'Xã Yết Kiêu'),
(11050, 31, N'Xã Gia Phúc'),
(11065, 31, N'Xã Trường Tân'),
(11074, 31, N'Xã Tứ Kỳ'),
(11086, 31, N'Xã Đại Sơn'),
(11113, 31, N'Xã Tân Kỳ'),
(11131, 31, N'Xã Chí Minh'),
(11140, 31, N'Xã Lạc Phượng'),
(11146, 31, N'Xã Nguyên Giáp'),
(11164, 31, N'Xã Vĩnh Lại'),
(11167, 31, N'Xã Tân An'),
(11203, 31, N'Xã Ninh Giang'),
(11218, 31, N'Xã Hồng Châu'),
(11224, 31, N'Xã Khúc Thừa Dụ'),
(11239, 31, N'Xã Thanh Miện'),
(11242, 31, N'Xã Nguyễn Lương Bằng'),
(11254, 31, N'Xã Bắc Thanh Miện'),
(11257, 31, N'Xã Hải Hưng'),
(11284, 31, N'Xã Nam Thanh Miện'),
(11311, 31, N'Phường Hồng Bàng'),
(11329, 31, N'Phường Ngô Quyền'),
(11359, 31, N'Phường Gia Viên'),
(11383, 31, N'Phường Lê Chân'),
(11407, 31, N'Phường An Biên'),
(11411, 31, N'Phường Đông Hải'),
(11413, 31, N'Phường Hải An'),
(11443, 31, N'Phường Kiến An'),
(11446, 31, N'Phường Phù Liễn'),
(11455, 31, N'Phường Đồ Sơn'),
(11473, 31, N'Phường Bạch Đằng'),
(11488, 31, N'Phường Lưu Kiếm'),
(11503, 31, N'Xã Việt Khê'),
(11506, 31, N'Phường Lê Ích Mộc'),
(11533, 31, N'Phường Hòa Bình'),
(11542, 31, N'Phường Nam Triệu'),
(11557, 31, N'Phường Thiên Hương'),
(11560, 31, N'Phường Thủy Nguyên'),
(11581, 31, N'Phường An Dương'),
(11593, 31, N'Phường An Phong'),
(11602, 31, N'Phường Hồng An'),
(11617, 31, N'Phường An Hải'),
(11629, 31, N'Xã An Lão'),
(11635, 31, N'Xã An Trường'),
(11647, 31, N'Xã An Quang'),
(11668, 31, N'Xã An Khánh'),
(11674, 31, N'Xã An Hưng'),
(11680, 31, N'Xã Kiến Thụy'),
(11689, 31, N'Phường Hưng Đạo'),
(11692, 31, N'Phường Dương Kinh'),
(11713, 31, N'Xã Nghi Dương'),
(11725, 31, N'Xã Kiến Minh'),
(11728, 31, N'Xã Kiến Hưng'),
(11737, 31, N'Phường Nam Đồ Sơn'),
(11749, 31, N'Xã Kiến Hải'),
(11755, 31, N'Xã Tiên Lãng'),
(11761, 31, N'Xã Quyết Thắng'),
(11779, 31, N'Xã Tân Minh'),
(11791, 31, N'Xã Tiên Minh'),
(11806, 31, N'Xã Chấn Hưng'),
(11809, 31, N'Xã Hùng Thắng'),
(11824, 31, N'Xã Vĩnh Bảo'),
(11836, 31, N'Xã Vĩnh Thịnh'),
(11842, 31, N'Xã Vĩnh Thuận'),
(11848, 31, N'Xã Vĩnh Hòa'),
(11875, 31, N'Xã Vĩnh Hải'),
(11887, 31, N'Xã Vĩnh Am'),
(11911, 31, N'Xã Nguyễn Bỉnh Khiêm'),
(11914, 31, N'Đặc khu Cát Hải'),
(11948, 31, N'Đặc khu Bạch Long Vĩ'),
(11953, 33, N'Phường Phố Hiến'),
(11977, 33, N'Xã Tân Hưng'),
(11980, 33, N'Phường Hồng Châu'),
(11983, 33, N'Phường Sơn Nam'),
(11992, 33, N'Xã Lạc Đạo'),
(11995, 33, N'Xã Đại Đồng'),
(12004, 33, N'Xã Như Quỳnh'),
(12019, 33, N'Xã Văn Giang'),
(12025, 33, N'Xã Phụng Công'),
(12031, 33, N'Xã Nghĩa Trụ'),
(12049, 33, N'Xã Mễ Sở'),
(12064, 33, N'Xã Nguyễn Văn Linh'),
(12070, 33, N'Xã Hoàn Long'),
(12073, 33, N'Xã Yên Mỹ'),
(12091, 33, N'Xã Việt Yên'),
(12103, 33, N'Phường Mỹ Hào'),
(12127, 33, N'Phường Thượng Hồng'),
(12133, 33, N'Phường Đường Hào'),
(12142, 33, N'Xã Ân Thi'),
(12148, 33, N'Xã Phạm Ngũ Lão'),
(12166, 33, N'Xã Xuân Trúc'),
(12184, 33, N'Xã Nguyễn Trãi'),
(12196, 33, N'Xã Hồng Quang'),
(12205, 33, N'Xã Khoái Châu'),
(12223, 33, N'Xã Triệu Việt Vương'),
(12238, 33, N'Xã Việt Tiến'),
(12247, 33, N'Xã Châu Ninh'),
(12271, 33, N'Xã Chí Minh'),
(12280, 33, N'Xã Lương Bằng'),
(12286, 33, N'Xã Nghĩa Dân'),
(12313, 33, N'Xã Đức Hợp'),
(12322, 33, N'Xã Hiệp Cường'),
(12337, 33, N'Xã Hoàng Hoa Thám'),
(12361, 33, N'Xã Tiên Hoa'),
(12364, 33, N'Xã Tiên Lữ'),
(12391, 33, N'Xã Quang Hưng'),
(12406, 33, N'Xã Đoàn Đào'),
(12424, 33, N'Xã Tiên Tiến'),
(12427, 33, N'Xã Tống Trân'),
(12452, 33, N'Phường Trần Hưng Đạo'),
(12454, 33, N'Phường Trần Lãm'),
(12466, 33, N'Phường Vũ Phúc'),
(12472, 33, N'Xã Quỳnh Phụ'),
(12499, 33, N'Xã A Sào'),
(12511, 33, N'Xã Minh Thọ'),
(12517, 33, N'Xã Ngọc Lâm'),
(12523, 33, N'Xã Phụ Dực'),
(12526, 33, N'Xã Đồng Bằng'),
(12532, 33, N'Xã Nguyễn Du'),
(12577, 33, N'Xã Quỳnh An'),
(12583, 33, N'Xã Tân Tiến'),
(12586, 33, N'Xã Hưng Hà'),
(12595, 33, N'Xã Ngự Thiên'),
(12613, 33, N'Xã Long Hưng'),
(12619, 33, N'Xã Diên Hà'),
(12631, 33, N'Xã Thần Khê'),
(12634, 33, N'Xã Tiên La'),
(12676, 33, N'Xã Lê Quý Đôn'),
(12685, 33, N'Xã Hồng Minh'),
(12688, 33, N'Xã Đông Hưng'),
(12694, 33, N'Xã Bắc Đông Hưng'),
(12700, 33, N'Xã Bắc Tiên Hưng'),
(12736, 33, N'Xã Đông Tiên Hưng'),
(12745, 33, N'Xã Bắc Đông Quan'),
(12754, 33, N'Xã Tiên Hưng'),
(12763, 33, N'Xã Nam Tiên Hưng'),
(12775, 33, N'Xã Nam Đông Hưng'),
(12793, 33, N'Xã Đông Quan'),
(12817, 33, N'Phường Trà Lý'),
(12826, 33, N'Xã Thái Thụy'),
(12850, 33, N'Xã Tây Thụy Anh'),
(12859, 33, N'Xã Bắc Thụy Anh'),
(12862, 33, N'Xã Đông Thụy Anh'),
(12865, 33, N'Xã Thụy Anh'),
(12904, 33, N'Xã Nam Thụy Anh'),
(12916, 33, N'Xã Bắc Thái Ninh'),
(12919, 33, N'Xã Tây Thái Ninh'),
(12922, 33, N'Xã Thái Ninh'),
(12943, 33, N'Xã Đông Thái Ninh'),
(12961, 33, N'Xã Nam Thái Ninh'),
(12970, 33, N'Xã Tiền Hải'),
(12988, 33, N'Xã Đông Tiền Hải'),
(13003, 33, N'Xã Đồng Châu'),
(13021, 33, N'Xã Ái Quốc'),
(13039, 33, N'Xã Tây Tiền Hải'),
(13057, 33, N'Xã Nam Cường'),
(13063, 33, N'Xã Nam Tiền Hải'),
(13066, 33, N'Xã Hưng Phú'),
(13075, 33, N'Xã Kiến Xương'),
(13093, 33, N'Xã Trà Giang'),
(13096, 33, N'Xã Bình Nguyên'),
(13120, 33, N'Xã Lê Lợi'),
(13132, 33, N'Xã Quang Lịch'),
(13141, 33, N'Xã Vũ Quý'),
(13159, 33, N'Xã Hồng Vũ'),
(13183, 33, N'Xã Bình Thanh'),
(13186, 33, N'Xã Bình Định'),
(13192, 33, N'Xã Vũ Thư'),
(13219, 33, N'Xã Vạn Xuân'),
(13222, 33, N'Xã Thư Trì'),
(13225, 33, N'Phường Thái Bình'),
(13246, 33, N'Xã Tân Thuận'),
(13264, 33, N'Xã Thư Vũ'),
(13279, 33, N'Xã Vũ Tiên'),
(13285, 37, N'Phường Phủ Lý'),
(13291, 37, N'Phường Phù Vân'),
(13318, 37, N'Phường Châu Sơn'),
(13324, 37, N'Phường Duy Tiên'),
(13330, 37, N'Phường Duy Tân'),
(13336, 37, N'Phường Duy Hà'),
(13348, 37, N'Phường Đồng Văn'),
(13363, 37, N'Phường Tiên Sơn'),
(13366, 37, N'Phường Hà Nam'),
(13384, 37, N'Phường Kim Bảng'),
(13393, 37, N'Phường Lê Hồ'),
(13396, 37, N'Phường Nguyễn Uý'),
(13402, 37, N'Phường Kim Thanh'),
(13420, 37, N'Phường Tam Chúc'),
(13435, 37, N'Phường Lý Thường Kiệt'),
(13444, 37, N'Phường Liêm Tuyền'),
(13456, 37, N'Xã Liêm Hà'),
(13474, 37, N'Xã Tân Thanh'),
(13483, 37, N'Xã Thanh Bình'),
(13489, 37, N'Xã Thanh Lâm'),
(13495, 37, N'Xã Thanh Liêm'),
(13501, 37, N'Xã Bình Mỹ'),
(13504, 37, N'Xã Bình Lục'),
(13531, 37, N'Xã Bình Giang'),
(13540, 37, N'Xã Bình An'),
(13558, 37, N'Xã Bình Sơn'),
(13573, 37, N'Xã Lý Nhân'),
(13579, 37, N'Xã Bắc Lý'),
(13591, 37, N'Xã Nam Xang'),
(13594, 37, N'Xã Trần Thương'),
(13597, 37, N'Xã Vĩnh Trụ'),
(13609, 37, N'Xã Nhân Hà'),
(13627, 37, N'Xã Nam Lý'),
(13669, 37, N'Phường Nam Định'),
(13684, 37, N'Phường Thiên Trường'),
(13693, 37, N'Phường Đông A'),
(13699, 37, N'Phường Thành Nam'),
(13708, 37, N'Phường Mỹ Lộc'),
(13741, 37, N'Xã Vụ Bản'),
(13750, 37, N'Xã Minh Tân'),
(13753, 37, N'Xã Hiển Khánh'),
(13777, 37, N'Phường Trường Thi'),
(13786, 37, N'Xã Liên Minh'),
(13795, 37, N'Xã Ý Yên'),
(13807, 37, N'Xã Tân Minh'),
(13822, 37, N'Xã Phong Doanh'),
(13834, 37, N'Xã Vũ Dương'),
(13864, 37, N'Xã Vạn Thắng'),
(13870, 37, N'Xã Yên Cường'),
(13879, 37, N'Xã Yên Đồng'),
(13891, 37, N'Xã Nghĩa Hưng'),
(13894, 37, N'Xã Rạng Đông'),
(13900, 37, N'Xã Đồng Thịnh'),
(13918, 37, N'Xã Nghĩa Sơn'),
(13927, 37, N'Xã Hồng Phong'),
(13939, 37, N'Xã Quỹ Nhất'),
(13957, 37, N'Xã Nghĩa Lâm'),
(13966, 37, N'Xã Nam Trực'),
(13972, 37, N'Phường Vị Khê'),
(13984, 37, N'Phường Hồng Quang'),
(13987, 37, N'Xã Nam Hồng'),
(14005, 37, N'Xã Nam Ninh'),
(14011, 37, N'Xã Nam Minh'),
(14014, 37, N'Xã Nam Đồng'),
(14026, 37, N'Xã Cổ Lễ'),
(14038, 37, N'Xã Ninh Giang'),
(14053, 37, N'Xã Trực Ninh'),
(14056, 37, N'Xã Cát Thành'),
(14062, 37, N'Xã Quang Hưng'),
(14071, 37, N'Xã Minh Thái'),
(14077, 37, N'Xã Ninh Cường'),
(14089, 37, N'Xã Xuân Trường'),
(14095, 37, N'Xã Xuân Hồng'),
(14104, 37, N'Xã Xuân Giang'),
(14122, 37, N'Xã Xuân Hưng'),
(14161, 37, N'Xã Giao Minh'),
(14167, 37, N'Xã Giao Thuỷ'),
(14179, 37, N'Xã Giao Hưng'),
(14182, 37, N'Xã Giao Hoà'),
(14194, 37, N'Xã Giao Bình'),
(14203, 37, N'Xã Giao Phúc'),
(14212, 37, N'Xã Giao Ninh'),
(14215, 37, N'Xã Hải Hậu'),
(14218, 37, N'Xã Hải Tiến'),
(14221, 37, N'Xã Hải Thịnh'),
(14236, 37, N'Xã Hải Anh'),
(14248, 37, N'Xã Hải Hưng'),
(14281, 37, N'Xã Hải An'),
(14287, 37, N'Xã Hải Quang'),
(14308, 37, N'Xã Hải Xuân'),
(14329, 37, N'Phường Hoa Lư'),
(14359, 37, N'Phường Nam Hoa Lư'),
(14362, 37, N'Phường Tam Điệp'),
(14365, 37, N'Phường Trung Sơn'),
(14371, 37, N'Phường Yên Sơn'),
(14389, 37, N'Xã Gia Lâm'),
(14401, 37, N'Xã Gia Tường'),
(14404, 37, N'Xã Cúc Phương'),
(14407, 37, N'Xã Phú Sơn'),
(14428, 37, N'Xã Nho Quan'),
(14434, 37, N'Xã Thanh Sơn'),
(14452, 37, N'Xã Quỳnh Lưu'),
(14458, 37, N'Xã Phú Long'),
(14464, 37, N'Xã Gia Viễn'),
(14482, 37, N'Xã Gia Hưng'),
(14488, 37, N'Xã Gia Vân'),
(14494, 37, N'Xã Gia Trấn'),
(14500, 37, N'Xã Đại Hoàng'),
(14524, 37, N'Xã Gia Phong'),
(14533, 37, N'Phường Tây Hoa Lư'),
(14560, 37, N'Xã Yên Khánh'),
(14563, 37, N'Xã Khánh Thiện'),
(14566, 37, N'Phường Đông Hoa Lư'),
(14608, 37, N'Xã Khánh Trung'),
(14611, 37, N'Xã Khánh Nhạc'),
(14614, 37, N'Xã Khánh Hội'),
(14620, 37, N'Xã Phát Diệm'),
(14623, 37, N'Xã Bình Minh'),
(14638, 37, N'Xã Kim Sơn'),
(14647, 37, N'Xã Quang Thiện'),
(14653, 37, N'Xã Chất Bình'),
(14674, 37, N'Xã Lai Thành'),
(14677, 37, N'Xã Định Hóa'),
(14698, 37, N'Xã Kim Đông'),
(14701, 37, N'Xã Yên Mô'),
(14725, 37, N'Phường Yên Thắng'),
(14728, 37, N'Xã Yên Từ'),
(14743, 37, N'Xã Yên Mạc'),
(14746, 37, N'Xã Đồng Thái'),
(14758, 38, N'Phường Hàm Rồng'),
(14797, 38, N'Phường Hạc Thành'),
(14812, 38, N'Phường Bỉm Sơn'),
(14818, 38, N'Phường Quang Trung'),
(14845, 38, N'Xã Mường Lát'),
(14848, 38, N'Xã Tam Chung'),
(14854, 38, N'Xã Mường Lý'),
(14857, 38, N'Xã Trung Lý'),
(14860, 38, N'Xã Quang Chiểu'),
(14863, 38, N'Xã Pù Nhi'),
(14864, 38, N'Xã Nhi Sơn'),
(14866, 38, N'Xã Mường Chanh'),
(14869, 38, N'Xã Hồi Xuân'),
(14872, 38, N'Xã Trung Thành'),
(14875, 38, N'Xã Trung Sơn'),
(14878, 38, N'Xã Phú Lệ'),
(14890, 38, N'Xã Phú Xuân'),
(14896, 38, N'Xã Hiền Kiệt'),
(14902, 38, N'Xã Nam Xuân'),
(14908, 38, N'Xã Thiên Phủ'),
(14923, 38, N'Xã Bá Thước'),
(14932, 38, N'Xã Điền Quang'),
(14950, 38, N'Xã Điền Lư'),
(14953, 38, N'Xã Quý Lương'),
(14956, 38, N'Xã Pù Luông'),
(14959, 38, N'Xã Cổ Lũng'),
(14974, 38, N'Xã Văn Nho'),
(14980, 38, N'Xã Thiết Ống'),
(15001, 38, N'Xã Trung Hạ'),
(15007, 38, N'Xã Tam Thanh'),
(15010, 38, N'Xã Sơn Thủy'),
(15013, 38, N'Xã Na Mèo'),
(15016, 38, N'Xã Quan Sơn'),
(15019, 38, N'Xã Tam Lư'),
(15022, 38, N'Xã Sơn Điện'),
(15025, 38, N'Xã Mường Mìn'),
(15031, 38, N'Xã Yên Khương'),
(15034, 38, N'Xã Yên Thắng'),
(15043, 38, N'Xã Giao An'),
(15049, 38, N'Xã Văn Phú'),
(15055, 38, N'Xã Linh Sơn'),
(15058, 38, N'Xã Đồng Lương'),
(15061, 38, N'Xã Ngọc Lặc'),
(15085, 38, N'Xã Thạch Lập'),
(15091, 38, N'Xã Ngọc Liên'),
(15106, 38, N'Xã Nguyệt Ấn'),
(15112, 38, N'Xã Kiên Thọ'),
(15124, 38, N'Xã Minh Sơn'),
(15127, 38, N'Xã Cẩm Thủy'),
(15142, 38, N'Xã Cẩm Thạch'),
(15148, 38, N'Xã Cẩm Tú'),
(15163, 38, N'Xã Cẩm Vân'),
(15178, 38, N'Xã Cẩm Tân'),
(15187, 38, N'Xã Kim Tân'),
(15190, 38, N'Xã Vân Du'),
(15199, 38, N'Xã Thạch Quảng'),
(15211, 38, N'Xã Thạch Bình'),
(15229, 38, N'Xã Thành Vinh'),
(15250, 38, N'Xã Ngọc Trạo'),
(15271, 38, N'Xã Hà Trung'),
(15274, 38, N'Xã Hà Long'),
(15286, 38, N'Xã Hoạt Giang'),
(15298, 38, N'Xã Lĩnh Toại'),
(15316, 38, N'Xã Tống Sơn'),
(15349, 38, N'Xã Vĩnh Lộc'),
(15361, 38, N'Xã Tây Đô'),
(15382, 38, N'Xã Biện Thượng'),
(15409, 38, N'Xã Yên Phú'),
(15412, 38, N'Xã Quý Lộc'),
(15421, 38, N'Xã Yên Trường'),
(15442, 38, N'Xã Yên Ninh'),
(15448, 38, N'Xã Định Hòa'),
(15457, 38, N'Xã Định Tân'),
(15469, 38, N'Xã Yên Định'),
(15499, 38, N'Xã Thọ Xuân'),
(15505, 38, N'Xã Thọ Long'),
(15520, 38, N'Xã Xuân Hòa'),
(15544, 38, N'Xã Lam Sơn'),
(15553, 38, N'Xã Sao Vàng'),
(15568, 38, N'Xã Thọ Lập'),
(15574, 38, N'Xã Xuân Tín'),
(15592, 38, N'Xã Xuân Lập'),
(15607, 38, N'Xã Bát Mọt'),
(15610, 38, N'Xã Yên Nhân'),
(15622, 38, N'Xã Vạn Xuân'),
(15628, 38, N'Xã Lương Sơn'),
(15634, 38, N'Xã Luận Thành'),
(15643, 38, N'Xã Thắng Lộc'),
(15646, 38, N'Xã Thường Xuân'),
(15658, 38, N'Xã Xuân Chinh'),
(15661, 38, N'Xã Tân Thành'),
(15664, 38, N'Xã Triệu Sơn'),
(15667, 38, N'Xã Thọ Bình'),
(15682, 38, N'Xã Hợp Tiến'),
(15715, 38, N'Xã Tân Ninh'),
(15724, 38, N'Xã Đồng Tiến'),
(15754, 38, N'Xã Thọ Ngọc'),
(15763, 38, N'Xã Thọ Phú'),
(15766, 38, N'Xã An Nông'),
(15772, 38, N'Xã Thiệu Hóa'),
(15778, 38, N'Xã Thiệu Tiến'),
(15796, 38, N'Xã Thiệu Quang'),
(15820, 38, N'Xã Thiệu Toán'),
(15835, 38, N'Xã Thiệu Trung'),
(15853, 38, N'Phường Đông Tiến'),
(15865, 38, N'Xã Hoằng Hóa'),
(15880, 38, N'Xã Hoằng Giang'),
(15889, 38, N'Xã Hoằng Phú'),
(15910, 38, N'Xã Hoằng Sơn'),
(15925, 38, N'Phường Nguyệt Viên'),
(15961, 38, N'Xã Hoằng Lộc'),
(15976, 38, N'Xã Hoằng Châu'),
(15991, 38, N'Xã Hoằng Tiến'),
(16000, 38, N'Xã Hoằng Thanh'),
(16012, 38, N'Xã Hậu Lộc'),
(16021, 38, N'Xã Triệu Lộc'),
(16033, 38, N'Xã Đông Thành'),
(16072, 38, N'Xã Hoa Lộc'),
(16078, 38, N'Xã Vạn Lộc'),
(16093, 38, N'Xã Nga Sơn'),
(16108, 38, N'Xã Tân Tiến'),
(16114, 38, N'Xã Nga Thắng'),
(16138, 38, N'Xã Hồ Vương'),
(16144, 38, N'Xã Nga An'),
(16171, 38, N'Xã Ba Đình'),
(16174, 38, N'Xã Như Xuân'),
(16177, 38, N'Xã Xuân Bình'),
(16186, 38, N'Xã Hóa Quỳ'),
(16213, 38, N'Xã Thanh Phong'),
(16222, 38, N'Xã Thanh Quân'),
(16225, 38, N'Xã Thượng Ninh'),
(16228, 38, N'Xã Như Thanh');
GO
INSERT INTO WEB_PHUONG_XA (MaPhuongXa, MaTinhThanh, TenPhuongXa) VALUES
(16234, 38, N'Xã Xuân Du'),
(16249, 38, N'Xã Mậu Lâm'),
(16258, 38, N'Xã Xuân Thái'),
(16264, 38, N'Xã Yên Thọ'),
(16273, 38, N'Xã Thanh Kỳ'),
(16279, 38, N'Xã Nông Cống'),
(16297, 38, N'Xã Trung Chính'),
(16309, 38, N'Xã Thắng Lợi'),
(16342, 38, N'Xã Thăng Bình'),
(16348, 38, N'Xã Trường Văn'),
(16363, 38, N'Xã Tượng Lĩnh'),
(16369, 38, N'Xã Công Chính'),
(16378, 38, N'Phường Đông Sơn'),
(16417, 38, N'Phường Đông Quang'),
(16438, 38, N'Xã Lưu Vệ'),
(16480, 38, N'Xã Quảng Yên'),
(16489, 38, N'Xã Quảng Chính'),
(16498, 38, N'Xã Quảng Ngọc'),
(16516, 38, N'Phường Nam Sầm Sơn'),
(16522, 38, N'Phường Quảng Phú'),
(16531, 38, N'Phường Sầm Sơn'),
(16540, 38, N'Xã Quảng Ninh'),
(16543, 38, N'Xã Quảng Bình'),
(16549, 38, N'Xã Tiên Trang'),
(16561, 38, N'Phường Tĩnh Gia'),
(16576, 38, N'Phường Ngọc Sơn'),
(16591, 38, N'Xã Các Sơn'),
(16594, 38, N'Phường Tân Dân'),
(16597, 38, N'Phường Hải Lĩnh'),
(16609, 38, N'Phường Đào Duy Từ'),
(16624, 38, N'Phường Trúc Lâm'),
(16636, 38, N'Xã Trường Lâm'),
(16645, 38, N'Phường Hải Bình'),
(16654, 38, N'Phường Nghi Sơn'),
(16681, 40, N'Phường Thành Vinh'),
(16690, 40, N'Phường Trường Vinh'),
(16702, 40, N'Phường Vinh Phú'),
(16708, 40, N'Phường Vinh Lộc'),
(16732, 40, N'Phường Cửa Lò'),
(16738, 40, N'Xã Quế Phong'),
(16744, 40, N'Xã Thông Thụ'),
(16750, 40, N'Xã Tiền Phong'),
(16756, 40, N'Xã Tri Lễ'),
(16774, 40, N'Xã Mường Quàng'),
(16777, 40, N'Xã Quỳ Châu'),
(16792, 40, N'Xã Châu Tiến'),
(16801, 40, N'Xã Hùng Chân'),
(16804, 40, N'Xã Châu Bình'),
(16813, 40, N'Xã Mường Xén'),
(16816, 40, N'Xã Mỹ Lý'),
(16819, 40, N'Xã Bắc Lý'),
(16822, 40, N'Xã Keng Đu'),
(16828, 40, N'Xã Huồi Tụ'),
(16831, 40, N'Xã Mường Lống'),
(16834, 40, N'Xã Na Loi'),
(16837, 40, N'Xã Nậm Cắn'),
(16849, 40, N'Xã Hữu Kiệm'),
(16855, 40, N'Xã Chiêu Lưu'),
(16858, 40, N'Xã Mường Típ'),
(16870, 40, N'Xã Na Ngoi'),
(16876, 40, N'Xã Tương Dương'),
(16882, 40, N'Xã Nhôn Mai'),
(16885, 40, N'Xã Hữu Khuông'),
(16903, 40, N'Xã Nga My'),
(16906, 40, N'Xã Lượng Minh'),
(16909, 40, N'Xã Yên Hòa'),
(16912, 40, N'Xã Yên Na'),
(16933, 40, N'Xã Tam Quang'),
(16936, 40, N'Xã Tam Thái'),
(16939, 40, N'Phường Thái Hòa'),
(16941, 40, N'Xã Nghĩa Đàn'),
(16951, 40, N'Xã Nghĩa Lâm'),
(16969, 40, N'Xã Nghĩa Thọ'),
(16972, 40, N'Xã Nghĩa Hưng'),
(16975, 40, N'Xã Nghĩa Mai'),
(17011, 40, N'Phường Tây Hiếu'),
(17017, 40, N'Xã Đông Hiếu'),
(17029, 40, N'Xã Nghĩa Lộc'),
(17032, 40, N'Xã Nghĩa Khánh'),
(17035, 40, N'Xã Quỳ Hợp'),
(17044, 40, N'Xã Châu Hồng'),
(17056, 40, N'Xã Châu Lộc'),
(17059, 40, N'Xã Tam Hợp'),
(17071, 40, N'Xã Minh Hợp'),
(17077, 40, N'Xã Mường Ham'),
(17089, 40, N'Xã Mường Chọng'),
(17110, 40, N'Phường Hoàng Mai'),
(17125, 40, N'Phường Quỳnh Mai'),
(17128, 40, N'Phường Tân Mai'),
(17143, 40, N'Xã Quỳnh Văn'),
(17149, 40, N'Xã Quỳnh Tam'),
(17170, 40, N'Xã Quỳnh Sơn'),
(17176, 40, N'Xã Quỳnh Anh'),
(17179, 40, N'Xã Quỳnh Lưu'),
(17212, 40, N'Xã Quỳnh Phú'),
(17224, 40, N'Xã Quỳnh Thắng'),
(17230, 40, N'Xã Bình Chuẩn'),
(17239, 40, N'Xã Mậu Thạch'),
(17242, 40, N'Xã Cam Phục'),
(17248, 40, N'Xã Châu Khê'),
(17254, 40, N'Xã Con Cuông'),
(17263, 40, N'Xã Môn Sơn'),
(17266, 40, N'Xã Tân Kỳ'),
(17272, 40, N'Xã Tân Phú'),
(17278, 40, N'Xã Giai Xuân'),
(17284, 40, N'Xã Nghĩa Đồng'),
(17287, 40, N'Xã Tiên Đồng'),
(17305, 40, N'Xã Tân An'),
(17326, 40, N'Xã Nghĩa Hành'),
(17329, 40, N'Xã Anh Sơn'),
(17335, 40, N'Xã Thành Bình Thọ'),
(17344, 40, N'Xã Nhân Hòa'),
(17357, 40, N'Xã Vĩnh Tường'),
(17365, 40, N'Xã Anh Sơn Đông'),
(17380, 40, N'Xã Yên Xuân'),
(17395, 40, N'Xã Hùng Châu'),
(17416, 40, N'Xã Đức Châu'),
(17419, 40, N'Xã Hải Châu'),
(17443, 40, N'Xã Quảng Châu'),
(17464, 40, N'Xã Diễn Châu'),
(17476, 40, N'Xã Minh Châu'),
(17479, 40, N'Xã An Châu'),
(17488, 40, N'Xã Tân Châu'),
(17506, 40, N'Xã Yên Thành'),
(17515, 40, N'Xã Bình Minh'),
(17521, 40, N'Xã Quang Đồng'),
(17524, 40, N'Xã Giai Lạc'),
(17530, 40, N'Xã Đông Thành'),
(17560, 40, N'Xã Vân Du'),
(17569, 40, N'Xã Quan Thành'),
(17605, 40, N'Xã Hợp Minh'),
(17611, 40, N'Xã Vân Tụ'),
(17623, 40, N'Xã Bạch Ngọc'),
(17641, 40, N'Xã Lương Sơn'),
(17662, 40, N'Xã Đô Lương'),
(17677, 40, N'Xã Văn Hiến'),
(17689, 40, N'Xã Thuần Trung'),
(17707, 40, N'Xã Bạch Hà'),
(17713, 40, N'Xã Đại Đồng'),
(17722, 40, N'Xã Hạnh Lâm'),
(17728, 40, N'Xã Cát Ngạn'),
(17743, 40, N'Xã Tam Đồng'),
(17759, 40, N'Xã Sơn Lâm'),
(17770, 40, N'Xã Hoa Quân'),
(17779, 40, N'Xã Xuân Lâm'),
(17791, 40, N'Xã Kim Bảng'),
(17818, 40, N'Xã Bích Hào'),
(17827, 40, N'Xã Nghi Lộc'),
(17833, 40, N'Xã Hải Lộc'),
(17842, 40, N'Xã Thần Lĩnh'),
(17854, 40, N'Xã Văn Kiều'),
(17857, 40, N'Xã Phúc Lộc'),
(17866, 40, N'Xã Trung Lộc'),
(17878, 40, N'Xã Đông Lộc'),
(17920, 40, N'Phường Vinh Hưng'),
(17935, 40, N'Xã Nam Đàn'),
(17944, 40, N'Xã Đại Huệ'),
(17950, 40, N'Xã Vạn An'),
(17971, 40, N'Xã Kim Liên'),
(17989, 40, N'Xã Thiên Nhẫn'),
(18001, 40, N'Xã Hưng Nguyên'),
(18007, 40, N'Xã Yên Trung'),
(18028, 40, N'Xã Hưng Nguyên Nam'),
(18040, 40, N'Xã Lam Thành'),
(18073, 42, N'Phường Thành Sen'),
(18100, 42, N'Phường Trần Phú'),
(18115, 42, N'Phường Bắc Hồng Lĩnh'),
(18118, 42, N'Phường Nam Hồng Lĩnh'),
(18133, 42, N'Xã Hương Sơn'),
(18160, 42, N'Xã Sơn Hồng'),
(18163, 42, N'Xã Sơn Tiến'),
(18172, 42, N'Xã Sơn Tây'),
(18184, 42, N'Xã Sơn Giang'),
(18196, 42, N'Xã Sơn Kim 1'),
(18199, 42, N'Xã Sơn Kim 2'),
(18202, 42, N'Xã Tứ Mỹ'),
(18223, 42, N'Xã Kim Hoa'),
(18229, 42, N'Xã Đức Thọ'),
(18244, 42, N'Xã Đức Minh'),
(18262, 42, N'Xã Đức Quang'),
(18277, 42, N'Xã Đức Thịnh'),
(18304, 42, N'Xã Đức Đồng'),
(18313, 42, N'Xã Vũ Quang'),
(18322, 42, N'Xã Mai Hoa'),
(18328, 42, N'Xã Thượng Đức'),
(18352, 42, N'Xã Nghi Xuân'),
(18364, 42, N'Xã Đan Hải'),
(18373, 42, N'Xã Tiên Điền'),
(18394, 42, N'Xã Cổ Đạm'),
(18406, 42, N'Xã Can Lộc'),
(18409, 42, N'Xã Hồng Lộc'),
(18418, 42, N'Xã Tùng Lộc'),
(18436, 42, N'Xã Trường Lưu'),
(18466, 42, N'Xã Gia Hanh'),
(18481, 42, N'Xã Xuân Lộc'),
(18484, 42, N'Xã Đồng Lộc'),
(18496, 42, N'Xã Hương Khê'),
(18502, 42, N'Xã Hà Linh'),
(18523, 42, N'Xã Hương Bình'),
(18532, 42, N'Xã Hương Phố'),
(18544, 42, N'Xã Hương Xuân'),
(18547, 42, N'Xã Phúc Trạch'),
(18550, 42, N'Xã Hương Đô'),
(18562, 42, N'Xã Thạch Hà'),
(18568, 42, N'Xã Lộc Hà'),
(18583, 42, N'Xã Mai Phụ'),
(18586, 42, N'Xã Đông Kinh'),
(18601, 42, N'Xã Việt Xuyên'),
(18604, 42, N'Xã Thạch Khê'),
(18619, 42, N'Xã Đồng Tiến'),
(18628, 42, N'Xã Thạch Lạc'),
(18634, 42, N'Xã Toàn Lưu'),
(18652, 42, N'Phường Hà Huy Tập'),
(18667, 42, N'Xã Thạch Xuân'),
(18673, 42, N'Xã Cẩm Xuyên'),
(18676, 42, N'Xã Thiên Cầm'),
(18682, 42, N'Xã Yên Hòa'),
(18685, 42, N'Xã Cẩm Bình'),
(18736, 42, N'Xã Cẩm Hưng'),
(18739, 42, N'Xã Cẩm Duệ'),
(18742, 42, N'Xã Cẩm Trung'),
(18748, 42, N'Xã Cẩm Lạc'),
(18754, 42, N'Phường Sông Trí'),
(18766, 42, N'Xã Kỳ Xuân'),
(18775, 42, N'Xã Kỳ Anh'),
(18781, 42, N'Phường Hải Ninh'),
(18787, 42, N'Xã Kỳ Văn'),
(18790, 42, N'Xã Kỳ Khang'),
(18814, 42, N'Xã Kỳ Hoa'),
(18823, 42, N'Phường Vũng Áng'),
(18832, 42, N'Phường Hoành Sơn'),
(18838, 42, N'Xã Kỳ Lạc'),
(18844, 42, N'Xã Kỳ Thượng'),
(18859, 44, N'Phường Đồng Thuận'),
(18871, 44, N'Phường Đồng Sơn'),
(18880, 44, N'Phường Đồng Hới'),
(18901, 44, N'Xã Minh Hóa'),
(18904, 44, N'Xã Dân Hóa'),
(18919, 44, N'Xã Tân Thành'),
(18922, 44, N'Xã Kim Điền'),
(18943, 44, N'Xã Kim Phú'),
(18949, 44, N'Xã Đồng Lê'),
(18952, 44, N'Xã Tuyên Sơn'),
(18958, 44, N'Xã Tuyên Lâm'),
(18985, 44, N'Xã Tuyên Phú'),
(18991, 44, N'Xã Tuyên Bình'),
(18997, 44, N'Xã Tuyên Hóa'),
(19009, 44, N'Phường Ba Đồn'),
(19021, 44, N'Xã Phú Trạch'),
(19030, 44, N'Xã Trung Thuần'),
(19033, 44, N'Xã Hòa Trạch'),
(19051, 44, N'Xã Tân Gianh'),
(19057, 44, N'Xã Quảng Trạch'),
(19066, 44, N'Phường Bắc Gianh'),
(19075, 44, N'Xã Nam Ba Đồn'),
(19093, 44, N'Xã Nam Gianh'),
(19111, 44, N'Xã Hoàn Lão'),
(19126, 44, N'Xã Bắc Trạch'),
(19138, 44, N'Xã Phong Nha'),
(19141, 44, N'Xã Bố Trạch'),
(19147, 44, N'Xã Thượng Trạch'),
(19159, 44, N'Xã Đông Trạch'),
(19198, 44, N'Xã Nam Trạch'),
(19204, 44, N'Xã Trường Sơn'),
(19207, 44, N'Xã Quảng Ninh'),
(19225, 44, N'Xã Ninh Châu'),
(19237, 44, N'Xã Trường Ninh'),
(19246, 44, N'Xã Lệ Ninh'),
(19249, 44, N'Xã Lệ Thủy'),
(19255, 44, N'Xã Cam Hồng'),
(19288, 44, N'Xã Sen Ngư'),
(19291, 44, N'Xã Tân Mỹ'),
(19309, 44, N'Xã Trường Phú'),
(19318, 44, N'Xã Kim Ngân'),
(19333, 44, N'Phường Đông Hà'),
(19351, 44, N'Phường Nam Đông Hà'),
(19360, 44, N'Phường Quảng Trị'),
(19363, 44, N'Xã Vĩnh Linh'),
(19366, 44, N'Xã Bến Quan'),
(19372, 44, N'Xã Vĩnh Hoàng'),
(19405, 44, N'Xã Vĩnh Thủy'),
(19414, 44, N'Xã Cửa Tùng'),
(19429, 44, N'Xã Khe Sanh'),
(19432, 44, N'Xã Lao Bảo'),
(19435, 44, N'Xã Hướng Lập'),
(19441, 44, N'Xã Hướng Phùng'),
(19462, 44, N'Xã Tân Lập'),
(19483, 44, N'Xã A Dơi'),
(19489, 44, N'Xã Lìa'),
(19495, 44, N'Xã Gio Linh'),
(19496, 44, N'Xã Cửa Việt'),
(19501, 44, N'Xã Bến Hải'),
(19537, 44, N'Xã Cồn Tiên'),
(19555, 44, N'Xã Hướng Hiệp'),
(19564, 44, N'Xã Đakrông'),
(19567, 44, N'Xã Ba Lòng'),
(19588, 44, N'Xã Tà Rụt'),
(19594, 44, N'Xã La Lay'),
(19597, 44, N'Xã Cam Lộ'),
(19603, 44, N'Xã Hiếu Giang'),
(19624, 44, N'Xã Triệu Phong'),
(19639, 44, N'Xã Nam Cửa Việt'),
(19645, 44, N'Xã Triệu Bình'),
(19654, 44, N'Xã Triệu Cơ'),
(19669, 44, N'Xã Ái Tử'),
(19681, 44, N'Xã Diên Sanh'),
(19699, 44, N'Xã Vĩnh Định'),
(19702, 44, N'Xã Hải Lăng'),
(19735, 44, N'Xã Nam Hải Lăng'),
(19741, 44, N'Xã Mỹ Thủy'),
(19742, 44, N'Đặc khu Cồn Cỏ'),
(19753, 46, N'Phường Phú Xuân'),
(19774, 46, N'Phường Kim Long'),
(19777, 46, N'Phường Vỹ Dạ'),
(19789, 46, N'Phường Thuận Hóa'),
(19804, 46, N'Phường Hương An'),
(19813, 46, N'Phường Thủy Xuân'),
(19815, 46, N'Phường An Cựu'),
(19819, 46, N'Phường Phong Điền'),
(19828, 46, N'Phường Phong Phú'),
(19831, 46, N'Phường Phong Dinh'),
(19858, 46, N'Phường Phong Thái'),
(19867, 46, N'Xã Quảng Điền'),
(19873, 46, N'Phường Phong Quảng'),
(19885, 46, N'Xã Đan Điền'),
(19900, 46, N'Phường Thuận An'),
(19909, 46, N'Phường Dương Nỗ'),
(19918, 46, N'Xã Phú Hồ'),
(19930, 46, N'Phường Mỹ Thượng'),
(19942, 46, N'Xã Phú Vang'),
(19945, 46, N'Xã Phú Vinh'),
(19960, 46, N'Phường Phú Bài'),
(19969, 46, N'Phường Thanh Thủy'),
(19975, 46, N'Phường Hương Thủy'),
(19996, 46, N'Phường Hương Trà'),
(20014, 46, N'Phường Hóa Châu'),
(20017, 46, N'Phường Kim Trà'),
(20035, 46, N'Xã Bình Điền'),
(20044, 46, N'Xã A Lưới 2'),
(20050, 46, N'Xã A Lưới 5'),
(20056, 46, N'Xã A Lưới 1'),
(20071, 46, N'Xã A Lưới 3'),
(20101, 46, N'Xã A Lưới 4'),
(20107, 46, N'Xã Phú Lộc'),
(20122, 46, N'Xã Vinh Lộc'),
(20131, 46, N'Xã Hưng Lộc'),
(20137, 46, N'Xã Chân Mây - Lăng Cô'),
(20140, 46, N'Xã Lộc An'),
(20161, 46, N'Xã Khe Tre'),
(20179, 46, N'Xã Nam Đông'),
(20182, 46, N'Xã Long Quảng'),
(20194, 48, N'Phường Hải Vân'),
(20197, 48, N'Phường Liên Chiểu'),
(20200, 48, N'Phường Hòa Khánh'),
(20209, 48, N'Phường Thanh Khê'),
(20242, 48, N'Phường Hải Châu'),
(20257, 48, N'Phường Hòa Cường'),
(20260, 48, N'Phường Cẩm Lệ'),
(20263, 48, N'Phường Sơn Trà'),
(20275, 48, N'Phường An Hải'),
(20285, 48, N'Phường Ngũ Hành Sơn'),
(20305, 48, N'Phường An Khê'),
(20308, 48, N'Xã Bà Nà'),
(20314, 48, N'Phường Hòa Xuân'),
(20320, 48, N'Xã Hòa Vang'),
(20332, 48, N'Xã Hòa Tiến'),
(20333, 48, N'Đặc khu Hoàng Sa'),
(20335, 48, N'Phường Bàn Thạch'),
(20341, 48, N'Phường Tam Kỳ'),
(20350, 48, N'Phường Hương Trà'),
(20356, 48, N'Phường Quảng Phú'),
(20364, 48, N'Xã Chiên Đàn'),
(20380, 48, N'Xã Tây Hồ'),
(20392, 48, N'Xã Phú Ninh'),
(20401, 48, N'Phường Hội An Tây'),
(20410, 48, N'Phường Hội An'),
(20413, 48, N'Phường Hội An Đông'),
(20434, 48, N'Xã Tân Hiệp'),
(20443, 48, N'Xã Hùng Sơn'),
(20455, 48, N'Xã Tây Giang'),
(20458, 48, N'Xã Avương'),
(20467, 48, N'Xã Đông Giang'),
(20476, 48, N'Xã Sông Kôn'),
(20485, 48, N'Xã Sông Vàng'),
(20494, 48, N'Xã Bến Hiên'),
(20500, 48, N'Xã Đại Lộc'),
(20506, 48, N'Xã Thượng Đức'),
(20515, 48, N'Xã Hà Nha'),
(20539, 48, N'Xã Vu Gia'),
(20542, 48, N'Xã Phú Thuận'),
(20551, 48, N'Phường Điện Bàn'),
(20557, 48, N'Phường Điện Bàn Bắc'),
(20569, 48, N'Xã Điện Bàn Tây'),
(20575, 48, N'Phường An Thắng'),
(20579, 48, N'Phường Điện Bàn Đông'),
(20587, 48, N'Xã Gò Nổi'),
(20599, 48, N'Xã Nam Phước'),
(20611, 48, N'Xã Thu Bồn'),
(20623, 48, N'Xã Duy Xuyên'),
(20635, 48, N'Xã Duy Nghĩa'),
(20641, 48, N'Xã Quế Sơn'),
(20650, 48, N'Xã Xuân Phú'),
(20656, 48, N'Xã Nông Sơn'),
(20662, 48, N'Xã Quế Sơn Trung'),
(20669, 48, N'Xã Quế Phước'),
(20695, 48, N'Xã Thạnh Mỹ'),
(20698, 48, N'Xã La Êê'),
(20704, 48, N'Xã La Dêê'),
(20707, 48, N'Xã Nam Giang'),
(20710, 48, N'Xã Bến Giằng'),
(20716, 48, N'Xã Đắc Pring'),
(20722, 48, N'Xã Khâm Đức'),
(20728, 48, N'Xã Phước Hiệp'),
(20734, 48, N'Xã Phước Năng'),
(20740, 48, N'Xã Phước Chánh'),
(20752, 48, N'Xã Phước Thành'),
(20767, 48, N'Xã Việt An'),
(20770, 48, N'Xã Phước Trà'),
(20779, 48, N'Xã Hiệp Đức'),
(20791, 48, N'Xã Thăng Bình'),
(20794, 48, N'Xã Thăng An'),
(20818, 48, N'Xã Đồng Dương'),
(20827, 48, N'Xã Thăng Phú'),
(20836, 48, N'Xã Thăng Trường'),
(20848, 48, N'Xã Thăng Điền'),
(20854, 48, N'Xã Tiên Phước'),
(20857, 48, N'Xã Sơn Cẩm Hà'),
(20875, 48, N'Xã Lãnh Ngọc'),
(20878, 48, N'Xã Thạnh Bình'),
(20900, 48, N'Xã Trà My'),
(20908, 48, N'Xã Trà Liên'),
(20920, 48, N'Xã Trà Đốc'),
(20923, 48, N'Xã Trà Tân'),
(20929, 48, N'Xã Trà Giáp'),
(20938, 48, N'Xã Trà Leng'),
(20941, 48, N'Xã Trà Tập'),
(20944, 48, N'Xã Nam Trà My'),
(20950, 48, N'Xã Trà Linh'),
(20959, 48, N'Xã Trà Vân'),
(20965, 48, N'Xã Núi Thành'),
(20971, 48, N'Xã Tam Xuân'),
(20977, 48, N'Xã Đức Phú'),
(20984, 48, N'Xã Tam Anh'),
(20992, 48, N'Xã Tam Hải'),
(21004, 48, N'Xã Tam Mỹ'),
(21025, 51, N'Phường Cẩm Thành'),
(21028, 51, N'Phường Nghĩa Lộ'),
(21034, 51, N'Xã An Phú'),
(21040, 51, N'Xã Bình Sơn'),
(21061, 51, N'Xã Vạn Tường'),
(21085, 51, N'Xã Bình Minh'),
(21100, 51, N'Xã Bình Chương'),
(21109, 51, N'Xã Đông Sơn'),
(21115, 51, N'Xã Trà Bồng'),
(21124, 51, N'Xã Thanh Bồng'),
(21127, 51, N'Xã Đông Trà Bồng'),
(21136, 51, N'Xã Cà Đam'),
(21154, 51, N'Xã Tây Trà'),
(21157, 51, N'Xã Tây Trà Bồng'),
(21172, 51, N'Phường Trương Quang Trọng'),
(21181, 51, N'Xã Thọ Phong'),
(21196, 51, N'Xã Trường Giang'),
(21205, 51, N'Xã Ba Gia'),
(21211, 51, N'Xã Tịnh Khê'),
(21220, 51, N'Xã Sơn Tịnh'),
(21235, 51, N'Xã Tư Nghĩa'),
(21238, 51, N'Xã Vệ Giang'),
(21244, 51, N'Xã Trà Giang'),
(21250, 51, N'Xã Nghĩa Giang'),
(21289, 51, N'Xã Sơn Hà'),
(21292, 51, N'Xã Sơn Hạ'),
(21307, 51, N'Xã Sơn Linh'),
(21319, 51, N'Xã Sơn Thủy'),
(21325, 51, N'Xã Sơn Kỳ'),
(21334, 51, N'Xã Sơn Tây Thượng'),
(21340, 51, N'Xã Sơn Tây'),
(21343, 51, N'Xã Sơn Tây Hạ'),
(21349, 51, N'Xã Sơn Mai'),
(21361, 51, N'Xã Minh Long'),
(21364, 51, N'Xã Nghĩa Hành'),
(21370, 51, N'Xã Phước Giang'),
(21385, 51, N'Xã Đình Cương'),
(21388, 51, N'Xã Thiện Tín'),
(21400, 51, N'Xã Mộ Đức'),
(21409, 51, N'Xã Long Phụng'),
(21421, 51, N'Xã Mỏ Cày'),
(21433, 51, N'Xã Lân Phong'),
(21439, 51, N'Phường Đức Phổ'),
(21451, 51, N'Phường Trà Câu'),
(21457, 51, N'Xã Nguyễn Nghiêm'),
(21472, 51, N'Xã Khánh Cường'),
(21478, 51, N'Phường Sa Huỳnh'),
(21484, 51, N'Xã Ba Tơ'),
(21490, 51, N'Xã Ba Vinh'),
(21496, 51, N'Xã Ba Động'),
(21499, 51, N'Xã Ba Dinh'),
(21520, 51, N'Xã Đặng Thùy Trâm'),
(21523, 51, N'Xã Ba Tô'),
(21529, 51, N'Xã Ba Vì'),
(21538, 51, N'Xã Ba Xa');
GO
INSERT INTO WEB_PHUONG_XA (MaPhuongXa, MaTinhThanh, TenPhuongXa) VALUES
(21548, 51, N'Đặc khu Lý Sơn'),
(23284, 51, N'Phường Đăk Cấm'),
(23293, 51, N'Phường Kon Tum'),
(23302, 51, N'Phường Đăk Bla'),
(23317, 51, N'Xã Ngọk Bay'),
(23326, 51, N'Xã Ia Chim'),
(23332, 51, N'Xã Đăk Rơ Wa'),
(23341, 51, N'Xã Đăk Pék'),
(23344, 51, N'Xã Đăk Plô'),
(23356, 51, N'Xã Xốp'),
(23365, 51, N'Xã Ngọc Linh'),
(23368, 51, N'Xã Đăk Long'),
(23374, 51, N'Xã Đăk Môn'),
(23377, 51, N'Xã Bờ Y'),
(23383, 51, N'Xã Dục Nông'),
(23392, 51, N'Xã Sa Loong'),
(23401, 51, N'Xã Đăk Tô'),
(23416, 51, N'Xã Đăk Sao'),
(23419, 51, N'Xã Đăk Tờ Kan'),
(23425, 51, N'Xã Tu Mơ Rông'),
(23428, 51, N'Xã Ngọk Tụ'),
(23430, 51, N'Xã Kon Đào'),
(23446, 51, N'Xã Măng Ri'),
(23455, 51, N'Xã Măng Bút'),
(23473, 51, N'Xã Măng Đen'),
(23476, 51, N'Xã Kon Plông'),
(23479, 51, N'Xã Đăk Rve'),
(23485, 51, N'Xã Đăk Kôi'),
(23497, 51, N'Xã Kon Braih'),
(23500, 51, N'Xã Đăk Hà'),
(23504, 51, N'Xã Đăk Pxi'),
(23510, 51, N'Xã Đăk Ui'),
(23512, 51, N'Xã Đăk Mar'),
(23515, 51, N'Xã Ngọk Réo'),
(23527, 51, N'Xã Sa Thầy'),
(23530, 51, N'Xã Rờ Kơi'),
(23534, 51, N'Xã Sa Bình'),
(23535, 51, N'Xã Ia Đal'),
(23536, 51, N'Xã Mô Rai'),
(23538, 51, N'Xã Ia Tơi'),
(23548, 51, N'Xã Ya Ly'),
(21553, 52, N'Phường Quy Nhơn Bắc'),
(21583, 52, N'Phường Quy Nhơn'),
(21589, 52, N'Phường Quy Nhơn Tây'),
(21592, 52, N'Phường Quy Nhơn Nam'),
(21601, 52, N'Phường Quy Nhơn Đông'),
(21607, 52, N'Xã Nhơn Châu'),
(21609, 52, N'Xã An Lão'),
(21616, 52, N'Xã An Vinh'),
(21622, 52, N'Xã An Toàn'),
(21628, 52, N'Xã An Hòa'),
(21637, 52, N'Phường Tam Quan'),
(21640, 52, N'Phường Bồng Sơn'),
(21655, 52, N'Phường Hoài Nhơn Bắc'),
(21661, 52, N'Phường Hoài Nhơn Tây'),
(21664, 52, N'Phường Hoài Nhơn'),
(21670, 52, N'Phường Hoài Nhơn Đông'),
(21673, 52, N'Phường Hoài Nhơn Nam'),
(21688, 52, N'Xã Hoài Ân'),
(21697, 52, N'Xã Ân Hảo'),
(21703, 52, N'Xã Vạn Đức'),
(21715, 52, N'Xã Ân Tường'),
(21727, 52, N'Xã Kim Sơn'),
(21730, 52, N'Xã Phù Mỹ'),
(21733, 52, N'Xã Bình Dương'),
(21739, 52, N'Xã Phù Mỹ Bắc'),
(21751, 52, N'Xã Phù Mỹ Đông'),
(21757, 52, N'Xã Phù Mỹ Tây'),
(21769, 52, N'Xã An Lương'),
(21775, 52, N'Xã Phù Mỹ Nam'),
(21786, 52, N'Xã Vĩnh Thạnh'),
(21787, 52, N'Xã Vĩnh Sơn'),
(21796, 52, N'Xã Vĩnh Thịnh'),
(21805, 52, N'Xã Vĩnh Quang'),
(21808, 52, N'Xã Tây Sơn'),
(21817, 52, N'Xã Bình Hiệp'),
(21820, 52, N'Xã Bình Khê'),
(21829, 52, N'Xã Bình An'),
(21835, 52, N'Xã Bình Phú'),
(21853, 52, N'Xã Phù Cát'),
(21859, 52, N'Xã Đề Gi'),
(21868, 52, N'Xã Hội Sơn'),
(21871, 52, N'Xã Hòa Hội'),
(21880, 52, N'Xã Cát Tiến'),
(21892, 52, N'Xã Xuân An'),
(21901, 52, N'Xã Ngô Mây'),
(21907, 52, N'Phường Bình Định'),
(21910, 52, N'Phường An Nhơn'),
(21925, 52, N'Phường An Nhơn Bắc'),
(21934, 52, N'Phường An Nhơn Đông'),
(21940, 52, N'Xã An Nhơn Tây'),
(21943, 52, N'Phường An Nhơn Nam'),
(21952, 52, N'Xã Tuy Phước'),
(21964, 52, N'Xã Tuy Phước Bắc'),
(21970, 52, N'Xã Tuy Phước Đông'),
(21985, 52, N'Xã Tuy Phước Tây'),
(21994, 52, N'Xã Vân Canh'),
(21997, 52, N'Xã Canh Liên'),
(22006, 52, N'Xã Canh Vinh'),
(23563, 52, N'Phường Diên Hồng'),
(23575, 52, N'Phường Pleiku'),
(23584, 52, N'Phường Thống Nhất'),
(23586, 52, N'Phường Hội Phú'),
(23590, 52, N'Xã Biển Hồ'),
(23602, 52, N'Phường An Phú'),
(23611, 52, N'Xã Gào'),
(23614, 52, N'Phường An Bình'),
(23617, 52, N'Phường An Khê'),
(23629, 52, N'Xã Cửu An'),
(23638, 52, N'Xã Kbang'),
(23644, 52, N'Xã Đak Rong'),
(23647, 52, N'Xã Sơn Lang'),
(23650, 52, N'Xã Krong'),
(23668, 52, N'Xã Tơ Tung'),
(23674, 52, N'Xã Kông Bơ La'),
(23677, 52, N'Xã Đak Đoa'),
(23683, 52, N'Xã Đak Sơmei'),
(23701, 52, N'Xã Kon Gang'),
(23710, 52, N'Xã Ia Băng'),
(23714, 52, N'Xã KDang'),
(23722, 52, N'Xã Chư Păh'),
(23728, 52, N'Xã Ia Khươl'),
(23734, 52, N'Xã Ia Ly'),
(23749, 52, N'Xã Ia Phí'),
(23764, 52, N'Xã Ia Grai'),
(23767, 52, N'Xã Ia Hrung'),
(23776, 52, N'Xã Ia Krái'),
(23782, 52, N'Xã Ia O'),
(23788, 52, N'Xã Ia Chia'),
(23794, 52, N'Xã Mang Yang'),
(23798, 52, N'Xã Ayun'),
(23799, 52, N'Xã Hra'),
(23812, 52, N'Xã Lơ Pang'),
(23818, 52, N'Xã Kon Chiêng'),
(23824, 52, N'Xã Kông Chro'),
(23830, 52, N'Xã Chư Krey'),
(23833, 52, N'Xã Ya Ma'),
(23839, 52, N'Xã SRó'),
(23842, 52, N'Xã Đăk Song'),
(23851, 52, N'Xã Chơ Long'),
(23857, 52, N'Xã Đức Cơ'),
(23866, 52, N'Xã Ia Krêl'),
(23869, 52, N'Xã Ia Dơk'),
(23872, 52, N'Xã Ia Dom'),
(23881, 52, N'Xã Ia Pnôn'),
(23884, 52, N'Xã Ia Nan'),
(23887, 52, N'Xã Chư Prông'),
(23896, 52, N'Xã Bàu Cạn'),
(23908, 52, N'Xã Ia Tôr'),
(23911, 52, N'Xã Ia Boòng'),
(23917, 52, N'Xã Ia Púch'),
(23926, 52, N'Xã Ia Pia'),
(23935, 52, N'Xã Ia Lâu'),
(23938, 52, N'Xã Ia Mơ'),
(23941, 52, N'Xã Chư Sê'),
(23942, 52, N'Xã Chư Pưh'),
(23947, 52, N'Xã Bờ Ngoong'),
(23954, 52, N'Xã Al Bá'),
(23971, 52, N'Xã Ia Hrú'),
(23977, 52, N'Xã Ia Ko'),
(23986, 52, N'Xã Ia Le'),
(23995, 52, N'Xã Đak Pơ'),
(24007, 52, N'Xã Ya Hội'),
(24013, 52, N'Xã Pờ Tó'),
(24022, 52, N'Xã Ia Pa'),
(24028, 52, N'Xã Ia Tul'),
(24043, 52, N'Xã Phú Thiện'),
(24044, 52, N'Phường Ayun Pa'),
(24049, 52, N'Xã Chư A Thai'),
(24061, 52, N'Xã Ia Hiao'),
(24065, 52, N'Xã Ia Rbol'),
(24073, 52, N'Xã Ia Sao'),
(24076, 52, N'Xã Phú Túc'),
(24100, 52, N'Xã Ia Dreh'),
(24109, 52, N'Xã Uar'),
(24112, 52, N'Xã Ia Rsai'),
(22333, 56, N'Phường Bắc Nha Trang'),
(22366, 56, N'Phường Nha Trang'),
(22390, 56, N'Phường Tây Nha Trang'),
(22402, 56, N'Phường Nam Nha Trang'),
(22411, 56, N'Phường Bắc Cam Ranh'),
(22420, 56, N'Phường Cam Ranh'),
(22423, 56, N'Phường Ba Ngòi'),
(22432, 56, N'Phường Cam Linh'),
(22435, 56, N'Xã Cam Hiệp'),
(22453, 56, N'Xã Cam Lâm'),
(22465, 56, N'Xã Cam An'),
(22480, 56, N'Xã Nam Cam Ranh'),
(22489, 56, N'Xã Vạn Ninh'),
(22498, 56, N'Xã Tu Bông'),
(22504, 56, N'Xã Đại Lãnh'),
(22516, 56, N'Xã Vạn Thắng'),
(22525, 56, N'Xã Vạn Hưng'),
(22528, 56, N'Phường Ninh Hòa'),
(22546, 56, N'Xã Bắc Ninh Hòa'),
(22552, 56, N'Xã Tây Ninh Hòa'),
(22558, 56, N'Xã Hòa Trí'),
(22561, 56, N'Phường Đông Ninh Hòa'),
(22576, 56, N'Xã Tân Định'),
(22591, 56, N'Phường Hòa Thắng'),
(22597, 56, N'Xã Nam Ninh Hòa'),
(22609, 56, N'Xã Khánh Vĩnh'),
(22612, 56, N'Xã Trung Khánh Vĩnh'),
(22615, 56, N'Xã Bắc Khánh Vĩnh'),
(22624, 56, N'Xã Tây Khánh Vĩnh'),
(22648, 56, N'Xã Nam Khánh Vĩnh'),
(22651, 56, N'Xã Diên Khánh'),
(22657, 56, N'Xã Diên Điền'),
(22660, 56, N'Xã Diên Lâm'),
(22672, 56, N'Xã Diên Thọ'),
(22678, 56, N'Xã Diên Lạc'),
(22702, 56, N'Xã Suối Hiệp'),
(22708, 56, N'Xã Suối Dầu'),
(22714, 56, N'Xã Khánh Sơn'),
(22720, 56, N'Xã Tây Khánh Sơn'),
(22732, 56, N'Xã Đông Khánh Sơn'),
(22736, 56, N'Đặc khu Trường Sa'),
(22738, 56, N'Phường Đô Vinh'),
(22741, 56, N'Phường Bảo An'),
(22759, 56, N'Phường Phan Rang'),
(22780, 56, N'Phường Đông Hải'),
(22786, 56, N'Xã Bác Ái Tây'),
(22795, 56, N'Xã Bác Ái'),
(22801, 56, N'Xã Bác Ái Đông'),
(22810, 56, N'Xã Ninh Sơn'),
(22813, 56, N'Xã Lâm Sơn'),
(22822, 56, N'Xã Mỹ Sơn'),
(22828, 56, N'Xã Anh Dũng'),
(22834, 56, N'Phường Ninh Chử'),
(22840, 56, N'Xã Công Hải'),
(22846, 56, N'Xã Vĩnh Hải'),
(22849, 56, N'Xã Thuận Bắc'),
(22852, 56, N'Xã Ninh Hải'),
(22861, 56, N'Xã Xuân Hải'),
(22870, 56, N'Xã Ninh Phước'),
(22873, 56, N'Xã Phước Hậu'),
(22888, 56, N'Xã Phước Dinh'),
(22891, 56, N'Xã Phước Hữu'),
(22897, 56, N'Xã Thuận Nam'),
(22900, 56, N'Xã Phước Hà'),
(22909, 56, N'Xã Cà Ná'),
(22015, 66, N'Phường Tuy Hòa'),
(22045, 66, N'Phường Bình Kiến'),
(22051, 66, N'Phường Sông Cầu'),
(22057, 66, N'Xã Xuân Lộc'),
(22060, 66, N'Xã Xuân Cảnh'),
(22075, 66, N'Xã Xuân Thọ'),
(22076, 66, N'Phường Xuân Đài'),
(22081, 66, N'Xã Đồng Xuân'),
(22090, 66, N'Xã Xuân Lãnh'),
(22096, 66, N'Xã Phú Mỡ'),
(22111, 66, N'Xã Xuân Phước'),
(22114, 66, N'Xã Tuy An Bắc'),
(22120, 66, N'Xã Tuy An Đông'),
(22132, 66, N'Xã Tuy An Tây'),
(22147, 66, N'Xã Ô Loan'),
(22153, 66, N'Xã Tuy An Nam'),
(22165, 66, N'Xã Sơn Hòa'),
(22171, 66, N'Xã Tây Sơn'),
(22177, 66, N'Xã Vân Hòa'),
(22192, 66, N'Xã Suối Trai'),
(22207, 66, N'Xã Sông Hinh'),
(22222, 66, N'Xã Đức Bình'),
(22225, 66, N'Xã Ea Bá'),
(22237, 66, N'Xã Ea Ly'),
(22240, 66, N'Phường Phú Yên'),
(22250, 66, N'Xã Sơn Thành'),
(22255, 66, N'Xã Tây Hòa'),
(22258, 66, N'Phường Đông Hòa'),
(22261, 66, N'Phường Hòa Hiệp'),
(22276, 66, N'Xã Hòa Thịnh'),
(22285, 66, N'Xã Hòa Mỹ'),
(22291, 66, N'Xã Hòa Xuân'),
(22303, 66, N'Xã Phú Hòa 2'),
(22319, 66, N'Xã Phú Hòa 1'),
(24121, 66, N'Phường Tân Lập'),
(24133, 66, N'Phường Buôn Ma Thuột'),
(24154, 66, N'Phường Thành Nhất'),
(24163, 66, N'Phường Tân An'),
(24169, 66, N'Phường Ea Kao'),
(24175, 66, N'Xã Hòa Phú'),
(24181, 66, N'Xã Ea Drăng'),
(24184, 66, N'Xã Ea H’Leo'),
(24187, 66, N'Xã Ea Hiao'),
(24193, 66, N'Xã Ea Wy'),
(24208, 66, N'Xã Ea Khăl'),
(24211, 66, N'Xã Ea Súp'),
(24214, 66, N'Xã Ia Lốp'),
(24217, 66, N'Xã Ea Rốk'),
(24221, 66, N'Xã Ia Rvê'),
(24229, 66, N'Xã Ea Bung'),
(24235, 66, N'Xã Buôn Đôn'),
(24241, 66, N'Xã Ea Wer'),
(24250, 66, N'Xã Ea Nuôl'),
(24259, 66, N'Xã Quảng Phú'),
(24265, 66, N'Xã Ea Kiết'),
(24277, 66, N'Xã Ea Tul'),
(24280, 66, N'Xã Cư M’gar'),
(24286, 66, N'Xã Ea M’Droh'),
(24301, 66, N'Xã Cuôr Đăng'),
(24305, 66, N'Phường Buôn Hồ'),
(24310, 66, N'Xã Krông Búk'),
(24313, 66, N'Xã Cư Pơng'),
(24316, 66, N'Xã Pơng Drang'),
(24328, 66, N'Xã Ea Drông'),
(24340, 66, N'Phường Cư Bao'),
(24343, 66, N'Xã Krông Năng'),
(24346, 66, N'Xã Dliê Ya'),
(24352, 66, N'Xã Tam Giang'),
(24364, 66, N'Xã Phú Xuân'),
(24373, 66, N'Xã Ea Kar'),
(24376, 66, N'Xã Ea Knốp'),
(24400, 66, N'Xã Ea Păl'),
(24403, 66, N'Xã Ea Ô'),
(24406, 66, N'Xã Cư Yang'),
(24412, 66, N'Xã M’Drắk'),
(24415, 66, N'Xã Cư Prao'),
(24433, 66, N'Xã Ea Riêng'),
(24436, 66, N'Xã Cư M’ta'),
(24444, 66, N'Xã Krông Á'),
(24445, 66, N'Xã Ea Trang'),
(24448, 66, N'Xã Krông Bông'),
(24454, 66, N'Xã Dang Kang'),
(24472, 66, N'Xã Hòa Sơn'),
(24478, 66, N'Xã Cư Pui'),
(24484, 66, N'Xã Yang Mao'),
(24490, 66, N'Xã Krông Pắc'),
(24496, 66, N'Xã Ea Kly'),
(24502, 66, N'Xã Ea Phê'),
(24505, 66, N'Xã Ea Knuếc'),
(24526, 66, N'Xã Tân Tiến'),
(24529, 66, N'Xã Vụ Bổn'),
(24538, 66, N'Xã Krông Ana'),
(24540, 66, N'Xã Ea Ning'),
(24544, 66, N'Xã Ea Ktur'),
(24559, 66, N'Xã Ea Na'),
(24561, 66, N'Xã Dray Bhăng'),
(24568, 66, N'Xã Dur Kmăl'),
(24580, 66, N'Xã Liên Sơn Lắk'),
(24595, 66, N'Xã Đắk Liêng'),
(24598, 66, N'Xã Đắk Phơi'),
(24604, 66, N'Xã Krông Nô'),
(24607, 66, N'Xã Nam Ka'),
(22918, 68, N'Phường Mũi Né'),
(22924, 68, N'Phường Phú Thuỷ'),
(22933, 68, N'Phường Hàm Thắng'),
(22945, 68, N'Phường Phan Thiết'),
(22954, 68, N'Phường Tiến Thành'),
(22960, 68, N'Phường Bình Thuận'),
(22963, 68, N'Xã Tuyên Quang'),
(22969, 68, N'Xã Liên Hương'),
(22972, 68, N'Xã Phan Rí Cửa'),
(22978, 68, N'Xã Tuy Phong'),
(22981, 68, N'Xã Vĩnh Hảo'),
(23005, 68, N'Xã Bắc Bình'),
(23008, 68, N'Xã Phan Sơn'),
(23020, 68, N'Xã Hải Ninh'),
(23023, 68, N'Xã Sông Lũy'),
(23032, 68, N'Xã Lương Sơn'),
(23041, 68, N'Xã Hồng Thái'),
(23053, 68, N'Xã Hòa Thắng'),
(23059, 68, N'Xã Hàm Thuận'),
(23065, 68, N'Xã La Dạ'),
(23074, 68, N'Xã Đông Giang'),
(23086, 68, N'Xã Hồng Sơn'),
(23089, 68, N'Xã Hàm Thuận Bắc'),
(23095, 68, N'Xã Hàm Liêm'),
(23110, 68, N'Xã Hàm Thuận Nam'),
(23122, 68, N'Xã Hàm Thạnh'),
(23128, 68, N'Xã Hàm Kiệm'),
(23134, 68, N'Xã Tân Lập'),
(23143, 68, N'Xã Tân Thành'),
(23149, 68, N'Xã Tánh Linh'),
(23152, 68, N'Xã Bắc Ruộng'),
(23158, 68, N'Xã Nghị Đức'),
(23173, 68, N'Xã Đồng Kho'),
(23188, 68, N'Xã Suối Kiết'),
(23191, 68, N'Xã Đức Linh'),
(23194, 68, N'Xã Hoài Đức'),
(23200, 68, N'Xã Nam Thành'),
(23227, 68, N'Xã Trà Tân'),
(23230, 68, N'Xã Tân Minh'),
(23231, 68, N'Phường Phước Hội'),
(23235, 68, N'Phường La Gi'),
(23236, 68, N'Xã Hàm Tân'),
(23246, 68, N'Xã Tân Hải'),
(23266, 68, N'Xã Sơn Mỹ'),
(23272, 68, N'Đặc khu Phú Quý'),
(24611, 68, N'Phường Bắc Gia Nghĩa'),
(24615, 68, N'Phường Nam Gia Nghĩa'),
(24616, 68, N'Xã Quảng Sơn'),
(24617, 68, N'Phường Đông Gia Nghĩa'),
(24620, 68, N'Xã Quảng Hòa'),
(24631, 68, N'Xã Quảng Khê'),
(24637, 68, N'Xã Tà Đùng'),
(24640, 68, N'Xã Cư Jút'),
(24646, 68, N'Xã Đắk Wil'),
(24649, 68, N'Xã Nam Dong'),
(24664, 68, N'Xã Đức Lập'),
(24670, 68, N'Xã Đắk Mil'),
(24678, 68, N'Xã Đắk Sắk'),
(24682, 68, N'Xã Thuận An'),
(24688, 68, N'Xã Krông Nô'),
(24697, 68, N'Xã Nam Đà'),
(24703, 68, N'Xã Nâm Nung'),
(24712, 68, N'Xã Quảng Phú'),
(24717, 68, N'Xã Đức An'),
(24718, 68, N'Xã Đắk Song'),
(24722, 68, N'Xã Thuận Hạnh'),
(24730, 68, N'Xã Trường Xuân'),
(24733, 68, N'Xã Kiến Đức'),
(24736, 68, N'Xã Quảng Trực'),
(24739, 68, N'Xã Tuy Đức'),
(24748, 68, N'Xã Quảng Tân'),
(24751, 68, N'Xã Nhân Cơ'),
(24760, 68, N'Xã Quảng Tín'),
(24778, 68, N'Phường Lâm Viên - Đà Lạt'),
(24781, 68, N'Phường Xuân Hương - Đà Lạt'),
(24787, 68, N'Phường Cam Ly - Đà Lạt'),
(24805, 68, N'Phường Xuân Trường - Đà Lạt'),
(24820, 68, N'Phường 2 Bảo Lộc'),
(24823, 68, N'Phường 1 Bảo Lộc'),
(24829, 68, N'Phường B’Lao'),
(24841, 68, N'Phường 3 Bảo Lộc'),
(24846, 68, N'Phường Lang Biang - Đà Lạt'),
(24848, 68, N'Xã Lạc Dương'),
(24853, 68, N'Xã Đam Rông 4'),
(24868, 68, N'Xã Nam Ban Lâm Hà'),
(24871, 68, N'Xã Đinh Văn Lâm Hà'),
(24875, 68, N'Xã Đam Rông 3'),
(24877, 68, N'Xã Đam Rông 2'),
(24883, 68, N'Xã Nam Hà Lâm Hà'),
(24886, 68, N'Xã Đam Rông 1'),
(24895, 68, N'Xã Phú Sơn Lâm Hà'),
(24907, 68, N'Xã Phúc Thọ Lâm Hà'),
(24916, 68, N'Xã Tân Hà Lâm Hà'),
(24931, 68, N'Xã Đơn Dương'),
(24934, 68, N'Xã D’Ran'),
(24943, 68, N'Xã Ka Đô'),
(24955, 68, N'Xã Quảng Lập'),
(24958, 68, N'Xã Đức Trọng'),
(24967, 68, N'Xã Hiệp Thạnh'),
(24976, 68, N'Xã Tân Hội'),
(24985, 68, N'Xã Ninh Gia'),
(24988, 68, N'Xã Tà Năng'),
(24991, 68, N'Xã Tà Hine'),
(25000, 68, N'Xã Di Linh'),
(25007, 68, N'Xã Đinh Trang Thượng'),
(25015, 68, N'Xã Gia Hiệp'),
(25018, 68, N'Xã Bảo Thuận'),
(25036, 68, N'Xã Hòa Ninh'),
(25042, 68, N'Xã Hòa Bắc'),
(25051, 68, N'Xã Sơn Điền'),
(25054, 68, N'Xã Bảo Lâm 1'),
(25057, 68, N'Xã Bảo Lâm 5'),
(25063, 68, N'Xã Bảo Lâm 4'),
(25084, 68, N'Xã Bảo Lâm 2'),
(25093, 68, N'Xã Bảo Lâm 3'),
(25099, 68, N'Xã Đạ Huoai'),
(25105, 68, N'Xã Đạ Huoai 2'),
(25114, 68, N'Xã Đạ Huoai 3'),
(25126, 68, N'Xã Đạ Tẻh'),
(25135, 68, N'Xã Đạ Tẻh 3'),
(25138, 68, N'Xã Đạ Tẻh 2'),
(25159, 68, N'Xã Cát Tiên'),
(25162, 68, N'Xã Cát Tiên 3'),
(25180, 68, N'Xã Cát Tiên 2'),
(25195, 75, N'Phường Bình Phước'),
(25210, 75, N'Phường Đồng Xoài'),
(25217, 75, N'Phường Phước Long'),
(25220, 75, N'Phường Phước Bình'),
(25222, 75, N'Xã Bù Gia Mập'),
(25225, 75, N'Xã Đăk Ơ'),
(25231, 75, N'Xã Đa Kia'),
(25246, 75, N'Xã Bình Tân'),
(25252, 75, N'Xã Phú Riềng'),
(25255, 75, N'Xã Long Hà'),
(25261, 75, N'Xã Phú Trung'),
(25267, 75, N'Xã Phú Nghĩa'),
(25270, 75, N'Xã Lộc Ninh'),
(25279, 75, N'Xã Lộc Tấn'),
(25280, 75, N'Xã Lộc Thạnh'),
(25292, 75, N'Xã Lộc Quang'),
(25294, 75, N'Xã Lộc Thành'),
(25303, 75, N'Xã Lộc Hưng'),
(25308, 75, N'Xã Thiện Hưng'),
(25309, 75, N'Xã Hưng Phước'),
(25318, 75, N'Xã Tân Tiến'),
(25326, 75, N'Phường Bình Long'),
(25333, 75, N'Phường An Lộc'),
(25345, 75, N'Xã Tân Hưng'),
(25349, 75, N'Xã Minh Đức'),
(25351, 75, N'Xã Tân Quan'),
(25357, 75, N'Xã Tân Khai'),
(25363, 75, N'Xã Đồng Phú'),
(25378, 75, N'Xã Tân Lợi'),
(25387, 75, N'Xã Thuận Lợi'),
(25390, 75, N'Xã Đồng Tâm'),
(25396, 75, N'Xã Bù Đăng'),
(25399, 75, N'Xã Đak Nhau');
GO
INSERT INTO WEB_PHUONG_XA (MaPhuongXa, MaTinhThanh, TenPhuongXa) VALUES
(25402, 75, N'Xã Thọ Sơn'),
(25405, 75, N'Xã Bom Bo'),
(25417, 75, N'Xã Nghĩa Trung'),
(25420, 75, N'Xã Phước Sơn'),
(25432, 75, N'Phường Chơn Thành'),
(25441, 75, N'Phường Minh Hưng'),
(25450, 75, N'Xã Nha Bích'),
(25993, 75, N'Phường Trảng Dài'),
(26005, 75, N'Phường Hố Nai'),
(26017, 75, N'Phường Tam Hiệp'),
(26020, 75, N'Phường Long Bình'),
(26041, 75, N'Phường Trấn Biên'),
(26068, 75, N'Phường Biên Hòa'),
(26080, 75, N'Phường Long Khánh'),
(26089, 75, N'Phường Bình Lộc'),
(26098, 75, N'Phường Bảo Vinh'),
(26104, 75, N'Phường Xuân Lập'),
(26113, 75, N'Phường Hàng Gòn'),
(26116, 75, N'Xã Tân Phú'),
(26119, 75, N'Xã Đak Lua'),
(26122, 75, N'Xã Nam Cát Tiên'),
(26134, 75, N'Xã Tà Lài'),
(26158, 75, N'Xã Phú Lâm'),
(26170, 75, N'Xã Trị An'),
(26173, 75, N'Xã Phú Lý'),
(26179, 75, N'Xã Tân An'),
(26188, 75, N'Phường Tân Triều'),
(26206, 75, N'Xã Định Quán'),
(26209, 75, N'Xã Thanh Sơn'),
(26215, 75, N'Xã Phú Vinh'),
(26221, 75, N'Xã Phú Hòa'),
(26227, 75, N'Xã La Ngà'),
(26248, 75, N'Xã Trảng Bom'),
(26254, 75, N'Xã Bàu Hàm'),
(26278, 75, N'Xã Bình Minh'),
(26281, 75, N'Xã Hưng Thịnh'),
(26296, 75, N'Xã An Viễn'),
(26299, 75, N'Xã Thống Nhất'),
(26311, 75, N'Xã Gia Kiệm'),
(26326, 75, N'Xã Dầu Giây'),
(26332, 75, N'Xã Xuân Quế'),
(26341, 75, N'Xã Cẩm Mỹ'),
(26347, 75, N'Xã Xuân Đường'),
(26359, 75, N'Xã Xuân Đông'),
(26362, 75, N'Xã Sông Ray'),
(26368, 75, N'Xã Long Thành'),
(26374, 75, N'Phường Tam Phước'),
(26377, 75, N'Phường Phước Tân'),
(26380, 75, N'Phường Long Hưng'),
(26383, 75, N'Xã An Phước'),
(26389, 75, N'Xã Bình An'),
(26413, 75, N'Xã Long Phước'),
(26422, 75, N'Xã Phước Thái'),
(26425, 75, N'Xã Xuân Lộc'),
(26428, 75, N'Xã Xuân Bắc'),
(26434, 75, N'Xã Xuân Thành'),
(26446, 75, N'Xã Xuân Hòa'),
(26458, 75, N'Xã Xuân Phú'),
(26461, 75, N'Xã Xuân Định'),
(26485, 75, N'Xã Nhơn Trạch'),
(26491, 75, N'Xã Đại Phước'),
(26503, 75, N'Xã Phước An'),
(25747, 79, N'Phường Thủ Dầu Một'),
(25750, 79, N'Phường Phú Lợi'),
(25760, 79, N'Phường Bình Dương'),
(25768, 79, N'Phường Phú An'),
(25771, 79, N'Phường Chánh Hiệp'),
(25777, 79, N'Xã Dầu Tiếng'),
(25780, 79, N'Xã Minh Thạnh'),
(25792, 79, N'Xã Long Hòa'),
(25807, 79, N'Xã Thanh An'),
(25813, 79, N'Phường Bến Cát'),
(25819, 79, N'Xã Trừ Văn Thố'),
(25822, 79, N'Xã Bàu Bàng'),
(25837, 79, N'Phường Chánh Phú Hòa'),
(25840, 79, N'Phường Long Nguyên'),
(25843, 79, N'Phường Tây Nam'),
(25846, 79, N'Phường Thới Hòa'),
(25849, 79, N'Phường Hòa Lợi'),
(25858, 79, N'Xã Phú Giáo'),
(25864, 79, N'Xã Phước Thành'),
(25867, 79, N'Xã An Long'),
(25882, 79, N'Xã Phước Hòa'),
(25888, 79, N'Phường Tân Uyên'),
(25891, 79, N'Phường Tân Khánh'),
(25906, 79, N'Xã Bắc Tân Uyên'),
(25909, 79, N'Xã Thường Tân'),
(25912, 79, N'Phường Vĩnh Tân'),
(25915, 79, N'Phường Bình Cơ'),
(25920, 79, N'Phường Tân Hiệp'),
(25942, 79, N'Phường Dĩ An'),
(25945, 79, N'Phường Tân Đông Hiệp'),
(25951, 79, N'Phường Đông Hòa'),
(25966, 79, N'Phường Lái Thiêu'),
(25969, 79, N'Phường Thuận Giao'),
(25975, 79, N'Phường An Phú'),
(25978, 79, N'Phường Thuận An'),
(25987, 79, N'Phường Bình Hòa'),
(26506, 79, N'Phường Vũng Tàu'),
(26526, 79, N'Phường Tam Thắng'),
(26536, 79, N'Phường Rạch Dừa'),
(26542, 79, N'Phường Phước Thắng'),
(26545, 79, N'Xã Long Sơn'),
(26560, 79, N'Phường Bà Rịa'),
(26566, 79, N'Phường Long Hương'),
(26572, 79, N'Phường Tam Long'),
(26575, 79, N'Xã Ngãi Giao'),
(26584, 79, N'Xã Xuân Sơn'),
(26590, 79, N'Xã Bình Giã'),
(26596, 79, N'Xã Châu Đức'),
(26608, 79, N'Xã Kim Long'),
(26617, 79, N'Xã Nghĩa Thành'),
(26620, 79, N'Xã Hồ Tràm'),
(26632, 79, N'Xã Xuyên Mộc'),
(26638, 79, N'Xã Bàu Lâm'),
(26641, 79, N'Xã Hòa Hội'),
(26647, 79, N'Xã Hòa Hiệp'),
(26656, 79, N'Xã Bình Châu'),
(26659, 79, N'Xã Long Điền'),
(26662, 79, N'Xã Long Hải'),
(26680, 79, N'Xã Đất Đỏ'),
(26686, 79, N'Xã Phước Hải'),
(26704, 79, N'Phường Phú Mỹ'),
(26710, 79, N'Phường Tân Hải'),
(26713, 79, N'Phường Tân Phước'),
(26725, 79, N'Phường Tân Thành'),
(26728, 79, N'Xã Châu Pha'),
(26732, 79, N'Đặc khu Côn Đảo'),
(26737, 79, N'Phường Tân Định'),
(26740, 79, N'Phường Sài Gòn'),
(26743, 79, N'Phường Bến Thành'),
(26758, 79, N'Phường Cầu Ông Lãnh'),
(26767, 79, N'Phường An Phú Đông'),
(26773, 79, N'Phường Thới An'),
(26782, 79, N'Phường Tân Thới Hiệp'),
(26785, 79, N'Phường Trung Mỹ Tây'),
(26791, 79, N'Phường Đông Hưng Thuận'),
(26800, 79, N'Phường Linh Xuân'),
(26803, 79, N'Phường Tam Bình'),
(26809, 79, N'Phường Hiệp Bình'),
(26824, 79, N'Phường Thủ Đức'),
(26833, 79, N'Phường Long Bình'),
(26842, 79, N'Phường Tăng Nhơn Phú'),
(26848, 79, N'Phường Phước Long'),
(26857, 79, N'Phường Long Phước'),
(26860, 79, N'Phường Long Trường'),
(26876, 79, N'Phường An Nhơn'),
(26878, 79, N'Phường An Hội Đông'),
(26882, 79, N'Phường An Hội Tây'),
(26884, 79, N'Phường Gò Vấp'),
(26890, 79, N'Phường Hạnh Thông'),
(26898, 79, N'Phường Thông Tây Hội'),
(26905, 79, N'Phường Bình Lợi Trung'),
(26911, 79, N'Phường Bình Quới'),
(26929, 79, N'Phường Bình Thạnh'),
(26944, 79, N'Phường Gia Định'),
(26956, 79, N'Phường Thạnh Mỹ Tây'),
(26968, 79, N'Phường Tân Sơn Nhất'),
(26977, 79, N'Phường Tân Sơn Hòa'),
(26983, 79, N'Phường Bảy Hiền'),
(26995, 79, N'Phường Tân Hòa'),
(27004, 79, N'Phường Tân Bình'),
(27007, 79, N'Phường Tân Sơn'),
(27013, 79, N'Phường Tây Thạnh'),
(27019, 79, N'Phường Tân Sơn Nhì'),
(27022, 79, N'Phường Phú Thọ Hòa'),
(27028, 79, N'Phường Phú Thạnh'),
(27031, 79, N'Phường Tân Phú'),
(27043, 79, N'Phường Đức Nhuận'),
(27058, 79, N'Phường Cầu Kiệu'),
(27073, 79, N'Phường Phú Nhuận'),
(27094, 79, N'Phường An Khánh'),
(27097, 79, N'Phường Bình Trưng'),
(27112, 79, N'Phường Cát Lái'),
(27139, 79, N'Phường Xuân Hòa'),
(27142, 79, N'Phường Nhiêu Lộc'),
(27154, 79, N'Phường Bàn Cờ'),
(27163, 79, N'Phường Hòa Hưng'),
(27169, 79, N'Phường Diên Hồng'),
(27190, 79, N'Phường Vườn Lài'),
(27211, 79, N'Phường Hòa Bình'),
(27226, 79, N'Phường Phú Thọ'),
(27232, 79, N'Phường Bình Thới'),
(27238, 79, N'Phường Minh Phụng'),
(27259, 79, N'Phường Xóm Chiếu'),
(27265, 79, N'Phường Khánh Hội'),
(27286, 79, N'Phường Vĩnh Hội'),
(27301, 79, N'Phường Chợ Quán'),
(27316, 79, N'Phường An Đông'),
(27343, 79, N'Phường Chợ Lớn'),
(27349, 79, N'Phường Phú Lâm'),
(27364, 79, N'Phường Bình Phú'),
(27367, 79, N'Phường Bình Tây'),
(27373, 79, N'Phường Bình Tiên'),
(27418, 79, N'Phường Chánh Hưng'),
(27424, 79, N'Phường Bình Đông'),
(27427, 79, N'Phường Phú Định'),
(27439, 79, N'Phường Bình Hưng Hòa'),
(27442, 79, N'Phường Bình Tân'),
(27448, 79, N'Phường Bình Trị Đông'),
(27457, 79, N'Phường Tân Tạo'),
(27460, 79, N'Phường An Lạc'),
(27475, 79, N'Phường Tân Hưng'),
(27478, 79, N'Phường Tân Thuận'),
(27484, 79, N'Phường Phú Thuận'),
(27487, 79, N'Phường Tân Mỹ'),
(27496, 79, N'Xã Tân An Hội'),
(27508, 79, N'Xã An Nhơn Tây'),
(27511, 79, N'Xã Nhuận Đức'),
(27526, 79, N'Xã Thái Mỹ'),
(27541, 79, N'Xã Phú Hòa Đông'),
(27544, 79, N'Xã Bình Mỹ'),
(27553, 79, N'Xã Củ Chi'),
(27559, 79, N'Xã Hóc Môn'),
(27568, 79, N'Xã Đông Thạnh'),
(27577, 79, N'Xã Xuân Thới Sơn'),
(27592, 79, N'Xã Bà Điểm'),
(27595, 79, N'Xã Tân Nhựt'),
(27601, 79, N'Xã Vĩnh Lộc'),
(27604, 79, N'Xã Tân Vĩnh Lộc'),
(27610, 79, N'Xã Bình Lợi'),
(27619, 79, N'Xã Bình Hưng'),
(27628, 79, N'Xã Hưng Long'),
(27637, 79, N'Xã Bình Chánh'),
(27655, 79, N'Xã Nhà Bè'),
(27658, 79, N'Xã Hiệp Phước'),
(27664, 79, N'Xã Cần Giờ'),
(27667, 79, N'Xã Bình Khánh'),
(27673, 79, N'Xã An Thới Đông'),
(27676, 79, N'Xã Thạnh An'),
(25459, 80, N'Phường Tân Ninh'),
(25480, 80, N'Phường Bình Minh'),
(25486, 80, N'Xã Tân Biên'),
(25489, 80, N'Xã Tân Lập'),
(25498, 80, N'Xã Thạnh Bình'),
(25510, 80, N'Xã Trà Vong'),
(25516, 80, N'Xã Tân Châu'),
(25522, 80, N'Xã Tân Đông'),
(25525, 80, N'Xã Tân Hội'),
(25531, 80, N'Xã Tân Hòa'),
(25534, 80, N'Xã Tân Thành'),
(25549, 80, N'Xã Tân Phú'),
(25552, 80, N'Xã Dương Minh Châu'),
(25567, 80, N'Phường Ninh Thạnh'),
(25573, 80, N'Xã Cầu Khởi'),
(25579, 80, N'Xã Lộc Ninh'),
(25585, 80, N'Xã Châu Thành'),
(25588, 80, N'Xã Hảo Đước'),
(25591, 80, N'Xã Phước Vinh'),
(25606, 80, N'Xã Hòa Hội'),
(25621, 80, N'Xã Ninh Điền'),
(25630, 80, N'Phường Long Hoa'),
(25633, 80, N'Phường Thanh Điền'),
(25645, 80, N'Phường Hòa Thành'),
(25654, 80, N'Phường Gò Dầu'),
(25657, 80, N'Xã Thạnh Đức'),
(25663, 80, N'Xã Phước Thạnh'),
(25666, 80, N'Xã Truông Mít'),
(25672, 80, N'Phường Gia Lộc'),
(25681, 80, N'Xã Bến Cầu'),
(25684, 80, N'Xã Long Chữ'),
(25702, 80, N'Xã Long Thuận'),
(25708, 80, N'Phường Trảng Bàng'),
(25711, 80, N'Xã Hưng Thuận'),
(25729, 80, N'Xã Phước Chỉ'),
(25732, 80, N'Phường An Tịnh'),
(27694, 80, N'Phường Long An'),
(27712, 80, N'Phường Tân An'),
(27715, 80, N'Phường Khánh Hậu'),
(27721, 80, N'Xã Tân Hưng'),
(27727, 80, N'Xã Hưng Điền'),
(27736, 80, N'Xã Vĩnh Thạnh'),
(27748, 80, N'Xã Vĩnh Châu'),
(27757, 80, N'Xã Vĩnh Hưng'),
(27763, 80, N'Xã Khánh Hưng'),
(27775, 80, N'Xã Tuyên Bình'),
(27787, 80, N'Phường Kiến Tường'),
(27793, 80, N'Xã Bình Hiệp'),
(27811, 80, N'Xã Bình Hòa'),
(27817, 80, N'Xã Tuyên Thạnh'),
(27823, 80, N'Xã Mộc Hóa'),
(27826, 80, N'Xã Tân Thạnh'),
(27838, 80, N'Xã Nhơn Hòa Lập'),
(27841, 80, N'Xã Hậu Thạnh'),
(27856, 80, N'Xã Nhơn Ninh'),
(27865, 80, N'Xã Thạnh Hóa'),
(27868, 80, N'Xã Bình Thành'),
(27877, 80, N'Xã Thạnh Phước'),
(27889, 80, N'Xã Tân Tây'),
(27898, 80, N'Xã Đông Thành'),
(27907, 80, N'Xã Mỹ Quý'),
(27925, 80, N'Xã Đức Huệ'),
(27931, 80, N'Xã Hậu Nghĩa'),
(27937, 80, N'Xã Đức Hòa'),
(27943, 80, N'Xã An Ninh'),
(27952, 80, N'Xã Hiệp Hòa'),
(27964, 80, N'Xã Đức Lập'),
(27976, 80, N'Xã Mỹ Hạnh'),
(27979, 80, N'Xã Hòa Khánh'),
(27991, 80, N'Xã Bến Lức'),
(27994, 80, N'Xã Thạnh Lợi'),
(28003, 80, N'Xã Lương Hòa'),
(28015, 80, N'Xã Bình Đức'),
(28018, 80, N'Xã Mỹ Yên'),
(28036, 80, N'Xã Thủ Thừa'),
(28051, 80, N'Xã Mỹ Thạnh'),
(28066, 80, N'Xã Mỹ An'),
(28072, 80, N'Xã Tân Long'),
(28075, 80, N'Xã Tân Trụ'),
(28087, 80, N'Xã Nhựt Tảo'),
(28093, 80, N'Xã Vàm Cỏ'),
(28108, 80, N'Xã Cần Đước'),
(28114, 80, N'Xã Rạch Kiến'),
(28126, 80, N'Xã Long Cang'),
(28132, 80, N'Xã Mỹ Lệ'),
(28138, 80, N'Xã Tân Lân'),
(28144, 80, N'Xã Long Hựu'),
(28159, 80, N'Xã Cần Giuộc'),
(28165, 80, N'Xã Phước Lý'),
(28177, 80, N'Xã Mỹ Lộc'),
(28201, 80, N'Xã Phước Vĩnh Tây'),
(28207, 80, N'Xã Tân Tập'),
(28210, 80, N'Xã Tầm Vu'),
(28222, 80, N'Xã Vĩnh Công'),
(28225, 80, N'Xã Thuận Mỹ'),
(28243, 80, N'Xã An Lục Long'),
(28249, 82, N'Phường Đạo Thạnh'),
(28261, 82, N'Phường Mỹ Tho'),
(28270, 82, N'Phường Thới Sơn'),
(28273, 82, N'Phường Mỹ Phong'),
(28285, 82, N'Phường Trung An'),
(28297, 82, N'Phường Long Thuận'),
(28306, 82, N'Phường Gò Công'),
(28315, 82, N'Phường Bình Xuân'),
(28321, 82, N'Xã Tân Phước 1'),
(28327, 82, N'Xã Tân Phước 2'),
(28336, 82, N'Xã Hưng Thạnh'),
(28345, 82, N'Xã Tân Phước 3'),
(28360, 82, N'Xã Cái Bè'),
(28366, 82, N'Xã Hậu Mỹ'),
(28378, 82, N'Xã Mỹ Thiện'),
(28393, 82, N'Xã Hội Cư'),
(28405, 82, N'Xã Mỹ Đức Tây'),
(28414, 82, N'Xã Mỹ Lợi'),
(28426, 82, N'Xã Thanh Hưng'),
(28429, 82, N'Xã An Hữu'),
(28435, 82, N'Phường Mỹ Phước Tây'),
(28436, 82, N'Phường Thanh Hòa'),
(28439, 82, N'Phường Cai Lậy'),
(28444, 82, N'Xã Thạnh Phú'),
(28456, 82, N'Xã Mỹ Thành'),
(28468, 82, N'Xã Tân Phú'),
(28471, 82, N'Xã Bình Phú'),
(28477, 82, N'Phường Nhị Quý'),
(28501, 82, N'Xã Hiệp Đức'),
(28504, 82, N'Xã Long Tiên'),
(28516, 82, N'Xã Ngũ Hiệp'),
(28519, 82, N'Xã Châu Thành'),
(28525, 82, N'Xã Tân Hương'),
(28537, 82, N'Xã Long Hưng'),
(28543, 82, N'Xã Long Định'),
(28564, 82, N'Xã Bình Trưng'),
(28576, 82, N'Xã Vĩnh Kim'),
(28582, 82, N'Xã Kim Sơn'),
(28594, 82, N'Xã Chợ Gạo'),
(28603, 82, N'Xã Mỹ Tịnh An'),
(28615, 82, N'Xã Lương Hòa Lạc'),
(28627, 82, N'Xã Tân Thuận Bình'),
(28633, 82, N'Xã An Thạnh Thủy'),
(28648, 82, N'Xã Bình Ninh'),
(28651, 82, N'Xã Vĩnh Bình'),
(28660, 82, N'Xã Đồng Sơn'),
(28663, 82, N'Xã Phú Thành'),
(28678, 82, N'Xã Vĩnh Hựu'),
(28687, 82, N'Xã Long Bình'),
(28693, 82, N'Xã Tân Thới'),
(28696, 82, N'Xã Tân Phú Đông'),
(28702, 82, N'Xã Tân Hòa'),
(28720, 82, N'Xã Gia Thuận'),
(28723, 82, N'Xã Tân Đông'),
(28729, 82, N'Phường Sơn Qui'),
(28738, 82, N'Xã Tân Điền'),
(28747, 82, N'Xã Gò Công Đông'),
(29869, 82, N'Phường Cao Lãnh'),
(29884, 82, N'Phường Mỹ Ngãi'),
(29888, 82, N'Phường Mỹ Trà'),
(29905, 82, N'Phường Sa Đéc'),
(29926, 82, N'Xã Tân Hồng'),
(29929, 82, N'Xã Tân Hộ Cơ'),
(29938, 82, N'Xã Tân Thành'),
(29944, 82, N'Xã An Phước'),
(29954, 82, N'Phường An Bình'),
(29955, 82, N'Phường Hồng Ngự'),
(29971, 82, N'Xã Thường Phước'),
(29978, 82, N'Phường Thường Lạc'),
(29983, 82, N'Xã Long Khánh'),
(29992, 82, N'Xã Long Phú Thuận'),
(30001, 82, N'Xã Tràm Chim'),
(30010, 82, N'Xã Tam Nông'),
(30019, 82, N'Xã An Hòa'),
(30025, 82, N'Xã Phú Cường'),
(30028, 82, N'Xã An Long'),
(30034, 82, N'Xã Phú Thọ'),
(30037, 82, N'Xã Tháp Mười'),
(30043, 82, N'Xã Phương Thịnh'),
(30046, 82, N'Xã Trường Xuân'),
(30055, 82, N'Xã Mỹ Quí'),
(30061, 82, N'Xã Đốc Binh Kiều'),
(30073, 82, N'Xã Thanh Mỹ'),
(30076, 82, N'Xã Mỹ Thọ'),
(30085, 82, N'Xã Ba Sao'),
(30088, 82, N'Xã Phong Mỹ'),
(30112, 82, N'Xã Mỹ Hiệp'),
(30118, 82, N'Xã Bình Hàng Trung'),
(30130, 82, N'Xã Thanh Bình'),
(30154, 82, N'Xã Tân Long'),
(30157, 82, N'Xã Tân Thạnh'),
(30163, 82, N'Xã Bình Thành'),
(30169, 82, N'Xã Lấp Vò'),
(30178, 82, N'Xã Mỹ An Hưng'),
(30184, 82, N'Xã Tân Khánh Trung'),
(30208, 82, N'Xã Hòa Long'),
(30214, 82, N'Xã Tân Dương'),
(30226, 82, N'Xã Lai Vung'),
(30235, 82, N'Xã Phong Hòa'),
(30244, 82, N'Xã Phú Hựu'),
(30253, 82, N'Xã Tân Nhuận Đông'),
(30259, 82, N'Xã Tân Phú Trung'),
(28756, 86, N'Phường Phú Khương'),
(28777, 86, N'Phường An Hội'),
(28783, 86, N'Phường Sơn Đông'),
(28789, 86, N'Phường Bến Tre'),
(28807, 86, N'Xã Giao Long'),
(28810, 86, N'Xã Phú Túc'),
(28840, 86, N'Xã Tân Phú'),
(28858, 86, N'Phường Phú Tân'),
(28861, 86, N'Xã Tiên Thủy'),
(28870, 86, N'Xã Chợ Lách'),
(28879, 86, N'Xã Phú Phụng'),
(28894, 86, N'Xã Vĩnh Thành'),
(28901, 86, N'Xã Hưng Khánh Trung'),
(28903, 86, N'Xã Mỏ Cày'),
(28915, 86, N'Xã Phước Mỹ Trung'),
(28921, 86, N'Xã Tân Thành Bình'),
(28945, 86, N'Xã Đồng Khởi'),
(28948, 86, N'Xã Nhuận Phú Tân'),
(28957, 86, N'Xã An Định'),
(28969, 86, N'Xã Thành Thới'),
(28981, 86, N'Xã Hương Mỹ'),
(28984, 86, N'Xã Giồng Trôm'),
(28987, 86, N'Xã Lương Hòa'),
(28993, 86, N'Xã Lương Phú'),
(28996, 86, N'Xã Châu Hòa'),
(29020, 86, N'Xã Phước Long'),
(29029, 86, N'Xã Tân Hào'),
(29044, 86, N'Xã Hưng Nhượng'),
(29050, 86, N'Xã Bình Đại'),
(29062, 86, N'Xã Phú Thuận'),
(29077, 86, N'Xã Lộc Thuận'),
(29083, 86, N'Xã Châu Hưng'),
(29089, 86, N'Xã Thạnh Trị'),
(29104, 86, N'Xã Thạnh Phước'),
(29107, 86, N'Xã Thới Thuận'),
(29110, 86, N'Xã Ba Tri'),
(29122, 86, N'Xã Mỹ Chánh Hòa'),
(29125, 86, N'Xã Bảo Thạnh'),
(29137, 86, N'Xã Tân Xuân'),
(29143, 86, N'Xã An Ngãi Trung'),
(29158, 86, N'Xã An Hiệp'),
(29167, 86, N'Xã Tân Thủy'),
(29182, 86, N'Xã Thạnh Phú'),
(29191, 86, N'Xã Quới Điền'),
(29194, 86, N'Xã Đại Điền'),
(29221, 86, N'Xã Thạnh Hải'),
(29224, 86, N'Xã An Qui'),
(29227, 86, N'Xã Thạnh Phong'),
(29242, 86, N'Phường Trà Vinh'),
(29254, 86, N'Phường Nguyệt Hóa'),
(29263, 86, N'Phường Long Đức'),
(29266, 86, N'Xã Càng Long'),
(29275, 86, N'Xã An Trường'),
(29278, 86, N'Xã Tân An'),
(29287, 86, N'Xã Bình Phú'),
(29302, 86, N'Xã Nhị Long'),
(29308, 86, N'Xã Cầu Kè'),
(29317, 86, N'Xã An Phú Tân'),
(29329, 86, N'Xã Phong Thạnh'),
(29335, 86, N'Xã Tam Ngãi'),
(29341, 86, N'Xã Tiểu Cần'),
(29362, 86, N'Xã Hùng Hòa'),
(29365, 86, N'Xã Tập Ngãi'),
(29371, 86, N'Xã Tân Hòa'),
(29374, 86, N'Xã Châu Thành'),
(29386, 86, N'Xã Song Lộc'),
(29398, 86, N'Phường Hòa Thuận'),
(29407, 86, N'Xã Hưng Mỹ'),
(29410, 86, N'Xã Hòa Minh'),
(29413, 86, N'Xã Long Hòa'),
(29416, 86, N'Xã Cầu Ngang'),
(29419, 86, N'Xã Mỹ Long');
GO
INSERT INTO WEB_PHUONG_XA (MaPhuongXa, MaTinhThanh, TenPhuongXa) VALUES
(29431, 86, N'Xã Vinh Kim'),
(29446, 86, N'Xã Nhị Trường'),
(29455, 86, N'Xã Hiệp Mỹ'),
(29461, 86, N'Xã Trà Cú'),
(29467, 86, N'Xã Tập Sơn'),
(29476, 86, N'Xã Lưu Nghiệp Anh'),
(29489, 86, N'Xã Hàm Giang'),
(29491, 86, N'Xã Đại An'),
(29497, 86, N'Xã Đôn Châu'),
(29506, 86, N'Xã Long Hiệp'),
(29512, 86, N'Phường Duyên Hải'),
(29513, 86, N'Xã Long Thành'),
(29516, 86, N'Phường Trường Long Hòa'),
(29518, 86, N'Xã Long Hữu'),
(29530, 86, N'Xã Ngũ Lạc'),
(29533, 86, N'Xã Long Vĩnh'),
(29536, 86, N'Xã Đông Hải'),
(29551, 86, N'Phường Long Châu'),
(29557, 86, N'Phường Phước Hậu'),
(29566, 86, N'Phường Tân Ngãi'),
(29584, 86, N'Xã An Bình'),
(29590, 86, N'Phường Thanh Đức'),
(29593, 86, N'Phường Tân Hạnh'),
(29602, 86, N'Xã Long Hồ'),
(29611, 86, N'Xã Phú Quới'),
(29623, 86, N'Xã Nhơn Phú'),
(29638, 86, N'Xã Bình Phước'),
(29641, 86, N'Xã Cái Nhum'),
(29653, 86, N'Xã Tân Long Hội'),
(29659, 86, N'Xã Trung Thành'),
(29668, 86, N'Xã Quới An'),
(29677, 86, N'Xã Quới Thiện'),
(29683, 86, N'Xã Trung Hiệp'),
(29698, 86, N'Xã Trung Ngãi'),
(29701, 86, N'Xã Hiếu Phụng'),
(29713, 86, N'Xã Hiếu Thành'),
(29719, 86, N'Xã Tam Bình'),
(29728, 86, N'Xã Cái Ngang'),
(29734, 86, N'Xã Hòa Hiệp'),
(29740, 86, N'Xã Song Phú'),
(29767, 86, N'Xã Ngãi Tứ'),
(29770, 86, N'Phường Cái Vồn'),
(29771, 86, N'Phường Bình Minh'),
(29785, 86, N'Xã Tân Lược'),
(29788, 86, N'Xã Mỹ Thuận'),
(29800, 86, N'Xã Tân Quới'),
(29812, 86, N'Phường Đông Thành'),
(29821, 86, N'Xã Trà Ôn'),
(29830, 86, N'Xã Hòa Bình'),
(29836, 86, N'Xã Trà Côn'),
(29845, 86, N'Xã Vĩnh Xuân'),
(29857, 86, N'Xã Lục Sĩ Thành'),
(30292, 91, N'Phường Bình Đức'),
(30301, 91, N'Phường Mỹ Thới'),
(30307, 91, N'Phường Long Xuyên'),
(30313, 91, N'Xã Mỹ Hòa Hưng'),
(30316, 91, N'Phường Châu Đốc'),
(30325, 91, N'Phường Vĩnh Tế'),
(30337, 91, N'Xã An Phú'),
(30341, 91, N'Xã Khánh Bình'),
(30346, 91, N'Xã Nhơn Hội'),
(30352, 91, N'Xã Phú Hữu'),
(30367, 91, N'Xã Vĩnh Hậu'),
(30376, 91, N'Phường Tân Châu'),
(30377, 91, N'Phường Long Phú'),
(30385, 91, N'Xã Vĩnh Xương'),
(30388, 91, N'Xã Tân An'),
(30403, 91, N'Xã Châu Phong'),
(30406, 91, N'Xã Phú Tân'),
(30409, 91, N'Xã Chợ Vàm'),
(30421, 91, N'Xã Phú Lâm'),
(30430, 91, N'Xã Hòa Lạc'),
(30436, 91, N'Xã Phú An'),
(30445, 91, N'Xã Bình Thạnh Đông'),
(30463, 91, N'Xã Châu Phú'),
(30469, 91, N'Xã Mỹ Đức'),
(30478, 91, N'Xã Vĩnh Thạnh Trung'),
(30481, 91, N'Xã Thạnh Mỹ Tây'),
(30487, 91, N'Xã Bình Mỹ'),
(30502, 91, N'Phường Thới Sơn'),
(30505, 91, N'Phường Chi Lăng'),
(30520, 91, N'Phường Tịnh Biên'),
(30526, 91, N'Xã An Cư'),
(30538, 91, N'Xã Núi Cấm'),
(30544, 91, N'Xã Tri Tôn'),
(30547, 91, N'Xã Ba Chúc'),
(30568, 91, N'Xã Vĩnh Gia'),
(30577, 91, N'Xã Ô Lâm'),
(30580, 91, N'Xã Cô Tô'),
(30589, 91, N'Xã An Châu'),
(30595, 91, N'Xã Cần Đăng'),
(30604, 91, N'Xã Vĩnh An'),
(30607, 91, N'Xã Bình Hòa'),
(30619, 91, N'Xã Vĩnh Hanh'),
(30628, 91, N'Xã Chợ Mới'),
(30631, 91, N'Xã Long Điền'),
(30643, 91, N'Xã Cù Lao Giêng'),
(30658, 91, N'Xã Nhơn Mỹ'),
(30664, 91, N'Xã Long Kiến'),
(30673, 91, N'Xã Hội An'),
(30682, 91, N'Xã Thoại Sơn'),
(30685, 91, N'Xã Phú Hòa'),
(30688, 91, N'Xã Óc Eo'),
(30691, 91, N'Xã Tây Phú'),
(30697, 91, N'Xã Vĩnh Trạch'),
(30709, 91, N'Xã Định Mỹ'),
(30742, 91, N'Phường Rạch Giá'),
(30760, 91, N'Phường Vĩnh Thông'),
(30766, 91, N'Phường Tô Châu'),
(30769, 91, N'Phường Hà Tiên'),
(30781, 91, N'Xã Tiên Hải'),
(30787, 91, N'Xã Kiên Lương'),
(30790, 91, N'Xã Hòa Điền'),
(30793, 91, N'Xã Vĩnh Điều'),
(30796, 91, N'Xã Giang Thành'),
(30811, 91, N'Xã Sơn Hải'),
(30814, 91, N'Xã Hòn Nghệ'),
(30817, 91, N'Xã Hòn Đất'),
(30823, 91, N'Xã Bình Sơn'),
(30826, 91, N'Xã Bình Giang'),
(30835, 91, N'Xã Sơn Kiên'),
(30838, 91, N'Xã Mỹ Thuận'),
(30850, 91, N'Xã Tân Hiệp'),
(30856, 91, N'Xã Tân Hội'),
(30874, 91, N'Xã Thạnh Đông'),
(30880, 91, N'Xã Châu Thành'),
(30886, 91, N'Xã Thạnh Lộc'),
(30898, 91, N'Xã Bình An'),
(30904, 91, N'Xã Giồng Riềng'),
(30910, 91, N'Xã Thạnh Hưng'),
(30928, 91, N'Xã Ngọc Chúc'),
(30934, 91, N'Xã Hòa Hưng'),
(30943, 91, N'Xã Long Thạnh'),
(30949, 91, N'Xã Hòa Thuận'),
(30952, 91, N'Xã Gò Quao'),
(30958, 91, N'Xã Định Hòa'),
(30970, 91, N'Xã Vĩnh Hòa Hưng'),
(30982, 91, N'Xã Vĩnh Tuy'),
(30985, 91, N'Xã An Biên'),
(30988, 91, N'Xã Tây Yên'),
(31006, 91, N'Xã Đông Thái'),
(31012, 91, N'Xã Vĩnh Hòa'),
(31018, 91, N'Xã An Minh'),
(31024, 91, N'Xã Đông Hòa'),
(31027, 91, N'Xã U Minh Thượng'),
(31031, 91, N'Xã Tân Thạnh'),
(31036, 91, N'Xã Đông Hưng'),
(31042, 91, N'Xã Vân Khánh'),
(31051, 91, N'Xã Vĩnh Phong'),
(31064, 91, N'Xã Vĩnh Bình'),
(31069, 91, N'Xã Vĩnh Thuận'),
(31078, 91, N'Đặc khu Phú Quốc'),
(31105, 91, N'Đặc khu Thổ Châu'),
(31108, 91, N'Đặc khu Kiên Hải'),
(31120, 92, N'Phường Cái Khế'),
(31135, 92, N'Phường Ninh Kiều'),
(31147, 92, N'Phường Tân An'),
(31150, 92, N'Phường An Bình'),
(31153, 92, N'Phường Ô Môn'),
(31157, 92, N'Phường Thới Long'),
(31162, 92, N'Phường Phước Thới'),
(31168, 92, N'Phường Bình Thủy'),
(31174, 92, N'Phường Thới An Đông'),
(31183, 92, N'Phường Long Tuyền'),
(31186, 92, N'Phường Cái Răng'),
(31201, 92, N'Phường Hưng Phú'),
(31207, 92, N'Phường Thốt Nốt'),
(31213, 92, N'Phường Tân Lộc'),
(31217, 92, N'Phường Trung Nhứt'),
(31228, 92, N'Phường Thuận Hưng'),
(31231, 92, N'Xã Thạnh An'),
(31232, 92, N'Xã Vĩnh Thạnh'),
(31237, 92, N'Xã Vĩnh Trinh'),
(31246, 92, N'Xã Thạnh Quới'),
(31249, 92, N'Xã Thạnh Phú'),
(31255, 92, N'Xã Trung Hưng'),
(31258, 92, N'Xã Thới Lai'),
(31261, 92, N'Xã Cờ Đỏ'),
(31264, 92, N'Xã Thới Hưng'),
(31273, 92, N'Xã Đông Hiệp'),
(31282, 92, N'Xã Đông Thuận'),
(31288, 92, N'Xã Trường Thành'),
(31294, 92, N'Xã Trường Xuân'),
(31299, 92, N'Xã Phong Điền'),
(31309, 92, N'Xã Trường Long'),
(31315, 92, N'Xã Nhơn Ái'),
(31321, 92, N'Phường Vị Thanh'),
(31333, 92, N'Phường Vị Tân'),
(31338, 92, N'Xã Hỏa Lựu'),
(31340, 92, N'Phường Ngã Bảy'),
(31342, 92, N'Xã Tân Hòa'),
(31348, 92, N'Xã Trường Long Tây'),
(31360, 92, N'Xã Thạnh Xuân'),
(31366, 92, N'Xã Châu Thành'),
(31369, 92, N'Xã Đông Phước'),
(31378, 92, N'Xã Phú Hữu'),
(31393, 92, N'Xã Hòa An'),
(31396, 92, N'Xã Hiệp Hưng'),
(31399, 92, N'Xã Tân Bình'),
(31408, 92, N'Xã Thạnh Hòa'),
(31411, 92, N'Phường Đại Thành'),
(31420, 92, N'Xã Phụng Hiệp'),
(31426, 92, N'Xã Phương Bình'),
(31432, 92, N'Xã Tân Phước Hưng'),
(31441, 92, N'Xã Vị Thủy'),
(31453, 92, N'Xã Vĩnh Thuận Đông'),
(31459, 92, N'Xã Vĩnh Tường'),
(31465, 92, N'Xã Vị Thanh 1'),
(31471, 92, N'Phường Long Mỹ'),
(31473, 92, N'Phường Long Bình'),
(31480, 92, N'Phường Long Phú 1'),
(31489, 92, N'Xã Vĩnh Viễn'),
(31492, 92, N'Xã Lương Tâm'),
(31495, 92, N'Xã Xà Phiên'),
(31507, 92, N'Phường Sóc Trăng'),
(31510, 92, N'Phường Phú Lợi'),
(31528, 92, N'Xã Kế Sách'),
(31531, 92, N'Xã An Lạc Thôn'),
(31537, 92, N'Xã Phong Nẫm'),
(31540, 92, N'Xã Thới An Hội'),
(31552, 92, N'Xã Nhơn Mỹ'),
(31561, 92, N'Xã Đại Hải'),
(31567, 92, N'Xã Mỹ Tú'),
(31569, 92, N'Xã Phú Tâm'),
(31570, 92, N'Xã Hồ Đắc Kiện'),
(31579, 92, N'Xã Long Hưng'),
(31582, 92, N'Xã Thuận Hòa'),
(31591, 92, N'Xã Mỹ Hương'),
(31594, 92, N'Xã An Ninh'),
(31603, 92, N'Xã Mỹ Phước'),
(31615, 92, N'Xã An Thạnh'),
(31633, 92, N'Xã Cù Lao Dung'),
(31639, 92, N'Xã Long Phú'),
(31645, 92, N'Xã Đại Ngãi'),
(31654, 92, N'Xã Trường Khánh'),
(31666, 92, N'Xã Tân Thạnh'),
(31673, 92, N'Xã Trần Đề'),
(31675, 92, N'Xã Liêu Tú'),
(31679, 92, N'Xã Lịch Hội Thượng'),
(31684, 92, N'Phường Mỹ Xuyên'),
(31687, 92, N'Xã Tài Văn'),
(31699, 92, N'Xã Thạnh Thới An'),
(31708, 92, N'Xã Nhu Gia'),
(31717, 92, N'Xã Hòa Tú'),
(31723, 92, N'Xã Ngọc Tố'),
(31726, 92, N'Xã Gia Hòa'),
(31732, 92, N'Phường Ngã Năm'),
(31741, 92, N'Xã Tân Long'),
(31753, 92, N'Phường Mỹ Quới'),
(31756, 92, N'Xã Phú Lộc'),
(31759, 92, N'Xã Lâm Tân'),
(31777, 92, N'Xã Vĩnh Lợi'),
(31783, 92, N'Phường Vĩnh Châu'),
(31789, 92, N'Phường Khánh Hòa'),
(31795, 92, N'Xã Vĩnh Hải'),
(31804, 92, N'Phường Vĩnh Phước'),
(31810, 92, N'Xã Lai Hòa'),
(31825, 96, N'Phường Bạc Liêu'),
(31834, 96, N'Phường Vĩnh Trạch'),
(31840, 96, N'Phường Hiệp Thành'),
(31843, 96, N'Xã Hồng Dân'),
(31849, 96, N'Xã Ninh Quới'),
(31858, 96, N'Xã Vĩnh Lộc'),
(31864, 96, N'Xã Ninh Thạnh Lợi'),
(31867, 96, N'Xã Phước Long'),
(31876, 96, N'Xã Vĩnh Phước'),
(31882, 96, N'Xã Vĩnh Thanh'),
(31885, 96, N'Xã Phong Hiệp'),
(31891, 96, N'Xã Hòa Bình'),
(31894, 96, N'Xã Châu Thới'),
(31900, 96, N'Xã Vĩnh Lợi'),
(31906, 96, N'Xã Hưng Hội'),
(31918, 96, N'Xã Vĩnh Mỹ'),
(31927, 96, N'Xã Vĩnh Hậu'),
(31942, 96, N'Phường Giá Rai'),
(31951, 96, N'Phường Láng Tròn'),
(31957, 96, N'Xã Phong Thạnh'),
(31972, 96, N'Xã Gành Hào'),
(31975, 96, N'Xã Đông Hải'),
(31985, 96, N'Xã Long Điền'),
(31988, 96, N'Xã An Trạch'),
(31993, 96, N'Xã Định Thành'),
(32002, 96, N'Phường An Xuyên'),
(32014, 96, N'Phường Lý Văn Lâm'),
(32025, 96, N'Phường Tân Thành'),
(32041, 96, N'Phường Hòa Thành'),
(32044, 96, N'Xã Nguyễn Phích'),
(32047, 96, N'Xã U Minh'),
(32059, 96, N'Xã Khánh An'),
(32062, 96, N'Xã Khánh Lâm'),
(32065, 96, N'Xã Thới Bình'),
(32069, 96, N'Xã Biển Bạch'),
(32071, 96, N'Xã Trí Phải'),
(32083, 96, N'Xã Tân Lộc'),
(32092, 96, N'Xã Hồ Thị Kỷ'),
(32095, 96, N'Xã Trần Văn Thời'),
(32098, 96, N'Xã Sông Đốc'),
(32104, 96, N'Xã Đá Bạc'),
(32110, 96, N'Xã Khánh Bình'),
(32119, 96, N'Xã Khánh Hưng'),
(32128, 96, N'Xã Cái Nước'),
(32134, 96, N'Xã Lương Thế Trân'),
(32137, 96, N'Xã Tân Hưng'),
(32140, 96, N'Xã Hưng Mỹ'),
(32152, 96, N'Xã Đầm Dơi'),
(32155, 96, N'Xã Tạ An Khương'),
(32161, 96, N'Xã Trần Phán'),
(32167, 96, N'Xã Tân Thuận'),
(32182, 96, N'Xã Quách Phẩm'),
(32185, 96, N'Xã Thanh Tùng'),
(32188, 96, N'Xã Tân Tiến'),
(32191, 96, N'Xã Năm Căn'),
(32201, 96, N'Xã Đất Mới'),
(32206, 96, N'Xã Tam Giang'),
(32212, 96, N'Xã Cái Đôi Vàm'),
(32214, 96, N'Xã Phú Mỹ'),
(32218, 96, N'Xã Phú Tân'),
(32227, 96, N'Xã Nguyễn Việt Khái'),
(32236, 96, N'Xã Tân Ân'),
(32244, 96, N'Xã Phan Ngọc Hiển'),
(32248, 96, N'Xã Đất Mũi');
GO

-- 27. DỮ LIỆU MẪU BẢNG PHÍ VẬN CHUYỂN
-- Đủ 34 tỉnh/thành theo WEB_TINH_THANH và một mức mặc định.
-- TP. Hồ Chí Minh: 20.000đ, miễn phí từ 500.000đ; các tỉnh/thành khác: 35.000đ, miễn phí từ 700.000đ.
INSERT INTO WEB_PHI_VAN_CHUYEN (MaTinhThanh, TenKhuVuc, PhiVanChuyen, MienPhiTu) VALUES
(1, N'Thành phố Hà Nội', 35000, 700000),
(4, N'Tỉnh Cao Bằng', 35000, 700000),
(8, N'Tỉnh Tuyên Quang', 35000, 700000),
(11, N'Tỉnh Điện Biên', 35000, 700000),
(12, N'Tỉnh Lai Châu', 35000, 700000),
(14, N'Tỉnh Sơn La', 35000, 700000),
(15, N'Tỉnh Lào Cai', 35000, 700000),
(19, N'Tỉnh Thái Nguyên', 35000, 700000),
(20, N'Tỉnh Lạng Sơn', 35000, 700000),
(22, N'Tỉnh Quảng Ninh', 35000, 700000),
(24, N'Tỉnh Bắc Ninh', 35000, 700000),
(25, N'Tỉnh Phú Thọ', 35000, 700000),
(31, N'Thành phố Hải Phòng', 35000, 700000),
(33, N'Tỉnh Hưng Yên', 35000, 700000),
(37, N'Tỉnh Ninh Bình', 35000, 700000),
(38, N'Tỉnh Thanh Hóa', 35000, 700000),
(40, N'Tỉnh Nghệ An', 35000, 700000),
(42, N'Tỉnh Hà Tĩnh', 35000, 700000),
(44, N'Tỉnh Quảng Trị', 35000, 700000),
(46, N'Thành phố Huế', 35000, 700000),
(48, N'Thành phố Đà Nẵng', 35000, 700000),
(51, N'Tỉnh Quảng Ngãi', 35000, 700000),
(52, N'Tỉnh Gia Lai', 35000, 700000),
(56, N'Tỉnh Khánh Hòa', 35000, 700000),
(66, N'Tỉnh Đắk Lắk', 35000, 700000),
(68, N'Tỉnh Lâm Đồng', 35000, 700000),
(75, N'Tỉnh Đồng Nai', 35000, 700000),
(79, N'Thành phố Hồ Chí Minh', 20000, 500000),
(80, N'Tỉnh Tây Ninh', 35000, 700000),
(82, N'Tỉnh Đồng Tháp', 35000, 700000),
(86, N'Tỉnh Vĩnh Long', 35000, 700000),
(91, N'Tỉnh An Giang', 35000, 700000),
(92, N'Thành phố Cần Thơ', 35000, 700000),
(96, N'Tỉnh Cà Mau', 35000, 700000),
(NULL, N'Khu vực mặc định', 35000, 700000);
GO

-- 28. DỮ LIỆU MẪU BẢNG MÃ GIẢM GIÁ
INSERT INTO WEB_MA_GIAM_GIA
    (MaGiamGia,TenMaGiamGia,MoTa,LoaiGiam,GiaTri,DonToiThieu,GiamToiDa,BatDau,KetThuc,TrangThai,HienThi,MaSP,SoLuong,ChoPhepKetHop)
VALUES
('JAVI10',N'Ưu đãi JAVI 10%',N'Giảm 10% tiền hàng cho đơn từ 200.000đ, tối đa 50.000đ.','percent',10,200000,50000,SYSUTCDATETIME(),NULL,N'Hoạt động',1,NULL,NULL,0),
('JAVI30K',N'Thưởng thức JAVI · giảm 30.000đ',N'Giảm 30.000đ tiền hàng cho đơn từ 150.000đ.','fixed',30000,150000,NULL,SYSUTCDATETIME(),NULL,N'Hoạt động',1,NULL,100,0),
('JAVI15',N'Ưu đãi JAVI 15%',N'Giảm 15% tiền hàng cho đơn từ 300.000đ, tối đa 60.000đ.','percent',15,300000,60000,SYSUTCDATETIME(),NULL,N'Hoạt động',1,NULL,100,0),
('JAVI100K',N'Ưu đãi đơn từ 2 triệu',N'Giảm 100.000đ tiền hàng cho đơn từ 2.000.000đ.','fixed',100000,2000000,NULL,SYSUTCDATETIME(),NULL,N'Hoạt động',1,NULL,50,0),
('JAVI5',N'Đồng hành cùng JAVI',N'Giảm 5% tiền hàng, tối đa 30.000đ, không yêu cầu giá trị đơn tối thiểu.','percent',5,0,30000,SYSUTCDATETIME(),NULL,N'Hoạt động',1,NULL,NULL,0);
GO

-- 30. DỮ LIỆU MẪU BẢNG MÃ GIẢM GIÁ KHÁCH HÀNG ĐÃ LƯU
INSERT INTO WEB_MA_KHACH_HANG (TenDangNhap,MaGiamGia)
VALUES
('enduser_demo','JAVI10'),
('enduser_demo','JAVI30K'),
('enduser_demo','JAVI15'),
('enduser_demo','JAVI100K'),
('enduser_demo','JAVI5');
GO

GO

GO
IF NOT EXISTS(SELECT 1 FROM WEB_BAI_VIET WHERE Slug='javi-tren-vtv')
 INSERT INTO WEB_BAI_VIET(TieuDe,Slug,ChuyenMuc,TomTat,NoiDung,AnhBia,TrangThai,NgayDang)
 VALUES(N'JAVI trên VTV: câu chuyện máy pha phin Việt','javi-tren-vtv',N'Bài truyền thông',N'Đọc bài giới thiệu về máy pha cà phê JAVI do VTV đăng ngày 25/08/2016.',N'VTV giới thiệu máy pha cà phê JAVI và người sáng chế Nguyễn Bá Hải. Đây là bài báo lưu trữ, không phải thông báo giá hay ưu đãi hiện tại.

Đọc bài gốc tại VTV:
https://vtv.vn/kinh-te/may-pha-ca-phe-viet-nhanh-gap-30-lan-re-bang-1-5-may-ngoai-20160825072956524.htm',N'/images/javi-phin-hero.png',N'Đã xuất bản','2016-08-25T09:25:00');

GO

-- Verified JAVI press collection
IF NOT EXISTS(SELECT 1 FROM WEB_BAI_VIET WHERE Slug=N'javi-vnexpress-sang-tao-may-pha')
 INSERT INTO WEB_BAI_VIET(TieuDe,Slug,ChuyenMuc,TomTat,NoiDung,AnhBia,TrangThai,NgayDang)
 VALUES(N'VnExpress: Từ nghiên cứu đến máy pha cà phê JAVI',N'javi-vnexpress-sang-tao-may-pha',N'Bài truyền thông',N'VnExpress kể về quá trình Nguyễn Bá Hải cùng cộng sự phát triển máy pha cà phê dành cho người Việt.',N'Bài báo ghi lại các lần thử nghiệm và cải tiến của nhóm nghiên cứu trước khi hình thành máy pha JAVI. Trọng tâm là cách kết hợp kỹ thuật pha chế với thói quen thưởng thức cà phê phin tại Việt Nam.

Nguồn: VnExpress
Ngày đăng bài gốc: 11/09/2015

Bản tóm tắt biên soạn cho Góc JAVI. Đọc đầy đủ tại nguồn:
https://vnexpress.net/tien-si-tre-sang-tao-may-pha-ca-phe-sach-cho-nguoi-viet-3277264.html',N'/images/press/vnexpress.jpg',N'Đã xuất bản',N'2015-09-11T06:00:00');
IF NOT EXISTS(SELECT 1 FROM WEB_BAI_VIET WHERE Slug=N'javi-doanh-nhan-sai-gon')
 INSERT INTO WEB_BAI_VIET(TieuDe,Slug,ChuyenMuc,TomTat,NoiDung,AnhBia,TrangThai,NgayDang)
 VALUES(N'Doanh Nhân Sài Gòn: Khát vọng đưa cà phê JAVI ra thế giới',N'javi-doanh-nhan-sai-gon',N'Bài truyền thông',N'Câu chuyện thương hiệu JAVI, nghiên cứu máy pha và mong muốn nâng giá trị cà phê Việt qua góc nhìn Doanh Nhân Sài Gòn.',N'Bài viết giới thiệu quá trình phát triển máy pha và những trăn trở của Nguyễn Bá Hải về chất lượng nguyên liệu, công nghệ chế biến và giá trị thương hiệu. Các kế hoạch thị trường trong bài phản ánh thời điểm năm 2017.

Nguồn: Doanh Nhân Sài Gòn
Ngày đăng bài gốc: 03/04/2017

Bản tóm tắt biên soạn cho Góc JAVI. Đọc đầy đủ tại nguồn:
https://htv.vn/doanhnhansaigon/javi-va-khat-vong-ca-phe-viet-nam-vuon-tam-the-gioi-235572.html',N'/images/press/doanh-nhan-sai-gon.jpg',N'Đã xuất bản',N'2017-04-03T06:54:00');
IF NOT EXISTS(SELECT 1 FROM WEB_BAI_VIET WHERE Slug=N'javi-thanh-nien-khoi-nghiep')
 INSERT INTO WEB_BAI_VIET(TieuDe,Slug,ChuyenMuc,TomTat,NoiDung,AnhBia,TrangThai,NgayDang)
 VALUES(N'Thanh Niên: Hành trình khởi nghiệp từ máy pha JAVI',N'javi-thanh-nien-khoi-nghiep',N'Bài truyền thông',N'Thanh Niên giới thiệu dự án máy pha do nhóm nghiên cứu có Nguyễn Bá Hải chủ trì và cách chuyển giao giải pháp kinh doanh cà phê.',N'Bài báo mô tả hành trình từ thử nghiệm trong trường đại học đến mô hình khởi nghiệp JaviCoffee. Nội dung đề cập việc chuyển giao công nghệ và hỗ trợ người mở quán. Các định giá, chi phí và điều kiện thương mại trong bài là thông tin lịch sử, không phải chính sách bán hàng hiện hành.

Nguồn: Thanh Niên
Ngày đăng bài gốc: 29/01/2017

Bản tóm tắt biên soạn cho Góc JAVI. Đọc đầy đủ tại nguồn:
https://thanhnien.vn/nguoi-tre-khoi-nghiep-tu-choi-ban-du-an-trieu-usd-185620378.htm',N'/images/press/thanh-nien.jpg',N'Đã xuất bản',N'2017-01-29T10:02:00');
IF NOT EXISTS(SELECT 1 FROM WEB_BAI_VIET WHERE Slug=N'nguyen-ba-hai-guong-mat-tre-2014')
 INSERT INTO WEB_BAI_VIET(TieuDe,Slug,ChuyenMuc,TomTat,NoiDung,AnhBia,TrangThai,NgayDang)
 VALUES(N'Tiền Phong: Nguyễn Bá Hải được chọn vào 10 Gương mặt trẻ Việt Nam tiêu biểu 2014',N'nguyen-ba-hai-guong-mat-tre-2014',N'Bài truyền thông',N'Báo Tiền Phong công bố danh sách nhận giải năm 2014, trong đó có tiến sĩ Nguyễn Bá Hải. Bài công bố đăng ngày 18/03/2015.',N'Nguyễn Bá Hải có tên trong danh sách 10 cá nhân được Hội đồng bình chọn lựa chọn nhận giải Gương mặt trẻ Việt Nam tiêu biểu 2014. Đây là danh hiệu dành cho cá nhân và các đóng góp của người được vinh danh; không phải giải thưởng hoặc chứng nhận chất lượng cho máy pha JAVI. Cần phân biệt năm danh hiệu 2014 với năm công bố 2015.

Nguồn: Tiền Phong
Ngày đăng bài gốc: 18/03/2015

Bản tóm tắt biên soạn cho Góc JAVI. Đọc đầy đủ tại nguồn:
https://tienphong.vn/cong-bo-10-guong-mat-tre-viet-nam-tieu-bieu-2014-post765749.tpo',N'/images/press/tien-phong.webp',N'Đã xuất bản',N'2015-03-18T14:59:00');
IF NOT EXISTS(SELECT 1 FROM WEB_BAI_VIET WHERE Slug=N'nguyen-ba-hai-cong-dan-tre-2012')
 INSERT INTO WEB_BAI_VIET(TieuDe,Slug,ChuyenMuc,TomTat,NoiDung,AnhBia,TrangThai,NgayDang)
 VALUES(N'VietNamNet: Nguyễn Bá Hải và những sáng tạo hướng tới cộng đồng',N'nguyen-ba-hai-cong-dan-tre-2012',N'Bài truyền thông',N'VietNamNet viết về lớp học một đô, hoạt động sáng tạo và danh hiệu Công dân trẻ tiêu biểu TP.HCM 2012 của Nguyễn Bá Hải.',N'Bài chân dung giới thiệu việc Nguyễn Bá Hải trở về Việt Nam, tổ chức lớp học kỹ thuật và nghiên cứu sản phẩm hỗ trợ người khiếm thị. Theo bài báo, ông được vinh danh Công dân trẻ tiêu biểu TP.HCM năm 2012. Danh hiệu gắn với hoạt động cá nhân, không được diễn giải thành chứng nhận sản phẩm JAVI.

Nguồn: VietNamNet
Ngày đăng bài gốc: 07/03/2015

Bản tóm tắt biên soạn cho Góc JAVI. Đọc đầy đủ tại nguồn:
https://vietnamnet.vn/tien-si-tre-1-do-224231.html',N'/images/press/vietnamnet.jpg',N'Đã xuất bản',N'2015-03-07T01:00:00');
GO
