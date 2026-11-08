# API de Treinos Esportivos

API REST acadêmica para gerenciamento de jogadores e treinos, cálculo de carga, identificação didática de possível sobrecarga e relatório semanal. Foi organizada para cumprir os requisitos da Atividade Avaliativa 04 com uma estrutura pequena e direta.


## 1. Tecnologias

- Node.js e Express: servidor HTTP e rotas REST.
- Sequelize 6: ORM para todos os acessos às tabelas.
- MySQL e mysql2: banco de dados.
- dotenv: configuração por variáveis de ambiente.
- Swagger UI: documentação e demonstração das requisições.
- Node.js Test Runner: testes automatizados das regras de cálculo e calendário.

## 2. Estrutura do projeto

```text
src/
  config/          Conexão Sequelize
  controllers/     Recebem requisições e enviam respostas HTTP
  database/
    migrations/    Criação das tabelas
    seeders/       Massa inicial de demonstração
  docs/            Documento OpenAPI/Swagger
  middlewares/     Tratamento centralizado de erros
  models/          Jogador, Treino, Configuracao e associações
  routes/          Endpoints da API
  services/        Regras de negócio e consultas Sequelize
  utils/           Cálculo de carga, semana e asyncHandler
  app.js           Configuração do Express
  server.js        Inicialização e conexão com MySQL
tests/             Testes das regras independentes do banco
```

## 3. Requisitos para executar

- Node.js 18 ou superior.
- MySQL 8 (ou versão compatível).
- npm.

### Passo a passo no Windows

1. Extraia o ZIP e abra a pasta `sistema-treinos-esportivos` no VS Code.
2. Crie um banco no MySQL:

   ```sql
   CREATE DATABASE treinos_esportivos;
   ```

3. Copie `.env.example` para `.env` e informe usuário e senha do seu MySQL. Exemplo:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=treinos_esportivos
   DB_USER=root
   DB_PASSWORD=sua_senha
   DB_LOGGING=false
   ```

4. No terminal, dentro da pasta do projeto, instale as dependências:

   ```bash
   npm install
   ```

5. Crie as tabelas com as migrations e insira os dados de demonstração:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. Inicie a API:

   ```bash
   npm run dev
   ```

7. Abra o Swagger no navegador:

   `http://localhost:3000/api-docs`

A API também responde em `http://localhost:3000/`.

### Reiniciar o banco de demonstração

O comando abaixo desfaz as migrations, recria as tabelas e executa novamente os seeders. **Ele apaga os dados dessas tabelas**, então use apenas em ambiente de desenvolvimento:

```bash
npm run db:reset
```

Não é utilizado `sync({ force: true })`.

## 4. Modelagem e relacionamentos

| Model | Campos principais |
|---|---|
| Jogador | `id`, `nome`, `posicao` (`G`, `Z`, `M`, `A`), `ativo` |
| Treino | `id`, `codigo` único, `jogadorId`, `dataTreino`, `tipo` (`F`, `T`, `E`), `duracaoMin`, `intensidade`, `carga` |
| Configuracao | `id`, `cargaMaximaSemanal`, `dataVigencia` |

Relacionamento obrigatório:

- `Jogador.hasMany(Treino, { as: 'treinos' })`: um jogador pode ter vários treinos.
- `Treino.belongsTo(Jogador, { as: 'jogador' })`: cada treino pertence a um jogador.

A chave estrangeira usa `ON DELETE RESTRICT`, preservando os registros. Desativar um jogador apenas altera `ativo` para `false`; não exclui nem altera o histórico. Um jogador inativo não pode receber novos treinos.

As migrations criam as tabelas em ordem (jogadores, treinos e configurações). O seeder inclui seis jogadores, as quatro posições, vinte treinos dos três tipos, duas semanas de exemplo e limite de 150 pontos.

## 5. Regra de cálculo de carga

Multiplicadores usados:

| Tipo | Código | Multiplicador |
|---|---:|---:|
| Físico | F | 1,5 |
| Técnico | T | 1,2 |
| Estratégico | E | 1,0 |

**Fórmula:** `(duração em minutos / 10) × intensidade × multiplicador`.

Exemplo do enunciado: treino físico de 60 minutos e intensidade 8:

`(60 / 10) × 8 × 1,5 = 72 pontos`.

O valor é calculado no serviço quando o treino é registrado; o cliente não envia a carga. A intensidade deve ser um inteiro entre 1 e 10 e a duração um inteiro positivo. Valores inválidos retornam HTTP 400.

A semana é considerada de segunda-feira a domingo. O risco só é sinalizado quando `carga semanal > carga máxima semanal`; no empate, não há risco.

## 6. Endpoints

| Método | Endpoint | O que faz |
|---|---|---|
| POST | `/jogadores` | Cadastra jogador |
| GET | `/jogadores` | Lista jogadores; aceita `?ativo=true` ou `?ativo=false` |
| GET | `/jogadores/:id` | Consulta jogador e histórico associado |
| PUT | `/jogadores/:id` | Atualiza nome, posição ou situação ativa |
| PATCH | `/jogadores/:id/desativar` | Desativa sem apagar histórico |
| GET | `/configuracao` | Consulta limite semanal |
| PUT | `/configuracao` | Cadastra/atualiza limite semanal |
| POST | `/treinos` | Registra treino e calcula carga |
| GET | `/treinos` | Lista; filtros: `jogadorId`, `tipo`, `inicio`, `fim` |
| GET | `/treinos/jogador/:id` | Lista histórico de um jogador |
| DELETE | `/treinos/:codigo` | Exclui treino pelo código |
| GET | `/relatorios/semanal?data=YYYY-MM-DD` | Consolida a semana da data informada |

### Exemplos para testar no Swagger

**Cadastrar jogador** — `POST /jogadores`

```json
{
  "nome": "Gabriel Santos",
  "posicao": "A"
}
```

**Registrar treino físico** — `POST /treinos`

```json
{
  "codigo": "TR-021",
  "jogadorId": 1,
  "dataTreino": "2026-10-19",
  "tipo": "F",
  "duracaoMin": 60,
  "intensidade": 8
}
```

Resposta esperada inclui `carga: "72.00"` (o Sequelize/MySQL pode serializar DECIMAL como texto).

**Definir limite** — `PUT /configuracao`

```json
{
  "cargaMaximaSemanal": 150,
  "dataVigencia": "2026-10-01"
}
```

**Relatório da primeira semana de exemplo** — `GET /relatorios/semanal?data=2026-10-05`.

**Relatório da segunda semana de exemplo** — `GET /relatorios/semanal?data=2026-10-12`.

**Filtrar treinos** — `GET /treinos?jogadorId=1&tipo=F&inicio=2026-10-01&fim=2026-10-31`.

## 7. Relatório semanal

O retorno inclui:

- quantidade total de sessões na semana;
- carga acumulada e quantidade de treinos de cada jogador que treinou;
- maior e menor carga semanal;
- contagem e lista de jogadores acima do limite;
- carga média e quantidade de sessões por tipo (`F`, `T`, `E`);
- quantidade total de sessões e carga média por sessão em cada posição (`G`, `Z`, `M`, `A`).

**Empates:** todos os jogadores empatados na maior ou menor carga são apresentados no campo correspondente.

**Semana sem treinos:** `totalTreinos` será `0`, `porJogador` será `[]`, maior e menor carga serão `null`, contagem de risco será `0`, e as médias por tipo/posição terão quantidade `0` e média `null`.

**Rankings:** consideram apenas jogadores com pelo menos um treino na semana. Isso evita que jogadores sem sessão sejam considerados os de menor carga.

## 8. Códigos HTTP e erros

- `200`: consulta, atualização ou exclusão concluída.
- `201`: cadastro concluído.
- `400`: validação ou filtro inválido.
- `404`: jogador, treino ou configuração não encontrado.
- `409`: código de treino duplicado, tentativa de treinar jogador inativo ou limite não configurado para relatório.
- `500`: erro inesperado; a resposta não expõe credenciais nem detalhes internos do banco.

## 9. Testes

Execute os testes automatizados sem precisar conectar ao MySQL:

```bash
npm test
```

Eles verificam a fórmula dos três tipos, limites de duração/intensidade/tipo, validação da data e semana de segunda a domingo.

### Checklist de demonstração obrigatória no Swagger

1. Listar os seis jogadores e verificar que aparecem as quatro posições.
2. Listar os vinte treinos e verificar os tipos F, T e E.
3. Consultar `GET /treinos?jogadorId=1` e verificar os dados do jogador associado em cada sessão.
4. Consultar `GET /relatorios/semanal?data=2026-10-05`: Ana Souza deve aparecer com 158,40 pontos e risco, pois ultrapassa 150.
5. Consultar `GET /relatorios/semanal?data=2026-10-12`: comparar os totais da segunda semana; nenhum atleta deve ultrapassar 150.
6. Tentar cadastrar novamente o código `TR-001` e confirmar HTTP 409.
7. Tentar intensidade `11` e confirmar HTTP 400.
8. Tentar duração `0` e confirmar HTTP 400.
9. Tentar treino com `jogadorId` inexistente e confirmar HTTP 404.
10. Desativar um jogador e tentar registrar um treino para ele; confirmar HTTP 409. Depois, consultar o jogador e verificar que os treinos antigos continuam no histórico.
11. Conferir o cálculo manual: `60 / 10 × 8 × 1,5 = 72` pontos para treino físico.

## 10. Onde aparecem Sequelize e async/await

Os services usam métodos do Sequelize com `async/await`, por exemplo:

- `Jogador.create()` para cadastrar;
- `Jogador.findAll()` e `findByPk()` para consultar;
- `instancia.update()` para atualizar/desativar;
- `Treino.create()` e `destroy()` para inserir/excluir sessões;
- `include` para trazer o jogador relacionado ao treino;
- `Op.between` para selecionar os treinos da semana;
- `fn('SUM')`, `fn('COUNT')`, `fn('AVG')`, `col()` e `group` para as agregações do relatório.


