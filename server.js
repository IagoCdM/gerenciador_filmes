import Fastify from 'fastify'
import { Pool } from 'pg'

const sql = new Pool({
 user: "postgres",
 password: "senai",
 host: "localhost",
 port: 5432,
 database: "cinema_db"
})
const servidor = Fastify()

servidor.get('/usuarios', async (request, reply) => {
 const resultado = await sql.query('SELECT * FROM usuario')
 return resultado.rows
})

servidor.post('/usuarios', async (request, reply) => {
 const { nome, senha } = request.body;
 if (!nome || !senha) {
 return reply.status(400).send({ error: 'Nome ou Senha Inválidos!' })
 }
 await sql.query('INSERT INTO usuario (nome, senha) VALUES ($1, $2)', [nome, senha])
 return reply.status(201).send({ mensagem: "Usuário cadastrado com sucesso!" })
})

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

servidor.delete('/usuarios/:id', async (request, reply) => {
 const { id } = request.params
 await sql.query('DELETE FROM usuario WHERE id = $1', [id])
 return reply.status(204).send()
})

servidor.listen({
 port: 3000
}).then(() => {
 console.log("Servidor rodando em http://localhost:3000")
})

servidor.post('/filmes', async (request, reply) => {
  const { titulo, genero, ano_lancamento, diretor } = request.body;
  if (!titulo) {
    return reply.status(400).send({ error: 'O título do filme é obrigatório!' });
  }
 await sql.query(
    'INSERT INTO filmes (titulo, genero, ano_lancamento, diretor) VALUES ($1, $2, $3, $4)',
    [titulo, genero, ano_lancamento, diretor]
  );

  return reply.status(201).send({ mensagem: "Filme cadastrado com sucesso!" });
});

servidor.get('/filmes', async (request, reply) => {
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
  await sql.query(
    'UPDATE filmes SET titulo = $1, genero = $2, ano_lancamento = $3, diretor = $4 WHERE id = $5',
    [titulo, genero, ano_lancamento, diretor, id]
  );

  return { mensagem: 'Filme alterado com sucesso!' };
});
servidor.delete('/filmes/:id', async (request, reply) => {
  const { id } = request.params

  const busca = await sql.query('SELECT * FROM filmes WHERE id = $1', [id])
  
  if (busca.rows.length === 0) {
    return reply.status(404).send({ error: 'Filme não encontrado!' })
  }
  await sql.query('DELETE FROM filmes WHERE id = $1', [id])
  return reply.status(204).send()
})
