const test = require('node:test');
const assert = require('node:assert/strict');
const { calcularCarga, excedeLimiteSemanal } = require('../src/utils/carga');
const { dataValida, obterPeriodoSemana } = require('../src/utils/semana');

test('calcula carga de treino físico conforme o enunciado', () => {
  assert.equal(calcularCarga(60, 8, 'F'), 72);
});

test('calcula carga de treino técnico e estratégico', () => {
  assert.equal(calcularCarga(60, 7, 'T'), 50.4);
  assert.equal(calcularCarga(60, 6, 'E'), 36);
});

test('rejeita duração, intensidade e tipo inválidos', () => {
  assert.throws(() => calcularCarga(0, 8, 'F'), /duração/);
  assert.throws(() => calcularCarga(30, 11, 'F'), /intensidade/);
  assert.throws(() => calcularCarga(30, 5, 'X'), /tipo/);
});

test('valida data no padrão YYYY-MM-DD', () => {
  assert.equal(dataValida('2026-10-05'), true);
  assert.equal(dataValida('2026-02-30'), false);
  assert.equal(dataValida('05/10/2026'), false);
});

test('calcula semana de segunda a domingo, inclusive', () => {
  const { inicio, fim } = obterPeriodoSemana('2026-10-07');
  assert.equal(inicio.toISOString(), '2026-10-05T00:00:00.000Z');
  assert.equal(fim.toISOString(), '2026-10-11T23:59:59.999Z');
});

test('calcula corretamente semana quando a referência é domingo', () => {
  const { inicio, fim } = obterPeriodoSemana('2026-10-11');
  assert.equal(inicio.toISOString(), '2026-10-05T00:00:00.000Z');
  assert.equal(fim.toISOString(), '2026-10-11T23:59:59.999Z');
});

test('só sinaliza sobrecarga quando a carga ultrapassa o limite', () => {
  assert.equal(excedeLimiteSemanal(150, 150), false);
  assert.equal(excedeLimiteSemanal(150.01, 150), true);
  assert.equal(excedeLimiteSemanal(149.99, 150), false);
});
