const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'API de Treinos Esportivos',
    version: '1.0.0',
    description: 'API acadêmica para registrar treinos, calcular carga e gerar relatório semanal. O indicador de sobrecarga é exclusivamente didático.'
  },
  servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
  tags: [
    { name: 'Jogadores', description: 'Cadastro e manutenção de atletas' },
    { name: 'Configuração', description: 'Limite máximo semanal de carga' },
    { name: 'Treinos', description: 'Registro e consulta de sessões' },
    { name: 'Relatórios', description: 'Consolidação semanal' }
  ],
  components: {
    schemas: {
      JogadorEntrada: {
        type: 'object', required: ['nome', 'posicao'],
        properties: {
          nome: { type: 'string', example: 'Ana Souza' },
          posicao: { type: 'string', enum: ['G', 'Z', 'M', 'A'], description: 'G=Goleiro, Z=Zagueiro, M=Meio-campista, A=Atacante', example: 'M' },
          ativo: { type: 'boolean', default: true }
        }
      },
      TreinoEntrada: {
        type: 'object', required: ['codigo', 'jogadorId', 'dataTreino', 'tipo', 'duracaoMin', 'intensidade'],
        properties: {
          codigo: { type: 'string', example: 'TR-001' },
          jogadorId: { type: 'integer', example: 1 },
          dataTreino: { type: 'string', format: 'date', example: '2026-10-05' },
          tipo: { type: 'string', enum: ['F', 'T', 'E'], description: 'F=Físico, T=Técnico, E=Estratégico' },
          duracaoMin: { type: 'integer', minimum: 1, example: 60 },
          intensidade: { type: 'integer', minimum: 1, maximum: 10, example: 8 }
        }
      },
      Erro: { type: 'object', properties: { erro: { type: 'string' } } }
    }
  },
  paths: {
    '/jogadores': {
      post: {
        tags: ['Jogadores'], summary: 'Cadastrar jogador', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/JogadorEntrada' } } } },
        responses: { '201': { description: 'Jogador cadastrado' }, '400': { description: 'Dados inválidos' }, '500': { description: 'Erro interno' } }
      },
      get: {
        tags: ['Jogadores'], summary: 'Listar jogadores', parameters: [{ in: 'query', name: 'ativo', schema: { type: 'boolean' }, description: 'Opcional: true ou false' }],
        responses: { '200': { description: 'Lista de jogadores' }, '400': { description: 'Filtro inválido' } }
      }
    },
    '/jogadores/{id}': {
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
      get: { tags: ['Jogadores'], summary: 'Consultar jogador e seu histórico de treinos', responses: { '200': { description: 'Jogador encontrado' }, '404': { description: 'Jogador não encontrado' } } },
      put: {
        tags: ['Jogadores'], summary: 'Atualizar jogador', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/JogadorEntrada' } } } },
        responses: { '200': { description: 'Jogador atualizado' }, '400': { description: 'Dados inválidos' }, '404': { description: 'Jogador não encontrado' } }
      }
    },
    '/jogadores/{id}/desativar': {
      patch: { tags: ['Jogadores'], summary: 'Desativar jogador sem apagar histórico', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Jogador desativado' }, '404': { description: 'Jogador não encontrado' } } }
    },
    '/configuracao': {
      get: { tags: ['Configuração'], summary: 'Consultar limite semanal', responses: { '200': { description: 'Configuração atual' }, '404': { description: 'Configuração não cadastrada' } } },
      put: {
        tags: ['Configuração'], summary: 'Cadastrar ou atualizar limite semanal', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['cargaMaximaSemanal'], properties: { cargaMaximaSemanal: { type: 'number', minimum: 0, example: 150 }, dataVigencia: { type: 'string', format: 'date', nullable: true } } } } } },
        responses: { '200': { description: 'Configuração salva' }, '400': { description: 'Valor inválido' } }
      }
    },
    '/treinos': {
      post: {
        tags: ['Treinos'], summary: 'Registrar treino e calcular carga automaticamente', description: 'Carga = (duração em minutos / 10) × intensidade × multiplicador do tipo.', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TreinoEntrada' } } } },
        responses: { '201': { description: 'Treino cadastrado com carga calculada' }, '400': { description: 'Dados inválidos' }, '404': { description: 'Jogador não encontrado' }, '409': { description: 'Código duplicado ou jogador inativo' } }
      },
      get: {
        tags: ['Treinos'], summary: 'Listar treinos com filtros', parameters: [
          { in: 'query', name: 'jogadorId', schema: { type: 'integer' } },
          { in: 'query', name: 'tipo', schema: { type: 'string', enum: ['F', 'T', 'E'] } },
          { in: 'query', name: 'inicio', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'fim', schema: { type: 'string', format: 'date' } }
        ], responses: { '200': { description: 'Lista de treinos com jogador associado' }, '400': { description: 'Filtro inválido' } }
      }
    },
    '/treinos/jogador/{id}': {
      get: { tags: ['Treinos'], summary: 'Listar histórico de treinos do jogador', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Treinos do jogador' }, '404': { description: 'Jogador não encontrado' } } }
    },
    '/treinos/{codigo}': {
      delete: { tags: ['Treinos'], summary: 'Excluir treino pelo código', parameters: [{ in: 'path', name: 'codigo', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Treino excluído' }, '404': { description: 'Treino não encontrado' } } }
    },
    '/relatorios/semanal': {
      get: {
        tags: ['Relatórios'], summary: 'Gerar relatório semanal', description: 'A semana considerada vai de segunda-feira a domingo. O ranking considera somente jogadores com ao menos um treino na semana; empates são retornados em conjunto.',
        parameters: [{ in: 'query', name: 'data', required: true, schema: { type: 'string', format: 'date', example: '2026-10-05' }, description: 'Qualquer dia da semana consultada' }],
        responses: { '200': { description: 'Relatório semanal consolidado' }, '400': { description: 'Data inválida' }, '409': { description: 'Limite semanal ainda não configurado' } }
      }
    }
  }
};

module.exports = swaggerDocument;
