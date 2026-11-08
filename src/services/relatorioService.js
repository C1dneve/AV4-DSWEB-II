const { Op, fn, col } = require('sequelize');
const { Jogador, Treino, Configuracao } = require('../models');
const { obterPeriodoSemana } = require('../utils/semana');
const { excedeLimiteSemanal } = require('../utils/carga');

const TIPOS = [
  { codigo: 'F', nome: 'Físico' },
  { codigo: 'T', nome: 'Técnico' },
  { codigo: 'E', nome: 'Estratégico' }
];
const POSICOES = [
  { codigo: 'G', nome: 'Goleiro' },
  { codigo: 'Z', nome: 'Zagueiro' },
  { codigo: 'M', nome: 'Meio-campista' },
  { codigo: 'A', nome: 'Atacante' }
];

const numero = (valor) => Number(Number(valor || 0).toFixed(2));

async function gerarRelatorioSemanal(dataReferencia) {
  const { inicio, fim } = obterPeriodoSemana(dataReferencia);
  const configuracao = await Configuracao.findByPk(1);
  if (!configuracao) {
    const erro = new Error('Configure a carga máxima semanal em PUT /configuracao antes de gerar o relatório.');
    erro.statusCode = 409;
    throw erro;
  }

  const where = { dataTreino: { [Op.between]: [inicio, fim] } };

  // Consulta detalhada com include: demonstra o relacionamento Treino -> Jogador.
  const treinosDaSemana = await Treino.findAll({
    where,
    include: [{ model: Jogador, as: 'jogador', attributes: ['id', 'nome', 'posicao'] }],
    attributes: ['id', 'jogadorId', 'tipo', 'carga', 'dataTreino'],
    order: [['dataTreino', 'ASC']]
  });

  // SUM e COUNT agrupados por atleta para consolidar a carga semanal.
  const cargasAgrupadas = await Treino.findAll({
    where,
    attributes: [
      'jogadorId',
      [fn('SUM', col('carga')), 'cargaSemanal'],
      [fn('COUNT', col('id')), 'quantidadeTreinos']
    ],
    group: ['jogadorId'],
    raw: true
  });

  const ids = cargasAgrupadas.map((item) => item.jogadorId);
  const jogadores = ids.length
    ? await Jogador.findAll({ where: { id: { [Op.in]: ids } }, attributes: ['id', 'nome', 'posicao'] })
    : [];
  const jogadoresPorId = new Map(jogadores.map((j) => [j.id, j]));
  const porJogador = cargasAgrupadas.map((item) => {
    const jogador = jogadoresPorId.get(Number(item.jogadorId));
    const cargaSemanal = numero(item.cargaSemanal);
    return {
      jogadorId: Number(item.jogadorId),
      nome: jogador ? jogador.nome : 'Jogador não encontrado',
      posicao: jogador ? jogador.posicao : null,
      cargaSemanal,
      quantidadeTreinos: Number(item.quantidadeTreinos),
      riscoSobrecarga: excedeLimiteSemanal(cargaSemanal, configuracao.cargaMaximaSemanal)
    };
  }).sort((a, b) => b.cargaSemanal - a.cargaSemanal || a.nome.localeCompare(b.nome, 'pt-BR'));

  // AVG e COUNT agrupados por tipo de sessão.
  const mediasAgrupadas = await Treino.findAll({
    where,
    attributes: [
      'tipo',
      [fn('AVG', col('carga')), 'cargaMedia'],
      [fn('COUNT', col('id')), 'quantidadeTreinos']
    ],
    group: ['tipo'],
    raw: true
  });
  const mediasPorTipo = new Map(mediasAgrupadas.map((item) => [item.tipo, item]));
  const mediaPorTipo = TIPOS.map((tipo) => {
    const item = mediasPorTipo.get(tipo.codigo);
    return {
      tipo: tipo.codigo,
      descricao: tipo.nome,
      quantidadeTreinos: item ? Number(item.quantidadeTreinos) : 0,
      cargaMedia: item ? numero(item.cargaMedia) : null
    };
  });

  // GROUP BY da posição do jogador, com include e agregações Sequelize.
  const posicoesAgrupadas = await Treino.findAll({
    where,
    attributes: [
      [col('jogador.posicao'), 'posicao'],
      [fn('COUNT', col('Treino.id')), 'totalTreinos'],
      [fn('AVG', col('carga')), 'cargaMediaPorSessao']
    ],
    include: [{ model: Jogador, as: 'jogador', attributes: [] }],
    group: [col('jogador.posicao')],
    raw: true
  });
  const posicaoPorCodigo = new Map(posicoesAgrupadas.map((item) => [item.posicao, item]));
  const porPosicao = POSICOES.map((posicao) => {
    const item = posicaoPorCodigo.get(posicao.codigo);
    return {
      posicao: posicao.codigo,
      descricao: posicao.nome,
      totalTreinos: item ? Number(item.totalTreinos) : 0,
      cargaMediaPorSessao: item ? numero(item.cargaMediaPorSessao) : null
    };
  });

  const maiorValor = porJogador.length ? porJogador[0].cargaSemanal : null;
  const menorValor = porJogador.length ? porJogador[porJogador.length - 1].cargaSemanal : null;
  const mesmaCarga = (a, b) => Math.abs(a - b) < 0.000001;
  const atletasMaiorCarga = maiorValor === null ? [] : porJogador.filter((j) => mesmaCarga(j.cargaSemanal, maiorValor));
  const atletasMenorCarga = menorValor === null ? [] : porJogador.filter((j) => mesmaCarga(j.cargaSemanal, menorValor));
  const jogadoresEmRisco = porJogador.filter((j) => j.riscoSobrecarga);

  return {
    semana: {
      dataReferencia,
      inicio: inicio.toISOString().slice(0, 10),
      fim: fim.toISOString().slice(0, 10)
    },
    cargaMaximaSemanal: numero(configuracao.cargaMaximaSemanal),
    totalTreinos: treinosDaSemana.length,
    porJogador,
    maiorCargaSemanal: maiorValor === null ? null : {
      cargaSemanal: maiorValor,
      atletas: atletasMaiorCarga
    },
    menorCargaSemanal: menorValor === null ? null : {
      cargaSemanal: menorValor,
      atletas: atletasMenorCarga
    },
    jogadoresEmRisco: {
      quantidade: jogadoresEmRisco.length,
      atletas: jogadoresEmRisco
    },
    mediaPorTipo,
    porPosicao,
    criterioRanking: 'Somente jogadores com pelo menos um treino na semana. Todos os atletas empatados na maior ou menor carga são exibidos.',
    observacao: 'Indicador didático de sobrecarga; não representa diagnóstico ou predição clínica de lesão.'
  };
}

module.exports = { gerarRelatorioSemanal };
