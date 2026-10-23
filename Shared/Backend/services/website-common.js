const wrap = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(err => {const quota=[50011,50012,50013].includes(err.number||err.originalError?.info?.number);res.status(err.status||(quota?409:500)).json({success:false,message:err.status||quota?err.message:'Không thể xử lý yêu cầu website. Vui lòng thử lại.'});});
const fail = (message,status=400) => {const error=new Error(message);error.status=status;throw error;};
const text = (value,max) => String(value ?? '').trim().slice(0,max);
const imagePath = value => {const v=text(value,512);if(v && !/^\/images\/[a-zA-Z0-9_./-]+$/.test(v) && !/^https:\/\/[^\s<>"']+$/.test(v)) fail('Ảnh phải là đường dẫn /images/ hoặc URL HTTPS.');return v;};
const settingsQuery = 'SELECT * FROM WEB_CAU_HINH WHERE ID=1';
const productQuery = `SELECT sp.MaSP,sp.TenSP,sp.GiaBan,sp.DonViTinh,sp.TrongLuong,sp.CongSuat,sp.SoLuongKD,sp.MaLoaiSP,lsp.TenLoaiSP,ISNULL(lsp.ApDungTuyChon,0) AS ApDungTuyChon,
 ISNULL(w.HienThi,0) AS HienThi,ISNULL(w.ViTri,N'CaPhe') AS ViTri,ISNULL(w.ThuTu,0) AS ThuTu,ISNULL(w.MoTa,N'') AS MoTa,
 COALESCE(NULLIF(w.HinhAnh,''), CASE WHEN sp.AnhSP IS NOT NULL AND sp.AnhSP<>'' THEN '/images/products/'+sp.AnhSP ELSE '' END) AS HinhAnh
 FROM SAN_PHAM sp LEFT JOIN WEB_SAN_PHAM w ON w.MaSP=sp.MaSP LEFT JOIN LOAI_SAN_PHAM lsp ON lsp.MaLoaiSP=sp.MaLoaiSP`;
module.exports={wrap,fail,text,imagePath,settingsQuery,productQuery};
