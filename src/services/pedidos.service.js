const AppError = require('../errors/AppError');

// Valores aceitos e regras de negócio documentados no README.md.
const TIPOS_PERMITIDOS = ['entrega', 'retirada'];
const PRIORIDADES_PERMITIDAS = ['baixa', 'normal', 'alta'];
const STATUS_PERMITIDOS = [
  'recebido',
  'em_preparacao',
  'enviado',
  'entregue',
  'cancelado',
];

const TRANSICOES_PERMITIDAS = {
  recebido: ['em_preparacao', 'cancelado'],
  em_preparacao: ['enviado', 'cancelado'],
  enviado: ['entregue'],
  entregue: [],
  cancelado: [],
};

// O armazenamento em memória é permitido pelo enunciado.
let pedidos = [];
let proximoId = 1;

function validarNovoPedido(dados) {
  const detalhes = [];

  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new AppError('O corpo da requisição deve ser um objeto JSON.', 400);
  }

  if (typeof dados.cliente !== 'string' || dados.cliente.trim().length === 0) {
    detalhes.push("O campo 'cliente' é obrigatório e não pode ficar vazio.");
  }

  if (typeof dados.tipo !== 'string' || !TIPOS_PERMITIDOS.includes(dados.tipo)) {
    detalhes.push(`O campo 'tipo' deve ser um dos seguintes valores: ${TIPOS_PERMITIDOS.join(', ')}.`);
  }

  if (typeof dados.valor !== 'number' || !Number.isFinite(dados.valor) || dados.valor <= 0) {
    detalhes.push("O campo 'valor' deve ser numérico e maior que zero.");
  }

  if (typeof dados.prioridade !== 'string' || !PRIORIDADES_PERMITIDAS.includes(dados.prioridade)) {
    detalhes.push(`O campo 'prioridade' deve ser um dos seguintes valores: ${PRIORIDADES_PERMITIDAS.join(', ')}.`);
  }

  if (detalhes.length > 0) {
    throw new AppError('Dados inválidos para cadastrar o pedido.', 400, detalhes);
  }
}

function converterId(id) {
  const valorId = Number(id);
  return Number.isInteger(valorId) && valorId > 0 ? valorId : null;
}

function cadastrarPedido(dados) {
  validarNovoPedido(dados);

  const pedido = {
    id: proximoId++,
    cliente: dados.cliente.trim(),
    tipo: dados.tipo,
    valor: dados.valor,
    prioridade: dados.prioridade,
    status: 'recebido',
  };

  pedidos.push(pedido);
  return { ...pedido };
}

function listarPedidos() {
  return pedidos.map((pedido) => ({ ...pedido }));
}

function buscarPedidoPorId(id) {
  const idValido = converterId(id);
  const pedido = idValido === null ? undefined : pedidos.find((item) => item.id === idValido);

  if (!pedido) {
    throw new AppError('Pedido não encontrado.', 404);
  }

  return { ...pedido };
}

function atualizarStatusPedido(id, novoStatus) {
  const idValido = converterId(id);
  const indice = idValido === null ? -1 : pedidos.findIndex((item) => item.id === idValido);

  if (indice === -1) {
    throw new AppError('Pedido não encontrado.', 404);
  }

  if (!novoStatus || typeof novoStatus !== 'string' || !STATUS_PERMITIDOS.includes(novoStatus)) {
    throw new AppError(
      `Status inválido. Utilize um dos seguintes valores: ${STATUS_PERMITIDOS.join(', ')}.`,
      400,
    );
  }

  const statusAtual = pedidos[indice].status;
  if (!TRANSICOES_PERMITIDAS[statusAtual].includes(novoStatus)) {
    throw new AppError(
      `Transição de status não permitida: '${statusAtual}' para '${novoStatus}'.`,
      400,
      [`Próximos status permitidos: ${TRANSICOES_PERMITIDAS[statusAtual].join(', ') || 'nenhum (status final)'}.`],
    );
  }

  pedidos[indice] = { ...pedidos[indice], status: novoStatus };
  return { ...pedidos[indice] };
}

// Auxiliar exportado para os testes, evitando que um teste afete outro.
function resetarPedidos() {
  pedidos = [];
  proximoId = 1;
}

module.exports = {
  TIPOS_PERMITIDOS,
  PRIORIDADES_PERMITIDAS,
  STATUS_PERMITIDOS,
  TRANSICOES_PERMITIDAS,
  cadastrarPedido,
  listarPedidos,
  buscarPedidoPorId,
  atualizarStatusPedido,
  resetarPedidos,
};
