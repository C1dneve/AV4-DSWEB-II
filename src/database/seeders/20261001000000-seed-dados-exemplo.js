module.exports = {
  async up(queryInterface) {
    const agora = new Date();
    await queryInterface.bulkInsert('jogadores', [
      { id: 1, nome: 'Ana Souza', posicao: 'G', ativo: true, createdAt: agora, updatedAt: agora },
      { id: 2, nome: 'Bruno Lima', posicao: 'Z', ativo: true, createdAt: agora, updatedAt: agora },
      { id: 3, nome: 'Carla Mendes', posicao: 'M', ativo: true, createdAt: agora, updatedAt: agora },
      { id: 4, nome: 'Diego Alves', posicao: 'A', ativo: true, createdAt: agora, updatedAt: agora },
      { id: 5, nome: 'Elisa Costa', posicao: 'Z', ativo: true, createdAt: agora, updatedAt: agora },
      { id: 6, nome: 'Fabio Rocha', posicao: 'M', ativo: true, createdAt: agora, updatedAt: agora }
    ]);

    // 10 sessões na semana de 05/10/2026 e 10 na semana de 12/10/2026.
    const dados = [
      // Semana 1: Ana fica acima do limite de 150 pontos (72 + 50,40 + 36 = 158,40).
      ['TR-001', 1, '2026-10-05 12:00:00', 'F', 60, 8, 72.00],
      ['TR-002', 1, '2026-10-06 12:00:00', 'T', 60, 7, 50.40],
      ['TR-003', 1, '2026-10-07 12:00:00', 'E', 60, 6, 36.00],
      ['TR-004', 2, '2026-10-05 12:00:00', 'F', 45, 6, 40.50],
      ['TR-005', 2, '2026-10-08 12:00:00', 'T', 45, 6, 32.40],
      ['TR-006', 3, '2026-10-06 12:00:00', 'E', 50, 5, 25.00],
      ['TR-007', 3, '2026-10-09 12:00:00', 'F', 40, 5, 30.00],
      ['TR-008', 4, '2026-10-07 12:00:00', 'T', 60, 8, 57.60],
      ['TR-009', 5, '2026-10-08 12:00:00', 'F', 50, 7, 52.50],
      ['TR-010', 6, '2026-10-09 12:00:00', 'E', 50, 4, 20.00],
      // Semana 2: todos permanecem abaixo do limite.
      ['TR-011', 1, '2026-10-12 12:00:00', 'F', 50, 7, 52.50],
      ['TR-012', 1, '2026-10-14 12:00:00', 'E', 40, 6, 24.00],
      ['TR-013', 2, '2026-10-12 12:00:00', 'T', 60, 7, 50.40],
      ['TR-014', 2, '2026-10-15 12:00:00', 'F', 60, 7, 63.00],
      ['TR-015', 3, '2026-10-13 12:00:00', 'E', 60, 6, 36.00],
      ['TR-016', 3, '2026-10-16 12:00:00', 'T', 50, 6, 36.00],
      ['TR-017', 4, '2026-10-13 12:00:00', 'F', 60, 8, 72.00],
      ['TR-018', 4, '2026-10-17 12:00:00', 'T', 45, 8, 43.20],
      ['TR-019', 5, '2026-10-14 12:00:00', 'T', 45, 7, 37.80],
      ['TR-020', 6, '2026-10-16 12:00:00', 'E', 60, 5, 30.00]
    ];

    await queryInterface.bulkInsert('treinos', dados.map((item, index) => ({
      id: index + 1,
      codigo: item[0], jogadorId: item[1], dataTreino: new Date(`${item[2].replace(' ', 'T')}Z`),
      tipo: item[3], duracaoMin: item[4], intensidade: item[5], carga: item[6],
      createdAt: agora, updatedAt: agora
    })));

    await queryInterface.bulkInsert('configuracoes', [{
      id: 1, cargaMaximaSemanal: 150.00, dataVigencia: '2026-10-01', createdAt: agora, updatedAt: agora
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('treinos', null, {});
    await queryInterface.bulkDelete('configuracoes', null, {});
    await queryInterface.bulkDelete('jogadores', null, {});
  }
};
