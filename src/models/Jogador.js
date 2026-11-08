const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Jogador', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: {
    type: DataTypes.STRING(120),
    allowNull: false,
    validate: { notEmpty: { msg: 'O nome é obrigatório.' }, len: [2, 120] }
  },
  posicao: {
    type: DataTypes.ENUM('G', 'Z', 'M', 'A'),
    allowNull: false,
    validate: { isIn: [['G', 'Z', 'M', 'A']] }
  },
  ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'jogadores'
});
