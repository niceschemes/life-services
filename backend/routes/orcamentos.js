const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/v1/orcamentoController');

router.use(auth);
router.get('/', ctrl.list);
router.get('/:id/pdf', ctrl.pdf);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.post('/:id/duplicar', ctrl.duplicate);
router.post('/:id/enviar', ctrl.send);
router.post('/:id/aprovar', ctrl.approve);
router.post('/:id/rejeitar', ctrl.reject);
router.post('/:id/converter-os', ctrl.convertToOS);
router.delete('/:id', ctrl.remove);

module.exports = router;
