const {posPricing,saveAppliedCoupon}=require('../../../Shared/Backend/services/pos-pricing');
const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../../../Shared/Backend/config/database");

// ==========================================================
// 4. ĐƠN HÀNG (POS)
// ==========================================================
router.get("/don-hang", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT 
          dh.MaDH, dh.NgayDat, dh.TongTienDonHang, dh.TongGiamGiaSP, dh.TongTienSauGiam,
          dh.TrangThaiDonHang, dh.MaNV, dh.MaKH,
          ISNULL(dh.NguonDon, 'Sale') AS NguonDon,
          px.MaPX,
          hd.TrangThaiThanhToan,
          kh.TenKH, kh.SoDTKH, kh.DiaChiKH,
          nv.HoTenNV
        FROM DON_HANG dh 
        OUTER APPLY (SELECT TOP 1 p.MaPX FROM PHIEU_XUAT p WHERE p.MaDH=dh.MaDH ORDER BY p.MaPX DESC) px
        OUTER APPLY (SELECT TOP 1 h.TrangThaiThanhToan FROM HOA_DON h WHERE h.MaDH=dh.MaDH ORDER BY h.MaHD DESC) hd
        LEFT JOIN KHACH_HANG kh ON dh.MaKH = kh.MaKH
        LEFT JOIN NHAN_VIEN nv ON dh.MaNV = nv.MaNV
        ORDER BY dh.NgayDat DESC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/don-hang/coupon-quote',async(req,res)=>{try{const pricing=await posPricing(await poolPromise,req.body,req.body.editOrderId||null);res.json({success:true,data:pricing});}catch(e){res.status(e.status||500).json({success:false,message:e.status?e.message:'Không tính được ưu đãi.'});}});

router.get('/don-hang/coupons',async(req,res)=>{
 try{
  const result=await (await poolPromise).request().input('Exclude',sql.Char(8),String(req.query.orderId||'').trim()||null).query(`SELECT m.*,k.TenLoaiKH,s.TenSP,
   (SELECT COUNT(*) FROM WEB_AP_DUNG_MA a JOIN DON_HANG d ON d.MaDH=a.MaDH WHERE a.MaGiamGia=m.MaGiamGia AND (@Exclude IS NULL OR a.MaDH<>@Exclude) AND ISNULL(d.TrangThaiDonHang,N'') NOT IN(N'Không hoàn thành',N'Không thành công',N'Đã hủy',N'Hủy')) AS SoLuotDaTinh
   FROM WEB_MA_GIAM_GIA m LEFT JOIN LOAI_KHACH_HANG k ON k.MaLoaiKH=m.MaLoaiKH LEFT JOIN SAN_PHAM s ON s.MaSP=m.MaSP
   WHERE m.TrangThai=N'Hoạt động' AND m.BatDau<=SYSUTCDATETIME() AND (m.KetThuc IS NULL OR m.KetThuc>SYSUTCDATETIME()) ORDER BY m.MaGiamGia`);
  res.json({success:true,data:result.recordset.filter(c=>c.SoLuong==null||Number(c.SoLuotDaTinh)<Number(c.SoLuong))});
 }catch(e){res.status(500).json({success:false,message:'Không tải được mã giảm giá. Vui lòng thử lại.'});}
});

router.post("/don-hang", async (req, res) => {
  try {
    const {
      maKH,
      maNV,
      cartItems,
      tongTienDonHang,
      tongGiamGiaSP,
      tongTienSauGiam,
      tienKhachDua,
      hinhThucTT,
      trangThaiDonHang,
      nguonDon,
    } = req.body;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const pricing=await posPricing(transaction,req.body);
      if(!Number.isFinite(Number(req.body.tongTienSauGiam))||Math.abs(pricing.finalTotal-Number(req.body.tongTienSauGiam))>0.01)throw new Error("Giá hoặc mã ưu đãi đã thay đổi. Vui lòng tính lại đơn hàng.");
      // 1. Tạo Đơn hàng mới
      await transaction
        .request()
        .input("TongTienDonHang", sql.Decimal(19, 3), pricing.raw)
        .input("TongGiamGiaSP", sql.Decimal(19, 3), pricing.totalDiscount)
        .input("TongTienSauGiam", sql.Decimal(19, 3), pricing.finalTotal)
        .input(
          "TrangThaiDonHang",
          sql.NVarChar(50),
          trangThaiDonHang || "Hoàn thành",
        )
        .input("MaNV", sql.Char(8), maNV)
        .input("MaKH", sql.Char(8), maKH)
        .input("NguonDon", sql.VarChar(20), req.user.vaiTro === "KHACH_HANG" ? "Online" : "Sale")
        .query(`INSERT INTO DON_HANG (NgayDat, TongTienDonHang, TongGiamGiaSP, TongTienSauGiam, TrangThaiDonHang, MaNV, MaKH, NguonDon) 
                VALUES (GETDATE(), @TongTienDonHang, @TongGiamGiaSP, @TongTienSauGiam, @TrangThaiDonHang, @MaNV, @MaKH, @NguonDon)`);

      // Lấy Mã DH vừa tự động sinh
      const dhResult = await transaction
        .request()
        .query(
          "SELECT TOP 1 MaDH FROM DON_HANG ORDER BY CAST(SUBSTRING(MaDH, 3, 6) AS INT) DESC",
        );
      const newMaDH = dhResult.recordset[0].MaDH;

      // 2. Thêm Chi tiết ĐH và Trừ Tồn Kho
      for (let item of pricing.items) {
        const stockCheck = await transaction
          .request()
          .input("MaSP", sql.Char(5), item.maSP)
          .query("SELECT SoLuongKD FROM SAN_PHAM WHERE MaSP = @MaSP");
        if (stockCheck.recordset[0].SoLuongKD < item.qty*(item.TrongLuongGram?item.TrongLuongGram/100:1))
          throw new Error(`Kho không đủ SP ${item.tenSP}!`);

        await transaction
          .request()
          .input("MaDH", sql.Char(8), newMaDH)
          .input("MaSP", sql.Char(5), item.maSP)
          .input("SoLuong", sql.Int, item.qty)
          .input("Gram",sql.Int,item.TrongLuongGram)
          .input("Grind",sql.NVarChar(80),item.LoaiXay)
          .input("Price",sql.Decimal(19,3),item.DonGia)
          .input("GiamGiaSP", sql.Decimal(5, 4), item.itemDiscount || 0)
          .query(
            `INSERT INTO CT_DON_HANG (MaDH, MaSP, SoLuong, GiamGiaSP,TrongLuongGram,LoaiXay,DonGia) VALUES (@MaDH, @MaSP, @SoLuong, @GiamGiaSP,@Gram,@Grind,@Price)`,
          );
      }

      await saveAppliedCoupon(transaction,newMaDH,pricing);
      await transaction.commit();

      res.json({
        success: true,
        message: "Lên đơn hàng thành công!",
        data: { maDH: newMaDH },
      });
    } catch (err) {
      await transaction.rollback();
      res
        .status(500)
        .json({ success: false, message: "Lỗi tạo đơn: " + err.message });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách đơn hàng chưa lập hóa đơn
router.get("/don-hang/chua-lap-hoa-don", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT dh.*, kh.TenKH 
      FROM DON_HANG dh 
      LEFT JOIN KHACH_HANG kh ON dh.MaKH = kh.MaKH
      WHERE dh.MaDH NOT IN (SELECT MaDH FROM HOA_DON WHERE MaDH IS NOT NULL)
      ORDER BY dh.NgayDat DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy chi tiết đơn hàng
router.get("/don-hang/:id/chi-tiet", async (req, res) => {
  try {
    const pool = await poolPromise;
    const dhResult = await pool
      .request()
      .input("MaDH", sql.Char(8), req.params.id.trim())
      .query(`SELECT dh.*, kh.TenKH, kh.SoDTKH, kh.EmailKH, kh.DiaChiKH, lkh.TenLoaiKH, nv.HoTenNV AS NguoiLapPhieu, w.NguoiNhan, w.SoDT AS SoDTNhan, w.Email AS EmailNhan, w.DiaChi AS DiaChiGiaoHang, w.GhiChu AS GhiChuGiaoHang, w.HinhThucTT AS HinhThucTTWebsite, w.PhiVanChuyen, promo.MaGiamGia, promo.TienGiam AS TienGiamMa
              FROM DON_HANG dh
              LEFT JOIN WEB_DON_HANG w ON w.MaDH=dh.MaDH
              OUTER APPLY (SELECT STRING_AGG(CONVERT(varchar(max),a.MaGiamGia),', ') AS MaGiamGia,SUM(a.TienGiam) AS TienGiam FROM WEB_AP_DUNG_MA a WHERE a.MaDH=dh.MaDH) promo
              LEFT JOIN KHACH_HANG kh ON dh.MaKH = kh.MaKH
              LEFT JOIN LOAI_KHACH_HANG lkh ON lkh.MaLoaiKH = kh.MaLoaiKH
              LEFT JOIN NHAN_VIEN nv ON dh.MaNV = nv.MaNV
              WHERE dh.MaDH = @MaDH`);
    if (dhResult.recordset.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy" });

    const donHang = dhResult.recordset[0];
    if (
      req.user?.vaiTro === "KHACH_HANG" &&
      String(donHang.MaKH || "").trim() !== String(req.user.maKH || "").trim()
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem đơn hàng này.",
      });
    }
    const itemsResult = await pool
      .request()
      .input("MaDH", sql.Char(8), req.params.id.trim())
      .query(`SELECT ct.MaCTDH,ct.TrongLuongGram,ct.LoaiXay,ct.MaSP,sp.TenSP AS TenSP,CONCAT(sp.TenSP,CASE WHEN ct.TrongLuongGram IS NOT NULL THEN CONCAT(N' / ',ct.TrongLuongGram,N'g / ',ct.LoaiXay) ELSE N'' END) AS name, ct.SoLuong AS quantity, sp.DonViTinh AS unit, COALESCE(ct.DonGia,sp.GiaBan) AS price, ct.GiamGiaSP, 
              (ct.SoLuong * COALESCE(ct.DonGia,sp.GiaBan)) * (1 - ISNULL(ct.GiamGiaSP, 0)) AS ThanhTien
              FROM CT_DON_HANG ct JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP WHERE ct.MaDH = @MaDH`);
    donHang.items = itemsResult.recordset;
    const applied=await pool.request().input('MaDH',sql.Char(8),req.params.id.trim()).query('SELECT MaGiamGia,TienGiam FROM WEB_AP_DUNG_MA WHERE MaDH=@MaDH ORDER BY MaGiamGia');
    donHang.MaGiamGias=applied.recordset.map(c=>c.MaGiamGia);
    donHang.AppliedCoupons=applied.recordset;
    res.json({ success: true, data: donHang });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Xóa đơn hàng (chỉ khi chưa lập HĐ và PX)
router.delete("/don-hang/:id", async (req, res) => {
  try {
    const maDH = req.params.id.trim();
    const pool = await poolPromise;

    const webOrder = await pool.request().input('MaDH', sql.Char(8), maDH).query('SELECT MaDH FROM WEB_DON_HANG WHERE MaDH=@MaDH');
    if (webOrder.recordset.length) return res.status(400).json({success:false,message:'Đơn website lưu thông tin giao hàng và email xác nhận; vui lòng xử lý giao hàng hoặc hủy xuất thay vì xóa đơn.'});
    const website=await pool.request().input('ID',sql.Char(8),maDH).query('SELECT 1 AS Found FROM WEB_DON_HANG WHERE MaDH=@ID');
    if(website.recordset.length)return res.status(400).json({success:false,message:'Đơn website giữ nguyên chi tiết đã chốt. Hãy xử lý giao hàng hoặc hủy qua phiếu xuất.'});
    // 1. Kiểm tra hóa đơn hoặc phiếu xuất
    const hdCheck = await pool
      .request()
      .input("MaDH", sql.Char(8), maDH)
      .query("SELECT COUNT(*) AS count FROM HOA_DON WHERE MaDH = @MaDH");

    const pxCheck = await pool
      .request()
      .input("MaDH", sql.Char(8), maDH)
      .query("SELECT COUNT(*) AS count FROM PHIEU_XUAT WHERE MaDH = @MaDH");

    if (hdCheck.recordset[0].count > 0 || pxCheck.recordset[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa đơn hàng đã lập hóa đơn hoặc phiếu xuất kho!",
      });
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 2. Lấy danh sách sản phẩm và trạng thái đơn hàng để trả lại kho
      const oldItemsResult = await transaction
        .request()
        .input("MaDH", sql.Char(8), maDH)
        .query("SELECT MaSP, SUM(SoLuong*ISNULL(TrongLuongGram/100,1)) AS SoLuong FROM CT_DON_HANG WHERE MaDH = @MaDH GROUP BY MaSP");

      const oldOrderResult = await transaction
        .request()
        .input("MaDH", sql.Char(8), maDH)
        .query("SELECT TrangThaiDonHang FROM DON_HANG WHERE MaDH = @MaDH");

      if (oldOrderResult.recordset.length === 0) {
        throw new Error("Không tìm thấy đơn hàng cần xóa.");
      }

      const trangThaiDonHang = oldOrderResult.recordset[0].TrangThaiDonHang;

      // 3. Trả lại số lượng kho (cập nhật đồng thời tránh vi phạm CHECK constraint)
      for (let item of oldItemsResult.recordset) {
        await transaction
          .request()
          .input("MaSP", sql.Char(5), item.MaSP)
          .input("SoLuong", sql.Int, item.SoLuong)
          .input("TrangThai", sql.NVarChar(50), trangThaiDonHang).query(`
            UPDATE SAN_PHAM 
            SET SoLuongKD = SoLuongKD + @SoLuong,
                SoLuongTon = SoLuongTon + (CASE WHEN @TrangThai = N'Hoàn thành' THEN @SoLuong ELSE 0 END)
            WHERE MaSP = @MaSP
          `);
      }

      // 4. Xóa chi tiết và đơn hàng
      await transaction
        .request()
        .input("MaDH", sql.Char(8), maDH)
        .query("DELETE FROM CT_DON_HANG WHERE MaDH = @MaDH");

      await transaction
        .request()
        .input("MaDH", sql.Char(8), maDH)
        .query("DELETE FROM WEB_AP_DUNG_MA WHERE MaDH=@MaDH; DELETE FROM DON_HANG WHERE MaDH = @MaDH");

      await transaction.commit();
      res.json({ success: true, message: "Xóa đơn hàng thành công!" });
    } catch (err) {
      await transaction.rollback();
      res
        .status(500)
        .json({ success: false, message: "Lỗi xóa đơn hàng: " + err.message });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Chỉnh sửa đơn hàng (chỉ khi chưa lập HĐ và PX)
router.put("/don-hang/:id", async (req, res) => {
  try {
    const maDH = req.params.id.trim();
    const {
      maKH,
      maNV,
      cartItems,
      tongTienDonHang,
      tongGiamGiaSP,
      tongTienSauGiam,
      trangThaiDonHang,
    } = req.body;
    const pool = await poolPromise;

    const website=await pool.request().input('ID',sql.Char(8),maDH).query('SELECT 1 AS Found FROM WEB_DON_HANG WHERE MaDH=@ID');
    if(website.recordset.length)return res.status(400).json({success:false,message:'Đơn website giữ nguyên chi tiết đã chốt. Hãy xử lý giao hàng hoặc hủy qua phiếu xuất.'});
    // 1. Kiểm tra hóa đơn hoặc phiếu xuất
    const hdCheck = await pool
      .request()
      .input("MaDH", sql.Char(8), maDH)
      .query("SELECT COUNT(*) AS count FROM HOA_DON WHERE MaDH = @MaDH");

    const pxCheck = await pool
      .request()
      .input("MaDH", sql.Char(8), maDH)
      .query("SELECT COUNT(*) AS count FROM PHIEU_XUAT WHERE MaDH = @MaDH");

    if (hdCheck.recordset[0].count > 0 || pxCheck.recordset[0].count > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể chỉnh sửa đơn hàng đã lập hóa đơn hoặc phiếu xuất kho!",
      });
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const pricing=await posPricing(transaction,req.body,maDH);
      if(!Number.isFinite(Number(req.body.tongTienSauGiam))||Math.abs(pricing.finalTotal-Number(req.body.tongTienSauGiam))>0.01)throw new Error("Giá hoặc mã ưu đãi đã thay đổi. Vui lòng tính lại đơn hàng.");

      // 2. Lấy danh sách sản phẩm và trạng thái đơn hàng cũ để trả lại kho
      const oldItemsResult = await transaction
        .request()
        .input("MaDH", sql.Char(8), maDH)
        .query("SELECT MaSP, SUM(SoLuong*ISNULL(TrongLuongGram/100,1)) AS SoLuong FROM CT_DON_HANG WHERE MaDH = @MaDH GROUP BY MaSP");

      const oldOrderResult = await transaction
        .request()
        .input("MaDH", sql.Char(8), maDH)
        .query("SELECT TrangThaiDonHang FROM DON_HANG WHERE MaDH = @MaDH");

      if (oldOrderResult.recordset.length === 0) {
        throw new Error("Không tìm thấy đơn hàng cần cập nhật.");
      }

      const oldTrangThai = oldOrderResult.recordset[0].TrangThaiDonHang;

      // Trả lại kho theo thông tin cũ (cập nhật đồng thời tránh vi phạm CHECK constraint)
      for (let item of oldItemsResult.recordset) {
        await transaction
          .request()
          .input("MaSP", sql.Char(5), item.MaSP)
          .input("SoLuong", sql.Int, item.SoLuong)
          .input("TrangThai", sql.NVarChar(50), oldTrangThai).query(`
            UPDATE SAN_PHAM 
            SET SoLuongKD = SoLuongKD + @SoLuong,
                SoLuongTon = SoLuongTon + (CASE WHEN @TrangThai = N'Hoàn thành' THEN @SoLuong ELSE 0 END)
            WHERE MaSP = @MaSP
          `);
      }

      // 3. Xóa chi tiết đơn hàng cũ
      await transaction
        .request()
        .input("MaDH", sql.Char(8), maDH)
        .query("DELETE FROM CT_DON_HANG WHERE MaDH = @MaDH");

      // 4. Cập nhật Đơn hàng
      await transaction
        .request()
        .input("MaDH", sql.Char(8), maDH)
        .input("TongTienDonHang", sql.Decimal(19, 3), pricing.raw)
        .input("TongGiamGiaSP", sql.Decimal(19, 3), pricing.totalDiscount)
        .input("TongTienSauGiam", sql.Decimal(19, 3), pricing.finalTotal)
        .input(
          "TrangThaiDonHang",
          sql.NVarChar(50),
          trangThaiDonHang || "Hoàn thành",
        )
        .input("MaNV", sql.Char(8), maNV)
        .input("MaKH", sql.Char(8), maKH).query(`UPDATE DON_HANG 
                SET TongTienDonHang = @TongTienDonHang, 
                    TongGiamGiaSP = @TongGiamGiaSP, 
                    TongTienSauGiam = @TongTienSauGiam, 
                    TrangThaiDonHang = @TrangThaiDonHang, 
                    MaNV = @MaNV, 
                    MaKH = @MaKH 
                WHERE MaDH = @MaDH`);

      // 5. Thêm Chi tiết ĐH mới và Trừ Tồn Kho mới
      for (let item of pricing.items) {
        // Kiểm tra tồn kho khả dụng mới
        const stockCheck = await transaction
          .request()
          .input("MaSP", sql.Char(5), item.maSP)
          .query("SELECT SoLuongKD FROM SAN_PHAM WHERE MaSP = @MaSP");

        if (stockCheck.recordset[0].SoLuongKD < item.qty*(item.TrongLuongGram?item.TrongLuongGram/100:1)) {
          throw new Error(`Kho không đủ sản phẩm ${item.tenSP || item.maSP}!`);
        }

        // Chèn CT_DON_HANG mới
        await transaction
          .request()
          .input("MaDH", sql.Char(8), maDH)
          .input("MaSP", sql.Char(5), item.maSP)
          .input("SoLuong", sql.Int, item.qty)
          .input("Gram",sql.Int,item.TrongLuongGram)
          .input("Grind",sql.NVarChar(80),item.LoaiXay)
          .input("Price",sql.Decimal(19,3),item.DonGia)
          .input("GiamGiaSP", sql.Decimal(5, 4), item.itemDiscount || 0)
          .query(`INSERT INTO CT_DON_HANG (MaDH, MaSP, SoLuong, GiamGiaSP,TrongLuongGram,LoaiXay,DonGia) 
                  VALUES (@MaDH, @MaSP, @SoLuong, @GiamGiaSP,@Gram,@Grind,@Price)`);


      }

      await saveAppliedCoupon(transaction,maDH,pricing);
      await transaction.commit();
      res.json({ success: true, message: "Cập nhật đơn hàng thành công!" });
    } catch (err) {
      await transaction.rollback();
      res
        .status(500)
        .json({ success: false, message: "Lỗi cập nhật: " + err.message });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
