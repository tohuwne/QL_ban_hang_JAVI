const app = require('../app');
const port = process.env.USER_PORT || 3000;
require('../Shared/Backend/services/order-email').startEmailWorker();
app.listen(port, () => console.log('Cửa hàng: http://localhost:' + port));
