const express = require('express');
const router = express.Router();
const portalAuth = require('../middleware/portalAuth');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');
const ctrl = require('../controllers/v1/portalController');

router.post('/auth/login', authLimiter, ctrl.login);
router.get('/auth/me', portalAuth, ctrl.me);
router.get('/ordens', portalAuth, ctrl.ordens);
router.get('/orcamentos', portalAuth, ctrl.orcamentos);
router.post('/orcamentos/:id/aprovar', portalAuth, ctrl.aprovarOrcamento);
router.get('/tickets', portalAuth, ctrl.tickets);
router.post('/tickets', portalAuth, ctrl.criarTicket);

router.post('/admin/ativar', auth, ctrl.ativarPortal);

module.exports = router;
