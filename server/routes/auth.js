const router   = require('express').Router();
const passport = require('passport');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');

const isProd = process.env.NODE_ENV === 'production';

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000
  });
};

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: 'Email already registered' });
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a56db&color=fff&bold=true`;
    const user   = await User.create({ name, email, password, avatar, provider: 'local' });
    const token  = makeToken(user._id);
    setCookie(res, token);
    return res.json({ _id: user._id, name: user.name, email: user.email, avatar: user.avatar, provider: user.provider, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });
    const user = await User.findOne({ email });
    if (!user || user.provider === 'google')
      return res.status(401).json({ error: 'Invalid email or password' });
    const match = await user.matchPassword(password);
    if (!match)
      return res.status(401).json({ error: 'Invalid email or password' });
    const token = makeToken(user._id);
    setCookie(res, token);
    return res.json({ _id: user._id, name: user.name, email: user.email, avatar: user.avatar, provider: user.provider, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GOOGLE — start
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

// GOOGLE — callback handled manually, no passport middleware here
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      console.error('No code in Google callback');
      return res.redirect(`${process.env.CLIENT_URL}/login?error=nocode`);
    }

    // Exchange code for tokens manually using googleapis
    const { google } = require('googleapis');

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      isProd
        ? 'https://brivox-api.onrender.com/api/auth/google/callback'
        : 'http://localhost:5000/api/auth/google/callback'
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    console.log('Google profile:', profile.email);

    if (!profile.email) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=noemail`);
    }

    // Find or create user
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.findOne({ email: profile.email });
      if (user) {
        user.googleId = profile.id;
        user.avatar   = profile.picture || user.avatar;
        user.provider = 'google';
        await user.save();
      } else {
        user = await User.create({
          googleId: profile.id,
          name:     profile.name || 'BRIVOX User',
          email:    profile.email,
          avatar:   profile.picture || '',
          provider: 'google',
          password: null
        });
      }
    }

    const token = makeToken(user._id);
    setCookie(res, token);
    console.log('Google login success:', user.email);
    return res.redirect(`${process.env.CLIENT_URL}/auth-callback?token=${token}`);

  } catch (err) {
    console.error('Google callback error:', err.message);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=server`);
  }
});

// ME
router.get('/me', require('../middleware/authMiddleware'), (req, res) => {
  const u = req.user;
  res.json({ _id: u._id, name: u.name, email: u.email, avatar: u.avatar, provider: u.provider });
});

// LOGOUT
router.get('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' });
  res.json({ message: 'Logged out' });
});

module.exports = router;