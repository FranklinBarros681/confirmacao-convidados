const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Banco de Dados SQLite
const db = new sqlite3.Database('./convidados.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS convidados2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    acompanhantes INTEGER NOT NULL
  )`);
});

// Rota para receber confirmações
app.post('/confirmar', (req, res) => {
  const { nome, email, acompanhantes } = req.body;
  
  db.run(`INSERT INTO convidados2 (nome, acompanhantes) VALUES (?, ?)`,
    [nome, acompanhantes],
    (err) => {
      if (err) {
        console.error(err.message);
        return res.send('Erro ao salvar confirmação.');
      }
      res.redirect('/confirmacao.html');
    }
  );
});

// (Opcional) Rota para listar convidados
app.get('/admin/convidados', (req, res) => {
  db.all('SELECT * FROM convidados2', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.send('Erro ao buscar convidados.');
      return;
    }
    let resposta = '<h1>Lista de Convidados Confirmados</h1><ul>';
    rows.forEach((row) => {
      resposta += `<li>${row.nome} - ${row.acompanhantes} acompanhante(s)</li>`;
    });
    resposta += '</ul>';
    res.send(resposta);
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
