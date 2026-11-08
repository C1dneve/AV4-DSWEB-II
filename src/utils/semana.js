function dataValida(data) {
  return typeof data === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(data)
    && !Number.isNaN(Date.parse(`${data}T00:00:00.000Z`))
    && new Date(`${data}T00:00:00.000Z`).toISOString().slice(0, 10) === data;
}

function obterPeriodoSemana(dataReferencia) {
  if (!dataValida(dataReferencia)) {
    throw new Error('Informe uma data válida no formato YYYY-MM-DD.');
  }

  const referencia = new Date(`${dataReferencia}T00:00:00.000Z`);
  const diaSemana = referencia.getUTCDay();
  const diferencaParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;

  const inicio = new Date(referencia);
  inicio.setUTCDate(inicio.getUTCDate() + diferencaParaSegunda);

  const fim = new Date(inicio);
  fim.setUTCDate(fim.getUTCDate() + 6);
  fim.setUTCHours(23, 59, 59, 999);

  return { inicio, fim };
}

module.exports = { dataValida, obterPeriodoSemana };
