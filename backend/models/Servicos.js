const mongoose = require('mongoose');

const ServicoSchema = new mongoose.Schema({

  cliente:{
    type:String,
    required:true
  },

  descricao:{
    type:String,
    required:true
  },

  valor:{
    type:Number,
    required:true
  },

  status:{
    type:String,
    default:"Pendente"
  },

  data:{
    type:Date,
    default:Date.now
  }

});

module.exports = mongoose.model(
  'Servico',
  ServicoSchema
);