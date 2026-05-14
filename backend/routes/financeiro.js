const express = require("express");

const router = express.Router();

const Financeiro =
require("../models/financeiro");

const auth =
require("../middleware/auth");

/* LISTAR */

router.get("/", auth, async(req,res)=>{

  try{

    const dados =
    await Financeiro.find()
    .sort({ data:-1 });

    res.json(dados);

  }catch(err){

    res.status(500).json({
      error:"Erro ao buscar financeiro"
    });

  }

});

/* CRIAR */

router.post("/", auth, async(req,res)=>{

  try{

    const {
      tipo,
      descricao,
      valor
    } = req.body;

    const novo =
    new Financeiro({

      tipo,
      descricao,
      valor

    });

    await novo.save();

    res.status(201).json(novo);

  }catch(err){

    res.status(500).json({
      error:"Erro ao salvar"
    });

  }

});

/* DELETAR */

router.delete("/:id", auth, async(req,res)=>{

  try{

    await Financeiro.findByIdAndDelete(
      req.params.id
    );

    res.json({
      ok:true
    });

  }catch(err){

    res.status(500).json({
      error:"Erro ao deletar"
    });

  }

});

module.exports = router;