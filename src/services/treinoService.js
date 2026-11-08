const { Op } = require('sequelize');
const { Jogador, Treino } = require('../models');
const { calcularCarga } = require('../utils/carga');
const { dataValida } = require('../utils/semana');

async function registrarTreino(dados) {
  const jogadorId = Number(dados.jogadorId);
  if (!Number.isInteger(jogadorId) || jogadorId < 1) {
    const erro = new Error('jogadorId deve ser um inteiro positivo.');
    erro.statusCode = 400;
    throw erro;
  }
  const jogador = await Jogador.findByPk(jogadorId);
  if (!jogador) {
    const erro = new Error('Jogador não encontrado.');
    erro.statusCode = 404;
    throw erro;
  }
  if (!jogador.ativo) {
    const erro = new Error('Não é permitido registrar treino para jogador inativo.');
    erro.statusCode = 409;
    throw erro;
  }
  if (!dataValida(dados.dataTreino)) {
    const erro = new Error('dataTreino deve ser uma data válida no formato YYYY-MM-DD.');
    erro.statusCode = 400;
    throw erro;
  }

  let carga;
  try {
    carga = calcularCarga(dados.duracaoMin, dados.intensidade, dados.tipo);
  } catch (erro) {
    erro.statusCode = 400;
    throw erro;
  }
  return Treino.create({
    codigo: dados.codigo,
    jogadorId: Number(dados.jogadorId),
    dataTreino: new Date(`${dados.dataTreino}T12:00:00.000Z`),
    tipo: dados.tipo,
    duracaoMin: Number(dados.duracaoMin),
    intensidade: Number(dados.intensidade),
    carga
  });
}

function montarFiltroDatas(query) {
  const where = {};
  const { inicio, fim } = query;

  if (inicio && !dataValida(inicio)) {
    const erro = new Error('O filtro inicio deve usar uma data válida no formato YYYY-MM-DD.');
    erro.statusCode = 400;
    throw erro;
  }
  if (fim && !dataValida(fim)) {
    const erro = new Error('O filtro fim deve usar uma data válida no formato YYYY-MM-DD.');
    erro.statusCode = 400;
    throw erro;
  }
  if (inicio && fim && inicio > fim) {
    const erro = new Error('inicio não pode ser posterior a fim.');
    erro.statusCode = 400;
    throw erro;
  }

  if (inicio && fim) {
    where.dataTreino = {
      [Op.between]: [new Date(`${inicio}T00:00:00.000Z`), new Date(`${fim}T23:59:59.999Z`)]
    };
  } else if (inicio) {
    where.dataTreino = { [Op.gte]: new Date(`${inicio}T00:00:00.000Z`) };
  } else if (fim) {
    where.dataTreino = { [Op.lte]: new Date(`${fim}T23:59:59.999Z`) };
  }
  return where;
}

async function listarTreinos(filtros = {}) {
  const where = montarFiltroDatas(filtros);
  if (filtros.jogadorId !== undefined) {
    const jogadorId = Number(filtros.jogadorId);
    if (!Number.isInteger(jogadorId) || jogadorId < 1) {
      const erro = new Error('jogadorId deve ser um inteiro positivo.');
      erro.statusCode = 400;
      throw erro;
    }
    where.jogadorId = jogadorId;
  }
  if (filtros.tipo !== undefined) {
    if (!['F', 'T', 'E'].includes(filtros.tipo)) {
      const erro = new Error('tipo deve ser F, T ou E.');
      erro.statusCode = 400;
      throw erro;
    }
    where.tipo = filtros.tipo;
  }

  return Treino.findAll({
    where,
    include: [{ model: Jogador, as: 'jogador', attributes: ['id', 'nome', 'posicao', 'ativo'] }],
    order: [['dataTreino', 'DESC'], ['id', 'DESC']]
  });
}

async function listarTreinosPorJogador(id) {
  const jogadorId = Number(id);
  if (!Number.isInteger(jogadorId) || jogadorId < 1) {
    const erro = new Error('O id deve ser um número inteiro positivo.');
    erro.statusCode = 400;
    throw erro;
  }
  const jogador = await Jogador.findByPk(jogadorId);
  if (!jogador) {
    const erro = new Error('Jogador não encontrado.');
    erro.statusCode = 404;
    throw erro;
  }
  return Treino.findAll({
    where: { jogadorId },
    include: [{ model: Jogador, as: 'jogador', attributes: ['id', 'nome', 'posicao', 'ativo'] }],
    order: [['dataTreino', 'DESC']]
  });
}

async function excluirTreino(codigo) {
  const treino = await Treino.findOne({ where: { codigo } });
  if (!treino) {
    const erro = new Error('Treino não encontrado.');
    erro.statusCode = 404;
    throw erro;
  }
  await treino.destroy();
  return treino;
}

module.exports = {
  registrarTreino,
  listarTreinos,
  listarTreinosPorJogador,
  excluirTreino
};
