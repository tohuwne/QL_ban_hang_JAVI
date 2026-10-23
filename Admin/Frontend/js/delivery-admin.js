(()=>{
const $=s=>document.querySelector(s), esc=reportEscape;
let state={provinces:[],wards:[],rates:[]};
let filteredProvinces=[], filteredWards=[], filteredRates=[];
let currentTab='province'; // province | ward | shipping

/* ─── API HELPER ─── */
async function request(path='',body){
  const user=JSON.parse(localStorage.getItem('currentUser')||'null');
  const r=await fetch('/api/cau-hinh-website/commerce'+path,{
    method:body?'PUT':'GET',
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+user?.AuthToken},
    ...(body?{body:JSON.stringify(body)}:{})
  });
  const data=await r.json();
  if(!r.ok||!data.success) throw Error(data.message);
  return data.data;
}

/* ─── TAB SWITCHING ─── */
function initTabs(){
  document.querySelectorAll('.web-tabs [role=tab]').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.web-tabs [role=tab]').forEach(t=>{t.setAttribute('aria-selected','false');});
      tab.setAttribute('aria-selected','true');
      document.querySelectorAll('.web-tab-panel[role=tabpanel]').forEach(p=>{p.hidden=true;});
      const panel=$('#'+tab.getAttribute('aria-controls'));
      if(panel) panel.hidden=false;
      currentTab=tab.id==='tabProvince'?'province':tab.id==='tabWard'?'ward':'shipping';
    });
  });
}

/* ─── RENDER: TAB 1 – TỈNH THÀNH ─── */
function renderProvinces(){
  const q=$('#searchProvince').value.toLocaleLowerCase('vi');
  filteredProvinces=state.provinces.filter(r=>
    JSON.stringify(r).toLocaleLowerCase('vi').includes(q)
  );
  const tbody=$('#tblProvince tbody');
  if(!filteredProvinces.length){
    tbody.innerHTML='<tr><td colspan="2" style="text-align:center">Không có dữ liệu</td></tr>';
    return;
  }
  tbody.innerHTML=filteredProvinces.map((r,i)=>`
    <tr data-row-edit="editProvinceDirectory" data-edit-id="${i}">
      <td>${esc(r.MaTinhThanh)}</td>
      <td>${esc(r.TenTinhThanh)}</td>
    </tr>`).join('');
}

/* ─── RENDER: TAB 2 – PHƯỜNG / XÃ ─── */
function renderWards(){
  const province=$('#filterWardProvince').value;
  const q=$('#searchWard').value.toLocaleLowerCase('vi');
  filteredWards=state.wards
    .filter(w=>!province||String(w.MaTinhThanh)===province)
    .filter(r=>JSON.stringify(r).toLocaleLowerCase('vi').includes(q));
  const tbody=$('#tblWard tbody');
  if(!filteredWards.length){
    tbody.innerHTML='<tr><td colspan="3" style="text-align:center">Không có dữ liệu</td></tr>';
    return;
  }
  tbody.innerHTML=filteredWards.map((r,i)=>`
    <tr data-row-edit="editWardDirectory" data-edit-id="${i}">
      <td>${esc(r.MaPhuongXa)}</td>
      <td>${esc(r.TenPhuongXa)}</td>
      <td>${esc(r.TenTinhThanh)}</td>
    </tr>`).join('');
}

/* ─── RENDER: TAB 3 – PHÍ GIAO HÀNG ─── */
function renderShipping(){
  const q=$('#searchShipping').value.toLocaleLowerCase('vi');
  filteredRates=state.rates.filter(r=>
    JSON.stringify(r).toLocaleLowerCase('vi').includes(q)
  );
  const tbody=$('#tblShipping tbody');
  if(!filteredRates.length){
    tbody.innerHTML='<tr><td colspan="4" style="text-align:center">Không có dữ liệu</td></tr>';
    return;
  }
  tbody.innerHTML=filteredRates.map((r,i)=>`
    <tr data-row-edit="editShippingDirectory" data-edit-id="${i}">
      <td>${esc(r.TenKhuVuc)}</td>
      <td>${Number(r.PhiVanChuyen).toLocaleString('vi-VN')} đ</td>
      <td>${r.MienPhiTu==null?'Không áp dụng':Number(r.MienPhiTu).toLocaleString('vi-VN')+' đ'}</td>
      <td>${r.HienThi?'<span style="color:var(--color-success)">Hoạt động</span>':'<span style="color:var(--color-text-muted)">Tạm ngưng</span>'}</td>
    </tr>`).join('');
}

/* ─── LOAD DATA ─── */
async function load(){
  const [locData, commerceData]=await Promise.all([
    request('/locations'),
    request('')
  ]);
  state.provinces=locData.provinces;
  state.wards=locData.wards;
  state.rates=commerceData.rates;

  // Populate filter dropdown for ward tab
  const sel=$('#filterWardProvince');
  const selected=sel.value;
  sel.replaceChildren(
    new Option('Tất cả tỉnh / thành',''),
    ...state.provinces.map(p=>new Option(p.TenTinhThanh,p.MaTinhThanh))
  );
  sel.value=selected;

  renderProvinces();
  renderWards();
  renderShipping();
}

/* ─── EDITOR: TỈNH THÀNH ─── */
function editProvince(row){
  const f=$('#formProvince');
  f.reset();
  $('#errProvince').textContent='';
  f.hidden=false; $('#formWard').hidden=true; $('#formShipping').hidden=true;
  $('#deliveryTitle').textContent=(row?'Chỉnh sửa':'Thêm mới')+' tỉnh / thành phố';
  f.dataset.edit=row?'1':'';
  f.elements.code.value=row?row.MaTinhThanh:'';
  f.elements.code.readOnly=!!row;
  f.elements.name.value=row?row.TenTinhThanh:'';
  $('#deliveryModal').style.display='flex';
}

/* ─── EDITOR: PHƯỜNG / XÃ ─── */
function editWard(row){
  const f=$('#formWard');
  f.reset();
  $('#errWard').textContent='';
  f.hidden=false; $('#formProvince').hidden=true; $('#formShipping').hidden=true;
  $('#deliveryTitle').textContent=(row?'Chỉnh sửa':'Thêm mới')+' phường / xã';
  f.dataset.edit=row?'1':'';
  f.elements.code.value=row?row.MaPhuongXa:'';
  f.elements.code.readOnly=!!row;
  f.elements.name.value=row?row.TenPhuongXa:'';
  f.elements.parent.replaceChildren(
    ...state.provinces.map(p=>new Option(p.TenTinhThanh,p.MaTinhThanh))
  );
  f.elements.parent.disabled=!!row;
  if(row) f.elements.parent.value=row.MaTinhThanh;
  $('#deliveryModal').style.display='flex';
}

/* ─── EDITOR: PHÍ GIAO HÀNG ─── */
function editShipping(row){
  const f=$('#formShipping');
  f.reset();
  $('#errShipping').textContent='';
  f.hidden=false; $('#formProvince').hidden=true; $('#formWard').hidden=true;
  $('#deliveryTitle').textContent=(row?'Chỉnh sửa':'Thêm mới')+' phí giao hàng';
  f.dataset.edit=row?'1':'';

  // Build province dropdown – filter out provinces already configured (unless editing)
  const used=new Set(state.rates.map(r=>String(r.MaTinhThanh??'')));
  const options=[
    new Option('Mặc định cho các tỉnh/thành chưa có mức riêng',''),
    ...state.provinces.map(p=>new Option(p.TenTinhThanh,p.MaTinhThanh))
  ].filter(o=>row||!used.has(o.value));

  if(!options.length){
    $('#msgShipping').textContent='Tất cả khu vực đã có mức phí, nhấp đúp vào dòng để cập nhật.';
    return;
  }

  f.elements.province.replaceChildren(...options);
  f.elements.province.disabled=!!row;
  if(row){
    f.elements.province.value=row.MaTinhThanh??'';
    f.elements.fee.value=row.PhiVanChuyen;
    f.elements.free.value=row.MienPhiTu??'';
    f.elements.active.value=row.HienThi?'1':'0';
  }
  $('#deliveryModal').style.display='flex';
}

/* ─── SUBMIT HANDLERS ─── */
async function submitProvince(e){
  e.preventDefault();
  const f=e.currentTarget, btn=f.querySelector('[type=submit]');
  btn.disabled=true;
  try{
    const body={
      kind:'province',
      code:f.elements.code.value,
      name:f.elements.name.value,
      parent:'',
      edit:f.dataset.edit==='1'
    };
    await request('/location',body);
    await load();
    $('#deliveryModal').style.display='none';
    showMsg('msgProvince','Đã lưu tỉnh / thành phố thành công.');
  }catch(err){
    $('#errProvince').textContent=err.message;
  }finally{btn.disabled=false;}
}

async function submitWard(e){
  e.preventDefault();
  const f=e.currentTarget, btn=f.querySelector('[type=submit]');
  btn.disabled=true;
  try{
    const body={
      kind:'ward',
      code:f.elements.code.value,
      name:f.elements.name.value,
      parent:f.elements.parent.value,
      edit:f.dataset.edit==='1'
    };
    await request('/location',body);
    await load();
    $('#deliveryModal').style.display='none';
    showMsg('msgWard','Đã lưu phường / xã thành công.');
  }catch(err){
    $('#errWard').textContent=err.message;
  }finally{btn.disabled=false;}
}

async function submitShipping(e){
  e.preventDefault();
  const f=e.currentTarget, btn=f.querySelector('[type=submit]');
  btn.disabled=true;
  try{
    const body={
      province:f.elements.province.value,
      fee:f.elements.fee.value,
      free:f.elements.free.value,
      active:f.elements.active.value==='1'
    };
    await request('/shipping',body);
    await load();
    $('#deliveryModal').style.display='none';
    showMsg('msgShipping','Đã lưu phí giao hàng thành công.');
  }catch(err){
    $('#errShipping').textContent=err.message;
  }finally{btn.disabled=false;}
}

function showMsg(id,text){
  const el=$('#'+id);
  el.textContent=text;
  el.style.color='var(--color-primary)';
  setTimeout(()=>{el.textContent='';},4000);
}

window.editProvinceDirectory=i=>editProvince(filteredProvinces[Number(i)]);
window.editWardDirectory=i=>editWard(filteredWards[Number(i)]);
window.editShippingDirectory=i=>editShipping(filteredRates[Number(i)]);

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded',async()=>{
  initTabs();


  try{ await load(); }catch(e){
    $('#msgProvince').textContent=e.message;
    $('#msgWard').textContent=e.message;
    $('#msgShipping').textContent=e.message;
  }

  // Add buttons
  $('#addProvince').onclick=()=>editProvince();
  $('#addWard').onclick=()=>editWard();
  $('#addShipping').onclick=()=>editShipping();

  // Close modal
  $('#closeEditor').onclick=()=>$('#deliveryModal').style.display='none';

  document.querySelectorAll('[data-close-directory]').forEach(button=>button.onclick=()=>$('#deliveryModal').style.display='none');

  // Search inputs
  $('#searchProvince').oninput=renderProvinces;
  $('#searchWard').oninput=renderWards;
  $('#searchShipping').oninput=renderShipping;
  $('#filterWardProvince').onchange=renderWards;

  // Form submissions
  $('#formProvince').onsubmit=submitProvince;
  $('#formWard').onsubmit=submitWard;
  $('#formShipping').onsubmit=submitShipping;
});
})();
