/* Presentation metadata only. Never changes handlers, visibility, disabled state or business permissions. */
(()=>{
 const selector='.btn,.action-btn,.btn-edit,.btn-delete,.btn-view,.btn-confirm,.btn-cancel,.import-secondary,.directory-cancel,.web-panel-toolbar button,.email-entry button,#btnCancelOrder,#btnSaveOrder,#chooseFile';
 function normalize(root){
  root.querySelectorAll('.field-error,.error-message,.form-error,.validation-error,[id$="Error"],[id$="Message"]').forEach(e=>{if(e.matches('p,small,span,div')&&!e.closest('.toast,.toast-container'))e.classList.add('javi-feedback-slot');});
  const buttons=[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];
  for(const b of buttons){
   if(!b.matches('button,a')||b.closest('.sidebar,.pagination-buttons'))continue;
   const text=(b.textContent+' '+(b.getAttribute('aria-label')||'')+' '+(b.title||'')).trim().toLowerCase().replace(/^[^a-zà-ỹđ0-9]+/u,'');
   const icon=b.querySelector('i');
   let tone='primary';
   if(b.matches('.btn-delete,.btn-danger')||/^(xóa|hủy xuất|hủy đơn|khóa|thất bại)/.test(text)||icon?.matches('.bi-trash,.bi-trash3,.bi-slash-circle,.bi-x-circle'))tone='danger';
   else if(b.matches('.btn-secondary,.btn-cancel,.directory-cancel,.import-secondary')||/^(hủy|đóng|quay lại|làm mới|in |xuất file|tải file|kiểm tra lại)/.test(text)||b.closest('.report-filters')&&b.type!=='submit')tone='secondary';
   else if(/^(hoàn thành|thành công|giao hàng|thu nợ|trả nợ)/.test(text)||b.matches('.debt-collect,.debt-pay'))tone='success';
   else if(b.closest('td')||b.matches('.action-btn,.btn-edit,.btn-view'))tone='accent';
   b.classList.add('javi-ui-button');b.dataset.uiTone=tone;
   if(b.closest('td'))b.dataset.uiSize='compact';
   if(!b.textContent.trim()&&b.querySelector('i,svg')){
    b.dataset.uiIcon='true';
    if(!b.getAttribute('aria-label')&&!b.title){
     const label=icon?.matches('.bi-trash,.bi-trash3')?'Xóa':icon?.matches('.bi-pencil-square,.bi-pencil,.bi-pencil-square')?'Chỉnh sửa':icon?.matches('.bi-file-earmark-text,.bi-receipt-cutoff')?'Lập hóa đơn':icon?.matches('.bi-truck,.bi-truck')?'Xuất kho':'Xem chi tiết';
     b.setAttribute('aria-label',label);b.title=label;
    }
   }
  }
 }
 const init=()=>{normalize(document);let pending=false;const observer=new MutationObserver(records=>{
  if(pending||!records.some(r=>r.addedNodes.length))return;pending=true;
  requestAnimationFrame(()=>{pending=false;normalize(document);});
 });observer.observe(document.body,{childList:true,subtree:true});};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
