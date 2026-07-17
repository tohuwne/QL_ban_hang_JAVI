const sql = require("mssql/msnodesqlv8"); // Dùng driver msnodesqlv8 để hỗ trợ Windows Authentication

const server = process.env.DB_SERVER || "localhost\\SQLEXPRESS";
const database = process.env.DB_NAME || "BH_WEB2";

// Sử dụng Connection String với driver {SQL Server} mặc định của Windows
// Không dùng port TCP vì SQL Server Express mặc định không bật TCP/IP trên port 1433
// Kết nối qua Shared Memory (lpc:) cho kết nối local ổn định hơn
const config = {
  connectionString: `Driver={SQL Server};Server=lpc:${server};Database=${database};Trusted_Connection=yes;`,
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("Kết nối Database thành công qua Windows Authentication!");
    return pool;
  })
  .catch(err => {
    console.error("Kết nối Database thất bại: ", err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};