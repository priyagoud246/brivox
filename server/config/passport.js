const passport = require('passport');
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
console.log('✓ Passport loaded (minimal mode)');