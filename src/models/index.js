const sequelize = require('../config/database');
const Jogador = require('./Jogador')(sequelize);
const Treino = require('./Treino')(sequelize);
const Configuracao = require('./Configuracao')(sequelize);

Jogador.hasMany(Treino, {
  foreignKey: 'jogadorId',
  as: 'treinos',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT'
});
Treino.belongsTo(Jogador, {
  foreignKey: 'jogadorId',
  as: 'jogador'
});

module.exports = { sequelize, Jogador, Treino, Configuracao };
