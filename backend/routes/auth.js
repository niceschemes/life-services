const express = require('express');
const router = express.Router();

const USER = "admin";
const PASS = "123";

router.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  if (usuario === USER && senha === PASS) {
    return res.json({ token: "token123" });
  }

  res.status(401).json({ error: "Credenciais inválidas" });
});

module.exports = router;