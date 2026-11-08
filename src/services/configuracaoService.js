const { Configuracao } = require('../models');
const { dataValida } = require('../utils/semana');

async function consultarConfiguracao() {
  const configuracao = await Configuracao.findByPk(1);
  if (!configuracao) {
    const erro = new Error('Configuração ainda não cadastrada. Use PUT /configuracao para defini-la.');
    erro.statusCode = 404;
    throw erro;
  }
  return configuracao;
}

async function atualizarConfiguracao(dados) {
  const valor = Number(dados.cargaMaximaSemanal);
  if (dados.cargaMaximaSemanal === undefined || dados.cargaMaximaSemanal === null || !Number.isFinite(valor) || valor < 0) {
    const erro = new Error('cargaMaximaSemanal deve ser um número maior ou igual a zero.');
    erro.statusCode = 400;
    throw erro;
  }

  const dataVigencia = dados.dataVigencia || null;
  if (dataVigencia !== null && !dataValida(dataVigencia)) {
    const erro = new Error('dataVigencia deve ser uma data válida no formato YYYY-MM-DD.');
    erro.statusCode = 400;
    throw erro;
  }
  let configuracao = await Configuracao.findByPk(1);
  if (configuracao) {
    await configuracao.update({ cargaMaximaSemanal: valor, dataVigencia });
  } else {
    configuracao = await Configuracao.create({ id: 1, cargaMaximaSemanal: valor, dataVigencia });
  }
  return configuracao;
}

module.exports = { consultarConfiguracao, atualizarConfiguracao };
