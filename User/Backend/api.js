const router = require('express').Router();
const {authenticate, authorizeApi} = require('../../Shared/Backend/middleware/auth');

router.use(require('./routes/website'));
router.use((req, res, next) => {
  if (req.path !== '/gio-hang' && !req.path.startsWith('/gio-hang/')) return next('router');
  next();
}, authenticate, authorizeApi);
router.use(require('./routes/gio-hang'));
module.exports = router;
