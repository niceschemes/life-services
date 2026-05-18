const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/v1/estoqueController');

router.use(auth);
router.get('/produtos', ctrl.listProdutos);
router.post('/produtos', ctrl.createProduto);
router.put('/produtos/:id', ctrl.updateProduto);
router.delete('/produtos/:id', ctrl.deleteProduto);
router.post('/produtos/:id/movimentar', ctrl.movimentar);
router.get('/movimentacoes', ctrl.historico);
router.get('/alertas', ctrl.alertas);

module.exports = router;
