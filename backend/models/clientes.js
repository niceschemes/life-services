const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nome: String,
  telefone: String,
  endereco: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cliente', ClienteSchema);