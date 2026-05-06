const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   FRONTEND (PAINEL)
========================= */
app.use(express.static(path.join(__dirname, 'frontend')));

/* =========================
   BANCO DE DADOS
========================= */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ Mongo conectado'))
  .catch(err => console.log('❌ Erro no Mongo:', err));

/* =========================
   ROTAS API
========================= */
const clientesRoutes = require('./routes/clientes');
app.use('/clientes', clientesRoutes);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

/* =========================
   ROTA FRONTEND (IMPORTANTE)
========================= */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

/* =========================
   PORTA
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});