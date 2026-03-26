const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { getDb } = require("../database"); // ajusta caminho se precisar

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {

    const db = getDb();
    const email = profile.emails[0].value;

    try {
      let user = await db.get(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (!user) {
        const result = await db.run(
          "INSERT INTO users (email, googleId) VALUES (?, ?)",
          [email, profile.id]
        );

        user = { id: result.lastID, email };

      } else if (!user.googleId) {
        await db.run(
          "UPDATE users SET googleId = ? WHERE id = ?",
          [profile.id, user.id]
        );
      }

      return done(null, user);

    } catch (error) {
      return done(error, null);
    }
  }
));

// ⚠️ só precisa disso se usar sessão (provavelmente você NÃO usa)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = getDb();
    const user = await db.get(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;