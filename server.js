const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

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

    // Salva no banco de dados
    db.run(`INSERT INTO convidados2 (nome, acompanhantes) VALUES (?, ?)`,
        [nome, acompanhantes],
        (err) => {
            if (err) {
                console.error(err.message);
                return res.send('Erro ao salvar confirmação.');
            }

            // Também salva no CSV
            const linha = `"${nome}",${acompanhantes}\n`;
            const arquivoCSV = path.join(__dirname, 'convidados.csv');
            const cabecalho = 'Nome,Acompanhantes\n';

            if (!fs.existsSync(arquivoCSV)) {
                fs.writeFileSync(arquivoCSV, cabecalho, { encoding: 'utf8' });
            }

            fs.appendFileSync(arquivoCSV, linha, { encoding: 'utf8' });

            res.redirect('/confirmacao.html');
        }
    );
});

// Rota para listar convidados do CSV
app.get('/admin/convidados', (req, res) => {
    const arquivoCSV = path.join(__dirname, 'convidados.csv');

    if (!fs.existsSync(arquivoCSV)) {
        return res.send('<h1>Lista de Convidados</h1><p>Nenhum convidado confirmado ainda.</p>');
    }

    const conteudo = fs.readFileSync(arquivoCSV, 'utf8');
    const linhas = conteudo.trim().split('\n').slice(1); // remove cabeçalho

    let resposta = '<h1>Lista de Convidados Confirmados</h1><ul>';
    linhas.forEach(linha => {
        const [nome, acompanhantes] = linha.split(',');
        resposta += `<li>${nome.replace(/"/g, '')} - ${acompanhantes} acompanhante(s)</li>`;
    });
    resposta += '</ul>';

    res.send(resposta);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
