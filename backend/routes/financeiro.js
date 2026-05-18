const express = require('express');
const router = express.Router();
const Financeiro = require('../models/financeiro');
const auth = require('../middleware/auth');
const tenantQuery = require('../utils/tenantQuery');

router.get('/', auth, async (req, res) => {
  try {
    const dados = await Financeiro.find(tenantQuery(req)).sort({ data: -1 });
    res.json(dados);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar financeiro' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { tipo, descricao, valor, categoria, centroCusto } = req.body;
    const novo = new Financeiro({
      tipo,
      descricao,
      valor,
      categoria,
      centroCusto,
      companyId: req.user.companyId || undefined
    });
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const removed = await Financeiro.findOneAndDelete({
      _id: req.params.id,
      ...tenantQuery(req)
    });
    if (!removed) {
      return res.status(404).json({ error: 'Lançamento não encontrado' });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});

module.exports = router;
