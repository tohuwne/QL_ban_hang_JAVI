const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../../../Shared/Backend/config/database");

// ==========================================================
// 10. DASHBOARD CHARTS (DỮ LIỆU BIỂU ĐỒ)
// ==========================================================
router.get("/dashboard/chart-data", async (req, res) => {
  try {
    const { year } = req.query;
    let query = `SELECT TOP 12 Thang, Nam, DoanhThuBanHang, ChiPhiNhapHang, LoiNhuanThuan FROM v_DoanhThu_ChiPhi WHERE 1=1`;
    if (year && year !== "all") query += ` AND Nam = ${parseInt(year)}`;
    query += ` ORDER BY Nam DESC, Thang DESC`;

    const pool = await poolPromise;
    const result = await pool.request().query(query);
    const data = result.recordset.sort((a, b) => {
      if (a.Nam === b.Nam) return a.Thang - b.Thang;
      return a.Nam - b.Nam;
    });
    res.json({ success: true, data: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// BỔ SUNG: Lấy danh sách các năm có phát sinh giao dịch
router.get("/dashboard/years", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT DISTINCT Nam FROM v_DoanhThu_ChiPhi ORDER BY Nam DESC
    `);
    const years = result.recordset.map((r) => r.Nam);
    res.json({ success: true, data: years });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// BỔ SUNG: Lấy dữ liệu top sản phẩm bán chạy
router.get("/dashboard/top-products", async (req, res) => {
  try {
    const { year, month, limit } = req.query;
    const topLimit = parseInt(limit) || 10;

    let query = `
      SELECT TOP ${topLimit}
        sp.MaSP,
        sp.TenSP,
        sp.DonViTinh,
        SUM(ct.SoLuong*ISNULL(ct.TrongLuongGram/100,1)) AS SoLuongDaBan
      FROM CT_DON_HANG ct
      JOIN DON_HANG dh ON ct.MaDH = dh.MaDH
      JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP
      WHERE dh.TrangThaiDonHang = N'Hoàn thành'
    `;

    if (year && year !== "all")
      query += ` AND YEAR(dh.NgayDat) = ${parseInt(year)}`;
    if (month && month !== "all")
      query += ` AND MONTH(dh.NgayDat) = ${parseInt(month)}`;

    query += ` GROUP BY sp.MaSP, sp.TenSP, sp.DonViTinh ORDER BY SoLuongDaBan DESC`;

    const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// BỔ SUNG: Lấy dữ liệu tổng quan cho các thẻ Dashboard
router.get("/dashboard/stats", async (req, res) => {
  try {
    const { year } = req.query;
    const pool = await poolPromise;

    let revQuery =
      "SELECT ISNULL(SUM(TongTienThanhToan), 0) AS Total FROM HOA_DON WHERE 1=1";
    let expQuery =
      "SELECT ISNULL(SUM(TongTienNhap), 0) AS Total FROM PHIEU_NHAP WHERE 1=1";

    if (year && year !== "all") {
      revQuery += ` AND YEAR(NgayLap) = ${parseInt(year)}`;
      expQuery += ` AND YEAR(NgayNhap) = ${parseInt(year)}`;
    }

    const rev = await pool.request().query(revQuery);
    const exp = await pool.request().query(expQuery);
    const debt = await pool
      .request()
      .query(
        "SELECT ISNULL(SUM(SoDuCN), 0) AS Total FROM CONG_NO WHERE TrangThaiCN = N'Còn nợ'",
      );
    const warning = await pool
      .request()
      .query("SELECT COUNT(*) AS Total FROM SAN_PHAM WHERE SoLuongTon <= TonToiThieu");

    res.json({
      success: true,
      data: {
        doanhThu: rev.recordset[0].Total,
        chiPhi: exp.recordset[0].Total,
        congNo: debt.recordset[0].Total,
        canhBao: warning.recordset[0].Total,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
