const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Configuracao', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cargaMaximaSemanal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 }
  },
  dataVigencia: { type: DataTypes.DATEONLY, allowNull: true }
}, {
  tableName: 'configuracoes'
});
