const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Treino', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: { name: 'uk_treinos_codigo', msg: 'Já existe um treino com esse código.' },
    validate: { notEmpty: { msg: 'O código é obrigatório.' }, len: [2, 40] }
  },
  jogadorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { isInt: true, min: 1 }
  },
  dataTreino: { type: DataTypes.DATE, allowNull: false, validate: { isDate: true } },
  tipo: {
    type: DataTypes.ENUM('F', 'T', 'E'),
    allowNull: false,
    validate: { isIn: [['F', 'T', 'E']] }
  },
  duracaoMin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { isInt: true, min: 1 }
  },
  intensidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { isInt: true, min: 1, max: 10 }
  },
  carga: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 }
  }
}, {
  tableName: 'treinos'
});
