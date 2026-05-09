const mongoose = require("mongoose");

const OrdemSchema = new mongoose.Schema({

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

  observacoes:{
    type:String,
    default:""
  },

  data:{
    type:Date,
    default:Date.now
  }

});

module.exports = mongoose.model(
  "ordens",
  OrdemSchema
);