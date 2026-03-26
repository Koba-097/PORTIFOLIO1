const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// 1. Rotas de Entrada Manual
router.post("/register", authController.register);
router.post("/login", authController.login);

// 2. Rota para Iniciar Login com Google
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 3. Callback do Google (Onde o Google devolve o usuário)
router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // Cria o Token JWT
    const token = jwt.sign(
      { id: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Define o cookie com o token
    // Nota: mudei httpOnly para false temporariamente para o seu JS conseguir ler o cookie.
    // Se quiser manter true por segurança, precisaria de uma rota de /me.
   // No callback do google:
res.cookie('auth_token', token, {
    httpOnly: false, // OBRIGATÓRIO para o seu script.js conseguir ler
    secure: false,   // coloque true apenas se estiver usando HTTPS
    path: '/'        // garante que o cookie funcione em qualquer rota
});

res.redirect('/');
  }
);

module.exports = router;