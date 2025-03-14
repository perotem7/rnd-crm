const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const setupPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      },
      (accessToken, refreshToken, profile, done) => {
        // Pass the profile to the route handler
        return done(null, profile);
      }
    )
  );

  // Serialize user into the session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize user from the session
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};

module.exports = setupPassport; 