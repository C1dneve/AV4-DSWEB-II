const MULTIPLICADORES = Object.freeze({ F: 1.5, T: 1.2, E: 1.0 });

function calcularCarga(duracaoMin, intensidade, tipo) {
  const duracao = Number(duracaoMin);
  const esforco = Number(intensidade);

  if (!Number.isInteger(duracao) || duracao <= 0) {
    throw new Error('A duração deve ser um número inteiro positivo.');
  }
  if (!Number.isInteger(esforco) || esforco < 1 || esforco > 10) {
    throw new Error('A intensidade deve ser um número inteiro entre 1 e 10.');
  }
  if (!Object.prototype.hasOwnProperty.call(MULTIPLICADORES, tipo)) {
    throw new Error('O tipo deve ser F, T ou E.');
  }

  return Number(((duracao / 10) * esforco * MULTIPLICADORES[tipo]).toFixed(2));
}

function excedeLimiteSemanal(cargaSemanal, cargaMaximaSemanal) {
  return Number(cargaSemanal) > Number(cargaMaximaSemanal);
}

module.exports = { calcularCarga, excedeLimiteSemanal, MULTIPLICADORES };
