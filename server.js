require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình Express xử lý dữ liệu JSON từ Client gửi lên
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình server để đọc các file giao diện tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, "public")));

// Nhúng toàn bộ API Routes từ file riêng
const apiRoutes = require("./api");
app.use("/api", apiRoutes);

// Điều hướng cơ bản (Route): Tự động hiển thị login.html khi vào trang chủ
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
