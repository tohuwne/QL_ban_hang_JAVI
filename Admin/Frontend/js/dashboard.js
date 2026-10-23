      async function printDashboardReport() {
        const yearValue = document.getElementById("reportYear").value;
        const yearSelect = document.getElementById("reportYear");
        const year = yearSelect.options[yearSelect.selectedIndex].text;
        const type = document.getElementById("reportType").value;
        const month = document.getElementById("reportMonth").value;

        const currentUserData = localStorage.getItem("currentUser");
        const user = currentUserData
          ? JSON.parse(currentUserData)
          : { HoTenNV: "...................." };

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;
        printWindow.document.write(
          "<html><body><h3 style='text-align: center; font-family: sans-serif; margin-top: 50px;'>Đang tạo báo cáo, vui lòng đợi...</h3></body></html>",
        );

        let title = "BÁO CÁO TỔNG QUAN TÀI CHÍNH";
        let content = "";

        if (type === "overview") {
          content = `
            <table><thead><tr><th>Chỉ Tiêu</th><th>Giá Trị Ghi Nhận</th></tr></thead>
            <tbody>
              <tr>
<td>Tổng Doanh Thu Bán Hàng</td><td class="text-right"><strong>${document.getElementById("stat-doanh-thu").textContent}</strong></td></tr>
              <tr>
<td>Tổng Chi Phí Nhập Hàng</td><td class="text-right"><strong>${document.getElementById("stat-chi-phi").textContent}</strong></td></tr>
              <tr>
<td>Tổng Công Nợ Khách Hàng Hiện Tại</td><td class="text-right"><strong>${document.getElementById("stat-cong-no").textContent}</strong></td></tr>
              <tr>
<td>Số lượng Sản Phẩm Cảnh Báo Hết Kho</td><td class="text-right"><strong>${document.getElementById("stat-canh-bao").textContent}</strong></td></tr>
            </tbody></table>`;
        } else if (type === "revenue") {
          title = "BÁO CÁO DOANH THU";
          try {
            const res = await fetch(
              `/api/dashboard/chart-data?year=${yearValue}`,
              { cache: "no-store" },
            );
            const data = await res.json();
            if (data.success && data.data.length > 0) {
              let rows = "";
              let tongDoanhThu = 0;
              let tongChiPhi = 0;
              let tongLoiNhuan = 0;

              data.data.forEach((item) => {
                tongDoanhThu += item.DoanhThuBanHang;
                tongChiPhi += item.ChiPhiNhapHang;
                tongLoiNhuan += item.LoiNhuanThuan;
                rows += `<tr>
                  <td class="text-center" style="padding: 10px;">Tháng ${item.Thang}/${item.Nam}</td>
                  <td class="text-right" style="padding: 10px;">${new Intl.NumberFormat("vi-VN").format(item.DoanhThuBanHang)} đ</td>
                  <td class="text-right" style="padding: 10px;">${new Intl.NumberFormat("vi-VN").format(item.ChiPhiNhapHang)} đ</td>
                  <td class="text-right" style="padding: 10px; font-weight: bold; color: ${item.LoiNhuanThuan >= 0 ? "green" : "red"};">${new Intl.NumberFormat("vi-VN").format(item.LoiNhuanThuan)} đ</td>
                </tr>`;
              });

              content = `
                <p style="text-align: center; font-style: italic;">Báo cáo tổng hợp doanh thu, chi phí và lợi nhuận theo từng tháng trong ${year}.</p>
                <table>
                  <thead><tr><th style="width: 25%">Kỳ Báo Cáo</th><th style="width: 25%">Tổng Doanh Thu</th><th style="width: 25%">Tổng Chi Phí</th><th style="width: 25%">Lợi Nhuận Thuần</th></tr></thead>
                  <tbody>${rows}</tbody>
                  <tfoot><tr>
                    <td class="text-center" style="font-weight: bold; padding: 10px;">TỔNG CỘNG</td>
                    <td class="text-right" style="font-weight: bold; color: green; padding: 10px;">${new Intl.NumberFormat("vi-VN").format(tongDoanhThu)} đ</td>
                    <td class="text-right" style="font-weight: bold; color: red; padding: 10px;">${new Intl.NumberFormat("vi-VN").format(tongChiPhi)} đ</td>
                    <td class="text-right" style="font-weight: bold; color: ${tongLoiNhuan >= 0 ? "green" : "red"}; padding: 10px;">${new Intl.NumberFormat("vi-VN").format(tongLoiNhuan)} đ</td>
                  </tr></tfoot>
                </table>`;
            } else {
              content = `<p style="text-align: center; margin-top: 20px;">Chưa có dữ liệu giao dịch trong ${year}.</p>`;
            }
          } catch (e) {
            content = `<p style="text-align: center; color: red;">Lỗi khi tải dữ liệu báo cáo: ${e.message}</p>`;
          }
        } else if (type === "inventory") {
          title = "BÁO CÁO TỒN KHO CHI TIẾT";
          try {
            const res = await fetch("/api/san-pham");
            const data = await res.json();
            if (data.success) {
              let rows = "";
              let totalStock = 0;
              let totalAvail = 0;
              data.data.forEach((item, index) => {
                totalStock += item.SoLuongTon;
                totalAvail += item.SoLuongKD;
                rows += `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">${item.MaSP}</td>
                    <td>${item.TenSP}</td>
                    <td class="text-center">${item.MaLoaiSP || "Khác"}</td>
                    <td class="text-center">${item.DonViTinh}</td>
                    <td class="text-right" style="font-weight: bold;">${item.SoLuongTon}</td>
                    <td class="text-right" style="font-weight: bold;">${item.SoLuongKD}</td>
                  </tr>
                `;
              });
              content = `
                <table>
                  <thead>
                    <tr>
                      <th style="width: 5%">STT</th>
                      <th style="width: 10%">Mã SP</th>
                      <th style="width: 35%">Tên Sản Phẩm</th>
                      <th style="width: 10%">Phân Loại</th>
                      <th style="width: 10%">ĐVT</th>
                      <th style="width: 15%">Tồn Thực Tế</th>
                      <th style="width: 15%">Tồn Khả Dụng</th>
                    </tr>
                  </thead>
                  <tbody>${rows}
                    <tr>
                      <td colspan="5" class="text-right" style="font-weight: bold;">TỔNG CỘNG:</td>
                      <td class="text-right" style="font-weight: bold; color: red;">${new Intl.NumberFormat("vi-VN").format(totalStock)}</td>
                      <td class="text-right" style="font-weight: bold; color: red;">${new Intl.NumberFormat("vi-VN").format(totalAvail)}</td>
                    </tr>
                  </tbody>
                </table>
              `;
            } else {
              content = `<p style="text-align: center; color: red;">Lỗi tải dữ liệu tồn kho: ${data.message}</p>`;
            }
          } catch (e) {
            content = `<p style="text-align: center; color: red;">Lỗi kết nối khi tải dữ liệu tồn kho.</p>`;
          }
        } else if (type === "top10") {
          const repYear =
            yearValue === "all" ? new Date().getFullYear() : yearValue;
          title = `BÁO CÁO TOP 10 SẢN PHẨM BÁN CHẠY - THÁNG ${month}/${repYear}`;
          try {
            const res = await fetch(
              `/api/dashboard/top-products?year=${repYear}&month=${month}&limit=10`,
              { cache: "no-store" },
            );
            const data = await res.json();
            if (data.success && data.data.length > 0) {
              let rows = "";
              data.data.forEach((item, index) => {
                rows += `<tr>
                  <td class="text-center">${index + 1}</td>
                  <td class="text-center">${item.MaSP}</td>
                  <td>${item.TenSP}</td>
                  <td class="text-center">${item.DonViTinh}</td>
                  <td class="text-right" style="font-weight: bold; color: green;">${item.SoLuongDaBan}</td>
                </tr>`;
              });
              content = `
                <p style="text-align: center; font-style: italic;">Thống kê 10 sản phẩm có số lượng bán ra cao nhất trong tháng ${month} năm ${repYear}.</p>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 10%">Xếp hạng</th>
                            <th style="width: 15%">Mã SP</th>
                            <th style="width: 40%">Tên Sản Phẩm</th>
                            <th style="width: 15%">ĐVT</th>
                            <th style="width: 20%">Số Lượng Đã Bán</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
              `;
            } else {
              content = `<p style="text-align: center; margin-top: 20px; font-weight: bold; color: red;">Không có dữ liệu bán hàng trong Tháng ${month}/${repYear}.</p>`;
            }
          } catch (e) {
            content = `<p style="text-align: center; color: red;">Lỗi khi tải dữ liệu báo cáo: ${e.message}</p>`;
          }
        }

        printWindow.document.open();
        printWindow.document.write(`
          <html><head><title>${title} - JAVI COFFEE</title>
          <link rel="stylesheet" href="${window.location.origin}/css/print-document.css">
          <style>
            body{font-family: 'Times New Roman', serif; padding: 30px; color: #000;} 
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
            .logo { flex: 0 0 120px; text-align: left; }
            .logo img { width: 100%; height: auto; }
            .company-info { flex: 1; padding-left: 20px; line-height: 1.5; font-size: 13px; }
            .company-info h2 { margin: 0 0 5px 0; font-size: 16px; text-transform: uppercase; font-weight: bold; color: #000; }
            h1{text-align:center; text-transform:uppercase; font-size: 20px; margin-top: 10px; margin-bottom: 5px;} 
            table{width:100%; border-collapse:collapse; margin-top:20px; font-size: 13px;} 
            th,td{border:1px solid #000; padding:10px; text-align:left;} 
            .text-right{text-align:right;} 
            .text-center{text-align:center;} 
            th{background-color:#f2f2f2 !important; print-color-adjust: exact;}
          </style>
          </head><body>
          <div class="header">
            <div class="logo">
              <img src="${window.location.origin}/images/logo-javi-scan.png" alt="JAVI COFFEE" />
            </div>
            <div class="company-info">
              <h2>CÔNG TY TNHH JAVI COFFEE</h2>
              <div><strong>Mã số thuế:</strong> 0314857973</div>
              <div><strong>Địa chỉ:</strong> 13 Đường số 7, Khu Phố 5, Phường Linh Chiểu, Thành phố Hồ Chí Minh</div>
              <div><strong>Điện thoại:</strong> 0909979012</div>
            </div>
          </div>
          <h1>${title}</h1>
          <p style="text-align:center;"><strong>Kỳ báo cáo:</strong> ${year} | <strong>Ngày in:</strong> ${new Date().toLocaleString("vi-VN")}</p>
          ${content}
          <br><div class="report-signatures" style="display:flex; justify-content:space-around; margin-top:50px; text-align:center;"><div><strong>Người lập báo cáo</strong><br><i>(Ký, ghi rõ họ tên)</i><br><br><br><br>${user.HoTenNV}</div><div><strong>Giám Đốc</strong><br><i>(Ký, đóng dấu)</i></div></div></body></html>
        `);
        printWindow.document.close();
        printWhenReady(printWindow);
      }

// Dashboard one-screen data controller.
(() => {
  let revenueChart = null;
  let paymentChart = null;
  const currency = new Intl.NumberFormat("vi-VN");
  const byId = (id) => document.getElementById(id);
  const safeText = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
  const dateText = (value) => value ? new Date(value).toLocaleDateString("vi-VN") : "—";
  const setStatus = (message) => { byId("refreshStatus").textContent = message; };
  const getYear = () => byId("reportYear").value;
  const yearMatches = (value, year) => year === "all" || new Date(value).getFullYear() === Number(year);

  async function api(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Không thể tải dữ liệu");
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Không thể tải dữ liệu");
    return result.data || [];
  }

  async function loadYears() {
    const years = await api("/api/dashboard/years");
    const select = byId("reportYear");
    select.innerHTML = '<option value="all">Tất cả các năm</option>' + years.map((year) => `<option value="${year}">Năm ${year}</option>`).join("");
    if (years.length) select.value = String(years[0]);
  }

  async function loadStats() {
    const stats = await api(`/api/dashboard/stats?year=${encodeURIComponent(getYear())}`);
    byId("stat-doanh-thu").textContent = `${currency.format(stats.doanhThu || 0)} đ`;
    byId("stat-chi-phi").textContent = `${currency.format(stats.chiPhi || 0)} đ`;
    byId("stat-cong-no").textContent = `${currency.format(stats.congNo || 0)} đ`;
    byId("stat-canh-bao").textContent = `${currency.format(stats.canhBao || 0)} SP`;
  }

  async function loadChart() {
    const data = await api(`/api/dashboard/chart-data?year=${encodeURIComponent(getYear())}`);
    const message = byId("chartMessage");
    if (revenueChart) { revenueChart.destroy(); revenueChart = null; }
    if (!data.length || !window.Chart) {
      message.hidden = false; message.textContent = "Chưa có dữ liệu để hiển thị biểu đồ."; return;
    }
    message.hidden = true;
    revenueChart = new Chart(byId("revenueChart"), {
      type: "bar",
      data: { labels: data.map((item) => `T${item.Thang}/${item.Nam}`), datasets: [
        { label: "Doanh thu", data: data.map((item) => Number(item.DoanhThuBanHang || 0)), backgroundColor: "#eac957", borderRadius: 5, maxBarThickness: 38, categoryPercentage: .72, barPercentage: .82 },
        { label: "Nhập hàng", data: data.map((item) => Number(item.ChiPhiNhapHang || 0)), backgroundColor: "#4d9bd1", borderRadius: 5, maxBarThickness: 38, categoryPercentage: .72, barPercentage: .82 },
      ] },
      options: { responsive: true, maintainAspectRatio: false, animation: { duration: 250 }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${currency.format(ctx.raw)} đ` } } }, scales: { x: { grid: { display: false }, ticks: { color: "#8f99a7", font: { size: 10 } } }, y: { beginAtZero: true, grid: { color: "#242a32" }, ticks: { color: "#8f99a7", font: { size: 10 }, callback: (value) => `${currency.format(value)}` } } } },
    });
  }

  async function loadInvoicesAndAttention() {
    const invoices = await api("/api/hoa-don");
    const year = getYear();
    const inPeriod = invoices.filter((item) => yearMatches(item.NgayLap, year));
    const newest = inPeriod.sort((a, b) => new Date(b.NgayLap) - new Date(a.NgayLap)).slice(0, 12);
    byId("recentInvoices").innerHTML = newest.length ? newest.map((item) => {
      const paid = item.TrangThaiThanhToan === "Đã thanh toán";
      return `<tr><td>${safeText(item.MaHD)}</td><td>${dateText(item.NgayLap)}</td><td><span class="invoice-status ${paid ? "" : "unpaid"}">${paid ? "Đã thanh toán" : safeText(item.TrangThaiThanhToan || "Chưa thanh toán")}</span></td><td class="text-right">${currency.format(item.TongTienThanhToan || 0)} đ</td></tr>`;
    }).join("") : '<tr><td colspan="4">Chưa có hóa đơn trong kỳ.</td></tr>';
    const total = inPeriod.length;
    const types = inPeriod.reduce((counts, item) => {
      if (item.TrangThaiThanhToan !== "Đã thanh toán") counts.debt += 1;
      else if (item.HinhThucThanhToan === "Tiền mặt") counts.cash += 1;
      else counts.bank += 1;
      return counts;
    }, { cash: 0, bank: 0, debt: 0 });
    ["cash", "bank", "debt"].forEach((key) => {
      const percent = total ? Math.round((types[key] / total) * 100) : 0;
      byId(`ratio-${key}-text`).textContent = `${percent}%`;
      byId(`ratio-${key}-bar`).style.width = `${percent}%`;
    });
    byId("paymentTotal").textContent = currency.format(total);
    if (paymentChart) { paymentChart.destroy(); paymentChart = null; }
    if (window.Chart) {
      paymentChart = new Chart(byId("paymentChart"), {
        type: "doughnut",
        data: {
          labels: ["Tiền mặt", "Chuyển khoản / khác", "Chưa thanh toán"],
          datasets: [{ data: [types.cash, types.bank, types.debt], backgroundColor: ["#eac957", "#a88d46", "#d68d79"], borderColor: "#111419", borderWidth: 3, hoverOffset: 3 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: "72%", animation: { duration: 250 },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw} hóa đơn` } } },
        },
      });
    }
  }

  async function loadProducts() {
    const items = await api(`/api/dashboard/top-products?year=${encodeURIComponent(getYear())}&limit=12`);
    const max = Math.max(...items.map((item) => Number(item.SoLuongDaBan || 0)), 1);
    byId("topProductsList").innerHTML = items.length ? items.map((item, index) => `<div class="product-line"><span class="product-rank">${index + 1}</span><div class="product-detail"><span title="${safeText(item.TenSP)}">${safeText(item.TenSP)}</span><div class="product-track"><span style="width:${Math.max(8, Math.round((Number(item.SoLuongDaBan || 0) / max) * 100))}%"></span></div></div><strong>${currency.format(item.SoLuongDaBan || 0)}<small>${safeText(item.DonViTinh || "")}</small></strong></div>`).join("") : "<p>Chưa có sản phẩm bán ra trong kỳ.</p>";
  }

  async function refresh() {
    const button = byId("refreshButton");
    button.disabled = true; setStatus("Đang cập nhật…");
    try { await Promise.all([loadStats(), loadChart(), loadInvoicesAndAttention(), loadProducts()]); setStatus(`Cập nhật lúc ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`); }
    catch (error) { console.error(error); setStatus("Không thể tải một phần dữ liệu"); }
    finally { button.disabled = false; }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    byId("reportMonth").value = String(new Date().getMonth() + 1);
    byId("reportYear").addEventListener("change", refresh);
    byId("refreshButton").addEventListener("click", refresh);
    byId("reportType").addEventListener("change", (event) => { byId("reportMonth").hidden = event.target.value !== "top10"; });
    try { await loadYears(); } catch (error) { console.error(error); setStatus("Không thể tải kỳ báo cáo"); }
    refresh();
  });
})();


