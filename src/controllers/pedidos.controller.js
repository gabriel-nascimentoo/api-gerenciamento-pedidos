const pedidosService = require('../services/pedidos.service');

function cadastrar(req, res, next) {
  try {
    const pedido = pedidosService.cadastrarPedido(req.body);
    return res.status(201).json(pedido);
  } catch (erro) {
    return next(erro);
  }
}

function listar(req, res, next) {
  try {
    return res.status(200).json(pedidosService.listarPedidos());
  } catch (erro) {
    return next(erro);
  }
}

function consultarPorId(req, res, next) {
  try {
    const pedido = pedidosService.buscarPedidoPorId(req.params.id);
    return res.status(200).json(pedido);
  } catch (erro) {
    return next(erro);
  }
}

function atualizarStatus(req, res, next) {
  try {
    const pedido = pedidosService.atualizarStatusPedido(req.params.id, req.body?.status);
    return res.status(200).json(pedido);
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { cadastrar, listar, consultarPorId, atualizarStatus };
