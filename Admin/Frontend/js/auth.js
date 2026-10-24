// Tùy chọn giao diện của từng trình duyệt: chế độ sáng/tối và ghim thanh menu trái.
// Chạy đồng bộ trong <head> để trang không nháy sai giao diện khi tải.
const JAVI_THEME_KEY = "javiAdminTheme";
const JAVI_SIDEBAR_PIN_KEY = "javiSidebarPinned";
const javiPinMedia = window.matchMedia("(min-width: 901px)");
function applyJaviTheme(theme) {
  document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
  document.querySelectorAll(".theme-toggle").forEach(syncThemeToggle);
}
function syncThemeToggle(button) {
  const light = document.documentElement.dataset.theme === "light";
  button.setAttribute("aria-pressed", String(light));
  button.title = light ? "Chuyển sang giao diện tối" : "Chuyển sang giao diện sáng";
  button.setAttribute("aria-label", button.title);
  button.innerHTML = `<i class="bi ${light ? "bi-moon-stars" : "bi-sun"}" aria-hidden="true"></i>`;
}
function applySidebarPin() {
  const pinned = localStorage.getItem(JAVI_SIDEBAR_PIN_KEY) === "1";
  document.documentElement.classList.toggle("sidebar-pinned", pinned && javiPinMedia.matches);
  document.querySelectorAll(".sidebar-pin").forEach((button) => {
    button.setAttribute("aria-pressed", String(pinned));
    button.title = pinned ? "Bỏ ghim thanh menu" : "Ghim thanh menu";
    button.setAttribute("aria-label", button.title);
    button.innerHTML = `<i class="bi ${pinned ? "bi-pin-angle-fill" : "bi-pin-angle"}" aria-hidden="true"></i>`;
  });
}
applyJaviTheme(localStorage.getItem(JAVI_THEME_KEY));
applySidebarPin();
javiPinMedia.addEventListener("change", applySidebarPin);

// Tự động đính kèm token xác thực vào mọi lời gọi API của hệ thống.
(function installAuthenticatedFetch() {
  const nativeFetch = window.fetch.bind(window);
  let pendingCoffeeLoads = 0;

  window.fetch = async function authenticatedFetch(input, init = {}) {
    const requestUrl =
      typeof input === "string" ? input : input && input.url ? input.url : "";
    const isApiRequest = requestUrl.startsWith("/api/") ||
      requestUrl.startsWith(`${window.location.origin}/api/`);

    let token = null;
    try {
      token = JSON.parse(localStorage.getItem("currentUser") || "null")?.AuthToken;
    } catch (_err) {
      localStorage.removeItem("currentUser");
    }

    const options = { ...init };
    if (isApiRequest && token) {
      const headers = new Headers(
        init.headers || (typeof input !== "string" && input ? input.headers : undefined),
      );
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      options.headers = headers;
    }

    let loadingTimer;
    let loaderShown = false;
    if (isApiRequest) {
      loadingTimer = window.setTimeout(() => {
        loaderShown = true;
        pendingCoffeeLoads += 1;
        window.showCoffeeLoading?.("Đang tải dữ liệu...");
      }, 450);
    }

    let response;
    try {
      response = await nativeFetch(input, options);
    } finally {
      if (loadingTimer) window.clearTimeout(loadingTimer);
      if (loaderShown && pendingCoffeeLoads > 0) {
        pendingCoffeeLoads -= 1;
        if (pendingCoffeeLoads === 0) window.hideCoffeeLoading?.();
      }
    }
    if (isApiRequest && token && response.status === 401) {
      localStorage.removeItem("currentUser");
      if (!window.location.pathname.endsWith("/login.html")) {
        window.location.replace("/landing_page/login.html?mode=admin&expired=1");
      }
    }
    return response;
  };
})();

// =========================================================================
// Nạp bộ Bootstrap Icons nội bộ dùng chung cho toàn bộ màn hình quản trị.
// =========================================================================
(function ensureIconFont() {
  if (document.querySelector('link[href*="bootstrap-icons"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/vendor/bootstrap-icons/bootstrap-icons.min.css";
  document.head.appendChild(link);
})();

// =========================================================================
// HỆ THỐNG LOADING HẠT CÀ PHÊ 3D LẬT QUA LẠI KHI ĐỢI TẢI THÔNG TIN
// =========================================================================
function ensureCoffeeLoader() {
  let loader = document.getElementById("javiCoffeeLoader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "javiCoffeeLoader";
    loader.className = "javi-coffee-loader-overlay";
    loader.innerHTML = `
      <div class="javi-coffee-loader-box">
        <div class="coffee-bean-flip-anim">
          <svg viewBox="0 0 64 64" width="68" height="68" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="coffeeBean3DGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffe066"/>
                <stop offset="30%" stop-color="#ffd700"/>
                <stop offset="70%" stop-color="#c68a4c"/>
                <stop offset="100%" stop-color="#5a3818"/>
              </linearGradient>
              <linearGradient id="coffeeBeanCrease" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#2a1506"/>
                <stop offset="100%" stop-color="#140902"/>
              </linearGradient>
              <filter id="coffeeBeanShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(255, 215, 0, 0.45)" />
              </filter>
            </defs>
            <ellipse cx="32" cy="32" rx="26" ry="18" transform="rotate(-32 32 32)" fill="url(#coffeeBean3DGrad)" filter="url(#coffeeBeanShadow)"/>
            <path d="M 19 15 Q 30 29 33 32 T 45 49" fill="none" stroke="url(#coffeeBeanCrease)" stroke-width="3.2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="coffee-loader-title" id="coffeeLoaderTitle">Đang kiểm tra thông tin...</div>
        <div class="coffee-loader-desc">Vui lòng chờ trong giây lát</div>
      </div>
    `;
    if (document.body) {
      document.body.appendChild(loader);
    } else {
      window.addEventListener("DOMContentLoaded", () => document.body.appendChild(loader));
    }
  }
  return loader;
}

window.showCoffeeLoading = function (message = "Đang kiểm tra thông tin...") {
  const loader = ensureCoffeeLoader();
  const title = loader.querySelector("#coffeeLoaderTitle");
  if (title) title.textContent = message;
  loader.style.display = "flex";
  void loader.offsetWidth;
  loader.classList.add("active");
};

window.hideCoffeeLoading = function () {
  const loader = document.getElementById("javiCoffeeLoader");
  if (loader) {
    loader.classList.remove("active");
    setTimeout(() => {
      if (!loader.classList.contains("active")) {
        loader.style.display = "none";
      }
    }, 250);
  }
};

const coffeeLoaderStyles = document.createElement("style");
coffeeLoaderStyles.textContent = `
  .javi-coffee-loader-overlay { position:fixed; inset:0; z-index:100001; display:none; align-items:center; justify-content:center; background:rgba(4,6,8,.38); backdrop-filter:blur(2px); opacity:0; transition:opacity .2s ease; }
  .javi-coffee-loader-overlay.active { opacity:1; }
  .javi-coffee-loader-box { display:grid; place-items:center; gap:7px; min-width:158px; padding:16px 20px; border:1px solid rgba(234,201,87,.38); border-radius:15px; background:rgba(15,18,23,.96); box-shadow:0 18px 45px rgba(0,0,0,.46); color:#f4f6f8; text-align:center; }
  .coffee-bean-flip-anim { height:48px; perspective:180px; animation:javiCoffeeBeanFlip 1s ease-in-out infinite; }
  .coffee-bean-flip-anim svg { width:48px; height:48px; overflow:visible; }
  .coffee-loader-title { font-size:12px; font-weight:700; }.coffee-loader-desc { color:#9ba7b7; font-size:10px; }
  @keyframes javiCoffeeBeanFlip { 0%,100% { transform:rotateY(0deg) scale(1); } 50% { transform:rotateY(180deg) scale(1.08); } }
`;
document.head.appendChild(coffeeLoaderStyles);

// =========================================================================
// HỆ THỐNG THÔNG BÁO DẠNG TOAST TOÀN CỤC (CÓ NÚT X ĐÓNG NGAY, TỰ TẮT SAU N GIÂY)
// =========================================================================
function ensureToastContainer() {
  let container = document.getElementById("javiToastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "javiToastContainer";
    container.className = "javi-toast-container";
    if (document.body) {
      document.body.appendChild(container);
    } else {
      window.addEventListener("DOMContentLoaded", () => {
        if (!document.getElementById("javiToastContainer")) {
          document.body.appendChild(container);
        }
      });
    }
  }
  return container;
}

window.showToast = function (message, type = "info", duration = 4000) {
  return new Promise((resolve) => {
    const lowerMsg = String(message || "").toLowerCase();
    let toastType = type;
    if (toastType === "info") {
      if (
        lowerMsg.includes("thành công") ||
        lowerMsg.includes("hoàn tất") ||
        lowerMsg.includes("đã lưu") ||
        lowerMsg.includes("đã tạo") ||
        lowerMsg.includes("đã cập nhật") ||
        lowerMsg.includes("đã xóa") ||
        lowerMsg.includes("thêm thành công")
      ) {
        toastType = "success";
      } else if (
        lowerMsg.includes("lỗi") ||
        lowerMsg.includes("thất bại") ||
        lowerMsg.includes("không chính xác") ||
        lowerMsg.includes("sai") ||
        lowerMsg.includes("không hợp lệ") ||
        lowerMsg.includes("không có quyền") ||
        lowerMsg.includes("hết hạn")
      ) {
        toastType = "error";
      } else if (
        lowerMsg.includes("cảnh báo") ||
        lowerMsg.includes("chú ý") ||
        lowerMsg.includes("lưu ý") ||
        lowerMsg.includes("vui lòng")
      ) {
        toastType = "warning";
      }
    }

    const icons = {
      success: '<i class="bi bi-check-circle"></i>',
      error: '<i class="bi bi-x-circle"></i>',
      warning: '<i class="bi bi-exclamation-triangle"></i>',
      info: '<i class="bi bi-bell"></i>',
    };

    const titles = {
      success: "Thành Công",
      error: "Thông Báo Lỗi",
      warning: "Cảnh Báo",
      info: "Thông Báo",
    };

    const container = ensureToastContainer();
    const toast = document.createElement("div");
    toast.className = `javi-toast javi-toast-${toastType}`;
    // Toast tĩnh, không chạy thanh progress bar chuyển động, có nút X đóng tức thì
    toast.innerHTML = `
      <div class="javi-toast-icon">${icons[toastType] || icons.info}</div>
      <div class="javi-toast-content">
        <div class="javi-toast-title">${titles[toastType] || "Thông Báo"}</div>
        <div class="javi-toast-msg">${String(message).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])).replace(/\n/g,"<br>")}</div>
      </div>
      <button class="javi-toast-close" title="Đóng ngay">&times;</button>
    `;

    const closeBtn = toast.querySelector(".javi-toast-close");
    let dismissTimeout;

    const dismissToast = () => {
      clearTimeout(dismissTimeout);
      toast.classList.add("hiding");
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
        resolve();
      }, 250);
    };

    closeBtn.onclick = (e) => {
      e.stopPropagation();
      dismissToast();
    };

    // Tự động tắt sau N giây (nếu người dùng không bấm X)
    dismissTimeout = setTimeout(dismissToast, duration);

    if (container.parentElement) {
      container.appendChild(toast);
    } else {
      window.addEventListener("DOMContentLoaded", () => {
        container.appendChild(toast);
      });
    }

    while (container.children.length > 5) {
      container.firstChild.remove();
    }
  });
};

window.javiAlert = function (message, type = "info") {
  return window.showToast(message, type);
};
window.alert = window.javiAlert;

// Xác thực và tiện ích giao diện dùng chung cho toàn bộ frontend.

// KHẮC PHỤC LỖI GIẬT SIDEBAR: Tắt tạm thời hiệu ứng co giãn lúc trang vừa tải để Sidebar giữ nguyên trạng thái mở
document.documentElement.classList.add("preload-transitions");
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.documentElement.classList.remove("preload-transitions");
  }, 100);
});

document.addEventListener("DOMContentLoaded", () => {
  // Trang in chỉ cần lớp gọi API có token; không dựng sidebar hay modal quản trị.
  if (window.location.pathname.endsWith("/in-chung-tu.html")) {
    if (!localStorage.getItem("currentUser")) {
      window.location.replace("/landing_page/login.html?mode=admin");
    }
    return;
  }

  // 0. GẮN MODAL THÔNG BÁO ALERT GLOBAL ĐỂ DÙNG ĐƯỢC NGAY TRÊN TOÀN HỆ THỐNG
  injectGlobalModals();
  injectRightDrawerStyles();
  openStandaloneFormFromUrl();

  const currentUserData = localStorage.getItem("currentUser");
  const currentPage = document.body.dataset.importModule
    ? (document.body.dataset.returnPage || document.body.dataset.importModule) + ".html"
    : window.location.pathname.split("/").pop();

  // TỰ ĐỘNG ĐĂNG XUẤT SAU 30 PHÚT KHÔNG HOẠT ĐỘNG (Áp dụng cho cả Admin và Khách hàng đã đăng nhập)
  if (currentUserData) {
    let inactivityTimer;
    function resetInactivityTimer() {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(
        () => {
          localStorage.removeItem("currentUser");
          window.location.replace("/landing_page/login.html?mode=admin&expired=1");
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
    resetInactivityTimer();
  }

  // Trang mua hàng và giỏ hàng của KH có cơ chế đăng nhập riêng; không áp dụng phân quyền dành cho trang quản trị.
  const customerPages = ["mua-hang.html", "gio-hang.html"];
  if (customerPages.includes(currentPage)) return;

  if (currentPage === "login.html") return;
  if (currentUserData && JSON.parse(currentUserData).VaiTro === "KHACH_HANG") {
    window.location.replace("/landing_page/login.html?mode=admin");
    return;
  }

  // 1. CHƯA ĐĂNG NHẬP: Ép văng ra màn hình đăng nhập (Ngoại trừ file login)
  if (!currentUserData) {
    if (currentPage !== "login.html") {
      window.location.href = "/landing_page/login.html?mode=admin";
    }
    return;
  }

  // 2. ĐÃ ĐĂNG NHẬP: Bỏ qua trang đăng nhập để vào thẳng Dashboard
  if (currentPage === "login.html" || currentPage === "") {
    const user = JSON.parse(currentUserData);
    window.location.href =
      user.VaiTro === "KHACH_HANG"
        ? "/landing_page/mua-hang.html"
        : "/admin/dashboard.html";
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
          "Trọng Lượng", "Loại Xay",
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
          "Trọng Lượng", "Loại Xay",
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
      "loai-sp.html", "trong-luong.html", "loai-xay.html",
      "loai-kh.html",
    ].includes(currentPage)
  )
    pageAllowed = true;
  else if (
    chucVu === "Kho" &&
    [
      "dashboard.html",
      "san-pham.html",
      "loai-sp.html", "trong-luong.html", "loai-xay.html",
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

// Dùng chung một drawer bên phải cho các form và cửa sổ nghiệp vụ.
// Alert, confirm và hồ sơ cá nhân vẫn dùng bố cục riêng.
function injectRightDrawerStyles() {
  if (document.getElementById("rightDrawerStyles")) return;

  if (document.querySelector(".sidebar")) {
    document.body.classList.add("has-app-sidebar");
  }

  const style = document.createElement("style");
  style.id = "rightDrawerStyles";
  style.textContent = `
    body.standalone-form-view > .main-content {
      visibility: hidden !important;
      pointer-events: none !important;
    }

    body.javi-modal-open .sidebar,
    body.javi-modal-open .sidebar:hover,
    body.javi-modal-open .sidebar:has(:focus-visible) {
      width: var(--sidebar-rail-w, var(--sidebar-collapsed-w, 76px)) !important;
      pointer-events: none !important;
      opacity: .35 !important;
      filter: grayscale(.8) !important;
      box-shadow: none !important;
      transition: opacity .18s ease !important;
    }
    body.javi-modal-open::after {
      content: "";
      position: fixed;
      inset: 0 auto 0 0;
      width: var(--sidebar-rail-w, var(--sidebar-collapsed-w, 76px));
      z-index: 1999;
      background: rgba(3, 5, 8, .5);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      cursor: default;
    }
    body.has-app-sidebar .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal) > .modal-content {
      border-radius: 0 !important;
    }
    body.has-app-sidebar .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal) > .modal-content:has(> .modal-footer) {
      display: flex !important;
      flex-direction: column !important;
    }
    body.has-app-sidebar .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal) > .modal-content > .modal-footer {
      position: sticky !important;
      bottom: -28px !important;
      z-index: 3;
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: 10px !important;
      flex: 0 0 72px !important;
      box-sizing: border-box !important;
      min-height: 72px !important;
      margin: auto -28px -28px !important;
      padding: 12px 28px !important;
      border-top: 1px solid var(--app-border, #2a323c) !important;
      background: var(--app-surface, #12161b) !important;
    }
    body.has-app-sidebar .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal) > .modal-content:has(> form) {
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) .modal-content {
      padding: 0 !important;
      background: var(--app-surface, #12161b) !important;
      border: 1px solid var(--app-border, #2a323c) !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) > .modal-content > form {
      display: flex !important;
      flex: 1 1 auto !important;
      flex-direction: column !important;
      min-height: 0 !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      padding: 14px 24px 0 !important;
      scrollbar-gutter: stable;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) > .modal-content > form > * {
      flex-shrink: 0;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) .form-group {
      margin-bottom: 14px !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) .form-group label {
      margin-bottom: 6px !important;
      color: var(--ui-text-soft, #cbd3de) !important;
      font-size: 12px !important;
      font-weight: 650 !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal) > .modal-content > .modal-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      box-sizing: border-box !important;
      flex: 0 0 auto !important;
      min-height: 52px !important;
      gap: 12px !important;
      margin: 0 !important;
      padding: 8px 20px !important;
      border-bottom: 1px solid var(--app-border, #2a323c) !important;
      background: linear-gradient(90deg, rgba(234,201,87,.12), transparent 52%), var(--app-surface, #12161b) !important;
      top: 0 !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal) > .modal-content > .modal-header h3 {
      margin: 0 !important;
      color: var(--ui-text, #f1f4f7) !important;
      font-size: 16px !important;
      line-height: 1.4 !important;
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal) > .modal-content > .modal-header h3 i {
      color: var(--app-accent, #eac957) !important;
      margin-right: 7px;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):not(:has(form)) > .modal-content > .modal-header {
      margin: -28px -28px 18px !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal) > .modal-content.document-detail > .modal-header {
      margin: 0 !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal) > .modal-content > .modal-header :is(.close-btn, .modal-close) {
      display: grid;
      place-items: center;
      flex: 0 0 32px;
      width: 32px !important;
      height: 32px !important;
      min-height: 32px !important;
      padding: 0 !important;
      font-size: 22px !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) .form-row {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 0 14px !important;
      align-items: start !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) .form-row[style*="display: none"] {
      display: none !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) .form-row:has(> .form-group:nth-child(3)) {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) .form-row:has(> .form-group:nth-child(3)) > .form-group:first-child {
      grid-column: 1 / -1;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) .form-row:has(> .form-group:nth-child(4)) {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) .form-row:has(> .form-group:only-child) {
      grid-template-columns: minmax(0, 1fr) !important;
    }
    .modal-overlay:has(form) .form-row > .form-group {
      min-width: 0 !important;
      width: 100% !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) #productForm > .form-row:has(#maSP) {
      grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) #addForm > .form-row:has(#hoTen) {
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) !important;
    }
    #productForm > .form-row:has(#maSP) > .form-group:first-child { grid-column: auto; }
    .modal-overlay:not(:has(form)) .table-responsive { overflow-x: auto; }
    .modal-overlay .section-title, .modal-overlay .card-panel-header {
      font-family: var(--font-heading) !important;
      margin: 8px 0 14px !important;
      padding: 0 0 8px !important;
      border-bottom: 1px solid rgba(234,201,87,.2) !important;
      color: var(--app-accent, #eac957) !important;
      font-size: 12px !important;
      font-weight: 750 !important;
      letter-spacing: .04em !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) input:not([type="checkbox"]):not([type="radio"]),
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) select,
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) textarea {
      min-height: 42px !important;
      border-radius: 9px !important;
      background: var(--ui-input, #0d1014) !important;
      border-color: var(--ui-border-strong, #34404d) !important;
      color: var(--ui-text, #edf1f5) !important;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) textarea {
      min-height: 88px !important;
      resize: vertical;
    }
    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) > .modal-content > form > :is(.modal-footer, div:last-child:has(> button)) {
      position: sticky;
      bottom: 0;
      z-index: 3;
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: 10px !important;
      flex: 0 0 72px !important;
      box-sizing: border-box !important;
      min-height: 72px !important;
      margin: auto -24px 0 !important;
      padding: 12px 24px !important;
      border-top: 1px solid var(--app-border, #2a323c) !important;
      background: var(--app-surface, #12161b) !important;
    }

    .order-entry-drawer > .order-entry-drawer-content {
      width: 100% !important;
      max-width: none !important;
      padding: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
    }

    .order-entry-drawer .order-entry-frame {
      display: block;
      flex: 1 1 auto;
      width: 100%;
      min-height: 0;
      border: 0;
      background: var(--color-bg-main, #111);
    }

    .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal) .modal-header {
      position: sticky;
      top: -1px;
      z-index: 2;
      background: var(--color-bg-surface, #1c1c1c);
      padding-top: 4px;
    }

    @media (max-width: 900px) {
      .order-entry-drawer > .order-entry-drawer-content {
        width: 100% !important;
        max-width: none !important;
      }
    }
    @media (max-width: 640px) {
      .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) .form-row {
        grid-template-columns: 1fr !important;
      }
      .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) .form-row:has(> .form-group:nth-child(3)),
      .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) .form-row:has(> .form-group:nth-child(4)) {
        grid-template-columns: 1fr !important;
      }
      .modal-overlay:has(form) .form-row:has(> .form-group:nth-child(3)) > .form-group:first-child {
        grid-column: auto;
      }
      .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) #productForm > .form-row:has(#maSP),
      .modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal):has(form) #addForm > .form-row:has(#hoTen) { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(style);
}

function watchBusinessModals() {
  if (!document.body.classList.contains("has-app-sidebar")) return;
  const drawers = document.querySelectorAll(
    ".modal-overlay:not(#javiAlertModal):not(#javiConfirmModal):not(#profileModal)",
  );
  const sidebar = document.querySelector(".sidebar");
  const update = () => {
    const isOpen = Array.from(drawers).some((drawer) =>
      window.getComputedStyle(drawer).display !== "none",
    );
    document.body.classList.toggle("javi-modal-open", isOpen);
    if (isOpen && document.activeElement?.closest(".sidebar")) document.activeElement.blur();
    if (sidebar) sidebar.inert = isOpen;
  };
  const observer = new MutationObserver(update);
  drawers.forEach((drawer) => observer.observe(drawer, { attributes: true, attributeFilter: ["style", "class"] }));
  update();
}

document.addEventListener("DOMContentLoaded", watchBusinessModals);

// Điều hướng tới URL riêng của form, ví dụ khach-hang.html?form=addModal.
window.openStandaloneForm = function (modalId) {
  const url = new URL(window.location.href);
  url.searchParams.set("form", modalId);
  window.location.href = url.toString();
};

function openStandaloneFormFromUrl() {
  const formId = new URLSearchParams(window.location.search).get("form");
  if (!formId) return;

  const formModal = document.getElementById(formId);
  if (!formModal || !formModal.classList.contains("modal-overlay")) return;

  document.body.classList.add("standalone-form-view");
  if (
    formId === "createInvoiceModal" &&
    typeof window.openCreateInvoiceModal === "function"
  ) {
    window.openCreateInvoiceModal();
  } else if (
    formId === "createModal" &&
    typeof window.openCreateModal === "function"
  ) {
    window.openCreateModal();
  } else if (typeof window.openModal === "function") {
    window.openModal();
  } else {
    formModal.style.display = "flex";
  }

  // Đóng/hủy hoặc lưu thành công sẽ quay về URL danh sách.
  const returnToList = () => {
    if (getComputedStyle(formModal).display !== "none") return;
    const listUrl = new URL(window.location.href);
    if (!listUrl.searchParams.has("form")) return;
    listUrl.searchParams.delete("form");
    window.location.href = listUrl.toString();
  };
  const closeObserver = new MutationObserver(returnToList);
  closeObserver.observe(formModal, {
    attributes: true,
    attributeFilter: ["style", "class"],
  });
}

function renderGlobalSidebar() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  const currentPath = window.location.pathname;
  const currentPage = currentPath.substring(currentPath.lastIndexOf("/") + 1) || "dashboard.html";

  const isDanhSachActive = [
    "khach-hang.html",
    "loai-kh.html",
    "nha-cung-cap.html",
    "san-pham.html",
    "loai-sp.html", "trong-luong.html", "loai-xay.html", "ma-giam-gia.html", "dia-diem-van-chuyen.html",
  ].includes(currentPage);

  const isKhoActive = [
    "nhap-kho.html",
    "xuat-kho.html",
    "ton-kho.html",
  ].includes(currentPage);

  const isThuChiActive = [
    "phieu-thu.html",
    "phieu-chi.html",
  ].includes(currentPage);

  // Sidebar dùng chung bộ Bootstrap Icons với toàn bộ quản trị.
  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <a href="dashboard.html" title="JAVI COFFEE">
        <img src="images/logo-javi.png" alt="JAVI COFFEE" class="javi-logo-sidebar" />
        <span class="sidebar-brand-symbol" aria-hidden="true"></span>
        <span class="sidebar-brand-name">JAVI COFFEE</span>
      </a>
      <button type="button" class="sidebar-pin"></button>
    </div>
    <ul class="sidebar-menu">
      <li>
        <a href="dashboard.html" data-menu="Trang Chủ" class="${currentPage === "dashboard.html" ? "active" : ""}" title="Trang Chủ">
           <i class="bi bi-house"></i>
          <span class="menu-text">Trang Chủ</span>
        </a>
      </li>
      
      <li>
        <a href="don-hang.html" data-menu="Bán Hàng" class="${currentPage === "don-hang.html" ? "active" : ""}" title="Bán Hàng">
           <i class="bi bi-cart3"></i>
          <span class="menu-text">Bán Hàng</span>
        </a>
      </li>

      <li>
        <a href="hoa-don.html" data-menu="Hóa Đơn" class="${currentPage === "hoa-don.html" ? "active" : ""}" title="Hóa Đơn">
           <i class="bi bi-journal-text"></i>
          <span class="menu-text">Hóa Đơn</span>
        </a>
      </li>

      <li>
        <a href="cong-no.html" data-menu="Công Nợ" class="${currentPage === "cong-no.html" ? "active" : ""}" title="Công Nợ">
           <i class="bi bi-currency-exchange"></i>
          <span class="menu-text">Công Nợ</span>
        </a>
      </li>

      <li class="has-submenu ${isKhoActive ? "open" : ""}">
         <a href="#" data-menu="Quản Lý Kho" onclick="toggleSubmenu(this); return false;" class="${isKhoActive ? "active" : ""}" title="Quản Lý Kho" aria-expanded="${isKhoActive}">
           <i class="bi bi-shop"></i>
           <span class="menu-text">
             <span>Quản Lý Kho</span>
             <i class="bi bi-chevron-down submenu-arrow"></i>
           </span>
         </a>
         <ul class="submenu">
           <li><a href="nhap-kho.html" data-menu="Nhập Kho" class="${currentPage === "nhap-kho.html" ? "active" : ""}"><i class="bi bi-box-arrow-in-down"></i><span>Nhập Kho</span></a></li>
           <li><a href="xuat-kho.html" data-menu="Xuất Kho" class="${currentPage === "xuat-kho.html" ? "active" : ""}"><i class="bi bi-truck"></i><span>Xuất Kho</span></a></li>
           <li><a href="ton-kho.html" data-menu="Tồn Kho" class="${currentPage === "ton-kho.html" ? "active" : ""}"><i class="bi bi-archive"></i><span>Tồn Kho</span></a></li>
        </ul>
      </li>

      <li class="has-submenu ${isThuChiActive ? "open" : ""}">
         <a href="#" data-menu="Quản Lý Thu - Chi" onclick="toggleSubmenu(this); return false;" class="${isThuChiActive ? "active" : ""}" title="Quản Lý Thu - Chi" aria-expanded="${isThuChiActive}">
           <i class="bi bi-wallet2"></i>
           <span class="menu-text">
             <span>Quản Lý Thu - Chi</span>
             <i class="bi bi-chevron-down submenu-arrow"></i>
           </span>
         </a>
         <ul class="submenu">
           <li><a href="phieu-thu.html" data-menu="Phiếu Thu" class="${currentPage === "phieu-thu.html" ? "active" : ""}"><i class="bi bi-receipt"></i><span>Phiếu Thu</span></a></li>
           <li><a href="phieu-chi.html" data-menu="Phiếu Chi" class="${currentPage === "phieu-chi.html" ? "active" : ""}"><i class="bi bi-cash-coin"></i><span>Phiếu Chi</span></a></li>
        </ul>
      </li>

      <li>
        <a href="nhan-vien.html" data-menu="Quản Lý Người Dùng" class="${currentPage === "nhan-vien.html" ? "active" : ""}" title="Quản Lý Người Dùng">
           <i class="bi bi-shield-lock"></i>
          <span class="menu-text">Người Dùng</span>
        </a>
      </li>

      <li class="has-submenu ${isDanhSachActive ? "open" : ""}">
         <a href="#" data-menu="Danh Mục" onclick="toggleSubmenu(this); return false;" class="${isDanhSachActive ? "active" : ""}" title="Danh Mục" aria-expanded="${isDanhSachActive}">
           <i class="bi bi-grid"></i>
           <span class="menu-text">
             <span>Danh Mục</span>
             <i class="bi bi-chevron-down submenu-arrow"></i>
           </span>
         </a>
         <ul class="submenu">
           <li><a href="khach-hang.html" data-menu="Khách Hàng" class="${currentPage === "khach-hang.html" ? "active" : ""}"><i class="bi bi-person-badge"></i><span>Khách Hàng</span></a></li>
           <li><a href="loai-kh.html" data-menu="Loại Khách Hàng" class="${currentPage === "loai-kh.html" ? "active" : ""}"><i class="bi bi-award"></i><span>Loại Khách Hàng</span></a></li>
           <li><a href="nha-cung-cap.html" data-menu="Nhà Cung Cấp" class="${currentPage === "nha-cung-cap.html" ? "active" : ""}"><i class="bi bi-buildings"></i><span>Nhà Cung Cấp</span></a></li>
           <li><a href="san-pham.html" data-menu="Sản Phẩm" class="${currentPage === "san-pham.html" ? "active" : ""}"><i class="bi bi-cup-hot"></i><span>Sản Phẩm</span></a></li>
           <li><a href="loai-sp.html" data-menu="Loại Sản Phẩm" class="${currentPage === "loai-sp.html" ? "active" : ""}"><i class="bi bi-tag"></i><span>Loại Sản Phẩm</span></a></li>
           <li><a href="trong-luong.html" data-menu="Trọng Lượng" class="${currentPage === 'trong-luong.html' ? 'active' : ''}"><i class="bi bi-speedometer"></i><span>Trọng lượng</span></a></li>
           <li><a href="loai-xay.html" data-menu="Loại Xay" class="${currentPage === 'loai-xay.html' ? 'active' : ''}"><i class="bi bi-gear"></i><span>Loại xay</span></a></li>
<li><a href="ma-giam-gia.html" data-menu="Mã Giảm Giá" class="${currentPage === 'ma-giam-gia.html' ? 'active' : ''}"><i class="bi bi-ticket-perforated"></i><span>Mã Giảm Giá</span></a></li>
<li><a href="dia-diem-van-chuyen.html" data-menu="Danh Mục Địa Điểm" class="${currentPage === 'dia-diem-van-chuyen.html' ? 'active' : ''}"><i class="bi bi-geo-alt"></i><span>Danh Mục Địa Điểm</span></a></li>
        </ul>
      </li>

      <li>
        <a href="cau-hinh-website.html" data-menu="Cấu Hình Website" class="${currentPage === 'cau-hinh-website.html' ? 'active' : ''}" title="Cấu Hình Website">
          <i class="bi bi-globe2"></i><span class="menu-text">Cấu Hình Website</span>
        </a>
      </li>


      <li>
        <a href="quan-tri.html" data-menu="Quản Trị Hệ Thống" class="${currentPage === "quan-tri.html" ? "active" : ""}" title="Quản Trị Hệ Thống">
           <i class="bi bi-sliders"></i>
          <span class="menu-text">Hệ Thống</span>
        </a>
      </li>
    </ul>
  `;

  applySidebarPin();
  sidebar.querySelector(".sidebar-pin").addEventListener("click", () => {
    const pinned = localStorage.getItem(JAVI_SIDEBAR_PIN_KEY) === "1";
    localStorage.setItem(JAVI_SIDEBAR_PIN_KEY, pinned ? "0" : "1");
    applySidebarPin();
  });

  // Tự động đóng thanh menu và các phân hệ con khi di chuyển chuột rời khỏi menu (trừ khi đang ghim)
  sidebar.addEventListener("mouseleave", () => {
    if (document.documentElement.classList.contains("sidebar-pinned")) return;
    if (sidebar.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    sidebar.querySelectorAll(".sidebar-menu .has-submenu").forEach((item) => {
      const isCurrentActiveChild = item.querySelector(".submenu li > a.active");
      if (!isCurrentActiveChild) {
        item.classList.remove("open");
        item.querySelector(":scope > a")?.setAttribute("aria-expanded", "false");
      }
    });
  });

  sidebar.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link && link.getAttribute("href") === "#") e.preventDefault();
  });
}

// Vùng đầu trang danh sách: header (tiêu đề + người dùng) → card thống kê (ẩn, bật bằng icon Dashboard) →
// hàng nút thao tác (Thêm, Nhập file, Xuất file, Dashboard) → thanh tìm kiếm + bộ lọc + Xem kéo dài hết chiều ngang.
const normalizeGridSearch = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").toLowerCase().replace(/\s+/g, " ").trim();

window.applyGridSearch = function (table) {
  if (table.dataset.gridSearch !== "true") return;
  const term = normalizeGridSearch(document.querySelector(".grid-search input")?.value);
  table.querySelectorAll("tbody tr").forEach((row) => {
    if (row.cells.length <= 1) return;
    const text = [...row.cells].filter((cell) => !cell.classList.contains("javi-action-column")).map((cell) => cell.textContent).join(" ");
    row.classList.toggle("grid-search-hidden", Boolean(term) && !normalizeGridSearch(text).includes(term));
  });
  if (window.updatePagination) updatePagination(table);
};

function makeFilterResizable(field, key, widths) {
  const MIN = 96, MAX = 560;
  field.classList.add("filter-resizable");
  const handle = document.createElement("span");
  handle.className = "filter-resizer";
  handle.tabIndex = 0;
  handle.setAttribute("role", "separator");
  handle.setAttribute("aria-orientation", "vertical");
  const name = (field.querySelector("input, select, summary")?.getAttribute("aria-label") || field.textContent || "bộ lọc").trim().split("\n")[0].slice(0, 40);
  handle.setAttribute("aria-label", `Điều chỉnh độ rộng ${name}`);
  handle.title = "Kéo để đổi độ rộng, nhấp đúp để về mặc định";
  const apply = (width, save) => {
    if (width == null) { field.style.removeProperty("width"); delete widths[key]; }
    else { width = Math.round(Math.min(MAX, Math.max(MIN, width))); field.style.setProperty("width", `${width}px`, "important"); widths[key] = width; }
    handle.setAttribute("aria-valuenow", String(Math.round(field.getBoundingClientRect().width)));
    if (save) localStorage.setItem(`javiFilterWidths:${location.pathname}`, JSON.stringify(widths));
  };
  if (widths[key]) apply(widths[key], false);
  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault(); event.stopPropagation();
    const startX = event.clientX, startWidth = field.getBoundingClientRect().width;
    handle.setPointerCapture(event.pointerId);
    field.classList.add("is-resizing");
    const move = (e) => apply(startWidth + e.clientX - startX, false);
    const end = () => {
      handle.removeEventListener("pointermove", move);
      field.classList.remove("is-resizing");
      apply(field.getBoundingClientRect().width, true);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end, { once: true });
    handle.addEventListener("pointercancel", end, { once: true });
  });
  handle.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); });
  handle.addEventListener("dblclick", (event) => { event.preventDefault(); apply(null, true); });
  handle.addEventListener("keydown", (event) => {
    const step = event.key === "ArrowRight" ? 16 : event.key === "ArrowLeft" ? -16 : 0;
    if (!step) return;
    event.preventDefault();
    apply(field.getBoundingClientRect().width + step, true);
  });
  field.append(handle);
}

function buildListToolbar(header) {
  const main = header.parentElement;
  if (!main?.matches(".main-content:not(.overview-shell)") || main.querySelector(":scope > .page-header") !== header) return;
  const actions = [...header.children].filter((el) => !el.matches("h2, .user-profile"));
  const cards = [...main.querySelectorAll(":scope > .stat-cards")];
  const filterBlocks = [...main.querySelectorAll(":scope > :is(.report-filters, .filter-bar, .directory-toolbar)")];
  const ownSearch = filterBlocks.some((block) => block.querySelector("input[type=text], input[type=search], input:not([type])"));
  const grids = ownSearch ? [] : [...main.querySelectorAll(".table-responsive table")].filter((table) =>
    !table.matches(".no-filter") && !table.closest(".modal-overlay, .modal, .drawer, dialog") &&
    !table.closest(".web-tab-panel")?.querySelector(".directory-toolbar input:not([type=hidden])"));
  if (!actions.length && !cards.length && !filterBlocks.length && !grids.length) return;

  const toolbar = document.createElement("div");
  toolbar.className = "list-toolbar";
  const filters = document.createElement("div");
  filters.className = "list-filters";
  const actionRow = document.createElement("div");
  actionRow.className = "page-actions";
  actionRow.append(...actions);

  if (grids.length) {
    const search = document.createElement("div");
    search.className = "grid-search";
    search.innerHTML = '<i class="bi bi-search" aria-hidden="true"></i><input type="search" placeholder="Tìm kiếm trong danh sách" aria-label="Tìm kiếm trong danh sách" autocomplete="off">';
    grids.forEach((table) => { table.dataset.gridSearch = "true"; });
    search.querySelector("input").addEventListener("input", () => grids.forEach((table) => { table.dataset.currentPage = "1"; applyGridSearch(table); }));
    filters.append(search);
  }
  filters.append(...filterBlocks);

  if (cards.length) {
    cards.forEach((card, index) => {
      if (!card.id) card.id = `pageStatCards${index ? index + 1 : ""}`;
      card.classList.add("is-collapsed");
    });
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "btn dashboard-toggle";
    toggle.innerHTML = '<i class="bi bi-speedometer2" aria-hidden="true"></i>';
    toggle.title = "Dashboard";
    toggle.setAttribute("aria-label", "Dashboard thống kê");
    toggle.setAttribute("aria-controls", cards.map((card) => card.id).join(" "));
    toggle.setAttribute("aria-pressed", "false");
    toggle.addEventListener("click", () => {
      const show = toggle.getAttribute("aria-pressed") !== "true";
      toggle.setAttribute("aria-pressed", String(show));
      cards.forEach((card) => card.classList.toggle("is-collapsed", !show));
    });
    const exportControl = actionRow.querySelector(".grid-file-menu");
    if (exportControl) exportControl.after(toggle); else actionRow.append(toggle);
  }

  if (actionRow.childElementCount) toolbar.append(actionRow);
  if (filters.childElementCount) toolbar.append(filters);
  (cards.at(-1) || header).after(toolbar);

  const widths = JSON.parse(localStorage.getItem(`javiFilterWidths:${location.pathname}`) || "{}");
  const fields = [];
  for (const node of filters.querySelectorAll(":scope > .grid-search, :scope > :not(.grid-search) > :is(label, .filter-field, .search-box, input, select)")) {
    let field = node;
    if (node.matches("input, select")) {
      field = document.createElement("div");
      node.before(field);
      field.append(node);
    }
    fields.push(field);
  }
  fields.forEach((field, index) => makeFilterResizable(field, field.querySelector("[id]")?.id || `field${index}`, widths));
}

function injectUserProfile(user) {
  const escapeHTML = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  const fullName = escapeHTML(user.HoTenNV || user.TenDangNhap || "Người dùng");
  const initial = fullName.charAt(0).toUpperCase();
  const jobTitle = escapeHTML(user.ChucVu || "Nhân viên");
  const profileHTML = `
        <div class="user-profile">
          <div class="header-date-time" aria-label="Ngày giờ hiện tại"><span id="javiHeaderDate"></span><strong id="javiHeaderTime"></strong></div>
          <button type="button" class="theme-toggle"></button>
          <div class="user-info" onclick="toggleUserDropdown()" role="button" tabindex="0" aria-label="Mở menu tài khoản">
            <div class="user-avatar">${initial}</div>
            <div class="user-copy">
              <span class="user-name">${fullName}</span>
              <span class="user-role">${jobTitle}</span>
            </div>
            <i class="bi bi-chevron-down user-dropdown-arrow"></i>
          </div>
          <div class="user-dropdown" id="userDropdown">
            <a href="#" onclick="openProfileModal(); return false;"><i class="bi bi-person"></i><span>Hồ sơ cá nhân</span></a>
            <a href="#" onclick="handleLogout(); return false;" class="text-danger"><i class="bi bi-box-arrow-right"></i><span>Đăng xuất</span></a>
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
    buildListToolbar(header);
  }
  document.querySelectorAll(".user-profile .theme-toggle").forEach((button) => {
    syncThemeToggle(button);
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      localStorage.setItem(JAVI_THEME_KEY, next);
      applyJaviTheme(next);
    });
  });

  const updateHeaderClock = () => {
    const now = new Date();
    const date = document.getElementById("javiHeaderDate");
    const time = document.getElementById("javiHeaderTime");
    if (date) date.textContent = now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    if (time) time.textContent = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };
  updateHeaderClock();
  window.setInterval(updateHeaderClock, 1000);

  // Nhét khung Modal Hồ sơ vào body
  const modalHTML = `
    <div class="modal-overlay profile-modal" id="profileModal">
      <div class="profile-card" role="dialog" aria-modal="true" aria-labelledby="profileModalTitle">
        <button class="profile-close" onclick="document.getElementById('profileModal').style.display = 'none'" aria-label="Đóng"><i class="bi bi-x-lg"></i></button>
        <div class="profile-heading">
          <div class="profile-avatar">${initial}</div>
          <div>
            <span class="profile-eyebrow">Hồ sơ cá nhân</span>
            <h3 id="profileModalTitle">${fullName}</h3>
            <span class="profile-role">${jobTitle}</span>
          </div>
        </div>
        <div class="profile-details">
          <div class="profile-row"><i class="bi bi-person-vcard"></i><span>Mã nhân viên</span><strong>${escapeHTML(user.MaNV || "—")}</strong></div>
          <div class="profile-row"><i class="bi bi-at"></i><span>Tài khoản</span><strong>${escapeHTML(user.TenDangNhap || "—")}</strong></div>
          <div class="profile-row"><i class="bi bi-telephone"></i><span>Số điện thoại</span><strong>${escapeHTML(user.SoDTNV || "Chưa cập nhật")}</strong></div>
          <div class="profile-row"><i class="bi bi-envelope"></i><span>Email</span><strong>${escapeHTML(user.EmailNV || "Chưa cập nhật")}</strong></div>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function injectGlobalModals() {
  if (document.getElementById("javiConfirmModal")) return;
  const modalHTML = `
    <div class="modal-overlay" id="javiConfirmModal" style="display:none;justify-content:center;align-items:center;z-index:9999">
      <div class="modal-content javi-confirm-card" role="dialog" aria-modal="true" aria-labelledby="javiConfirmTitle" aria-describedby="javiConfirmMessage" tabindex="-1">
        <div class="javi-confirm-emblem" aria-hidden="true"><i class="bi bi-question-circle"></i></div>
        <span class="javi-confirm-eyebrow">JAVI COFFEE</span>
        <h3 id="javiConfirmTitle">Xác nhận thao tác</h3>
        <div id="javiConfirmMessage"></div>
        <div class="javi-confirm-actions">
          <button class="btn" id="btnJaviConfirmCancel">Hủy bỏ</button>
          <button class="btn" id="btnJaviConfirmOk">Đồng ý</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  window.javiAlert = function (message, type = "info") {
    return window.showToast(message, type);
  };
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
        const previousFocus = document.activeElement;
        const onKey = event => {
          if (event.key === 'Escape') {event.preventDefault();btnCancel.click();}
          if (event.key === 'Tab') {
            event.preventDefault();
            (document.activeElement === btnCancel ? btnOk : btnCancel).focus();
          }
        };
        const cleanup = () => {
          confirmModal.style.display = "none";
          confirmModal.removeEventListener('keydown', onKey);
          previousFocus?.focus();
        };
        confirmModal.addEventListener('keydown', onKey);
        btnCancel.focus();
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
  window.location.href = "/landing_page/login.html?mode=admin";
};
window.openProfileModal = () => {
  document.getElementById("userDropdown").classList.remove("show");
  document.getElementById("profileModal").style.display = "flex";
};

// Mở chi tiết hoặc form chỉnh sửa bằng double-click trên dòng lưới.
document.addEventListener("dblclick", (event) => {
  if (event.target.closest("button, a, input, select, textarea, label")) return;
  const row = event.target.closest(".table-responsive tbody tr");
  if (!row) return;

  const actions = Array.from(row.querySelectorAll("button, a"));
  const viewAction = actions.find((action) =>
    action.classList.contains("btn-view") ||
    action.querySelector(".bi-eye") ||
    /view(?:Detail|Invoice|CustomerInvoices)\s*\(/i.test(action.getAttribute("onclick") || ""),
  );
  if (viewAction) {
    event.preventDefault();
    viewAction.click();
    return;
  }

  if (row.dataset.rowEdit) {
    let user;
    try { user = JSON.parse(localStorage.getItem("currentUser") || "null"); } catch { return; }
    if (!user) return;
    const page = window.location.pathname.split("/").pop();
    const role = user.ChucVu;
    if ((role === "Bán hàng" || role === "Kho" || role === "Kế toán") &&
        ((page === "san-pham.html" && role !== "Kế toán") || page === "nhan-vien.html")) return;
    const edit = window[row.dataset.rowEdit];
    if (typeof edit !== "function") return;
    event.preventDefault();
    edit(decodeURIComponent(row.dataset.editId || ""));
    return;
  }
  const editAction = actions.find((action) => {
    if (!action.classList.contains("btn-edit") || action.disabled) return false;
    const style = window.getComputedStyle(action);
    return style.display !== "none" && style.visibility !== "hidden";
  });
  if (!editAction) return;
  event.preventDefault();
  editAction.click();
});

// Tính năng mở/đóng menu con
window.toggleSubmenu = function (element) {
  const parentLi = element.closest(".has-submenu");
  if (!parentLi) return;

  const shouldOpen = !parentLi.classList.contains("open");
  document.querySelectorAll(".sidebar-menu .has-submenu").forEach((item) => {
    item.classList.remove("open");
    item.querySelector(":scope > a")?.setAttribute("aria-expanded", "false");
  });

  if (shouldOpen) {
    parentLi.classList.add("open");
    element.setAttribute("aria-expanded", "true");
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
window.printWhenReady = async function (target = window) {
  const doc = target.document;
  await Promise.all(Array.from(doc.querySelectorAll('link[rel="stylesheet"]'), link => {
    if (link.sheet || doc.readyState === "complete") return;
    return new Promise(resolve => {
      link.addEventListener("load", resolve, { once: true });
      link.addEventListener("error", resolve, { once: true });
    });
  }));
  await doc.fonts?.ready;
  await Promise.all(Array.from(doc.images, image => image.decode?.().catch(() => {})));
  if (target.closed) return;
  target.focus();
  target.print();
};

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
      <link rel="stylesheet" href="${window.location.origin}/css/print-document.css">
      <style type="text/css" media="print">@page { size: A4 portrait; margin: 10mm; }</style>
      <style>
        body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 0; font-size: 12px; background: #fff; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { flex: 0 0 150px; }
        .logo img { width: 100%; height: auto; filter: grayscale(1) contrast(1.8); }
        .company-info { flex: 1; padding-left: 20px; line-height: 1.5; }
        .company-info h2 { margin: 0 0 5px 0; font-size: 18px; text-transform: uppercase; font-weight: bold; }
        .title-section { text-align: center; margin-bottom: 20px; }
        .title-section h1 { font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 0 0 5px 0; }
        .title-section p { font-style: italic; margin: 0; color: #333; }
        .info-group { margin-bottom: 15px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #fff !important; font-weight: bold; text-align: center; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .summary { width: 50%; margin-left: auto; border-collapse: collapse; }
        .summary td { border: none; padding: 5px 8px; }
        .summary .total { font-weight: bold; font-size: 16px; border-top: 1px solid #000; }
        .signatures { display: flex; justify-content: space-around; margin-top: 30px; }
        .signature-box { text-align: center; }
        .signature-box p { font-weight: bold; margin: 0 0 5px 0; }
        .signature-box .note { font-style: italic; font-size: 12px; display: block; color: #555; }
        @media print { * { color:#000 !important; background:#fff !important; box-shadow:none !important; text-shadow:none !important; } table, th, td { border-color:#000 !important; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <img src="/images/logo-javi-scan.png" alt="JAVI COFFEE" />
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

  window.printWhenReady(iframe.contentWindow).finally(() => {
    setTimeout(() => {
      iframe.remove();
    }, 1000);
  });
};

// =========================================================================
// TÍNH NĂNG PHÂN TRANG VÀ BADGE TRẠNG THÁI (Global)
// =========================================================================
const paginationCSS = document.createElement("style");
paginationCSS.textContent = `
  .pagination-container {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    height: 42px !important;
    min-height: 42px !important;
    max-height: 42px !important;
    margin: 6px 0 0 0 !important;
    padding: 0 4px !important;
    flex-shrink: 0 !important;
    box-sizing: border-box !important;
    background: transparent !important;
    border: 0 !important;
    border-radius: 0 !important;
  }
  .pagination-container .pagination-info {
    color: var(--color-text-muted, #999) !important;
    font-size: 13px !important;
    font-weight: 400 !important;
    line-height: 1 !important;
    margin: 0 !important;
    padding: 0 !important;
    white-space: nowrap !important;
  }
  .pagination-container .pagination-buttons {
    display: flex !important;
    gap: 5px !important;
    align-items: center !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .pagination-container .pagination-buttons button {
    height: 30px !important;
    min-width: 30px !important;
    max-height: 30px !important;
    padding: 0 10px !important;
    font-size: 12.5px !important;
    font-weight: 500 !important;
    line-height: 28px !important;
    text-transform: none !important;
    letter-spacing: normal !important;
    border-radius: 4px !important;
    background: var(--color-bg-surface, #1e1e1e) !important;
    color: var(--color-text-main, #fff) !important;
    border: 1px solid var(--color-border, #333) !important;
    cursor: pointer !important;
    transition: all 0.15s ease !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: none !important;
    transform: none !important;
    margin: 0 !important;
  }
  .pagination-container .pagination-buttons button:hover:not(:disabled) {
    background: #2a2a2a !important;
    border-color: var(--color-primary, #ffd700) !important;
    color: var(--color-primary, #ffd700) !important;
    box-shadow: none !important;
    transform: none !important;
  }
  .pagination-container .pagination-buttons button.active {
    background: var(--color-primary, #ffd700) !important;
    color: #000 !important;
    font-weight: 700 !important;
    border-color: var(--color-primary, #ffd700) !important;
  }
  .pagination-container .pagination-buttons button:disabled {
    opacity: 0.35 !important;
    cursor: not-allowed !important;
    pointer-events: none !important;
  }
  .row-hidden-by-page { display: none !important; }
  .filter-hidden { display: none !important; }
  .grid-search-hidden { display: none !important; }
  /* Nút lọc bo tròn viên thuốc (Pill shape) */
  .filter-section {
    display: flex !important;
    gap: 14px !important;
    align-items: center !important;
    flex-wrap: wrap !important;
    background: transparent !important;
    border: none !important;
    padding: 6px 0 !important;
    margin-bottom: 12px !important;
  }
  .filter-btn {
    position: relative !important;
    overflow: visible !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 7px 18px !important;
    border-radius: 9999px !important;
    font-size: 13px !important;
    font-weight: 550 !important;
    background: #181818 !important;
    color: #b0b0b0 !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    cursor: pointer !important;
    margin-right: 8px !important;
    margin-top: 6px !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  .filter-btn:hover {
    background: #242424 !important;
    color: #ffffff !important;
    border-color: rgba(255, 210, 28, 0.4) !important;
  }
  .filter-btn.active {
    background: rgba(255, 210, 28, 0.14) !important;
    color: var(--color-primary, #ffd21c) !important;
    border-color: var(--color-primary, #ffd21c) !important;
    font-weight: 600 !important;
    box-shadow: 0 0 12px rgba(255, 210, 28, 0.15) !important;
  }
  /* Số hiển thị trên góc phải nút badge */
  .filter-btn .status-badge {
    position: absolute !important;
    top: -8px !important;
    right: -8px !important;
    min-width: 19px !important;
    height: 19px !important;
    padding: 0 5px !important;
    border-radius: 9999px !important;
    background: #333333 !important;
    color: #e0e0e0 !important;
    font-size: 10.5px !important;
    font-weight: 700 !important;
    line-height: 1 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6) !important;
    border: 2px solid #0f0f0f !important;
    box-sizing: border-box !important;
    pointer-events: none !important;
    margin: 0 !important;
    z-index: 5 !important;
  }
  .filter-btn.active .status-badge {
    background: var(--color-primary, #ffd21c) !important;
    color: #000000 !important;
    font-weight: 800 !important;
    border-color: #000000 !important;
  }
  /* Rút gọn nội dung dài trong cell và giữ nguyên ngày tháng/tiền */
  .table-responsive table tbody tr td.col-ellipsis,
  .table-responsive table tbody tr td:not(.col-keep-full) {
    max-width: 200px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }
  .table-responsive table tbody tr td.col-keep-full {
    max-width: none !important;
    overflow: visible !important;
    text-overflow: clip !important;
    white-space: nowrap !important;
  }
`;
document.head.appendChild(paginationCSS);


window.autoFormatTableCells = function (table) {
  if (!table) return;
  const rows = table.querySelectorAll("tbody tr");
  rows.forEach((row) => {
    Array.from(row.cells).forEach((cell) => {
      const text = cell.textContent.trim();
      const isDate =
        /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(text) ||
        /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/.test(text) ||
        /^\d{1,2}:\d{2}(:\d{2})?/.test(text);

      const isMoneyOrNum =
        /[0-9.,\s]+(đ|VND|VNĐ|%|\$)$/i.test(text) ||
        /^(Tổng|Tiền|Sau Giảm|Giảm|Thuế|Nợ)/i.test(text);

      const isActionOrBadge = cell.querySelector("button, .action-btn, a.btn, .status-badge, .status-pill, .status-success, .status-warning, .status-orange, .status-info, input");

      if (isDate || isMoneyOrNum || isActionOrBadge) {
        cell.classList.remove("col-ellipsis");
        cell.classList.add("col-keep-full");
      } else {
        cell.classList.remove("col-keep-full");
        cell.classList.add("col-ellipsis");
        if (text && text.length > 12) {
          cell.setAttribute("title", text);
        }
      }
    });
  });
  if (typeof window.formatTableStatusBadges === "function") {
    window.formatTableStatusBadges(table);
  }
};

// Hiển thị trạng thái thành nhãn nhỏ để bảng dễ quét thông tin hơn.
window.formatTableStatusBadges = function (table) {
  if (!table) return;
  const headerRow = table.querySelector("thead tr");
  if (!headerRow) return;

  const statusColumns = Array.from(headerRow.cells)
    .map((header, index) => ({
      index,
      title: header.textContent.trim().toLowerCase(),
    }))
    .filter(({ title }) => title.includes("trạng thái") || title.includes("tình trạng"))
    .map(({ index }) => index);

  if (!statusColumns.length) return;
  const getTone = (value) => {
    const text = value.toLowerCase();
    if (/chưa thanh toán|còn nợ|quá hạn|hủy|thất bại|không thành/.test(text)) return "danger";
    if (/hoàn thành|đã thanh toán|đã thu|đã giao|thành công/.test(text)) return "success";
    if (/chờ|đang xử lý|một phần|tạm/.test(text)) return "warning";
    return "info";
  };

  table.querySelectorAll("tbody tr").forEach((row) => {
    statusColumns.forEach((index) => {
      const cell = row.cells[index];
      if (!cell || cell.querySelector(".status-pill") || cell.querySelector("button, input, select")) return;
      const value = cell.textContent.trim();
      if (!value || value === "-" || /đang tải|chưa có dữ liệu/i.test(value)) return;
      cell.classList.remove(
        "status-success", "status-warning", "status-orange", "status-danger", "status-info",
        "badge-success", "badge-warning", "badge-orange", "badge-danger", "badge-info",
      );
      const pill = document.createElement("span");
      pill.className = `status-pill status-pill-${getTone(value)}`;
      pill.textContent = value;
      cell.textContent = "";
      cell.appendChild(pill);
    });
  });
};

// Lưới chuẩn: cố định cột thao tác và độ rộng cột; tìm kiếm nằm ở hàng công cụ phía trên.
window.setupGridColumns = function (table) {
  if (!table || table.matches('.no-col-filter, .no-filter') || table.closest('.dashboard-cards, .tables-grid, .modal-overlay, .modal, .drawer')) return;
  const scrollport=table.closest('.table-responsive');if(scrollport&&!scrollport.hasAttribute('tabindex'))scrollport.tabIndex=0;
  if (window.setupRowReportFilters) setupRowReportFilters(table);
  const header = table.querySelector('thead tr');
  if (!header) return;
  table.classList.add('stable-table-layout');
  const rows = [...table.querySelectorAll('tbody tr')].filter(row => row.cells.length > 1);
  [...header.cells].forEach((th, index) => {
    if (th.style.display === 'none' || th.classList.contains('d-none')) return;
    const title = th.textContent.trim();
    if (th.dataset.gridAction === 'true' || /hành động|thao tác/.test(title.toLowerCase()) || (index === header.cells.length - 1 && !title)) {
      th.classList.add('javi-action-column');
      rows.forEach(row=>{if(row.cells[index])row.cells[index].classList.add('javi-action-column');});
      th.textContent = th.dataset.gridAction === 'true' ? title : ''; th.setAttribute('aria-label', th.dataset.gridAction === 'true' ? title : 'Thao tác');
    }
  });
  if (window.lockGridColumns) lockGridColumns(table);
};

// ==========================================================================
// HỆ THỐNG PHÂN TRANG CHUẨN (TỐI ĐA 20 DÒNG/TRANG & KHÔNG BAO GIỜ BỊ LẶP 2 LẦN)
// ==========================================================================
// ==========================================================================
// HỆ THỐNG PHÂN TRANG CHUẨN (TỐI ĐA 20 DÒNG/TRANG & KHÔNG BAO GIỜ BỊ LẶP 2 LẦN)
// ==========================================================================
window.updatePagination = function (table) {
  if (!table) return;
  const tbody = table.querySelector("tbody");
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll("tr"));
  const visibleRows = rows.filter(
    (r) =>
      !r.classList.contains("filter-hidden") &&
      !r.classList.contains("grid-search-hidden") &&
      r.style.display !== "none" &&
      r.cells.length > 1,
  );

  const totalRows = visibleRows.length;
  const rowsPerPage = 20; // CỐ ĐỊNH CHUẨN 20 DÒNG / 1 TRANG
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  let currentPage = parseInt(table.dataset.currentPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  table.dataset.currentPage = currentPage;

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Clear the previous page state, including rows that were filtered out.
  rows.forEach((row) => row.classList.remove("row-hidden-by-page"));

  visibleRows.forEach((row, index) => {
    if (index >= startIndex && index < endIndex) {
      row.classList.remove("row-hidden-by-page");
    } else {
      row.classList.add("row-hidden-by-page");
    }
  });

  const responsiveWrapper = table.closest(".table-responsive");
  const parent = (responsiveWrapper || table).parentNode;
  
  // DỌN SẠCH CÁC THANH PHÂN TRANG BỊ LẶP TRONG PARENT
  if (parent) {
    const allContainers = Array.from(parent.querySelectorAll(".pagination-container"));
    if (allContainers.length > 1) {
      for (let i = 1; i < allContainers.length; i++) {
        allContainers[i].remove();
      }
    }
  }

  let pagContainer = (responsiveWrapper || table).nextElementSibling;
  if (!pagContainer || !pagContainer.classList.contains("pagination-container")) {
    pagContainer = parent ? parent.querySelector(".pagination-container") : null;
  }

  if (pagContainer && pagContainer.classList.contains("pagination-container")) {
    const info = pagContainer.querySelector(".pagination-info");
    if (info) {
      const endItem = Math.min(endIndex, totalRows);
      const startItem = totalRows === 0 ? 0 : startIndex + 1;
      info.textContent = `Hiển thị ${startItem} - ${endItem} trên tổng số ${totalRows} dòng`;
    }

    const btns = pagContainer.querySelector(".pagination-buttons");
    if (btns) {
      btns.innerHTML = "";

      const prevBtn = document.createElement("button");
      prevBtn.innerHTML = "&laquo;";
      prevBtn.title = "Trang trước";
      prevBtn.disabled = currentPage === 1;
      prevBtn.onclick = () => {
        table.dataset.currentPage = currentPage - 1;
        updatePagination(table);
      };
      btns.appendChild(prevBtn);

      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + 4);
      if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
      if (startPage < 1) startPage = 1;

      for (let i = startPage; i <= endPage; i++) {
        const pBtn = document.createElement("button");
        pBtn.textContent = i;
        if (i === currentPage) pBtn.classList.add("active");
        pBtn.onclick = () => {
          table.dataset.currentPage = i;
          updatePagination(table);
        };
        btns.appendChild(pBtn);
      }

      const nextBtn = document.createElement("button");
      nextBtn.innerHTML = "&raquo;";
      nextBtn.title = "Trang sau";
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.onclick = () => {
        table.dataset.currentPage = currentPage + 1;
        updatePagination(table);
      };
      btns.appendChild(nextBtn);
    }
  }
};

window.setupPagination = function (table) {
  if (!table) return;
  // Bỏ qua các bảng không cần phân trang (trang chủ dashboard, modal chọn sp con, drawer, bản in)
  if (
    table.closest(".dashboard-cards") ||
    table.closest(".tables-grid") ||
    table.closest(".modal-overlay") ||
    table.closest(".modal") ||
    table.closest(".drawer") ||
    table.closest(".no-filter")
  )
    return;

  table.dataset.paginated = "true";
  if (!table.dataset.currentPage) {
    table.dataset.currentPage = 1;
  }

  const responsiveWrapper = table.closest(".table-responsive");
  const parent = (responsiveWrapper || table).parentNode;

  // TÌM TẤT CẢ PHÂN TRANG TRONG PARENT ĐỂ CHỈ GIỮ LẠI ĐÚNG 1 CÁI
  const existingContainers = parent ? Array.from(parent.querySelectorAll(".pagination-container")) : [];
  let container;
  if (existingContainers.length > 0) {
    container = existingContainers[0];
    for (let i = 1; i < existingContainers.length; i++) {
      existingContainers[i].remove();
    }
  } else {
    container = document.createElement("div");
    container.className = "pagination-container";
    container.innerHTML = `
      <div class="pagination-info"></div>
      <div class="pagination-buttons"></div>
    `;
    if (responsiveWrapper) {
      responsiveWrapper.parentNode.insertBefore(
        container,
        responsiveWrapper.nextSibling,
      );
    } else {
      table.parentNode.insertBefore(container, table.nextSibling);
    }
  }

  if (!container.querySelector(".pagination-info")) {
    container.innerHTML = `<div class="pagination-info"></div><div class="pagination-buttons"></div>`;
  }

  updatePagination(table);
};

window.updateStatusBadges = function (table) {
  if (!table) return;
  // Không cập nhật filter badge toàn cục nếu bảng đang nằm trong Modal (tránh tình trạng ghi đè badge về 0)
  if (
    table.closest(".modal-overlay") ||
    table.closest(".modal") ||
    table.closest(".drawer")
  )
    return;

  const filterBtns = document.querySelectorAll(".filter-btn");
  if (filterBtns.length === 0) return;

  const tbody = table.querySelector("tbody");
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll("tr")).filter(
    (r) => r.cells.length > 1,
  );
  const statusCounts = {
    "Tất cả": rows.length,
    "Tất cả phiếu": rows.length,
  };

  rows.forEach((row) => {
    Array.from(row.cells).forEach((cell) => {
      const txt = cell.textContent.trim();
      if (txt) {
        statusCounts[txt] = (statusCounts[txt] || 0) + 1;
      }
    });

    const rowText = row.textContent;
    if (
      rowText.includes("Không thành công") ||
      rowText.includes("Không hoàn thành")
    ) {
      statusCounts["Không hoàn thành"] =
        (statusCounts["Không hoàn thành"] || 0) + 1;
      statusCounts["Giao hàng không thành công"] =
        (statusCounts["Giao hàng không thành công"] || 0) + 1;
    }
  });

  filterBtns.forEach((btn) => {
    const badge = btn.querySelector(".status-badge");
    if (badge) badge.remove();

    const statusName =
      btn.getAttribute("data-status") ||
      (() => {
        const clone = btn.cloneNode(true);
        const b = clone.querySelector(".status-badge");
        if (b) b.remove();
        return clone.textContent.trim();
      })();

    // Thêm lại badge
    let count = statusCounts[statusName];
    if (count === undefined) {
      for (const [key, val] of Object.entries(statusCounts)) {
        if (key.includes(statusName) || statusName.includes(key)) {
          count = val;
          break;
        }
      }
    }
    if (count === undefined) count = 0;

    const newBadge = document.createElement("span");
    newBadge.className = "status-badge";
    newBadge.textContent = count;

    btn.appendChild(newBadge);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const tables = document.querySelectorAll(".table-responsive table");
  tables.forEach((table) => {
    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    setupGridColumns(table);

    const observer = new MutationObserver(() => {
      setupGridColumns(table);
      setupPagination(table);
      autoFormatTableCells(table);
      applyGridSearch(table);
      updateStatusBadges(table);
    });
    observer.observe(tbody, { childList: true, subtree: true });

    setTimeout(() => {
      setupGridColumns(table);
      setupPagination(table);
      autoFormatTableCells(table);
      applyGridSearch(table);
      updateStatusBadges(table);
    }, 500);
  });
});
