const posEscape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function maxRowQty(item){
 const unit=item.trongLuongGram?Number(item.trongLuongGram)/100:1;
 const others=cart.filter(x=>x.maSP===item.maSP&&x!==item).reduce((sum,x)=>sum+Number(x.qty)*(x.trongLuongGram?Number(x.trongLuongGram)/100:1),0);
 return Math.max(0,Math.min(999,Math.floor((getMaxAllowedQty(item.maSP)-others)/unit)));
}
function posAvailableToAdd(product,gram,grind){
 const id=String(product.MaSP).trim(),used=cart.filter(x=>x.maSP===id).reduce((sum,x)=>sum+Number(x.qty)*(x.trongLuongGram?Number(x.trongLuongGram)/100:1),0);
 const existingMax=Math.max(0,999-(cart.find(x=>x.maSP===id&&Number(x.trongLuongGram)===gram&&x.loaiXay===grind)?.qty||0));
 return Math.max(0,Math.min(existingMax,Math.floor((getMaxAllowedQty(id)-used)/(gram/100))));
}
let posChoosing=false;
window.addToCart=async function(maSP){
 if(posChoosing)return;posChoosing=true;
 try{
  const product=productsList.find(p=>String(p.MaSP).trim()===maSP);if(!product)return;
  let options={trongLuongGram:null,loaiXay:null,qty:1};
  if(product.ApDungTuyChon){options=await choosePOSOptions(product);if(!options)return;}
  const existing=cart.find(x=>x.maSP===maSP&&x.trongLuongGram===options.trongLuongGram&&x.loaiXay===options.loaiXay);
  const item=existing||{maSP,tenSP:product.TenSP,price:Number(product.GiaBan)*(options.trongLuongGram?options.trongLuongGram/100:1),qty:0,itemDiscountPercent:0,rowId:crypto.randomUUID(),trongLuongGram:options.trongLuongGram,loaiXay:options.loaiXay};
  if(!Number.isInteger(options.qty)||options.qty<1||item.qty+options.qty>maxRowQty(item))return alert('Không đủ tồn kho cho số lượng đã chọn.');
  item.qty+=options.qty;if(!existing)cart.push(item);renderCart();
 }catch(error){await alert(error.message||'Không thể thêm sản phẩm. Vui lòng thử lại.');}finally{posChoosing=false;}
};
async function choosePOSOptions(product){
 const response=await fetch('/api/website/product-options');const data=await response.json();if(!response.ok||!data.success)throw Error(data.message||'Không tải được tùy chọn cà phê.');
 const type=String(product.MaLoaiSP).trim(),weights=data.data.trongLuong.filter(x=>String(x.MaLoaiSP).trim()===type),grinds=data.data.loaiXay.filter(x=>String(x.MaLoaiSP).trim()===type);
 if(!weights.length||!grinds.length)throw Error('Loại sản phẩm chưa có trọng lượng và loại xay đang áp dụng.');
 return new Promise(resolve=>{
  const d=document.createElement('dialog');d.className='pos-options-dialog';d.setAttribute('aria-labelledby','posOptionsTitle');
  d.innerHTML=`<form class="pos-options-form"><header class="pos-options-heading"><div><span class="pos-eyebrow">TÙY CHỌN CÀ PHÊ</span><h3 id="posOptionsTitle">${posEscape(product.TenSP)}</h3></div><button type="button" class="pos-dialog-close" aria-label="Đóng">×</button></header><div class="pos-options-body"><fieldset class="pos-weight-options"><legend>Trọng lượng</legend><div>${weights.map((x,i)=>`<label><input type="radio" name="gram" value="${Number(x.TrongLuongGram)}" ${i===0?'checked':''} required><span>${x.TrongLuongGram>=1000?Number(x.TrongLuongGram)/1000+'kg':x.TrongLuongGram+'g'}</span></label>`).join('')}</div></fieldset><label class="pos-dialog-field">Loại xay<select name="grind" required>${grinds.map(x=>`<option value="${posEscape(x.TenLoaiXay)}">${posEscape(x.TenLoaiXay)}</option>`).join('')}</select></label><div class="pos-options-quantity"><label for="posOptionQty">Số lượng</label><div class="qty-controls"><button type="button" data-quantity-step="-1" aria-label="Giảm số lượng">−</button><input id="posOptionQty" type="number" name="qty" min="1" max="999" step="1" value="1" required autofocus><button type="button" data-quantity-step="1" aria-label="Tăng số lượng">+</button></div><small data-available></small></div><p class="pos-options-error" data-option-error role="alert" hidden></p><div class="pos-options-total"><div><span>Đơn giá</span><span data-unit-price></span></div><div><strong>Thành tiền</strong><strong data-price></strong></div></div></div><footer class="pos-options-footer"><button type="button" class="btn pos-dialog-cancel" data-cancel>Hủy</button><button type="submit" class="btn">Thêm vào đơn</button></footer></form>`;
  document.body.append(d);let result=null;
  const qty=d.querySelector('[name=qty]'),submit=d.querySelector('[type=submit]'),error=d.querySelector('[data-option-error]');
  const update=()=>{
   const gram=Number(d.querySelector('[name=gram]:checked')?.value),amount=Number(qty.value),max=posAvailableToAdd(product,gram,d.querySelector('[name=grind]').value),unit=Number(product.GiaBan)*gram/100;
   qty.max=Math.max(1,max);d.querySelector('[data-available]').textContent=max>0?'Có thể thêm tối đa '+max:'Đã dùng hết lượng khả dụng trong đơn';
   const valid=Number.isInteger(amount)&&amount>0&&amount<=max;
   d.querySelector('[data-unit-price]').textContent=formatCurrency(unit);d.querySelector('[data-price]').textContent=valid?formatCurrency(unit*amount):'—';
   submit.disabled=!valid;error.hidden=valid;error.textContent=max<1?'Không đủ tồn kho cho trọng lượng này.':'Chọn số lượng từ 1 đến '+max+'.';
   d.querySelector('[data-quantity-step="-1"]').disabled=amount<=1;d.querySelector('[data-quantity-step="1"]').disabled=amount>=max;
  };
  const form=d.querySelector('form');form.addEventListener('input',update);form.addEventListener('change',update);
  d.querySelectorAll('[data-quantity-step]').forEach(button=>button.onclick=()=>{qty.value=Math.max(1,Math.min(Number(qty.max),Number(qty.value||1)+Number(button.dataset.quantityStep)));update();});
  d.querySelector('[data-cancel]').onclick=d.querySelector('.pos-dialog-close').onclick=()=>d.close();
  d.addEventListener('click',event=>{if(event.target===d){const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)d.close();}});
  form.onsubmit=event=>{event.preventDefault();update();if(submit.disabled||!form.reportValidity())return;result={trongLuongGram:Number(d.querySelector('[name=gram]:checked').value),loaiXay:d.querySelector('[name=grind]').value,qty:Number(qty.value)};d.close();};
  d.addEventListener('close',()=>{d.remove();resolve(result);},{once:true});d.showModal();update();qty.select();
 });
}
