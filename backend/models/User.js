const mongoose = require('mongoose');
const { ROLES } = require('../config/permissions');

const UserSchema = new mongoose.Schema({
  usuario: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true, sparse: true },
  senha: { type: String, required: true },
  nome: { type: String, default: '' },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.ADMIN
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    index: true
  },
  permissions: [{ type: String }],
  avatar: { type: String, default: '' },
  refreshToken: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

UserSchema.index({ usuario: 1, companyId: 1 }, { unique: true, sparse: true });
UserSchema.index({ email: 1 }, { sparse: true });

module.exports = mongoose.model('User', UserSchema);
