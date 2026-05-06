const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// 🔐 REGISTRO
router.post('/register', async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    const existe = await User.findOne({ usuario });
    if (existe) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    const hash = await bcrypt.hash(senha, 10);

    const novoUser = new User({
      usuario,
      senha: hash
    });

    await novoUser.save();

    res.json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔐 LOGIN
router.post('/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    const user = await User.findOne({ usuario });
    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) {
      return res.status(401).json({ error: "Senha inválida" });
    }

const token = jwt.sign(
  { id: user._id, usuario: user.usuario },
  "segredo123",
  { expiresIn: "1d" }
);

res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;