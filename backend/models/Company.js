const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  cnpj: { type: String, default: '' },
  email: { type: String, default: '' },
  telefone: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  endereco: { type: String, default: '' },
  cidade: { type: String, default: '' },
  estado: { type: String, default: '' },
  cep: { type: String, default: '' },
  branding: {
    logo: { type: String, default: '' },
    primaryColor: { type: String, default: '#6366f1' },
    secondaryColor: { type: String, default: '#8b5cf6' },
    accentColor: { type: String, default: '#22d3ee' }
  },
  plan: {
    type: String,
    enum: ['basico', 'profissional', 'enterprise'],
    default: 'profissional'
  },
  limits: {
    users: { type: Number, default: 25 },
    clients: { type: Number, default: 5000 },
    orders: { type: Number, default: 20000 }
  },
  settings: {
    timezone: { type: String, default: 'America/Sao_Paulo' },
    currency: { type: String, default: 'BRL' },
    locale: { type: String, default: 'pt-BR' }
  },
  domain: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

CompanySchema.index({ slug: 1 });
CompanySchema.index({ cnpj: 1 });

module.exports = mongoose.model('Company', CompanySchema);
