const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/v1/crmController');

router.use(auth);
router.get('/pipeline', ctrl.pipeline);
router.patch('/clientes/:clienteId/etapa', ctrl.mover);
router.post('/clientes/:clienteId/followup', ctrl.followUp);

module.exports = router;
