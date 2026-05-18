const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const Cliente = require('../models/clientes');
const tenantQuery = require('../utils/tenantQuery');
const { logAction } = require('../services/auditService');

router.use(auth);

router.post('/', async (req, res) => {
  try {
    const { nome, telefone, endereco, ...rest } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const cliente = new Cliente({
      nome,
      telefone: telefone || rest.whatsapp || '',
      endereco: endereco || '',
      companyId: req.user.companyId || undefined,
      crm: { pipeline: 'lead', etapa: 'lead', scoreComercial: 0 },
      ...rest
    });

    await cliente.save();

    await logAction({
      companyId: req.user.companyId,
      userId: req.user.id,
      action: 'cliente.created',
      module: 'clientes',
      entity: 'Cliente',
      entityId: cliente._id,
      req
    });

    res.status(201).json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find(tenantQuery(req)).sort({ createdAt: -1 });
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nome, telefone, endereco, ...rest } = req.body;
    const filter = { _id: req.params.id, ...tenantQuery(req) };

    const cliente = await Cliente.findOneAndUpdate(
      filter,
      { nome, telefone, endereco, ...rest },
      { new: true, runValidators: true }
    );

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findOneAndDelete({
      _id: req.params.id,
      ...tenantQuery(req)
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
