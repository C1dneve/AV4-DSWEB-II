const { gerarRelatorioSemanal } = require('../services/relatorioService');

async function semanal(req, res) {
  return res.status(200).json(await gerarRelatorioSemanal(req.query.data));
}

module.exports = { semanal };
