const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// conexão com banco (vamos usar depois, pode deixar assim por enquanto)
mongoose.connect('mongodb://127.0.0.1:27017/life_services')
  .then(() => console.log('Banco conectado'))
  .catch(err => console.log('Erro no banco:', err));

// rota teste
app.get('/', (req, res) => {
  res.send('Life Services API rodando 🚀');
});

// rotas de clientes (ainda vamos criar)
const clientesRoutes = require('./routes/clientes');
app.use('/clientes', clientesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});