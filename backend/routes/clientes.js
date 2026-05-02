const express = require('express');
const router = express.Router();
const Cliente = require('../models/clientes');

// criar cliente
router.post('/', async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// listar clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// deletar cliente
router.delete('/:id', async (req, res) => {
  try {
    await Cliente.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cliente deletado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👇 SEMPRE NO FINAL
module.exports = router;