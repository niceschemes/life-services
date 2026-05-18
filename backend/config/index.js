require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 3000,
  mongoUrl: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/life_services',
  jwtSecret: process.env.JWT_SECRET || 'segredo123',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 300,
  appName: 'Life Services Enterprise'
};
