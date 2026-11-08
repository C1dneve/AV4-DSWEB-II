const { Jogador, Treino } = require('../models');

function validarId(id) {
  const valor = Number(id);
  if (!Number.isInteger(valor) || valor < 1) {
    const erro = new Error('O id deve ser um número inteiro positivo.');
    erro.statusCode = 400;
    throw erro;
  }
  return valor;
}

async function cadastrarJogador(dados) {
  return Jogador.create({
    nome: dados.nome,
    posicao: dados.posicao,
    ativo: dados.ativo === undefined ? true : dados.ativo
  });
}

async function listarJogadores(filtroAtivo) {
  const where = {};
  if (filtroAtivo !== undefined) where.ativo = filtroAtivo;
  return Jogador.findAll({ where, order: [['nome', 'ASC']] });
}

async function consultarJogador(id) {
  const jogadorId = validarId(id);
  const jogador = await Jogador.findByPk(jogadorId, { include: [{ model: Treino, as: 'treinos' }] });
  if (!jogador) {
    const erro = new Error('Jogador não encontrado.');
    erro.statusCode = 404;
    throw erro;
  }
  return jogador;
}

async function atualizarJogador(id, dados) {
  if (dados.ativo !== undefined && typeof dados.ativo !== 'boolean') {
    const erro = new Error('ativo deve ser true ou false.');
    erro.statusCode = 400;
    throw erro;
  }
  const jogadorId = validarId(id);
  const jogador = await Jogador.findByPk(jogadorId);
  if (!jogador) {
    const erro = new Error('Jogador não encontrado.');
    erro.statusCode = 404;
    throw erro;
  }

  const campos = {};
  ['nome', 'posicao', 'ativo'].forEach((campo) => {
    if (dados[campo] !== undefined) campos[campo] = dados[campo];
  });
  await jogador.update(campos);
  return jogador;
}

async function desativarJogador(id) {
  const jogadorId = validarId(id);
  const jogador = await Jogador.findByPk(jogadorId);
  if (!jogador) {
    const erro = new Error('Jogador não encontrado.');
    erro.statusCode = 404;
    throw erro;
  }
  await jogador.update({ ativo: false });
  return jogador;
}

module.exports = {
  cadastrarJogador,
  listarJogadores,
  consultarJogador,
  atualizarJogador,
  desativarJogador
};
