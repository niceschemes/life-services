const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// conexão com banco (CORRIGIDO PARA PRODUÇÃO)
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ Mongo conectado'))
  .catch(err => console.log('❌ Erro no Mongo:', err));

// rota teste
app.get('/', (req, res) => {
  res.send('Life Services API rodando 🚀');
});

// rotas de clientes
const clientesRoutes = require('./routes/clientes');
app.use('/clientes', clientesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});