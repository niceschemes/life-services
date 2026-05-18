const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const ctrl = require('../controllers/v1/automationController');

router.use(auth, rbac('automacoes'));
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.post('/run-trigger-demo', ctrl.runTriggerDemo);
router.post('/:id/run', ctrl.runManual);

module.exports = router;
