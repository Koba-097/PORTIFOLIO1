const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();

//configura express para entender json e servir frontend----------------------
app.use(express.json());
app.use(express.static(path.join(__dirname,'frontend')));

//função de conectar banco de dados----------------------
async function conectarBanco( {
    return open({
        filename: './database/database.db',
        driver: sqlite3.Database
    })
}

db.exec (`
   CREATE TABLE IF NOT EXISTS clientes (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     nome TEXT NOT NULL
   )
`);

//rota principal q abre HTML--------------------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'script.html'));
    });

//inicia server-----------------------------------
app.listen(3000, () => {
    console.log("🚀 SERVIDOR RODANDO EM http://localhost:3000");
    });
