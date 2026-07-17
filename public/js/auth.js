// public/js/auth.js

// KHẮC PHỤC LỖI GIẬT SIDEBAR: Tắt tạm thời hiệu ứng co giãn lúc trang vừa tải để Sidebar giữ nguyên trạng thái mở
document.documentElement.classList.add("preload-transitions");
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.documentElement.classList.remove("preload-transitions");
  }, 100);
});

document.addEventListener("DOMContentLoaded", () => {
  // 0. GẮN MODAL THÔNG BÁO ALERT GLOBAL ĐỂ DÙNG ĐƯỢC NGAY TRÊN TOÀN HỆ THỐNG
  injectGlobalModals();

  const currentUserData = localStorage.getItem("currentUser");
  const currentPage = window.location.pathname.split("/").pop();

  // 1. CHƯA ĐĂNG NHẬP: Ép văng ra màn hình đăng nhập (Ngoại trừ file login)
  if (!currentUserData) {
    if (currentPage !== "login.html") {
      window.location.href = "login.html";
    }
    return;
  }

  // 2. ĐÃ ĐĂNG NHẬP: Bỏ qua trang đăng nhập để vào thẳng Dashboard
  if (currentPage === "login.html" || currentPage === "") {
    window.location.href = "dashboard.html";
    return;
  }

  const user = JSON.parse(currentUserData);

  // BỔ SUNG: Render đồng bộ thanh Sidebar cho tất cả các trang
  renderGlobalSidebar();

  // 3. PHÂN QUYỀN UI: Tự động Ẩn các Menu không được phép theo Chức Vụ
  const chucVu = user.ChucVu;
  const menuItems = document.querySelectorAll(".sidebar-menu a[data-menu]");

  menuItems.forEach((item) => {
    const menuName = item.getAttribute("data-menu");
    let isAllowed = false;

    if (chucVu === "Quản lý") isAllowed = true;
    else if (chucVu === "Bán hàng") {
      if (
        [
          "Trang Chủ",
          "Bán Hàng",
          "Danh Mục",
          "Sản Phẩm",
          "Loại Sản Phẩm",
          "Khách Hàng",
          "Loại Khách Hàng",
        ].includes(menuName)
      )
        isAllowed = true;
    } else if (chucVu === "Kho") {
      if (
        [
          "Trang Chủ",
          "Danh Mục",
          "Sản Phẩm",
          "Loại Sản Phẩm",
          "Nhà Cung Cấp",
          "Quản Lý Kho",
          "Tồn Kho",
          "Nhập Kho",
          "Xuất Kho",
        ].includes(menuName)
      )
        isAllowed = true;
    } else if (chucVu === "Kế toán") {
      if (
        [
          "Trang Chủ",
          "Hóa Đơn",
          "Công Nợ",
          "Danh Mục",
          "Khách Hàng",
          "Loại Khách Hàng",
          "Nhà Cung Cấp",
          "Quản Lý Thu - Chi",
          "Phiếu Thu",
          "Phiếu Chi",
          "Quản Lý Người Dùng",
        ].includes(menuName)
      )
        isAllowed = true;
    }

    if (!isAllowed) item.parentElement.style.display = "none";
  });

  // Tự động ẩn luôn thư mục cha nếu không có thư mục con nào được phép hiển thị
  document.querySelectorAll(".has-submenu").forEach((parentLi) => {
    const visibleChildren = Array.from(
      parentLi.querySelectorAll(".submenu li"),
    ).filter((li) => li.style.display !== "none");
    if (visibleChildren.length === 0) {
      parentLi.style.display = "none";
    }
  });

  // 4. BẢO VỆ ROUTE: Chặn nếu nhân viên cố tình gõ link trực tiếp lên trình duyệt
  let pageAllowed = false;
  if (chucVu === "Quản lý") pageAllowed = true;
  else if (
    chucVu === "Bán hàng" &&
    [
      "dashboard.html",
      "san-pham.html",
      "ban-hang.html",
      "don-hang.html",
      "khach-hang.html",
      "loai-sp.html",
      "loai-kh.html",
    ].includes(currentPage)
  )
    pageAllowed = true;
  else if (
    chucVu === "Kho" &&
    [
      "dashboard.html",
      "san-pham.html",
      "loai-sp.html",
      "ton-kho.html",
      "nhap-kho.html",
      "xuat-kho.html",
      "nha-cung-cap.html",
    ].includes(currentPage)
  )
    pageAllowed = true;
  else if (
    chucVu === "Kế toán" &&
    [
      "dashboard.html",
      "hoa-don.html",
      "cong-no.html",
      "phieu-thu.html",
      "phieu-chi.html",
      "khach-hang.html",
      "loai-kh.html",
      "nha-cung-cap.html",
      "nhan-vien.html",
    ].includes(currentPage)
  )
    pageAllowed = true;

  if (!pageAllowed) {
    javiAlert(
      "Lỗi phân quyền: Bạn không có quyền truy cập chức năng này!",
    ).then(() => {
      window.location.href = "dashboard.html";
    });
    return;
  }

  // 5. TỰ ĐỘNG ĐĂNG XUẤT SAU 30 PHÚT KHÔNG HOẠT ĐỘNG
  let inactivityTimer;
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(
      async () => {
        await javiAlert(
          "Phiên đăng nhập đã hết hạn do không có thao tác trong 30 phút. Vui lòng đăng nhập lại!",
        );
        window.handleLogout();
      },
      30 * 60 * 1000,
    ); // 30 phút = 1.800.000 ms
  }
  const userActivityEvents = [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
  ];
  userActivityEvents.forEach((event) =>
    document.addEventListener(event, resetInactivityTimer, true),
  );
  resetInactivityTimer(); // Khởi tạo bộ đếm thời gian

  // 6. PHÂN QUYỀN THAO TÁC THÊM/SỬA/XÓA (CRUD Buttons)
  if (chucVu !== "Quản lý") {
    const css = document.createElement("style");
    // Mặc định nhân viên không được Xóa/Khóa
    css.textContent += ".btn-delete { display: none !important; } ";

    // Ràng buộc riêng theo từng phòng ban
    if (chucVu === "Bán hàng" || chucVu === "Kho") {
      if (currentPage === "san-pham.html" || currentPage === "nhan-vien.html") {
        css.textContent +=
          ".btn-edit, .btn[onclick='openModal()'] { display: none !important; } ";
      }
    } else if (chucVu === "Kế toán") {
      if (currentPage === "nhan-vien.html") {
        css.textContent +=
          ".btn-edit, .btn[onclick='openModal()'] { display: none !important; } ";
      }
    }
    document.head.appendChild(css);
  }

  // 5. TỰ ĐỘNG VẼ AVATAR VÀ MODAL HỒ SƠ VÀO TẤT CẢ CÁC TRANG
  injectUserProfile(user);
});

function renderGlobalSidebar() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  const currentPage =
    window.location.pathname.split("/").pop() || "dashboard.html";

  // TỰ ĐỘNG BẢO VỆ GIAO DIỆN: Nhúng file logo.css vào các trang chưa có để tránh lỗi logo bị phóng to khổng lồ
  if (
    !document.querySelector('link[href="css/logo.css"]') &&
    !document.querySelector('link[href*="logo.css"]')
  ) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/logo.css";
    document.head.appendChild(link);
  }

  // Tiêm động đoạn CSS để vẽ menu Dropdown vào tất cả các trang
  if (!document.querySelector("style#submenu-style")) {
    const css = document.createElement("style");
    css.id = "submenu-style";
    css.textContent = `
      .sidebar-menu .submenu { padding-left: 20px; list-style: none; margin: 0; }
      .sidebar-menu .submenu li a { padding: 10px 15px; font-size: 0.9em; display: block; color: var(--color-text-main, #eee); text-decoration: none; transition: all 0.3s; }
      .sidebar-menu .submenu li a:hover, .sidebar-menu .submenu li a.active { color: var(--color-primary, #ffc107); background: transparent; }
      .sidebar-menu .has-submenu > a { display: flex; align-items: center; justify-content: space-between; }
      .sidebar-menu .has-submenu > a i.fa-chevron-down, .sidebar-menu .has-submenu > a i.fa-chevron-up { font-size: 10px; margin-left: auto; transition: transform 0.3s; }
      .sidebar-menu .has-submenu > a .menu-text { flex-grow: 1; margin-left: 10px; display: flex; justify-content: space-between; align-items: center; }
    `;
    document.head.appendChild(css);
  }

  const isDanhSachActive = [
    "khach-hang.html",
    "loai-kh.html",
    "nha-cung-cap.html",
    "san-pham.html",
    "loai-sp.html",
  ].includes(currentPage);
  const isKhoActive = [
    "ton-kho.html",
    "nhap-kho.html",
    "xuat-kho.html",
  ].includes(currentPage);
  const isThuChiActive = ["phieu-thu.html", "phieu-chi.html"].includes(
    currentPage,
  );

  // Vẽ lại toàn bộ cấu trúc Sidebar chuẩn với Logo ảnh và tự động Active menu
  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <a href="dashboard.html">
        <img src="images/logo-javi.png" alt="JAVI COFFEE" class="javi-logo-sidebar" />
      </a>
    </div>
    <ul class="sidebar-menu">
      <li><a href="dashboard.html" data-menu="Trang Chủ" class="${currentPage === "dashboard.html" ? "active" : ""}"><i class="fas fa-home"></i> <span class="menu-text">Trang Chủ</span></a></li>
      
      <li class="has-submenu ${isDanhSachActive ? "open" : ""}">
        <a href="#" data-menu="Danh Mục" onclick="toggleSubmenu(this); return false;" class="${isDanhSachActive ? "active" : ""}">
          <i class="fas fa-list"></i> <span class="menu-text">Danh Mục <i class="fas fa-chevron-${isDanhSachActive ? "up" : "down"}"></i></span>
        </a>
        <ul class="submenu" style="display: ${isDanhSachActive ? "block" : "none"};">
          <li><a href="khach-hang.html" data-menu="Khách Hàng" class="${currentPage === "khach-hang.html" ? "active" : ""}"><i class="fas fa-users"></i> Khách Hàng</a></li>
          <li><a href="loai-kh.html" data-menu="Loại Khách Hàng" class="${currentPage === "loai-kh.html" ? "active" : ""}"><i class="fas fa-tags"></i> Loại Khách Hàng</a></li>
          <li><a href="nha-cung-cap.html" data-menu="Nhà Cung Cấp" class="${currentPage === "nha-cung-cap.html" ? "active" : ""}"><i class="fas fa-building"></i> Nhà Cung Cấp</a></li>
          <li><a href="san-pham.html" data-menu="Sản Phẩm" class="${currentPage === "san-pham.html" ? "active" : ""}"><i class="fas fa-coffee"></i> Sản Phẩm</a></li>
          <li><a href="loai-sp.html" data-menu="Loại Sản Phẩm" class="${currentPage === "loai-sp.html" ? "active" : ""}"><i class="fas fa-tags"></i> Loại Sản Phẩm</a></li>
        </ul>
      </li>

      <li><a href="don-hang.html" data-menu="Bán Hàng" class="${currentPage === "don-hang.html" ? "active" : ""}"><i class="fas fa-shopping-cart"></i> <span class="menu-text">Bán Hàng</span></a></li>
      <li><a href="hoa-don.html" data-menu="Hóa Đơn" class="${currentPage === "hoa-don.html" ? "active" : ""}"><i class="fas fa-file-invoice"></i> <span class="menu-text">Hóa Đơn</span></a></li>
      <li><a href="cong-no.html" data-menu="Công Nợ" class="${currentPage === "cong-no.html" ? "active" : ""}"><i class="fas fa-hand-holding-usd"></i> <span class="menu-text">Công Nợ</span></a></li>

      <li class="has-submenu ${isKhoActive ? "open" : ""}">
        <a href="#" data-menu="Quản Lý Kho" onclick="toggleSubmenu(this); return false;" class="${isKhoActive ? "active" : ""}">
          <i class="fas fa-warehouse"></i> <span class="menu-text">Quản Lý Kho <i class="fas fa-chevron-${isKhoActive ? "up" : "down"}"></i></span>
        </a>
        <ul class="submenu" style="display: ${isKhoActive ? "block" : "none"};">
          <li><a href="nhap-kho.html" data-menu="Nhập Kho" class="${currentPage === "nhap-kho.html" ? "active" : ""}"><i class="fas fa-boxes"></i> Nhập Kho</a></li>
          <li><a href="xuat-kho.html" data-menu="Xuất Kho" class="${currentPage === "xuat-kho.html" ? "active" : ""}"><i class="fas fa-truck-loading"></i> Xuất Kho</a></li>
          <li><a href="ton-kho.html" data-menu="Tồn Kho" class="${currentPage === "ton-kho.html" ? "active" : ""}"><i class="fas fa-cubes"></i> Tồn Kho</a></li>
        </ul>
      </li>

      <li class="has-submenu ${isThuChiActive ? "open" : ""}">
        <a href="#" data-menu="Quản Lý Thu - Chi" onclick="toggleSubmenu(this); return false;" class="${isThuChiActive ? "active" : ""}">
          <i class="fas fa-coins"></i> <span class="menu-text">Quản Lý Thu - Chi <i class="fas fa-chevron-${isThuChiActive ? "up" : "down"}"></i></span>
        </a>
        <ul class="submenu" style="display: ${isThuChiActive ? "block" : "none"};">
          <li><a href="phieu-thu.html" data-menu="Phiếu Thu" class="${currentPage === "phieu-thu.html" ? "active" : ""}"><i class="fas fa-receipt"></i> Phiếu Thu</a></li>
          <li><a href="phieu-chi.html" data-menu="Phiếu Chi" class="${currentPage === "phieu-chi.html" ? "active" : ""}"><i class="fas fa-money-bill-wave"></i> Phiếu Chi</a></li>
        </ul>
      </li>

      <li><a href="nhan-vien.html" data-menu="Quản Lý Người Dùng" class="${currentPage === "nhan-vien.html" ? "active" : ""}"><i class="fas fa-user-shield"></i> <span class="menu-text">Quản Lý Người Dùng</span></a></li>
      <li><a href="quan-tri.html" data-menu="Quản Trị Hệ Thống" class="${currentPage === "quan-tri.html" ? "active" : ""}"><i class="fas fa-cogs"></i> <span class="menu-text">Quản Trị Hệ Thống</span></a></li>
    </ul>
  `;
}

function injectUserProfile(user) {
  const profileHTML = `
        <div class="user-profile" style="margin-left: auto;">
          <div class="user-info" onclick="toggleUserDropdown()">
            <div class="user-avatar">${user.HoTenNV.charAt(0).toUpperCase()}</div>
            <span class="user-name">Xin chào, ${user.HoTenNV}</span>
            <i class="fas fa-chevron-down" style="font-size: 12px; color: #888"></i>
          </div>
          <div class="user-dropdown" id="userDropdown">
            <a href="#" onclick="openProfileModal()"><i class="fas fa-id-badge"></i> Hồ sơ cá nhân</a>
            <a href="#" onclick="handleLogout()" class="text-danger"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
          </div>
        </div>
    `;

  let header =
    document.querySelector(".page-header") ||
    document.querySelector(".header-container");

  // Nhét avatar vào góc phải của mọi trang
  if (!header && document.querySelector(".pos-layout")) {
    // Ngoại lệ cho trang ban-hang.html
    const backBtn = document.querySelector(".main-content > div:first-child");
    if (backBtn) {
      backBtn.style.display = "flex";
      backBtn.style.justifyContent = "space-between";
      backBtn.style.alignItems = "center";
      backBtn.insertAdjacentHTML("beforeend", profileHTML);
    }
  } else if (header) {
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.insertAdjacentHTML("beforeend", profileHTML);
  }

  // Nhét khung Modal Hồ sơ vào body
  const modalHTML = `
    <div class="modal-overlay" id="profileModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); z-index: 3000; justify-content: center; align-items: center;">
      <div class="modal-content" style="background: var(--color-bg-surface); padding: 30px; border-radius: 8px; border: 1px solid var(--color-border); width: 400px; position: relative;">
        <button onclick="document.getElementById('profileModal').style.display = 'none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #888; font-size: 20px; cursor: pointer;">&times;</button>
        <h3 style="color: var(--color-primary); margin-bottom: 20px; text-align: center;"><i class="fas fa-user-circle"></i> THÔNG TIN CÁ NHÂN</h3>
        <div style="text-align: center; margin-bottom: 20px">
          <div style="width: 80px; height: 80px; background: var(--color-primary); color: #000; border-radius: 50%; font-size: 32px; font-weight: bold; display: flex; justify-content: center; align-items: center; margin: 0 auto 10px;">
            <span>${user.HoTenNV.charAt(0).toUpperCase()}</span>
          </div>
          <h4 style="color: #fff; margin-bottom: 5px; font-size: 18px">${user.HoTenNV}</h4>
          <span style="background: #222; padding: 4px 12px; border-radius: 20px; font-size: 12px; color: var(--color-primary);">${user.ChucVu}</span>
        </div>
        <div style="background: #1a1a1a; padding: 15px; border-radius: 6px; font-size: 14px; line-height: 2;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;"><span style="color: #888">Mã Nhân Viên:</span> <strong>${user.MaNV}</strong></div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;"><span style="color: #888">Tài khoản đăng nhập:</span> <strong>${user.TenDangNhap}</strong></div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;"><span style="color: #888">Số điện thoại:</span> <strong>${user.SoDTNV || "Chưa cập nhật"}</strong></div>
          <div style="display: flex; justify-content: space-between"><span style="color: #888">Email:</span> <strong>${user.EmailNV || "Chưa cập nhật"}</strong></div>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function injectGlobalModals() {
  if (document.getElementById("javiAlertModal")) return;
  const modalHTML = `
    <!-- Custom Alert Modal -->
    <div class="modal-overlay" id="javiAlertModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); z-index: 9999; justify-content: center; align-items: center;">
      <div class="modal-content" style="background: var(--color-bg-surface, #222); padding: 30px; border-radius: 8px; border: 1px solid var(--color-border, #333); width: 400px; text-align: center; position: relative; animation: fadeIn 0.3s ease;">
        <div style="color: var(--color-primary, #ffc107); font-size: 50px; margin-bottom: 15px;"><i class="fas fa-bell"></i></div>
        <h3 style="color: #fff; margin-bottom: 15px; font-size: 20px;">Thông Báo</h3>
        <div id="javiAlertMessage" style="color: #ddd; font-size: 15px; margin-bottom: 25px; line-height: 1.6;"></div>
        <button class="btn" id="btnJaviAlertOk" style="background-color: var(--color-primary, #ffc107); color: #000; padding: 10px 40px; font-size: 16px; font-weight: bold; border-radius: 4px; border: none; cursor: pointer;">OK</button>
      </div>
    </div>
    
    <!-- Custom Confirm Modal -->
    <div class="modal-overlay" id="javiConfirmModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); z-index: 9999; justify-content: center; align-items: center;">
      <div class="modal-content" style="background: var(--color-bg-surface, #222); padding: 30px; border-radius: 8px; border: 1px solid var(--color-border, #333); width: 400px; text-align: center; position: relative; animation: fadeIn 0.3s ease;">
        <div style="color: var(--color-primary, #ffc107); font-size: 50px; margin-bottom: 15px;"><i class="fas fa-question-circle"></i></div>
        <h3 style="color: #fff; margin-bottom: 15px; font-size: 20px;">Thông Báo</h3>
        <div id="javiConfirmMessage" style="color: #ddd; font-size: 15px; margin-bottom: 25px; line-height: 1.6;"></div>
        <div style="display: flex; justify-content: center; gap: 15px;">
            <button class="btn" id="btnJaviConfirmCancel" style="background-color: #444; color: #fff; padding: 10px 25px; font-size: 14px; border-radius: 4px; border: none; cursor: pointer;">Hủy Bỏ</button>
            <button class="btn" id="btnJaviConfirmOk" style="background-color: var(--color-primary, #ffc107); color: #000; padding: 10px 25px; font-size: 14px; font-weight: bold; border-radius: 4px; border: none; cursor: pointer;">Đồng Ý</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  window.javiAlert = function (message) {
    return new Promise((resolve) => {
      const alertModal = document.getElementById("javiAlertModal");
      if (alertModal) {
        document.getElementById("javiAlertMessage").innerHTML = String(
          message,
        ).replace(/\n/g, "<br>");
        alertModal.style.display = "flex";
        const btnOk = document.getElementById("btnJaviAlertOk");
        btnOk.onclick = () => {
          alertModal.style.display = "none";
          resolve();
        };
      } else {
        console.log("Alert:", message);
        resolve();
      }
    });
  };

  // GHI ĐÈ HÀM MẶC ĐỊNH TRÌNH DUYỆT ĐỂ TỰ ĐỘNG ÁP DỤNG TRÊN TẤT CẢ CÁC TRANG CÒN LẠI
  window.alert = window.javiAlert;

  window.javiConfirm = function (message) {
    return new Promise((resolve) => {
      const confirmModal = document.getElementById("javiConfirmModal");
      if (confirmModal) {
        document.getElementById("javiConfirmMessage").innerHTML = String(
          message,
        ).replace(/\n/g, "<br>");
        confirmModal.style.display = "flex";
        const btnOk = document.getElementById("btnJaviConfirmOk");
        const btnCancel = document.getElementById("btnJaviConfirmCancel");
        const cleanup = () => {
          confirmModal.style.display = "none";
        };
        btnOk.onclick = () => {
          cleanup();
          resolve(true);
        };
        btnCancel.onclick = () => {
          cleanup();
          resolve(false);
        };
      } else {
        resolve(window.confirm(message));
      }
    });
  };
}

// Các sự kiện tắt bật Global
window.toggleUserDropdown = () =>
  document.getElementById("userDropdown").classList.toggle("show");
window.onclick = (e) => {
  if (!e.target.closest(".user-profile"))
    document
      .querySelectorAll(".user-dropdown")
      .forEach((d) => d.classList.remove("show"));
};
window.handleLogout = () => {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
};
window.openProfileModal = () => {
  document.getElementById("userDropdown").classList.remove("show");
  document.getElementById("profileModal").style.display = "flex";
};

// Tính năng mở/đóng menu con
window.toggleSubmenu = function (element) {
  const parentLi = element.parentElement;
  const submenu = parentLi.querySelector(".submenu");
  const icon = element.querySelector(".fa-chevron-down, .fa-chevron-up");

  const isOpening =
    submenu.style.display === "none" || submenu.style.display === "";

  if (isOpening) {
    // 1. Tự động đóng tất cả các menu con khác đang mở
    document.querySelectorAll(".sidebar-menu .has-submenu").forEach((li) => {
      if (li !== parentLi) {
        const otherSub = li.querySelector(".submenu");
        const otherIcon = li.querySelector(".fa-chevron-up");
        if (otherSub) otherSub.style.display = "none";
        if (otherIcon) {
          otherIcon.classList.remove("fa-chevron-up");
          otherIcon.classList.add("fa-chevron-down");
        }
      }
    });

    // 2. Mở menu hiện tại được click
    submenu.style.display = "block";
    if (icon) {
      icon.classList.remove("fa-chevron-down");
      icon.classList.add("fa-chevron-up");
    }
  } else {
    // 3. Nếu click vào menu đang mở thì thu gọn lại
    submenu.style.display = "none";
    if (icon) {
      icon.classList.remove("fa-chevron-up");
      icon.classList.add("fa-chevron-down");
    }
  }
};

// =========================================================================
// TÍNH NĂNG AUTOCOMPLETE GLOBAL (Hiển thị danh sách tìm kiếm thông minh)
// =========================================================================
const autocompleteCSS = document.createElement("style");
autocompleteCSS.textContent = `
  .autocomplete-wrapper { position: relative; flex: 1; display: block; width: 100%; }
  .autocomplete-wrapper input { width: 100%; box-sizing: border-box; }
  .autocomplete-list { position: absolute; z-index: 9999; top: calc(100% + 5px); left: 0; right: 0; background-color: #1a1a1a; border: 1px solid #333; max-height: 220px; overflow-y: auto; list-style: none; padding: 0; margin: 0; border-radius: 6px; display: none; box-shadow: 0 8px 16px rgba(0,0,0,0.8); }
  .autocomplete-list li { padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #2a2a2a; font-size: 14px; color: #eee; transition: all 0.2s ease; }
  .autocomplete-list li:last-child { border-bottom: none; }
  .autocomplete-list li:hover, .autocomplete-list li.active { background-color: var(--color-primary); color: #000; font-weight: 600; padding-left: 20px; }
  .autocomplete-list::-webkit-scrollbar { width: 6px; }
  .autocomplete-list::-webkit-scrollbar-track { background: #1a1a1a; border-radius: 6px; }
  .autocomplete-list::-webkit-scrollbar-thumb { background: #555; border-radius: 6px; }
  .autocomplete-list::-webkit-scrollbar-thumb:hover { background: #777; }
`;
document.head.appendChild(autocompleteCSS);

window.setupAutocomplete = function (inputId, dataArray) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input._autocompleteData = dataArray; // Gắn dữ liệu vào element để gọi lại khi cần

  // Chỉ khởi tạo giao diện bọc (wrapper) 1 lần duy nhất
  if (!input.parentNode.classList.contains("autocomplete-wrapper")) {
    const wrapper = document.createElement("div");
    wrapper.className = "autocomplete-wrapper";
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const list = document.createElement("ul");
    list.className = "autocomplete-list";
    wrapper.appendChild(list);

    let currentFocus = -1;

    const renderList = function (val) {
      const data = input._autocompleteData || [];
      val = val.toLowerCase();
      list.innerHTML = "";
      currentFocus = -1;

      // Hiển thị tất cả nếu ô trống, ngược lại lọc theo từ khóa
      const matches =
        val === ""
          ? data
          : data.filter((item) => item.toLowerCase().includes(val));

      if (matches.length > 0) {
        list.style.display = "block";
        matches.forEach((match) => {
          const li = document.createElement("li");
          // Bôi vàng từ khóa được tìm thấy
          li.innerHTML = match.replace(
            new RegExp(val, "gi"),
            (m) =>
              `<span style="color: var(--color-primary); font-weight:bold;">${m}</span>`,
          );
          li.addEventListener("click", function (e) {
            e.stopPropagation();
            input.value = match; // Trả lại text thuần
            list.style.display = "none";
            input.dispatchEvent(new Event("change"));
          });
          list.appendChild(li);
        });
      } else {
        list.style.display = "none";
      }
    };

    // Các sự kiện tương tác
    input.addEventListener("focus", function () {
      renderList(this.value);
    });
    input.addEventListener("click", function (e) {
      e.stopPropagation();
      renderList(this.value);
    });
    input.addEventListener("input", function () {
      renderList(this.value);
    });

    input.addEventListener("keydown", function (e) {
      const items = list.querySelectorAll("li");
      if (list.style.display === "none") return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        currentFocus++;
        addActive(items);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        currentFocus--;
        addActive(items);
      } else if (e.key === "Enter") {
        if (list.style.display === "block" && items.length > 0) {
          e.preventDefault(); // Chặn hành vi submit form mặc định
          if (currentFocus > -1 && items[currentFocus])
            items[currentFocus].click();
          else items[0].click(); // Auto chọn cái đầu tiên nếu ấn Enter mà không cuộn
        }
      }
    });

    function addActive(items) {
      if (!items || items.length === 0) return false;
      items.forEach((i) => i.classList.remove("active"));
      if (currentFocus >= items.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = items.length - 1;
      items[currentFocus].classList.add("active");
      items[currentFocus].scrollIntoView({ block: "nearest" });
    }

    // Bấm ra ngoài thì đóng list
    document.addEventListener("click", function (e) {
      if (e.target !== input) list.style.display = "none";
    });
  }
};

// =========================================================================
// TÍNH NĂNG IN ẤN (HÓA ĐƠN, PHIẾU XUẤT/NHẬP) CHUYÊN NGHIỆP
// =========================================================================
window.printDocument = function (options) {
  // Hàm tiện ích hỗ trợ in chuyên nghiệp cho tất cả các trang
  // options = { title, id, date, customerName, customerPhone, customerAddress, items: [], total, discount, finalTotal, type: 'hoadon'|'phieunhap'|'phieuxuat' }

  // Ưu tiên lấy tên nhân viên thực tế lập phiếu từ options, nếu không có mới dùng người đang đăng nhập
  let empName = options.employeeName;
  if (!empName) {
    const currentUserData = localStorage.getItem("currentUser");
    const user = currentUserData
      ? JSON.parse(currentUserData)
      : { HoTenNV: "...................." };
    empName = user.HoTenNV;
  }
  const printTime = new Date().toLocaleString("vi-VN"); // Lấy ngày giờ in thực tế

  // Tạo iframe ẩn để chứa bản in mà không làm hỏng giao diện trang nền đen hiện tại
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  // Chỉnh sửa khung ký tên tùy theo loại chứng từ
  let signatureHTML = "";
  if (options.type === "hoadon" || options.type === "phieuxuat") {
    signatureHTML = `
      <div class="signature-box">
        <p>Khách hàng</p>
        <span class="note">(Ký, ghi rõ họ tên)</span>
      </div>
      <div class="signature-box">
        <p>Người lập phiếu</p>
        <span class="note">(Ký, ghi rõ họ tên)</span>
        <p style="margin-top: 60px; font-weight: normal;">${empName}</p>
      </div>
    `;
  } else {
    signatureHTML = `
      <div class="signature-box">
        <p>Người giao hàng</p>
        <span class="note">(Ký, ghi rõ họ tên)</span>
      </div>
      <div class="signature-box">
        <p>Thủ kho / Kế toán</p>
        <span class="note">(Ký, ghi rõ họ tên)</span>
      </div>
      <div class="signature-box">
        <p>Người lập phiếu</p>
        <span class="note">(Ký, ghi rõ họ tên)</span>
        <p style="margin-top: 60px; font-weight: normal;">${empName}</p>
      </div>
    `;
  }

  // Thiết kế giao diện HTML bản in chuẩn A4/A5 nền trắng chữ đen
  const html = `
    <html>
    <head>
      <title>In ${options.title}</title>
      <style type="text/css" media="print">@page { size: A5 portrait; margin: 0; }</style>
      <style>
        body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 20px; font-size: 14px; background: #fff; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { flex: 0 0 150px; }
        .logo img { width: 100%; height: auto; }
        .company-info { flex: 1; padding-left: 20px; line-height: 1.5; }
        .company-info h2 { margin: 0 0 5px 0; font-size: 18px; text-transform: uppercase; font-weight: bold; }
        .title-section { text-align: center; margin-bottom: 20px; }
        .title-section h1 { font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 0 0 5px 0; }
        .title-section p { font-style: italic; margin: 0; color: #333; }
        .info-group { margin-bottom: 15px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2 !important; print-color-adjust: exact; font-weight: bold; text-align: center; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .summary { width: 50%; margin-left: auto; border-collapse: collapse; }
        .summary td { border: none; padding: 5px 8px; }
        .summary .total { font-weight: bold; font-size: 16px; border-top: 1px solid #000; }
        .signatures { display: flex; justify-content: space-around; margin-top: 30px; }
        .signature-box { text-align: center; }
        .signature-box p { font-weight: bold; margin: 0 0 5px 0; }
        .signature-box .note { font-style: italic; font-size: 12px; display: block; color: #555; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <img src="images/logo-javi-scan.png" alt="JAVI COFFEE" />
        </div>
        <div class="company-info">
          <h2>CÔNG TY TNHH JAVI COFFEE</h2>
          <div><strong>Mã số thuế:</strong> 0314857973</div>
          <div><strong>Địa chỉ:</strong> 13 Đường số 7, Khu Phố 5, Phường Linh Chiểu, Thành phố Hồ Chí Minh</div>
          <div><strong>Điện thoại:</strong> 0909979012</div>
        </div>
      </div>

      <div class="title-section">
        <h1>${options.title}</h1>
        <p>Ngày in: ${printTime} | Mã số: ${options.id}</p>
      </div>

      <div class="info-group">
        <div><strong>Khách hàng:</strong> ${options.customerName || "......................................................."}</div>
        ${options.customerPhone ? `<div><strong>Điện thoại:</strong> ${options.customerPhone}</div>` : ""}
        ${options.customerAddress ? `<div><strong>Địa chỉ:</strong> ${options.customerAddress}</div>` : ""}
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 5%">STT</th>
            <th style="width: 35%">Tên hàng hóa, dịch vụ</th>
            <th style="width: 10%">ĐVT</th>
            <th style="width: 10%">SL</th>
            <th style="width: 15%">Đơn giá</th>
            <th style="width: 10%">Giảm giá</th>
            <th style="width: 15%">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${
            options.items && options.items.length > 0
              ? options.items
                  .map((item, index) => {
                    const qty = item.quantity || item.SoLuong || 0;
                    const price = item.price || item.GiaBan || 0;
                    const disc = item.GiamGiaSP || item.giamGia || 0;
                    const lineTotal = qty * price * (1 - disc);
                    return `
            <tr>
              <td class="text-center">${index + 1}</td>
              <td>${item.name || item.TenSP || ""}</td>
              <td class="text-center">${item.unit || item.DonViTinh || "-"}</td>
              <td class="text-center">${qty}</td>
              <td class="text-right">${new Intl.NumberFormat("vi-VN").format(price)} đ</td>
              <td class="text-center">${(disc * 100).toFixed(0)}%</td>
              <td class="text-right">${new Intl.NumberFormat("vi-VN").format(lineTotal)} đ</td>
            </tr>
          `;
                  })
                  .join("")
              : '<tr><td colspan="7" class="text-center">Trống</td></tr>'
          }
        </tbody>
      </table>

      <table class="summary">
        <tr>
          <td>Tổng cộng:</td>
          <td class="text-right">${new Intl.NumberFormat("vi-VN").format(options.total || options.TongTienDonHang || 0)} đ</td>
        </tr>
        <tr>
          <td>Giảm giá khách hàng:</td>
          <td class="text-right">- ${new Intl.NumberFormat("vi-VN").format(options.cusDiscountAmt || options.TongGiamGiaKH || 0)} đ</td>
        </tr>
        <tr>
          <td>Giảm giá khác:</td>
          <td class="text-right">- ${new Intl.NumberFormat("vi-VN").format(options.extraDiscountAmount || options.TongGiamGiaKhac || 0)} đ</td>
        </tr>
        <tr>
          <td class="total">Tổng thanh toán:</td>
          <td class="text-right total">${new Intl.NumberFormat("vi-VN").format(options.finalTotal || options.TongTienThanhToan || 0)} đ</td>
        </tr>
      </table>

      <div class="signatures">
        ${signatureHTML}
      </div>
    </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  // Đợi logo trắng đen load xong (500ms) rồi tự động bung giao diện in
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    // Dọn rác bộ nhớ sau khi in xong
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
};
