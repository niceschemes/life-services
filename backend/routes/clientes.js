const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const Cliente = require('../models/clientes');

router.use(auth);

/* =========================
   CRIAR CLIENTE
========================= */
router.post('/', async (req, res) => {
  try {
    const { nome, telefone, endereco } = req.body;

    // 🔥 validação simples
    if (!nome || !telefone || !endereco) {
      return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    const cliente = new Cliente({ nome, telefone, endereco });
    await cliente.save();

    res.status(201).json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   LISTAR CLIENTES
========================= */
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 });
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ATUALIZAR CLIENTE
========================= */
router.put('/:id', async (req, res) => {
  try {
    const { nome, telefone, endereco } = req.body;

    if (!nome || !telefone || !endereco) {
      return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { nome, telefone, endereco },
      { new: true }
    );

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETAR CLIENTE
========================= */
router.delete('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   EXPORT
========================= */
module.exports = router;