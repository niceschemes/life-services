const Company = require('../../models/Company');
const User = require('../../models/User');
const asyncHandler = require('../../utils/asyncHandler');
const { ROLES } = require('../../config/permissions');
const { logAction } = require('../../services/auditService');

exports.list = asyncHandler(async (req, res) => {
  if (req.user.role !== ROLES.SUPER_ADMIN) {
    return res.status(403).json({ error: 'Apenas super admin' });
  }

  const companies = await Company.find().sort({ createdAt: -1 }).lean();
  const metrics = await Promise.all(companies.map(async (c) => {
    const users = await User.countDocuments({ companyId: c._id });
    return { ...c, usersAtivos: users };
  }));

  res.json(metrics);
});

exports.getMine = asyncHandler(async (req, res) => {
  if (!req.user.companyId) {
    return res.status(404).json({ error: 'Empresa não vinculada' });
  }
  const company = await Company.findById(req.user.companyId).lean();
  if (!company) {
    return res.status(404).json({ error: 'Empresa não encontrada' });
  }
  res.json(company);
});

exports.updateBranding = asyncHandler(async (req, res) => {
  if (!req.user.companyId) {
    return res.status(403).json({ error: 'Sem empresa' });
  }

  const company = await Company.findByIdAndUpdate(
    req.user.companyId,
    {
      branding: req.body.branding,
      nome: req.body.nome || undefined,
      whatsapp: req.body.whatsapp || undefined
    },
    { new: true }
  );

  await logAction({
    companyId: company._id,
    userId: req.user.id,
    action: 'company.branding_updated',
    module: 'empresas',
    entity: 'Company',
    entityId: company._id,
    req
  });

  res.json(company);
});
