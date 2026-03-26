const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const os = require("os");
require("dotenv").config();
console.log(process.env.GOOGLE_CLIENT_ID);

const app = express();
const PORT = 3000;

// 🔥 importa sua strategy (isso já registra no passport)
require("./src/config/passportgoogle/googlestrategy");

const passport = require("passport");

const { connectDatabase } = require("./src/config/database");

const authRoutes = require("./src/routes/auth.routes");
const clientesRoutes = require("./src/routes/clientes.routes");
const profileRoutes = require("./src/routes/profile.routes");

// Middlewares globais
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Rotas
app.use("/auth", authRoutes);
app.use("/clientes", clientesRoutes);
app.use("/profile", profileRoutes);

// Inicialização
async function start() {
    await connectDatabase();

    app.listen(PORT, "0.0.0.0", () => {
        const interfaces = os.networkInterfaces();
        let ipLocal = "localhost";

        for (let nome in interfaces) {
            for (const iface of interfaces[nome]) {
                if (iface.family === "IPv4" && !iface.internal) {
                    ipLocal = iface.address;
                }
            }
        }

        console.log("🚀 SERVIDOR RODANDO");
        console.log("No PC: http://localhost:" + PORT);
        console.log("No Celular: http://" + ipLocal + ":" + PORT);
    });
}

start();