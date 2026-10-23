const crypto = require("crypto");

const TOKEN_TTL_SECONDS = 8 * 60 * 60;
const TOKEN_SECRET =
  process.env.AUTH_SECRET || crypto.randomBytes(48).toString("hex");

if (!process.env.AUTH_SECRET) {
  console.warn(
    "[AUTH] AUTH_SECRET chưa được cấu hình; token sẽ hết hiệu lực khi khởi động lại server.",
  );
}

function encode(value) {
  return Buffer.from(value).toString("base64url");
}

function sign(value) {
  return crypto.createHmac("sha256", TOKEN_SECRET).update(value).digest("base64url");
}

function createToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(user.TenDangNhap).trim(),
    vaiTro: user.VaiTro,
    maNV: user.MaNV ? String(user.MaNV).trim() : null,
    maKH: user.MaKH ? String(user.MaKH).trim() : null,
    chucVu: user.ChucVu || null,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifyToken(token) {
  const [encodedPayload, suppliedSignature] = String(token || "").split(".");
  if (!encodedPayload || !suppliedSignature) return null;

  const expectedSignature = sign(encodedPayload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch (_err) {
    return null;
  }
}

function authenticate(req, res, next) {
  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const user = match ? verifyToken(match[1]) : null;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
    });
  }

  req.user = user;
  next();
}

function sameValue(left, right) {
  return String(left || "").trim() === String(right || "").trim();
}

function customerCanAccess(req) {
  const method = req.method.toUpperCase();
  const path = req.path;

  if (method === "GET" && (path === "/san-pham" || path === "/loai-sp")) {
    return true;
  }

  if (path === "/gio-hang" && ["PUT","POST"].includes(method)) {
    return sameValue(req.body.tenDangNhap, req.user.sub);
  }

  if (path.startsWith("/gio-hang/")) {
    try {
      const username = decodeURIComponent(path.split("/")[2] || "");
      return sameValue(username, req.user.sub);
    } catch (_err) {
      return false;
    }
  }

  if (method === 'GET' && ['/website/account','/website/account/orders'].includes(path)) return true;
  if (method === 'POST' && path === '/website/account/coupons') return true;
  if (path === '/website/coupons/available' && method === 'POST') return true;
  if (path === '/website/quote' && method === 'POST') return true;
  if (path === '/website/addresses' && method === 'GET') return true;
  if (path === '/website/checkout' && method === 'POST') return true;
  if (method === 'GET' && /^\/website\/orders\/[^/]+(?:\/email)?$/.test(path)) return true;

  if (path === "/don-hang" && method === "POST") {
    return false; // Website checkout validates stock and prices on the server.
  }

  if (method === "GET" && /^\/don-hang\/[^/]+\/chi-tiet$/.test(path)) {
    return true;
  }

  return false;
}

const employeePermissions = {
  "Bán hàng": [
    "/dashboard",
    "/san-pham",
    "/loai-sp",
    "/don-hang",
    "/khach-hang",
    "/loai-kh",
  ],
  Kho: [
    "/dashboard",
    "/san-pham",
    "/loai-sp",
    "/nhap-kho",
    "/xuat-kho",
    "/nha-cung-cap",
  ],
  "Kế toán": [
    "/dashboard",
    "/hoa-don",
    "/cong-no",
    "/phieu-thu",
    "/phieu-chi",
    "/khach-hang",
    "/loai-kh",
    "/nha-cung-cap",
    "/nhan-vien",
  ],
};

function employeeCanAccess(req) {
  if (req.user.chucVu === "Quản lý") return true;

  const allowedPrefixes = employeePermissions[req.user.chucVu] || [];
  if (allowedPrefixes.some((prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`))) {
    return true;
  }

  // Kho cần đọc đơn hàng để lập phiếu xuất; Kế toán cần đọc đơn hàng/phiếu nhập để lập chứng từ.
  if (req.method === "GET" && req.user.chucVu === "Kho" && req.path.startsWith("/don-hang")) {
    return true;
  }
  if (
    req.method === "GET" &&
    req.user.chucVu === "Kế toán" &&
    (req.path.startsWith("/don-hang") || req.path.startsWith("/nhap-kho"))
  ) {
    return true;
  }

  return false;
}

function authorizeApi(req, res, next) {
  const allowed =
    req.user.vaiTro === "KHACH_HANG"
      ? customerCanAccess(req)
      : req.user.vaiTro === "NHAN_VIEN" && employeeCanAccess(req);

  if (!allowed) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền thực hiện chức năng này.",
    });
  }

  next();
}

module.exports = { createToken, authenticate, authorizeApi };
