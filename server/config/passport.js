const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User           = require('../models/User');

const callbackURL = process.env.NODE_ENV === 'production'
  ? 'https://brivox-api.onrender.com/api/auth/google/callback'
  : 'http://localhost:5000/api/auth/google/callback';

console.log('✓ Passport config loading, callback:', callbackURL);

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  callbackURL
  },
  (accessToken, refreshToken, profile, done) => {
    // We handle the actual user logic in the route
    // This just passes the profile through
    return done(null, profile);
  }
));

passport.serializeUser((user, done)   => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

console.log('✓ Passport Google strategy registered');