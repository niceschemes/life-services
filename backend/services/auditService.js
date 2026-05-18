const AuditLog = require('../models/AuditLog');

async function logAction({
  companyId,
  userId,
  action,
  module = 'system',
  entity = '',
  entityId = '',
  metadata = {},
  req
}) {
  try {
    await AuditLog.create({
      companyId: companyId || undefined,
      userId: userId || undefined,
      action,
      module,
      entity,
      entityId: entityId ? String(entityId) : '',
      metadata,
      ip: req?.ip || req?.headers?.['x-forwarded-for'] || '',
      userAgent: req?.headers?.['user-agent'] || ''
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

module.exports = { logAction };
