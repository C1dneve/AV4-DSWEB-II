require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    timezone: '+00:00',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    define: { timestamps: true }
  }
);

module.exports = sequelize;
