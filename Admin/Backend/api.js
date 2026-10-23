const router = require('express').Router();
const {authenticate, authorizeApi} = require('../../Shared/Backend/middleware/auth');

// Configuration/import routers enforce their own scoped permissions.
router.use(require('./routes/commerce-config'));
router.use(require('./routes/website'));
router.use(require('./routes/excel'));
router.use(authenticate, authorizeApi);
router.use(require('./routes/product-options'));
for (const moduleName of ['san-pham', 'kho', 'ban-hang', 'ke-toan', 'khach-hang', 'nhan-vien', 'dashboard', 'quan-tri']) {
  router.use(require('./routes/' + moduleName));
}
module.exports = router;
