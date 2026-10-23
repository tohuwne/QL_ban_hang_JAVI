# Ghi chú cải tiến hệ thống Javi Coffee từ THNN sang KLTN

Ngày đối chiếu: 16/10/2026.

## 1. Mục đích và cách đọc

Tài liệu tổng hợp những khác biệt giữa báo cáo THNN đã cung cấp và mã nguồn hệ thống hiện tại, đồng thời ghi chú nội dung cần sửa khi viết đề cương và báo cáo KLTN. Trọng tâm là nghiệp vụ bán hàng, bao gồm nhân viên lập đơn và khách đặt hàng trực tuyến.

**Cách hiểu trạng thái:** “Đã có trong mã nguồn” chỉ xác nhận có phần cài đặt tương ứng, không thay cho kết quả chạy thử trên cơ sở dữ liệu, cấu hình Google hoặc dịch vụ email thực tế. “Cần kiểm tra/hoàn thiện” là việc đề xuất tiếp theo, chưa phải kết quả đã đạt. Không có bản mã nguồn tại thời điểm nộp THNN để so sánh lịch sử từng thay đổi; đối chiếu dưới đây dựa trên nội dung báo cáo THNN với mã nguồn hiện tại.

**Chức năng quản trị nội dung website chỉ là tiện ích hỗ trợ và không nằm trong phạm vi đề tài.**

## 2. Hướng chuyển từ THNN sang KLTN

### Tên đề tài gợi ý

**Xây dựng hệ thống quản lý bán hàng tích hợp đặt hàng trực tuyến tại Công ty Javi Coffee.**

Nếu giảng viên yêu cầu giữ tên cũ, có thể dùng “Xây dựng hệ thống quản lý bán hàng tại Công ty Javi Coffee”, nhưng cần làm rõ phần phát triển thêm trong mục tiêu, phạm vi và đóng góp.

### Điểm khác biệt trọng tâm

Báo cáo THNN đã tập trung vào quy trình nội bộ giữa bán hàng, kế toán và kho. Phiên bản hiện tại mở rộng điểm bắt đầu quy trình sang khách hàng: khách xem sản phẩm, dùng giỏ hàng, gửi thông tin nhận hàng và đặt hàng trên website; đơn được ghi vào dữ liệu bán hàng dùng chung để nhân viên tiếp nhận và xử lý.

Giá trị phát triển cho KLTN nằm ở **luồng bán hàng liên thông và tính đúng đắn của dữ liệu**: kiểm tra giá và tồn ở máy chủ, xử lý yêu cầu trùng, liên kết đơn với thông tin nhận hàng, phân quyền truy cập, thông báo xác nhận và đối soát dữ liệu. Không nên chỉ mô tả việc thêm một giao diện mua hàng.

## 3. Nền tảng THNN đã có và cần ghi là kế thừa

Theo nội dung báo cáo cũ, các phần sau đã được trình bày:

- Quản lý sản phẩm, loại sản phẩm, khách hàng và loại khách hàng.
- Nhân viên lập đơn, tính tiền và giảm giá.
- Hóa đơn, công nợ, phiếu thu, phiếu chi và thu nợ.
- Nhập kho, xuất kho, cập nhật trạng thái giao hàng.
- Khái niệm tồn kho khả dụng, trigger cập nhật dữ liệu, stored procedure và view tổng hợp.
- Dashboard, báo cáo, tìm kiếm, lọc và in chứng từ.
- Nhân viên, tài khoản, phân quyền theo chức vụ và khóa/mở tài khoản.
- Quản trị hệ thống và sao lưu dữ liệu.

**Ghi chú khi viết:** Không liệt kê toàn bộ những phần trên như chức năng mới của KLTN. Cần phân biệt rõ phần kế thừa, phần nâng cấp cách xử lý và phần bổ sung mới. Việc tồn tại chức năng nhập kho trong báo cáo cũng cho thấy phải rà soát lại mục phạm vi cũ, vốn loại trừ một số hoạt động nhập hàng nhưng phần kết luận lại mô tả phạm vi rộng hơn.

## 4. Những cải tiến đã tìm thấy trong phiên bản hiện tại

### 4.1. Bổ sung luồng mua hàng dành cho khách hàng

**So với THNN:** Phần đối tượng và phạm vi cũ chủ yếu mô tả người dùng nội bộ; chưa mô tả đầy đủ khách hàng tự đặt đơn như một tác nhân chính.

**Hiện tại:** Có các trang mua hàng, đăng nhập, giỏ hàng, thanh toán và đặt hàng thành công. Có API sản phẩm cho website, API checkout và API đọc thông tin đơn của khách.

**Cần sửa trong KLTN:**

- Bổ sung tác nhân Khách hàng bên cạnh Bán hàng, Kho, Kế toán và Quản lý.
- Bổ sung Use Case xem sản phẩm, quản lý giỏ hàng, nhập thông tin giao nhận, đặt hàng và xem xác nhận đơn thuộc tài khoản.
- Vẽ hai nhánh tiếp nhận đơn: khách đặt website và nhân viên lập đơn.
- Phân biệt “xem thông tin đơn theo mã” với “lịch sử tất cả đơn của khách”; chưa nên ghi đã có màn hình lịch sử đơn đầy đủ khi chưa kiểm chứng.

**Mã đối chiếu:** `User/Frontend/mua-hang.html`, `gio-hang.html`, `thanh-toan.html`, `don-hang-thanh-cong.html`; `User/Backend/routes/website.js`.

### 4.2. Giỏ hàng lưu theo tài khoản trong cơ sở dữ liệu

**Hiện tại:** Phân hệ giỏ hàng đọc, thêm/cập nhật và xóa sản phẩm theo tài khoản; kiểm tra số lượng nguyên dương và số lượng khả dụng. Giỏ được lưu trong bảng `GIO_HANG` thay vì chỉ tồn tại tạm trên giao diện.

**Ý nghĩa với bán hàng:** Khách có thể tiếp tục thao tác trên giỏ gắn với tài khoản. Tuy nhiên, sản phẩm có trong giỏ không đồng nghĩa đã giữ hàng; khi checkout vẫn phải kiểm tra lại tồn.

**Cần bổ sung:**

- Thiết kế bảng giỏ hàng, quan hệ với tài khoản và sản phẩm.
- Quy tắc cập nhật số lượng và xóa sản phẩm.
- Kịch bản sản phẩm ngừng hiển thị hoặc tồn thay đổi sau khi thêm vào giỏ.
- Kiểm thử quyền sở hữu giỏ và thao tác đồng thời.

**Mã đối chiếu:** `User/Backend/routes/gio-hang.js`, `database.sql`, `Shared/Backend/middleware/auth.js`.

### 4.3. Checkout xác minh dữ liệu tại máy chủ

**Hiện tại:** Checkout đọc giỏ hàng của người đăng nhập, lấy giá từ dữ liệu sản phẩm, kiểm tra sản phẩm được bán trên website, số lượng và tồn khả dụng; tính tổng tiền và phí giao hàng tại máy chủ.

**Điểm cần nhấn mạnh:** Không tin giá hoặc tổng tiền do trình duyệt tự gửi. Đây là nội dung thiết kế xử lý bán hàng, không chỉ là thao tác hiển thị tổng tiền.

**Cần sửa/bổ sung:**

- Đặc tả nguồn giá, quy tắc phí giao hàng và các điều kiện từ chối đơn.
- Phân biệt giảm giá tại quầy với website: checkout hiện ghi giảm giá bằng 0, không nên mô tả hai kênh dùng cùng toàn bộ chính sách chiết khấu khi chưa triển khai.
- Kiểm tra cách tính phí giao hàng, thuế và tổng thanh toán khi chuyển tiếp sang hóa đơn, tránh cộng phí hoặc tính thuế hai lần.

**Mã đối chiếu:** `User/Backend/routes/website.js`, tuyến `POST /website/checkout`.

### 4.4. Giao dịch checkout và chống tạo đơn lặp

**Hiện tại:** Checkout sử dụng transaction ở mức `SERIALIZABLE`, khóa khi đọc một số dữ liệu, có `commit`/`rollback` và mã yêu cầu `MaYeuCau`. Khi nhận lại cùng mã yêu cầu của cùng tài khoản, API trả đơn đã tồn tại thay vì tạo đơn mới.

**Ý nghĩa:** Hạn chế đơn trùng khi khách bấm lại hoặc gửi lại yêu cầu, đồng thời bảo vệ chuỗi ghi đơn, chi tiết, thông tin website và cập nhật giỏ hàng.

**Cần bổ sung trong KLTN:**

- Sơ đồ tuần tự checkout có nhánh thành công, yêu cầu lặp, thiếu tồn và lỗi cần hoàn tác.
- Giải thích giỏ hàng không giữ tồn; kiểm soát cạnh tranh nằm ở thời điểm xử lý đơn.
- Kiểm thử hai khách cùng mua lượng tồn cuối và lỗi giữa quá trình ghi dữ liệu.
- Đánh giá khóa sinh mã đơn và mức cô lập với quy mô thử nghiệm; không khẳng định khả năng xử lý tải lớn khi chưa đo.
- Rà soát cả luồng nhân viên lập đơn để tránh chỉ bảo đảm tính đúng đắn ở checkout website.

**Mã đối chiếu:** `User/Backend/routes/website.js`, `database.sql`.

### 4.5. Liên kết đơn website với dữ liệu bán hàng nội bộ

**Hiện tại:** Đơn website được ghi vào `DON_HANG` và `CT_DON_HANG`, đồng thời có `WEB_DON_HANG`, `WEB_CT_DON_HANG` lưu thông tin giao nhận và bản chụp chi tiết. Trường `NguonDon` phân biệt nguồn phát sinh. Giao diện danh sách đơn phân biệt “Khách đặt web” và “Nhân viên lập”.

**Cần sửa/bổ sung:**

- ERD và từ điển dữ liệu phải thể hiện quan hệ giữa đơn nội bộ và phần thông tin website.
- Giải thích mục đích lưu tên và giá tại lúc đặt, tránh đơn cũ thay đổi theo dữ liệu sản phẩm hiện hành.
- Bổ sung quy tắc tiếp nhận đơn website và người phụ trách; hiện mã nguồn cần nhân viên đang làm việc thuộc nhóm phù hợp để tiếp nhận đơn.
- Rà soát quy ước `Sale`, `Website`, `Online`; giao diện đang nhận biết cả `Website` và `Online`, nhưng cần thống nhất ý nghĩa và xử lý dữ liệu cũ.
- Việc giao diện hạn chế sửa/xóa đơn website phải được đối chiếu với quy tắc tại API; không xem ẩn nút là đã đủ kiểm soát.

**Mã đối chiếu:** `User/Backend/routes/website.js`, `Admin/Backend/routes/ban-hang.js`, `Admin/Frontend/don-hang.html`, `database.sql`, `database.sql`.

### 4.6. Email xác nhận tiếp nhận đơn hàng

**Hiện tại:** Có dựng email, lưu nội dung và trạng thái trong `WEB_EMAIL`, gửi bằng Nodemailer khi có cấu hình SMTP; việc gửi diễn ra sau khi giao dịch đơn đã commit. Có trạng thái chờ, đang gửi, đã gửi, lỗi hoặc xem trước và có tuyến xử lý gửi lại.

**Ý nghĩa:** Lỗi email không được làm mất đơn đã tạo. Nội dung email xác nhận đã tiếp nhận đơn, không xác nhận đã thu tiền.

**Cần viết đúng:**

- Đây là thông báo giao dịch phục vụ bán hàng, không phải chức năng email marketing.
- Thiếu cấu hình SMTP có thể chỉ lưu bản xem trước; chưa được ghi “đã gửi email thực tế thành công” nếu chưa kiểm thử.
- Worker hiện lấy trạng thái `pending`/`preview`; trạng thái `failed` có đường xử lý lại thủ công. Không mô tả mọi lỗi gửi đều tự động retry đầy đủ.
- Kiểm thử lỗi SMTP, gửi lặp, khởi động lại khi đang gửi và bảo vệ quyền đọc nội dung email.

**Mã đối chiếu:** `Shared/Backend/services/order-email.js`, `User/Backend/routes/website.js`, `server.js`.

### 4.7. Nâng cấp mật khẩu, phiên và kiểm tra quyền trên API

**So với THNN:** Báo cáo có phân quyền nhưng phần hạn chế ghi mật khẩu còn dạng thường và chưa có cơ chế token mạnh hơn.

**Hiện tại:** Có bcrypt khi tạo tài khoản, kiểm tra mật khẩu băm và chuyển tài khoản cũ sang bcrypt sau đăng nhập hợp lệ. Có token ký HMAC SHA-256, thời hạn 8 giờ, middleware xác thực và phân quyền theo vai trò/chức vụ. Có kiểm tra tài khoản sở hữu giỏ và đơn website.

**Cần sửa/bổ sung:**

- Thay nhận định chung “chưa băm mật khẩu/chưa có token” bằng mô tả đúng phiên bản hiện tại.
- Gọi đúng “token có chữ ký HMAC”; token hiện tại không phải JWT chuẩn.
- Băm mật khẩu là một chiều; không gọi là mã hóa có thể giải mã.
- Nêu cơ chế chuyển đổi mật khẩu cũ; chưa khẳng định mọi bản ghi cũ đã được băm nếu chưa kiểm tra dữ liệu.
- Bổ sung ma trận quyền, lỗi 401/403 và các ca truy cập dữ liệu người khác.
- Kiểm thử hiệu lực phiên sau khóa tài khoản hoặc đổi chức vụ; token hiện mang thông tin quyền tại thời điểm cấp, cần xem xét cơ chế cập nhật/thu hồi.
- Cấu hình `AUTH_SECRET` ổn định ở môi trường triển khai; mã hiện tạo khóa ngẫu nhiên nếu thiếu cấu hình nên token mất hiệu lực khi khởi động lại.

**Mã đối chiếu:** `Shared/Backend/routes/auth.js`, `Shared/Backend/middleware/auth.js`, `app-api.js`.

### 4.8. Đăng nhập và đăng ký bằng Google

**Hiện tại:** Có kiểm tra credential Google ở máy chủ, đối chiếu client ID, email đã xác minh và liên kết tài khoản qua `GoogleSub`; có luồng đăng ký khách hàng từ danh tính Google.

**Cần bổ sung:** Mô tả như một lựa chọn xác thực hỗ trợ khách mua hàng; phân biệt lần đầu đăng ký với đăng nhập tài khoản đã liên kết. Kiểm thử cấu hình thiếu/sai, credential không hợp lệ và tài khoản trùng. Không khẳng định đã hoạt động trên môi trường chính thức khi chưa cấu hình và chạy thử.

**Mã đối chiếu:** `Shared/Backend/routes/auth.js`, `User/Frontend/login.html`.

### 4.9. Cảnh báo tồn kho theo ngưỡng từng sản phẩm

**Hiện tại:** Có trường `TonToiThieu`, cho phép ghi ngưỡng theo sản phẩm; truy vấn cảnh báo dùng `SoLuongTon <= TonToiThieu` thay cho một ngưỡng cố định chung.

**Cần sửa/bổ sung:**

- Bổ sung thuộc tính, điều kiện không âm và giao diện cập nhật ngưỡng.
- Phân biệt `SoLuongTon` là tồn thực tế với `SoLuongKD` là tồn khả dụng; không gọi cảnh báo theo tồn thực tế là cảnh báo theo tồn khả dụng.
- Minh họa các sản phẩm có ngưỡng khác nhau và kiểm thử khi bằng ngưỡng.
- Chỉ mô tả đây là hỗ trợ theo dõi hàng phục vụ bán; không gọi là dự báo nhu cầu hoặc tối ưu nhập hàng tự động.

**Mã đối chiếu:** `database.sql`, `Admin/Backend/routes/san-pham.js`, `Admin/Backend/routes/dashboard.js`, `Admin/Frontend/ton-kho.html`.

### 4.10. Bộ lọc báo cáo và trải nghiệm tác nghiệp

**Hiện tại:** Có mã bộ lọc báo cáo dùng chung; phần đơn hàng hỗ trợ khoảng ngày, chọn nhiều trạng thái đơn và thanh toán, kiểm tra ngày bắt đầu/kết thúc, cập nhật số lượng theo tập dữ liệu được lọc. Các quy tắc giao diện quản lý cũng đã được chuẩn hóa trong tài liệu dự án.

**Cần sửa/bổ sung:**

- Thay nhận xét “bộ lọc thời gian còn đơn giản” bằng mô tả cụ thể những bộ lọc hiện có trên từng màn hình.
- Phân biệt bộ lọc áp dụng sau nút Xem với dữ liệu đang nhập trên form.
- Đối chiếu số liệu trên thẻ, bảng, phân trang và bản in sau khi lọc.
- Có trường nguồn đơn không đồng nghĩa đã có đầy đủ biểu đồ doanh thu theo kênh; chỉ đưa vào kết quả nếu có thực hiện và kiểm chứng.
- In/lưu PDF qua trình duyệt không đồng nghĩa có xuất Excel/CSV hoặc dịch vụ tạo PDF chuyên dụng.

**Mã đối chiếu:** `Admin/Frontend/js/report-filters.js`, `Admin/Frontend/don-hang.html`, `Admin/Frontend/js/dashboard.js`, `docs/UI_STANDARD_GUIDE.md`, `docs/quy_tac_chung.md`.

### 4.11. Tổ chức mã nguồn theo phân hệ

**Hiện tại:** API được tách thành các route nghiệp vụ; có middleware xác thực dùng chung, dịch vụ email riêng và script frontend phục vụ từng nhóm chức năng.

**Cần ghi:** Đây là đặc điểm kiến trúc hiện tại giúp trình bày thiết kế và bảo trì. Chưa có bản mã nguồn THNN làm mốc nên không khẳng định toàn bộ việc tách module là thay đổi mới trong vài ngày qua.

**Mã đối chiếu:** `app-api.js`, `Admin/Backend/routes/`, `Shared/Backend/middleware/auth.js`, `Shared/Backend/services/order-email.js`.

## 5. Các phần cần sửa trong báo cáo THNN khi viết KLTN

| Vị trí theo tiêu đề trong bản THNN | Nội dung cần sửa hoặc bổ sung |
| --- | --- |
| Bìa và thông tin học phần | Đổi loại tài liệu sang đề cương/báo cáo KLTN; cập nhật tên đề tài, học phần, lịch và giảng viên theo thông tin được xác nhận. Không tự dùng mã lớp học phần hoặc ngày nộp THNN cho KLTN. |
| Lời cảm ơn và phần giới thiệu thực tập | Viết lại đúng bối cảnh khóa luận; chỉ giữ thông tin OneHR nếu còn liên quan và được xác nhận. Không nhầm đơn vị thực tập với doanh nghiệp được nghiên cứu. |
| Lý do hình thành đề tài | Bổ sung nhu cầu kết nối đặt hàng trực tuyến với xử lý nội bộ; tránh lặp nguyên lý do số hóa thủ công của THNN. |
| Mục tiêu tổng quát | Chuyển từ xây dựng phần mềm nội bộ sang hoàn thiện và đánh giá hệ thống bán hàng tích hợp đặt hàng trực tuyến. |
| Mục tiêu cụ thể | Bổ sung khách đặt hàng, giỏ hàng, xác minh giá/tồn, chống trùng, thông tin nhận hàng, email và kiểm thử liên thông. |
| Nội dung nghiên cứu | Sửa “Java” thành “JavaScript”; bổ sung thiết kế giao dịch và đánh giá tính đúng đắn. |
| Đối tượng nghiên cứu | Bổ sung khách hàng là người trực tiếp sử dụng website; tách vai trò khách với nhân viên. |
| Phạm vi nghiên cứu | Bám nghiệp vụ bán hàng; giải thích rõ kho và kế toán chỉ trong liên hệ với bán hàng. Thống nhất phạm vi nhập hàng với những chức năng thực sự trình bày. |
| Phương pháp nghiên cứu | Không giữ nguyên khẳng định đã phỏng vấn/khảo sát nếu chưa thực hiện cho giai đoạn KLTN; dùng kế hoạch khảo sát và bổ sung kết quả sau. |
| Dự kiến kết quả | Có sản phẩm phần mềm, thiết kế dữ liệu, tài liệu và hồ sơ kiểm thử; không tự khẳng định vận hành ổn định hoặc tăng hiệu quả theo tỷ lệ chưa đo. |
| Cơ sở lý thuyết | Bổ sung giao dịch, tồn khả dụng, yêu cầu lặp, xác thực, phân quyền và luồng bán hàng trực tuyến; giảm các đoạn giới thiệu công cụ chung chung. |
| Hiện trạng và xác định yêu cầu | Tách hiện trạng hoạt động bán hàng của doanh nghiệp khỏi hiện trạng phần mềm THNN và phiên bản hiện tại. |
| Tác nhân, Use Case và đặc tả | Thêm khách hàng và luồng website; bổ sung điều kiện trước/sau, nhánh thiếu tồn, yêu cầu trùng, lỗi email và truy cập trái quyền. |
| BFD, DFD và sơ đồ nghiệp vụ | Cập nhật đầu vào từ khách hàng, kho dữ liệu giỏ/đơn website và đầu ra xác nhận; giữ tên tiến trình nhất quán giữa các mô hình. |
| Mô hình dữ liệu và từ điển dữ liệu | Bổ sung giỏ, thông tin đơn website, chi tiết lưu tại lúc đặt, email, nguồn đơn, ngưỡng tồn và liên kết Google; đối chiếu schema thực tế. |
| Trigger và stored procedure | Rà soát tác động khi thêm checkout; kiểm tra không giữ/trừ tồn hoặc ghi tài chính lặp giữa SQL và backend. |
| Sơ đồ lớp, tuần tự, cộng tác | Cập nhật thành phần thực sự sử dụng; thêm tương tác trình duyệt, API, cơ sở dữ liệu và dịch vụ email. |
| Giới thiệu sản phẩm minh họa | Thay ảnh cũ bằng giao diện hiện tại; bổ sung chuỗi mua hàng và cách nhân viên tiếp nhận đơn. Không dùng ảnh để thay cho đánh giá chức năng. |
| Kiểm thử và đánh giá | Bổ sung mục riêng có dữ liệu đầu vào, kết quả mong đợi/thực tế, bằng chứng đối soát, lỗi và kết quả thử lại. |
| Những hạn chế | Cập nhật theo phiên bản thực tế; không tiếp tục ghi thiếu bcrypt/token/bộ lọc nếu phần đó đã có. |
| Hướng phát triển | Chỉ nêu những phần thật sự chưa triển khai; không ghi kế hoạch React, AI, ngân hàng hay vận chuyển như kết quả đã đạt. |
| Danh mục hình, bảng, thuật ngữ | Cập nhật sau khi viết lại; sửa số hình bị nhảy, lỗi chính tả và thuật ngữ dùng không thống nhất. |

## 6. Những điểm cần kiểm tra hoặc hoàn thiện trước khi chốt KLTN

### Ưu tiên 1 — Đúng luồng bán hàng và dữ liệu

- [ ] Lập bảng trạng thái đơn, giao hàng, hóa đơn, thanh toán và công nợ; ghi rõ vai trò được thay đổi và điều kiện chuyển bước.
- [ ] Xác nhận thứ tự lập hóa đơn và xuất kho. Báo cáo cũ có mô tả kho nhận hóa đơn đã duyệt; cần bảo đảm khớp code và quy trình thực tế.
- [ ] Đối soát `SoLuongTon` và `SoLuongKD` trước đặt đơn, sau đặt, xuất, giao thành công và không hoàn thành.
- [ ] Kiểm thử đặt trùng và hai yêu cầu tranh cùng tồn; xác nhận mã yêu cầu được giữ đúng khi khách gửi lại.
- [ ] Kiểm tra đơn website có đi hết luồng hóa đơn, phiếu xuất, phiếu thu và công nợ, không chỉ tạo thành công ở bước checkout.
- [ ] Đối soát cách tính tổng hàng, giảm giá, phí giao hàng, thuế và tổng thu ở cả hai kênh.
- [ ] Xác nhận cách xử lý đơn không hoàn thành, không mặc định hoàn tiền hoặc hoàn tồn nếu chưa có nghiệp vụ tương ứng.
- [ ] Rà soát API sửa/xóa đơn để quy tắc tại máy chủ khớp hạn chế trên giao diện.

### Ưu tiên 2 — Quyền truy cập và cấu hình hỗ trợ bán hàng

- [ ] Khách A không đọc đơn, email hoặc sửa giỏ của khách B.
- [ ] Kiểm thử quyền theo từng chức vụ bằng gọi API trực tiếp.
- [ ] Kiểm tra việc khóa tài khoản/đổi chức vụ tác động thế nào đến token đã cấp.
- [ ] Xác nhận chuyển đổi dữ liệu mật khẩu cũ, khóa ký phiên và cấu hình Google ở môi trường thử.
- [ ] Kiểm thử email thành công, thiếu cấu hình, lỗi gửi và thao tác gửi lại; không tạo thêm đơn.

### Ưu tiên 3 — Báo cáo và khả năng khôi phục dữ liệu bán hàng

- [ ] Thống nhất khái niệm doanh số đơn, doanh thu hóa đơn, tiền thực thu, chi phí nhập và lợi nhuận. Không gọi doanh thu trừ tổng nhập hàng là lợi nhuận kế toán đầy đủ nếu chưa có giá vốn và chi phí tương ứng.
- [ ] Đối chiếu tổng trên dashboard với bộ lọc và nguồn chứng từ; các thẻ hiện không nhất thiết cùng phạm vi thời gian.
- [ ] Kiểm tra báo cáo sau lọc, phân trang và in; đặt rõ trường ngày dùng để lọc.
- [ ] Kiểm tra dữ liệu sao lưu có bao phủ các bảng mới. Danh sách bảng ở `Admin/Backend/routes/quan-tri.js` hiện liệt kê nhóm bảng nghiệp vụ cũ, chưa bao gồm toàn bộ giỏ/đơn website/email.
- [ ] Nếu trình bày khả năng phục hồi, phải thử trên môi trường kiểm thử; tránh tuyên bố sao lưu đầy đủ hệ thống hiện tại chỉ từ chức năng cũ.

Các mục trên là ghi chú rà soát, không phải khẳng định tất cả đều đang lỗi.

## 7. Bộ kịch bản tối thiểu nên đưa vào phần kiểm thử

| Mã | Tình huống | Kết quả cần xác nhận |
| --- | --- | --- |
| BH01 | Nhân viên lập đơn hợp lệ | Giá, giảm giá, số lượng và tổng tiền đúng quy tắc. |
| BH02 | Khách đặt đơn hợp lệ | Có một đơn, đủ chi tiết và thông tin nhận hàng, trả đúng mã đơn. |
| BH03 | Giá bị sửa ở phía trình duyệt | Máy chủ vẫn dùng giá từ dữ liệu sản phẩm. |
| BH04 | Giỏ thay đổi tồn trước checkout | Từ chối hoặc xử lý đúng số lượng theo quy tắc; không sinh đơn dở dang. |
| BH05 | Sản phẩm ngừng hiển thị | Không được đặt sản phẩm không còn được phép bán trên website. |
| BH06 | Số lượng 0, âm, lẻ hoặc vượt giới hạn | Yêu cầu không hợp lệ bị từ chối. |
| BH07 | Gửi lại cùng mã yêu cầu | Không sinh thêm đơn. |
| BH08 | Hai khách mua phần tồn cuối | Tổng lượng được chấp nhận không vượt số lượng khả dụng. |
| BH09 | Lỗi ở giữa transaction | Các thay đổi được hoàn tác, không còn bản ghi rời rạc. |
| BH10 | SMTP lỗi sau khi ghi đơn | Đơn vẫn tồn tại, trạng thái email phản ánh lỗi. |
| BH11 | Khách xem đơn/giỏ người khác | API từ chối truy cập hoặc không trả dữ liệu trái quyền. |
| BH12 | Nhân viên gọi API ngoài quyền | API chặn đúng chức vụ, không chỉ ẩn menu. |
| BH13 | Đơn website đi qua xuất kho và hóa đơn | Dữ liệu và trạng thái liên quan nhất quán. |
| BH14 | Thu một phần và thu hết nợ | Số thu và số dư nợ đúng; không thu vượt quy tắc. |
| BH15 | Đơn không hoàn thành | Trạng thái và tồn khả dụng cập nhật đúng đặc tả. |
| BH16 | Lọc khoảng ngày và nhiều trạng thái | Bảng, tổng hợp và bản in khớp tập dữ liệu được lọc. |
| BH17 | Tồn bằng/ngắn hơn ngưỡng riêng | Cảnh báo theo đúng ngưỡng của sản phẩm. |
| BH18 | Đổi giá sản phẩm sau khi đã đặt | Chi tiết lưu tại thời điểm đặt được đối soát, không tự đổi ngoài quy tắc. |

## 8. Đoạn nội dung có thể sử dụng khi viết đề cương

### Mục tiêu tổng quát

Xây dựng và đánh giá hệ thống quản lý bán hàng tích hợp đặt hàng trực tuyến tại Công ty Javi Coffee, hỗ trợ tiếp nhận và xử lý đơn hàng từ khách hàng và nhân viên bán hàng trên nguồn dữ liệu dùng chung, liên kết với tồn kho, hóa đơn, thanh toán và công nợ để phục vụ tác nghiệp và theo dõi hoạt động bán hàng.

### Mục tiêu cụ thể

1. Phân tích quy trình bán hàng, vai trò tham gia, quy tắc dữ liệu và điều kiện chuyển trạng thái của đơn hàng.
2. Hoàn thiện luồng khách lựa chọn sản phẩm, quản lý giỏ hàng, nhập thông tin giao nhận và đặt hàng trực tuyến.
3. Kiểm soát giá, số lượng khả dụng, yêu cầu lặp và tính nhất quán khi ghi nhận đơn hàng tại máy chủ.
4. Liên kết đơn từ các kênh tiếp nhận với xử lý nội bộ, xuất kho, hóa đơn, thanh toán, công nợ và thông báo xác nhận.
5. Kiểm thử chức năng, phân quyền và đối soát dữ liệu để đánh giá mức độ đáp ứng yêu cầu trong môi trường triển khai thử nghiệm.

### Phạm vi bán hàng

Đề tài tập trung vào bán hàng tại quầy và đặt hàng trực tuyến tại Javi Coffee, từ lựa chọn sản phẩm, lập đơn và kiểm tra số lượng khả dụng đến theo dõi xử lý đơn, xuất hàng, hóa đơn, thanh toán, công nợ và báo cáo bán hàng. Các dữ liệu kho và chứng từ liên quan được sử dụng để hỗ trợ quy trình bán hàng; không mở rộng thành hệ thống quản trị sản xuất, mua hàng, nhân sự hoặc kế toán tổng hợp. Ghi nhận chuyển khoản và thông tin giao nhận không đồng nghĩa đã tích hợp tự động với ngân hàng hoặc đơn vị vận chuyển.

### Nội dung kế thừa và phát triển

Khóa luận kế thừa nền tảng quản lý bán hàng nội bộ đã xây dựng trong THNN, gồm dữ liệu sản phẩm, khách hàng, đơn hàng, kho, hóa đơn và công nợ. Trên nền tảng đó, đề tài tập trung hoàn thiện kênh đặt hàng trực tuyến, liên kết đơn với xử lý nội bộ, kiểm soát dữ liệu tại máy chủ và đánh giá bằng các kịch bản kiểm thử. Đóng góp được xác định qua mức độ hoàn chỉnh và tính đúng đắn của luồng bán hàng, thay vì xem toàn bộ chức năng kế thừa là phát triển mới.

## 9. Những nội dung chưa được đưa thành kết quả đã đạt

- Chuyển giao diện sang React hoặc Next.js.
- Chatbot, AI dự báo bán hàng hoặc đề xuất nhập hàng.
- Cổng thanh toán, tự động nhận biến động số dư và gạch nợ ngân hàng.
- Tạo vận đơn và đồng bộ trạng thái trực tiếp từ hãng vận chuyển.
- Hóa đơn điện tử có kết nối cơ quan thuế.
- Xuất Excel/CSV đầy đủ trên tất cả các báo cáo.
- Hiệu quả tiết kiệm thời gian, tỷ lệ giảm lỗi hoặc năng lực chịu tải khi chưa có dữ liệu đo.
- Vận hành thực tế tại doanh nghiệp nếu mới chạy thử trong môi trường phát triển.

## 10. Danh sách tài liệu và mã nguồn dùng để đối chiếu

- Báo cáo nguồn: `C:/Users/admin/Downloads/MÔN CHUYÊN NGÀNH/THNN/07_NguyenMinhThu_2321004094/Báo cáo/07_NguyenMinhThu_2321004094.docx`.
- Các mục báo cáo đã đối chiếu: Giới thiệu; mục tiêu; nội dung; đối tượng và phạm vi; phương pháp; yêu cầu; mô hình dữ liệu; giới thiệu sản phẩm; kết luận, hạn chế và hướng phát triển.
- Mã nguồn hiện tại: các đường dẫn tương đối trong ghi chú được tính từ thư mục `duan_html`.
- Chưa thực hiện trong lần rà soát này: chạy giao dịch trên SQL Server, gửi email thật, đăng nhập Google thật, kiểm thử tải hoặc đo hiệu quả sử dụng tại doanh nghiệp.
