const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = 3000;
//configura express para entender json e servir frontend----------------------
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

//função de conectar banco de dados----------------------
async function start() {
    const db = await open({

        filename: path.resolve('database.db'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL
        )
    `);

//rota principal q abre HTML--------------------
    app.get('/clientes', async (req, res) => {
        const clientes = await db.all('SELECT * FROM clientes');
        res.json(clientes);
});

    app.post('/clientes', async (req, res) => {
        const { nome } = req.body;
        const result = await db.run(
            'INSERT INTO clientes (nome) VALUES (?)',
            nome
        );
        res.json({ id: result.lastID, nome});
    });



//inicia server-----------------------------------
    app.listen(3000, () => {
    console.log('🚀 SERVIDOR RODANDO EM http://localhost:3000');
    });
}

start();
