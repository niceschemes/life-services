const Ordem = require('../../models/ordens');
const Company = require('../../models/Company');
const tenantQuery = require('../../utils/tenantQuery');
const asyncHandler = require('../../utils/asyncHandler');
const pdfService = require('../../services/pdfService');

exports.ordem = asyncHandler(async (req, res) => {
  const ordem = await Ordem.findOne({ _id: req.params.id, ...tenantQuery(req) }).lean();
  if (!ordem) return res.status(404).json({ error: 'Ordem não encontrada' });

  let company = null;
  if (req.user.companyId) {
    company = await Company.findById(req.user.companyId).lean();
  }

  const buffer = await pdfService.generateOrdemPdf(ordem, company);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${ordem.codigo || 'OS'}.pdf"`);
  res.send(buffer);
});
