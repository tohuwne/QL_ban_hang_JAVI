// Compose shared authentication, customer APIs and administration APIs in that order.
const router = require('express').Router();
router.use(require('./Shared/Backend/routes/auth'));
router.use(require('./User/Backend/api'));
router.use(require('./Admin/Backend/api'));
module.exports = router;
