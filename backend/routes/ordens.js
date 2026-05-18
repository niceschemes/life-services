const express = require('express');
const router = express.Router();
const Ordem = require('../models/ordens');
const auth = require('../middleware/auth');
const tenantQuery = require('../utils/tenantQuery');
const { nextCodigo } = require('../services/ordemService');
const { logAction } = require('../services/auditService');

router.get('/', auth, async (req, res) => {
  try {
    const ordens = await Ordem.find(tenantQuery(req)).sort({ data: -1 });
    res.json(ordens);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar ordens' });
  }
});

router.get('/:id/pdf', auth, async (req, res, next) => {
  try {
    const pdfController = require('../controllers/v1/pdfController');
    return pdfController.ordem(req, res, next);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const ordem = await Ordem.findOne({
      _id: req.params.id,
      ...tenantQuery(req)
    });

    if (!ordem) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }

    res.json(ordem);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar ordem' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const {
      cliente,
      descricao,
      valor,
      status,
      prioridade,
      tecnico,
      telefone,
      dataAgendada,
      pagamentoStatus,
      checklist,
      historico,
      fotos,
      assinaturas,
      observacoes
    } = req.body;

    if (!cliente || !descricao || valor === undefined) {
      return res.status(400).json({ error: 'Preencha os campos obrigatórios' });
    }

    const { codigo, numeroSequencial } = await nextCodigo(req.user.companyId);

    const novaOrdem = new Ordem({
      companyId: req.user.companyId || undefined,
      codigo,
      numeroSequencial,
      cliente,
      descricao,
      valor,
      status: status || 'Pendente',
      prioridade: prioridade || 'Media',
      tecnico: tecnico || '',
      telefone: telefone || '',
      dataAgendada: dataAgendada || undefined,
      pagamentoStatus: pagamentoStatus || 'Pendente',
      checklist: checklist || [],
      historico: historico || [{
        data: new Date(),
        descricao: 'Ordem criada',
        usuario: req.user.usuario || 'sistema'
      }],
      timeline: [{
        data: new Date(),
        acao: 'created',
        usuario: req.user.usuario || 'sistema',
        detalhes: { status: status || 'Pendente' }
      }],
      fotos: fotos || [],
      assinaturas: assinaturas || {},
      observacoes: observacoes || ''
    });

    await novaOrdem.save();

    await logAction({
      companyId: req.user.companyId,
      userId: req.user.id,
      action: 'ordem.created',
      module: 'ordens',
      entity: 'Ordem',
      entityId: novaOrdem._id,
      req
    });

    const notificationService = require('../services/notificationService');
    await notificationService.criar({
      companyId: req.user.companyId,
      userId: req.user.id,
      tipo: 'info',
      titulo: 'Nova ordem de serviço',
      mensagem: `${novaOrdem.codigo} — ${novaOrdem.cliente}`,
      link: '/ordens',
      broadcastCompany: true
    });

    res.status(201).json(novaOrdem);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Erro ao criar ordem' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const atual = await Ordem.findOne({ _id: req.params.id, ...tenantQuery(req) });
    if (!atual) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }

    const timeline = atual.timeline || [];
    if (req.body.status && req.body.status !== atual.status) {
      timeline.push({
        data: new Date(),
        acao: 'status_changed',
        usuario: req.user.usuario || 'sistema',
        detalhes: { de: atual.status, para: req.body.status }
      });
    }

    const ordemAtualizada = await Ordem.findByIdAndUpdate(
      req.params.id,
      { ...req.body, timeline },
      { new: true, runValidators: true }
    );

    res.json(ordemAtualizada);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar ordem' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const ordemDeletada = await Ordem.findOneAndDelete({
      _id: req.params.id,
      ...tenantQuery(req)
    });

    if (!ordemDeletada) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }

    res.json({ ok: true, mensagem: 'Ordem deletada' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar ordem' });
  }
});

module.exports = router;
