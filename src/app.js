const express = require('express');
const pedidosRoutes = require('./routes/pedidos.routes');
const AppError = require('./errors/AppError');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ mensagem: 'API de Gerenciamento de Pedidos', status: 'online' });
});

app.use('/pedidos', pedidosRoutes);

app.use((req, res, next) => {
  next(new AppError('Rota não encontrada.', 404));
});

app.use(errorHandler);

module.exports = app;
