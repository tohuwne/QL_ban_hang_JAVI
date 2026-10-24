/* Shared report controls: edits are applied only when the user submits Xem. */
function reportEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function formatCustomer(code, name) {
  return reportEscape(`${String(code || '').trim() ? `(${String(code).trim()}) ` : ''}${name || 'Khách lẻ'}`);
}
let reportOrders = [];
let appliedOrderFilter = {from:'', to:'', orders:[], payments:[]};
let appliedDebtFilter = {status:'', min:'', max:''};
const orderStatusOf = item => item.TrangThaiDonHang === 'Không thành công' ? 'Không hoàn thành' : (item.TrangThaiDonHang || 'Chưa xác định');
const paymentStatusOf = item => item.TrangThaiThanhToan || 'Chưa lập HĐ';
function selectedReportValues(control) {
  return [...control.querySelectorAll('[role="option"][aria-selected="true"]')].map(option => option.dataset.value).filter(Boolean);
}
function reportMulti(id, values, onChange) {
  const control = typeof id === "string" ? document.getElementById(id) : id;
  const signature = JSON.stringify(values);
  if (control.dataset.optionSignature === signature) return;
  control.dataset.optionSignature = signature;
  const previous = selectedReportValues(control);
  const options = control.querySelector('.multi-options');
  options.replaceChildren();
  options.setAttribute('role', 'listbox');
  options.setAttribute('aria-multiselectable', 'true');
  options.setAttribute('aria-label', control.getAttribute('aria-label') || control.closest('.filter-field')?.querySelector('span')?.textContent || 'Lọc giá trị');
  const summary = control.querySelector('summary');
  const selectedLabel = document.createElement('span'); selectedLabel.className = 'selection-value';
  const extra = document.createElement('span'); extra.className = 'selection-extra';
  const clear = document.createElement('button'); clear.type = 'button'; clear.className = 'filter-clear'; clear.textContent = '×';
  clear.setAttribute('aria-label', 'Bỏ chọn tất cả'); clear.title = 'Bỏ chọn tất cả';
  summary.replaceChildren(selectedLabel, extra, clear);
  const updateSummary = () => {
    const checked = selectedReportValues(control);
    selectedLabel.textContent = checked[0] || 'Tất cả';
    extra.textContent = checked.length > 1 ? `+${checked.length - 1}` : '';
    extra.hidden = checked.length <= 1;
    clear.hidden = !checked.length;
    control.classList.toggle('has-value', Boolean(checked.length));
    summary.title = checked.length ? checked.join(', ') : 'Tất cả';
  };
  clear.onclick = event => {
    event.preventDefault(); event.stopPropagation();
    options.querySelectorAll('[role=option]').forEach(row => row.setAttribute('aria-selected', String(!row.dataset.value)));
    updateSummary(); control.open = false; summary.focus();
    if (onChange) onChange();
  };
  ['', ...values.filter(Boolean)].forEach(value => {
    const option = document.createElement('button');
    option.type = 'button'; option.className = 'multi-option'; option.dataset.value = value;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', String(value ? previous.includes(value) : !previous.length));
    const label = document.createElement('span'); label.textContent = value || 'Tất cả';
    const tick = document.createElement('span'); tick.className = 'selection-tick'; tick.textContent = '✓'; tick.setAttribute('aria-hidden', 'true');
    option.append(label, tick);
    option.onclick = () => {
      if (!value) options.querySelectorAll('[role=option]').forEach(row => row.setAttribute('aria-selected', String(!row.dataset.value)));
      else {
        option.setAttribute('aria-selected', String(option.getAttribute('aria-selected') !== 'true'));
        options.querySelector('[data-value=""]').setAttribute('aria-selected', String(!selectedReportValues(control).length));
      }
      updateSummary();
      if (single) control.open = false;
      if (onChange) onChange();
    };
    options.append(option);
  });
  control.onkeydown = event => {
    const buttons = [...options.querySelectorAll('[role="option"]')];
    if (event.key === 'Escape') { control.open = false; control.querySelector('summary').focus(); event.preventDefault(); }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); control.open = true;
      const current = buttons.indexOf(document.activeElement);
      const next = current < 0 ? (event.key === 'ArrowDown' ? 0 : buttons.length - 1) : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus();
    }
  };
  options.setAttribute('popover', 'manual');
  const position = () => {
    const rect = control.getBoundingClientRect();
    options.style.width = `${Math.min(Math.max(160, rect.width), window.innerWidth - 16)}px`;
    options.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8))}px`;
    options.style.top = `${rect.bottom + 4}px`;
    options.style.maxHeight = `${Math.min(220, Math.max(90, window.innerHeight - rect.bottom - 16))}px`;
  };
  control.ontoggle = () => {
    if (control.open) {
      document.querySelectorAll('.multi-filter[open]').forEach(other => { if (other !== control) other.open = false; });
      position(); options.showPopover?.();
    } else options.hidePopover?.();
  };
  updateSummary();
}
function setupOrderFilters(items) {
  reportOrders = items;
  document.querySelectorAll("#orderTable tbody tr").forEach((row, index) => {
    if (items[index]) row.dataset.orderId = String(items[index].MaDH).trim();
  });
  reportMulti('orderStatuses', [...new Set(['Hoàn thành','Chờ giao','Không hoàn thành', ...items.map(orderStatusOf)])]);
  reportMulti('paymentStatuses', [...new Set(['Đã thanh toán','Chưa thanh toán','Chưa lập HĐ', ...items.map(paymentStatusOf)])]);
  applyOrderFilters(false);
}
function reportDay(value) {
  if (!value) return '';
  // SQL datetime values have an ISO calendar date; avoid shifting it across timezones.
  const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}
// Validate both during editing and before applying a report filter.
function validateReportDateRange(from, to, focusInvalid = false) {
  const invalid = Boolean(from.value && to.value && from.value > to.value);
  const error = document.getElementById(`${from.id}Error`);
  from.setAttribute('aria-invalid', String(invalid));
  if (error) {
    error.textContent = invalid ? 'Từ ngày không được lớn hơn tới ngày' : '';
    error.hidden = !invalid;
  }
  if (invalid && focusInvalid) from.focus();
  return !invalid;
}
function applyOrderFilters(readControls = true) {
  if (readControls) {
    const from = document.getElementById('orderFrom');
    const to = document.getElementById('orderTo');
    if (!validateReportDateRange(from, to, true)) return;
    appliedOrderFilter = {from:from.value, to:to.value,
      orders:selectedReportValues(document.getElementById('orderStatuses')),
      payments:selectedReportValues(document.getElementById('paymentStatuses'))};
    document.querySelectorAll('.multi-filter').forEach(control => control.open = false);
  }
  const f = appliedOrderFilter;
  const matched = [];
  const rows = document.querySelectorAll('#orderTable tbody tr');
  const rowsById = new Map([...rows].map(row => [row.dataset.orderId, row]));
  reportOrders.forEach(item => {
    const day = reportDay(item.NgayDat);
    const show = (!f.from || day >= f.from) && (!f.to || (day && day <= f.to)) &&
      (!f.orders.length || f.orders.includes(orderStatusOf(item))) && (!f.payments.length || f.payments.includes(paymentStatusOf(item)));
    rowsById.get(String(item.MaDH).trim())?.classList.toggle('filter-hidden', !show);
    if (show) matched.push(item);
  });
  const stats = document.getElementById('orderStats');
  stats.replaceChildren();
  const addCard = (label, count) => {
    const card = document.createElement('div'); card.className = 'card';
    const title = document.createElement('div'); title.className = 'card-title'; title.textContent = label;
    const value = document.createElement('div'); value.className = 'card-value'; value.textContent = count;
    card.append(title, value); stats.append(card);
  };
  addCard('Tổng cộng', matched.length);
  document.querySelectorAll('#orderStatuses [role=option]:not([data-value=""])').forEach(option => addCard(option.dataset.value, matched.filter(item => orderStatusOf(item) === option.dataset.value).length));
  const customerOrders = matched.filter(item => ['website','online'].includes(String(item.NguonDon || '').trim().toLowerCase())).length;
  addCard('Đơn nhân viên', matched.length - customerOrders);
  addCard('Đơn khách đặt', customerOrders);
  const table = document.getElementById('orderTable'); table.dataset.currentPage = '1';
  if (window.updatePagination) window.updatePagination(table);
}
function applyDebtFilters(readControls = true) {
  if (readControls) {
    const min = document.getElementById('debtMin'), max = document.getElementById('debtMax');
    max.setCustomValidity(min.value !== '' && max.value !== '' && Number(min.value) > Number(max.value) ? 'Dư nợ đến phải lớn hơn hoặc bằng Dư nợ từ.' : '');
    if (!max.reportValidity()) return;
    appliedDebtFilter = {status:document.getElementById('debtStatus').value, min:min.value, max:max.value};
  }
  const f = appliedDebtFilter;
  document.querySelectorAll('#congNoTable tbody tr[data-debt]').forEach(row => {
    const amount = Number(row.dataset.debt);
    const show = (!f.status || (f.status === 'outstanding' ? amount > 0 : amount <= 0)) &&
      (f.min === '' || amount >= Number(f.min)) && (f.max === '' || amount <= Number(f.max));
    row.classList.toggle('filter-hidden', !show);
  });
  const table = document.getElementById('congNoTable'); table.dataset.currentPage = '1';
  if (window.updatePagination) window.updatePagination(table);
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.report-filters select').forEach(enhanceSingleFilterSelect);
  document.querySelectorAll('.multi-filter[data-default-values]').forEach(control => reportMulti(control, control.dataset.defaultValues.split('|')));
  document.querySelectorAll('[data-report-table]').forEach(form => setupRowReportFilters(document.getElementById(form.dataset.reportTable)));
  document.querySelectorAll('.modal-content .detail-body').forEach(body => {
    const content = body.closest('.modal-content');
    content.classList.add('document-detail');
    let footer = body.nextElementSibling;
    if (!footer?.querySelector('button') && body.lastElementChild?.querySelector('button')) {
      footer = body.lastElementChild;
      body.after(footer);
    }
    if (footer?.querySelector('button')) footer.classList.add('modal-footer');
    if (body.querySelector('.voucher-info-grid')) return;
    const group = [...body.children].find(child => !child.classList.contains('table-responsive') && child.querySelectorAll('strong').length > 1);
    if (group) group.classList.add('detail-info');
    else {
      const fields = [...body.children].filter(child => child.tagName === 'DIV' && child.querySelector('strong') && !child.querySelector('table'));
      if (fields.length) {
        const info = document.createElement('div'); info.className = 'detail-info';
        fields[0].before(info); fields.forEach(field => info.append(field));
      }
    }
  });
  window.addEventListener('resize', () => document.querySelectorAll('.multi-filter[open]').forEach(control => control.open = false));

  document.querySelectorAll('.report-filters input[type=date]').forEach(input => {
    enhanceFilterDate(input);
    input.addEventListener('click', () => { try { input.showPicker?.(); } catch (_) {} });
  });
  document.querySelectorAll('.report-filters').forEach(form => {
    const dates = form.querySelectorAll('input[type=date]');
    if (dates.length !== 2) return;
    const [from, to] = dates;
    const validate = () => validateReportDateRange(from, to);
    dates.forEach(input => {
      input.addEventListener('input', validate);
      input.addEventListener('change', validate);
    });
    validate();
  });
  document.addEventListener('click', event => {
    document.querySelectorAll('.multi-filter[open]').forEach(control => {
      if (!control.contains(event.target)) control.open = false;
    });
  });
  document.querySelectorAll('.report-filters input').forEach(input => input.addEventListener('input', () => {
    input.closest('form').querySelectorAll('input').forEach(field => field.setCustomValidity(''));
  }));
});

let appliedInvoiceDateFilter = {from: '', to: '', methods: []};
function invoiceDateRange(readControls = false) {
  if (readControls) {
    const from = document.getElementById('invoiceFrom'), to = document.getElementById('invoiceTo');
    if (!validateReportDateRange(from, to, true)) return null;
    appliedInvoiceDateFilter = {from: from.value, to: to.value, methods: selectedReportValues(document.getElementById('invoiceMethods'))};
  }
  return appliedInvoiceDateFilter;
}

// Dates displayed by grids use dd/MM/yyyy; comparisons use ISO calendar dates.
function gridCalendarDay(text) {
  const iso = reportDay(text);
  if (iso) return iso;
  const match = String(text || '').trim().match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})/);
  return match ? `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}` : '';
}
function setupRowReportFilters(table) {
  if (!table) return;
  const form = document.querySelector(`[data-report-table="${table.id}"]`);
  if (!form) return;
  const control = form.querySelector('.multi-filter');
  if(form.dataset.statusTabs){applyRowReportFilters(form,false);return;}
  const values = [...new Set([...(control.dataset.defaultValues || '').split('|'), ...[...table.querySelectorAll('tbody tr')].filter(row => row.cells.length > 1).map(row => row.cells[Number(form.dataset.valueColumn)]?.textContent.trim()).filter(Boolean)])];
  reportMulti(control, values);
  applyRowReportFilters(form, false);
}
function applyRowReportFilters(form, readControls = true) {
  const table = document.getElementById(form.dataset.reportTable);
  const dates = form.querySelectorAll('input[type=date]');
  if (readControls) {
    if (!validateReportDateRange(dates[0], dates[1], true)) return;
    form.appliedReport = {from: dates[0].value, to: dates[1].value, values: form.dataset.statusTabs?(form.appliedReport?.values||[]):selectedReportValues(form.querySelector('.multi-filter'))};
    if(form.querySelector('.multi-filter'))form.querySelector('.multi-filter').open = false;
  }
  const f = form.appliedReport || {from:'', to:'', values:[]};
  table.querySelectorAll('tbody tr').forEach(row => {
    if (row.cells.length <= 1) return;
    const day = gridCalendarDay(row.cells[Number(form.dataset.dateColumn)]?.textContent);
    const value = row.cells[Number(form.dataset.valueColumn)]?.textContent.trim();
    const show = (!f.from || day >= f.from) && (!f.to || (day && day <= f.to)) && (!f.values.length || f.values.includes(value));
    row.classList.toggle('filter-hidden', !show);
  });
  if (readControls) table.dataset.currentPage = '1';
  if (window.updatePagination) window.updatePagination(table);
  if(form.dataset.statusTabs)renderStatusFilterTabs(form,table);
  // Bulk shipment actions remain available only for a single matching status.
  if (table.id === 'exportTable') {
    const button = document.getElementById('btnChangeAll');
    const status = f.values.length === 1 ? f.values[0] : '';
    const next = (f.from || f.to) ? '' : status === 'Chờ lấy hàng' ? 'Đang giao hàng' : status === 'Đang giao hàng' ? 'Đã giao hàng' : '';
    button.hidden = !next;
    button.style.display = next ? 'inline-flex' : 'none';
    button.textContent = `Chuyển tất cả → ${next}`;
    button.onclick = () => changeAllStatus(status, next);
  }
}

// Native calendar remains available; its end icon becomes a clear action on hover.
function enhanceFilterDate(input) {
  if (input.parentElement?.classList.contains('filter-date-control')) return;
  const wrapper = document.createElement('div'); wrapper.className = 'filter-date-control';
  input.before(wrapper); wrapper.append(input);
  const clear = document.createElement('button'); clear.type = 'button'; clear.className = 'filter-clear'; clear.textContent = '×';
  clear.title = 'Xóa ngày đã chọn'; clear.setAttribute('aria-label', 'Xóa ngày đã chọn');
  wrapper.append(clear);
  const refresh = () => {
    wrapper.classList.toggle('has-value', Boolean(input.value));
    clear.hidden = !input.value;
  };
  input.addEventListener('input', refresh); input.addEventListener('change', refresh);
  clear.onclick = event => {
    event.preventDefault(); event.stopPropagation(); input.value = '';
    input.dispatchEvent(new Event('input', {bubbles:true}));
    input.dispatchEvent(new Event('change', {bubbles:true}));
    input.focus(); refresh();
  };
  refresh();
}

function enhanceSingleFilterSelect(select) {
  if (select.parentElement?.classList.contains('filter-select-control')) return;
  const wrapper = document.createElement('div'); wrapper.className = 'filter-select-control';
  select.before(wrapper); wrapper.append(select);
  const clear = document.createElement('button'); clear.type = 'button'; clear.className = 'filter-clear'; clear.textContent = '×';
  clear.title = 'Bỏ chọn tất cả'; clear.setAttribute('aria-label', 'Bỏ chọn tất cả'); wrapper.append(clear);
  const refresh = () => { clear.hidden = !select.value; };
  select.addEventListener('change', refresh);
  clear.onclick = event => {
    event.preventDefault(); event.stopPropagation(); select.value = '';
    select.dispatchEvent(new Event('change', {bubbles:true})); select.focus(); refresh();
  };
  refresh();
}

// Measure every action row, including rows hidden by filters/pagination, without
// inheriting a fixed column width. The measuring table is never visible or interactive.
function measureGridActionWidth(table,index){
  const wrapper=table.closest('.table-responsive');if(!wrapper)return 56;
  const host=document.createElement('div');host.setAttribute('aria-hidden','true');host.inert=true;
  host.style.cssText='position:fixed;left:-10000px;top:0;visibility:hidden;pointer-events:none;width:max-content;max-width:none;';
  const measuring=document.createElement('table'),body=document.createElement('tbody');
  measuring.className=table.className;
  for(const [property,value] of Object.entries({width:'max-content','min-width':'0','max-width':'none','table-layout':'auto'}))measuring.style.setProperty(property,value,'important');
  for(const row of table.querySelectorAll('tbody tr')){
    const source=row.cells[index];if(!source||!source.querySelector('button,a'))continue;
    const copy=source.cloneNode(true),tr=document.createElement('tr');
    copy.removeAttribute('id');copy.classList.remove('javi-action-column');
    for(const [property,value] of Object.entries({width:'auto','min-width':'0','max-width':'none',position:'static','white-space':'nowrap',padding:'0 13px',overflow:'visible'}))copy.style.setProperty(property,value,'important');
    tr.append(copy);body.append(tr);
  }
  measuring.append(body);host.append(measuring);wrapper.append(host);
  try{return Math.max(56,Math.ceil(measuring.getBoundingClientRect().width));}finally{host.remove();}
}

// Data columns keep stable widths; only an actual change in available actions resizes their rail.
function lockGridColumns(table, resize = false) {
  const header = table.querySelector('thead tr');
  const wrapper = table.closest('.table-responsive');
  if (!header || !wrapper || !wrapper.clientWidth) return;
  const cells = [...header.cells];
  const actions=cells.map((th,index)=>th.classList.contains('javi-action-column')?measureGridActionWidth(table,index):0);
  const actionSignature=actions.join(',');
  if(table.dataset.columnsLocked&&!resize&&table.dataset.actionWidths===actionSignature)return;
  table.dataset.actionWidths=actionSignature;
  const widths = cells.map((th,index) => {
    if (th.style.display === 'none' || th.classList.contains('d-none')) return 0;
    if (th.classList.contains('javi-action-column')) return actions[index]||56;
    const title = th.textContent.trim().toLowerCase();
    if (/khách hàng|tên khách/.test(title)) return 320;
    if (/tên sản phẩm|tên nhà cung cấp|ghi chú|địa chỉ/.test(title)) return 280;
    if (/trạng thái|tình trạng/.test(title)) return 210;
    if (/ngày|thời gian/.test(title)) return 155;
    if (/tiền|giá|thành tiền|hình thức|thanh toán/.test(title)) return 170;
    if (!title || /hành động|thao tác/.test(title)) return actions[index]||56;
    return 150;
  });
  const total = widths.reduce((sum, width) => sum + width, 0);
  const extra = Math.max(0, wrapper.clientWidth - total);
  const flexible = widths.filter((width,index)=>width&&!cells[index].classList.contains('javi-action-column')).length;
  let group = table.querySelector(':scope > colgroup[data-grid-widths]');
  if (!group) { group = document.createElement('colgroup'); group.dataset.gridWidths = 'true'; table.prepend(group); }
  group.replaceChildren();
  widths.forEach((width, index) => {
    const col = document.createElement('col');
    const fixed = width ? width + (cells[index].classList.contains('javi-action-column')?0:extra / (flexible||1)) : 0;
    col.style.width = `${fixed}px`;
    if (!width) col.style.display = 'none';
    group.append(col);
    cells[index].style.setProperty('width', `${fixed}px`, 'important');
    cells[index].style.setProperty('min-width', `${fixed}px`, 'important');
  });
  const fixedWidth = Math.max(total, wrapper.clientWidth);
  table.style.setProperty('width', `${fixedWidth}px`, 'important');
  table.style.setProperty('min-width', `${fixedWidth}px`, 'important');
  table.dataset.columnsLocked = 'true';
}
window.addEventListener('resize', () => {
  document.querySelectorAll('table[data-columns-locked]').forEach(table => lockGridColumns(table, true));
});
document.addEventListener('DOMContentLoaded',()=>{
  document.fonts?.ready.then(()=>document.querySelectorAll('table[data-columns-locked]').forEach(table=>lockGridColumns(table,true)));
});

function renderStatusFilterTabs(form,table){
 const container=document.getElementById(form.dataset.statusTabs);if(!container)return;
 const f=form.appliedReport||{from:'',to:'',values:[]},counts=new Map();
 const rows=[...table.querySelectorAll('tbody tr')].filter(row=>row.cells.length>1);
 for(const row of rows){const day=gridCalendarDay(row.cells[Number(form.dataset.dateColumn)]?.textContent);if((f.from&&day<f.from)||(f.to&&(!day||day>f.to)))continue;const value=row.cells[Number(form.dataset.valueColumn)]?.textContent.trim();counts.set(value,(counts.get(value)||0)+1);}
 const statuses=[...new Set(['Chờ lấy hàng','Đang giao hàng','Đã giao hàng','Giao hàng không thành công','Hủy xuất kho',...rows.map(row=>row.cells[Number(form.dataset.valueColumn)]?.textContent.trim()).filter(Boolean)])];
 container.replaceChildren();
 for(const value of ['',...statuses]){const button=document.createElement('button');button.type='button';button.className='status-filter-tab';button.setAttribute('aria-pressed',String(value?f.values.includes(value):!f.values.length));
 const label=document.createElement('span');label.textContent=value||'Tất cả';const badge=document.createElement('b');badge.textContent=String(value?(counts.get(value)||0):[...counts.values()].reduce((a,b)=>a+b,0));button.append(label,badge);
 button.onclick=()=>{form.appliedReport={...f,values:value?[value]:[]};table.dataset.currentPage='1';applyRowReportFilters(form,false);};container.append(button);}
}
