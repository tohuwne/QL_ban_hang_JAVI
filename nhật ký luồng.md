## Điều chỉnh Q10 — bỏ duyệt liên kết (22/10/2026)

- Theo yêu cầu mới: email + SĐT bắt buộc, OTP email trước khi ghi. Trùng duy nhất một SĐT chưa có account thì dùng lại MaKH và cập nhật tên/email/SĐT/địa chỉ đã nhập; giữ loại KH, giới tính, đơn và công nợ. Google đăng ký mới cũng qua OTP email.
- Đã xóa màn hình, nút và API duyệt. Không còn tạo hàng chờ; bảng yêu cầu cũ giữ làm lịch sử, không còn được ứng dụng đọc/xử lý. Không xóa dữ liệu nghiệp vụ.
- 19 assert HTTP/SQL trên DB thử đạt; npm test đạt.

---

## Triển khai Q10 — 22/10/2026

- Người dùng chốt phương án một hồ sơ KH, liên kết account web theo email cũ đã xác minh; khác/trống/mơ hồ chờ quản lý duyệt. Đã bổ sung màn hình Khách hàng → Yêu cầu liên kết tài khoản, phân quyền và nhật ký xử lý.
- Đã sao lưu và nâng cấp riêng Q10 trên BH_WEB2. Trước/sau: 22 KH, 15 account, 21 đơn, 21 hóa đơn; không ghép, xóa hay chuyển dữ liệu cũ. Biên bản backup/nâng cấp: outputs/q10/deployment.json.
- Ngoại lệ cũ KH000001 có enduser_demo và khachhang1: giữ nguyên quyền đăng nhập, không tạo thêm account cho hồ sơ này. Trigger chặn liên kết trùng mới; chưa có unique index trên DB cũ do ngoại lệ. database.sql mới dùng hồ sơ mẫu riêng KH000004 cho khachhang1 và tạo unique index từ đầu; đã tạo mới thành công DB thử JAVI_COFFEE_TEST_Q10_FRESH_20261022.
- Kiểm thử Q10 HTTP/SQL: 17 assert đạt trên JAVI_COFFEE_TEST_FIXES_20261022; đúng MaKH/tên gốc, không tăng KH, +84/0, không cấp token khi chờ, chặn sale/sai hồ sơ/duyệt lặp, duyệt đăng nhập được, từ chối xóa hash. UI đã mở bảng và form xác minh, không duyệt hồ sơ thật khi test.
- npm test đạt. Hai server 3000/3001 đã nạp mã mới. Google dùng chung nhánh liên kết với email xác minh phía server; chưa kiểm thử đăng nhập Google thực với nhà cung cấp trong đợt này. Chưa có UI gỡ liên kết nhầm; xử lý qua quản lý và hỗ trợ kỹ thuật sau xác minh, không tự chuyển nợ/chủ đơn.

---

# Nhật ký kiểm thử luồng JAVI COFFEE

## Cập nhật sau sửa lỗi — 22/10/2026

Phần nhật ký từ mục 1 trở xuống là kết quả **trước khi sửa**, được giữ để truy vết. Trạng thái hiện tại sau yêu cầu bổ sung của người dùng:

- Đặc tả đã lên **2.17**, bổ sung TT-01/TT-02, DK-02, NV-01, KH-09 và KHO-03–05 cùng tiêu chí nghiệm thu/nhật ký.
- Chỉ gửi email đơn khi đã thanh toán. CK website tạm giả lập thành công phía server và ghi hóa đơn Đã thanh toán trước email; callback ngân hàng hoãn. COD chưa trả/chỉ trả một phần không có email đơn; thu đủ mới gửi. SMTP lỗi không làm mất đơn/hóa đơn.
- **61/61 ca HTTP + SQL trên JAVI_COFFEE_TEST_FIXES_20261022 đạt**. Kết quả ở `tests/.artifacts/flow-fixes/results.json`, `summary.json`, `mail-*.eml`. Các nhánh xuất kho hiện chạy qua API tạo PX thật, không cần fixture SQL như đợt trước.
- `npm test` đạt; bổ sung hồi quy bắt buộc OTP, cờ bypass, mã dùng lại và quá số lần sai. SQL cà phê trên `JAVI_COFFEE_TEST_COFFEE_FIXES_20261022` đạt và rollback.

| Mục trước sửa | Trạng thái sau sửa / kiểm chứng |
|---|---|
| F01 OTP bypass | Đã sửa. Thiếu otpType/phone/skipOtpCheck bị từ chối; đăng ký kiểm tra mã và trùng dữ liệu trong transaction; SMTP lỗi không lộ mã; OTP SĐT tạm khóa |
| F02 tạo PX lỗi ngày | Đã sửa. API nhận ngày hợp lệ và CONVERT ở SQL; UI tạo thành công PX000025 cho DH000029 |
| F03 hồ sơ NV sót khi trùng account | Đã sửa. Hồ sơ/account cùng transaction, test COUNT trước/sau không đổi |
| F04 sửa account bị bỏ qua | Đã sửa. Username/password mới đăng nhập được; password trống giữ mật khẩu cũ; không tạo account thiếu mật khẩu |
| F05 sửa KH trùng SĐT | Đã sửa. Khóa/kiểm tra trong transaction và trả 409 |
| F06 địa chỉ giao website | Đã sửa. Chi tiết PX ưu tiên snapshot người nhận/SĐT/địa chỉ/email/ghi chú trên đơn web |
| F07 quay lùi, trừ kho hai lần | Đã sửa API một phiếu/hàng loạt và trigger trong database.sql. Giao thất bại→giao lại→thành công, gửi lặp, hủy lặp, quay lùi đều đã kiểm tra |
| F08 PX trùng / đơn nhân đôi | API khóa đơn và chặn PX thứ hai; database.sql thêm UNIQUE MaDH. Query đơn aggregate chọn PX/HĐ để dữ liệu cũ không nhân dòng; dropdown tạo PX bỏ đơn đã có PX |
| F09 PX không có báo thành công | Đã sửa, trả 404 |
| F10 schema DB nghiệp vụ cũ | Mã và database.sql đã hỗ trợ khóa nhiều mã POS như chốt trước. **Chưa thay PK/trigger/cấu trúc BH_WEB2**, vì CF-05 quy định bàn giao schema để người dùng tự chạy. DB thử mới kiểm chứng nhiều mã đạt. Không coi database cũ đã được nâng cấp |

Q01/Q02 đã chốt theo TT-01/TT-02. Q10: khuyến nghị giữ một bảng KHACH_HANG, account liên kết MaKH; không tách online/offline, không tự ghép theo SĐT tự khai. Chi tiết phương án và xác minh hồ sơ ở `docs/DE_XUAT_LIEN_KET_KHACH_HANG_Q10.md` (đề xuất, chưa áp dụng liên kết tự động).

Kiểm chứng UI: đăng nhập, chọn hàng/Mua ngay/giỏ/thanh toán và tạo PX thành công. Bước cuối bấm thanh toán CK trong trình duyệt bị bộ duyệt tự động chặn vì phân loại giao dịch tài chính, dù DB QA; đã đề nghị người dùng tự bấm để quan sát kết quả. Kiểm chứng API/SQL/SMTP giả lập của CK đã đạt trước lần chặn này. Không thử lách qua công cụ khác. Chưa kiểm chứng callback ngân hàng hoặc email đến hộp thư ngoài.

---

Ngày kiểm tra: **22/10/2026**. Đối chiếu đặc tả phiên bản 2.16 và mã nguồn hiện tại. Theo yêu cầu, không cập nhật file đặc tả; đợt này lập kịch bản, kiểm thử và ghi nhận, **chưa sửa mã nghiệp vụ**.

## 1. Môi trường và cách đọc kết quả

- Database nghiệp vụ `BH_WEB2`: chỉ đọc kiểm tra cấu trúc, không tạo tài khoản/đơn, không chạy lại database.sql.
- Database riêng `JAVI_COFFEE_TEST_FLOW_20261022`: nạp database.sql, tạo master data và giao dịch QA. Khách chạy cổng **3120**, admin **3121**. Tài khoản/sản phẩm trong báo cáo chỉ thuộc database này.
- Database mẫu sạch `JAVI_COFFEE_TEST_COFFEE_20261022`: chạy kiểm thử cà phê trong transaction rollback.
- Email: dùng SMTP tiếp nhận cục bộ tại 127.0.0.1:3126, có thực thi nodemailer và lưu thư `.eml`. `sent` chỉ chứng minh SMTP thử đã nhận thư; **chưa chứng minh thư tới Gmail/hộp thư ngoài thực tế**. Không dùng thông tin SMTP thật để gửi thư thử tới người khác.
- OTP qua số điện thoại: **bỏ qua theo yêu cầu**, không nghiệm thu Firebase trong đợt này.
- ĐẠT: có thực thi và đối chiếu kết quả cụ thể. LỖI: có bước tái hiện. BỊ CHẶN: bước trước lỗi nên không xem nhánh sau là đã đạt. RÀ MÃ: chỉ đọc source, chưa xác nhận bằng giao dịch. CẦN CHỐT: chưa tự coi là yêu cầu đã thống nhất.
- Bộ 50 ca HTTP độc lập: **40 đạt, 4 lỗi, 6 bị chặn**. Thêm 10 ca với fixture SQL: **3 đạt, 7 lỗi**; đây là kiểm tra thành phần, không phải 10 luồng E2E. Có 23 API đọc dữ liệu trả 200/success. Số ca không đồng nghĩa số lỗi độc lập.
- Không kết luận “tất cả hệ thống không còn lỗi”. Ma trận bên dưới ghi rõ phạm vi đã chạy và phần còn cần kiểm chứng.

## 2. Danh sách toàn bộ nhóm luồng hiện có

| Mã | Phân hệ / luồng hiện có | Các bước / nhánh chính | Mức kiểm tra đợt này |
|---|---|---|---|
| HT | Hai cổng, phiên và phân quyền | Khách xem công khai; đăng nhập khách/nhân viên; Google liên kết; khóa nhân viên; hết phiên; đăng xuất | HTTP đăng nhập thật, UI, test phân quyền; Google chỉ fixture |
| MD1 | Loại khách hàng | Thêm → sửa tên/chiết khấu → xóa khi chưa dùng; chặn xóa khi có liên kết | CRUD HTTP/SQL |
| MD2 | Khách hàng | Thêm/sửa/xóa; trùng SĐT; chọn khách trên POS; khách có công nợ | HTTP/SQL và UI POS; có lỗi khi sửa trùng SĐT |
| MD3 | Nhân viên, tài khoản | Thêm hồ sơ + cấp tài khoản → sửa → khóa/mở; đăng nhập theo chức vụ | HTTP/SQL; có lỗi giao dịch và trường tài khoản bị bỏ qua |
| MD4 | Nhà cung cấp | Thêm → sửa → xóa; chặn xóa khi có phiếu nhập | CRUD HTTP/SQL |
| MD5 | Trọng lượng / loại xay | Thêm/sửa/thứ tự/ngừng dùng; bảo vệ giá trị đã dùng; không tắt lựa chọn cuối | HTTP; test tùy chọn; không có API xóa trực tiếp |
| MD6 | Loại sản phẩm | Thêm/sửa/xóa; bật cấu hình trọng lượng + loại xay; bắt buộc gắn lựa chọn hoạt động | HTTP + test cà phê SQL |
| MD7 | Sản phẩm | Thêm/sửa/xóa; giá/tồn tối thiểu; hiển thị website, mô tả/ảnh | HTTP; thêm QA001 rồi nhập kho và dùng ở website/POS |
| MD8 | Mã giảm giá | Tạo/sửa/ngừng; thời hạn, lượt, loại KH/SP, tối thiểu/tối đa, kết hợp | HTTP tạo 2 mã; bộ test điều kiện; UI chọn và áp dụng lại |
| MD9 | Vận chuyển và địa điểm | Tỉnh/thành–phường/xã; phí theo vùng, ngưỡng miễn phí; địa chỉ lưu | API đọc, test tính phí; UI dùng địa chỉ đã lưu; chưa CRUD hết địa điểm |
| DK | Đăng ký khách | Thông tin → mật khẩu/xác nhận → OTP email → tạo KH/tài khoản/phiên | HTTP qua SMTP thử; UI form được mở; chưa chạy trọn 3 bước đăng ký bằng UI |
| WEB1 | Cửa hàng / chi tiết | Danh mục/tìm kiếm/sắp xếp; URL sản phẩm; hết hàng/ẩn; chọn gram/xay/số lượng | UI mua cà phê; test cấu hình và nguồn tài nguyên |
| WEB2 | Giỏ hàng | Thêm/gộp/tách dòng → tăng/giảm/xóa/chọn → Mua ngay chỉ chọn dòng vừa thêm | HTTP, SQL cà phê, UI 500g × 2 |
| WEB3 | Mã trên tài khoản / giỏ | Lưu mã → xem điều kiện → chọn/áp dụng → báo giá lại | HTTP + UI QA10; test quyền và điều kiện |
| WEB4 | Đặt hàng | Địa chỉ bắt buộc → phí/mã → COD/chuyển khoản → tạo đơn, giữ tồn, xóa dòng đã mua → mail | HTTP và UI tạo đơn thật trên DB QA; chưa có xác nhận thanh toán ngân hàng tự động |
| WEB5 | Tài khoản / lịch sử / email | Hồ sơ, số đơn, ví mã, danh sách đơn, chi tiết đúng chủ, xem email | Test account fixture + API; UI xem email; chưa thử mọi trang lịch sử bằng UI |
| POS1 | Sale nhập đơn | Chọn KH bằng mã/SĐT + Enter; thêm KH chủ động; chọn SP/cấu hình; sửa/xóa dòng | UI và HTTP; dùng account sale mới tạo |
| POS2 | Giá và ưu đãi POS | Giảm từng món → chiết khấu KH → giảm tổng VNĐ/% → một/nhiều mã → kiểm tra lại khi đổi đơn | HTTP/SQL và UI; số tiền lưu đã đối chiếu |
| POS3 | Giao ngay / giao sau | Hoàn thành tại quầy trừ tồn thực + khả dụng; giao sau giữ khả dụng; sửa/xóa khi chưa HĐ/PX | HTTP/SQL; UI lưu DH000032 giao sau |
| DH | Quản lý đơn | Nguồn Sale/Website; lọc, phân trang, thống kê; chi tiết; lập HĐ; chuyển lập PX | API + UI thấy DH000031/32; phát hiện nhân đôi dòng khi nhiều PX |
| NK | Nhập kho / tồn | NCC + SP + số lượng/giá → phiếu nhập/chi tiết → cộng kho; cảnh báo tồn | HTTP tạo nhập 100 QA001; API tồn/SP; test SQL cà phê |
| XK | Xuất kho / giao | Chờ lấy → đang giao → thành công; thất bại → giao lại hoặc hủy; lọc/badge/chuyển hàng loạt | Tạo PX lỗi cả HTTP/UI; nhánh chuyển trạng thái chạy riêng với fixture SQL |
| KT1 | Hóa đơn / công nợ | Lập HĐ đã/chưa thanh toán; trả trước một phần → công nợ; thu trực tiếp/FIFO → tất toán | HTTP tạo HĐ, trả trước 20.000 và tất toán; FIFO chưa chạy giao dịch riêng |
| KT2 | Chi tiền NCC | Phiếu nhập còn nợ → phiếu chi → cập nhật đã trả / trạng thái; xem/in | API danh sách; rà mã; chưa ghi phiếu chi trong đợt này |
| BC | Dashboard / báo cáo | Kỳ báo cáo, doanh thu/chi phí, tồn, bán chạy, hóa đơn gần đây; in | 4 API trả 200; UI dashboard; chưa nghiệm thu mọi kỳ/in/PDF |
| XL | Excel | Schema/template → tải file → preview lỗi theo ô → commit → export; nhiều phân hệ | npm test fixture import/XLSX đạt; chưa import/commit tất cả module trên UI |
| CMS | Nội dung website | Cấu hình SP, giới thiệu/ngân hàng, ảnh, bài viết nháp/xuất bản, hàng đợi email/thử gửi lại | API đọc/cấu hình SP; mail thật qua SMTP thử; blog/upload/retry chỉ rà mã |
| BK | Sao lưu / khôi phục | Thống kê/list → tạo/tải/upload/xóa bản sao → restore | Chỉ API GET và rà mã; chưa tạo/restore vì thư mục backup dùng chung |
| IN | In chứng từ | Đơn, HĐ, nhập/xuất, thu/chi, công nợ | Test tài nguyên/chi tiết; chưa in trực tiếp mọi loại chứng từ |

## 3. Kịch bản luồng 1 — master data dùng tiếp cho luồng 2/3

Thứ tự: đăng nhập quản lý → loại KH → KH → nhân viên sale/tài khoản → NCC → loại SP → SP → nhập kho → bật SP lên web → mã giảm giá. Tạo dữ liệu xóa riêng; không cố xóa hồ sơ đã có chứng từ.

| Ca | Thao tác / dữ liệu | Mong đợi | Kết quả |
|---|---|---|---|
| L1-01 | Loại SP QAT, sửa tên; tạo QA001 giá 100.000đ | Đọc lại đúng dữ liệu | Đạt |
| L1-02 | Loại KH Q01 chiết khấu 10%; KH000021 | POS chọn đúng và tính chiết khấu | Đạt |
| L1-03 | NCC000021, NV000021, account qa_sale_flow | Đăng nhập sale, không được xem API HĐ | Đạt |
| L1-04 | Khóa nhân viên rồi đăng nhập, sau đó mở khóa | Khóa bị từ chối 403; mở lại được | Đạt |
| L1-05 | Tạo NV khác nhưng trùng account sale | Toàn bộ giao dịch rollback | Lỗi F03: tăng số hồ sơ từ 21 lên 22 |
| L1-06 | Sửa hồ sơ NV kèm username/password mới | Không báo thành công nếu trường bị bỏ qua | API success nhưng account không đổi; F04, cần chốt chức năng sửa account |
| L1-07 | Tạo KH trùng SĐT; sửa KH thành SĐT đã thuộc KH khác | Cả hai phải kiểm tra trùng nhất quán | Tạo chặn; sửa lại nhận, F05 |
| L1-08 | Thêm/sửa/tắt loại xay và gram mới; gram 250; sửa gram đã dùng | Giá trị mới được lưu; gram không chia hết 100 bị chặn; bảo vệ giá trị đã dùng | Đạt |
| L1-09 | Nhập 100 QA001, giá nhập 50.000đ | Tồn thực = tồn KD = 100 | Đạt, phiếu nhập qua API/SP thật |
| L1-10 | Publish QA001; tạo QA10 10% và QA30K 30.000đ, cho kết hợp | Web thấy QA001; POS thấy hai mã | Đạt |
| L1-11 | Xóa dữ liệu mới chưa dùng: SP, loại SP, KH, loại KH, NCC | Xóa được, đọc lại không còn | Đạt theo phản hồi API; một số bước chưa có assert đọc lại riêng |
| L1-12 | Xóa SP/KH/NCC/loại SP đã dùng | Chặn, không phá chứng từ | Đạt hành vi chặn; nhiều API trả 500 cho lỗi nghiệp vụ thay vì 4xx |

## 4. Kịch bản luồng 2 — khách tự mua

1. Kiểm tra thông tin đăng ký hợp lệ, gửi OTP email tới `customer@local.test` qua SMTP thử, thử OTP sai rồi đúng, đăng ký `qa_email_flow` thành KH000022 và có token: đạt ở HTTP/SQL.
2. Thử đăng ký không gửi otpType và thử otpType=email + skipOtpCheck=true khi chưa có mã: **đều tạo được account, lỗi F01**.
3. QA001 thêm 2 rồi thêm 1: cùng MaGH=8, số lượng 3; giả username khách khác bị 403: đạt.
4. Thiếu địa chỉ bị 400; gửi tổng dự kiến 1đ bị 409; lưu QA10 và báo giá: 300.000 − 30.000 + 35.000 = **305.000đ**.
5. Tạo DH000021, nguồn Website, trạng thái Chờ giao, email sent trên SMTP thử; gọi lại cùng mã yêu cầu trả cùng đơn/duplicate=true: đạt.
6. UI đăng nhập → chọn cà phê Đậm mạnh 500g × 2 → Mua ngay → giỏ chỉ một dòng được chọn → thanh toán → xóa địa chỉ: trường required không hợp lệ, nút xác nhận bị vô hiệu hóa → nhập lại → chọn QA10 → COD → tạo **DH000031**: đạt.
7. DH000031: tiền hàng 395.000, mã 39.500, ship 35.000, tổng **390.500đ**. UI thành công, SQL và email xem trước thống nhất tên, gram, số lượng, địa chỉ và tiền; SMTP thử nhận đúng một thư cho đơn.
8. Admin tải danh sách thấy DH000031/nguồn Khách đặt web, chưa lập HĐ; bấm nút xuất mở trang xuất và form điền đúng mã đơn/nhân viên/ngày.
9. Bấm Lưu Phiếu Xuất: **lỗi F02 Invalid SQL data type**, không thể kiểm thử E2E giao đơn này tới hoàn thành/hủy qua bước tạo PX hiện tại.
10. Với một đơn website khác đã có PX bằng fixture SQL, chi tiết xuất **không chứa địa chỉ web**, lỗi F06. Nhánh chuyển trạng thái và tồn được kiểm tra riêng ở mục 6.

Chuyển khoản hiện chỉ là lựa chọn phương thức, có hướng dẫn chờ JAVI xác nhận. Tạo đơn và gửi email ngay khi tiếp nhận; chưa có callback ngân hàng xác nhận tiền vào. Không ghi nhận đây là “đã thanh toán thành công”. Cần chốt Q01/Q02.

## 5. Kịch bản luồng 3 — sale nhập đơn

| Ca | Thao tác | Đối chiếu / kết quả |
|---|---|---|
| L3-01 | Sale dùng KH000021, QA001 × 2, giảm món 10%, chiết khấu KH 10%, giảm thêm 10.000, QA10 10% | 200.000 → 180.000 → 162.000 → 152.000 → **136.800đ**. DH000022, SQL lưu đúng |
| L3-02 | Mở sửa DH000022, áp dụng và lưu lại cùng mã | Vẫn đúng 1 dòng WEB_AP_DUNG_MA, không nhân lượt |
| L3-03 | Hoàn thành tại quầy, không dùng mã | Tồn thực và tồn KD đều giảm 2; đơn Hoàn thành; chưa tự tạo HĐ (cần chốt Q03) |
| L3-04 | Giao sau | Chỉ tồn KD giảm 2, tồn thực giữ nguyên |
| L3-05 | Một đơn 10 QA001, chiết khấu 10%, giảm thêm 10.000, QA10 + QA30K | 1.000.000 − 100.000 − 10.000 − 89.000 − 30.000 = **771.000đ**. DH000027 lưu đủ 2 mã |
| L3-06 | UI chọn KH bằng mã + Enter; cà phê 500g × 3 | Đơn giá 197.500, tiền hàng 592.500; popup hoạt động |
| L3-07 | UI giảm món 10%, KH 10%, giảm thêm 10.000, QA10 + QA30K; đổi giảm món | Phải áp dụng lại mã; UI cảnh báo đúng. Lưu giao sau thành **DH000032** |
| L3-08 | SQL đối chiếu DH000032 | Tiền hàng 592.500, tổng giảm **199.567**, phải trả **392.933đ**; nguồn Sale, Chờ giao. Phân số: sau giảm món 533.250 → sau KH 479.925 → sau giảm thêm 469.925 → QA10 46.992 → QA30K 30.000 |
| L3-09 | Xóa đơn chưa HĐ/PX | Hoàn đúng tồn đã giữ, không đổi tồn thực |
| L3-10 | Lập HĐ chưa thanh toán, trả trước 20.000 trên đơn 152.000 | HĐ HD000021, nợ CN000021 còn 132.000; thu hết số còn lại → dư 0, đạt |
| L3-11 | Tạo PX rồi giao / giao lại / hủy qua HTTP | Bị chặn bởi F02; không đánh dấu đạt toàn luồng |

## 6. Giao hàng / thất bại / giao lại / hủy — kiểm thử thành phần

Vì POST /xuat-kho lỗi, **chỉ để kiểm tra phần phía sau**, script tạo phiếu xuất bằng INSERT GETDATE() trên DB QA, rồi chuyển trạng thái qua API thật. Đây không phải sửa lỗi hoặc đi hết luồng tạo PX trên FE.

| Nhánh | Kết quả quan sát |
|---|---|
| Chờ lấy → Đang giao → Thất bại → Chờ lấy → Đang giao → Đã giao | Đạt trên DH000028/PX000021; trước tồn thực 98/KD 75, sau 96/KD 75; thất bại chưa trừ tồn thực |
| Gửi lại Đã giao ngay khi đang Đã giao | Đạt: không trừ thêm |
| Chờ lấy → Hủy xuất → gửi lại Hủy xuất | Đạt DH000029/PX000022: KD hoàn đúng 2 một lần, tồn thực giữ nguyên; đơn Không hoàn thành |
| Đã giao → Đang giao | API vẫn success 200, sai bảo vệ trạng thái, F07 |
| Sau quay lùi, lại Đã giao | Tồn thực từ 96 xuống 94 lần nữa, F07 |
| Hai PX cùng một đơn | SQL cho tạo PX000023 và PX000024 cho DH000030, F08; API còn bị chặn bởi lỗi ngày nên chưa khẳng định HTTP tạo trùng thành công |
| Mã PX không tồn tại | PUT PX999999/status trả success 200 thay vì 404, F09 |
| PX của đơn website có địa chỉ riêng | Chi tiết chỉ có địa chỉ hồ sơ KH (trống), không có “123 đường QA”, F06 |

## 7. Những lỗi / luồng cần chỉnh

| Mã / ưu tiên | Lỗi đã tái hiện / bằng chứng | Hướng xử lý và tiêu chí kiểm tra lại |
|---|---|---|
| F01 / P0 | `/register` không bắt buộc OTP; không gửi otpType hoặc bật skipOtpCheck vẫn tạo KH, account, token | Bắt buộc bằng chứng xác thực phía server; không tin cờ bỏ qua client. Không OTP/OTP sai/hết hạn/dùng lại phải không có KH/account/token. `Shared/Backend/routes/auth.js` |
| F02 / P1 | POST `/xuat-kho` từ API và UI ngày 2026-10-22 trả 500 `[Microsoft][ODBC SQL Server Driver]Invalid SQL data type` | Kiểm tra binding sql.Date với driver ODBC hiện dùng, chuẩn hóa ngày hợp lệ. Tạo PX bằng UI thành công rồi chạy đủ giao lại/hủy. `Admin/Backend/routes/kho.js` |
| F03 / P1 | Tạo NV trùng account: API lỗi nhưng hồ sơ mới còn, COUNT 21→22 | Hồ sơ + account phải cùng transaction; kiểm tra trùng và lấy mã sinh đúng trong giao dịch. `Admin/Backend/routes/nhan-vien.js` |
| F04 / P2, cần Q07 | PUT NV nhận username/password mới nhưng chỉ sửa hồ sơ; account vẫn qa_sale_flow | Chốt phạm vi sửa account; nếu không hỗ trợ phải không cho hiểu đã lưu. Chưa thử đổi mật khẩu qua UI. `nhan-vien.js` |
| F05 / P1 | POST KH chặn trùng SĐT, PUT KH lại nhận SĐT 0900000925 đã thuộc KH000022 | Kiểm tra trùng nhất quán khi sửa, loại trừ chính MaKH; chống trùng trong DB/giao dịch. `khach-hang.js` |
| F06 / P1 | Chi tiết PX không lấy người nhận/địa chỉ web riêng; chỉ lấy KH.DiaChiKH | Lấy snapshot giao hàng WEB_DON_HANG cho đơn web; chứng từ kho/in dùng đúng người nhận, SĐT, địa chỉ đơn. `kho.js` |
| F07 / P0 | Đơn đã giao cho quay về Đang giao rồi Đã giao: tồn thực 96→94 | BE kiểm tra chuyển trạng thái và khóa đồng thời; trigger chống trừ lặp theo nghiệp vụ. Áp dụng cả API một phiếu/hàng loạt. `kho.js`, trg_CapNhatKhoKhiXuat trong database.sql |
| F08 / P1, cần Q04 | DB nhận nhiều PX cho một DH; UI danh sách đơn hiển thị DH000030 hai dòng và thống kê đếm dư | Chốt một PX/đơn hay nhiều đợt giao. Nếu một: ràng buộc uniqueness + chặn API; nếu nhiều: cần số lượng giao từng đợt và aggregate đúng. `ban-hang.js`, schema PHIEU_XUAT |
| F09 / P2 | Update mã PX không tồn tại trả success | Kiểm tra @@ROWCOUNT / existence; trả 404 và không hiện toast thành công |
| F10 / P1, môi trường | SELECT trên BH_WEB2 xác nhận PK WEB_AP_DUNG_MA hiện **1 cột**; DB QA theo database.sql là 2 cột | Nhiều mã POS chỉ chạy trên schema mới. Không tự chạy lại DB nghiệp vụ; cần kế hoạch bàn giao/backup và người dùng thực hiện theo CF-05 |

Các rủi ro mới chỉ rà mã, chưa nâng thành lỗi đã tái hiện: thiếu máy trạng thái ở API chuyển hàng loạt; các thao tác tiền âm/vượt nợ và rollback khi bước lập phiếu thu sau HĐ lỗi; sửa/xóa dữ liệu đồng thời; race khi sinh mã bằng TOP 1; cập nhật giá/tên/loại KH ảnh hưởng chứng từ cũ. Cần kiểm thử thêm trước khi kết luận.

## 8. Các luồng cần người dùng xác nhận

| Mã | Hiện trạng / điểm cần chốt |
|---|---|
| Q01 | Email hiện là **xác nhận tiếp nhận đơn**, gửi trước khi thanh toán. Bạn muốn giữ email này và thêm email “thanh toán thành công”, hay chỉ gửi sau khi kế toán xác nhận? COD vẫn cần email tiếp nhận trước khi thu tiền. |
| Q02 | Chuyển khoản xác nhận thủ công bởi kế toán, hay tích hợp đối soát/callback ngân hàng? Khi chưa thu tiền có cho kho giao không? |
| Q03 | “Giao ngay” là hoàn thành tại quầy hiện tại hay giao vận ngay? Lưu POS có tự lập HĐ/thu tiền hay tách bước kế toán? Hiện lưu hoàn thành đã trừ kho nhưng chưa có HĐ. |
| Q04 | Mỗi đơn chỉ một PX, hay được chia nhiều phiếu/giao nhiều lần? Hiện schema cho nhiều phiếu nhưng chi tiết không phân bổ số lượng từng đợt. |
| Q05 | Đơn không hoàn thành/hủy khi đã có HĐ/đã thu tiền: hoàn tiền, hủy HĐ và xử lý công nợ ra sao? Hiện hủy PX xử lý tồn/trạng thái đơn, chưa chứng minh toàn chuỗi tài chính. |
| Q06 | Sale giao sau có địa chỉ/người nhận riêng từng đơn hay luôn theo hồ sơ KH? Có bắt buộc địa chỉ khi lưu giao sau? POS hiện hiển thị địa chỉ hồ sơ. |
| Q07 | Màn hình sửa nhân viên có được đổi account/password không? Khi khóa NV có yêu cầu vô hiệu ngay token đã cấp không, hay chỉ chặn lần đăng nhập tiếp theo? |
| Q08 | Sau giao thất bại: số lần giao lại tối đa, ai được hủy, thời điểm hoàn tồn/hoàn lượt mã? Hiện nhánh UI cho giao lại hoặc hủy. |
| Q09 | Giới hạn giảm thủ công theo chức vụ, có cần quản lý duyệt, lưu người duyệt/lý do, cho giảm 100% không? Hiện server chấp nhận các mức hợp lệ và không có bước phê duyệt riêng. |
| Q10 | Khách đã mua qua sale rồi đăng ký web cùng SĐT: liên kết hồ sơ cũ/lịch sử/công nợ hay phải tạo hồ sơ khác? Kiểm tra bước 1 hiện báo trùng SĐT. |
| Q11 | Có cho sale sửa/xóa danh mục SP/loại KH và kế toán sửa hồ sơ nhân viên không? Middleware hiện phân quyền theo prefix và chức vụ, chưa tách mọi quyền đọc/ghi. |

Đây là danh sách cần chốt, không phải thay đổi yêu cầu đã được áp dụng.

## 9. Phần chưa nghiệm thu / kịch bản cần chạy tiếp

| Kịch bản | Điều kiện / bước kiểm tra tiếp |
|---|---|
| Email ngoài thực tế | Hộp thư test do người dùng cung cấp → gửi OTP và mail đơn qua SMTP thật → kiểm tra inbox/spam/HTML/đính kèm. Không dùng `.eml` làm bằng chứng thư đã vào Gmail |
| Thanh toán thành công | Chốt Q01/Q02 → xác nhận thu tiền → chứng từ/đơn/email khớp; thất bại không báo đã trả tiền; chống callback trùng |
| Đăng ký đủ UI | Chạy cả 3 bước, quay lại, mismatch password, trùng account/SĐT, OTP hết hạn/gửi lại/sai quá lần, double submit, nhiều tab và server restart |
| Xuất kho E2E | Sửa F02 → website/POS → HĐ theo quyết định chốt → PX → giao thành công/thất bại/giao lại/hủy trên UI; đối chiếu cả tiền và kho |
| Đồng thời | Hai khách tranh tồn cuối; hai đơn tranh lượt mã cuối; lưu POS hai lần; cập nhật PX song song; không trừ/hoàn kho lặp |
| Công nợ/thu chi | FIFO nhiều HĐ, tiền âm/0/vượt nợ, trả trước vượt tổng, lỗi tạo PT sau HĐ, hủy đã thu tiền, trả NCC một phần/tất toán/vượt tiền |
| Danh mục còn lại | CRUD phí giao, tỉnh/phường, coupon hết lượt/hết hạn/loại KH/SP qua giao diện; khóa/tắt mục đang được chọn ở giỏ/POS |
| Excel toàn hệ thống | Mỗi module: template, preview lỗi theo ô, commit hợp lệ, rollback file có dòng lỗi, import trùng, export rồi import lại trên DB QA |
| Backup/restore | Cần tách thư mục backup riêng cho QA trước khi thử tạo/upload/xóa/restore; app đang dùng chung đường dẫn file |
| UI mọi màn hình / mobile / in | Rà đủ form CRUD, drawer, bàn phím, responsive, font/ảnh, phân trang/lọc, in mọi chứng từ; đợt này chưa đánh dấu toàn bộ UI đạt |
| OTP SĐT | Để sau theo yêu cầu người dùng |

## 10. Bằng chứng và cách chạy lại

- `tests/audit-flows.cjs`: setup/run/serve/reset DB QA; thực thi CRUD và HTTP thật. `setup` từ chối ghi đè DB có sẵn; `reset` chỉ dành DB QA, sẽ xóa toàn bộ dữ liệu thử của DB đó. Có kiểm tra prefix JAVI_COFFEE_TEST_.
- `tests/audit-lifecycle.cjs`: fixture PX bằng SQL để kiểm thử phần chuyển trạng thái và bổ sung master data. Chỉ dùng trên DB QA mới tạo; không chạy lặp như test không thay đổi dữ liệu.
- `tests/audit-readback.cjs`: đọc đối chiếu đơn, email, 23 API, cấu trúc PK database hiện tại.
- Kết quả sinh: `tests/.artifacts/flow-audit/results.json`, `lifecycle.json`, `readback.json`, `summary.json`, `mail-*.eml`, `pos-discounts.png`, `website-success.png`, `export-error.png`, `orders.md`. Thư mục artifacts bị gitignore, cần giữ/copy riêng nếu muốn bàn giao bằng chứng.
- `npm test`: đạt các kiểm tra cấu trúc, cú pháp/tài nguyên, scope login, tải chi tiết, giỏ, POS KH/tùy chọn/giá, account, coupon, import và OTP bằng fixture. Test đạt **không bao phủ** các bypass/trigger lỗi phát hiện bổ sung.
- `npm run test:permissions`: đạt khi chạy với quyền truy cập HTTP loopback; sandbox ban đầu báo EACCES, không coi đó là lỗi nghiệp vụ.
- `DB_NAME=JAVI_COFFEE_TEST_COFFEE_20261022 node tests/check-coffee-integration.cjs`: đạt trên mẫu sạch; merge/split giỏ, từng dòng, tổng lượng theo 100g, server price, checkout, chi tiết admin, trừ/hoàn kho; transaction rollback. Lần thử trước trên DB đã thêm danh mục QA bị assert đếm cố định, đã chạy lại trên DB sạch và đạt; không tính là lỗi sản phẩm.

### Nhật ký thực thi

- Đọc toàn bộ đặc tả và cây API/UI; giữ nguyên source nghiệp vụ và file đặc tả.
- Tạo DB QA từ database.sql, tạo master data, account sale và đăng ký KH qua SMTP thử; kiểm tra HTTP và SQL.
- Chuẩn hóa fixture vị trí publish và coupon riêng (minimum=0/cho kết hợp) trước lượt chạy chính; không tính lỗi fixture ban đầu thành lỗi hệ thống.
- Tái hiện lỗi tạo PX; dùng fixture SQL để đi tiếp các nhánh, tách rõ khỏi kết quả E2E.
- Chạy bộ test hiện có và test SQL cà phê trên DB mẫu sạch; đọc 23 API thành công.
- Trực tiếp mở UI, đặt DH000031 website và DH000032 POS; đối chiếu SQL sau timeout trình duyệt, **không bấm lưu lặp**. Đã xác nhận DH000032 có trên danh sách admin.
- Tái hiện F02 bằng nút Lưu Phiếu Xuất cho DH000031; lưu ảnh thông báo lỗi.
- Giữ DB/server QA để đối chiếu trong phiên làm việc. Không sử dụng dữ liệu QA để giao hàng/thu tiền thật.
