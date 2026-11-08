const service = require('../services/treinoService');

async function registrar(req, res) {
  const treino = await service.registrarTreino(req.body);
  return res.status(201).json(treino);
}

async function listar(req, res) {
  return res.status(200).json(await service.listarTreinos(req.query));
}

async function porJogador(req, res) {
  return res.status(200).json(await service.listarTreinosPorJogador(req.params.id));
}

async function excluir(req, res) {
  await service.excluirTreino(req.params.codigo);
  return res.status(200).json({ mensagem: 'Treino excluído com sucesso.' });
}

module.exports = { registrar, listar, porJogador, excluir };
