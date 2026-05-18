const asyncHandler = require('../../utils/asyncHandler');
const automationService = require('../../services/automationService');

exports.list = asyncHandler(async (req, res) => {
  const rules = await automationService.list(req.user.companyId);
  res.json(rules);
});

exports.create = asyncHandler(async (req, res) => {
  const rule = await automationService.create(req.user.companyId, req.body);
  res.status(201).json(rule);
});

exports.runManual = asyncHandler(async (req, res) => {
  const executions = await automationService.runManual(req.params.id, req.user.companyId, {
    link: '/automacoes',
    requestedBy: req.user.usuario
  });
  res.json({ ok: true, executions });
});

exports.runTriggerDemo = asyncHandler(async (req, res) => {
  const results = await automationService.runByTrigger(req.body.trigger, req.user.companyId, {
    link: req.body.link || '/automacoes',
    payload: req.body.payload || {}
  });
  res.json({ ok: true, results });
});
