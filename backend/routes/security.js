const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/v1/securityController');

router.post('/password/request-reset', ctrl.requestPasswordReset);
router.post('/password/reset', ctrl.resetPassword);

router.post('/2fa/setup', auth, ctrl.setupTwoFactor);
router.post('/2fa/verify', auth, ctrl.verifyTwoFactor);

module.exports = router;
