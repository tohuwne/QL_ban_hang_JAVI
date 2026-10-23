// Physical file resolver for browser fixtures, using the production URL layout.
const fs = require('fs');
const path = require('path');
const paths = require('../Shared/Backend/config/paths');
module.exports = function frontendFile(urlPath) {
  const name = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  const candidates = [];
  if (name.startsWith('admin/')) candidates.push(path.join(paths.adminFrontend, name.slice(6)));
  if (name.startsWith('landing_page/')) candidates.push(path.join(paths.userFrontend, name.slice(13)));
  if (name.startsWith('user/')) candidates.push(path.join(paths.userFrontend, name.slice(5)));
  if (name.startsWith('admin/css/') || name.startsWith('admin/js/') || name.startsWith('admin/images/')) {
    candidates.push(path.join(paths.sharedFrontend, name.slice(6)));
  }
  for (const base of [paths.sharedFrontend, paths.userFrontend, paths.adminFrontend]) candidates.push(path.join(base, name));
  return candidates.find(file => file.startsWith(paths.root + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) || candidates[0];
};
