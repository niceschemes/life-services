const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Cliente = require('./models/clientes');
const Servico = require('./models/servico');
const Ordem = require('./models/ordens');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/life_services';

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('Mongo conectado');
  })
  .catch((err) => {
    console.error('Erro no Mongo:', err.message);
  });

app.use('/clientes', require('./routes/clientes'));
app.use('/auth', require('./routes/auth'));
app.use('/servicos', require('./routes/servicos'));
app.use('/ordens', require('./routes/ordens'));
app.use('/financeiro', require('./routes/financeiro'));

app.get('/dashboard', async (req, res) => {
  try {
    const clientes = await Cliente.countDocuments();
    const servicos = await Servico.countDocuments();
    const ordens = await Ordem.countDocuments();
    const abertas = await Ordem.countDocuments({
      status: { $in: ['Pendente', 'Em andamento'] }
    });

    res.json({
      clientes,
      servicos,
      ordens,
      abertas
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});
