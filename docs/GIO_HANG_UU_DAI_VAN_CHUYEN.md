# Giỏ hàng, địa chỉ, ưu đãi và vận chuyển

## Cập nhật database

- Dựng lại toàn bộ DB: dùng `database.sql`. File có lệnh xóa bảng và dữ liệu ở đầu, tạo bảng trước và dữ liệu mẫu sau.
Cấu trúc và dữ liệu đã gộp trong database.sql, file SQL duy nhất. Chọn đúng DB trước khi chạy; script xóa và tạo lại bảng.
- Sau khi chạy SQL, khởi động lại `node server.js`. Không cần thay đổi cấu hình SMTP.
- Chưa tự chạy migration vào DB trong lần chỉnh sửa này.

## Các bảng mới

| Bảng | Vai trò |
|---|---|
| WEB_TINH_THANH | Danh mục 34 tỉnh/thành |
| WEB_PHUONG_XA | Danh mục 3.321 phường/xã, khóa ngoại về tỉnh/thành |
| WEB_DIA_CHI | Sổ địa chỉ theo tài khoản, khóa ngoại kép bảo đảm phường/xã thuộc tỉnh/thành |
| WEB_PHI_VAN_CHUYEN | Phí theo tỉnh/thành; một mức riêng mỗi tỉnh và một mức mặc định |
| WEB_MA_GIAM_GIA | Mã phần trăm hoặc số tiền; điều kiện tối thiểu, giảm tối đa, thời hạn, bật/tắt |
| WEB_AP_DUNG_MA | Mã và số tiền thực giảm của đơn; dùng cho cả nhân viên và website |
| WEB_UU_DAI_DON_HANG | Địa chỉ chi tiết, địa điểm và ưu đãi tại thời điểm đặt đơn website |

Danh mục hành chính lấy từ https://provinces.open-api.vn/api/v2/?depth=2 ngày 17/10/2026. Mô hình địa chỉ hai cấp: tỉnh/thành và phường/xã, không yêu cầu quận/huyện. Bản JSON dùng cho dropdown và xác thực được lưu tại `Shared/Backend/data/vietnam-divisions.json`; dữ liệu tương ứng được seed trong SQL. Khi cập nhật danh mục, phải cập nhật cả hai nguồn.

## Dữ liệu mẫu cần thay trước khi dùng thực tế

- TP. Hồ Chí Minh: 20.000đ; miễn phí từ 500.000đ.
- Mặc định các tỉnh/thành khác: 35.000đ; miễn phí từ 700.000đ.
- `JAVI10`: giảm 10%, tối đa 50.000đ, tiền hàng đủ điều kiện từ 200.000đ. Không đặt ngày hết hạn cho dữ liệu mẫu.

Tại **Cấu hình website → Ưu đãi & vận chuyển**, quản lý có thể tạo/sửa/tắt mã, đổi mức phí và ngưỡng miễn phí. Mức phí cụ thể được ưu tiên hơn mức mặc định. Tắt một khu vực có mức riêng sẽ ngừng nhận giao khu vực đó. Mã là mã chung, được dùng nhiều lần trong thời gian hiệu lực; chưa có giới hạn lượt hoặc cấp riêng cho từng khách. Tắt mã thay vì xóa để giữ liên kết lịch sử đơn.

## Cách tính

- Website: tiền hàng − giảm từ mã + phí giao hàng. Miễn phí vận chuyển xét trên tiền hàng trước giảm từ mã.
- Nhân viên: giảm theo sản phẩm → chiết khấu hạng khách → giảm thủ công → giảm từ mã. Điều kiện tối thiểu và phần trăm của mã xét trên số tiền còn lại sau các mức giảm trước. Tổng giảm không vượt tiền hàng.
- Giỏ hàng chưa chọn địa chỉ sẽ ghi “Tính khi chọn địa chỉ” và “Tổng tạm tính”. Phí chính xác được báo tại trang thanh toán sau khi chọn tỉnh/phường và nhập số nhà, đường.
- Server đọc lại giá sản phẩm và mã còn hiệu lực khi tạo hoặc sửa đơn. Không dùng số tiền giảm từ trình duyệt làm nguồn tính toán.
- Thay đổi đơn nhân viên làm mất hiệu lực kết quả áp mã cũ, cần bấm áp lại.
- Email và trang xác nhận đơn website hiển thị số tiền đã giảm. Địa chỉ trên đơn là bản lưu tại thời điểm mua, không thay đổi theo sổ địa chỉ sau này.
- Ngày hiệu lực mã được lưu/so sánh theo UTC; biểu mẫu hiển thị theo giờ trình duyệt.
- Các bảng mới được đưa vào luồng sao lưu/phục hồi hiện có.

## Kiểm tra đã chạy

- `node tests/check-checkout-pricing.cjs`: tính phí, ngưỡng miễn phí, mức giảm tối đa, mã sai/hết hạn, địa điểm không khớp, giảm thủ công kết hợp mã, số lượng và mức giảm không hợp lệ. Dùng DB mô phỏng, không ghi DB thật.
- `node tests/check-commerce-ui.cjs`: Chrome với API mô phỏng, kiểm tra giỏ hàng, dropdown phụ thuộc, áp mã, chặn mã sai, mobile không tràn ngang, tab quản lý và áp mã tại quầy. Ảnh kiểm tra sinh trong `output/tests/`.
- Kiểm tra cú pháp các file JavaScript và script trong trang HTML đã sửa.
- Chưa kiểm tra migration trên SQL Server thật hoặc gửi đơn/email thật trong thay đổi này.
