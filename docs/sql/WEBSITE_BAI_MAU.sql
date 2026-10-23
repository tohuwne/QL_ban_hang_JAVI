IF NOT EXISTS(SELECT 1 FROM WEB_BAI_VIET WHERE Slug='javi-tren-vtv')
 INSERT INTO WEB_BAI_VIET(TieuDe,Slug,ChuyenMuc,TomTat,NoiDung,AnhBia,TrangThai,NgayDang)
 VALUES(N'JAVI trên VTV: câu chuyện máy pha phin Việt','javi-tren-vtv',N'Bài truyền thông',N'Đọc bài giới thiệu về máy pha cà phê JAVI do VTV đăng ngày 25/08/2016.',N'VTV giới thiệu máy pha cà phê JAVI và người sáng chế Nguyễn Bá Hải. Đây là bài báo lưu trữ, không phải thông báo giá hay ưu đãi hiện tại.

Đọc bài gốc tại VTV:
https://vtv.vn/kinh-te/may-pha-ca-phe-viet-nhanh-gap-30-lan-re-bang-1-5-may-ngoai-20160825072956524.htm',N'/images/javi-phin-hero.png',N'Đã xuất bản','2016-08-25T09:25:00');
