require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const port = Number(process.env.PORT || 3000);

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com MySQL estabelecida.');
    app.listen(port, () => console.log(`API disponível em http://localhost:${port}`));
  } catch (erro) {
    console.error('Não foi possível conectar ao banco de dados. Verifique o .env e o MySQL.');
    console.error(erro.message);
    process.exit(1);
  }
}

iniciarServidor();
