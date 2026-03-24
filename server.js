import Fastify from 'fastify'
import { Pool } from 'pg'
// Configuração da conexão com o Banco de Dados
const sql = new Pool({
 user: "postgres",
 password: "senai",
 host: "localhost",
 port: 5432,
 database: "cinema_db" // Certifique-se que o banco no pgAdmin tem este nome
})
const servidor = Fastify()
// --- ROTAS DE USUÁRIOS ---
// Listar todos os usuários
servidor.get('/usuarios', async (request, reply) => {
 const resultado = await sql.query('SELECT * FROM usuario')
 return resultado.rows
})
// Criar novo usuário
servidor.post('/usuarios', async (request, reply) => {
 const { nome, senha } = request.body;
 if (!nome || !senha) {
 return reply.status(400).send({ error: 'Nome ou Senha Inválidos!' })
 }
 await sql.query('INSERT INTO usuario (nome, senha) VALUES ($1, $2)', [nome, senha])
 return reply.status(201).send({ mensagem: "Usuário cadastrado com sucesso!" })
})
// Editar usuário existente
servidor.put('/usuarios/:id', async (request, reply) => {
 const { id } = request.params
 const { nome, senha } = request.body
 if (!nome || !senha) {
 return reply.status(400).send({ error: 'Nome ou senha inválidos!' })
 }
 const busca = await sql.query('SELECT * FROM usuario WHERE id = $1', [id])

 if (busca.rows.length === 0) {
 return reply.status(404).send({ error: 'Usuário não encontrado!' })
 }
 await sql.query('UPDATE usuario SET nome = $1, senha = $2 WHERE id = $3', [nome,
senha, id])
 return { mensagem: 'Usuário alterado com sucesso!' }
})
// Deletar usuário
servidor.delete('/usuarios/:id', async (request, reply) => {
 const { id } = request.params
 await sql.query('DELETE FROM usuario WHERE id = $1', [id])
 return reply.status(204).send()
})
// --- O ALUNO DEVE CRIAR AS ROTAS DE /FILMES ABAIXO ---
// Inicialização do Servidor
servidor.listen({
 port: 3000
}).then(() => {
 console.log("Servidor rodando em http://localhost:3000")
})

servidor.post('/filmes', async (request, reply) => {
  // Pegamos todos os campos que você definiu na tabela
  const { titulo, genero, ano_lancamento, diretor } = request.body;

  // Validação simples (o título é NOT NULL, então é obrigatório)
  if (!titulo) {
    return reply.status(400).send({ error: 'O título do filme é obrigatório!' });
  }

  // Note que usamos $1, $2, $3, $4 para os quatro campos
  await sql.query(
    'INSERT INTO filmes (titulo, genero, ano_lancamento, diretor) VALUES ($1, $2, $3, $4)',
    [titulo, genero, ano_lancamento, diretor]
  );

  return reply.status(201).send({ mensagem: "Filme cadastrado com sucesso!" });
});
servidor.get('/filmes', async (request, reply) => {
  // Buscamos tudo da tabela 'filmes' que você criou
  const resultado = await sql.query('SELECT * FROM filmes')
  return resultado.rows
})
servidor.put('/filmes/:id', async (request, reply) => {
  const { id } = request.params;
  const { titulo, genero, ano_lancamento, diretor } = request.body;

  const busca = await sql.query('SELECT * FROM filmes WHERE id = $1', [id]);
  if (busca.rows.length === 0) {
    return reply.status(404).send({ error: 'Filme não encontrado!' });
  }

  // Atualizamos todos os campos baseados no ID
  await sql.query(
    'UPDATE filmes SET titulo = $1, genero = $2, ano_lancamento = $3, diretor = $4 WHERE id = $5',
    [titulo, genero, ano_lancamento, diretor, id]
  );

  return { mensagem: 'Filme alterado com sucesso!' };
});
servidor.delete('/filmes/:id', async (request, reply) => {
  const { id } = request.params

  // Primeiro, verificamos se o filme existe (opcional, mas boa prática)
  const busca = await sql.query('SELECT * FROM filmes WHERE id = $1', [id])
  
  if (busca.rows.length === 0) {
    return reply.status(404).send({ error: 'Filme não encontrado!' })
  }

  // Se existir, deletamos
  await sql.query('DELETE FROM filmes WHERE id = $1', [id])
  
  // Status 204 significa "No Content" (Sucesso, mas sem corpo na resposta)
  return reply.status(204).send()
})