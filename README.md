# API de Gerenciamento de Pedidos

Projeto prático avaliativo da disciplina **Tópicos Avançados em Sistemas de Informação II**. A API foi feita com Node.js, Express e JavaScript, com armazenamento em memória e arquitetura em camadas.

## 1. Requisitos

- Node.js 18 ou superior (recomendado).
- npm.
- Postman para os testes manuais.

## 2. Instalação e execução

No terminal, entre na pasta do projeto e execute:

```bash
npm install
npm start
```

A API ficará disponível em `http://localhost:3000`. A rota `GET /` retorna uma mensagem simples indicando que o servidor está online.

Para executar os testes automatizados:

```bash
npm test
```

O comando `npm run dev` também está disponível para reiniciar o servidor durante o desenvolvimento, usando o modo watch do Node.js.

## 3. Endpoints

| Método | Rota | Resultado esperado |
|---|---|---|
| `POST` | `/pedidos` | Cadastra um pedido válido e retorna `201 Created`. |
| `GET` | `/pedidos` | Lista os pedidos e retorna `200 OK`. |
| `GET` | `/pedidos/:id` | Retorna `200 OK` se existe; caso contrário, `404 Not Found`. |
| `PATCH` | `/pedidos/:id/status` | Atualiza o status e retorna `200 OK`; dados inválidos retornam `400`; ID inexistente retorna `404`. |

### Exemplo de cadastro

Requisição `POST http://localhost:3000/pedidos`, com `Body > raw > JSON`:

```json
{
  "cliente": "Carlos Silva",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "normal"
}
```

Exemplo de resposta (`201`):

```json
{
  "id": 1,
  "cliente": "Carlos Silva",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "normal",
  "status": "recebido"
}
```

### Exemplo de atualização de status

Requisição `PATCH http://localhost:3000/pedidos/1/status`, com o corpo:

```json
{
  "status": "em_preparacao"
}
```

O retorno `200` contém o pedido atualizado. O ID `1` é apenas um exemplo; utilize um ID que exista na execução atual.

## 4. Regras de validação e valores aceitos

- `cliente`: texto obrigatório; espaços nas extremidades são removidos e um texto vazio ou composto somente por espaços é rejeitado.
- `tipo`: `entrega` ou `retirada`.
- `valor`: precisa ser um número JSON maior que zero. Uma string como `"350"` não é considerada um número válido.
- `prioridade`: `baixa`, `normal` ou `alta`.
- `status`: `recebido`, `em_preparacao`, `enviado`, `entregue` ou `cancelado`.
- As requisições inválidas retornam JSON com uma mensagem explicativa e HTTP `400`.
- IDs inválidos ou inexistentes retornam HTTP `404`.
- Erros inesperados retornam HTTP `500` com uma mensagem genérica, sem expor detalhes internos.
- JSON malformado retorna HTTP `400` e uma resposta JSON.

### Transições de status

Para evitar mudanças arbitrárias, a API aplica as seguintes transições:

| Status atual | Próximos status permitidos |
|---|---|
| `recebido` | `em_preparacao`, `cancelado` |
| `em_preparacao` | `enviado`, `cancelado` |
| `enviado` | `entregue` |
| `entregue` | Nenhum: status final |
| `cancelado` | Nenhum: status final |

Por exemplo, não é permitido alterar diretamente um pedido de `recebido` para `entregue`. Quando uma transição não é permitida, a API retorna `400` e explica o motivo.

## 5. Arquitetura em camadas

- `src/routes/pedidos.routes.js`: associa métodos HTTP e rotas às funções do controller.
- `src/controllers/pedidos.controller.js`: recebe a requisição, chama o service e define o código de resposta HTTP.
- `src/services/pedidos.service.js`: contém validações, regras de negócio, transições de status e armazenamento em memória.
- `src/middlewares/errorHandler.js`: padroniza as respostas de erro, incluindo JSON malformado e erros inesperados.
- `src/errors/AppError.js`: representa erros conhecidos da aplicação com código HTTP e detalhes opcionais.
- `src/app.js`: configura Express e registra rotas e middlewares.
- `src/server.js`: inicia o servidor HTTP.
- `tests/pedidos.test.js`: testes automatizados com Jest e Supertest.
- `postman/`: coleção importável para testes manuais.
- `evidencias/`: local para guardar as cinco capturas reais do Postman.

## 6. Testes no Postman

1. Inicie a API com `npm start` e mantenha o terminal aberto.
2. No Postman, selecione **Import** e importe `postman/API-Gerenciamento-de-Pedidos.postman_collection.json`.
3. Execute as requisições da coleção na ordem apresentada, começando por **01 - Criar pedido válido**. Essa requisição salva o ID retornado para a requisição de atualização.
4. Confira os códigos HTTP e os corpos das respostas.
5. Faça capturas legíveis das cinco situações descritas em `evidencias/README.md` e salve com os nomes especificados.

A coleção possui verificações de status HTTP e algumas verificações de conteúdo, mas as capturas precisam ser feitas após uma execução real no Postman.

## 7. Armazenamento

Os pedidos ficam em memória, conforme permitido no enunciado. Portanto, os dados são perdidos quando o processo do servidor é encerrado ou reiniciado. Não é necessário configurar banco de dados.

## 8. Uso de IA

A IA foi utilizada como apoio para estruturar a solução, elaborar validações, propor as transições de status, preparar testes automatizados e organizar a documentação. Uma sugestão aplicada foi centralizar o tratamento de erros em um middleware, para manter respostas JSON consistentes e evitar a exposição de detalhes internos em erros inesperados. Outra decisão documentada foi restringir as transições de status para que um pedido não avance diretamente de `recebido` para `entregue`.

O aluno deve executar a aplicação e os testes, conferir os comportamentos, compreender as responsabilidades de cada camada e ajustar a documentação se modificar alguma regra antes da entrega. O uso de IA não substitui a responsabilidade pelo código entregue.

## 9. Checklist antes de entregar

- [ ] Executar `npm install`, `npm start` e `npm test` no computador de entrega.
- [ ] Importar a coleção no Postman e produzir as cinco capturas reais dentro de `evidencias/`.
- [ ] Criar/publicar o repositório no GitHub e enviar o link junto ao RA, conforme orientação do professor.
- [ ] Manter pelo menos cinco commits significativos no histórico do Git, feitos com a conta do aluno.
- [ ] Confirmar que código, README, coleção e capturas estão consistentes.
- [ ] Não enviar `node_modules`, senhas, tokens ou credenciais.
