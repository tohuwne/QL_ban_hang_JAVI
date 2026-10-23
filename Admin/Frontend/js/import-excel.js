(()=>{
 const id=document.body.dataset.importModule,$=s=>document.querySelector(s);
 const masters=new Set(['san-pham','loai-sp','khach-hang','loai-kh','nha-cung-cap','ma-giam-gia','tinh-thanh','phuong-xa','phi-giao-hang','don-hang']);
 if(!masters.has(id)){location.replace('/admin/'+(document.body.dataset.returnPage||id)+'.html');return;}
 let schema,file,token=null,revision=0,busy=false,saved=false;
 const user=JSON.parse(localStorage.getItem('currentUser')||'null');
 if(!user?.AuthToken){location.replace('/landing_page/login.html');return;}
 const message=(text,error=false)=>{$('#importMessage').textContent=text;$('#importMessage').hidden=!text;$('#importMessage').classList.toggle('is-error',error);};
 const api=async(path,options={})=>fetch('/api/excel/'+id+'/'+path,{...options,headers:{Authorization:'Bearer '+user.AuthToken,...options.headers}});
 const json=async response=>{
  if(!(response.headers.get('content-type')||'').includes('application/json'))throw Error(response.status===404?'API nhập file chưa được nạp. Vui lòng khởi động lại server.':'Không kết nối được API nhập file.');
  const result=await response.json();if(!response.ok||!result.success){const e=Error(result.message||'Không xử lý được file.');e.data=result.data;throw e;}return result.data;
 };
 function buttons(){
  $('#commitImport').disabled=busy||!token||saved;
  $('#chooseFile').disabled=busy||saved;$('#duplicatePolicy').disabled=busy||saved;$('#recheckImport').disabled=busy||!file||saved;
  $('#downloadTemplate').disabled=busy;$('#closeImport').disabled=busy;
 }
 function render(rows){
  const body=$('#importPreview tbody');body.replaceChildren();
  const showCustomers=rows.some(r=>!String(r.values.MaKH||'').trim()||schema.columns.some(c=>c.newCustomer&&r.cellErrors?.[c.key]?.length));
  schema.columns.forEach((c,i)=>{if(c.newCustomer)$('#importPreview thead tr').children[i+1].hidden=!showCustomers;});
  for(const [index,row] of rows.entries()){const tr=document.createElement('tr');tr.className=row.errors.length?'import-row-error':row.action==='skip'?'import-row-skip':'';
   const values=[index+1,...schema.columns.map(c=>c.secret&&row.values[c.key]?'••••••••':row.values[c.key]??''),row.errors.length?'Lỗi':({insert:'Thêm mới',update:'Cập nhật',skip:'Bỏ qua'}[row.action]),row.errors.join(' · ')];
   values.forEach((value,i)=>{
    const td=document.createElement('td');td.textContent=String(value);
    if(i>0&&i<=schema.columns.length){
     const column=schema.columns[i-1],errors=row.cellErrors?.[column.key]||[];
     td.dataset.column=column.key;
     if(column.newCustomer)td.hidden=!showCustomers;
     if(errors.length){td.classList.add('import-cell-error');td.title=errors.join('\n');td.setAttribute('aria-invalid','true');td.setAttribute('aria-label',column.label+': '+errors.join(' · '));td.tabIndex=0;}
    }else if(row.errors.length&&i===schema.columns.length+1)td.classList.add('import-status-error');
    tr.append(td);
   });body.append(tr);
  }
  const errors=rows.filter(r=>r.errors.length).length;
  $('#previewSummary').textContent=rows.length+' dòng · '+errors+' dòng lỗi · '+rows.filter(r=>r.action==='insert').length+' thêm mới · '+rows.filter(r=>r.action==='update').length+' cập nhật · '+rows.filter(r=>r.action==='skip').length+' bỏ qua';
 }
 async function preview(){
  token=null;buttons();if(!file)return;
  if(!/\.xlsx$/i.test(file.name)||file.size>5*1024*1024){message('Chọn file .xlsx tối đa 5 MB.',true);$('#importPreview tbody').replaceChildren();$('#previewSummary').textContent='';return;}
  const version=++revision;busy=true;buttons();message('Đang đọc file và kiểm tra dữ liệu với database…');
  try{
   const data=await json(await api('preview?policy='+$('#duplicatePolicy').value,{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:file}));
   if(version!==revision)return;render(data.rows);token=data.valid?data.token:null;
   message(data.valid?'':'Có dòng lỗi. Vui lòng sửa file rồi chọn lại.',!data.valid);
  }catch(e){if(version===revision){message(e.message,true);$('#importPreview tbody').replaceChildren();$('#previewSummary').textContent='';}}
  finally{if(version===revision){busy=false;buttons();}}
 }
 async function init(){
  const close=()=>{if(!busy)location.assign('/admin/'+(document.body.dataset.returnPage||id)+'.html');};
  $('#closeImport').onclick=close;
  const sidebar=document.querySelector('.sidebar');if(sidebar)sidebar.inert=true;
  try{
   schema=await json(await api('schema'));$('#importTitle').textContent='Nhập Excel · '+schema.title;document.title=$('#importTitle').textContent+' · JAVI COFFEE';
   const tr=$('#importPreview thead tr');for(const title of ['STT',...schema.columns.map(c=>c.label+(c.required?' *':'')),'Xử lý','Chi tiết lỗi']){const th=document.createElement('th');th.textContent=title;tr.append(th);}
   schema.columns.forEach((c,i)=>{if(c.newCustomer)tr.children[i+1].hidden=true;});
   $('#chooseFile').onchange=e=>{file=e.target.files[0];saved=false;preview();};
   $('#duplicatePolicy').onchange=preview;$('#recheckImport').onclick=preview;
   $('#downloadTemplate').onclick=async()=>{
    busy=true;buttons();try{const response=await api('template');if(!response.ok){await json(response);throw Error('Không tải được file mẫu.');}if(!(response.headers.get('content-type')||'').includes('spreadsheetml'))throw Error('File mẫu chưa sẵn sàng.');const url=URL.createObjectURL(await response.blob()),a=document.createElement('a');a.href=url;a.download='mau-'+id+'.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){message(e.message,true);}finally{busy=false;buttons();}
   };
   $('#commitImport').onclick=async()=>{
    if(!token||busy||saved)return;busy=true;buttons();message('Đang kiểm tra lại và lưu toàn bộ dữ liệu…');
    try{const data=await json(await api('commit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})}));saved=true;token=null;message('Đã nhập thành công: '+data.counts.insert+' dòng mới, '+data.counts.update+' dòng cập nhật, '+data.counts.skip+' dòng bỏ qua.');$('#closeImport').textContent='Đóng và tải lại danh sách';}
    catch(e){token=null;if(e.data?.rows)render(e.data.rows);message(e.message,true);}finally{busy=false;buttons();}
   };
   message('');
  }catch(e){busy=false;message(e.message,true);}finally{buttons();if(!schema){$('#chooseFile').disabled=true;$('#downloadTemplate').disabled=true;}}
 }
 init();
})();
