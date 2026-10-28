const express = require('express');
const pedidosController = require('../controllers/pedidos.controller');

const router = express.Router();

router.post('/', pedidosController.cadastrar);
router.get('/', pedidosController.listar);
router.get('/:id', pedidosController.consultarPorId);
router.patch('/:id/status', pedidosController.atualizarStatus);

module.exports = router;
