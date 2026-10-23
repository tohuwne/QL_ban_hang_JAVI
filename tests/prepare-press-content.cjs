const fs=require('fs');const articles=require('../docs/data/BAI_BAO_JAVI.json');
const literal=s=>"N'"+s.replace(/'/g,"''")+"'";
const sql=articles.map(a=>{const content=a.body+'\n\nNguồn: '+a.publisher+'\nNgày đăng bài gốc: '+a.date.slice(0,10).split('-').reverse().join('/')+'\n\nBản tóm tắt biên soạn cho Góc JAVI. Đọc đầy đủ tại nguồn:\n'+a.url;return `IF NOT EXISTS(SELECT 1 FROM WEB_BAI_VIET WHERE Slug=${literal(a.slug)})
 INSERT INTO WEB_BAI_VIET(TieuDe,Slug,ChuyenMuc,TomTat,NoiDung,AnhBia,TrangThai,NgayDang)
 VALUES(${[a.title,a.slug,'Bài truyền thông',a.summary,content,'/images/press/'+a.image,'Đã xuất bản',a.date].map(literal).join(',')});`;}).join('\n');
fs.writeFileSync('docs/sql/WEBSITE_BAO_CHI.sql',sql+'\n');
const db='database.sql';let s=fs.readFileSync(db,'utf8');const marker='-- Verified JAVI press collection';if(s.includes(marker))s=s.slice(0,s.indexOf(marker));fs.writeFileSync(db,s+'\n'+marker+'\n'+sql+'\nGO\n');
console.log('Prepared '+articles.length+' verified articles.');
