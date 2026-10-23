const path = require('path');
const root = path.resolve(__dirname, '../../..');
module.exports = Object.freeze({
  root,
  adminFrontend: path.join(root, 'Admin/Frontend'),
  userFrontend: path.join(root, 'User/Frontend'),
  sharedFrontend: path.join(root, 'Shared/Frontend'),
  backups: path.join(root, 'Admin/Backend/storage/backups'),
  env: path.join(root, '.env'),
});
