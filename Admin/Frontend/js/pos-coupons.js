/* Optional POS coupons: draft selections are committed only after a server quote. */
function nextPOSCouponSelection(selected,code,coupons){
 const next=[...selected],coupon=coupons.find(c=>c.MaGiamGia===code);
 if(!coupon)return {codes:next,error:'Không tìm thấy mã giảm giá.'};
 const conflict=next.length&&(!coupon.ChoPhepKetHop||coupons.some(c=>next.includes(c.MaGiamGia)&&!c.ChoPhepKetHop));
 if(conflict&&next.length===1)return {codes:[code],error:''};
 if(conflict)return {codes:next,error:'Mã này không áp dụng đồng thời với các mã đang chọn. Vui lòng bỏ chọn trước khi đổi mã.'};
 if(next.includes(code))return {codes:next,error:''};
 if(next.length>=20)return {codes:next,error:'Chọn tối đa 20 mã.'};
 return {codes:[...next,code],error:''};
}
(()=>{
 let dialog=null;
 const chosen=()=>document.getElementById('posCoupon').value.split(',').filter(Boolean);
 window.refreshPOSCouponSummary=()=>{const count=chosen().length;document.getElementById('posCouponSummary').textContent=count?count+' mã đã chọn':'Chọn mã giảm giá';};
 window.openPOSCouponPicker=async()=>{
  if(dialog?.isConnected)return;
  if(!cart.length||!currentPosCustomer())return alert('Chọn khách hàng và sản phẩm trước khi áp dụng mã.');
  const returnFocus=document.activeElement,draft=new Set(chosen());
  dialog=document.createElement('dialog');dialog.className='pos-options-dialog pos-coupon-dialog';dialog.id='posCouponDialog';dialog.setAttribute('aria-labelledby','posCouponTitle');
  dialog.innerHTML=`<form class="pos-options-form"><header class="pos-options-heading"><div><h3 id="posCouponTitle"><i class="fas fa-ticket" aria-hidden="true"></i> Chọn mã giảm giá</h3><p>Mã áp dụng thêm sau giảm giá thủ công.</p></div><button type="button" class="pos-dialog-close" aria-label="Đóng">×</button></header><div class="pos-options-body"><label class="pos-sr-only" for="posCouponSearch">Tìm mã giảm giá</label><input type="search" id="posCouponSearch" placeholder="Tìm mã hoặc tên ưu đãi"><div id="posCouponList" aria-live="polite">Đang tải mã giảm giá…</div><p id="posCouponError" class="pos-options-error" role="alert"></p></div><footer class="pos-options-footer"><span id="posCouponSelected" role="status"></span><button type="button" class="btn pos-dialog-cancel" data-clear>Bỏ chọn</button><button type="submit" class="btn" disabled>Áp dụng</button></footer></form>`;
  const current=dialog;document.body.append(current);
  current.querySelector('.pos-dialog-close').onclick=()=>current.close();
  current.addEventListener('close',()=>{current.remove();if(dialog===current)dialog=null;returnFocus?.focus();},{once:true});
  const selected=current.querySelector('#posCouponSelected'),error=current.querySelector('#posCouponError'),list=current.querySelector('#posCouponList'),button=current.querySelector('[type=submit]');
  const update=()=>{selected.textContent='Đã chọn '+draft.size+' mã';};update();current.showModal();
  try{
   const response=await fetch('/api/don-hang/coupons?orderId='+encodeURIComponent(editModeMaDH||'')),result=await response.json();if(!response.ok||!result.success)throw Error(result.message);if(!current.isConnected)return;
   const coupons=result.data;list.replaceChildren();
   const syncChecks=()=>list.querySelectorAll('input[type=checkbox]').forEach(input=>input.checked=draft.has(input.value));
   const showTerms=coupon=>{
    const termsDialog=document.createElement('dialog');termsDialog.className='pos-options-dialog pos-coupon-terms';termsDialog.setAttribute('aria-label','Điều kiện ưu đãi');
    const header=document.createElement('header');header.className='pos-options-heading';const title=document.createElement('h3');title.textContent='Điều kiện ưu đãi';const close=document.createElement('button');close.type='button';close.className='pos-dialog-close';close.setAttribute('aria-label','Đóng điều kiện');close.textContent='×';header.append(title,close);
    const body=document.createElement('div');body.className='pos-options-body';
    const date=value=>new Date(value).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'});
    const lines=[coupon.TenMaGiamGia||'Ưu đãi JAVI','Mã '+coupon.MaGiamGia+' giảm '+(coupon.LoaiGiam==='percent'?Number(coupon.GiaTri)+'%':formatCurrency(coupon.GiaTri))+(coupon.GiamToiDa!=null?', tối đa '+formatCurrency(coupon.GiamToiDa):''),'Đơn tối thiểu: '+formatCurrency(coupon.DonToiThieu),'Khách hàng: '+(coupon.TenLoaiKH||'Tất cả khách hàng'),coupon.MaSP?'Sản phẩm: '+coupon.MaSP.trim()+' – '+(coupon.TenSP||''):'Áp dụng cho tất cả sản phẩm',...(coupon.MaSP?['Đơn tối thiểu tính trên sản phẩm được áp dụng.']:[]),...(coupon.BatDau?['Từ ngày '+date(coupon.BatDau)]:[]),...(coupon.KetThuc?['Đến hết ngày '+date(new Date(new Date(coupon.KetThuc).getTime()-1))]:[]),coupon.ChoPhepKetHop?'Áp dụng đồng thời với mã khác cho phép áp dụng đồng thời.':'Không áp dụng đồng thời với mã khác.',...(coupon.SoLuong!=null?['Còn '+Math.max(0,Number(coupon.SoLuong)-Number(coupon.SoLuotDaTinh||0))+' lượt sử dụng.']:[]),...(coupon.MoTa?[coupon.MoTa]:[])];
    for(const line of lines){const p=document.createElement('p');p.textContent=line;body.append(p);}termsDialog.append(header,body);document.body.append(termsDialog);close.onclick=()=>termsDialog.close();termsDialog.addEventListener('close',()=>{termsDialog.remove();[...current.querySelectorAll('[data-terms-code]')].find(link=>link.dataset.termsCode===coupon.MaGiamGia)?.focus();},{once:true});termsDialog.showModal();
   };
   for(const coupon of coupons){
    const row=document.createElement('article');row.className='pos-coupon-choice';row.dataset.search=(coupon.MaGiamGia+' '+coupon.TenMaGiamGia).toLocaleLowerCase('vi');
    const select=document.createElement('label');select.className='pos-coupon-select';
    const input=document.createElement('input');input.type='checkbox';input.value=coupon.MaGiamGia;input.checked=draft.has(input.value);
    const content=document.createElement('span'),code=document.createElement('strong'),title=document.createElement('span'),terms=document.createElement('small');
    code.textContent=coupon.MaGiamGia;title.textContent=coupon.TenMaGiamGia;
    terms.textContent=(coupon.LoaiGiam==='percent'?'Giảm '+Number(coupon.GiaTri)+'%':'Giảm '+formatCurrency(coupon.GiaTri))+' – Đơn từ '+formatCurrency(coupon.DonToiThieu)+(coupon.GiamToiDa!=null?' – Tối đa '+formatCurrency(coupon.GiamToiDa):'');
    const foot=document.createElement('div');foot.className='pos-coupon-meta';const combination=document.createElement('small');combination.textContent=coupon.ChoPhepKetHop?'Áp dụng đồng thời':'Không áp dụng đồng thời';
    const link=document.createElement('button');link.type='button';link.className='pos-coupon-terms-link';link.dataset.termsCode=coupon.MaGiamGia;link.textContent='Điều kiện';link.onclick=()=>showTerms(coupon);foot.append(combination,link);
    content.append(code,title,terms);select.append(input,content);row.append(select,foot);list.append(row);
    input.onchange=()=>{
     error.textContent='';
     if(input.checked){const result=nextPOSCouponSelection([...draft],input.value,coupons);draft.clear();result.codes.forEach(code=>draft.add(code));error.textContent=result.error;}else draft.delete(input.value);syncChecks();update();
    };
   }
   // Keep unavailable previously selected codes visible so staff can remove them.
   for(const code of [...draft])if(!coupons.some(c=>c.MaGiamGia===code)){draft.delete(code);error.textContent='Một số mã không còn khả dụng. Vui lòng áp dụng lại.';}
   if(!coupons.length){const empty=document.createElement('p');empty.textContent='Chưa có mã giảm giá khả dụng.';list.append(empty);}
   button.disabled=false;update();
   current.querySelector('#posCouponSearch').oninput=e=>{const query=e.target.value.trim().toLocaleLowerCase('vi');for(const row of list.children)if(row.dataset.search)row.hidden=!row.dataset.search.includes(query);};
   current.querySelector('[data-clear]').onclick=()=>{draft.clear();list.querySelectorAll('input').forEach(input=>input.checked=false);error.textContent='';update();};
  }catch(e){if(current.isConnected){list.textContent=e.message;button.disabled=false;}}
  current.querySelector('form').onsubmit=async event=>{event.preventDefault();button.disabled=true;error.textContent='';try{await applyPOSCoupon([...draft].sort(),()=>current.isConnected&&current.open);current.close();}catch(e){error.textContent=e.message;}finally{button.disabled=false;}};
 };
})();
