const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User           = require('../models/User');

// Hard-coded callback URL based on environment
const CALLBACK_URL = process.env.NODE_ENV === 'production'
  ? 'https://brivox-api.onrender.com/api/auth/google/callback'
  : 'http://localhost:5000/api/auth/google/callback';

console.log('Passport callback URL:', CALLBACK_URL);
console.log('Google Client ID set:', !!process.env.GOOGLE_CLIENT_ID);
console.log('Google Secret set:',    !!process.env.GOOGLE_CLIENT_SECRET);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('ERROR: Google OAuth credentials missing from environment!');
} else {
  passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  CALLBACK_URL,
    scope:        ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        const emailUser = await User.findOne({ email: profile.emails[0].value });
        if (emailUser) {
          emailUser.googleId = profile.id;
          emailUser.avatar   = profile.photos?.[0]?.value || emailUser.avatar;
          emailUser.provider = 'google';
          await emailUser.save();
          return done(null, emailUser);
        }
        user = await User.create({
          googleId: profile.id,
          name:     profile.displayName,
          email:    profile.emails[0].value,
          avatar:   profile.photos?.[0]?.value || '',
          provider: 'google'
        });
      }
      return done(null, user);
    } catch (err) {
      console.error('Google Strategy Error:', err);
      return done(err, null);
    }
  }));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});