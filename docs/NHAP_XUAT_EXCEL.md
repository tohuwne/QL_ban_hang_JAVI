# Nhập và xuất Excel

Các phân hệ nằm trong nhóm Danh mục được nhập Excel: Sản phẩm, Loại sản phẩm, Khách hàng, Loại khách hàng, Nhà cung cấp, Mã giảm giá và Địa điểm (Tỉnh thành, Phường xã, Phí giao hàng). Đơn hàng cũng được nhập Excel, tổng cộng 10 màn hình import hoạt động. Giữ nguyên phân quyền chỉ xem của từng vai trò.

Các phân hệ còn lại, bao gồm Nhập/Xuất kho, Hóa đơn, Thu/Chi, Công nợ, Tồn kho và Người dùng, chỉ hiển thị nút Xuất file trực tiếp. Không có lựa chọn nhập hoặc menu nhập/xuất. Trang chủ và màn hình Bán hàng (kể cả khi mở từ Thêm đơn hàng) không có nút nhập/xuất. Các nút file được gom sát nút Thêm; riêng Địa điểm nằm sát nút Thêm của tab đang mở.

API schema, tải mẫu, xem trước và lưu import chỉ cho phép 9 danh mục kể trên và Đơn hàng; các chứng từ khác và Người dùng bị chặn, kể cả quản lý. Truy cập URL import cũ ngoài danh mục được chuyển về trang danh sách. Các file cũ không còn được dùng để nhập.

Với danh mục, nút Nhập file trỏ thẳng đến HTML riêng, không dùng iframe. Trang riêng chiếm vùng nội dung sát sidebar; sidebar mờ và khóa tương tác. Không hiển thị câu chú thích, chỉ có các điều khiển, lưới xem trước và thông báo kết quả/lỗi.

Mỗi danh mục có file mẫu Admin/Backend/templates/import/mau-ten-phan-he.xlsx. Nút tải mẫu đọc lại danh mục từ DB; script node Admin/Backend/scripts/generate-import-templates.js tạo lại 10 mẫu danh mục và đơn hàng. Excel có droplist, kiểm tra số/ngày/độ dài, giữ mã và điện thoại dạng văn bản. Tối đa 5 MB và 500 dòng, không nhận công thức thay cho dữ liệu.

Cấu hình từng màn hình ở Admin/Backend/services/import-schema.js được đối chiếu với control của form thêm mới: required, maxlength, min, max và pattern; server kiểm tra thêm khóa ngoại và ràng buộc DB. Dòng lỗi màu đỏ khóa lưu cả file. Dữ liệu trùng có hai cách: Bỏ qua hoặc Cập nhật theo mã, ô trống giữ dữ liệu cũ. Kiểm tra lại nếu dữ liệu DB đổi sau khi xem trước.

Xem trước chạy thử rồi rollback. Lưu thực hiện cả đợt trong một giao dịch; lỗi sẽ hoàn tác toàn bộ. Mã xem trước gắn tài khoản và phân hệ, hết hạn sau 15 phút; gửi lưu lặp lại cùng mã không nhập hai lần. Không cần thay đổi database.sql.

Kiểm tra: tests/check-excel-import.cjs, tests/check-excel-api.cjs, tests/check-excel-ui.cjs, tests/check-excel-sql.cjs và tests/check-excel-live.cjs. Các kiểm tra DB thật chỉ tải mẫu và xem trước/rollback, không commit dữ liệu nhập.

## Import đơn hàng và khách hàng

Không có cột Nhóm chứng từ trong mẫu đơn hàng. Mã đơn hàng trong file là nhãn gom nhóm bắt buộc: các dòng cùng mã tạo một đơn, mã khác tạo đơn khác. DB vẫn tự sinh mã đơn chính thức khi lưu; nhãn trong file không được ghi làm khóa chính. Nếu mã nhập trùng mã chính thức đã tồn tại, áp dụng lựa chọn bỏ qua/chặn cập nhật chứng từ như trước. Thông tin khách hàng, nhân viên và trạng thái trong cùng một mã phải thống nhất; sản phẩm trùng trong cùng đơn báo lỗi. Cột đầu lưới xem trước là STT, đánh số liên tục từ 1, không dùng số dòng vật lý Excel.

Mã KH nhập tay, không có droplist. Mã đã có lấy thông tin từ DB; mã không tồn tại báo lỗi. Để trống mã để thêm khách mới; file có sẵn các cột của form KH. Lưới chỉ hiện cột KH mới khi có dòng để trống mã. Tên và SĐT bắt buộc cho khách mới; email, giới tính, địa chỉ và loại KH theo form thêm mới. SĐT đã có sẽ chỉ rõ mã KH để dùng lại. Một SĐT mới xuất hiện trong nhiều nhóm đơn chỉ tạo một khách nếu mọi thông tin thống nhất; khác thông tin báo lỗi. Khách mới và tất cả đơn hàng nằm chung giao dịch; lỗi sẽ hoàn tác cả khách, đơn và tồn kho. Đơn đã tồn tại vẫn chỉ bỏ qua, không ghi đè qua Excel.
