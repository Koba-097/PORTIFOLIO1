const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getDb } = require("../config/database");

const SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
    const db = getDb();
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email e senha obrigatórios" });
    }

    const userExists = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (userExists) {
        return res.status(400).json({ error: "Usuário já existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword]);

    res.json({ message: "Usuário criado com sucesso" });
};

exports.login = async (req, res) => {
    const db = getDb();
    const { email, password } = req.body;

    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
        return res.status(400).json({ error: "Usuário não encontrado" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1d" });
    res.json({ token });
};