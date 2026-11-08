module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('configuracoes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      cargaMaximaSemanal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      dataVigencia: { type: Sequelize.DATEONLY, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('configuracoes');
  }
};
