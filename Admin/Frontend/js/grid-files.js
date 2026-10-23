(()=>{
 const modules=new Set(['san-pham','loai-sp','khach-hang','loai-kh','nha-cung-cap','nhan-vien','ma-giam-gia','dia-diem-van-chuyen','nhap-kho','xuat-kho','don-hang','hoa-don','phieu-thu','phieu-chi','ton-kho','cong-no','cau-hinh-website','quan-tri']);
 const masterPages=new Set(['san-pham','loai-sp','khach-hang','loai-kh','nha-cung-cap','ma-giam-gia','dia-diem-van-chuyen','don-hang']);
 const page=location.pathname.split('/').pop().replace('.html','');
 if(!modules.has(page))return;
 const moduleId=()=>page==='dia-diem-van-chuyen'?(document.querySelector('#panelWard:not([hidden])')?'phuong-xa':document.querySelector('#panelShipping:not([hidden])')?'phi-giao-hang':'tinh-thanh'):page;
 async function download(response,name){if(!response.ok){const err=await response.json();throw Error(err.message||'Không tải được file.');}const url=URL.createObjectURL(await response.blob()),a=document.createElement('a');a.href=url;a.download=name+'.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function tableData(table){
  const headers=[...table.tHead.rows[0].cells];
  const indexes=headers.map((cell,i)=>({cell,i})).filter(({cell})=>cell.textContent.trim()&&!cell.hidden&&getComputedStyle(cell).display!=='none'&&!cell.querySelector('input[type=checkbox]'));
  const text=cell=>{const clone=cell.cloneNode(true);clone.querySelectorAll('input,select,.col-filter-control,.col-filter-icon,.filter-clear').forEach(e=>e.remove());return clone.textContent.replace(/\s+/g,' ').trim();};
  const rows=[...table.tBodies[0].rows].filter(r=>!r.classList.contains('filter-hidden')&&!r.classList.contains('col-filter-hidden')&&r.style.display!=='none'&&!r.hidden&&r.cells.length===headers.length&&!r.querySelector('td[colspan]'));
  return {columns:indexes.map(({cell})=>text(cell)),rows:rows.map(r=>indexes.map(({i})=>text(r.cells[i])))};
 }
 function openImport(){
  window.location.assign('/admin/import-'+moduleId()+'.html');
 }
 function init(){
  const header=document.querySelector('.page-header');if(!header)return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='/css/import-excel.css';document.head.append(link);
  const user=JSON.parse(localStorage.getItem('currentUser')||'null');
  const canImport=masterPages.has(page)&&!(page==='san-pham'&&['Bán hàng','Kho'].includes(user?.ChucVu));
  const box=document.createElement('div');box.className='grid-file-menu';
  box.innerHTML=canImport?'<button type="button" class="btn" aria-expanded="false" aria-haspopup="true"><i class="fas fa-file-excel"></i> Nhập / Xuất file <span aria-hidden="true">▾</span></button><div class="grid-file-options" hidden><button type="button" data-file-import>Nhập file</button><button type="button" data-file-export>Xuất file</button></div>':'<button type="button" class="btn" data-file-export><i class="fas fa-file-excel"></i> Xuất file</button>';
  header.classList.add('has-grid-files');
  if(page==='dia-diem-van-chuyen'){
   const place=()=>{const toolbar=document.querySelector('.web-tab-panel:not([hidden]) .directory-toolbar');if(toolbar)toolbar.append(box);};
   place();document.addEventListener('click',event=>{if(event.target.closest('.web-tabs [role=tab]'))place();});
  }else{
   const add=[...header.querySelectorAll('button,a.btn')].find(b=>!b.closest('.user-profile')&&/thêm|lên đơn|tạo|lập/i.test(b.textContent));
   if(add){
    if(add.parentElement===header){const actions=document.createElement('div');actions.className='grid-file-actions';header.insertBefore(actions,add);actions.append(add,box);}
    else{add.parentElement.classList.add('grid-file-actions');add.after(box);}
   }else header.insertBefore(box,header.querySelector('.user-profile'));
  }
  const toggle=box.querySelector('.btn'),menu=box.querySelector('.grid-file-options');
  const close=()=>{if(menu){menu.hidden=true;toggle.setAttribute('aria-expanded','false');}};
  if(canImport){
   toggle.onclick=()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));};
   document.addEventListener('click',e=>{if(!box.contains(e.target))close();});box.addEventListener('keydown',e=>{if(e.key==='Escape'){close();toggle.focus();}});
   box.querySelector('[data-file-import]').onclick=()=>{close();openImport();};
  }
  box.querySelector('[data-file-export]').onclick=async e=>{
   close();const button=e.currentTarget;button.disabled=true;
   try{
    const table=[...document.querySelectorAll('.main-content .table-responsive table')].find(t=>t.offsetParent!==null&&t.tHead&&t.tBodies.length);
    if(!table)throw Error('Không có lưới dữ liệu để xuất.');const data=tableData(table);
    if(!data.rows.length)throw Error('Lưới đang lọc không có dữ liệu để xuất.');
    await download(await fetch('/api/excel/'+moduleId()+'/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}),'danh-sach-'+moduleId());
   }catch(err){window.javiAlert?.(err.message,'error');}finally{button.disabled=false;}
  };
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
