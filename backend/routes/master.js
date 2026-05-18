const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const ctrl = require('../controllers/v1/masterController');

router.use(auth, rbac('master'));
router.get('/overview', ctrl.overview);
router.get('/companies', ctrl.companies);

module.exports = router;
