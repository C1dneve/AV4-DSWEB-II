require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger');
const jogadorRoutes = require('./routes/jogadorRoutes');
const configuracaoRoutes = require('./routes/configuracaoRoutes');
const treinoRoutes = require('./routes/treinoRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const middlewareErro = require('./middlewares/erro');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.body = req.body || {};
  next();
});

app.get('/', (req, res) => res.json({
  mensagem: 'API de Treinos Esportivos está funcionando.',
  documentacao: '/api-docs'
}));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/jogadores', jogadorRoutes);
app.use('/configuracao', configuracaoRoutes);
app.use('/treinos', treinoRoutes);
app.use('/relatorios', relatorioRoutes);

app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.use(middlewareErro);

module.exports = app;
