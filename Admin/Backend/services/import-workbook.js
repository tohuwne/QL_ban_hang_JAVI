const ExcelJS = require('exceljs');
const MAX_ROWS = 500;
const header = c => c.label + (c.required ? ' *' : '');
// Inspect central-directory sizes before ExcelJS decompresses the workbook.
function checkZip(buffer){
  if(buffer.length>5*1024*1024)throw Error('File tối đa 5 MB.');
  let total=0,count=0;
  for(let i=0;i+46<=buffer.length;i++)if(buffer.readUInt32LE(i)===0x02014b50){
    total+=buffer.readUInt32LE(i+24);count++;
    if(total>30*1024*1024||count>1000)throw Error('Nội dung file Excel vượt giới hạn cho phép.');
    i+=45+buffer.readUInt16LE(i+28)+buffer.readUInt16LE(i+30)+buffer.readUInt16LE(i+32);
  }
  if(!count)throw Error('Chọn file Excel .xlsx hợp lệ.');
}
async function template(def,lookups){
 const wb=new ExcelJS.Workbook();wb.creator='JAVI COFFEE';
 const ws=wb.addWorksheet('Nhap lieu',{views:[{state:'frozen',ySplit:1}]});
 ws.addRow(def.columns.map(header));
 ws.columns=def.columns.map(c=>({width:Math.min(42,Math.max(22,c.label.length+6))}));
 ws.getRow(1).height=30;ws.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};ws.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF343B45'}};
 const lists=wb.addWorksheet('Danh muc');let listCol=0;
 def.columns.forEach((c,index)=>{
   const options=c.values || (lookups[c.key]||[]).map(r=>r.id);
   let validation;
   if(options.length){
    listCol++;lists.getCell(1,listCol).value=c.label;options.forEach((v,i)=>lists.getCell(i+2,listCol).value=String(v));
    const letter=lists.getColumn(listCol).letter;
    const name='ImportList'+listCol;wb.definedNames.add("'Danh muc'!$"+letter+'$2:$'+letter+'$'+(options.length+1),name);
    validation={type:'list',formulae:[name],error:'Chọn một giá trị trong danh sách.'};
   }else if(c.type==='number'){
    validation={type:c.integer?'whole':'decimal',operator:'between',formulae:[c.min??0,c.max??999999999999999],error:'Nhập số đúng giới hạn của cột.'};
   }else if(c.type==='date'){
    validation={type:'custom',formulae:[],error:'Nhập ngày YYYY-MM-DD hoặc chọn định dạng ngày Excel.'};
   }else if(c.max){
    validation={type:'textLength',operator:'lessThanOrEqual',formulae:[c.max],error:'Nội dung không được quá '+c.max+' ký tự.'};
   }
   for(let row=2;row<=MAX_ROWS+1;row++){
    const cell=ws.getCell(row,index+1),address=cell.address;
    let rule=validation;
    if(c.type==='date')rule={...validation,formulae:['OR(AND(ISNUMBER('+address+'),'+address+'>=1,'+address+'<=2958465),AND(ISTEXT('+address+'),LEN('+address+')=10,IFERROR(TEXT(DATE(VALUE(LEFT('+address+',4)),VALUE(MID('+address+',6,2)),VALUE(RIGHT('+address+',2))),"yyyy-mm-dd")='+address+',FALSE)))']};
    if(c.format==='phone'||c.format==='cccd'){
     const length=c.format==='phone'?10:12;
     rule={type:'custom',formulae:['AND(ISTEXT('+address+'),LEN('+address+')='+length+(c.format==='phone'?',LEFT('+address+',1)="0"':'')+',IFERROR(ISNUMBER(VALUE('+address+')),FALSE))'],error:'Nhập '+length+' chữ số dưới dạng văn bản.'};
    }
    if(rule)cell.dataValidation={...rule,allowBlank:!c.required,showErrorMessage:true,errorTitle:'Dữ liệu không hợp lệ',errorStyle:'stop'};
   }
   ws.getCell(1,index+1).note=(c.required?'Bắt buộc. ':c.requiredForNew?'Bắt buộc khi mã khách hàng để trống. ':'Không bắt buộc. ')+(c.type==='date'?'Nhập YYYY-MM-DD. ':c.type==='number'?'Nhập số thuần, không thêm ký hiệu tiền tệ. ':'Nhập dạng văn bản. ')+(c.max?'Tối đa '+c.max+'. ':'')+(c.ref?'Chọn mã trong danh sách; xem tên tương ứng ở sheet Huong dan. ':'');
   if(c.type==='text'||c.ref)ws.getColumn(index+1).numFmt='@';
 });
 lists.state='veryHidden';
 const help=wb.addWorksheet('Huong dan');help.columns=[{width:32},{width:95}];
 help.addRow(['Nhập Excel · '+def.title,'']);
 help.addRow(['Cách nhập','Điền sheet Nhap lieu, giữ nguyên tên cột; dấu * là bắt buộc. Tối đa 500 dòng.']);
 help.addRow(['Dữ liệu trùng','Chọn Bỏ qua hoặc Cập nhật ở màn hình xem trước. Ô trống khi cập nhật giữ dữ liệu cũ.']);
 help.addRow(['Mã tự sinh',def.groupBy?'Mã đơn trong file dùng gom sản phẩm; DB tự sinh mã chính thức khi lưu.':def.auto||def.document||def.generatedKey?'Để trống mã để tạo mới. Mã đã có dùng để kiểm tra trùng.':'Điền mã định danh.']);
 if(def.document)help.addRow(['Chứng từ','Chỉ tạo mới hoặc bỏ qua; chứng từ trùng không ghi đè qua Excel vì liên quan kho/công nợ.']);
 if(def.groupBy)help.addRow(['Mã đơn hàng','Các dòng cùng mã đơn tạo chung một đơn; khách hàng, nhân viên và trạng thái phải giống nhau.']);
 else if(def.table==='PHIEU_NHAP')help.addRow(['Nhóm chứng từ','Các dòng cùng Nhóm chứng từ tạo chung một chứng từ; thông tin đầu chứng từ phải giống nhau.']);
 if(def.orderCustomers){
  help.addRow(['Mã khách hàng','Nhập mã đã có bằng tay; để trống khi tạo khách mới. Không tự tạo khách theo mã nhập không tồn tại.']);
  help.addRow(['Khách hàng mới','Điền các cột KH mới theo form thêm khách hàng. SĐT đã có phải dùng mã KH tương ứng; cùng SĐT trong file chỉ tạo một khách khi thông tin thống nhất.']);
 }
 help.addRow(['Ngày tháng','Nhập YYYY-MM-DD; mã giảm giá có hiệu lực hết ngày kết thúc theo giờ Việt Nam.']);
 for(const c of def.columns)if(lookups[c.key])for(const r of lookups[c.key])help.addRow([c.label+': '+r.id,r.name]);
 help.getRow(1).font={bold:true};
 return wb.xlsx.writeBuffer();
}
async function parse(buffer,def){
 checkZip(buffer);let source;
 try{source=await require('./xlsx-import-reader').read(buffer,MAX_ROWS);}catch(error){
  if(/Cannot read properties|unexpected|unclosed|invalid character/i.test(error.message))throw Error('Không đọc được cấu trúc file Excel. Vui lòng chọn file .xlsx hợp lệ.');
  throw error;
 }
 const firstRow=source.get(1)||[];
 if(firstRow.some(cell=>cell?.formula||cell?.link))throw Error('Tiêu đề cột không được chứa công thức hoặc liên kết.');
 const actual=firstRow.map(cell=>cell?.value||'');
 if(actual.length!==def.columns.length||def.columns.some((c,i)=>actual[i]!==header(c)))throw Error('Thiếu, thừa hoặc sai tên cột. Vui lòng dùng đúng file mẫu của phân hệ.');
 const rows=[];
 for(const [i,row] of [...source].sort((a,b)=>a[0]-b[0])){
  if(i===1)continue;const values={},errors=[],cellErrors={};
  def.columns.forEach((c,j)=>{const cell=row[j];values[c.key]=cell?.value||'';const messages=[];if(cell?.formula||cell?.link)messages.push(c.label+': Không chấp nhận công thức hoặc liên kết; hãy dán giá trị thuần.');if(cell?.type==='e')messages.push(c.label+': ô chứa lỗi Excel.');if(messages.length){cellErrors[c.key]=messages;errors.push(...messages);}});
  if(Object.values(values).some(v=>v!=='')||errors.length)rows.push({line:i,values,errors,cellErrors});
 }
 if(!rows.length)throw Error('File chưa có dữ liệu.');return rows;
}
async function exportGrid(title,columns,rows){
 const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet('Danh sach');
 ws.addRow(columns);for(const row of rows)ws.addRow(row.map(v=>String(v??'')));
 ws.columns=columns.map(()=>({width:25}));ws.getRow(1).font={bold:true};ws.views=[{state:'frozen',ySplit:1}];
 return wb.xlsx.writeBuffer();
}
module.exports={template,parse,exportGrid,checkZip,MAX_ROWS};
