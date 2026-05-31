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
    const user = await User.create({ name, email, password, avatar, provider: 'local' });
    const token = makeToken(user._id);
    setCookie(res, token);
    return res.json({
      _id: user._id, name: user.name,
      email: user.email, avatar: user.avatar,
      provider: user.provider, token
    });
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
    return res.json({
      _id: user._id, name: user.name,
      email: user.email, avatar: user.avatar,
      provider: user.provider, token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GOOGLE - start
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// GOOGLE - callback — pass token in URL so frontend can store it
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=google`, session: false }),
  (req, res) => {
    const token = makeToken(req.user._id);
    setCookie(res, token);
    // Also pass token in URL as fallback for cross-domain
    res.redirect(`${process.env.CLIENT_URL}/auth-callback?token=${token}`);
  }
);

// ME
router.get('/me', require('../middleware/authMiddleware'), (req, res) => {
  const u = req.user;
  res.json({
    _id: u._id, name: u.name,
    email: u.email, avatar: u.avatar,
    provider: u.provider
  });
});

// LOGOUT
router.get('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
  res.json({ message: 'Logged out' });
});

module.exports = router;