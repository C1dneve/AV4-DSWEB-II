function middlewareErro(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({ erro: err.message });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ erro: 'Já existe um registro com esse valor único.' });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      erro: 'Os dados enviados são inválidos.',
      detalhes: err.errors.map((item) => item.message)
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'O corpo da requisição contém JSON inválido.' });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ erro: 'O jogador informado não existe ou não pode ser relacionado.' });
  }

  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = middlewareErro;
