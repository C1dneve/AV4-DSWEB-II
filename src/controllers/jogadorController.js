const service = require('../services/jogadorService');

async function cadastrar(req, res) {
  const jogador = await service.cadastrarJogador(req.body);
  return res.status(201).json(jogador);
}

async function listar(req, res) {
  let ativo;
  if (req.query.ativo !== undefined) {
    if (!['true', 'false'].includes(req.query.ativo)) {
      return res.status(400).json({ erro: 'O filtro ativo deve ser true ou false.' });
    }
    ativo = req.query.ativo === 'true';
  }
  return res.status(200).json(await service.listarJogadores(ativo));
}

async function consultar(req, res) {
  return res.status(200).json(await service.consultarJogador(req.params.id));
}

async function atualizar(req, res) {
  return res.status(200).json(await service.atualizarJogador(req.params.id, req.body));
}

async function desativar(req, res) {
  return res.status(200).json(await service.desativarJogador(req.params.id));
}

module.exports = { cadastrar, listar, consultar, atualizar, desativar };
