const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth');
const { authLimiter } = require('../../../middleware/security');

const authController = require('../../../controllers/v1/authController');
const companyController = require('../../../controllers/v1/companyController');
const dashboardController = require('../../../controllers/v1/dashboardController');
const aiController = require('../../../controllers/v1/aiController');
const orcamentoController = require('../../../controllers/v1/orcamentoController');
const estoqueController = require('../../../controllers/v1/estoqueController');
const crmController = require('../../../controllers/v1/crmController');
const pdfController = require('../../../controllers/v1/pdfController');
const paymentController = require('../../../controllers/v1/paymentController');
const securityController = require('../../../controllers/v1/securityController');
const automationController = require('../../../controllers/v1/automationController');
const masterController = require('../../../controllers/v1/masterController');
const rbac = require('../../../middleware/rbac');

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    product: 'Life Services Enterprise',
    version: '2.3.0',
    timestamp: new Date().toISOString()
  });
});

router.post('/auth/register', authController.register);
router.post('/auth/login', authLimiter, authController.login);
router.get('/auth/me', auth, authController.me);

router.get('/companies', auth, rbac('master'), companyController.list);
router.get('/companies/mine', auth, companyController.getMine);
router.patch('/companies/branding', auth, rbac('empresas'), companyController.updateBranding);

router.get('/dashboard/executive', auth, rbac('dashboard'), dashboardController.executive);

router.post('/ai/assistant', auth, rbac('ia'), aiController.assistant);
router.post('/ai/generate-description', auth, rbac('ia'), aiController.generateDescription);

router.get('/orcamentos', auth, rbac('orcamentos'), orcamentoController.list);
router.post('/orcamentos', auth, rbac('orcamentos'), orcamentoController.create);
router.get('/orcamentos/:id', auth, rbac('orcamentos'), orcamentoController.getById);
router.put('/orcamentos/:id', auth, rbac('orcamentos'), orcamentoController.update);
router.delete('/orcamentos/:id', auth, rbac('orcamentos'), orcamentoController.remove);
router.post('/orcamentos/:id/duplicar', auth, rbac('orcamentos'), orcamentoController.duplicate);
router.post('/orcamentos/:id/enviar', auth, rbac('orcamentos'), orcamentoController.send);
router.post('/orcamentos/:id/aprovar', auth, rbac('orcamentos'), orcamentoController.approve);
router.post('/orcamentos/:id/rejeitar', auth, rbac('orcamentos'), orcamentoController.reject);
router.post('/orcamentos/:id/converter-os', auth, rbac('orcamentos'), orcamentoController.convertToOS);
router.get('/orcamentos/:id/pdf', auth, rbac('orcamentos'), orcamentoController.pdf);

router.get('/estoque/produtos', auth, rbac('estoque'), estoqueController.listProdutos);
router.post('/estoque/produtos', auth, rbac('estoque'), estoqueController.createProduto);
router.put('/estoque/produtos/:id', auth, rbac('estoque'), estoqueController.updateProduto);
router.delete('/estoque/produtos/:id', auth, rbac('estoque'), estoqueController.deleteProduto);
router.post('/estoque/produtos/:id/movimentar', auth, rbac('estoque'), estoqueController.movimentar);
router.get('/estoque/movimentacoes', auth, rbac('estoque'), estoqueController.historico);
router.get('/estoque/alertas', auth, rbac('estoque'), estoqueController.alertas);

router.get('/crm/pipeline', auth, rbac('crm'), crmController.pipeline);
router.patch('/crm/clientes/:clienteId/etapa', auth, rbac('crm'), crmController.mover);
router.post('/crm/clientes/:clienteId/followup', auth, rbac('crm'), crmController.followUp);

router.get('/pdf/ordens/:id', auth, rbac('ordens'), pdfController.ordem);

router.get('/payments', auth, rbac('financeiro'), paymentController.list);
router.post('/payments', auth, rbac('financeiro'), paymentController.create);
router.patch('/payments/:id/confirmar', auth, rbac('financeiro'), paymentController.markPaid);
router.get('/subscription/mine', auth, paymentController.subscriptionMine);
router.patch('/subscription/mine', auth, rbac('empresas'), paymentController.updateSubscription);

router.post('/security/password/request-reset', securityController.requestPasswordReset);
router.post('/security/password/reset', securityController.resetPassword);
router.post('/security/2fa/setup', auth, securityController.setupTwoFactor);
router.post('/security/2fa/verify', auth, securityController.verifyTwoFactor);

router.get('/automations', auth, rbac('automacoes'), automationController.list);
router.post('/automations', auth, rbac('automacoes'), automationController.create);
router.post('/automations/:id/run', auth, rbac('automacoes'), automationController.runManual);
router.post('/automations/run-trigger-demo', auth, rbac('automacoes'), automationController.runTriggerDemo);

router.get('/master/overview', auth, rbac('master'), masterController.overview);
router.get('/master/companies', auth, rbac('master'), masterController.companies);

module.exports = router;
