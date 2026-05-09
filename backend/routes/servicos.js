const express = require('express');

const router = express.Router();

const Servico = require('../models/Servico');

/* =========================
   LISTAR
========================= */

router.get('/', async (req, res) => {

  try {

    const servicos = await Servico.find()
      .sort({ data:-1 });

    res.json(servicos);

  } catch(err) {

    res.status(500).json({
      error:'Erro ao buscar serviços'
    });

  }

});

/* =========================
   CADASTRAR
========================= */

router.post('/', async (req, res) => {

  try {

    const novoServico =
      await Servico.create(req.body);

    res.status(201).json(novoServico);

  } catch(err) {

    res.status(400).json({
      error:'Erro ao cadastrar serviço'
    });

  }

});

/* =========================
   EDITAR
========================= */

router.put('/:id', async (req, res) => {

  try {

    const servico =
      await Servico.findByIdAndUpdate(

        req.params.id,

        req.body,

        { new:true }

      );

    res.json(servico);

  } catch(err) {

    res.status(400).json({
      error:'Erro ao atualizar serviço'
    });

  }

});

/* =========================
   DELETAR
========================= */

router.delete('/:id', async (req, res) => {

  try {

    await Servico.findByIdAndDelete(
      req.params.id
    );

    res.json({
      ok:true
    });

  } catch(err) {

    res.status(400).json({
      error:'Erro ao remover serviço'
    });

  }

});

module.exports = router;