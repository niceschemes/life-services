const mongoose = require("mongoose");

const FinanceiroSchema = new mongoose.Schema({

  tipo:{
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

  data:{
    type:Date,
    default:Date.now
  }

});

module.exports = mongoose.model(
  "Financeiro",
  FinanceiroSchema
);