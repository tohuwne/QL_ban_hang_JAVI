# Đặc tả yêu cầu hệ thống JAVI COFFEE

Phiên bản 2.27 — cập nhật 25/10/2026.

## Yêu cầu đã chốt

- HT-01: Khách hàng và quản trị chạy bằng hai server, hai tiến trình và hai cổng riêng. Mặc định khách hàng 3000, quản trị 3001; cấu hình bằng USER_PORT và ADMIN_PORT. Có thể chạy chung bằng npm start hoặc chạy từng server.
- KH-01: Khách vào địa chỉ gốc được mở thẳng trang mua sắm, không cần đăng nhập để xem cửa hàng và sản phẩm.
- KH-02: Không hiển thị nút hoặc liên kết Trang Admin trên thanh điều hướng cửa hàng khách hàng. Nhân viên truy cập cổng quản trị riêng.
- KH-03: Khi chưa đăng nhập, nút tài khoản trên thanh điều hướng cửa hàng hiển thị “Đăng nhập/ Đăng ký” và dẫn tới trang đăng nhập/đăng ký hiện có.
- KH-04: Khi chưa đăng nhập, bấm liên kết giỏ hàng hoặc nút Thêm vào giỏ hàng tại trang chi tiết phải mở popup thông báo chưa đăng nhập, có hai nút Đăng nhập và Đăng ký. Popup có nút đóng, tiếp tục xem sản phẩm, hỗ trợ Escape; không tự chuyển trang trước khi người dùng chọn. Liên kết đăng ký mở đúng chế độ đăng ký; đăng nhập từ giỏ quay lại giỏ hàng, từ chi tiết quay lại đúng sản phẩm. Icon trên thẻ sản phẩm chuyển tới chi tiết theo KH-06, chưa ghi giỏ hoặc yêu cầu đăng nhập.
- KH-06: Mỗi thẻ sản phẩm có icon giỏ hàng; bấm ảnh, tên, phần nội dung thẻ hoặc icon mở trang HTML chi tiết thay cho popup sản phẩm. Dùng chung một mẫu HTML cho toàn bộ sản phẩm, mỗi sản phẩm có URL riêng dạng /san-pham/CFH31.html theo mã sản phẩm. Trang cho xem không cần đăng nhập, có thông tin, ảnh, giá, trạng thái tồn, số lượng và các tùy chọn áp dụng; chỉ ghi giỏ khi bấm Thêm vào giỏ hàng hoặc Mua ngay tại chi tiết theo KH-07. Mở trực tiếp, tải lại, quay lại trình duyệt và chia sẻ URL phải hoạt động. Sản phẩm ẩn/không tồn tại phải báo không tìm thấy và không cho mua. Đồng bộ giao diện tối/vàng và màn hình nhỏ.
- KH-07: Trang chi tiết có hai nút Thêm vào giỏ hàng và Mua ngay. Cả hai yêu cầu tài khoản khách hàng và mở popup đăng nhập/đăng ký nếu chưa đăng nhập. Mua ngay tự thêm sản phẩm với gram, loại xay, số lượng đang chọn vào giỏ, sau đó mở trang giỏ và chỉ tick đúng dòng vừa thêm/cộng dồn theo MaGH do server trả về. Nếu đã có cùng tổ hợp tài khoản + sản phẩm + gram + loại xay thì cộng số lượng theo GH-01; các dòng khác giữ nguyên và không được tự tick trong lần mở này. Khách tiếp tục bấm Thanh toán từ giỏ theo luồng hiện có. Không còn luồng thanh toán trực tiếp tách khỏi giỏ. Khi thiếu cấu hình hoặc hết tồn, cả hai nút không cho mua.
- KH-08: Bỏ dòng Tổng trọng lượng, lời giải thích cách chia túi và hai nút Tiếp tục mua sắm/Xem giỏ hàng phía dưới trang chi tiết. Giữ số lượng, tùy chọn và thành tiền. Thêm mục Mô tả sản phẩm riêng dưới khối mua hàng, lấy nội dung MoTa trong WEB_SAN_PHAM của đúng MaSP; hiển thị xuống dòng và văn bản an toàn, không dựng nội dung HTML từ database. Khi chưa có mô tả hiển thị “Mô tả đang được cập nhật.”
- GD-03: Khi API thêm giỏ thành công, ảnh sản phẩm thu nhỏ bay về icon giỏ, icon nhấn nhẹ và số lượng giỏ được cập nhật, kèm toast nhỏ ở góc trên bên phải (tự ẩn, có nút đóng, đồng bộ tối/vàng); với Mua ngay toast hiện sau khi tới giỏ. Nếu icon ngoài vùng nhìn thì dùng dấu giỏ tạm ở mép màn hình làm điểm đến. Không chạy hiệu ứng thành công khi yêu cầu lỗi/chưa đăng nhập, không ghi trùng khi bấm liên tục; tôn trọng thiết lập giảm chuyển động và dọn phần tử hiệu ứng sau khi chạy.
- KH-05: Khu sản phẩm có tiêu đề ngắn, nổi bật và đặt sát thanh chọn loại; bỏ lời hướng dẫn dài và liên kết Góc cà phê khỏi khu tiêu đề. Thanh chọn loại không hiển thị badge số lượng; mục được chọn có nền vàng nhẹ, viền và chữ tương phản rõ. Luôn sắp xếp nhóm Máy pha trước các nhóm Cà phê, sau đó các nhóm còn lại, Sản phẩm khác cuối cùng; áp dụng cả thanh chọn loại và các khu sản phẩm, kể cả khi tìm kiếm hoặc đổi sắp xếp. Máy pha và cà phê không bị gộp vào nhóm khác vì ít sản phẩm.
- GD-02: Popup yêu cầu đăng nhập dùng icon tài khoản nhỏ, bỏ dòng thương hiệu/chào hỏi in hoa và dấu chấm giữa các cụm chữ. Nội dung ngắn gọn, thân thiện: “Đăng nhập hoặc đăng ký để tiếp tục mua sắm.”
- GD-01: Popup khách hàng và các popup quản trị (xác nhận, thông báo, hồ sơ, khung nghiệp vụ) dùng giao diện đồng bộ tông tối/vàng, viền tinh tế, bo góc, bóng đổ và nền mờ; hỗ trợ màn hình nhỏ và giảm chuyển động. Giữ nguyên nghiệp vụ, quyền và cách bố trí drawer quản trị.
- DN-01: Chỉ trang đăng nhập khách hàng có nút Quay lại mua sắm. Trang đăng nhập nhân viên trên cổng quản trị (mặc định 3001) không hiển thị nút này, kể cả khi URL có from=shop. Nhân viên mở cổng quản trị sẽ vào đăng nhập trước; API nghiệp vụ yêu cầu đăng nhập và phân quyền.
- DH-03: Thống kê quản lý bán hàng giữ Tổng cộng và các trạng thái đơn; thay thống kê thanh toán bằng Đơn nhân viên (đơn do nhân viên lập, gồm dữ liệu cũ không có nguồn website) và Đơn khách đặt (nguồn Website/Online). Mỗi đơn thuộc đúng một nhóm nguồn; hai nhóm cộng bằng Tổng cộng, thống kê theo tập đơn sau bộ lọc báo cáo đang áp dụng. Giữ bộ lọc và cột trạng thái thanh toán hiện có.
- DH-01: Đơn khách đặt được lưu vào SQL Server dùng chung và xuất hiện trong danh sách đơn quản trị khi tải/làm mới. Giữ kiểm tra giá, tồn kho, giao dịch và chống trùng hiện có; không tạo cơ sở dữ liệu riêng cho từng cổng.
- DN-02: Trang/API đăng nhập trên server khách hàng (mặc định 3000) chỉ chấp nhận tài khoản KHACH_HANG có MaKH, không gắn MaNV. Admin/nhân viên bị từ chối với thông báo “Không tìm thấy tài khoản.”, không cấp token hoặc lưu phiên khách hàng. Server quản trị (mặc định 3001) tiếp tục nhận admin/nhân viên và từ chối tài khoản khách hàng. Ngữ cảnh đăng nhập xác định bởi server, không tin loginMode/URL do client gửi. Áp dụng kiểm tra tài khoản cho cả đăng nhập mật khẩu và tài khoản Google đã liên kết; giữ kiểm tra mật khẩu và khóa nhân viên hiện có. Việc xem sản phẩm công khai vẫn theo KH-01.
- QT-01: Đọc toàn bộ đặc tả trước mỗi lần sửa chức năng/phân hệ. Khi người dùng chốt chức năng hoặc thay đổi yêu cầu, cập nhật nội dung nghiệp vụ, tiêu chí nghiệm thu và nhật ký trong file này cùng lần sửa mã nguồn; sửa chữa thuần giao diện không đưa vào đặc tả. Không tự đưa đề xuất chưa chốt vào phần đã chốt.

## Cà phê, cấu hình và dòng hàng — đã chốt 19/10/2026

- CF-01: Dữ liệu mẫu bán cà phê gồm bốn sản phẩm: Đậm mạnh, Đậm ngọt, Cân bằng, Thơm ngọt; một loại Cà phê, không chia rang hạt/rang xay. Đơn vị giá và tồn kho cơ sở là 100g (TrongLuong sản phẩm 0,10 kg). Giá quy đổi từ bộ mẫu 1kg tương ứng: 39.500, 49.500, 64.500, 99.500 đồng/100g.
- CF-02: Hai danh mục cấu hình Loại xay và Trọng lượng, có thứ tự và trạng thái hoạt động. Mẫu ban đầu: Nguyên hạt, Xay sẵn pha máy, Xay sẵn pha phin; 200g, 500g, 1kg, 2kg. Trọng lượng là số nguyên dương chia hết cho 100. Mục đã sử dụng được ngừng sử dụng, không xóa phá dữ liệu.
- CF-08: Thẻ cà phê trên danh sách sản phẩm khách hàng chỉ hiển thị khoảng giá thấp nhất–cao nhất, tính từ giá cơ sở và các trọng lượng hoạt động được gắn với loại sản phẩm đó; không hiển thị giá mỗi 100g hay đơn vị gram cạnh giá trên thẻ. Khoảng giá ứng với số lượng 1, không nhân số lượng khách mua. Nếu chỉ có một mức giá thì hiển thị một giá; chưa tải được hoặc chưa có cấu hình trọng lượng thì hiển thị “Chưa có giá”, vẫn cho xem sản phẩm. Sản phẩm không áp dụng tùy chọn giữ giá đơn.
- CF-06: Danh mục Trọng lượng và Loại xay có hai màn hình riêng trong menu Danh mục; mỗi màn hình quản lý danh sách, thêm/sửa, thứ tự và trạng thái của chính danh mục đó. Trang Loại sản phẩm chỉ cấu hình checkbox áp dụng và gắn các lựa chọn từ hai danh mục, không chứa trình quản lý danh mục.
- CF-07: Bộ lọc/dropdown/badge sản phẩm lấy từ danh mục database, không giữ danh mục Cà phê Hạt/Xay cố định. Menu Danh mục phải mở được và mọi liên kết con đều truy cập được. Cửa hàng tải sản phẩm độc lập với trạng thái đăng nhập và lỗi tải tùy chọn; sản phẩm yêu cầu tùy chọn vẫn phải có cấu hình hợp lệ để thêm giỏ.
- CF-03: Loại sản phẩm có duy nhất checkbox Cho phép chọn trọng lượng và loại xay (BIT 1/0). Khi bật phải gắn ít nhất một trọng lượng và một loại xay hoạt động; khách bắt buộc chọn cả hai. Khi tắt không áp dụng tùy chọn. Giá cơ sở là mỗi 100g; khách vẫn chọn đồng thời trọng lượng và số lượng. Số lượng nhân mức gram đã chọn, không quy định số túi. Ví dụ 500g × 2 là tổng 1kg; cửa hàng tự quyết định cách chia túi. Trang chi tiết hiển thị thành tiền theo lựa chọn; ẩn tổng trọng lượng và lời giải thích đóng túi theo KH-08.
- GH-01: Giỏ hàng kiểm tra chính xác theo Tài khoản + MaSP + TrongLuongGram + LoaiXay. Cùng tổ hợp thì cộng dồn số lượng nguyên tử, khác trọng lượng hoặc loại xay thì tách thành nhiều dòng cùng sản phẩm. MaGH định danh thao tác sửa/xóa/chọn từng dòng. Sản phẩm thông thường không có trọng lượng/loại xay, gộp theo tài khoản và sản phẩm.
- DH-02: Chi tiết đơn có mã dòng riêng MaCTDH; lưu LoaiXay dạng chuỗi, TrongLuongGram đã chọn, số lượng và đơn giá đã chốt. Không dùng (MaDH,MaSP) làm khóa chính. Đơn website giữ bản chụp tên, lựa chọn và giá để không đổi theo danh mục sau này.
- CF-04: Hệ số tính từ trọng lượng/100, không lưu cột hệ số dư thừa. Giá theo mức gram = giá cơ sở × hệ số; thành tiền = giá theo mức gram × số lượng. Tổng lượng giữ chỗ/trừ/hoàn kho của các dòng cùng sản phẩm phải cộng lại theo đơn vị 100g. Máy pha và sản phẩm thường vẫn dùng số chiếc/đơn vị.
- CF-05: Đồng bộ tùy chọn qua cửa hàng, giỏ, báo giá, đặt hàng, chi tiết quản trị, chứng từ/email và tồn kho. Backend lấy giá và cấu hình hợp lệ từ database, không tin giá/hệ số từ trình duyệt. Theo chốt bổ sung của người dùng: sửa trực tiếp CREATE TABLE và INSERT dữ liệu mẫu trong database.sql để người dùng tự chạy tạo lại database; không dùng lệnh gộp hay migration và không áp dụng lên database hiện tại.

## Bán hàng tại quầy — đã chốt 19/10/2026

- POS-06: Mã giảm giá tại POS là lựa chọn thêm, tách riêng giảm giá thủ công. Bấm Chọn mã giảm giá mở popup, tìm và tick nhiều mã, bỏ chọn hoặc áp dụng; đóng/Hủy giữ lựa chọn đã áp dụng trước đó. Trang POS chỉ hiển thị số mã và tổng tiền giảm. Server kiểm tra từng mã theo thời hạn, lượt dùng, loại khách, sản phẩm và đơn tối thiểu; chỉ kết hợp khi tất cả mã đã bật Cho phép kết hợp. Khi đang chọn đúng một mã và chọn mã khác xung đột điều kiện áp dụng đồng thời, tự thay bằng mã mới, không cảnh báo. Khi đang chọn từ hai mã và chọn thêm mã không áp dụng đồng thời, giữ nguyên tập mã và báo xung đột. Popup có liên kết Điều kiện cho từng mã, cho xem mức giảm/tối đa/đơn tối thiểu, loại khách/sản phẩm áp dụng, thời hạn, lượt còn lại và điều kiện áp dụng đồng thời; xem/đóng điều kiện không đổi mã đang chọn. Tối đa 20 mã khác nhau, không nhận mã trùng. Tính trên số tiền còn lại sau giảm món/chiết khấu KH/giảm thủ công, lần lượt theo mã tăng dần; mỗi mã chỉ trừ phần giá trị còn lại của các sản phẩm hợp lệ. Đổi khách, sản phẩm, số lượng hoặc giảm thủ công phải áp dụng lại trước khi lưu. Lưu từng mã và tiền giảm vào WEB_AP_DUNG_MA với khóa (MaDH,MaGiamGia), theo dõi lượt mỗi mã; lưu/sửa đơn trong giao dịch, lỗi mã hoặc hết lượt phải rollback. Mở sửa đơn khôi phục đầy đủ các mã đã lưu. Sửa trực tiếp CREATE TABLE trong database.sql, không tự áp dụng thay đổi cấu trúc lên database đang dùng.
- POS-01: Khi chọn sản phẩm có áp dụng trọng lượng/loại xay trong POS, mở popup ở chính giữa viewport, có nền mờ và giao diện tối/vàng đồng bộ quản trị. Chọn trọng lượng, loại xay và số lượng ngay trong popup; hiển thị đơn giá và thành tiền. Lựa chọn lấy từ danh mục database, không hardcode các mức. Thêm số lượng đã chọn, cộng dồn cùng sản phẩm/gram/loại xay, khác lựa chọn tách dòng. Hủy, nút đóng, Escape hoặc bấm nền ngoài không thêm hàng. Chặn mở nhiều popup khi bấm liên tục.
- POS-02: Kiểm tra lượng còn có thể thêm theo tổng các dòng cùng sản phẩm và lượng giữ chỗ được hoàn lại khi sửa đơn; số lượng nguyên 1–999 và mỗi dòng sau cộng dồn không quá 999. Không thêm vượt tồn. Sản phẩm thường tiếp tục thêm trực tiếp một đơn vị. Giữ nguyên kiểm tra giá, giảm giá và tồn tại backend.
- POS-03: Giữ bố cục POS hai cột như trước: danh mục sản phẩm bên trái; đơn hàng hiện tại và thanh toán chung cột bên phải. Tối ưu khoảng trống, chiều cao thẻ/dòng, đặt các trường thanh toán gọn bên dưới danh sách để nhìn thấy nhiều nội dung hơn và hạn chế phải cuộn; không tách thanh toán thành cột thứ ba. Vùng hàng đã chọn có diện tích đủ rộng/cao và cuộn riêng, tên/tùy chọn/đơn giá/số lượng/giảm từng món/thành tiền rõ ràng. Tổng cần trả và nút lưu tách khỏi vùng cuộn của các trường giảm giá, không bị đẩy mất khi thêm hàng. Dùng cỡ chữ, màu sắc, nút và trường nhập theo hệ thống quản trị. Màn hình nhỏ chuyển bố cục phù hợp, không tràn ngang hay che nút lưu. Giữ nghiệp vụ chọn/thêm khách, lọc sản phẩm, sửa/xóa dòng, chiết khấu khách, giảm thêm, mã giảm giá, trạng thái, lưu/hủy và sửa đơn cũ.

## Đồng bộ giao diện và giỏ hàng — chốt 20/10/2026

- GH-02: Giỏ hàng khách hàng sắp xếp theo lần cập nhật mới nhất xuống cũ nhất. Thêm mới, thêm trùng tổ hợp hoặc sửa số lượng phải đưa đúng dòng vừa cập nhật lên đầu, đồng thời cập nhật số lượng. Giữ MaGH và quy tắc gộp GH-01; không tạo dòng trùng khi tăng số lượng. Nếu các thao tác gần nhau thì thứ tự vẫn xác định được.
- GD-04: Icon trong các phân hệ, tiêu đề, nút và sidebar quản trị cùng trang đăng nhập dùng thống nhất một bộ Bootstrap Icons (bộ icon Bootstrap 5) lưu trong tài nguyên nội bộ /vendor/bootstrap-icons; không dùng song song Font Awesome/Remix Icon, không phụ thuộc CDN. (Điều chỉnh 24/10/2026.)
- GD-05: Chi tiết bán hàng/đơn hàng và công nợ dùng cùng mẫu drawer thông tin, bảng dữ liệu và nút với nhập/xuất/tồn/thu/chi/hóa đơn. Mở chi tiết có trạng thái tải/lỗi rõ, không giữ dữ liệu cũ khi đổi đơn; dữ liệu lỗi/thiếu không làm hỏng form.
- GD-06: Tất cả form nghiệp vụ/chi tiết quản trị cố định header và footer; chỉ vùng nội dung cuộn. Footer nút luôn ở trong form gốc để giữ submit/validation, không đổi nghiệp vụ. Bảng nội dung không tạo thêm vùng cuộn dọc lồng nhau. Popup cà phê vẫn ở giữa màn hình.
- GD-07: Các toast cùng khung kích thước 420×80px trên máy tính, thu hẹp theo màn hình nhỏ; nội dung gọn, hơi dài theo chiều ngang, không chiếm khối lớn. Nội dung dài vẫn đọc được, có đóng và tự ẩn; đồng bộ kích thước giữa khách hàng và quản trị, giữ màu trạng thái.
- POS-04: Thu gọn thêm chiều cao dòng hàng đã chọn trong POS (khoảng cách, tên/tùy chọn, đơn giá, giảm giá và số lượng), giữ đủ thông tin và thao tác, bố cục hai cột POS-03 không đổi.

## Các yêu cầu bổ sung đã chốt ngày 20/10/2026

- POS-05: POS tìm khách hàng chỉ bằng mã khách hoặc số điện thoại đầy đủ, xác nhận bằng Enter. Ô tìm tách khỏi các trường tên, loại khách, số điện thoại và địa chỉ hiển thị riêng. Không tìm theo tên hoặc tự chọn khi mới gõ. Không tìm thấy thì báo dưới ô, không tự mở form thêm khách. Nhập lại phải bỏ khách đang chọn và tính lại chiết khấu; chỉ chọn lại sau Enter thành công. Số điện thoại trùng nhiều khách yêu cầu dùng mã khách. Giữ thêm khách chủ động và chế độ sửa đơn. Bỏ lời hướng dẫn dài trong trạng thái giỏ POS trống.
- GD-08: Sidebar thu gọn chỉ hiển thị icon, ẩn toàn bộ submenu kể cả nhóm đang active. Khi mở rộng bằng chuột hoặc bàn phím, menu Kho, Thu–Chi và các nhóm khác hiển thị đầy đủ liên kết con, không cắt chữ.
- KHO-01: Xuất kho dùng hàng nút lọc trạng thái có badge số phiếu và trạng thái chọn rõ; bỏ dropdown trạng thái khỏi bộ lọc phía trên. Nút áp dụng trực tiếp và kết hợp khoảng ngày đã bấm Xem; badge tính theo khoảng ngày. Giữ các hành động chuyển trạng thái, giới hạn chuyển tất cả như nghiệp vụ cũ.
- KHO-02: Header lưới tồn kho bám đúng mép trên vùng cuộn, không nằm đè giữa các dòng hoặc để dữ liệu trượt trên header.
- GD-09: Chi tiết phiếu nhập là mẫu chung cho chi tiết bán hàng, nhập/xuất/tồn, thu/chi/hóa đơn/công nợ: có Thông tin chung; có Danh sách sản phẩm khi chứng từ có dữ liệu sản phẩm. Trường không có dữ liệu phải ẩn cả nhãn lẫn giá trị; giữ giá trị 0 có ý nghĩa. Chứng từ không có sản phẩm không dựng phần sản phẩm trống. Giữ các phần riêng theo nghiệp vụ như hóa đơn công nợ, thanh toán, địa chỉ giao hàng và tổng tiền; tiếp tục cố định header/footer theo GD-06.
- GD-10: Thanh phân trang các lưới quản trị thống nhất chiều cao 34px, nút 26px, thông tin gọn và đọc được, không đổi số dòng/trang hay bộ lọc.
- GD-11: Lưới có nút nghiệp vụ đặt cột thao tác ở cuối bên phải, cố định khi cuộn ngang, có nền tối đục và nằm trên dữ liệu phía dưới. Chừa đủ chiều rộng để thao tác không bị cắt. Khi mở chi tiết từ dòng, footer phải có đúng các thao tác khả dụng của dòng đó (ví dụ Thu nợ); dòng không có thao tác thì không hiện nút tương ứng. Dùng cùng xử lý/điều kiện/quyền như nút gốc, không tự mở rộng quyền hoặc bỏ bước xác nhận.
- GD-12 (21/10/2026): Nền cột thao tác cố định khớp với nền hàng/header của lưới, kể cả hover, vẫn đục để che nội dung cuộn phía dưới. Thu nợ dùng nút icon bàn tay nhận tiền, không hiện chữ trên nút; có title và aria-label “Thu nợ”. Áp dụng đồng bộ ở lưới hóa đơn, danh sách hóa đơn công nợ và nút tương ứng trong chi tiết; giữ nguyên điều kiện còn nợ và thao tác mở phiếu thu.
- GD-13 (21/10/2026): Cột cố định vừa đủ nút, không nhận phần chiều rộng dư khi lưới giãn theo màn hình. Cột icon Thu nợ hóa đơn rộng 56px cho nút 30px; khoảng rộng còn lại dành cho các cột dữ liệu. Không có bóng đổ hoặc hiệu ứng nổi ở cột cố định, hòa vào lưới; chỉ che nội dung cuộn phía dưới khi nhiều cột. Cột có nhiều nút vẫn phải đủ chỗ, không cắt nút.
- GD-14 (21/10/2026): Trả nợ nhà cung cấp ở nhập kho dùng icon chuyển tiền, có title/aria-label “Trả nợ”, đồng bộ kích thước/phong cách Thu nợ. Giữ điều kiện còn nợ, đường dẫn mở phiếu chi đúng mã phiếu nhập và nút trong chi tiết. Rà toàn bộ lưới quản trị: chiều rộng cột thao tác đo theo hàng nút rộng nhất trong toàn bộ dữ liệu, kể cả dòng nằm ở trang khác/đang bị lọc; không hardcode 160px hoặc 270px. Khi dữ liệu, nút hay font đổi phải tính lại nếu cần; lọc/đổi trang không cắt nút hoặc làm mất thao tác. Bảng chỉ có một icon 30px dùng cột 56px.
- DK-01 (21/10/2026): Luồng đăng ký tài khoản khách hàng gồm 3 bước bảo mật độc lập: Bước 1 nhập thông tin cá nhân cơ bản (Họ và tên, Số điện thoại, Email, Tên đăng nhập và Địa chỉ tùy chọn), bấm Tiếp tục để kiểm tra tính hợp lệ và gọi API kiểm tra chống trùng lặp tên đăng nhập / số điện thoại trước khi sang bước tiếp theo; Bước 2 thiết lập mật khẩu và xác nhận lại mật khẩu (yêu cầu tối thiểu 6 ký tự, hai mật khẩu phải trùng khớp 100%, có thanh hiển thị độ mạnh), có nút Quay lại để sửa thông tin bước 1 và nút Tiếp tục để chuyển sang bước 3; Bước 3 xác thực OTP trước khi tạo tài khoản, hỗ trợ nhận mã OTP qua Email (gửi qua dịch vụ thư điện tử hệ thống) hoặc qua Số điện thoại (sẵn sàng tích hợp Firebase Phone Auth qua User/Frontend/js/firebase-config.js), nhập đúng mã xác thực OTP 6 số mới hoàn tất tạo tài khoản KHACH_HANG trong SQL Server; đăng ký hoàn tất tự động đăng nhập phiên khách hàng và điều hướng an toàn.

## Thanh toán và sửa lỗi kiểm thử — chốt 22/10/2026

- TT-01 (điều chỉnh 25/10/2026): Đặt đơn COD hợp lệ thì tự động: đơn xuất hiện trong danh sách đơn quản trị, lập hóa đơn Chưa thanh toán (kèm công nợ bằng tổng tiền do server tính) và gửi ngay một email “đơn hàng đã đặt thành công”. Kế toán thu nợ sau đó (một phần hoặc trả đủ) không gửi thêm email đơn. Đơn chuyển khoản chỉ gửi email khi thanh toán QR thành công (TT-02). OTP đăng ký là email xác thực riêng. Gửi lại/yêu cầu trùng không sinh thêm email cho cùng đơn; lỗi gửi thư không làm mất đơn/hóa đơn/giao dịch thanh toán đã lưu.
- TT-02 (điều chỉnh 25/10/2026): Đặt đơn chuyển khoản lưu đơn Chờ giao, chưa lập hóa đơn, rồi chuyển khách tới trang thanh toán VietQR. Server gọi API VietQR /v2/generate với acqId (BIN ngân hàng tra từ tên/mã/BIN cấu hình website), accountNo, accountName, amount = tổng tiền server tính, addInfo = nội dung chuyển khoản duy nhất “JAVI MaDH xxxxxx”, template compact2; lưu ảnh QR trả về và hiển thị cho khách cùng số tiền, nội dung, tài khoản nhận. Không dựa vào số tiền/cờ thanh toán từ client.
- TT-03 (25/10/2026): Mã QR có thời hạn (mặc định 5 phút, VIETQR_EXPIRE_MINUTES 1–60) với đồng hồ đếm ngược. Hết hạn: ảnh bị làm mờ, ẩn Tải mã QR, vô hiệu nút thanh toán, hiện icon Làm mới mã; làm mới tạo mã mới và đánh dấu mã cũ Hết hạn. Còn hạn thì mở lại trang dùng lại đúng mã đang chờ. Nút “Thanh toán thành công” là giả lập demo cho mã đang hiển thị (thay callback ngân hàng thật, chưa tích hợp): server kiểm tra mã thuộc đơn của khách, đang Chờ thanh toán và còn hạn, rồi trong một giao dịch lập hóa đơn Đã thanh toán (Chuyển khoản), phiếu thu đã thu đủ, đánh dấu mã Đã thanh toán gắn MaPT, và chuyển khách sang trang đặt hàng thành công; sau đó gửi email theo TT-01. Mã đã thanh toán (kể cả ảnh khách đã tải về) bị từ chối khi xác nhận lại; đơn đã thanh toán không tạo mã mới. Mã QR đã thanh toán được lưu (WEB_THANH_TOAN_QR) và hiển thị trong chi tiết đơn quản trị kèm nội dung, tài khoản nhận, số tiền, thời điểm, phiếu thu.
- DK-02: Đăng ký bằng mật khẩu bắt buộc OTP email còn hạn, đúng mã và chưa dùng; bỏ otpType, khai phone hoặc gửi skipOtpCheck không được tạo KH/tài khoản/token. Chặn thử sai quá 5 lần; không lộ mã khi SMTP lỗi; chế độ mã thử chỉ bật rõ ràng trong môi trường phát triển/kiểm thử. OTP được tiêu thụ sau khi tạo tài khoản thành công, tránh hai yêu cầu dùng cùng mã. Tạm ngừng xác thực số điện thoại theo yêu cầu, để phát triển sau. Phải kiểm tra lại trùng tài khoản/SĐT trong giao dịch đăng ký, không chỉ dựa bước 1.
- NV-01: Tạo/sửa hồ sơ nhân viên và tài khoản liên kết là một giao dịch; trùng account hoặc lỗi ghi phải rollback toàn bộ. Màn hình sửa tài khoản lưu đúng tên đăng nhập/mật khẩu được nhập; để trống mật khẩu giữ mật khẩu cũ, không tạo account mới thiếu mật khẩu; không tự xóa account khi bỏ trống tên.
- KH-09: Thêm/sửa khách hàng phải kiểm tra trùng số điện thoại nhất quán, sửa được chính hồ sơ giữ nguyên số; không cho nhận số của khách khác. Liên kết hồ sơ sale với account web thực hiện theo KH-10, không ghép chỉ dựa trên SĐT.
- KHO-03: Tạo phiếu xuất phải nhận ngày YYYY-MM-DD hợp lệ và lưu được bằng driver SQL hiện tại. Luồng hiện xử lý toàn đơn trên một phiếu; không tạo phiếu thứ hai cho đơn đã có phiếu, giao lại dùng phiếu cũ. Kiểm tra cả API và cấu trúc database.sql; không tự sửa database đang dùng theo CF-05.
- KHO-04: Backend kiểm tra chuyển trạng thái giống UI: Chờ lấy hàng/Đang xử lý → Đang giao hàng hoặc Hủy xuất kho; Đang giao hàng → Đã giao hàng/Giao thành công hoặc Giao hàng không thành công; Giao hàng không thành công → Chờ lấy hàng hoặc Hủy xuất kho. Đã giao/Hủy là kết thúc, không quay lùi. Gửi lại cùng trạng thái không trừ/hoàn kho lặp. Áp dụng cho một phiếu và hàng loạt, khóa đồng thời trong giao dịch; mã phiếu không có trả Không tìm thấy, không báo thành công giả. Trigger trong database.sql bảo vệ trạng thái tương tự.
- KHO-05: Chi tiết/in phiếu xuất đơn website dùng người nhận, số điện thoại, email, địa chỉ và ghi chú giao hàng lưu trên đơn, không lấy thay bằng địa chỉ hồ sơ KH. Danh sách và thống kê đơn luôn một dòng mỗi MaDH dù dữ liệu cũ có nhiều PX/HĐ.

## Đăng ký dùng lại hồ sơ khách — chốt điều chỉnh 22/10/2026

- KH-10: Giữ một bảng KHACH_HANG. Đăng ký bắt buộc email, SĐT hợp lệ và OTP gửi tới email người dùng nhập; chuẩn hóa +84/0 khi so khớp SĐT. OTP đúng, còn hạn, chưa dùng mới ghi dữ liệu. Google đăng ký mới cũng cần OTP email đúng email Google đã được server xác minh.
- KH-11: Nếu SĐT khớp duy nhất một KH chưa có tài khoản, tạo account trỏ về MaKH cũ và cập nhật TenKH, EmailKH, SoDTKH, DiaChiKH theo form đăng ký, kể cả email mới khác/trống trên hồ sơ cũ. Địa chỉ không nhập lưu chuỗi rỗng. Không đổi MaLoaiKH/chiết khấu, giới tính, chứng từ, chủ đơn hoặc công nợ. OTP xác minh email nhập, chưa xác minh quyền sở hữu số điện thoại.
- KH-12: Không có SĐT trùng thì tạo KH và account mới. Nếu nhiều KH cùng SĐT hoặc KH đã có account thì báo lỗi, không ghi đè, không tạo account thứ hai. Cập nhật KH và tạo account trong cùng giao dịch, lỗi bất kỳ phải rollback; OTP tiêu thụ sau commit.
- KH-13: Bỏ toàn bộ màn hình/API/hàng chờ duyệt liên kết. Khách đăng ký thành công đăng nhập và xem đơn theo MaKH như hiện có. Bảng yêu cầu cũ trên DB hiện tại chỉ giữ lịch sử, không còn API truy cập hay xử lý; bản database.sql mới không tạo hàng chờ. Ràng buộc chống account trùng của Q10 tiếp tục giữ. Hai account cũ cùng KH000001 chưa bị sửa/xóa.

## Nội dung cửa hàng — chốt 22/10/2026

- WEB-01: Trang mua hàng có mục Khách hàng & đối tác, hiển thị tên, lĩnh vực, ảnh, mô tả, trạng thái Đã trải nghiệm/Đang sử dụng và nguồn tham khảo nếu có. Nội dung giới thiệu độc lập với hồ sơ KHACH_HANG nghiệp vụ, không công khai dữ liệu mua hàng cá nhân. Quản trị được thêm/sửa/bỏ mục, bật/tắt hiển thị và sắp xếp. Chỉ xác nhận Đang sử dụng khi quản trị có thông tin; nội dung tham khảo ban đầu ghi Đã trải nghiệm và có nguồn.
- WEB-02: Góc JAVI chia Bài truyền thông và Tin tức; có liên kết trực tiếp tới từng nhóm, tìm kiếm trong nhóm. Các chuyên mục cũ được giữ và xếp trong Tin tức; bài Nháp/chưa tới ngày đăng không công khai. Quản trị chọn được hai chuyên mục mới khi viết/sửa bài.
- WEB-03: Banner đầu trang mua hàng có bốn ảnh, tự chuyển vòng mỗi 5 giây; chọn trực tiếp, trước/sau và tạm dừng được. Tạm ngừng khi hover, focus, tab ẩn; tôn trọng giảm chuyển động. Hai banner mới dùng ảnh cà phê đã duyệt.
- DB-WEB: Bổ sung riêng WEB_NOI_DUNG và nội dung mẫu lên DB dùng chung bằng nâng cấp cộng thêm sau sao lưu, giữ hồ sơ/chứng từ hiện có; không chạy lại database.sql trên DB đang dùng.

## Xóa các dòng giỏ hàng đã chọn — chốt 22/10/2026

- GH-03: Giỏ hàng có nút Xóa các mục đã chọn, vô hiệu khi chưa chọn dòng. Xác nhận trước khi xóa; Hủy/Escape giữ giỏ. Backend xóa nguyên tử đúng tập MaGH của tài khoản đang đăng nhập, giữ các dòng không chọn và mọi giỏ tài khoản khác. Tải lại số lượng giỏ, lựa chọn và tổng tiền sau thành công; chặn gửi lặp.

## Nội dung báo chí chính thống — chốt 22/10/2026

- WEB-04: Bổ sung các bài báo về máy pha JAVI, tiến sĩ Nguyễn Bá Hải và thông tin vinh danh vào Bài truyền thông của Góc JAVI. Chỉ đưa nội dung đã xác minh từ cơ quan báo chí, tóm tắt biên soạn ngắn, có tên nguồn, ngày đăng gốc và liên kết đọc đầy đủ; không sao chép toàn văn. Giữ năm danh hiệu khác với ngày bài báo công bố; không biến danh hiệu cá nhân thành chứng nhận sản phẩm. Nội dung/giá/kế hoạch lịch sử không trình bày như thông tin thương mại hiện tại.

- WEB-05: Thẻ Tin tức/Bài truyền thông có liên kết nguồn báo HTTPS mở trực tiếp bài gốc trong tab mới, giữ cửa hàng ở tab hiện tại, có rel noopener noreferrer. Bài không có nguồn báo mở bài nội bộ như hiện có; không mở URL giao thức không an toàn.

## Thanh công cụ danh sách quản trị — chốt 23/10/2026

- GD-15: Màn hình danh sách quản trị có card thống kê mặc định ẩn; icon Dashboard bấm để hiện/ẩn các card phía trên. Thứ tự từ trên xuống: tiêu đề “Quản lý…” (cùng khối người dùng) → hàng nút thao tác theo thứ tự Thêm/Lập (nút chính), Nhập file (trang được phép nhập), Xuất file, icon Dashboard → thanh tìm kiếm + các trường bộ lọc + nút Xem kéo dài hết chiều ngang, thẳng mép với hàng nút phía trên. Nhập file và Xuất file là hai nút riêng, không gộp trong menu thả xuống. Tìm kiếm áp dụng ngay khi gõ trên mọi cột hiển thị của các dòng đã tải, không phân biệt dấu/hoa thường, kết hợp với bộ lọc đã bấm Xem và nút trạng thái hiện có; Xuất file và phân trang theo kết quả đang hiển thị. Trang đã có ô tìm riêng giữ ô đó. Người dùng kéo mép phải từng trường bộ lọc/tìm kiếm (hoặc phím mũi tên khi focus) để đổi độ rộng; trình duyệt nhớ theo từng trang, nhấp đúp về mặc định. Bỏ hàng lọc nhanh theo cột trong header bảng. (Điều chỉnh bố cục 24/10/2026.)
- GD-16 (24/10/2026): Cổng quản trị có chế độ sáng và tối. Nút sáng/tối đặt cạnh khối người dùng trên header mọi màn hình quản trị (kể cả POS); bấm đổi ngay toàn bộ sidebar, lưới, bộ lọc, drawer, popup mà không tải lại trang. Lựa chọn lưu trên trình duyệt và áp dụng ngay khi mở trang khác/tải lại trong phiên, không nháy giao diện cũ. Mặc định tối: mỗi lần đăng nhập thành công vào trang Admin bắt đầu ở chế độ tối, bỏ lựa chọn sáng của lần trước. Chữ, nhãn trạng thái và nút đều đọc rõ trên cả hai nền; không đổi nghiệp vụ, quyền hay dữ liệu.
- GD-17 (24/10/2026): Sidebar quản trị có nút ghim (icon ghim) hiện khi menu mở rộng. Khi ghim, menu luôn mở rộng kèm nhãn và submenu, không tự thu gọn khi rời chuột; nội dung chính và drawer nghiệp vụ dịch sang phải theo bề rộng menu, không bị che. Bỏ ghim trở lại hành vi thu gọn/mở khi hover của GD-08. Trạng thái ghim lưu trên trình duyệt; màn hình ≤ 900px luôn dùng menu thu gọn để không chiếm chỗ nội dung.
- GD-18 (24/10/2026): Thanh tìm kiếm + bộ lọc trên màn hình danh sách đóng/mở được bằng nút icon bộ lọc ở cuối hàng nút thao tác; thu gọn chỉ ẩn thanh, giữ nguyên giá trị lọc và kết quả đang áp dụng. Trạng thái đóng/mở lưu trên trình duyệt theo từng trang. Hàng nút Thêm/Nhập file/Xuất file/Dashboard/bộ lọc canh phải.

## Bán hàng: thao tác dòng và chi tiết — chốt 24/10/2026

- DH-04: Lưới Quản lý bán hàng đặt mọi thao tác ở cột nút cố định cuối dòng: Chỉnh sửa và Xóa (đơn nhân viên lập, chưa lập hóa đơn và chưa có phiếu xuất; đơn khách đặt website không sửa/xóa), Lập hóa đơn (đơn chưa lập hóa đơn), Xuất kho (đơn Chờ giao chưa có phiếu xuất). Cột Thanh toán chỉ hiển thị nhãn trạng thái, không chứa nút. Chỉnh sửa mở POS ở chế độ sửa đơn hiện có; Xóa giữ bước xác nhận.
- DH-05: Double-click một dòng bán hàng luôn chỉ mở form xem chi tiết, không mở sửa đơn. Footer chi tiết có các nút thao tác nhanh đúng bằng các nút khả dụng của dòng đó (cùng điều kiện, cùng xử lý, cùng xác nhận) cùng Đóng và In.
- DH-06: Chi tiết đơn hàng và chi tiết hóa đơn có mục Thông tin khách hàng: mã KH, tên, số điện thoại, email, loại khách hàng, địa chỉ lấy từ hồ sơ KHACH_HANG của đơn; trường trống được ẩn, không có khách thì hiển thị Khách lẻ/không có thông tin. Thông tin giao hàng của đơn website giữ riêng theo KHO-05.

## Phạm vi chưa chốt

- Thanh toán không tài khoản chưa được chốt. Giỏ hàng và thêm sản phẩm yêu cầu tài khoản theo KH-04; KH-01 áp dụng cho việc vào xem cửa hàng.
- Chưa yêu cầu cập nhật đơn thời gian thực; quản trị tải/làm mới danh sách để thấy đơn mới.

## Quyết định triển khai

Mỗi giao diện gọi /api trên chính cổng của mình. Hai server dùng chung DB_SERVER và DB_NAME. USER_ORIGIN cấu hình địa chỉ mua sắm khi chuyển từ quản trị, mặc định http://localhost:3000. Phiên trình duyệt tách theo cổng, không chuyển token qua URL.

## Tiêu chí nghiệm thu

1. npm start mở hai server trên hai cổng khác nhau; có lệnh chạy riêng từng server.
2. Khách chưa đăng nhập mở được cửa hàng từ địa chỉ gốc.
3. Địa chỉ gốc quản trị dẫn đến đăng nhập nhân viên.
4. Nút quay lại mua sắm hiện và hoạt động ở đăng nhập khách hàng; bị ẩn ở cổng nhân viên, kể cả khi có from=shop.
5. Cổng khách không phục vụ API quản trị; API quản trị kiểm tra xác thực và quyền.
6. Đặt đơn bằng tài khoản khách, tải danh sách đơn quản trị và đối chiếu mã đơn, chi tiết, tổng tiền, nguồn Website.

7. Thanh điều hướng cửa hàng không có nút Trang Admin, vẫn có tài khoản và giỏ hàng.

8. Khi chưa đăng nhập, thanh điều hướng hiển thị “Đăng nhập/ Đăng ký”, bao gồm nhãn hỗ trợ truy cập.

9. Khách chưa đăng nhập bấm giỏ hàng (header/footer) hoặc thêm vào giỏ tại chi tiết sẽ thấy popup với hai lựa chọn đăng nhập, đăng ký; đóng popup ở lại trang và không ghi giỏ hàng. Bấm icon giỏ trên thẻ vẫn mở chi tiết công khai.
10. Người đã đăng nhập tiếp tục thao tác giỏ như hiện có. Popup quản trị giữ các thao tác xác nhận/hủy và bố cục nghiệp vụ, đồng bộ phong cách; xác nhận hỗ trợ Escape và bàn phím.

11. Popup đăng nhập không có dòng “JAVI COFFEE · CHÀO BẠN”; dùng icon tài khoản và một câu hướng dẫn ngắn theo GD-02.

12. Thanh loại không có badge, mục đang chọn rõ ràng; Máy pha đứng trước Cà phê ở cả thanh điều hướng và danh sách, không thay đổi khi sắp xếp giá/tên hoặc tìm kiếm.

13. Thêm cùng tài khoản/sản phẩm/gram/loại xay hai lần chỉ có một dòng với số lượng cộng dồn; khác một tùy chọn thì tách dòng. Sửa/xóa/chọn thanh toán một dòng không ảnh hưởng dòng cùng sản phẩm khác.
14. Chọn 500g số lượng 2 và 200g số lượng 1 cùng cà phê giữ chỗ 12 đơn vị 100g, không quy định cách chia túi. Giá tính tại server, kiểm tra tồn theo tổng các dòng; giao/hủy hoàn đúng lượng.
15. Quản trị cấu hình danh mục và một checkbox, thiếu lựa chọn hoạt động phải bị từ chối. Đổi tên/tắt danh mục không làm thay đổi đơn cũ.

16. Menu Danh mục có hai liên kết Trọng lượng và Loại xay riêng, mở đúng trang và đánh dấu mục đang xem; Loại sản phẩm không còn khối quản lý chung.
17. Bộ lọc bán hàng admin hiển thị Cà phê (CAP) và chọn được sản phẩm; menu con không bị cắt hoặc tự đóng khi thao tác. Cửa hàng hiển thị được các sản phẩm khi chưa đăng nhập, kể cả khi API tùy chọn lỗi.
18. Với giá cơ sở 39.500 đồng/100g và các trọng lượng 200g, 500g, 1kg, 2kg, thẻ hiển thị “79.000 đ – 790.000 đ”, không có “/ 100g”. Đổi danh mục trọng lượng rồi tải lại cửa hàng phải cập nhật khoảng giá; trọng lượng của loại khác không ảnh hưởng. Một trọng lượng chỉ hiển thị một giá. Khoảng giá xuống dòng hợp lý trên màn hình nhỏ, không tràn thẻ.
19. Bấm thẻ hoặc icon giỏ ở cà phê và máy pha mở URL HTML riêng, không mở popup sản phẩm hoặc tự thêm giỏ. Truy cập trực tiếp/tải lại URL vẫn đúng sản phẩm; liên kết header/footer hoạt động ở URL lồng. Chọn 500g số lượng 2 tính giá cho 1kg nhưng không hiện dòng Tổng trọng lượng; thiếu cấu hình hoặc hết tồn không cho thêm. Đăng nhập từ chi tiết quay về đúng URL sản phẩm.
20. Khách chưa đăng nhập bấm Mua ngay thấy popup đăng nhập/đăng ký; khách đã đăng nhập chọn 500g × 1 thì giỏ tự thêm/cộng dồn và chỉ tick đúng dòng đó, bỏ tick mọi dòng khác kể cả cùng MaSP nhưng khác gram/loại xay. Nếu dòng này trước đó có số lượng 2 thì sau thao tác là 3; Thanh toán chỉ gửi MaGH đang tick. Thao tác thêm lỗi không chuyển trang/không hiện toast thành công; dòng vừa thêm không còn khả dụng thì không tự chọn sang dòng khác. Truy cập giỏ thông thường giữ cách chọn hiện có.
21. Trang chi tiết không còn các phần khoanh bỏ theo KH-08; mô tả lấy đúng nội dung database, không thực thi HTML/script và không bị lặp ở khối mua hàng. Thêm giỏ thành công chạy ảnh bay/thu nhỏ và cập nhật giỏ, lỗi không chạy; bấm liên tục chỉ gửi một yêu cầu tại một thời điểm. Màn hình nhỏ hiển thị hai nút rõ ràng, không tràn ngang.

22. POS chọn cà phê mở một popup giữa màn hình; 500g × 3 có đơn giá 197.500 đồng và thành tiền 592.500 đồng cho mẫu Đậm mạnh. Thêm lần nữa cùng lựa chọn cộng số lượng, khác loại xay tách dòng; hủy/Escape không thêm. Số lượng vượt tồn tổng giữa các dòng bị chặn, sản phẩm thường thêm trực tiếp.
23. POS trên máy tính giữ hai cột như cũ, danh sách hàng và trường thanh toán đọc rõ; khi thêm nhiều dòng, chỉ vùng danh sách cuộn và nút lưu/tổng cần trả vẫn thấy được. Popup và trang hoạt động trên màn hình nhỏ, không tràn ngang. Các nghiệp vụ chiết khấu/giảm giá/lưu/sửa đơn giữ kết quả hiện có.

24. Giỏ thêm A rồi B hiển thị B trước A; thêm trùng A hoặc sửa số lượng A đưa A lên đầu, giữ mã dòng và cập nhật đúng số lượng.
25. Các màn hình, nút, sidebar quản trị và trang đăng nhập hiển thị icon Bootstrap Icons, file font phục vụ nội bộ thành công; trang không còn tham chiếu Font Awesome/Remix Icon.
26. Chi tiết đơn hàng và công nợ hiển thị cùng phong cách chứng từ; khi nội dung dài, header/footer giữ nguyên vị trí và chỉ body cuộn, nút submit/đóng/in vẫn hoạt động. Lỗi tải đơn phải hiện trong form và không ghi đè dữ liệu của đơn mở sau.
27. Toast các trạng thái dùng cùng khung 420×80px, không tràn màn hình nhỏ; các dòng POS thấp hơn nhưng vẫn sửa số lượng/giảm món/xóa được.

28. Nhập mã KH hoặc SĐT rồi Enter ở POS điền đúng tên/loại/SĐT/địa chỉ; chưa Enter không chọn khách. Không tìm thấy báo dưới ô, không mở popup; đổi nội dung xóa khách cũ và chiết khấu cũ. SĐT trùng yêu cầu mã khách.
29. Rời sidebar khi đang ở trang con Kho/Thu–Chi không thấy chữ menu con bị cắt; mở rộng lại vẫn chọn được từng trang con.
30. Xuất kho có nút Tất cả và từng trạng thái kèm badge, lọc ngay đúng dòng và kết hợp khoảng ngày; bộ lọc trên không còn chọn trạng thái. Chuyển trạng thái không mất hành động cũ.
31. Cuộn dọc tồn kho không thấy dòng hàng nằm phía trên hoặc xuyên qua header.
32. Chi tiết nhập/xuất/đơn/hóa đơn có hai phần theo mẫu phiếu nhập; thu/chi không có bảng sản phẩm giả. Thiếu trường thì ẩn nhãn, tổng tiền 0 vẫn hiển thị; nút footer không cuộn mất.
33. Phân trang ở các lưới cao 34px, nút 26px; đổi trang/lọc vẫn đúng. Cuộn ngang vẫn thấy đủ nút ở cột cuối trên nền tối.
34. Hóa đơn còn nợ có Thu nợ trong chi tiết, mở đúng hóa đơn/số dư; hóa đơn đã thanh toán không có nút này. Chi tiết phiếu xuất có đúng các nút chuyển trạng thái của dòng, vẫn giữ xác nhận nghiệp vụ.
35. Cùng thông tin admin/nhân viên đúng mật khẩu: server khách trả 403 với thông báo “Không tìm thấy tài khoản.”, không có token; server admin đăng nhập thành công. Sửa/bỏ loginMode hoặc thêm mode=admin trên cổng khách không vượt được kiểm tra. Khách hàng đúng tài khoản vẫn đăng nhập cổng khách, bị từ chối ở cổng quản trị; mật khẩu sai vẫn trả 401, nhân viên bị khóa vẫn không đăng nhập được.
36. Cột thao tác không còn dải đen lệch màu so với lưới; Thu nợ chỉ hiện icon có chú thích và tên hỗ trợ truy cập. Bấm icon trên dòng hoặc trong chi tiết mở đúng phiếu thu; dòng đã thanh toán không xuất hiện icon.
37. Cột cố định hóa đơn giữ 56px ở các chiều rộng màn hình, icon nằm gọn trong ô; không bị giãn lớn khi có khoảng trống hoặc khi lọc chỉ còn vài dòng. Cuộn ngang vẫn giữ icon ở mép phải, nền đồng màu đục, box-shadow:none ở header và ô dữ liệu.
38. Nhập kho hiển thị Trả nợ bằng icon trong cột 56px, bấm mở đúng phiếu chi theo MaPN; chi tiết có cùng thao tác. Các lưới còn lại đủ chỗ cho toàn bộ nút trên dòng, gồm xuất kho có nhiều nút; kiểm tra cả trước/sau lọc, phân trang và cuộn ngang. Nền cột theo lưới và không đổ bóng.

39. Thống kê bán hàng không còn ô Đã thanh toán/Chưa thanh toán/Chưa lập HĐ; có Đơn nhân viên và Đơn khách đặt. Dữ liệu trộn Website/Online/nhân viên được đếm đúng, tổng hai nguồn bằng Tổng cộng; đổi khoảng ngày hoặc trạng thái báo cáo cập nhật đúng các số.

40. POS chọn đồng thời hai mã có cho phép kết hợp và áp dụng đúng tổng giảm; mã dùng riêng, hết hạn/lượt, sai loại khách/sản phẩm hoặc chưa đủ tiền bị từ chối. Đóng popup không đổi mã đã áp dụng; thay đổi đơn yêu cầu áp dụng lại. Lưu đơn có từng dòng mã, mở sửa khôi phục đủ và không đếm lặp lượt.

41. Chọn A rồi chọn B không thể áp dụng đồng thời tự chuyển sang B, không cảnh báo; chọn hai mã cho phép áp dụng đồng thời rồi chọn mã không áp dụng đồng thời giữ đúng hai mã và báo lỗi. Bấm Điều kiện không tick/bỏ tick mã; đóng điều kiện trở lại popup với lựa chọn cũ.
42. Đăng ký tài khoản khách hàng chia thành 3 bước độc lập: Bước 1 nhập thông tin và kiểm tra chống trùng lặp tên đăng nhập; Bước 2 nhập mật khẩu và xác nhận mật khẩu khớp (tối thiểu 6 ký tự); Bước 3 cho phép chọn xác thực OTP qua Email hoặc Số điện thoại (sẵn sàng tích hợp Firebase Phone Auth), nhập đúng mã OTP mới hoàn tất tạo tài khoản khách hàng trong SQL Server và lưu phiên đăng nhập.

43. Chuyển khoản website tạo đúng một đơn + một hóa đơn Đã thanh toán + một email sau thanh toán, tải lại thấy đúng trạng thái; giả tổng tiền/cờ trả tiền không vượt kiểm tra server. Callback ngân hàng thật chưa triển khai.
44. Đơn COD chưa có email; lập HĐ chưa thanh toán và trả một phần vẫn chưa gửi; thu đủ mới tạo/gửi một email. Worker/retry không gửi email đơn chưa thanh toán. Lỗi SMTP không rollback đơn/tiền đã lưu.
45. Đăng ký không OTP, bỏ otpType, khai phone, bật skipOtpCheck, OTP sai/hết hạn/dùng lại/sai quá 5 lần đều không tạo hồ sơ/tài khoản/token. Hai request dùng cùng OTP chỉ tối đa một account. SMTP lỗi không trả OTP ra client.
46. Tạo NV trùng account không tăng số hồ sơ; sửa account/mật khẩu đăng nhập được bằng thông tin mới; bỏ trống mật khẩu vẫn đăng nhập mật khẩu cũ. Sửa KH trùng SĐT khách khác bị chặn, giữ nguyên SĐT chính mình được.
47. Lưu PX bằng UI với ngày hợp lệ không lỗi kiểu dữ liệu; đơn đã có PX bị chặn tạo trùng, kể cả hai request đồng thời. Đơn không tồn tại hoặc không Chờ giao không tạo được PX.
48. Giao thất bại → giao lại → thành công chỉ trừ tồn thực một lần; hủy chỉ hoàn khả dụng một lần. Quay lùi từ đã giao/hủy, trạng thái tùy ý và mã PX không có bị từ chối ở API, kể cả chuyển hàng loạt.
49. Phiếu xuất web hiển thị đúng địa chỉ trên đơn khác địa chỉ hồ sơ; danh sách đơn không nhân đôi MaDH khi fixture dữ liệu cũ có nhiều phiếu.

50. Email và SĐT bắt buộc; không OTP/sai OTP/hết hạn không cập nhật KH hay tạo account. Đổi email sau khi nhận OTP phải xác thực lại email mới.
51. SĐT +84/0 khớp một KH chưa có account thì dùng lại MaKH, cập nhật đúng thông tin form, không tăng số KH; email khác/trống trên hồ sơ cũ vẫn đăng ký được sau OTP email mới. Giữ loại KH/chứng từ/công nợ.
52. KH đã có account hoặc SĐT khớp nhiều hồ sơ bị chặn, không đổi dữ liệu. Không còn màn hình/nút/API duyệt. Tạo KH mới và đăng nhập vẫn hoạt động; lỗi account rollback cập nhật hồ sơ.

53. Trang mua hàng tải đủ bốn banner/ảnh; chuyển 4 → 1, chọn từng ảnh và tạm dừng hoạt động, giảm chuyển động không tự chạy.
54. Mục khách hàng/đối tác chỉ hiển thị mục bật, đúng thứ tự; quản trị lưu thay đổi tải lại vẫn còn, ẩn/bỏ không công khai. API ghi yêu cầu quyền cấu hình website, kiểm tra URL/độ dài/thứ tự/trạng thái.
55. Góc JAVI mở đúng hai nhóm bằng URL; tìm trong nhóm; bài nháp không hiện; dữ liệu chuyên mục cũ được giữ. Nâng cấp không thay đổi số hồ sơ hoặc chứng từ.

56. Chọn một phần giỏ rồi xóa chỉ mất các dòng đã chọn; Hủy/Escape không xóa; chưa chọn thì nút vô hiệu. Gửi MaGH thuộc người khác không xóa được giỏ người khác; danh sách không hợp lệ bị từ chối.

57. Mục Bài truyền thông có đủ sáu bài đã xác minh từ VTV, VnExpress, Doanh Nhân Sài Gòn, Thanh Niên, Tiền Phong, VietNamNet; ngày đăng đúng nguồn, ảnh tải được, bài chi tiết dẫn tới nguồn gốc, admin sửa/ẩn được. Nạp lặp không sinh bài trùng slug, không ghi đè bài đã chỉnh sửa.

58. Bấm thẻ hoặc nút đọc của cả sáu bài báo mở đúng nguồn trong tab mới; bài viết nội bộ vẫn mở trang chi tiết. Bộ lọc và tìm kiếm giữ nguyên.

59. Trang có card (Đơn hàng, Công nợ, Nhập kho, Tồn kho) mở ra không thấy card; bấm icon Dashboard hiện card, bấm lại ẩn. Header bảng không còn ô/dropdown lọc theo cột. Gõ tìm kiếm lọc ngay các dòng, kết hợp khoảng ngày đã Xem; xóa ô tìm trả lại đúng tập theo bộ lọc. Kéo đổi độ rộng một trường giữ nguyên sau tải lại trang; nhấp đúp trả về mặc định.
60. Trang danh sách (Đơn hàng, Khách hàng…) hiển thị từ trên xuống: tiêu đề → hàng nút Thêm, Nhập file, Xuất file, icon Dashboard → thanh tìm kiếm/bộ lọc rộng hết chiều ngang, mép trái thẳng với hàng nút. Bấm Nhập file mở đúng trang nhập; Xuất file tải đúng dữ liệu đang lọc; trang không được nhập chỉ có Xuất file.
61. Bấm nút sáng/tối đổi ngay giao diện; tải lại/mở trang khác giữ lựa chọn. Ở chế độ sáng, lưới, bộ lọc, drawer, POS và nhãn trạng thái không còn nền tối hay chữ mờ khó đọc.
62. Bấm ghim: menu giữ mở rộng khi rời chuột, nội dung chính bắt đầu sau mép menu; tải lại vẫn ghim. Bỏ ghim trở lại thu gọn 76px. Màn hình ≤ 900px không bị menu ghim che nội dung.
63. Chọn chế độ sáng, đăng xuất rồi đăng nhập lại: trang Admin mở ở chế độ tối. Bấm icon bộ lọc ẩn/hiện thanh bộ lọc, tải lại giữ trạng thái; kết quả lọc không đổi khi thu gọn.
64. Đơn nhân viên chưa có HĐ/PX có Chỉnh sửa, Lập hóa đơn, Xóa (và Xuất kho nếu Chờ giao) ở cột cố định; đơn đã có HĐ hoặc PX không có Chỉnh sửa/Xóa. Double-click bất kỳ dòng chỉ mở chi tiết, footer có đúng các nút của dòng. Chi tiết đơn và hóa đơn hiển thị mã, tên, SĐT, email, loại khách, địa chỉ khách hàng.
65. Hóa đơn không còn card thống kê/icon Dashboard. Công nợ có bốn card Tổng tiền hóa đơn, Đã thu bằng tiền mặt, Đã thu chuyển khoản, Còn nợ phải thu, tính trên toàn bộ hóa đơn như trước; lập phiếu thu nợ xong các số được cập nhật.
66. Đặt COD: chuyển ngay trang thành công, một email đơn đã đặt được gửi; quản trị thấy đơn và hóa đơn Chưa thanh toán có công nợ; thu nợ sau đó không gửi email thứ hai. Đơn COD không tạo được mã QR.
67. Đặt chuyển khoản: chưa có hóa đơn/email; trang thanh toán hiển thị ảnh VietQR thật, đúng số tiền, nội dung, tài khoản và đồng hồ đếm ngược. Hết hạn ảnh mờ, ẩn tải mã, nút thanh toán vô hiệu, có Làm mới mã; xác nhận mã hết hạn bị từ chối (410). Bấm Thanh toán thành công chuyển trang thành công; quản trị có đúng một hóa đơn Đã thanh toán (Chuyển khoản), một phiếu thu đủ tiền, chi tiết đơn hiển thị ảnh QR đã thanh toán. Xác nhận lại cùng mã bị từ chối (409), không sinh thêm hóa đơn/phiếu thu/email.

## Nhật ký

- 25/10/2026: Chốt TT-01, TT-02 điều chỉnh và TT-03 theo yêu cầu luồng đặt hàng: COD gửi email đặt thành công và lập hóa đơn chưa thu; chuyển khoản tạo mã VietQR có thời hạn, làm mới khi hết hạn, nút giả lập Thanh toán thành công lập hóa đơn + phiếu thu, chặn dùng lại mã đã thanh toán, lưu mã QR và hiển thị trong chi tiết đơn quản trị. Thêm bảng WEB_THANH_TOAN_QR vào database.sql; database đang dùng cần thêm bảng này (chạy lại database.sql hoặc tạo riêng bảng).

- 24/10/2026: Chuyển bốn card thống kê tiền hóa đơn (tổng, đã thu tiền mặt/chuyển khoản, còn nợ phải thu) từ module Hóa đơn sang Công nợ; cách tính giữ nguyên, card vẫn ẩn mặc định theo GD-15.

- 24/10/2026: Chốt DH-04 đến DH-06 (nút Chỉnh sửa/Lập hóa đơn vào cột thao tác cố định, double-click chỉ xem chi tiết kèm thao tác nhanh, thông tin khách hàng trong chi tiết đơn/hóa đơn), GD-18 thu gọn thanh bộ lọc và điều chỉnh GD-16 về mặc định tối mỗi lần đăng nhập Admin. Kiểm chứng trên trình duyệt: lưới lịch sử sao lưu hiển thị lại, chi tiết DH000020/HD000020 có đủ thông tin khách, thu gọn bộ lọc lưu theo trang, đăng nhập lại về chế độ tối.

- 24/10/2026: Điều chỉnh GD-04 sang bộ Bootstrap Icons nội bộ cho toàn bộ quản trị và trang đăng nhập; điều chỉnh bố cục GD-15 (tiêu đề → nút Thêm/Nhập/Xuất/Dashboard → thanh bộ lọc kéo dài, tách Nhập file/Xuất file thành hai nút); chốt GD-16 chế độ sáng/tối và GD-17 ghim sidebar.

- 23/10/2026: Chốt GD-15: icon Dashboard bật/tắt card thống kê (mặc định ẩn), thanh tìm kiếm + bộ lọc + Xem cùng hàng nút thao tác, trường bộ lọc đổi được độ rộng, bỏ lọc nhanh theo cột trong bảng.

- 22/10/2026: Chốt WEB-05: đọc bài báo trực tiếp ở tab mới, giữ luồng bài nội bộ.

- 22/10/2026: Chốt WEB-04: tuyển chọn báo chính thống theo ảnh người dùng, bổ sung năm bản tóm tắt có ảnh và nguồn, giữ bài VTV đã có. Nguồn kiểm chứng lưu tại docs/data/BAI_BAO_JAVI.json.

- 22/10/2026: Chốt GH-03 theo ghi chú ảnh giỏ hàng: thêm xóa các mục được chọn sau xác nhận, giới hạn theo chủ giỏ.

- Kiểm chứng WEB ngày 22/10/2026: sao lưu BH_WEB2 trước nâng cấp; trước/sau giữ 22 KH, 15 account, 21 đơn, 21 HĐ. npm test đạt; kiểm thử API trên JAVI_COFFEE_TEST_FIXES_20261022 đạt cho quyền ghi, URL/trạng thái/thứ tự, lưu/ẩn/sắp xếp và khôi phục dữ liệu thử. Trình duyệt xác nhận bốn ảnh banner và bốn ảnh đối tác tải được, chuyển vòng 4 → 1, URL hai nhóm bài hiển thị đúng nội dung.

- 22/10/2026: Chốt WEB-01 đến WEB-03 và DB-WEB: thêm khách hàng/đối tác tham khảo mayphacafephin.com, hai nhóm Góc JAVI và bốn banner tự chuyển. Nội dung tham khảo có nguồn; không tự khẳng định quan hệ đang sử dụng.

- 22/10/2026: Người dùng thay Q10: bỏ duyệt liên kết, bắt buộc email/SĐT và OTP; trùng SĐT duy nhất thì dùng hồ sơ cũ và cập nhật thông tin form. Thay KH-10 đến KH-13 và tiêu chí 50–52; phiên bản 2.18 bên dưới là lịch sử đã được thay thế.

- 22/10/2026: Người dùng chốt Q10 theo phương án một hồ sơ KH. Triển khai xác minh email hồ sơ, hàng chờ quản lý duyệt, nhật ký và uniqueness tài khoản; nâng cấp riêng Q10 giữ dữ liệu theo DB-Q10.

- 22/10/2026: Chốt TT-01/TT-02, DK-02, NV-01, KH-09, KHO-03 đến KHO-05 theo yêu cầu sửa lỗi kiểm thử. Chỉ gửi email đơn sau thanh toán; tạm giả lập chuyển khoản thành công, hoãn callback ngân hàng và OTP SĐT. Q10 mới là đề xuất, chưa tự ghép hồ sơ hay tách bảng. Bàn giao schema trực tiếp trong database.sql, không áp dụng lên DB đang dùng.

- 21/10/2026: Nạp cấu hình Firebase dự án javi-coffee-a2560 vào User/Frontend/js/firebase-config.js; hoàn tất kết nối luồng xác thực Phone Auth qua Firebase SDK.

- 21/10/2026: Chốt DK-01; triển khai quy trình đăng ký tài khoản khách hàng 3 bước (Thông tin cơ bản -> Mật khẩu & xác nhận -> Xác thực OTP qua Email hoặc SĐT Firebase), kiểm tra trùng tài khoản và xác thực mã OTP trước khi tạo bản ghi khách hàng trong cơ sở dữ liệu.

- 21/10/2026: Điều chỉnh POS-06: đổi nhanh một mã xung đột, giữ lựa chọn và cảnh báo khi đang chọn nhiều mã; bổ sung xem Điều kiện từng mã, không đổi kiểm tra giá/lượt/kết hợp phía server.

- Kiểm chứng POS-06 ngày 21/10/2026 trên database thử riêng: lưu và cập nhật đơn 300.000đ, giảm thủ công 10.000đ, hai mã giảm 55.100đ, còn trả 234.900đ; SQL giữ đúng hai dòng mã và không nhân đôi sau cập nhật. Mở sửa khôi phục hai lựa chọn; mã dùng riêng bị chặn kết hợp. Database đang dùng chưa thay cấu trúc, khóa hiện tại một cột; cần người dùng chạy cấu trúc database.sql mới theo CF-05 trước khi dùng nhiều mã.

- 21/10/2026: Chốt POS-06; popup lựa chọn nhiều mã giảm giá tùy chọn tại POS, kiểm tra kết hợp phía server và lưu nhiều dòng mã trên đơn. Cấu trúc bàn giao trực tiếp trong database.sql theo chốt CF-05.

- 21/10/2026: Chốt DH-03; đổi thống kê thanh toán trên quản lý bán hàng sang số đơn theo nguồn nhân viên/khách đặt.

- 21/10/2026: Điều chỉnh DN-02: tài khoản admin/nhân viên đăng nhập ở cổng khách nhận “Không tìm thấy tài khoản.”; giữ nguyên chặn đăng nhập và không cấp phiên.

- Kiểm chứng GD-14 ngày 21/10/2026: rà 22 màn hình quản trị trên database thử, các lưới có nút đều không có nút vượt ra khỏi ô cố định. Nhập kho/hóa đơn đo 56px với icon 30px; sản phẩm 101px, danh mục 67–68px, xuất kho 260px cho hai nút và sao lưu 300px cho ba nút theo nội dung thực tế. Bấm Trả nợ từ dòng và từ chi tiết PN000016 đều mở phiếu chi đúng mã, chưa ghi phiếu chi. Cột giữ nền theo lưới và box-shadow:none. Sửa thêm kiểm tra cổng 3000 cũ ở trang sản phẩm để tuân HT-01, trang hoạt động trên server quản trị/cổng cấu hình. Kiểm tra cú pháp, tài nguyên, tải chi tiết và phân quyền đăng nhập đạt; vẫn giữ nguyên thư mục fe cũ đã ghi nhận. Lưu kết quả rà ở outputs/action-width-audit.json; không thay đổi dữ liệu database đang dùng.

- 21/10/2026: Chốt GD-14; đổi Trả nợ nhập kho sang icon và thay chiều rộng cột thao tác cố định bằng phép đo nội dung nút trên mọi dòng, bao gồm dòng bị lọc/phân trang. Giữ màu nền và không đổ bóng theo GD-12/GD-13.

- Kiểm chứng 21/10/2026: đăng nhập thật trên hai server thử xác nhận nhân viên bị trả 403 ở cổng khách dù giả loginMode=admin, đăng nhập được cổng quản trị; khách hàng chỉ đăng nhập được cổng khách. Kiểm thử mật khẩu/Google và chặn lưu phiên sai vai trò đạt. Trình duyệt đo cột thao tác hóa đơn 56px, icon 30px không có chữ, nền ô/header trùng lưới và box-shadow:none; bấm icon mở đúng HD000020/CN000003. Kiểm tra cú pháp/tài nguyên và tải chi tiết đạt. Đã nạp lại server 3000/3001, dọn database/server thử; không sửa dữ liệu database đang dùng.

- 21/10/2026: Chốt bổ sung GD-13: bỏ bóng đổ cột cố định, dùng nền cùng lưới và chỉ chồng che nội dung cuộn bên dưới.

- 21/10/2026: Chốt GD-13; thu cột icon hóa đơn còn 56px và loại cột thao tác khỏi phép chia chiều rộng dư của lưới.

- 21/10/2026: Chốt GD-12; đổi nền cột thao tác theo màu lưới/header/hover, chuyển Thu nợ sang nút icon có tooltip/aria-label, thu gọn cột thao tác hóa đơn và đồng bộ nút trong chi tiết.

- 21/10/2026: Chốt DN-02; giới hạn đăng nhập khách hàng theo vai trò tài khoản, lấy ngữ cảnh từ server, chặn cả phản hồi Google liên kết sai vai trò và thêm kiểm tra giao diện trước khi lưu phiên. Admin/nhân viên tiếp tục đăng nhập ở server quản trị.

- Kiểm chứng bổ sung ngày 20/10/2026: trình duyệt xác nhận tìm SĐT 0903111018 và mã KH000018 bằng Enter điền đủ thông tin; số không tồn tại báo dưới ô, không bật popup. Lưu thử đơn DH000021 trên database riêng với khách KH000018 và máy pha 19.900.000 đồng, đối chiếu database khớp. Sidebar rộng 76px khi thu gọn và cả ba submenu đều display:none sau khi chọn trang con; liên kết mở rộng vẫn hoạt động. Header tồn kho giữ sát mép vùng cuộn. Xuất kho lọc Chờ lấy hàng/Đang giao hàng đúng badge và dòng; chi tiết có Giao hàng/Hủy xuất theo dòng, trạng thái không bị ẩn nhầm. Hóa đơn còn nợ có Thu nợ, mở đúng HD000020/CN000003; hóa đơn đã thanh toán không có nút. Phiếu thu không có bảng sản phẩm giả; ghi chú NULL ẩn cả nhãn, footer giữ nút. Phân trang đo 34px; cột thao tác đứng yên khi cuộn ngang, nền tối đục và đủ chiều rộng nút. Kiểm tra cú pháp/tài nguyên, tìm khách, POS options, tải chi tiết và giá/giảm giá đạt; kiểm tra cấu trúc vẫn bỏ qua duy nhất ràng buộc thư mục fe cũ đã ghi nhận. Không sửa database đang dùng; dữ liệu và server thử được dọn sau kiểm chứng.

- 20/10/2026: Chốt POS-05, GD-08 đến GD-11, KHO-01/KHO-02 theo hai lượt yêu cầu bổ sung: tìm khách qua mã/SĐT + Enter, sửa submenu/sidebar và header tồn kho, nút trạng thái xuất kho, mẫu chi tiết linh hoạt theo phiếu nhập, phân trang gọn, cố định cột thao tác và đồng bộ nút nghiệp vụ từ dòng vào chi tiết.

- Kiểm chứng đồng bộ ngày 20/10/2026: kiểm thử SQL trên database thử riêng đạt cho thêm/cộng dồn/sửa giỏ đưa dòng lên đầu, giữ đúng MaGH và giá/tồn/đặt hàng. Trình duyệt xác nhận login nhân viên ẩn nút mua sắm cả khi có from=shop; icon nội bộ tải thành công; chi tiết đơn và công nợ mở được. Form thu nợ cuộn nội dung 68px nhưng header/footer giữ nguyên tọa độ; mẫu chi tiết nhập kho giữ nút in/đóng ở footer. Toast quản trị đo 420×80px, dòng POS khoảng 77px. Kiểm thử tải chi tiết chặn phản hồi cũ, giữ giá 0, an toàn văn bản và làm tròn phần trăm giảm giá đạt; không có lỗi console trong phiên kiểm tra. Kiểm tra cú pháp/tài nguyên và các bài kiểm thử nghiệp vụ riêng đạt; npm test nguyên chuỗi vẫn có chặn cấu trúc cũ do thư mục fe có sẵn, chưa xóa dữ liệu này. Hai server 3000/3001 đã được nạp lại; không thay đổi dữ liệu database đang dùng.

- 20/10/2026: Chốt GH-02, GD-04 đến GD-07, POS-04 và sửa DN-01 theo sáu yêu cầu mới: giỏ mới cập nhật lên đầu, bỏ quay lại mua sắm ở login nhân viên, lưu icon nội bộ, chuẩn hóa các drawer và header/footer cố định, khung toast thống nhất và dòng POS gọn hơn.

- Kiểm chứng POS ngày 20/10/2026: hoàn tất bố cục hai cột theo điều chỉnh mới. Trình duyệt 1440×900 có vùng hàng cao khoảng 405px và thanh toán khoảng 169px; 1366×768 vẫn thấy tổng tiền/nút lưu, không tràn ngang. Popup nằm giữa viewport trên máy tính và màn hình 390px, chọn 500g × 3 tính 592.500 đồng; cộng dồn/tách tùy chọn, Hủy/Escape, giới hạn tổng tồn và chống mở trùng đạt. Đã lưu đơn DH000021 trên database thử: cà phê 500g × 3, giá 197.500 đồng; giảm món 11% và giảm thêm 1.000 đồng được lưu đúng, tổng đơn khớp 20.426.325 đồng khi kèm máy pha. Kiểm tra POS options, giá/giảm giá và cú pháp/tài nguyên đạt. Database thử được dọn, không thay đổi database đang dùng.

- 19/10/2026: Theo điều chỉnh mới của người dùng, giữ bố cục POS hai cột cũ, bỏ phương án ba cột; làm gọn danh sách/thẻ sản phẩm và phần thanh toán để thấy nhiều hơn trong cùng màn hình. Giữ popup cà phê ở giữa với trọng lượng, loại xay và số lượng.

- 19/10/2026: Chốt POS-01 đến POS-03; làm lại bố cục POS, popup cà phê chọn trọng lượng/loại xay/số lượng ở giữa màn hình, mở rộng vùng hàng và tách khu thanh toán. Sửa đường dẫn bộ icon đang thiếu trên riêng màn hình POS. Không thay đổi cấu trúc hoặc dữ liệu database đang dùng.

- 19/10/2026: Thay thế luồng KH-07 theo chốt mới: Mua ngay thêm/cộng dồn vào giỏ rồi chỉ tick dòng server vừa trả về; bỏ thanh toán trực tiếp ngoài giỏ. Toast thêm giỏ thành công hiển thị nhỏ ở góc trên bên phải, có nút đóng và tự ẩn. Lịch sử kiểm chứng luồng trực tiếp bên dưới chỉ áp dụng phiên bản cũ.
- Kiểm chứng luồng giỏ mới ngày 19/10/2026: SQL trên database thử trả đúng MaGH cho cả thêm và cộng dồn; báo giá một dòng không lấy các lựa chọn khác. Trình duyệt có bốn dòng giỏ, Mua ngay 500g nguyên hạt số lượng 1 cộng dòng cũ từ 2 thành 3, chỉ tick dòng đó; ba dòng khác bỏ tick. Thanh toán chỉ hiển thị 500g nguyên hạt × 3, không lỗi JavaScript. Toast hiện góc phải trên với nút đóng; kiểm tra lựa chọn đã ẩn/hết tồn/không tồn tại không tự chọn dòng khác. Đã nạp lại hai server để tránh phân quyền/mã xử lý cũ; không thay đổi database đang dùng. Server và database thử đã được dọn.

- 19/10/2026: Chốt KH-07, KH-08 và GD-03; thêm Mua ngay theo lựa chọn độc lập với giỏ hiện có, bỏ các phần người dùng khoanh, đưa mô tả database vào mục riêng và thêm hiệu ứng thu nhỏ ảnh vào giỏ. Không thay đổi cấu trúc hoặc dữ liệu database đang dùng.
- Kiểm chứng KH-07/KH-08/GD-03 ngày 19/10/2026: kiểm thử SQL trên database thử riêng đạt cho mua ngay đúng số lượng, không sửa giỏ cũ, giá từ server, chặn lựa chọn giả/tồn thiếu và trừ kho chính xác; các giao dịch kiểm thử rollback. Trình duyệt xác nhận popup khách chưa đăng nhập, thêm 500g × 2 vào giỏ rồi mua ngay 500g × 1 chỉ thanh toán số lượng 1, giỏ vẫn là 2; hiệu ứng ảnh bay xuất hiện và được dọn sau thành công, không có lỗi JavaScript. Kiểm tra cú pháp/tài nguyên, giá/phí giao hàng/mã giảm giá và phân quyền đạt; bố cục máy tính/màn hình nhỏ không tràn ngang. Server và database thử được dọn sau kiểm tra.

- 19/10/2026: Chốt KH-06; thay popup sản phẩm bằng trang HTML dùng chung với URL riêng theo mã, icon giỏ trên thẻ dẫn tới chi tiết; cập nhật KH-04 và luồng quay lại sau đăng nhập. Ghi rõ chốt bổ sung: trọng lượng × số lượng là tổng lượng mua, cửa hàng tự chia túi.
- Kiểm chứng KH-06 ngày 19/10/2026: server kiểm tra riêng tải trực tiếp/tải lại trang cà phê và điều hướng icon sang trang máy pha thành công; không có dialog sản phẩm. Chọn 500g × 2 hiển thị tổng 1kg và 395.000 đồng; thêm giỏ khi chưa đăng nhập mở popup xác thực. Mã không tồn tại hiển thị lỗi, bố cục màn hình nhỏ không tràn ngang; kiểm tra cú pháp và liên kết tài nguyên đạt. Không thay đổi database.

- 19/10/2026: Chốt CF-08; đổi giá trên thẻ cà phê sang khoảng giá theo các trọng lượng đang cấu hình, bỏ đơn vị gram cạnh giá trên thẻ và bổ sung trạng thái khi chưa có cấu hình.

- 19/10/2026: Ghi nhận HT-01, KH-01, DN-01, DH-01, QT-01 theo yêu cầu người dùng; tách server và điều hướng, giữ dữ liệu đặt hàng dùng chung.

- 19/10/2026: Chốt KH-02; bỏ nút Trang Admin khỏi header dùng chung của giao diện khách hàng.

- 19/10/2026: Chốt KH-03; đổi nhãn nút tài khoản thành Đăng nhập/ Đăng ký.

- 19/10/2026: Chốt KH-04, GD-01; nối popup xác thực vào giỏ và thêm sản phẩm; làm mới giao diện popup khách hàng/quản trị.

- 19/10/2026: Chốt GD-02; giản lược icon, bỏ dòng chào có dấu chấm, rút gọn nội dung popup đăng nhập.

- 19/10/2026: Chốt KH-05; làm gọn khu tiêu đề, bỏ badge, tăng tương phản mục được chọn và cố định thứ tự Máy pha trước Cà phê.

- 19/10/2026: Chốt CF-01 đến CF-05, GH-01, DH-02; triển khai danh mục trọng lượng/loại xay, một checkbox áp dụng, giỏ gộp theo giá trị lựa chọn và dòng đơn riêng.

- 19/10/2026: Chốt cách bàn giao database.sql chứa trực tiếp cấu trúc và bộ dữ liệu mẫu mới, bỏ migration/gộp dữ liệu; người dùng tự chạy tạo lại database.

- Kiểm chứng 19/10/2026: database.sql chạy trực tiếp thành công trên database thử riêng; kiểm tra giỏ gộp/tách, sửa/xóa từng dòng, giá theo gram, đơn/chi tiết quản trị, trừ/hoàn kho khi giao/hủy đều đạt. Database đang dùng chưa được chạy lại theo yêu cầu người dùng.

- 19/10/2026: Chốt CF-06, CF-07; tách hai màn hình danh mục, đồng bộ lọc cà phê từ database và sửa các lỗi điều hướng/tải danh mục.

- Kiểm chứng bổ sung 19/10/2026: database đang dùng có CAP với 4 cà phê; API sản phẩm, loại sản phẩm, cấu hình và hai trang danh mục mới trả 200. Trình duyệt cửa hàng hiển thị 18 sản phẩm, trong đó 4 cà phê. Kiểm tra menu giữ focus và danh sách sản phẩm vẫn render khi API tùy chọn lỗi đều đạt.

