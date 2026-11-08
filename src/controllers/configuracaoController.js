const service = require('../services/configuracaoService');

async function consultar(req, res) {
  return res.status(200).json(await service.consultarConfiguracao());
}

async function atualizar(req, res) {
  return res.status(200).json(await service.atualizarConfiguracao(req.body));
}

module.exports = { consultar, atualizar };
