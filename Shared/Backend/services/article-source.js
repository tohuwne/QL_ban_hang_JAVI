// Editorial source links are HTTPS and supplied in the published article text.
function articleSource(post){
 if(!['Bài truyền thông','Tin tức'].includes(post.ChuyenMuc))return null;
 const links=String(post.NoiDung||'').match(/https:\/\/[^\s<>"']+/g)||[];
 const link=links.at(-1);if(!link)return null;
 try{const url=new URL(link);if(url.protocol!=='https:'||url.username||url.password)return null;return url.href;}catch{return null;}
}
module.exports={articleSource};
