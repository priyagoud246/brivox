const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User           = require('../models/User');

const CALLBACK_URL = process.env.NODE_ENV === 'production'
  ? 'https://brivox-api.onrender.com/api/auth/google/callback'
  : 'http://localhost:5000/api/auth/google/callback';

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // Check if email already exists (registered with email/password)
      const emailUser = await User.findOne({ email: profile.emails[0].value });
      if (emailUser) {
        // Link Google to existing account
        emailUser.googleId = profile.id;
        emailUser.avatar   = profile.photos[0]?.value || emailUser.avatar;
        emailUser.provider = 'google';
        await emailUser.save();
        return done(null, emailUser);
      }

      // Create new user
      user = await User.create({
        googleId: profile.id,
        name:     profile.displayName,
        email:    profile.emails[0].value,
        avatar:   profile.photos[0]?.value || '',
        provider: 'google'
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done)   => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});