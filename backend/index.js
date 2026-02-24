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
    app.listen(PORT, '0.0.0.0', () => {
        const os = require('os');
        const interfaces = os.networkInterfaces();
        let ipLocal = 'localhost';

        for (let nome in interfaces) {
            for (let iface of interfaces[nome]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    ipLocal = iface.address;
                }
            }
        }

    console.log('🚀 SERVIDOR RODANDO');
    console.log('No PC: http//localhost:' + PORT);
    console.log('No Celular: http://' + ipLocal + ':' + PORT);
    });
}

start();
