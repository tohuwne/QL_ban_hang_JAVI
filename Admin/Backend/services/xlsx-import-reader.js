// Value-only OOXML reader. Import must not depend on namespace prefixes,
// comments, drawings or other presentation parts of a valid Excel workbook.
const JSZip=require('jszip');
const path=require('path').posix;
const {SaxesParser}=require('saxes');
const attr=(node,key)=>Object.values(node.attributes).find(a=>a.local.toLowerCase()===key.toLowerCase())?.value;
function xml(text,handlers){
 const parser=new SaxesParser({xmlns:true}),stack=[];
 parser.on('doctype',()=>{throw Error('File Excel không được chứa khai báo DTD.');});
 parser.on('opentag',node=>{stack.push(node.local);handlers.open?.(node,stack);});
 parser.on('text',value=>handlers.text?.(value,stack));
 parser.on('cdata',value=>handlers.text?.(value,stack));
 parser.on('closetag',node=>{handlers.close?.(node,stack);stack.pop();});
 parser.write(text.replace(/^\uFEFF/,'')).close();
}
function target(base,value){
 const result=path.normalize(value.startsWith('/')?value.slice(1):path.join(path.dirname(base),value));
 if(result.startsWith('../')||result.includes('\\')||result.includes(':'))throw Error('Đường dẫn bên trong file Excel không hợp lệ.');
 return result;
}
async function part(zip,name,required=true){const entry=zip.file(name);if(!entry){if(required)throw Error('File Excel thiếu thành phần dữ liệu bắt buộc.');return '';}return entry.async('string');}
async function relationships(zip,base){
 const name=base?path.join(path.dirname(base),'_rels',path.basename(base)+'.rels'):'_rels/.rels';
 const result=new Map();
 xml(await part(zip,name),{open:node=>{
  if(node.local!=='Relationship'||attr(node,'TargetMode')==='External')return;
  result.set(attr(node,'Id'),{type:attr(node,'Type')||'',target:target(base||'root.xml',attr(node,'Target')||'')});
 }});return result;
}
function column(address){let n=0;for(const ch of address.toUpperCase())n=n*26+ch.charCodeAt(0)-64;return n;}
function coordinate(address){const match=/^([A-Z]+)(\d+)$/i.exec(address||'');return match?{col:column(match[1]),row:Number(match[2])}:null;}
async function read(buffer,maxRows){
 const zip=await JSZip.loadAsync(buffer);
 const root=await relationships(zip,'');
 const bookPath=[...root.values()].find(r=>r.type.endsWith('/officeDocument'))?.target;
 if(!bookPath)throw Error('File không phải workbook Excel hợp lệ.');
 const rels=await relationships(zip,bookPath);let sheetId,date1904=false;
 xml(await part(zip,bookPath),{open:node=>{
  if(node.local==='sheet'&&attr(node,'name')==='Nhap lieu')sheetId=attr(node,'id');
  if(node.local==='workbookPr')date1904=['1','true'].includes(attr(node,'date1904'));
 }});
 if(!sheetId||!rels.get(sheetId)?.type.endsWith('/worksheet'))throw Error('Không tìm thấy sheet Nhap lieu. Vui lòng tải file mẫu.');
 const strings=[],shared=[...rels.values()].find(r=>r.type.endsWith('/sharedStrings'));
 if(shared){let value='';xml(await part(zip,shared.target),{
  open:node=>{if(node.local==='si')value='';},
  text:(text,stack)=>{if(stack.at(-1)==='t'&&!stack.includes('rPh'))value+=text;},
  close:node=>{if(node.local==='si')strings.push(value);},
 });}
 const formats=new Map(),styleFormats=[],style=[...rels.values()].find(r=>r.type.endsWith('/styles'));
 if(style)xml(await part(zip,style.target),{open:(node,stack)=>{
  if(node.local==='numFmt')formats.set(Number(attr(node,'numFmtId')),attr(node,'formatCode')||'');
  if(node.local==='xf'&&stack.includes('cellXfs'))styleFormats.push(Number(attr(node,'numFmtId')||0));
 }});
 const isDate=style=>{const id=styleFormats[style];if((id>=14&&id<=22)||(id>=27&&id<=36)||(id>=45&&id<=47)||(id>=50&&id<=58))return true;return /[dy]/i.test((formats.get(id)||'').replace(/"[^"]*"|\\.|\[[^\]]*\]/g,''));};
 const rows=new Map(),links=[];let row,line=0,cell,position=0;
 xml(await part(zip,rels.get(sheetId).target),{
  open:(node,stack)=>{
   if(node.local==='row'){
    line=Number(attr(node,'r')||line+1);if(!Number.isInteger(line)||line<1||line>maxRows+1)throw Error('File tối đa '+maxRows+' dòng dữ liệu.');
    row=[];rows.set(line,row);position=0;
   }else if(node.local==='c'&&stack.includes('sheetData')){
    const location=coordinate(attr(node,'r'));position=location?.col||position+1;
    if(!row||position>80||location&&location.row!==line)throw Error('Cấu trúc ô Excel không hợp lệ.');
    cell={type:attr(node,'t')||'n',style:Number(attr(node,'s')||0),raw:'',inline:'',formula:false};row[position-1]=cell;
   }else if(node.local==='f'&&cell)cell.formula=true;
   else if(node.local==='hyperlink')links.push(attr(node,'ref')||'');
  },
  text:(text,stack)=>{if(!cell)return;if(stack.at(-1)==='v')cell.raw+=text;if(stack.at(-1)==='t'&&!stack.includes('rPh'))cell.inline+=text;},
  close:node=>{if(node.local==='c')cell=null;},
 });
 for(const reference of links){const [first,last]=reference.split(':'),a=coordinate(first),b=coordinate(last||first);if(!a||!b)continue;for(const [index,cells] of rows)if(index>=a.row&&index<=b.row)cells.forEach((c,i)=>{if(c&&i+1>=a.col&&i+1<=b.col)c.link=true;});}
 for(const cells of rows.values())for(const c of cells){if(!c)continue;
  if(c.type==='s'){const index=Number(c.raw);if(!Number.isInteger(index)||strings[index]===undefined)throw Error('Bảng chuỗi Excel không hợp lệ.');c.value=strings[index];}
  else if(c.type==='inlineStr')c.value=c.inline;
  else if(c.type==='b')c.value=c.raw==='1'?'true':'false';
  else if(c.type==='d')c.value=c.raw.slice(0,10);
  else if(c.raw!==''&&c.type==='n'&&isDate(c.style)){
   const date=new Date((Number(c.raw)-25569+(date1904?1462:0))*86400000);if(!Number.isFinite(date.getTime()))throw Error('Ngày Excel không hợp lệ.');c.value=date.toISOString().slice(0,10);
  }else c.value=c.raw;
  c.value=String(c.value??'').trim();
 }
 return rows;
}
module.exports={read};
