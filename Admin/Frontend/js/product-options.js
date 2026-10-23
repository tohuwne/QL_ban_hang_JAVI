let optionSettings={grinds:[],weights:[],typeGrinds:[],typeWeights:[]};
const optionEsc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function loadOptionCatalogs(){
 const response=await fetch('/api/loai-sp/options');const result=await response.json();if(!result.success)throw Error(result.message);
 optionSettings=result.data;
 renderOptionDirectory();
}
function renderTypeOptions(type=null){
 const target=document.getElementById('typeOptions');target.hidden=!document.getElementById('apDungTuyChon').checked;
 target.innerHTML=[['grinds','typeGrinds','MaLoaiXay','typeGrind','Loại xay'],['weights','typeWeights','MaTrongLuong','typeWeight','Trọng lượng']].map(([kind,map,key,name,title])=>`<fieldset class="option-fieldset"><legend>${title} được áp dụng</legend>${optionSettings[kind].filter(x=>x.HoatDong).map(row=>`<label class="option-check"><input type="checkbox" name="${name}" value="${row[key]}" ${type&&optionSettings[map].some(x=>x.MaLoaiSP.trim()===type.trim()&&Number(x[key])===Number(row[key]))?'checked':''}> ${optionEsc(row.TenLoaiXay||row.TrongLuongGram+'g')}</label>`).join('')||'<p>Chưa có lựa chọn đang hoạt động. Thêm trong danh mục trước.</p>'}</fieldset>`).join('');
}
function editOption(kind,id=null){
 document.querySelector('#optionEditor .close-btn')?.click();const row=optionSettings[kind].find(x=>Number(x.MaLoaiXay||x.MaTrongLuong)===id);
 const dialog=document.createElement('div');dialog.id='optionEditor';dialog.className='modal-overlay';dialog.style.display='flex';
 dialog.innerHTML=`<div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="optionEditorTitle"><div class="modal-header"><h3 id="optionEditorTitle"><i class="fas ${kind==='grinds'?'fa-gear':'fa-scale-balanced'}" aria-hidden="true"></i> ${id?'Cập nhật':'Thêm'} ${kind==='grinds'?'loại xay':'trọng lượng'}</h3><button type="button" class="close-btn" aria-label="Đóng">×</button></div><form id="optionEditorForm"><div class="section-title">Thông tin ${kind==='grinds'?'loại xay':'trọng lượng'}</div><div class="form-group"><label for="optionValue">${kind==='grinds'?'Tên loại xay':'Trọng lượng (gram)'}</label><input id="optionValue" ${kind==='weights'?'type="number" min="100" max="1000000" step="100"':'type="text" maxlength="80"'} required value="${optionEsc(row?.TenLoaiXay||row?.TrongLuongGram||'')}"></div><div class="form-group"><label for="optionOrder">Thứ tự hiển thị</label><input id="optionOrder" type="number" min="0" step="1" required value="${row?.ThuTu||0}"></div><label class="option-check"><input id="optionActive" type="checkbox" ${row?.HoatDong===false?'':'checked'}> Đang hoạt động</label><p id="optionError" role="alert"></p><div class="modal-footer"><button type="button" class="btn directory-cancel" data-cancel>Hủy</button><button type="submit" class="btn"><i class="fas fa-save" aria-hidden="true"></i> Lưu</button></div></form></div>`;
 const returnFocus=document.activeElement;const close=()=>{document.removeEventListener('keydown',onKey);dialog.remove();returnFocus?.focus();};const onKey=event=>{if(event.key==='Escape')close();};document.body.append(dialog);document.addEventListener('keydown',onKey);dialog.querySelector('.close-btn').onclick=close;dialog.querySelector('[data-cancel]').onclick=close;
 dialog.querySelector('form').onsubmit=async event=>{event.preventDefault();const button=dialog.querySelector('[type=submit]');button.disabled=true;try{const r=await fetch('/api/loai-sp/options/'+kind+(id?'/'+id:''),{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({value:dialog.querySelector('#optionValue').value,order:Number(dialog.querySelector('#optionOrder').value),active:dialog.querySelector('#optionActive').checked})});const result=await r.json();if(!result.success)throw Error(result.message);await loadOptionCatalogs();close();}catch(e){dialog.querySelector('#optionError').textContent=e.message;}finally{button.disabled=false;}};
 window.normalizeBusinessModals?.();dialog.querySelector('#optionValue').focus();
}
document.addEventListener('click',event=>{const add=event.target.closest('[data-new-option]');if(add)editOption(add.dataset.newOption);const edit=event.target.closest('[data-option-kind]');if(edit)editOption(edit.dataset.optionKind,Number(edit.dataset.optionId));});

function renderOptionDirectory(){
 const kind=document.body.dataset.optionCatalog;if(!['weights','grinds'].includes(kind))return;
 const body=document.querySelector('#optionDirectory tbody');
 body.innerHTML=optionSettings[kind].map(row=>{const id=Number(row.MaLoaiXay||row.MaTrongLuong);return '<tr data-row-edit="editCatalogOption" data-edit-id="'+id+'"><td>'+id+'</td><td><strong>'+optionEsc(kind==='weights'?row.TrongLuongGram+'g':row.TenLoaiXay)+'</strong></td><td>'+row.ThuTu+'</td><td><span class="option-status '+(row.HoatDong?'is-active':'is-inactive')+'">'+(row.HoatDong?'Đang hoạt động':'Ngừng sử dụng')+'</span></td><td><button type="button" class="action-btn" aria-label="Chỉnh sửa '+optionEsc(kind==='weights'?row.TrongLuongGram+'g':row.TenLoaiXay)+'" data-option-kind="'+kind+'" data-option-id="'+id+'"><i class="ri-edit-line" aria-hidden="true"></i></button></td></tr>';}).join('')||'<tr><td colspan="5" class="option-empty">Chưa có dữ liệu</td></tr>';
}
function editCatalogOption(id){editOption(document.body.dataset.optionCatalog,Number(id));}
document.addEventListener('DOMContentLoaded',()=>{
 if(!document.body.dataset.optionCatalog)return;
 loadOptionCatalogs().catch(error=>{const body=document.querySelector('#optionDirectory tbody');body.innerHTML='<tr><td colspan="5" class="option-empty">'+optionEsc(error.message)+'</td></tr>';});
});
