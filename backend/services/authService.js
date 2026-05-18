const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const config = require('../config');
const { permissionsForRole, ROLES } = require('../config/permissions');
const slugify = require('../utils/slugify');
const { logAction } = require('./auditService');
const securityService = require('./securityService');

function signAccessToken(user) {
  return jwt.sign(
    {
      id: user._id,
      usuario: user.usuario,
      nome: user.nome,
      role: user.role,
      companyId: user.companyId || null
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user._id, type: 'refresh' },
    config.jwtSecret,
    { expiresIn: config.refreshExpiresIn }
  );
}

async function registerLegacy({ usuario, senha }) {
  const existe = await User.findOne({ usuario, companyId: { $exists: false } });
  if (existe) {
    const err = new Error('Usuário já existe');
    err.status = 400;
    throw err;
  }

  const hash = await bcrypt.hash(senha, 10);
  const user = await User.create({
    usuario,
    senha: hash,
    role: ROLES.ADMIN
  });

  return { message: 'Usuário criado com sucesso', userId: user._id };
}

async function registerEnterprise(payload, req) {
  const {
    empresaNome,
    empresaSlug,
    cnpj,
    email,
    adminUsuario,
    adminSenha,
    adminNome,
    adminEmail
  } = payload;

  if (!empresaNome || !adminUsuario || !adminSenha) {
    const err = new Error('Preencha empresa, usuário e senha do administrador');
    err.status = 400;
    throw err;
  }

  let slug = empresaSlug ? slugify(empresaSlug) : slugify(empresaNome);
  const slugExists = await Company.findOne({ slug });
  if (slugExists) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const company = await Company.create({
    nome: empresaNome,
    slug,
    cnpj: cnpj || '',
    email: email || ''
  });

  const hash = await bcrypt.hash(adminSenha, 10);
  const user = await User.create({
    usuario: adminUsuario,
    email: adminEmail || '',
    nome: adminNome || adminUsuario,
    senha: hash,
    role: ROLES.ADMIN,
    companyId: company._id
  });

  await logAction({
    companyId: company._id,
    userId: user._id,
    action: 'company.created',
    module: 'empresas',
    entity: 'Company',
    entityId: company._id,
    req
  });

  const token = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  return {
    token,
    refreshToken,
    user: sanitizeUser(user),
    company,
    permissions: permissionsForRole(user.role)
  };
}

async function login({ usuario, senha, companySlug, twoFactorCode }, req) {
  let user;

  if (companySlug) {
    const company = await Company.findOne({ slug: slugify(companySlug), isActive: true });
    if (!company) {
      const err = new Error('Empresa não encontrada');
      err.status = 404;
      throw err;
    }
    user = await User.findOne({ usuario, companyId: company._id, isActive: true });
  } else {
    user = await User.findOne({ usuario, isActive: true });
  }

  if (!user) {
    const err = new Error('Usuário não encontrado');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(senha, user.senha);
  if (!ok) {
    const err = new Error('Senha inválida');
    err.status = 401;
    throw err;
  }

  if (user.twoFactor?.enabled) {
    if (!twoFactorCode) {
      const demoCode = await securityService.generateLoginTwoFactor(user);
      return {
        requiresTwoFactor: true,
        message: 'Código 2FA obrigatório',
        // Demonstração acadêmica: em produção, não retornar o código.
        demoCode
      };
    }

    if (!securityService.isLoginTwoFactorValid(user, twoFactorCode)) {
      const err = new Error('Código 2FA inválido');
      err.status = 401;
      throw err;
    }

    user.twoFactor.lastCode = '';
  }

  user.lastLogin = new Date();
  const refreshToken = signRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  const token = signAccessToken(user);
  let company = null;
  if (user.companyId) {
    company = await Company.findById(user.companyId).lean();
  }

  await logAction({
    companyId: user.companyId,
    userId: user._id,
    action: 'auth.login',
    module: 'auth',
    req
  });

  return {
    token,
    refreshToken,
    user: sanitizeUser(user),
    company,
    permissions: user.permissions?.length
      ? user.permissions
      : permissionsForRole(user.role)
  };
}

function sanitizeUser(user) {
  return {
    id: user._id,
    usuario: user.usuario,
    nome: user.nome,
    email: user.email,
    role: user.role,
    companyId: user.companyId || null,
    avatar: user.avatar
  };
}

module.exports = {
  signAccessToken,
  registerLegacy,
  registerEnterprise,
  login,
  sanitizeUser
};
