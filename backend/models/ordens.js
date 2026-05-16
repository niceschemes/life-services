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

  prioridade:{
    type:String,
    enum:["Urgente","Media","Baixa"],
    default:"Media"
  },

  tecnico:{
    type:String,
    default:""
  },

  telefone:{
    type:String,
    default:""
  },

  dataAgendada:{
    type:Date
  },

  pagamentoStatus:{
    type:String,
    enum:["Pendente","Recebido"],
    default:"Pendente"
  },

  checklist:[{
    texto:String,
    concluido:{
      type:Boolean,
      default:false
    }
  }],

  historico:[{
    data:Date,
    descricao:String
  }],

  fotos:[{
    tipo:{
      type:String,
      enum:["Antes","Depois","Geral"],
      default:"Geral"
    },
    nome:String,
    url:String,
    data:{
      type:Date,
      default:Date.now
    }
  }],

  assinaturas:{
    orcamento:String,
    os:String,
    entrega:String
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
  "Ordem",
  OrdemSchema
);
