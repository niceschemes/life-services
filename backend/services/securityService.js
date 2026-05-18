const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const { logAction } = require('./auditService');

function makeCode() {
  return String(crypto.randomInt(100000, 999999));
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function setupTwoFactor(userId, req) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('Usuário não encontrado');
    err.status = 404;
    throw err;
  }

  const code = makeCode();
  user.twoFactor = {
    enabled: false,
    secret: crypto.randomBytes(20).toString('hex'),
    lastCode: code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  };
  await user.save();

  await logAction({
    companyId: user.companyId,
    userId: user._id,
    action: 'security.2fa_setup_started',
    module: 'usuarios',
    req
  });

  return {
    message: 'Código 2FA gerado (demo). Em produção, envie por app autenticador/e-mail.',
    demoCode: code,
    expiresAt: user.twoFactor.expiresAt
  };
}

async function verifyTwoFactor(userId, code, req) {
  const user = await User.findById(userId);
  if (!user || !user.twoFactor?.lastCode) {
    const err = new Error('2FA não configurado');
    err.status = 400;
    throw err;
  }

  if (user.twoFactor.expiresAt < new Date() || user.twoFactor.lastCode !== String(code)) {
    const err = new Error('Código 2FA inválido ou expirado');
    err.status = 400;
    throw err;
  }

  user.twoFactor.enabled = true;
  user.twoFactor.lastCode = '';
  await user.save();

  await logAction({
    companyId: user.companyId,
    userId: user._id,
    action: 'security.2fa_enabled',
    module: 'usuarios',
    req
  });

  return { ok: true, message: '2FA ativado' };
}

async function generateLoginTwoFactor(user) {
  const code = makeCode();
  user.twoFactor.lastCode = code;
  user.twoFactor.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  return code;
}

function isLoginTwoFactorValid(user, code) {
  return Boolean(
    user.twoFactor?.enabled &&
    user.twoFactor?.lastCode &&
    user.twoFactor?.expiresAt > new Date() &&
    user.twoFactor?.lastCode === String(code)
  );
}

async function requestPasswordReset(usuarioOuEmail) {
  const user = await User.findOne({
    $or: [
      { usuario: usuarioOuEmail },
      { email: String(usuarioOuEmail || '').toLowerCase() }
    ],
    isActive: true
  });

  if (!user) {
    return {
      message: 'Se o usuário existir, um link de recuperação será enviado.'
    };
  }

  const token = crypto.randomBytes(24).toString('hex');
  await PasswordResetToken.create({
    userId: user._id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000)
  });

  return {
    message: 'Token de recuperação gerado (demo).',
    demoResetToken: token,
    expiresInMinutes: 30
  };
}

async function resetPassword(token, novaSenha) {
  const record = await PasswordResetToken.findOne({
    tokenHash: hashToken(token),
    usedAt: { $exists: false },
    expiresAt: { $gt: new Date() }
  });

  if (!record) {
    const err = new Error('Token inválido ou expirado');
    err.status = 400;
    throw err;
  }

  const user = await User.findById(record.userId);
  user.senha = await bcrypt.hash(novaSenha, 10);
  user.refreshToken = '';
  await user.save();

  record.usedAt = new Date();
  await record.save();

  return { ok: true, message: 'Senha redefinida com sucesso' };
}

module.exports = {
  setupTwoFactor,
  verifyTwoFactor,
  generateLoginTwoFactor,
  isLoginTwoFactorValid,
  requestPasswordReset,
  resetPassword
};
