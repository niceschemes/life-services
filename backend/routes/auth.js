const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authLimiter } = require('../middleware/security');

router.post('/register', async (req, res) => {
  try {
    const result = req.body.empresaNome
      ? await authService.registerEnterprise(req.body, req)
      : await authService.registerLegacy(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const result = await authService.login(req.body, req);
    if (result.token && !result.refreshToken) {
      return res.json({ token: result.token });
    }
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
