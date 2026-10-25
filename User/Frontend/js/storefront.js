(() => {
'use strict';
const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>new Intl.NumberFormat('vi-VN').format(Number(value||0))+' đ';
const icons={search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',bag:'<path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',user:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',coffee:'<path d="M3 8h13v7a6 6 0 0 1-12 0V8Zm13 1h3a3 3 0 0 1 0 6h-3M2 22h17M7 2v3m5-3v3"/>',heart:'<path d="M20 5c-2-3-6-3-8 0-2-3-6-3-8 0-4 6 8 14 8 14S24 11 20 5Z"/>',plus:'<path d="M12 4v16M4 12h16"/>'};
icons.ticket='<path d="M4 4h16v5a3 3 0 0 0 0 6v5H4v-5a3 3 0 0 0 0-6Z"/><path d="m9 15 6-6M9 9h.01M15 15h.01"/>';
icons.logout='<path d="M9 4H4v16h5M10 12h11m-4-4 4 4-4 4"/>';
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.coffee}</svg>`;
let user=null;try{user=JSON.parse(localStorage.getItem('currentUser')||'null');}catch(_){localStorage.removeItem('currentUser');}
let products=[],cart=[],settings={},selected=new Set(),blogPosts=[],blogCategory='',cartBusy=false;
let optionCatalog={loaiXay:[],trongLuong:[]};
const lineId=item=>String(item.MaGH);
const optionLabel=item=>item.TrongLuongGram?item.TrongLuongGram+'g / '+(item.LoaiXay||''):'';
const maxPackages=item=>Math.floor(Number(item.SoLuongKD)/(item.TrongLuongGram?item.TrongLuongGram/100:1));
const page=document.body.dataset.storePage;
const placements={NoiBat:'JAVI tuyển chọn',CaPhe:'Cà phê',MayPha:'Máy pha',PhuKien:'Phụ kiện'};
function toast(message,tone='notice'){const box=$('#storeToast');if(!box)return;clearTimeout(box.timer);box.classList.toggle('toast-success',tone==='success');box.innerHTML=(tone==='success'?'<svg class="toast-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>':'')+'<span>'+esc(message)+'</span><button type="button" aria-label="Đóng thông báo">×</button>';box.hidden=false;box.querySelector('button').onclick=()=>{clearTimeout(box.timer);box.hidden=true;};box.timer=setTimeout(()=>box.hidden=true,3400);}
function loginLink(returnTo=location.pathname+location.search){return '/landing_page/login.html?return='+encodeURIComponent(returnTo);}

function showPurchaseAuth(returnTo=location.pathname+location.search){
 let dialog=$('#purchaseAuthDialog');
 if(!dialog){
  dialog=document.createElement('dialog');dialog.id='purchaseAuthDialog';dialog.className='purchase-auth-dialog';dialog.setAttribute('aria-labelledby','purchaseAuthTitle');dialog.setAttribute('aria-describedby','purchaseAuthDescription');
  dialog.innerHTML='<button class="purchase-auth-close" type="button" aria-label="Đóng">×</button><div class="purchase-auth-emblem" aria-hidden="true">'+icon('user')+'</div><h2 id="purchaseAuthTitle">Bạn chưa đăng nhập</h2><p id="purchaseAuthDescription">Đăng nhập hoặc đăng ký để tiếp tục mua sắm.</p><div class="purchase-auth-actions"><a class="button" data-auth-login>Đăng nhập</a><a class="button light" data-auth-register>Đăng ký</a></div><button class="purchase-auth-later" type="button">Tiếp tục xem sản phẩm</button>';
  document.body.append(dialog);
  dialog.querySelectorAll('button').forEach(button=>button.onclick=()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
 }
 const url=loginLink(returnTo)+'&from=shop';
 dialog.querySelector('[data-auth-login]').href=url;
 dialog.querySelector('[data-auth-register]').href=url+'&mode=register';

 if(!dialog.open)dialog.showModal();
}
function quickContact(){
 if(['cart','account'].includes(page))return;
 if($('#quickContact'))return;
 const contact=document.createElement('nav');contact.id='quickContact';contact.className='quick-contact';contact.setAttribute('aria-label','Liên hệ nhanh với JAVI');
 contact.innerHTML='<a class="quick-contact-link quick-zalo" href="https://zalo.me/0909979012" target="_blank" rel="noopener noreferrer" aria-label="Nhắn Zalo cho JAVI: 0909979012"><span class="quick-contact-label">Chat Zalo</span><span class="quick-contact-icon" aria-hidden="true">Zalo</span></a><a class="quick-contact-link quick-phone" href="tel:0909979012" aria-label="Gọi JAVI: 0909979012"><span class="quick-contact-label">Gọi ngay để được tư vấn</span><span class="quick-contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2Z"/></svg></span></a>';
 document.body.append(contact);
}

function customerRequired(){if(user?.VaiTro==='KHACH_HANG'&&user.AuthToken)return true;showPurchaseAuth();return false;}
async function api(path,options={}){
 const headers=new Headers(options.headers||{});if(user?.AuthToken)headers.set('Authorization','Bearer '+user.AuthToken);if(options.body)headers.set('Content-Type','application/json');
 const response=await fetch('/api'+path,{...options,headers});
 if(response.status===401){localStorage.removeItem('currentUser');user=null;throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');}
 const data=await response.json();if(!response.ok||!data.success)throw Object.assign(new Error(data.message||'Không thể kết nối. Vui lòng thử lại.'),{status:response.status});return data.data;
}
function header(){
 if(page==='cart'){ $('#siteHeader').replaceChildren();return; }
 const account=user?(user.TenKH||user.TenDangNhap):'Đăng nhập/ Đăng ký';
 const accountControl=user?`<div class="store-account"><button class="header-action account-trigger" id="accountToggle" type="button" aria-label="Tài khoản" aria-expanded="false" aria-controls="accountMenu">${icon('user')}<span>${esc(account)}</span><svg class="account-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button><div id="accountMenu" class="account-menu" hidden><button type="button" id="storeProfile">${icon('user')}<span>Hồ sơ cá nhân</span></button><button type="button" id="storeLogout">${icon('logout')}<span>Đăng xuất</span></button></div></div>`:`<a class="header-action" aria-label="Đăng nhập/ Đăng ký" href="${loginLink()}">${icon('user')}<span>Đăng nhập/ Đăng ký</span></a>`;
 $('#siteHeader').innerHTML=`<header class="site-header"><div class="header-main wrap"><a class="brand" href="/landing_page/mua-hang.html" aria-label="JAVI COFFEE trang chủ"><img src="/images/logo-javi-auth.png" alt="JAVI COFFEE — Năng lượng khai sáng" width="150" height="95"></a><nav class="nav-inner header-nav" aria-label="Điều hướng chính"><a href="/landing_page/mua-hang.html" class="${page==='shop'?'active':''}">Trang chủ</a><div class="javi-nav-group"><a href="/landing_page/blog.html" class="${['blog','article'].includes(page)?'active':''}">Góc JAVI</a><div class="javi-nav-sub"><a href="/landing_page/blog.html?nhom=truyen-thong">Bài truyền thông</a><a href="/landing_page/blog.html?nhom=tin-tuc">Tin tức</a></div></div><a href="/landing_page/mua-hang.html#khach-hang">Khách hàng &amp; đối tác</a></nav><form class="header-search" id="siteSearchForm"><input type="search" id="siteSearch" aria-label="Tìm sản phẩm" placeholder="Tìm cà phê, máy pha và phụ kiện..." value="${esc(new URLSearchParams(location.search).get('q')||'')}"><button type="submit" aria-label="Tìm kiếm">${icon('search')}</button></form><div class="header-actions">${accountControl}<a class="header-action" aria-label="Giỏ hàng" href="/landing_page/gio-hang.html"><span class="cart-icon">${icon('bag')}<b class="cart-badge" id="cartCount">0</b></span><span>Giỏ hàng</span></a></div></div></header>`;
 $('#siteSearchForm').onsubmit=event=>{event.preventDefault();const query=$('#siteSearch').value.trim();if(page==='shop'){renderShop();$('#san-pham').scrollIntoView({behavior:'smooth'});}else location.href='/landing_page/mua-hang.html?q='+encodeURIComponent(query)+'#san-pham';};
 if(page==='shop')$('#siteSearch').addEventListener('input',renderShop);
 $('#accountToggle')?.addEventListener('click',()=>setAccountMenu($('#accountMenu').hidden));
 $('#accountToggle')?.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();setAccountMenu(true);$('#storeProfile').focus();}});
 $('#storeProfile')?.addEventListener('click',()=>{setAccountMenu(false);location.href='/landing_page/tai-khoan.html';});
 $('#storeLogout')?.addEventListener('click',()=>{localStorage.removeItem('currentUser');localStorage.removeItem('javiLastActivity');sessionStorage.removeItem('javiCheckoutIds');sessionStorage.removeItem('javiCartFocus');sessionStorage.removeItem('javiCheckoutRequest');user=null;location.replace('/landing_page/login.html');});
}
function setAccountMenu(open){const menu=$('#accountMenu');if(!menu)return;menu.hidden=!open;$('#accountToggle').setAttribute('aria-expanded',String(open));}
function footer(){
 if(['cart','account'].includes(page)){ $('#siteFooter').replaceChildren();return; }
 $('#siteFooter').innerHTML=`<footer class="site-footer compact-footer"><div class="wrap footer-contact"><a class="brand" href="/landing_page/mua-hang.html" aria-label="JAVI COFFEE trang chủ"><img src="/images/logo-javi-auth.png" alt="JAVI COFFEE" width="90" height="58"></a><div class="footer-contact-info"><h3>Liên hệ JAVI</h3><a href="mailto:${esc(settings.EmailLienHe||'javicoffee101@gmail.com')}">${esc(settings.EmailLienHe||'javicoffee101@gmail.com')}</a><a href="tel:0909979012">0909 979 012</a><span>13 đường số 7, Linh Chiểu, Thủ Đức</span></div><nav class="footer-socials" aria-label="Kết nối với JAVI"><span class="footer-social-title">Kết nối cùng JAVI</span><a href="https://www.facebook.com/javicocafe" target="_blank" rel="noopener noreferrer" aria-label="Facebook JAVI"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 21v-8h3l.5-3H14V8.2c0-.9.3-1.5 1.6-1.5H18V4.1c-.4-.1-1.7-.1-2.7-.1-2.7 0-4.3 1.6-4.3 4.5V10H8v3h3v8z"/></svg></a><a href="https://zalo.me/1297127932437935607" target="_blank" rel="noopener noreferrer" aria-label="Zalo JAVI"><span aria-hidden="true">Zalo</span></a><a href="mailto:${esc(settings.EmailLienHe||'javicoffee101@gmail.com')}" aria-label="Gửi email cho JAVI"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></svg></a></nav><small>© ${new Date().getFullYear()} JAVI COFFEE</small></div></footer>`;

}
function art(product){
 const machine=product.ViTri==='MayPha'||String(product.TenLoaiSP).toLowerCase().includes('máy');
 return `<div class="product-art"><svg viewBox="0 0 200 180" aria-hidden="true">${machine?'<defs><linearGradient id="steel" x2="1" y2="1"><stop stop-color="#e4dfd6"/><stop offset=".5" stop-color="#a6a39d"/><stop offset="1" stop-color="#d8d3c9"/></linearGradient></defs><path d="M40 38h113l8 90H35Z" fill="url(#steel)"/><path d="M48 48h97v34H48Z" fill="#32302b"/><circle cx="65" cy="65" r="6" fill="#c6a167"/><rect x="55" y="97" width="83" height="8" rx="3" fill="#554c3e"/><path d="M90 105v18h22v-18" fill="#f5f0e5"/><path d="M112 109h8v9h-8" stroke="#d8c7af" fill="none"/><path d="M30 132h135v12H30Z" fill="#4e4437"/><text x="115" y="71" font-size="10" fill="#d3bd98" font-family="Georgia">JAVI</text>':'<path d="M57 24h83l9 130H48Z" fill="#584333"/><path d="M57 24h83l-5 11H61Z" fill="#382c23"/><path d="M54 72h89v58H51Z" fill="#e6d8bc"/><text x="69" y="97" font-size="24" fill="#493a29" font-family="Georgia" letter-spacing="4">JAVI</text><text x="76" y="113" font-size="7" fill="#8b744e" letter-spacing="2">COFFEE</text><path d="M53 142h91l5 12H48Z" fill="#3d3025"/>'}</svg><span class="art-note">Hình minh hoạ</span></div>`;
}
function image(product){const path=String(product.HinhAnh||'');return path?`<img src="${esc(path)}" alt="${esc(product.TenSP)}" loading="lazy">`:art(product);}
function setupImages(root=document){root.querySelectorAll('.product-cover img, .cart-thumb img').forEach(img=>img.onerror=()=>{const p=products.find(p=>p.MaSP.trim()===img.closest('[data-product]')?.dataset.product)||{ViTri:'CaPhe'};img.outerHTML=art(p);});}
function productCardPrice(p){
 if(!p.ApDungTuyChon)return money(p.GiaBan);
 const weights=optionCatalog.trongLuong.filter(x=>String(x.MaLoaiSP).trim()===String(p.MaLoaiSP).trim()).map(x=>Number(x.TrongLuongGram)).filter(gram=>Number.isSafeInteger(gram)&&gram>0&&gram%100===0);
 if(!weights.length)return 'Chưa có giá';
 const min=Number(p.GiaBan)*Math.min(...weights)/100,max=Number(p.GiaBan)*Math.max(...weights)/100;
 return min===max?money(min):'<span>'+money(min)+'</span><span aria-hidden="true">–</span><span>'+money(max)+'</span>';
}
function productUrl(id){return '/san-pham/'+encodeURIComponent(String(id).trim())+'.html';}
function productCard(p){const url=esc(productUrl(p.MaSP));return `<article class="product-card" data-product="${esc(p.MaSP.trim())}"><a class="product-cover" href="${url}" aria-label="Xem ${esc(p.TenSP)}">${image(p)}${p.ViTri==='NoiBat'?'<span class="tag">JAVI tuyển chọn</span>':''}</a><div class="product-copy"><small>${esc(p.TenLoaiSP||placements[p.ViTri])}</small><a class="product-name" href="${url}">${esc(p.TenSP)}</a><div class="product-spec">${esc(p.ApDungTuyChon?'Chọn trọng lượng và loại xay':p.TrongLuong?`${p.TrongLuong} kg / ${p.DonViTinh}`:p.CongSuat||p.DonViTinh||'')}</div><div class="product-price${p.ApDungTuyChon?' product-price-range':''}">${productCardPrice(p)}</div><div class="product-bottom"><span class="stock ${p.SoLuongKD<=0?'out':''}">${p.SoLuongKD>0?'Sẵn sàng cho bạn':'Tạm hết hàng'}</span><a class="add-button" href="${url}" aria-label="Chọn mua ${esc(p.TenSP)}">${icon('bag')}</a></div></div></article>`;}
const categoryKey=p=>String(p.MaLoaiSP||p.TenLoaiSP||'khac').trim();
const categoryId=key=>'loai-'+encodeURIComponent(key);
function categoryPriority(title){const name=normalize(title);return /may pha/.test(name)?0:/ca phe/.test(name)?1:2;}
function productGroups(list){
 // Decide from the full catalog so searching does not move a type into a new group.
 const counts=new Map();products.forEach(p=>{const key=categoryKey(p);counts.set(key,(counts.get(key)||0)+1);});
 const groups=new Map();
 list.forEach(p=>{const small=categoryPriority(p.TenLoaiSP)>=2&&(counts.get(categoryKey(p))||0)<4;const key=small?'khac':categoryKey(p);if(!groups.has(key))groups.set(key,{key,title:small?'Sản phẩm khác':p.TenLoaiSP||'Sản phẩm khác',items:[]});groups.get(key).items.push(p);});
 return [...groups.values()].sort((a,b)=>(a.key==='khac'?3:categoryPriority(a.title))-(b.key==='khac'?3:categoryPriority(b.title))||a.title.localeCompare(b.title,'vi')); 
}
let categoryObserver;
function renderShop(){
 const query=normalize($('#siteSearch').value);
 let list=products.filter(p=>!query||normalize(p.TenSP+' '+p.TenLoaiSP).includes(query));
 const sort=$('#productSort').value;if(sort==='price-up')list.sort((a,b)=>a.GiaBan-b.GiaBan);if(sort==='price-down')list.sort((a,b)=>b.GiaBan-a.GiaBan);if(sort==='name')list.sort((a,b)=>a.TenSP.localeCompare(b.TenSP,'vi'));
 $('#productCount').textContent=`${list.length} lựa chọn dành cho bạn`;
 categoryObserver?.disconnect();
 const groups=productGroups(list);
 $('#categoryChips').innerHTML=groups.map(({key,title,items},index)=>`<a class="chip ${index===0?'active':''}" href="#${categoryId(key)}" data-category="${esc(key)}" ${index===0?'aria-current="location"':''}>${esc(title)}</a>`).join('');
 if(!list.length){$('#productSections').innerHTML='<div class="empty"><h2>Chưa tìm thấy lựa chọn phù hợp</h2><p>Thử tìm một từ khoá ngắn hơn</p></div>';return;}
 $('#productSections').innerHTML=groups.map(({key,title,items},index)=>`<section class="product-section" id="${categoryId(key)}" data-category-section="${esc(key)}" aria-labelledby="heading-${categoryId(key)}"><div class="section-heading"><div><span class="category-number">${String(index+1).padStart(2,'0')}</span><h2 id="heading-${categoryId(key)}">${esc(title)}</h2></div><span class="category-count">${items.length} sản phẩm</span></div><div class="product-grid">${items.map(productCard).join('')}</div></section>`).join('');
 setupImages();
 categoryObserver=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(visible.length)setActiveCategory(visible[0].target.dataset.categorySection);},{rootMargin:'-100px 0px -55% 0px',threshold:0});
 document.querySelectorAll('[data-category-section]').forEach(section=>categoryObserver.observe(section));
}
function setActiveCategory(key){$('#categoryChips').querySelectorAll('[data-category]').forEach(chip=>{const active=chip.dataset.category===key;chip.classList.toggle('active',active);if(active)chip.setAttribute('aria-current','location');else chip.removeAttribute('aria-current');});}
function normalize(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').trim();}
async function initShop(){const results=await Promise.allSettled([api('/website/products'),api('/website/product-options')]);if(results[0].status==='rejected')throw results[0].reason;products=results[0].value;if(results[1].status==='fulfilled')optionCatalog=results[1].value;else toast('Chưa tải được tùy chọn cà phê. Bạn vẫn có thể xem sản phẩm.');
 $('#categoryChips').onclick=e=>{const link=e.target.closest('[data-category]');if(!link)return;e.preventDefault();const section=document.getElementById(categoryId(link.dataset.category));if(section){section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});setActiveCategory(link.dataset.category);history.replaceState(null,'','#'+section.id);}};
 $('#productSort').onchange=renderShop;renderShop();
 const category=new URLSearchParams(location.search).get('category');
 const initial=document.getElementById(location.hash.slice(1))||(category?document.getElementById(categoryId(category)):null);
 initial?.scrollIntoView({block:'start'});
}
function initBanners(){
 const carousel=$('#heroCarousel');if(!carousel)return;
 const slides=[...carousel.querySelectorAll('[data-slide]')],dots=[...carousel.querySelectorAll('[data-slide-to]')],reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let current=0,timer,paused=reduced.matches,hovered=false;
 const toggle=$('#bannerToggle');
 const show=index=>{current=(index+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===current);slide.inert=i!==current;slide.setAttribute('aria-hidden',String(i!==current));});dots.forEach((dot,i)=>{dot.classList.toggle('is-active',i===current);dot.setAttribute('aria-pressed',String(i===current));});};
 const schedule=()=>{clearInterval(timer);if(!paused&&!hovered&&!document.hidden&&!carousel.contains(document.activeElement))timer=setInterval(()=>show(current+1),5000);};
 const updateToggle=()=>{toggle.textContent=paused?'▶':'Ⅱ';toggle.setAttribute('aria-label',paused?'Tiếp tục chuyển banner':'Tạm dừng chuyển banner');toggle.setAttribute('aria-pressed',String(paused));};
 dots.forEach(dot=>dot.onclick=()=>{show(Number(dot.dataset.slideTo));schedule();});
 carousel.querySelectorAll('[data-slide-step]').forEach(button=>button.onclick=()=>{show(current+Number(button.dataset.slideStep));schedule();});
 toggle.onclick=()=>{paused=!paused;updateToggle();schedule();};
 carousel.addEventListener('mouseenter',()=>{hovered=true;schedule();});carousel.addEventListener('mouseleave',()=>{hovered=false;schedule();});
 carousel.addEventListener('focusin',schedule);carousel.addEventListener('focusout',()=>requestAnimationFrame(schedule));document.addEventListener('visibilitychange',schedule);
 reduced.addEventListener('change',()=>{paused=reduced.matches;updateToggle();schedule();});
 show(0);updateToggle();schedule();
}
async function loadCart(){if(user?.VaiTro!=='KHACH_HANG')return [];cart=await api('/gio-hang/'+encodeURIComponent(user.TenDangNhap));if($('#cartCount'))$('#cartCount').textContent=cart.reduce((sum,item)=>sum+Number(item.SoLuong),0);return cart;}
async function addProduct(id,button,qty=1,options=null,openCart=false){
 if(!customerRequired())return;const product=products.find(p=>p.MaSP.trim()===id);if(product?.ApDungTuyChon&&!options){openProduct(id);return;}if(button)button.disabled=true;
 try{
  const saved=await api('/gio-hang',{method:'POST',body:JSON.stringify({tenDangNhap:user.TenDangNhap,maSP:id,soLuong:qty,...options})});
  await loadCart().catch(()=>{});
  const rowId=Number(saved?.MaGH||cart.find(item=>item.MaSP.trim()===id&&Number(item.TrongLuongGram||0)===Number(options?.trongLuongGram||0)&&String(item.LoaiXay||'')===String(options?.loaiXay||''))?.MaGH);
  if(!openCart)toast('Đã thêm vào giỏ hàng','success');
  await animateToCart(product,button);
  if(openCart){if(!Number.isSafeInteger(rowId)||rowId<1){toast('Đã thêm sản phẩm. Vui lòng mở giỏ hàng để chọn thanh toán.');return;}sessionStorage.setItem('javiCartFocus',JSON.stringify({username:user.TenDangNhap,maGH:rowId}));sessionStorage.removeItem('javiCheckoutRequest');location.href='/landing_page/gio-hang.html';}
 }catch(err){toast(err.message);}finally{if(button)button.disabled=false;}
}
async function animateToCart(product,button){
 const cartIcon=$('.cart-icon');if(!cartIcon||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const source=$('.product-detail-image'),sourceRect=source?.getBoundingClientRect(),buttonRect=button?.getBoundingClientRect(),cartRect=cartIcon.getBoundingClientRect();
 const visible=r=>r&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;
 const start=visible(sourceRect)?sourceRect:buttonRect;if(!start)return;
 const size=76,x=Math.max(8,Math.min(innerWidth-size-8,start.left+start.width/2-size/2)),y=Math.max(8,Math.min(innerHeight-size-8,start.top+Math.min(start.height,120)/2-size/2));
 const endX=Math.max(16,Math.min(innerWidth-32,cartRect.left+cartRect.width/2)),endY=Math.max(20,Math.min(innerHeight-32,cartRect.top+cartRect.height/2));
 const flyer=document.createElement('div');flyer.className='cart-flyer';flyer.setAttribute('aria-hidden','true');flyer.innerHTML=image(product);flyer.style.left=x+'px';flyer.style.top=y+'px';document.body.append(flyer);
 let marker;if(!visible(cartRect)){marker=document.createElement('div');marker.className='cart-arrival-marker';marker.setAttribute('aria-hidden','true');marker.innerHTML=icon('bag');marker.style.left=(endX-22)+'px';marker.style.top=(endY-22)+'px';document.body.append(marker);}
 try{const dx=endX-x-size/2,dy=endY-y-size/2;await flyer.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+dx*.45+'px,'+(dy*.4-55)+'px) scale(.65)',opacity:.95,offset:.45},{transform:'translate('+dx+'px,'+dy+'px) scale(.12)',opacity:.1}],{duration:680,easing:'cubic-bezier(.3,.05,.45,1)',fill:'forwards'}).finished;const target=marker||cartIcon;await target.animate([{transform:'scale(1)'},{transform:'scale(1.24)'},{transform:'scale(1)'}],{duration:280}).finished;}catch(_){}finally{flyer.remove();marker?.remove();}
}
function productOptionControls(p){const weights=optionCatalog.trongLuong.filter(x=>x.MaLoaiSP.trim()===p.MaLoaiSP.trim()),grinds=optionCatalog.loaiXay.filter(x=>x.MaLoaiSP.trim()===p.MaLoaiSP.trim());return '<div class="coffee-options"><fieldset class="coffee-weights"><legend>Trọng lượng</legend><div>'+weights.map((x,index)=>'<label class="coffee-weight"><input type="radio" name="coffeeWeight" value="'+x.TrongLuongGram+'" '+(index===0?'checked':'')+' required><span>'+(x.TrongLuongGram>=1000?x.TrongLuongGram/1000+'kg':x.TrongLuongGram+'g')+'</span></label>').join('')+'</div></fieldset><label class="form-field">Loại xay<select id="coffeeGrind" required>'+grinds.map(x=>'<option value="'+esc(x.TenLoaiXay)+'">'+esc(x.TenLoaiXay)+'</option>').join('')+'</select></label></div>';}
function openProduct(id){location.href=productUrl(id);}
async function initProduct(){
 const match=location.pathname.match(/^\/san-pham\/([^/]+)\.html$/),id=match?decodeURIComponent(match[1]):new URLSearchParams(location.search).get('id');
 if(!id)throw new Error('Chưa chọn sản phẩm.');
 const results=await Promise.allSettled([api('/website/products/'+encodeURIComponent(id)),api('/website/product-options')]);
 if(results[0].status==='rejected')throw results[0].reason;
 const p=results[0].value;products=[p];
 if(results[1].status==='fulfilled')optionCatalog=results[1].value;else if(p.ApDungTuyChon)toast('Chưa tải được tùy chọn. Vui lòng tải lại trang.');
 document.title=p.TenSP+' · JAVI COFFEE';$('#productBreadcrumb').textContent=p.TenSP;
 $('#productDetail').innerHTML=`<div class="product-detail-layout" data-product="${esc(p.MaSP.trim())}"><div class="product-cover product-detail-image">${image(p)}</div><div class="product-detail-copy"><div class="eyebrow">${esc(p.TenLoaiSP||'JAVI COFFEE')}</div><h1>${esc(p.TenSP)}</h1><div class="product-detail-status stock ${p.SoLuongKD<=0?'out':''}">${p.SoLuongKD>0?'Còn hàng':'Tạm hết hàng'}</div><div class="product-price" id="optionPrice"></div>${p.CongSuat?'<p>Công suất: '+esc(p.CongSuat)+'</p>':''}${!p.ApDungTuyChon&&p.TrongLuong?'<p>Trọng lượng: '+esc(p.TrongLuong)+' kg</p>':''}<form id="productPurchaseForm">${p.ApDungTuyChon?productOptionControls(p):''}<label class="form-field product-quantity">Số lượng<input id="productQty" type="number" min="1" max="999" step="1" value="1" required></label><div class="product-purchase-summary"><strong id="productTotalPrice"></strong></div><div class="product-purchase-actions"><button class="button light" id="productAdd" type="submit">${icon('bag')} Thêm vào giỏ hàng</button><button class="button" id="productBuyNow" type="submit">Mua ngay</button></div></form></div></div><section class="product-description-section" aria-labelledby="productDescriptionTitle"><h2 id="productDescriptionTitle">Mô tả sản phẩm</h2><div class="product-description">${esc(String(p.MoTa||'').trim()||'Mô tả đang được cập nhật.')}</div></section>`;
 const qty=$('#productQty'),add=$('#productAdd'),buy=$('#productBuyNow');let purchasing=false;
 const updatePrice=()=>{
  const gram=p.ApDungTuyChon?Number($('[name=coffeeWeight]:checked')?.value):null,valid=!p.ApDungTuyChon||(Number.isInteger(gram)&&gram>0&&Boolean($('#coffeeGrind')?.value));
  if(!valid){$('#optionPrice').textContent='Chưa có lựa chọn đang bán';$('#productTotalPrice').textContent='';add.disabled=true;buy.disabled=true;return;}
  const price=Number(p.GiaBan)*(gram?gram/100:1),max=Math.min(999,Math.floor(Number(p.SoLuongKD)/(gram?gram/100:1)));
  qty.max=Math.max(1,max);if(Number(qty.value)>max&&max>0)qty.value=max;
  $('#optionPrice').textContent=money(price);add.disabled=buy.disabled=purchasing||max<1;
  const count=Number(qty.value),validQty=Number.isInteger(count)&&count>=1&&count<=max;
  $('#productTotalPrice').textContent=validQty?'Thành tiền: '+money(price*count):'';
 };
 $('#productPurchaseForm').addEventListener('input',updatePrice);$('#productPurchaseForm').addEventListener('change',updatePrice);updatePrice();
 $('#productPurchaseForm').onsubmit=async event=>{
  event.preventDefault();const buyNow=event.submitter===buy;if(purchasing||(buyNow?buy:add).disabled||!event.currentTarget.reportValidity())return;
  if(!customerRequired())return;
  const options=p.ApDungTuyChon?{trongLuongGram:Number($('[name=coffeeWeight]:checked').value),loaiXay:$('#coffeeGrind').value}:null;
  purchasing=true;updatePrice();
  try{await addProduct(p.MaSP.trim(),buyNow?buy:add,Number(qty.value),options,buyNow);}
  catch(err){toast(err.message);}finally{purchasing=false;updatePrice();}
 };
 setupImages($('#productDetail'));
}
function blogCard(p){const external=typeof p.LienKetNguon==='string'&&p.LienKetNguon.startsWith('https://'),href=external?p.LienKetNguon:'/landing_page/bai-viet.html?slug='+encodeURIComponent(p.Slug);return `<article class="blog-card"><a href="${esc(href)}" ${external?'target="_blank" rel="noopener noreferrer"':''}><img class="blog-cover" src="${esc(p.AnhBia||'/images/javi-editorial-hero.png')}" alt="" loading="lazy"><div class="blog-card-copy"><div class="blog-meta"><span>${esc(p.ChuyenMuc)}</span><span>${date(p.NgayDang)}</span></div><h3>${esc(p.TieuDe)}</h3><p>${esc(p.TomTat)}</p><span class="link-arrow">${external?'Đọc bài báo ↗':'Đọc câu chuyện'}</span></div></a></article>`;}

function date(value){return value?new Date(value).toLocaleDateString('vi-VN'):'';}
async function initBlog(){
 blogPosts=await api('/website/blog');
 const groups=[['','Tất cả'],['truyen-thong','Bài truyền thông'],['tin-tuc','Tin tức']];
 let group=new URLSearchParams(location.search).get('nhom')||'';if(!groups.some(g=>g[0]===group))group='';
 const render=()=>{const list=blogPosts.filter(p=>(!group||(p.ChuyenMuc==='Bài truyền thông'?'truyen-thong':'tin-tuc')===group)&&normalize(p.TieuDe+' '+p.TomTat).includes(normalize($('#blogQuery').value)));$('#blogCategories').innerHTML=groups.map(([key,label])=>`<button class="chip ${group===key?'active':''}" data-blog-group="${key}" aria-pressed="${group===key}">${label}</button>`).join('');$('#blogList').innerHTML=list.length?list.map(blogCard).join(''):'<div class="empty"><h2>Chưa có bài viết phù hợp</h2><p>Hãy thử từ khoá khác hoặc quay lại sau.</p></div>';};
 $('#blogCategories').onclick=e=>{const b=e.target.closest('[data-blog-group]');if(!b)return;group=b.dataset.blogGroup;history.replaceState(null,'',group?'?nhom='+group:location.pathname);render();};$('#blogQuery').oninput=render;render();
}
async function initPartners(){
 const root=$('#partnerList');if(!root)return;
 try{const rows=await api('/website/partners');root.innerHTML=rows.length?rows.map(p=>`<article class="partner-card"><div class="partner-logo">${p.image?'<img src="'+esc(p.image)+'" alt="'+esc(p.name)+'" loading="lazy">':'<span aria-hidden="true">'+esc(p.name.slice(0,1))+'</span>'}</div><h3>${esc(p.name)}</h3></article>`).join(''):'<p>Thông tin khách hàng &amp; đối tác đang được cập nhật.</p>';root.querySelectorAll('img').forEach(img=>img.onerror=()=>{img.hidden=true;});}catch(e){root.textContent='Chưa tải được khách hàng & đối tác. Vui lòng tải lại trang.';}
}

function paragraphs(content){return String(content).replace(/\\n/g,'\n').split(/\n\s*\n/).map(block=>block.split('\n').map((line,index)=>line.startsWith('## ')?`</p><h2>${esc(line.slice(3))}</h2><p>`:esc(line).replace(/https:\/\/[^\s<]+/g,url=>'<a href="'+url+'" target="_blank" rel="noopener noreferrer">Đọc bài gốc ↗</a>')).join('<br>')).map(block=>'<p>'+block+'</p>').join('').replace(/<p><\/p>/g,'');}
async function initArticle(){const slug=new URLSearchParams(location.search).get('slug');if(!slug)throw new Error('Chưa chọn bài viết.');const p=await api('/website/blog/'+encodeURIComponent(slug));document.title=p.TieuDe+' · JAVI COFFEE';$('#articleContent').innerHTML=`<header class="article-header"><div class="eyebrow">${esc(p.ChuyenMuc)} · ${date(p.NgayDang)}</div><h1>${esc(p.TieuDe)}</h1><p>${esc(p.TomTat)}</p></header><img class="article-cover" src="${esc(p.AnhBia||'/images/javi-editorial-hero.png')}" alt=""><div class="article-body">${paragraphs(p.NoiDung)}${p.ChuyenMuc==='Chuyện JAVI'?'<p class="source-note">Bài viết được biên soạn riêng, tham khảo định hướng thương hiệu tại <a href="https://mayphacafephin.com/" target="_blank" rel="noopener">website giới thiệu JAVI</a>.</p>':''}</div>`;}

let appliedCoupon=sessionStorage.getItem('javiCoupon')||'',currentQuote=null,quoteVersion=0;
function deliveryInput(){return {tinhThanh:$('#receiverProvince')?.value||'',phuongXa:$('#receiverWard')?.value||'',diaChiChiTiet:$('#receiverAddress')?.value.trim()||''};}
function couponEndLabel(value){return new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',dateStyle:'short'}).format(new Date(new Date(value).getTime()-1));}
function couponControl(){return `<div class="coupon-select-row">${icon('ticket')}<span>Áp dụng mã giảm giá</span><button id="chooseCoupon" type="button">Chọn</button></div><div id="appliedCouponRow" class="applied-coupon-row" ${appliedCoupon?'':'hidden'}><span id="appliedCouponCode">${esc(appliedCoupon)}</span><button id="removeCoupon" type="button" aria-label="Bỏ mã giảm giá">×</button></div><p id="couponMessage" class="coupon-feedback" role="status"></p>`;}
function wireCoupon(items,checkout=false){
 $('#chooseCoupon').disabled=!items.length;$('#chooseCoupon').onclick=()=>openCouponPicker(items,checkout);
 $('#removeCoupon').onclick=()=>{appliedCoupon='';sessionStorage.removeItem('javiCoupon');refreshQuote(items,checkout);};
}
function checkoutSelection(items){return {maGioHang:items.map(i=>Number(i.MaGH))};}
function quoteBody(items,code,checkout){const address=deliveryInput(),hasAddress=address.tinhThanh&&address.phuongXa&&address.diaChiChiTiet.length>=5;return {...checkoutSelection(items),maGiamGia:code,...(checkout&&hasAddress?address:{})};}
function couponDateNote(c){if(c.BatDau&&new Date(c.BatDau).getTime()>Date.now())return 'Áp dụng từ '+new Date(c.BatDau).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'});return c.KetThuc?'HSD '+couponEndLabel(c.KetThuc):'';}
function couponCompactCard(c,selected='',wallet=false){const can=c.CoTheApDung??c.ConHieuLuc,dateNote=couponDateNote(c),reason=c.LyDoKhongApDung||'Mã chưa đủ điều kiện áp dụng';return `<article class="coupon-ticket ${wallet?'wallet-coupon':''} ${can?'':'is-unavailable'} ${c.MaGiamGia===selected?'is-selected':''}"><button type="button" class="coupon-ticket-select" ${wallet?'data-use-coupon':'data-picker-code'}="${esc(c.MaGiamGia)}" aria-label="Chọn mã ${esc(c.MaGiamGia)}" ${can?'':'disabled'}><span class="coupon-ticket-title">${esc(c.TenMaGiamGia||'Ưu đãi JAVI')}</span><span class="coupon-ticket-value">${c.LoaiGiam==='percent'?Number(c.GiaTri)+'%':money(c.GiaTri)}</span>${dateNote?'<span class="coupon-ticket-expiry">'+esc(dateNote)+'</span>':''}${wallet?'':'<span class="picker-radio" aria-hidden="true"></span>'}</button><button type="button" class="coupon-terms-link" data-coupon-terms="${esc(c.MaGiamGia)}">Điều kiện</button>${can||reason==='Mã chưa đến ngày áp dụng'?'':'<p class="picker-disabled-reason">'+esc(reason)+'</p>'}</article>`;}
function showCouponTerms(c){if(!c)return;$('#couponTermsDialog')?.remove();const d=document.createElement('dialog');d.id='couponTermsDialog';d.className='coupon-picker-dialog coupon-terms-dialog';d.setAttribute('aria-labelledby','couponTermsTitle');const amount=c.LoaiGiam==='percent'?Number(c.GiaTri)+'%':money(c.GiaTri),dateNote=couponDateNote(c);const paragraphs=[
 c.TenMaGiamGia||'Ưu đãi JAVI',
 'Mã '+c.MaGiamGia+' giảm '+amount+(c.GiamToiDa!=null?', tối đa '+money(c.GiamToiDa):'')+(Number(c.DonToiThieu)>0?' cho đơn từ '+money(c.DonToiThieu):''),
 'Áp dụng cho '+(c.TenLoaiKH||'tất cả khách hàng'),
 c.MaSP?'Chỉ áp dụng cho sản phẩm '+c.MaSP.trim()+' · '+(c.TenSP||''):'Áp dụng cho tất cả sản phẩm',
 ...(c.MaSP?['Giá trị đơn tối thiểu được tính trên các sản phẩm được áp dụng']:[]),
 ...(dateNote?[dateNote]:[]),
 c.ChoPhepKetHop?'Cho phép kết hợp với mã khác có cùng điều kiện kết hợp':'Không áp dụng đồng thời với mã giảm giá khác'
 ];d.innerHTML=`<div class="coupon-picker-head"><h2 id="couponTermsTitle">Điều kiện ưu đãi</h2><button type="button" aria-label="Đóng">×</button></div><div class="coupon-picker-body coupon-terms-text">${paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')}</div>`;document.body.append(d);d.querySelector('button').onclick=()=>d.close();d.addEventListener('close',()=>d.remove());d.showModal();}
async function openCouponPicker(items,checkout){
 if(!items.length)return;$('#couponPickerDialog')?.remove();const dialog=document.createElement('dialog');dialog.id='couponPickerDialog';dialog.className='coupon-picker-dialog';dialog.setAttribute('aria-labelledby','couponPickerTitle');
 dialog.innerHTML=`<div class="coupon-picker-head"><h2 id="couponPickerTitle">Nhập hoặc chọn mã khuyến mãi</h2><button type="button" data-close-picker aria-label="Đóng">×</button></div><div class="coupon-picker-body"><div class="coupon-picker-input"><label class="sr-only" for="couponCode">Mã khuyến mãi</label><input id="couponCode" maxlength="30" placeholder="Nhập mã khuyến mãi" autocomplete="off" value=""><button type="button" id="applyCoupon">Áp dụng</button></div><p id="pickerMessage" role="status"></p><div id="pickerCoupons"><div class="loading">Đang tải mã đã lưu</div></div></div><div class="coupon-picker-footer"><button type="button" class="button" id="confirmCoupon" disabled>Xác nhận</button></div>`;
 document.body.append(dialog);dialog.querySelector('[data-close-picker]').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 let candidate=null,version=0,optionsVersion=0,availableCoupons=[],selectedCode=appliedCoupon;const message=dialog.querySelector('#pickerMessage'),confirm=dialog.querySelector('#confirmCoupon'),input=dialog.querySelector('#couponCode');
 const invalidate=()=>{candidate=null;version++;confirm.disabled=true;};input.oninput=()=>{message.textContent='';};dialog.addEventListener('close',()=>{version++;optionsVersion++;input.value='';message.textContent='';});
 async function loadOptions(){const request=++optionsVersion;const coupons=await api('/website/coupons/available',{method:'POST',body:JSON.stringify(checkoutSelection(items))});if(request!==optionsVersion||!dialog.isConnected)return coupons;availableCoupons=coupons;dialog.querySelector('#pickerCoupons').innerHTML=coupons.length?coupons.map(c=>couponCompactCard(c,selectedCode)).join(''):'<div class="picker-empty">'+icon('ticket')+'<p>Bạn chưa có mã khuyến mãi nào</p><small>Nhập mã được JAVI cung cấp để lưu vào tài khoản</small></div>';return coupons;}
 const saveEnteredCode=async()=>{const code=input.value.trim().toUpperCase();if(!code){message.textContent='Nhập mã giảm giá';return;}const request=++version,button=dialog.querySelector('#applyCoupon');button.disabled=true;message.textContent='Đang kiểm tra mã';try{await api('/website/account/coupons',{method:'POST',body:JSON.stringify({code})});if(request!==version||!dialog.open)return;await loadOptions();if(request!==version||!dialog.open)return;message.textContent='Mã giảm giá đã được lưu vào tài khoản';}catch(err){if(request===version&&dialog.open)message.textContent=err.message;}finally{button.disabled=false;}};
 dialog.querySelector('#applyCoupon').onclick=saveEnteredCode;input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();saveEnteredCode();}};
 confirm.onclick=async()=>{if(!candidate)return;confirm.disabled=true;try{if(candidate.code)await api('/website/quote',{method:'POST',body:JSON.stringify(quoteBody(items,candidate.code,checkout))});appliedCoupon=candidate.code||'';if(appliedCoupon)sessionStorage.setItem('javiCoupon',appliedCoupon);else sessionStorage.removeItem('javiCoupon');dialog.close();await refreshQuote(items,checkout);}catch(err){invalidate();message.textContent=err.message;loadOptions().catch(()=>{});}};
 dialog.querySelector('#pickerCoupons').onclick=e=>{const terms=e.target.closest('[data-coupon-terms]');if(terms){showCouponTerms(availableCoupons.find(c=>c.MaGiamGia===terms.dataset.couponTerms));return;}const button=e.target.closest('[data-picker-code]');if(!button||button.disabled)return;selectedCode=button.dataset.pickerCode;candidate={code:selectedCode};confirm.disabled=false;message.textContent='';dialog.querySelector('#pickerCoupons').innerHTML=availableCoupons.map(c=>couponCompactCard(c,selectedCode)).join('');};
 dialog.showModal();loadOptions().catch(()=>{dialog.querySelector('#pickerCoupons').innerHTML='<div class="picker-empty">'+icon('ticket')+'<p>Chưa tải được mã đã lưu</p><small>Nhập mã để kiểm tra và áp dụng trực tiếp</small></div>';});
}
async function refreshQuote(items,checkout=false){
 const version=++quoteVersion;currentQuote=null;const subtotal=items.reduce((sum,i)=>sum+Number(i.GiaBan)*Number(i.SoLuong),0);
 const submit=$('#placeOrderButton');if(submit)submit.disabled=true;
 $('#summaryTotal').textContent=money(subtotal);$('#summaryDiscount').textContent='−'+money(0);$('#summaryShipping').textContent=items.length?'Tính khi chọn địa chỉ':money(0);$('#summarySavings').textContent='−'+money(0);$('#appliedCouponCode').textContent=appliedCoupon;$('#appliedCouponRow').hidden=!appliedCoupon;$('#couponMessage').textContent='';
 if(!items.length){$('#couponMessage').textContent='Chọn sản phẩm để tính tiền và áp dụng ưu đãi';return;}
 const address=deliveryInput();if(checkout&&(!address.tinhThanh||!address.phuongXa||address.diaChiChiTiet.length<5)){$('#couponMessage').textContent='Chọn địa chỉ và nhập số nhà, tên đường để tính phí giao hàng';return;}
 if(!checkout&&!appliedCoupon)return;
 try{const quote=await api('/website/quote',{method:'POST',body:JSON.stringify(quoteBody(items,appliedCoupon,checkout))});if(version!==quoteVersion)return;currentQuote=quote;$('#summaryShipping').textContent=quote.shipping===null?'Tính khi chọn địa chỉ':money(quote.shipping);$('#summaryDiscount').textContent='−'+money(quote.discount);$('#summarySavings').textContent='−'+money(quote.discount);$('#summaryTotal').textContent=money(quote.total);$('#couponMessage').textContent=quote.code?'Đã áp dụng '+quote.code:'';if(submit)submit.disabled=false;}
 catch(err){if(version!==quoteVersion)return;$('#couponMessage').textContent=err.message;/* Keep a numeric subtotal even if discount verification fails. */}
}
async function initDelivery(items){
 const [locations,addresses]=await Promise.all([api('/website/locations'),api('/website/addresses')]);
 $('#receiverProvince').innerHTML='<option value="">Chọn tỉnh / thành</option>'+locations.map(p=>'<option value="'+p.code+'">'+esc(p.name)+'</option>').join('');
 const updateWards=()=>{const province=locations.find(p=>String(p.code)===$('#receiverProvince').value);$('#receiverWard').innerHTML='<option value="">Chọn phường / xã</option>'+(province?.wards||[]).map(w=>'<option value="'+w.code+'">'+esc(w.name)+'</option>').join('');$('#receiverWard').disabled=!province;};
 const refresh=()=>refreshQuote(items,true);
 $('#receiverProvince').onchange=()=>{updateWards();refresh();};$('#receiverWard').onchange=refresh;$('#receiverAddress').oninput=()=>{currentQuote=null;$('#placeOrderButton').disabled=true;};$('#receiverAddress').onchange=refresh;
 $('#savedAddress').innerHTML='<option value="">Nhập địa chỉ mới</option>'+addresses.map(a=>'<option value="'+a.ID+'">'+esc(a.NguoiNhan+' · '+a.DiaChiChiTiet+', '+a.TenPhuongXa+', '+a.TenTinhThanh)+'</option>').join('');
 $('#savedAddress').onchange=()=>{const a=addresses.find(a=>String(a.ID)===$('#savedAddress').value);if(!a){$('#receiverProvince').value='';updateWards();$('#receiverAddress').value='';refresh();return;}$('#receiverName').value=a.NguoiNhan;$('#receiverPhone').value=a.SoDT;$('#receiverProvince').value=a.MaTinhThanh;updateWards();$('#receiverWard').value=a.MaPhuongXa;$('#receiverAddress').value=a.DiaChiChiTiet;refresh();};
 if(addresses.length){$('#savedAddress').value=addresses[0].ID;$('#savedAddress').onchange();}else refresh();
}

function cartSummary(items,checkout=false){const subtotal=items.reduce((sum,item)=>sum+Number(item.GiaBan)*Number(item.SoLuong),0),quantity=items.reduce((sum,item)=>sum+Number(item.SoLuong),0);return `<h2>Thông tin đơn hàng</h2>${checkout?'<div class="summary-items">'+items.map(item=>'<div class="summary-item"><span>'+esc(item.TenSP)+(item.TrongLuongGram?'<small class="cart-options">'+esc(optionLabel(item))+'</small>':'')+' × '+item.SoLuong+'</span><strong>'+money(item.GiaBan*item.SoLuong)+'</strong></div>').join('')+'</div>':''}${couponControl()}<div class="summary-row"><span>Số lượng sản phẩm</span><strong id="summaryQuantity">${quantity}</strong></div><div class="summary-row"><span>Tổng tiền hàng</span><strong id="summarySubtotal">${money(subtotal)}</strong></div><div class="summary-row"><span>Giảm giá từ mã</span><strong id="summaryDiscount" class="summary-saving">−${money(0)}</strong></div><div class="summary-row shipping-row"><span>Giao hàng</span><span id="summaryShipping">Tính khi chọn địa chỉ</span></div><div class="summary-total-block"><div class="summary-row total"><span>TỔNG TIỀN</span><strong id="summaryTotal" aria-live="polite">${money(subtotal)}</strong></div><p class="summary-total-note">${checkout?'Phí giao hàng được cập nhật theo địa chỉ nhận':'Tạm tính, chưa gồm phí giao hàng'}</p></div><div class="summary-row savings-row"><span>Bạn tiết kiệm được</span><strong id="summarySavings" class="summary-saving">−${money(0)}</strong></div>${checkout?'<button type="submit" class="button full" id="placeOrderButton" disabled>Xác nhận đặt hàng</button>':'<button type="button" class="button full" id="goCheckout" '+(!items.length?'disabled':'')+'>Thanh toán ('+quantity+')</button>'}`;}
function cartProduct(item){return {...item,ViTri:item.ViTri||((item.TenLoaiSP||'').toLowerCase().includes('máy')?'MayPha':'CaPhe'),HinhAnh:item.HinhAnh||(item.AnhSP?'/images/products/'+item.AnhSP:'')};}
function renderCart(){
 if(!cart.length){$('#cartContent').innerHTML=`<div class="panel empty">${icon('bag')}<h2>Giỏ hàng đang chờ một chút hương vị</h2><p>Khám phá cà phê, máy pha và phụ kiện để bắt đầu lựa chọn</p><a class="button" href="mua-hang.html#san-pham">Khám phá cửa hàng</a></div>`;return;}
 const available=cart.filter(item=>item.HienThi!==false&&item.HienThi!==0&&maxPackages(item)>=item.SoLuong);
 selected=new Set([...selected].filter(id=>available.some(item=>lineId(item)===id)));
 const chosen=cart.filter(item=>selected.has(lineId(item)));
 $('#cartContent').innerHTML=`<div class="cart-layout"><section class="panel cart-products"><div class="cart-section-title"><div><span class="eyebrow">SẢN PHẨM ĐÃ CHỌN</span><h2>Danh sách sản phẩm</h2></div><span>${cart.length} mặt hàng</span></div><div class="cart-top"><label><input type="checkbox" id="selectAllCart" ${selected.size===available.length&&available.length?'checked':''}> Chọn tất cả (${cart.length})</label><span>${selected.size} sản phẩm được chọn</span><button type="button" class="remove-selected" id="removeSelectedCart" ${selected.size?'':'disabled'}>Xóa các mục đã chọn</button></div>${cart.map(item=>{const id=lineId(item),ok=available.includes(item);return `<article class="cart-item" data-product="${esc(id)}"><input type="checkbox" aria-label="Chọn ${esc(item.TenSP)}" data-cart-select="${esc(id)}" ${selected.has(id)?'checked':''} ${!ok?'disabled':''}><div class="cart-thumb">${image(cartProduct(item))}</div><div class="cart-item-copy"><h3>${esc(item.TenSP)}</h3>${item.TrongLuongGram?'<p class="cart-options">'+esc(optionLabel(item))+'</p>':''}<small>${money(item.GiaBan)} / ${esc(item.DonViTinh||'sản phẩm')}</small>${!ok?'<p class="stock out">Sản phẩm tạm hết hoặc số lượng khả dụng đã thay đổi</p>':''}<div class="quantity"><button type="button" data-qty="${esc(id)}" data-delta="-1" aria-label="Giảm số lượng">−</button><input type="number" min="1" max="${maxPackages(item)}" value="${item.SoLuong}" data-qty-input="${esc(id)}" aria-label="Số lượng ${esc(item.TenSP)}"><button type="button" data-qty="${esc(id)}" data-delta="1" aria-label="Tăng số lượng">+</button></div><button class="remove-item" data-remove="${esc(id)}" type="button" aria-label="Xóa ${esc(item.TenSP)}" title="Xóa sản phẩm">×</button></div><div class="line-price">${money(item.GiaBan*item.SoLuong)}</div></article>`;}).join('')}</section><aside class="panel">${cartSummary(chosen)}</aside></div>`;
 $('#removeSelectedCart').onclick=removeSelectedCart;
 $('#selectAllCart').onchange=e=>{selected=new Set(e.target.checked?available.map(item=>lineId(item)):[]);renderCart();};
 $('#goCheckout').onclick=()=>{sessionStorage.setItem('javiCheckoutIds',JSON.stringify([...selected]));sessionStorage.removeItem('javiCheckoutRequest');location.href='thanh-toan.html';};setupImages();wireCoupon(chosen);refreshQuote(chosen);
}
async function removeSelectedCart(){
 if(cartBusy||!selected.size)return;
 const ids=[...selected].map(Number);
 $('#removeSelectedCart').disabled=true;
 const dialog=document.createElement('dialog');dialog.className='purchase-auth-dialog cart-remove-dialog';dialog.innerHTML='<h2>Xóa các mục đã chọn?</h2><p>Các sản phẩm còn lại vẫn được giữ trong giỏ hàng.</p><div class="purchase-auth-actions"><button type="button" class="button light" data-cancel>Giữ lại</button><button type="button" class="button" data-confirm>Xóa ('+ids.length+')</button></div>';document.body.append(dialog);
 const confirmed=await new Promise(resolve=>{dialog.querySelector('[data-cancel]').onclick=()=>dialog.close('cancel');dialog.querySelector('[data-confirm]').onclick=()=>dialog.close('confirm');dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true});dialog.showModal();});dialog.remove();if(!confirmed||cartBusy){if($('#removeSelectedCart'))$('#removeSelectedCart').disabled=!selected.size;return;}
 cartBusy=true;try{await api('/gio-hang/'+encodeURIComponent(user.TenDangNhap),{method:'DELETE',body:JSON.stringify({maGioHang:ids})});ids.forEach(id=>selected.delete(String(id)));await loadCart();renderCart();toast('Đã xóa các mục đã chọn.','success');}catch(err){toast(err.message);}finally{cartBusy=false;}
}
async function changeQuantity(id,qty){if(cartBusy)return;const item=cart.find(item=>lineId(item)===id);if(!item)return;if(!Number.isInteger(qty)||qty<1||qty>maxPackages(item)||qty>999){toast('Kiểm tra số lượng khả dụng của sản phẩm.');renderCart();return;}cartBusy=true;try{await api('/gio-hang',{method:'PUT',body:JSON.stringify({tenDangNhap:user.TenDangNhap,maGH:Number(id),soLuong:qty})});await loadCart();renderCart();}catch(err){toast(err.message);renderCart();}finally{cartBusy=false;}}
function initialCartSelection(items,focus){const available=items.filter(item=>item.HienThi!==0&&item.HienThi!==false&&item.SoLuong<=maxPackages(item));return new Set((focus?available.filter(item=>lineId(item)===String(focus.maGH)):available).map(lineId));}
async function initCart(){
 if(!customerRequired())return;await loadCart();let focus;try{focus=JSON.parse(sessionStorage.getItem('javiCartFocus')||'null');}catch(_){}sessionStorage.removeItem('javiCartFocus');
 if(focus?.username!==user.TenDangNhap)focus=null;
 selected=initialCartSelection(cart,focus);renderCart();
 if(focus)toast(selected.size?'Đã thêm vào giỏ hàng':'Sản phẩm vừa thêm hiện không đủ tồn để thanh toán',selected.size?'success':'notice');
}
function checkoutItems(){let ids=[];try{ids=JSON.parse(sessionStorage.getItem('javiCheckoutIds')||'[]');}catch(_){}return cart.filter(item=>ids.includes(lineId(item)));}
async function initCheckout(){if(!customerRequired())return;await loadCart();const items=checkoutItems();if(!items.length){location.replace('gio-hang.html');return;}$('#receiverName').value=user.TenKH||'';$('#receiverPhone').value=user.SoDTKH||'';$('#receiverEmail').value=user.EmailKH||'';$('#receiverAddress').value='';$('#checkoutSummary').innerHTML=cartSummary(items,true);wireCoupon(items,true);await initDelivery(items);
 const bank=()=>{const transfer=$('[name=payment]:checked').value==='Chuyển khoản';$('#placeOrderButton').textContent=transfer?'Thanh toán chuyển khoản':'Xác nhận đặt hàng';$('#bankDetails').hidden=!transfer;$('#bankDetails').textContent='Sau khi đặt đơn, JAVI tạo mã VietQR kèm số tiền để bạn quét bằng ứng dụng ngân hàng. Mã có thời hạn; hết hạn có thể làm mới.';};document.querySelectorAll('[name=payment]').forEach(input=>input.onchange=bank);bank();
 $('#checkoutForm').onsubmit=async event=>{event.preventDefault();const button=$('#placeOrderButton');if(button.disabled||!currentQuote)return;button.disabled=true;button.textContent='Đang xác nhận đơn…';$('#checkoutError').hidden=true;
 let key=sessionStorage.getItem('javiCheckoutRequest');if(!key){key=crypto.randomUUID();sessionStorage.setItem('javiCheckoutRequest',key);}
 try{const order=await api('/website/checkout',{method:'POST',body:JSON.stringify({maYeuCau:key,tongDuKien:currentQuote.total,maGiamGia:appliedCoupon,...deliveryInput(),luuDiaChi:$('#saveAddress').checked,...checkoutSelection(items),nguoiNhan:$('#receiverName').value.trim(),soDT:$('#receiverPhone').value.trim(),email:$('#receiverEmail').value.trim(),diaChi:$('#receiverAddress').value.trim(),ghiChu:$('#receiverNote').value.trim(),hinhThucTT:$('[name=payment]:checked').value})});sessionStorage.removeItem('javiBuyNow');sessionStorage.removeItem('javiCheckoutIds');sessionStorage.removeItem('javiCheckoutRequest');location.href=(order.hinhThucTT==='Chuyển khoản'?'thanh-toan-qr.html':'don-hang-thanh-cong.html')+'?order='+encodeURIComponent(order.maDH);}catch(err){$('#checkoutError').textContent=err.message;$('#checkoutError').hidden=false;$('#checkoutError').scrollIntoView({behavior:'smooth',block:'center'});button.disabled=false;button.textContent='Kiểm tra và thử lại';refreshQuote(items,true);}};
}
async function initSuccess(){if(!customerRequired())return;const id=new URLSearchParams(location.search).get('order');if(!id)throw new Error('Chưa có mã đơn hàng.');const order=await api('/website/orders/'+encodeURIComponent(id));if(order.HinhThucTT==='Chuyển khoản'&&!order.TrangThaiThanhToan&&order.TrangThaiDonHang==='Chờ giao'){location.replace('thanh-toan-qr.html?order='+encodeURIComponent(id));return;}const emailStatus=order.TrangThaiEmail==='sent'?'Email xác nhận đã được gửi đến '+order.Email:order.TrangThaiEmail==='preview'?'Email xác nhận đang chờ gửi. Bạn có thể xem nội dung xác nhận ngay bên dưới.':(order.TrangThaiThanhToan?'Email xác nhận đang được xử lý.':'Email đơn hàng sẽ được gửi sau khi thanh toán thành công.');
 $('#successContent').innerHTML=`<header class="success-heading"><div class="success-symbol">✓</div><div class="eyebrow">JAVI ĐÃ NHẬN ĐƯỢC LỰA CHỌN CỦA BẠN</div><h1>Cảm ơn bạn đã chọn JAVI</h1><p>Đơn hàng <strong>${esc(order.MaDH)}</strong> đã được tiếp nhận<br>Chúng tôi sẽ liên hệ để xác nhận thông tin giao hàng</p><span class="status-pill">${esc(order.TrangThaiDonHang)}</span></header><div class="checkout-layout"><section class="panel"><h2>Hẹn gặp ở một tách cà phê</h2><div class="receipt-grid"><div><h3>Giao đến</h3><p><strong>${esc(order.NguoiNhan)}</strong><br>${esc(order.SoDT)}<br>${esc(order.DiaChi)}</p></div><div><h3>Phương thức thanh toán</h3><p>${esc(order.HinhThucTT)}<br>${esc(order.TrangThaiThanhToan||'Chưa thanh toán')}</p></div><div style="grid-column:1/-1"><h3>Email xác nhận</h3><p>${esc(emailStatus)}</p></div>${order.GhiChu?'<div><h3>Lời nhắn</h3><p>'+esc(order.GhiChu)+'</p></div>':''}</div><div class="page-actions" style="justify-content:start"><a class="button" href="mua-hang.html">Tiếp tục khám phá</a><button class="button light" id="showOrderEmail" ${order.TrangThaiEmail?'':'hidden'}>Xem email xác nhận</button></div></section><aside class="panel"><h2>Thông tin đơn hàng</h2><div class="summary-items">${order.items.map(item=>`<div class="summary-item"><span>${esc(item.TenSP)}${item.TrongLuongGram?'<small class="cart-options">'+esc(optionLabel(item))+'</small>':''} × ${item.SoLuong}</span><strong>${money(item.ThanhTien)}</strong></div>`).join('')}</div><div class="summary-row"><span>Giao hàng</span><span>${money(order.PhiVanChuyen)}</span></div><div class="summary-row"><span>Giảm giá</span><span>−${money(order.TienGiam||0)}</span></div><div class="summary-row total"><span>Tổng thanh toán</span><strong>${money(order.TongThanhToan)}</strong></div></aside></div>`;
 $('#showOrderEmail').onclick=async event=>{const button=event.currentTarget;button.disabled=true;try{const response=await fetch('/api/website/orders/'+encodeURIComponent(id)+'/email',{headers:{Authorization:'Bearer '+user.AuthToken}});if(!response.ok)throw new Error('Không mở được email.');$('#orderEmailPreview').srcdoc=await response.text();$('#emailPreviewSection').hidden=false;$('#emailPreviewSection').scrollIntoView({behavior:'smooth'});}catch(err){toast(err.message);}finally{button.disabled=false;}};
}
// VietQR transfer: show the QR returned by VietQR, count down to expiry, blur + refresh when expired.
async function initPayment(){if(!customerRequired())return;const id=new URLSearchParams(location.search).get('order');if(!/^DH\d{6}$/.test(id||''))throw new Error('Chưa có mã đơn hàng.');
 const box=$('#paymentContent'),base='/website/orders/'+encodeURIComponent(id);let timer=0,busy=false,currentRef='';
 const success=()=>location.replace('don-hang-thanh-cong.html?order='+encodeURIComponent(id));
 const order=await api(base);
 const clock=seconds=>String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
 const summary=`<aside class="panel"><h2>Thông tin đơn hàng</h2><div class="summary-items">${order.items.map(item=>`<div class="summary-item"><span>${esc(item.TenSP)}${item.TrongLuongGram?'<small class="cart-options">'+esc(optionLabel(item))+'</small>':''} × ${item.SoLuong}</span><strong>${money(item.ThanhTien)}</strong></div>`).join('')}</div><div class="summary-row"><span>Giao hàng</span><span>${money(order.PhiVanChuyen)}</span></div><div class="summary-row"><span>Giảm giá</span><span>−${money(order.TienGiam||0)}</span></div><div class="summary-row total"><span>Tổng thanh toán</span><strong>${money(order.TongThanhToan)}</strong></div></aside>`;
 const expire=()=>{clearInterval(timer);if(!$('#qrFrame'))return;$('#qrFrame').classList.add('qr-expired');$('#qrCountdown').textContent='Mã đã hết hạn';$('#qrDownload').hidden=true;$('#qrPaid').disabled=true;$('#qrRefresh').hidden=false;$('#qrRefresh').disabled=false;};
 const render=data=>{clearInterval(timer);const qr=data.qr;currentRef=qr.maThamChieu;
  box.innerHTML=`<header class="page-intro"><div class="eyebrow">THANH TOÁN CHUYỂN KHOẢN</div><h1 class="page-title">Quét mã VietQR để thanh toán</h1><p>Đơn hàng <strong>${esc(data.maDH)}</strong> · Mở ứng dụng ngân hàng, quét mã và kiểm tra đúng số tiền.</p></header><div class="checkout-layout"><section class="panel qr-panel"><div class="qr-frame" id="qrFrame"><img id="qrImage" src="${esc(qr.anhQR)}" alt="Mã VietQR thanh toán đơn ${esc(data.maDH)}" width="320" height="320"><button type="button" class="qr-refresh" id="qrRefresh" hidden aria-label="Làm mới mã QR" title="Làm mới mã QR"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg><span>Làm mới mã</span></button></div><p class="qr-countdown" id="qrCountdown" aria-live="polite"></p><dl class="qr-info"><div><dt>Số tiền</dt><dd><strong>${money(qr.soTien)}</strong></dd></div><div><dt>Nội dung</dt><dd>${esc(qr.maThamChieu)}</dd></div><div><dt>Số tài khoản</dt><dd>${esc(qr.soTaiKhoan)}</dd></div><div><dt>Chủ tài khoản</dt><dd>${esc(qr.chuTaiKhoan)}</dd></div></dl><div class="page-actions qr-actions"><a class="button light" id="qrDownload" href="${esc(qr.anhQR)}" download="VietQR-${esc(data.maDH)}.png">Tải mã QR</a><button type="button" class="button" id="qrPaid">Thanh toán thành công</button></div><p class="field-help">Bản demo: nút Thanh toán thành công giả lập ngân hàng xác nhận giao dịch của mã đang hiển thị.</p></section>${summary}</div>`;
  $('#qrRefresh').onclick=()=>createQr(true);$('#qrPaid').onclick=confirmPaid;
  const ends=Date.now()+qr.conLaiGiay*1000;const tick=()=>{const left=Math.max(0,Math.round((ends-Date.now())/1000));if(!left)return expire();$('#qrCountdown').textContent='Mã hết hạn sau '+clock(left);};
  if(qr.trangThai!=='Chờ thanh toán'||qr.conLaiGiay<=0)expire();else{tick();timer=setInterval(tick,1000);}
 };
 async function createQr(refresh){if(busy)return;busy=true;if(refresh)$('#qrRefresh').disabled=true;try{render(await api(base+'/payment/qr',{method:'POST',body:'{}'}));if(refresh)toast('Đã tạo mã QR mới','success');}catch(err){if(err.status===409){const state=await api(base+'/payment').catch(()=>null);if(state?.daThanhToan)return success();}if(refresh){toast(err.message);$('#qrRefresh').disabled=false;}else box.innerHTML=`<div class="empty"><h2>Chưa tạo được mã thanh toán</h2><p>${esc(err.message)}</p><button class="button light" onclick="location.reload()">Thử lại</button></div>`;}finally{busy=false;}}
 async function confirmPaid(){const button=$('#qrPaid');if(busy||button.disabled)return;busy=true;button.disabled=true;button.textContent='Đang xác nhận…';try{await api(base+'/payment/confirm',{method:'POST',body:JSON.stringify({maThamChieu:currentRef})});clearInterval(timer);success();}catch(err){toast(err.message);button.textContent='Thanh toán thành công';if(err.status===410)expire();else if(err.status===409){const state=await api(base+'/payment').catch(()=>null);if(state?.daThanhToan)return success();}else button.disabled=false;}finally{busy=false;}}
 const state=await api(base+'/payment');
 if(state.daThanhToan)return success();
 if(state.lyDoKhongThanhToan){box.innerHTML=`<div class="empty"><h2>Không thể thanh toán đơn ${esc(id)}</h2><p>${esc(state.lyDoKhongThanhToan)}</p><a class="button light" href="tai-khoan.html#orders">Xem đơn hàng</a></div>`;return;}
 if(state.qr?.trangThai==='Chờ thanh toán'&&state.qr.conLaiGiay>0)render(state);else await createQr(false);
}

async function initAccount(){
 if(!customerRequired())return;
 let state=await api('/website/account'),orderPage=1;
 const profile=state.profile;
 $('#accountHero').innerHTML=`<div class="account-identity"><span class="account-avatar" aria-hidden="true">${esc(profile.TenKH.trim().charAt(0))}</span><div><h2>${esc(profile.TenKH)}</h2><p>${esc(profile.EmailKH||profile.SoDTKH||profile.TenDangNhap)}</p><span class="account-member">Khách hàng JAVI · ${esc(profile.MaKH)}</span></div></div><div class="account-order-count">${icon('bag')}<div><strong>${Number(state.summary.SoDonHang)}</strong><span>Đơn hàng của bạn</span></div></div>`;
 const details=[['Họ và tên',profile.TenKH],['Tên đăng nhập',profile.TenDangNhap],['Mã khách hàng',profile.MaKH],['Số điện thoại',profile.SoDTKH],['Email',profile.EmailKH],['Giới tính',profile.GioiTinhKH],['Địa chỉ',profile.DiaChiKH]];
 $('#accountDetails').innerHTML=details.map(([label,value])=>'<div><dt>'+esc(label)+'</dt><dd>'+esc(String(value||'').trim()||'Chưa cập nhật')+'</dd></div>').join('');
 const renderCoupons=()=>{$('#accountCoupons').innerHTML=state.coupons.length?state.coupons.map(c=>couponCompactCard(c,'',true)).join(''):'<div class="account-empty">Bạn chưa lưu mã giảm giá nào</div>';};
 renderCoupons();
 $('#accountCoupons').onclick=e=>{const terms=e.target.closest('[data-coupon-terms]');if(terms){showCouponTerms(state.coupons.find(c=>c.MaGiamGia===terms.dataset.couponTerms));return;}const button=e.target.closest('[data-use-coupon]');if(!button)return;sessionStorage.setItem('javiCoupon',button.dataset.useCoupon);location.href='gio-hang.html';};
 $('#claimCouponForm').onsubmit=async e=>{e.preventDefault();const button=e.currentTarget.querySelector('button');button.disabled=true;try{await api('/website/account/coupons',{method:'POST',body:JSON.stringify({code:$('#claimCouponCode').value})});state=await api('/website/account');renderCoupons();$('#claimCouponMessage').textContent='Mã giảm giá đã được lưu vào tài khoản';$('#claimCouponCode').value='';}catch(err){$('#claimCouponMessage').textContent=err.message;}finally{button.disabled=false;}};
 async function loadOrders(){const list=$('#accountOrders');list.innerHTML='<div class="loading">Đang tải lịch sử mua hàng</div>';try{const orders=await api('/website/account/orders?page='+orderPage);list.innerHTML=orders.length?orders.map(o=>`<article class="account-order"><div class="account-order-head"><div><strong>${esc(o.MaDH)}</strong><span>${date(o.NgayDat)}</span></div><span class="status-pill">${esc(o.TrangThaiDonHang)}</span></div><div class="account-order-total"><span>Tổng thanh toán</span><strong>${money(o.TongTienSauGiam)}</strong></div>${Number(o.TongGiamGiaSP)>0?'<p class="account-order-discount">Đã giảm '+money(o.TongGiamGiaSP)+'</p>':''}${o.ChoThanhToanQR?'<a class="button account-pay-link" href="thanh-toan-qr.html?order='+encodeURIComponent(o.MaDH.trim())+'">Thanh toán chuyển khoản</a>':''}<button type="button" class="account-detail-button" data-order-detail="${esc(o.MaDH.trim())}" aria-expanded="false">Xem sản phẩm</button><div class="account-order-items" hidden></div></article>`).join(''):'<div class="account-empty">Chưa có đơn hàng trong mục này</div>';$('#ordersPage').textContent='Trang '+orderPage;$('#ordersPrev').disabled=orderPage===1;$('#ordersNext').disabled=orderPage*10>=Number(state.summary.SoDonHang);}catch(e){list.textContent=e.message;}}
 $('#accountOrders').onclick=async e=>{const button=e.target.closest('[data-order-detail]');if(!button)return;const area=button.nextElementSibling;if(button.getAttribute('aria-expanded')==='true'){area.hidden=true;button.setAttribute('aria-expanded','false');return;}button.disabled=true;try{const order=await api('/don-hang/'+encodeURIComponent(button.dataset.orderDetail)+'/chi-tiet');area.innerHTML=order.items.map(i=>'<div><span>'+esc(i.name||i.TenSP)+' × '+Number(i.quantity)+'</span><strong>'+money(i.ThanhTien)+'</strong></div>').join('');area.hidden=false;button.setAttribute('aria-expanded','true');}catch(err){toast(err.message);}finally{button.disabled=false;}};
 $('#ordersPrev').onclick=()=>{if(orderPage>1){orderPage--;loadOrders();}};$('#ordersNext').onclick=()=>{orderPage++;loadOrders();};
 const section=()=>{const selected=['profile','orders','coupons'].includes(location.hash.slice(1))?location.hash.slice(1):'profile';['profile','orders','coupons'].forEach(name=>{$('#account-'+name).hidden=name!==selected;const button=$('[data-account-section="'+name+'"]');if(name===selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});if(selected==='orders')loadOrders();};
 document.querySelectorAll('[data-account-section]').forEach(button=>button.onclick=()=>{location.hash=button.dataset.accountSection;});window.addEventListener('hashchange',section);section();
}

function idleSession(){if(!user)return;const key='javiLastActivity',limit=30*60*1000;if(!localStorage.getItem(key))localStorage.setItem(key,String(Date.now()));let last=0;const record=()=>{if(Date.now()-last>5000){last=Date.now();localStorage.setItem(key,String(last));}};['pointerdown','keydown','scroll','touchstart'].forEach(type=>document.addEventListener(type,record,{passive:true,capture:true}));const timer=setInterval(()=>{if(Date.now()-Number(localStorage.getItem(key))>=limit){clearInterval(timer);localStorage.removeItem('currentUser');location.replace(loginLink());}},10000);}
document.addEventListener('DOMContentLoaded',async()=>{
 header();if($('#siteHeader')?.children.length){const updateHeader=()=>document.documentElement.style.setProperty('--store-header-height',$('#siteHeader').getBoundingClientRect().height+'px');new ResizeObserver(updateHeader).observe($('#siteHeader'));updateHeader();}quickContact();initBanners();document.querySelectorAll('[data-icon]').forEach(el=>el.insertAdjacentHTML('afterbegin',icon(el.dataset.icon)));
 document.addEventListener('click',event=>{if(!event.target.closest('.store-account'))setAccountMenu(false);});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('#accountMenu')&&!$('#accountMenu').hidden){setAccountMenu(false);$('#accountToggle').focus();}});

 document.addEventListener('click',async e=>{const cartLink=e.target.closest('a[href]');if(cartLink&&new URL(cartLink.href,location.href).pathname.endsWith('/gio-hang.html')&&!(user?.VaiTro==='KHACH_HANG'&&user.AuthToken)){e.preventDefault();showPurchaseAuth('/landing_page/gio-hang.html');return;}const card=e.target.closest('.product-card');if(card&&!e.target.closest('a,button,input,select')){openProduct(card.dataset.product);return;}const choose=e.target.closest('[data-cart-select]');if(choose){if(choose.checked)selected.add(choose.dataset.cartSelect);else selected.delete(choose.dataset.cartSelect);renderCart();}const qty=e.target.closest('[data-qty]');if(qty){const item=cart.find(item=>lineId(item)===qty.dataset.qty);await changeQuantity(qty.dataset.qty,item.SoLuong+Number(qty.dataset.delta));}const remove=e.target.closest('[data-remove]');if(remove&&!cartBusy){cartBusy=true;try{await api('/gio-hang/'+encodeURIComponent(user.TenDangNhap)+'/'+encodeURIComponent(remove.dataset.remove),{method:'DELETE'});await loadCart();renderCart();}catch(err){toast(err.message);}finally{cartBusy=false;}}});
 document.addEventListener('change',e=>{if(e.target.matches('[data-qty-input]'))changeQuantity(e.target.dataset.qtyInput,Number(e.target.value));});
 try{settings=await api('/website/settings').catch(()=>({}));footer();idleSession();if(user?.VaiTro==='KHACH_HANG')await loadCart().catch(err=>{header();toast(err.message);});if(page==='shop'){initPartners();await initShop();}if(page==='product')await initProduct();if(page==='blog')await initBlog();if(page==='article')await initArticle();if(page==='cart')await initCart();if(page==='checkout')await initCheckout();if(page==='success')await initSuccess();if(page==='payment')await initPayment();if(page==='account')await initAccount();}
 catch(err){footer();const target=$('#productDetail')||$('#productSections')||$('#blogList')||$('#articleContent')||$('#cartContent')||$('#successContent')||$('#paymentContent')||$('#accountHero')||$('#checkoutSummary');if(target)target.innerHTML=`<div class="empty"><h2>Chưa thể tải nội dung</h2><p>${esc(err.message)}</p><button class="button light" onclick="location.reload()">Thử lại</button></div>`;else toast(err.message);}
});
})();

