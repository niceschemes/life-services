const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const config = require('./config');

mongoose.connect(config.mongoUrl)
.then(async () => {

  console.log("Conectado ao MongoDB");

  const senhaHash = await bcrypt.hash("123", 10);

  const usuarioExiste = await User.findOne({
    usuario: "teste"
  });

  if(usuarioExiste){

    usuarioExiste.senha = senhaHash;
    usuarioExiste.isActive = true;

    await usuarioExiste.save();

    console.log("Usuário atualizado com sucesso");

  }else{

    await User.create({

      usuario: "teste",

      senha: senhaHash,

      nome: "Administrador",

      role: "admin",

      isActive: true

    });

    console.log("Usuário criado com sucesso");

  }

  await mongoose.disconnect();

  console.log("Conexão encerrada");

})
.catch(err => {

  console.log("Erro:");

  console.log(err);

});