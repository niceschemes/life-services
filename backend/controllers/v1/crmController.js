const crmService = require('../../services/crmService');
const asyncHandler = require('../../utils/asyncHandler');

exports.pipeline = asyncHandler(async (req, res) => {
  const data = await crmService.getPipeline(req.user.companyId);
  res.json(data);
});

exports.mover = asyncHandler(async (req, res) => {
  const cliente = await crmService.moverEtapa(
    req.params.clienteId,
    req.body.etapa,
    req.user.usuario,
    req.user.companyId
  );
  res.json(cliente);
});

exports.followUp = asyncHandler(async (req, res) => {
  const cliente = await crmService.registrarFollowUp(
    req.params.clienteId,
    req.body.nota,
    req.user.usuario,
    req.user.companyId
  );
  res.json(cliente);
});
