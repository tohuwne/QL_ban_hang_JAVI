/* Shared document shells: move only body content; keep existing form and button handlers. */
(function(){
 const excluded=new Set(['javiAlertModal','javiConfirmModal','profileModal']);
 let sourceRow=null;
 const rowActions=row=>row?[...row.querySelectorAll('td button,td a')].filter(el=>!el.disabled&&!el.hidden&&el.getClientRects().length&&!el.closest('[hidden],[inert]')&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&!el.matches('.btn-view')&&!el.querySelector('.bi-eye')&&!/view(?:Detail|Invoice|CustomerInvoices|Order)\s*\(/i.test(el.getAttribute('onclick')||'')):[];
 function syncDetailActions(content){
  if(content.querySelector('form')||getComputedStyle(content.parentElement).display==='none')return;
  const footer=content.querySelector('.javi-modal-footer');if(!footer)return;
  let group=footer.querySelector('.javi-detail-row-actions');
  const actions=rowActions(sourceRow),signature=actions.map(el=>(el.getAttribute('onclick')||el.getAttribute('href')||'')+'|'+el.outerHTML).join('');
  if(footer.dataset.rowActions===signature)return;footer.dataset.rowActions=signature;
  if(!group){group=document.createElement('div');group.className='javi-detail-row-actions';footer.prepend(group);}group.replaceChildren();
  for(const action of actions){
   const copy=document.createElement('button');copy.type='button';copy.className='btn';copy.innerHTML=action.innerHTML;copy.style.cssText=action.style.cssText;copy.title=action.title;copy.setAttribute('aria-label',action.getAttribute('aria-label')||action.textContent.trim()||action.title||'Thao tác');
   if(action.classList.contains('debt-collect'))copy.classList.add('debt-collect');
   if(action.classList.contains('debt-pay'))copy.classList.add('debt-pay');
   copy.onclick=()=>{if(!action.isConnected||action.disabled)return;content.parentElement.style.display='none';action.click();};group.append(copy);
  }
  group.hidden=!actions.length;
 }
 const missing=value=>['','—','-','null','undefined','chưa cập nhật','không rõ','không có'].includes(String(value??'').trim().replace(/^\((.*)\)$/,'$1').toLowerCase());
 function section(text){const el=document.createElement('div');el.className='section-title';el.textContent=text;return el;}
 function prepareDetail(content){
  if(content.querySelector('form'))return;
  const body=content.querySelector('.javi-modal-body');if(!body)return;
  if(!body.dataset.detailTemplate){
   const info=body.querySelector('.detail-info,.voucher-info-grid');
   if(info){info.classList.add('javi-detail-info');for(const field of [...body.children].filter(el=>el.classList.contains('voucher-info-item')))info.append(field);}
   const firstSection=[...body.children].find(el=>el.classList.contains('section-title'));
   if(firstSection&&/^thông tin/i.test(firstSection.textContent.trim()))firstSection.textContent='Thông tin chung';
   else if(![...body.children].some(el=>el.classList.contains('section-title')&&el.textContent.trim()==='Thông tin chung'))body.prepend(section('Thông tin chung'));
   body.querySelectorAll('.detail-info,.voucher-info-grid').forEach(el=>el.classList.add('javi-detail-info'));
   body.querySelectorAll('strong,.voucher-label').forEach(label=>{
    const field=label.parentElement,value=[...field.children].find(el=>el!==label&&(el.matches('span[id],.voucher-value')||el.id));
    if(value&&!field.querySelector('table,input,select,button')){field.classList.add('javi-detail-field');label.classList.add('javi-detail-label');value.classList.add('javi-detail-value');}
   });
   for(const table of body.querySelectorAll('table')){
    const wrapper=table.closest('.table-responsive')||table;
    const product=/sản phẩm|tên sp/i.test(table.querySelector('thead')?.textContent||'');
    let title=wrapper.previousElementSibling;
    if(!title?.matches('.section-title,.card-panel-header')){title=section(product?'Danh sách sản phẩm':'Danh sách hóa đơn');wrapper.before(title);}
    if(product){if(title.textContent.trim()!=='Danh sách sản phẩm')title.textContent='Danh sách sản phẩm';title.classList.add('section-title');wrapper.classList.add('javi-product-list');title.classList.add('javi-product-title');}
   }
   const total=body.querySelector('.voucher-highlight-banner');if(total)body.append(total);
   for(const group of [...body.children]){
    if(!group.matches('.detail-info,.voucher-info-grid')&&[...group.children].filter(el=>el.classList.contains('javi-detail-field')).length>1)group.classList.add('javi-detail-summary');
   }
   body.querySelectorAll('hr').forEach(el=>el.remove());body.dataset.detailTemplate='1';
  }
  body.querySelectorAll('.javi-detail-field').forEach(field=>{const value=field.querySelector('.javi-detail-value,span[id]');if(value)value.classList.add('javi-detail-value');field.hidden=missing(value?.textContent);});
  body.querySelectorAll('.javi-detail-info:not(#webOrderDelivery)').forEach(info=>{const fields=[...info.querySelectorAll('.javi-detail-field')];if(fields.length)info.hidden=fields.every(el=>el.hidden);});
  body.querySelectorAll('.javi-product-list').forEach(wrapper=>{const rows=[...wrapper.querySelectorAll('tbody tr')],empty=!rows.length||rows.every(row=>row.cells.length===1&&/không có (sản phẩm|dữ liệu)|chưa có sản phẩm/i.test(row.textContent));wrapper.hidden=empty;const title=wrapper.previousElementSibling;if(title?.classList.contains('javi-product-title'))title.hidden=empty;});
 }
 function normalizeBusinessModals(){
  document.querySelectorAll('.modal-overlay .modal-content').forEach(content=>{
   if(excluded.has(content.parentElement.id))return;
   const editing=/cập nhật|chỉnh sửa|sửa thông tin/i.test(content.querySelector('.modal-header')?.textContent||'');
   content.querySelectorAll('form').forEach(form=>{
    if(form.hidden)return;
    const button=form.querySelector('[type=submit]');if(!button)return;
    if(!/^(lưu|cập nhật)/i.test(button.textContent.trim()))return;
    if(!button.dataset.createLabel)button.dataset.createLabel=button.innerHTML;
    if(editing||form.dataset.edit==='1'||form.id==='webProductForm'){
     if(button.textContent!=='Cập nhật')button.textContent='Cập nhật';
    }else if(button.innerHTML!==button.dataset.createLabel)button.innerHTML=button.dataset.createLabel;
   });
  });
  document.querySelectorAll('.modal-overlay table').forEach(table=>{
   const headers=table.querySelector('thead tr')?.cells;if(!headers)return;
   [...headers].forEach((th,index)=>{
    const label=th.textContent.trim(),align=/^(sl|số lượng|trọng lượng|loại xay|giảm giá|đvt|đơn vị|thao tác|hành động)$/i.test(label)?'center':/giá|tiền|đã trả|còn nợ|phải thu|phải trả/i.test(label)?'right':'left';
    th.style.setProperty('text-align',align,'important');
    table.querySelectorAll('tbody tr').forEach(row=>{if(row.cells.length===headers.length&&row.cells[index].colSpan===1)row.cells[index].style.setProperty('text-align',align,'important');});
   });
  });
  document.querySelectorAll('.modal-overlay .table-responsive table').forEach(table=>{
   const header=table.querySelector('thead tr'),index=header?header.cells.length-1:-1;if(index<0)return;
   const th=header.cells[index];if(!/hành động|thao tác/i.test(th.textContent))return;
   th.classList.add('javi-action-column');table.querySelectorAll('tbody tr').forEach(row=>{if(row.cells.length===header.cells.length)row.cells[index].classList.add('javi-action-column');});
  });
  document.querySelectorAll('.modal-overlay > .modal-content').forEach(content=>{
   if(excluded.has(content.parentElement.id)||content.dataset.fixedShell)return;
   const header=[...content.children].find(el=>el.classList.contains('modal-header'));if(!header)return;
   const forms=[...content.children].filter(el=>el.tagName==='FORM');
   for(const form of forms){
    let footer=[...form.children].find(el=>el.classList.contains('modal-footer'));
    const last=form.lastElementChild;
    if(!footer&&last?.tagName==='DIV'&&[...last.children].some(el=>el.tagName==='BUTTON'))footer=last;
    let body=[...form.children].find(el=>el.matches('.detail-body,.modal-body,.javi-modal-body'));
    if(!body){body=document.createElement('div');for(const child of [...form.childNodes])if(child!==footer)body.append(child);form.prepend(body);}
    body.classList.add('javi-modal-body');if(footer)footer.classList.add('javi-modal-footer','modal-footer');form.classList.add('javi-modal-form');
   }
   if(forms.length){content.classList.add('javi-fixed-modal');content.dataset.fixedShell='1';return;}
   const form=null,root=content;
   let footer=[...root.children].find(el=>el.classList.contains('modal-footer'));
   const last=root.lastElementChild;
   if(!footer&&last!==header&&last?.tagName==='DIV'&&[...last.children].some(el=>el.tagName==='BUTTON'))footer=last;
   if(!footer&&!form){const nested=root.querySelector('.detail-body,.modal-body')?.lastElementChild;if(nested?.tagName==='DIV'&&[...nested.children].some(el=>el.tagName==='BUTTON')){footer=nested;root.append(footer);}}
   if(!footer&&!form){footer=document.createElement('div');const close=document.createElement('button');close.type='button';close.className='btn btn-secondary';close.textContent='Đóng';close.onclick=()=>{content.parentElement.style.display='none';};footer.append(close);root.append(footer);}
   if(footer)footer.classList.add('javi-modal-footer','modal-footer');
   let body=[...root.children].find(el=>el.classList.contains('detail-body')||el.classList.contains('modal-body'));
   if(!body){body=document.createElement('div');const children=[...root.children].filter(el=>el!==header&&el!==footer);if(children.length)root.insertBefore(body,children[0]);else root.insertBefore(body,footer);children.forEach(el=>body.append(el));}
   body.classList.add('javi-modal-body');content.classList.add('javi-fixed-modal');if(!form)content.classList.add('document-detail');
   if(form)form.classList.add('javi-modal-form');content.dataset.fixedShell='1';
  });
  document.querySelectorAll('.modal-content.javi-fixed-modal.document-detail').forEach(content=>{prepareDetail(content);syncDetailActions(content);});
 }
 window.normalizeBusinessModals=normalizeBusinessModals;
 const init=()=>{
  const remember=event=>{const row=event.target.closest('.table-responsive tbody tr');if(row&&!row.closest('.modal-overlay'))sourceRow=row;};
  document.addEventListener('dblclick',remember,true);document.addEventListener('click',remember,true);
  normalizeBusinessModals();const observer=new MutationObserver(records=>{if(records.some(r=>r.type!=='attributes'||r.target.classList.contains('modal-overlay')))normalizeBusinessModals();});observer.observe(document.body,{childList:true,characterData:true,attributes:true,attributeFilter:['style'],subtree:true});
 };
 if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init);else init();
})();
