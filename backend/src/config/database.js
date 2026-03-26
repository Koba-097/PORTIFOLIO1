const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

let db;

async function connectDatabase() {
    db = await open({
        filename: path.resolve("./database.db"),
        driver: sqlite3.Database
    });

    // 1. Criação das tabelas (se não existirem)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT,
            googleId TEXT UNIQUE
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            owner_id INTEGER,
            FOREIGN KEY (owner_id) REFERENCES users(id)
        );
    `);

    // 2. Garantir que a coluna 'googleId' exista na tabela 'users'
    // (Caso a tabela tenha sido criada antes de você adicionar o campo no código)
    try {
        await db.exec(`ALTER TABLE users ADD COLUMN googleId TEXT UNIQUE`);
        console.log("Coluna googleId adicionada com sucesso na tabela users.");
    } catch (error) {
        if (error.message.includes("duplicate column name")) {
            console.log("Coluna googleId já existe na tabela users.");
        } else {
            console.error("Erro ao verificar coluna googleId:", error.message);
        }
    }

    // 3. Garantir que a coluna 'email' exista na tabela 'clientes'
    try {
        await db.exec(`ALTER TABLE clientes ADD COLUMN email TEXT`);
        console.log("Coluna email adicionada na tabela clientes.");
    } catch (error) {
        if (error.message.includes("duplicate column name")) {
            console.log("Coluna email já existe em clientes.");
        } else {
            console.error("Erro ao alterar tabela clientes:", error);
        }
    }

    console.log("Banco conectado com sucesso.");
}

function getDb() {
    return db;
}

module.exports = { connectDatabase, getDb };