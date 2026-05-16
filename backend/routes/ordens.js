const express = require('express');

const router = express.Router();

const Ordem = require('../models/ordens');

const auth = require('../middleware/auth');

/* =========================
   LISTAR ORDENS
========================= */

router.get('/', auth, async (req, res) => {

  try {

    const ordens = await Ordem
      .find()
      .sort({ data: -1 });

    res.json(ordens);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Erro ao buscar ordens'
    });

  }

});

/* =========================
   BUSCAR ORDEM POR ID
========================= */

router.get('/:id', auth, async (req, res) => {

  try {

    const ordem = await Ordem.findById(
      req.params.id
    );

    if(!ordem){

      return res.status(404).json({
        error: 'Ordem não encontrada'
      });

    }

    res.json(ordem);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Erro ao buscar ordem'
    });

  }

});

/* =========================
   CRIAR ORDEM
========================= */

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

    if(
      !cliente ||
      !descricao ||
      valor === undefined
    ){

      return res.status(400).json({
        error: 'Preencha os campos obrigatórios'
      });

    }

    const novaOrdem = new Ordem({

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

      historico: historico || [],

      fotos: fotos || [],

      assinaturas: assinaturas || {},

      observacoes: observacoes || ''

    });

    await novaOrdem.save();

    res.status(201).json(novaOrdem);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Erro ao criar ordem'
    });

  }

});

/* =========================
   EDITAR ORDEM
========================= */

router.put('/:id', auth, async (req, res) => {

  try {

    const ordemAtualizada =
      await Ordem.findByIdAndUpdate(

        req.params.id,

        req.body,

        {
          new: true,
          runValidators: true
        }

      );

    if(!ordemAtualizada){

      return res.status(404).json({
        error: 'Ordem não encontrada'
      });

    }

    res.json(ordemAtualizada);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Erro ao atualizar ordem'
    });

  }

});

/* =========================
   DELETAR ORDEM
========================= */

router.delete('/:id', auth, async (req, res) => {

  try {

    const ordemDeletada =
      await Ordem.findByIdAndDelete(
        req.params.id
      );

    if(!ordemDeletada){

      return res.status(404).json({
        error: 'Ordem não encontrada'
      });

    }

    res.json({
      ok: true,
      mensagem: 'Ordem deletada'
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Erro ao deletar ordem'
    });

  }

});

module.exports = router;
