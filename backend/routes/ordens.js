const express = require('express');

const router = express.Router();

const Ordem = require('../models/ordens');

const auth = require('../middleware/auth');

/* =========================
   LISTAR ORDENS
========================= */

router.get('/', auth, async (req, res) => {

  try {

    const ordens = await Ordem.find()
      .sort({ data: -1 });

    res.json(ordens);

  } catch (err) {

    res.status(500).json({
      error: 'Erro ao buscar ordens'
    });

  }

});

/* =========================
   CRIAR ORDEM
========================= */

router.post('/', auth, async (req, res) => {

  try {

    const novaOrdem = new Ordem({

      cliente: req.body.cliente,

      descricao: req.body.descricao,

      valor: req.body.valor,

      status: req.body.status,

      observacoes: req.body.observacoes

    });

    await novaOrdem.save();

    res.json(novaOrdem);

  } catch (err) {

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

        { new: true }

      );

    res.json(ordemAtualizada);

  } catch (err) {

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

    await Ordem.findByIdAndDelete(
      req.params.id
    );

    res.json({
      ok: true
    });

  } catch (err) {

    res.status(500).json({
      error: 'Erro ao deletar ordem'
    });

  }

});

module.exports = router;