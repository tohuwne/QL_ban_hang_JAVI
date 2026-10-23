const {fork} = require('child_process');
const path = require('path');
require('dotenv').config({path: path.join(__dirname, '.env'), quiet: true});
if (Number(process.env.USER_PORT || 3000) === Number(process.env.ADMIN_PORT || 3001)) throw new Error('USER_PORT và ADMIN_PORT phải khác nhau.');
const children = ['User/server.js', 'Admin/server.js'].map(file => fork(path.join(__dirname, file), [], {stdio: 'inherit'}));
let stopping = false;
function stop(code = 0) {
 if (stopping) return;
 stopping = true;
 children.forEach(child => child.kill());
 process.exitCode = code;
}
children.forEach(child => {
 child.on('error', err => {console.error(err); stop(1);});
 child.on('exit', code => stop(code || 0));
});
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
