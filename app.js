const path = require('path');
const express = require('express');
const paths = require('./Shared/Backend/config/paths');
require('dotenv').config({path: paths.env, quiet: true});
function createApp(mode = 'user') {
const admin = mode === 'admin';
const app = express();
app.locals.loginMode = admin ? 'admin' : 'customer';
app.get('/runtime-config.js', (_req, res) => res.type('js').send('window.JAVI_RUNTIME=' + JSON.stringify({mode, shopUrl: process.env.USER_ORIGIN || 'http://localhost:' + (process.env.USER_PORT || 3000)}).replace(/</g, '\u003c') + ';'));
app.get('/shop', (_req, res) => res.redirect(admin ? (process.env.USER_ORIGIN || 'http://localhost:' + (process.env.USER_PORT || 3000)) : '/landing_page/mua-hang.html'));
// Admin login: serve dedicated admin-login.html; redirect legacy URLs.
app.get(['/login.html', '/landing_page/login.html', '/user/login.html'], (req, res, next) => {
  if (admin) return res.redirect('/admin/login.html');
  next();
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (/\.(?:html|js|css)$/.test(req.path) || req.path === '/') {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  }
  next();
});
app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({extended: true}));

const {schema, importModules} = require('./Admin/Backend/services/import-schema');
app.get(['/admin/import-:module.html', '/import-:module.html'], (req, res, next) => {
  if (importModules.has(req.params.module)) return next();
  const definition = Object.hasOwn(schema, req.params.module) ? schema[req.params.module] : null;
  if (!definition) return res.sendStatus(404);
  res.redirect('/admin/' + (definition.page || req.params.module) + '.html');
});

// Explicit assets for each frontend; legacy /css and /js URLs remain compatible.
for (const folder of ['css', 'js']) {
  if (admin) app.use('/admin/' + folder, express.static(path.join(paths.adminFrontend, folder)));
  app.use('/admin/' + folder, express.static(path.join(paths.sharedFrontend, folder)));
  app.use('/user/' + folder, express.static(path.join(paths.userFrontend, folder)));
  for (const frontend of [paths.sharedFrontend, paths.userFrontend, ...(admin ? [paths.adminFrontend] : [])]) {
    app.use('/' + folder, express.static(path.join(frontend, folder)));
  }
}
for (const folder of ['images', 'vendor']) {
  app.use('/' + folder, express.static(path.join(paths.sharedFrontend, folder)));
  app.use('/admin/' + folder, express.static(path.join(paths.sharedFrontend, folder)));
}
app.get('/admin/js/auth.js', (_req, res) => res.sendFile(path.join(paths.adminFrontend, 'js/auth.js')));
// Admin login: dedicated page (no Google, no register, no back-to-shop link).
app.get('/admin/login.html', (req, res) => {
  if (admin) return res.sendFile(path.join(paths.adminFrontend, 'admin-login.html'));
  res.redirect('/landing_page/login.html');
});
app.get('/admin/mua-hang.html', (_req, res) => res.redirect('/shop'));
if (admin) app.use('/admin', express.static(paths.adminFrontend));
if (!admin) app.get('/san-pham/:id.html', (_req, res) => res.sendFile(path.join(paths.userFrontend, 'chi-tiet-san-pham.html')));
app.use('/landing_page', express.static(paths.userFrontend));
app.use('/user', express.static(paths.userFrontend));
// Backups contain private data and are not served as public assets.

app.get('/', (_req, res) => admin ? res.redirect('/admin/login.html') : res.sendFile(path.join(paths.userFrontend, 'mua-hang.html')));
// Old root-level HTML links still resolve without exposing backend source.
if (admin) app.use(express.static(paths.adminFrontend, {index: false}));
app.use(express.static(paths.userFrontend, {index: false}));
app.use('/api', require('./Shared/Backend/routes/auth'));
app.use('/api', require('./User/Backend/api'));
if (admin) app.use('/api', require('./Admin/Backend/api'));
app.use('/api', (_req, res) => res.status(404).json({success: false, message: 'API không tồn tại.'}));
app.use('/api', (err, _req, res, _next) => res.status(err.status || 400).json({
  success: false,
  message: err.type === 'entity.too.large' ? 'File hoặc dữ liệu vượt dung lượng cho phép.' : 'Không xử lý được yêu cầu API.',
}));
return app;
}
module.exports = createApp();
module.exports.createApp = createApp;
