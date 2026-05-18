const Ordem = require('../models/ordens');

async function nextCodigo(companyId) {
  const filter = companyId ? { companyId } : {};
  const last = await Ordem.findOne(filter).sort({ numeroSequencial: -1 }).select('numeroSequencial');
  const numero = (last?.numeroSequencial || 0) + 1;
  const codigo = `OS-${String(numero).padStart(5, '0')}`;
  return { codigo, numeroSequencial: numero };
}

module.exports = { nextCodigo };
