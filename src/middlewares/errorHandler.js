function errorHandler(erro, req, res, next) {
  // JSON malformado enviado por express.json() também recebe uma resposta JSON.
  if (erro instanceof SyntaxError && erro.status === 400 && Object.prototype.hasOwnProperty.call(erro, 'body')) {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }

  if (Number.isInteger(erro.statusCode)) {
    const resposta = { erro: erro.message };
    if (Array.isArray(erro.details) && erro.details.length > 0) {
      resposta.detalhes = erro.details;
    }
    return res.status(erro.statusCode).json(resposta);
  }

  // Não expõe mensagens internas ou detalhes técnicos para o cliente.
  console.error(erro);
  return res.status(500).json({ erro: 'Ocorreu um erro interno no servidor.' });
}

module.exports = errorHandler;
