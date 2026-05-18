const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  GERENTE: 'gerente',
  FINANCEIRO: 'financeiro',
  TECNICO: 'tecnico',
  COMERCIAL: 'comercial',
  SUPORTE: 'suporte',
  CLIENTE: 'cliente'
};

const MODULES = [
  'dashboard',
  'clientes',
  'ordens',
  'orcamentos',
  'financeiro',
  'estoque',
  'agenda',
  'relatorios',
  'crm',
  'usuarios',
  'empresas',
  'automacoes',
  'ia',
  'portal',
  'master'
];

const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: MODULES,
  [ROLES.ADMIN]: MODULES.filter((m) => m !== 'master'),
  [ROLES.GERENTE]: [
    'dashboard', 'clientes', 'ordens', 'orcamentos', 'financeiro',
    'estoque', 'agenda', 'relatorios', 'crm', 'usuarios', 'automacoes', 'ia'
  ],
  [ROLES.FINANCEIRO]: ['dashboard', 'financeiro', 'relatorios', 'clientes'],
  [ROLES.TECNICO]: ['dashboard', 'ordens', 'agenda', 'clientes'],
  [ROLES.COMERCIAL]: ['dashboard', 'clientes', 'crm', 'orcamentos', 'relatorios'],
  [ROLES.SUPORTE]: ['dashboard', 'ordens', 'clientes', 'agenda'],
  [ROLES.CLIENTE]: ['portal']
};

function permissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || ['dashboard'];
}

function canAccess(role, module) {
  if (role === ROLES.SUPER_ADMIN) return true;
  return permissionsForRole(role).includes(module);
}

module.exports = {
  ROLES,
  MODULES,
  ROLE_PERMISSIONS,
  permissionsForRole,
  canAccess
};
