const {createApp} = require('../app');
const port = process.env.ADMIN_PORT || 3001;
createApp('admin').listen(port, () => console.log('Quản trị: http://localhost:' + port));
