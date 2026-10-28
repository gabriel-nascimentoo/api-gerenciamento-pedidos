const request = require('supertest');
const app = require('../src/app');
const pedidosService = require('../src/services/pedidos.service');

const pedidoValido = {
  cliente: 'Carlos Silva',
  tipo: 'entrega',
  valor: 350,
  prioridade: 'normal',
};

beforeEach(() => {
  pedidosService.resetarPedidos();
});

describe('API de Gerenciamento de Pedidos', () => {
  test('POST /pedidos cadastra um pedido válido com HTTP 201', async () => {
    const resposta = await request(app).post('/pedidos').send(pedidoValido);

    expect(resposta.status).toBe(201);
    expect(resposta.body).toEqual({ id: 1, ...pedidoValido, status: 'recebido' });
  });

  test('POST /pedidos rejeita cliente vazio ou apenas com espaços com HTTP 400', async () => {
    const resposta = await request(app).post('/pedidos').send({ ...pedidoValido, cliente: '   ' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('Dados inválidos para cadastrar o pedido.');
    expect(resposta.body.detalhes).toEqual(expect.arrayContaining([
      "O campo 'cliente' é obrigatório e não pode ficar vazio.",
    ]));
  });

  test('POST /pedidos rejeita valor não numérico ou menor/igual a zero com HTTP 400', async () => {
    for (const valor of ['350', 0, -10]) {
      const resposta = await request(app).post('/pedidos').send({ ...pedidoValido, valor });
      expect(resposta.status).toBe(400);
      expect(resposta.body.detalhes).toContain("O campo 'valor' deve ser numérico e maior que zero.");
    }
  });

  test('POST /pedidos rejeita tipo e prioridade não reconhecidos com HTTP 400', async () => {
    const resposta = await request(app).post('/pedidos').send({
      ...pedidoValido,
      tipo: 'correio',
      prioridade: 'super urgente',
    });

    expect(resposta.status).toBe(400);
    expect(resposta.body.detalhes).toHaveLength(2);
  });

  test('GET /pedidos lista os pedidos cadastrados com HTTP 200', async () => {
    await request(app).post('/pedidos').send(pedidoValido);

    const resposta = await request(app).get('/pedidos');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(1);
    expect(resposta.body[0].cliente).toBe('Carlos Silva');
  });

  test('GET /pedidos/:id retorna um pedido existente com HTTP 200', async () => {
    await request(app).post('/pedidos').send(pedidoValido);

    const resposta = await request(app).get('/pedidos/1');

    expect(resposta.status).toBe(200);
    expect(resposta.body.id).toBe(1);
  });

  test('GET /pedidos/:id retorna HTTP 404 para ID inexistente', async () => {
    const resposta = await request(app).get('/pedidos/999999');

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro).toBe('Pedido não encontrado.');
  });

  test('PATCH /pedidos/:id/status atualiza status válido com HTTP 200', async () => {
    await request(app).post('/pedidos').send(pedidoValido);

    const resposta = await request(app)
      .patch('/pedidos/1/status')
      .send({ status: 'em_preparacao' });

    expect(resposta.status).toBe(200);
    expect(resposta.body.status).toBe('em_preparacao');
  });

  test('PATCH /pedidos/:id/status rejeita status inválido com HTTP 400', async () => {
    await request(app).post('/pedidos').send(pedidoValido);

    const resposta = await request(app)
      .patch('/pedidos/1/status')
      .send({ status: 'aguardando_pagamento' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toMatch(/Status inválido/);
  });

  test('PATCH /pedidos/:id/status rejeita transição não permitida com HTTP 400', async () => {
    await request(app).post('/pedidos').send(pedidoValido);

    const resposta = await request(app)
      .patch('/pedidos/1/status')
      .send({ status: 'entregue' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toMatch(/Transição de status não permitida/);
  });

  test('PATCH /pedidos/:id/status retorna HTTP 404 quando o pedido não existe', async () => {
    const resposta = await request(app)
      .patch('/pedidos/999999/status')
      .send({ status: 'cancelado' });

    expect(resposta.status).toBe(404);
  });

  test('responde HTTP 400 em corpo JSON malformado com resposta JSON', async () => {
    const resposta = await request(app)
      .post('/pedidos')
      .set('Content-Type', 'application/json')
      .send('{"cliente":');

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('JSON inválido no corpo da requisição.');
  });
});
