require('dotenv').config();

const common = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'treinos_esportivos',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  dialect: 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false
};

module.exports = {
  development: common,
  test: common,
  production: common
};
