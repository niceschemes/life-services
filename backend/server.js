const path = require('path');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const {
  apiLimiter,
  sanitizeBody,
  securityHeaders
} = require('./middleware/security');
const { initSocket } = require('./services/socketService');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(securityHeaders);
app.use(sanitizeBody);
app.use('/api', apiLimiter);

app.use(express.static(path.join(__dirname, 'frontend')));

mongoose.connect(config.mongoUrl)
  .then(() => console.log('Mongo conectado'))
  .catch((err) => console.error('Erro no Mongo:', err.message));

initSocket(server);

app.use('/api/v1', require('./routes/api/v1'));

app.use('/clientes', require('./routes/clientes'));
app.use('/auth', require('./routes/auth'));
app.use('/servicos', require('./routes/servicos'));
app.use('/ordens', require('./routes/ordens'));
app.use('/financeiro', require('./routes/financeiro'));
app.use('/orcamentos', require('./routes/orcamentos'));
app.use('/estoque', require('./routes/estoque'));
app.use('/crm', require('./routes/crm'));
app.use('/notifications', require('./routes/notifications'));
app.use('/chat', require('./routes/chat'));
app.use('/portal', require('./routes/portal'));

const Cliente = require('./models/clientes');
const Servico = require('./models/servico');
const Ordem = require('./models/ordens');

app.get('/dashboard', async (req, res) => {
  try {
    const clientes = await Cliente.countDocuments();
    const servicos = await Servico.countDocuments();
    const ordens = await Ordem.countDocuments();
    const abertas = await Ordem.countDocuments({
      status: { $in: ['Pendente', 'Em andamento', 'Aguardando cliente', 'Aguardando peça'] }
    });
    res.json({ clientes, servicos, ordens, abertas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'portal-cliente.html'));
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Erro interno do servidor'
  });
});

server.listen(config.port, () => {
  console.log(`Life Services Enterprise v2.2 — porta ${config.port} (HTTP + WebSocket)`);
});
