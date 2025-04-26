
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let convidados = [];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/confirmar', (req, res) => {
  const { nome, quantidade } = req.body;
  convidados.push({ nome, quantidade });
  res.send('<h2>Confirmação recebida! Obrigado.</h2><a href="/">Voltar</a>');
});

app.get('/admin/convidados', (req, res) => {
  let html = '<h1>Lista de Convidados Confirmados</h1><ul>';
  convidados.forEach(c => {
    html += `<li>${c.nome} - ${c.quantidade} pessoas</li>`;
  });
  html += '</ul><a href="/">Voltar</a>';
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
