const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/v1/paymentController');

router.post('/webhook-demo', ctrl.webhookDemo);

router.use(auth);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.patch('/:id/confirmar', ctrl.markPaid);
router.get('/subscription/mine', ctrl.subscriptionMine);
router.patch('/subscription/mine', ctrl.updateSubscription);

module.exports = router;
