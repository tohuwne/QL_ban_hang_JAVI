const transitions={
 'Chờ lấy hàng':['Đang giao hàng','Hủy xuất kho'],
 'Đang xử lý':['Đang giao hàng','Hủy xuất kho'],
 'Đang giao hàng':['Đã giao hàng','Giao thành công','Giao hàng không thành công'],
 'Giao hàng không thành công':['Chờ lấy hàng','Hủy xuất kho'],
 'Đã giao hàng':[], 'Giao thành công':[], 'Hủy xuất kho':[]
};
function canTransition(from,to){return Object.hasOwn(transitions,from)&&(from===to||transitions[from].includes(to));}
module.exports={canTransition};
