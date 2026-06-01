const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User           = require('../models/User');

const callbackURL = process.env.NODE_ENV === 'production'
  ? 'https://brivox-api.onrender.com/api/auth/google/callback'
  : 'http://localhost:5000/api/auth/google/callback';

console.log('✓ Passport config loading...');
console.log('  callbackURL:', callbackURL);
console.log('  GOOGLE_CLIENT_ID set:', !!process.env.GOOGLE_CLIENT_ID);
console.log('  GOOGLE_CLIENT_SECRET set:', !!process.env.GOOGLE_CLIENT_SECRET);

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  callbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth callback hit, profile id:', profile.id);

      let user = await User.findOne({ googleId: profile.id });
      if (user) return done(null, user);

      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('No email returned from Google'), null);

      const emailUser = await User.findOne({ email });
      if (emailUser) {
        emailUser.googleId = profile.id;
        emailUser.avatar   = profile.photos?.[0]?.value || emailUser.avatar;
        emailUser.provider = 'google';
        await emailUser.save();
        return done(null, emailUser);
      }

      user = await User.create({
        googleId: profile.id,
        name:     profile.displayName || 'BRIVOX User',
        email:    email,
        avatar:   profile.photos?.[0]?.value || '',
        provider: 'google',
        password: null
      });

      console.log('✓ New Google user created:', email);
      return done(null, user);

    } catch (err) {
      console.error('Google Strategy Error:', err.message);
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

console.log('✓ Passport Google strategy registered');