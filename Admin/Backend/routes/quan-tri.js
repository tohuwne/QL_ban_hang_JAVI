const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../../../Shared/Backend/config/database");
const fs = require("fs");
const path = require("path");

const backupDir = require("../../../Shared/Backend/config/paths").backups;

function ensureBackupDir() {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
}

// ==========================================================
// 8. QUẢN TRỊ HỆ THỐNG - SAO LƯU & KHÔI PHỤC DỮ LIỆU
// ==========================================================

// Lấy thông số thống kê cơ sở dữ liệu
router.get("/backup/stats", async (req, res) => {
  try {
    const pool = await poolPromise;
    const dbNameRes = await pool.request().query("SELECT DB_NAME() AS dbName");
    const dbName = dbNameRes.recordset[0]?.dbName || "BH_WEB2";

    const productsRes = await pool
      .request()
      .query("SELECT COUNT(*) AS count FROM SAN_PHAM");
    const customersRes = await pool
      .request()
      .query("SELECT COUNT(*) AS count FROM KHACH_HANG");
    const ordersRes = await pool
      .request()
      .query("SELECT COUNT(*) AS count FROM DON_HANG");
    const employeesRes = await pool
      .request()
      .query("SELECT COUNT(*) AS count FROM NHAN_VIEN");

    res.json({
      success: true,
      data: {
        dbName,
        products: productsRes.recordset[0]?.count || 0,
        customers: customersRes.recordset[0]?.count || 0,
        orders: ordersRes.recordset[0]?.count || 0,
        employees: employeesRes.recordset[0]?.count || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách các bản sao lưu hiện có
router.get("/backup/list", async (req, res) => {
  try {
    ensureBackupDir();

    const files = fs.readdirSync(backupDir);
    const data = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        const filePath = path.join(backupDir, f);
        const stat = fs.statSync(filePath);
        return {
          name: f,
          size: stat.size,
          createdAt: stat.birthtime || stat.mtime,
        };
      });

    // Sắp xếp bản sao lưu mới nhất lên đầu
    data.sort((a, b) => b.createdAt - a.createdAt);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tạo một bản sao lưu mới dưới dạng JSON
router.post("/backup/create", async (req, res) => {
  try {
    const pool = await poolPromise;

    const tables = [
      "LOAI_SAN_PHAM", "LOAI_XAY", "TRONG_LUONG", "LOAI_SP_LOAI_XAY", "LOAI_SP_TRONG_LUONG",
      "LOAI_KHACH_HANG",
      "NHA_CUNG_CAP",
      "SAN_PHAM",
      "KHACH_HANG",
      "NHAN_VIEN",
      "TAI_KHOAN",
      "PHIEU_NHAP",
      "CT_PHIEU_NHAP",
      "DON_HANG",
      "CT_DON_HANG",
      "HOA_DON",
      "PHIEU_XUAT",
      "CONG_NO",
      "PHIEU_THU",
      "PHIEU_CHI",
      "WEB_TINH_THANH", "WEB_PHUONG_XA", "WEB_DIA_CHI", "WEB_PHI_VAN_CHUYEN", "WEB_MA_GIAM_GIA", "WEB_MA_KHACH_HANG", "WEB_AP_DUNG_MA", "WEB_UU_DAI_DON_HANG", "GIO_HANG", "WEB_SAN_PHAM", "WEB_BAI_VIET", "WEB_CAU_HINH", "WEB_DON_HANG", "WEB_CT_DON_HANG", "WEB_EMAIL",
    ];

    const backupData = {
      backup_time: new Date().toISOString(),
      database: "BH_WEB2",
      tables: {},
    };

    for (let tbl of tables) {
      const result = await pool.request().query(`SELECT * FROM ${tbl}`);
      backupData.tables[tbl] = result.recordset;
    }

    ensureBackupDir();

    // Định dạng tên file: backup_YYYYMMDD_HHMMSS.json
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const filename = `backup_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.json`;

    fs.writeFileSync(
      path.join(backupDir, filename),
      JSON.stringify(backupData, null, 2),
      "utf-8",
    );

    res.json({ success: true, filename });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Nhận file sao lưu được upload lên từ client
router.post("/backup/upload", async (req, res) => {
  try {
    const { filename, content } = req.body;

    if (!filename || !content) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Thiếu tên file hoặc nội dung sao lưu!",
        });
    }

    ensureBackupDir();

    const cleanName = path.basename(filename);
    fs.writeFileSync(path.join(backupDir, cleanName), content, "utf-8");

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Xóa file sao lưu khỏi bộ nhớ máy chủ
router.delete("/backup/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;

    const cleanName = path.basename(filename);
    const filePath = path.join(backupDir, cleanName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res
        .status(404)
        .json({
          success: false,
          message: "Không tìm thấy bản sao lưu cần xóa!",
        });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Khôi phục dữ liệu từ bản sao lưu JSON được chọn
router.post("/backup/restore", async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu tên file để khôi phục!" });
    }

    const cleanName = path.basename(filename);
    const filePath = path.join(backupDir, cleanName);

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy file sao lưu!" });
    }

    const fileData = fs.readFileSync(filePath, "utf-8");
    const backupData = JSON.parse(fileData);

    if (!backupData.tables) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cấu trúc file sao lưu không hợp lệ!",
        });
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const tablesInReverse = [
      "LOAI_SP_LOAI_XAY", "LOAI_SP_TRONG_LUONG", "LOAI_XAY", "TRONG_LUONG",
      "WEB_MA_KHACH_HANG",
      "WEB_UU_DAI_DON_HANG",
      "WEB_AP_DUNG_MA",
      "WEB_MA_GIAM_GIA",
      "WEB_PHI_VAN_CHUYEN",
      "WEB_DIA_CHI",
      "WEB_PHUONG_XA",
      "WEB_TINH_THANH",
      "WEB_EMAIL",
      "WEB_CT_DON_HANG",
      "WEB_DON_HANG",
      "WEB_CAU_HINH",
      "WEB_BAI_VIET",
      "WEB_SAN_PHAM",
      "GIO_HANG",
      "PHIEU_THU",
      "CONG_NO",
      "PHIEU_XUAT",
      "HOA_DON",
      "CT_DON_HANG",
      "DON_HANG",
      "PHIEU_CHI",
      "CT_PHIEU_NHAP",
      "PHIEU_NHAP",
      "TAI_KHOAN",
      "NHAN_VIEN",
      "KHACH_HANG",
      "LOAI_KHACH_HANG",
      "SAN_PHAM",
      "NHA_CUNG_CAP",
      "LOAI_SAN_PHAM",
    ].filter(table => !['WEB_TINH_THANH','WEB_PHUONG_XA','WEB_PHI_VAN_CHUYEN','WEB_MA_GIAM_GIA'].includes(table) || Object.prototype.hasOwnProperty.call(backupData.tables,table));

    const tablesInDirect = [...tablesInReverse].reverse();
    const logs = [];

    try {
      logs.push("[DB] Vô hiệu hóa tất cả trigger hệ thống...");
      for (let tbl of tablesInDirect) {
        await transaction
          .request()
          .query(`ALTER TABLE ${tbl} DISABLE TRIGGER ALL`);
      }

      logs.push("[DB] Xóa dữ liệu các bảng hiện tại...");
      for (let tbl of tablesInReverse) {
        await transaction.request().query(`DELETE FROM ${tbl}`);
      }

      logs.push("[DB] Phục hồi dữ liệu từ bản sao lưu...");
      const dateFields = [
        "NgayDat",
        "NgayLap",
        "NgayNhap",
        "NgayChi",
        "NgayThu",
        "NgayGhiNhan",
        "NgayXuat",
        "HanThanhToan", "NgayThem", "NgayDang", "NgayCapNhat", "NgayTao", "NgayGui", "NgayLuu", "BatDau", "KetThuc",
      ];

      for (let tbl of tablesInDirect) {
        const rows = backupData.tables[tbl];
        if (rows && rows.length > 0) {
          logs.push(`[DB] Khôi phục bảng: ${tbl} (${rows.length} dòng)...`);
          const hasIdentity = ["CT_DON_HANG","WEB_CT_DON_HANG","LOAI_XAY","TRONG_LUONG","GIO_HANG", "WEB_BAI_VIET", "WEB_EMAIL", "WEB_DIA_CHI", "WEB_PHI_VAN_CHUYEN"].includes(tbl);
          if (hasIdentity) await transaction.request().query(`SET IDENTITY_INSERT ${tbl} ON`);
          try {
          for (let row of rows) {
            const request = transaction.request();
            const cols = [];
            const vals = [];
            for (let key in row) {
              cols.push(key);
              if (row[key] === null) {
                vals.push("NULL");
              } else {
                vals.push(`@${key}`);
                if (dateFields.includes(key) && row[key]) {
                  request.input(key, sql.DateTime, new Date(row[key]));
                } else if (typeof row[key] === 'string') {
                  request.input(key, sql.NVarChar(sql.MAX), row[key]);
                } else {
                  request.input(key, row[key]);
                }
              }
            }
            const queryText = `INSERT INTO ${tbl} (${cols.join(", ")}) VALUES (${vals.join(", ")})`;
            await request.query(queryText);
          }
          } finally {
            if (hasIdentity) await transaction.request().query(`SET IDENTITY_INSERT ${tbl} OFF`);
          }
        }
      }
      // Older backups predate the website: keep an editable default settings row.
      await transaction.request().query("IF NOT EXISTS(SELECT 1 FROM WEB_CAU_HINH WHERE ID=1) INSERT INTO WEB_CAU_HINH(ID) VALUES(1)");

      logs.push("[DB] Kích hoạt lại tất cả trigger hệ thống...");
      for (let tbl of tablesInDirect) {
        await transaction
          .request()
          .query(`ALTER TABLE ${tbl} ENABLE TRIGGER ALL`);
      }

      await transaction.request().query("IF EXISTS(SELECT 1 FROM WEB_MA_GIAM_GIA m JOIN v_MaGiamGiaLuotDung v ON v.MaGiamGia=m.MaGiamGia WHERE m.SoLuong IS NOT NULL AND v.SoLuotDaTinh>m.SoLuong) THROW 50012,N'Backup vượt giới hạn lượt sử dụng mã giảm giá',1;");
      await transaction.commit();
      res.json({ success: true, logs });
    } catch (err) {
      try {
        await transaction.rollback();
      } catch (rollErr) {
        console.error("Rollback error:", rollErr);
      }
      try {
        for (let tbl of tablesInDirect) {
          await pool.request().query(`ALTER TABLE ${tbl} ENABLE TRIGGER ALL`);
        }
      } catch (e) {}
      throw err;
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
