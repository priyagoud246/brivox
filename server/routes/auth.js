const router  = require('express').Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const axios   = require('axios');
const User    = require('../models/User');

const isProd = process.env.NODE_ENV === 'production';

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = isProd
  ? 'https://brivox-api.onrender.com/api/auth/google/callback'
  : 'http://localhost:5000/api/auth/google/callback';

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

// ── REGISTER ──────────────────────────────────────────────
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
    return res.json({
      _id: user._id, name: user.name,
      email: user.email, avatar: user.avatar,
      provider: user.provider, token
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────
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
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GOOGLE STEP 1 — redirect to Google ────────────────────
router.get('/google', (req, res) => {
  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account'
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  console.log('→ Redirecting to Google');
  res.redirect(url);
});

// ── GOOGLE STEP 2 — callback ───────────────────────────────
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  console.log('← Google callback received');
  console.log('  code present:', !!code);
  console.log('  error:', error || 'none');
  console.log('  REDIRECT_URI used:', REDIRECT_URI);

  if (error || !code) {
    console.error('Google denied or no code:', error);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=denied`);
  }

  try {
    // Step A — Exchange code for tokens using URLSearchParams (works in Node 26)
    console.log('  Exchanging code for access token...');

    const tokenParams = new URLSearchParams();
    tokenParams.append('code',          code);
    tokenParams.append('client_id',     GOOGLE_CLIENT_ID);
    tokenParams.append('client_secret', GOOGLE_CLIENT_SECRET);
    tokenParams.append('redirect_uri',  REDIRECT_URI);
    tokenParams.append('grant_type',    'authorization_code');

    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      tokenParams.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, id_token } = tokenRes.data;
    console.log('  Access token received:', !!access_token);

    if (!access_token) {
      console.error('  No access token in response:', tokenRes.data);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_token`);
    }

    // Step B — Get user profile
    console.log('  Fetching user profile...');
    const profileRes = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${access_token}` }
      }
    );

    const profile = profileRes.data;
    console.log('  Profile email:', profile.email);
    console.log('  Profile name:', profile.name);
    console.log('  Profile id:', profile.id);

    if (!profile.email) {
      console.error('  No email in profile');
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_email`);
    }

    // Step C — Find or create user
    let user = await User.findOne({ googleId: profile.id });
    console.log('  Existing user by googleId:', !!user);

    if (!user) {
      user = await User.findOne({ email: profile.email });
      console.log('  Existing user by email:', !!user);

      if (user) {
        user.googleId = profile.id;
        user.avatar   = profile.picture || user.avatar;
        user.provider = 'google';
        await user.save();
        console.log('  Linked Google to existing user');
      } else {
        user = await User.create({
          googleId: profile.id,
          name:     profile.name  || 'BRIVOX User',
          email:    profile.email,
          avatar:   profile.picture || '',
          provider: 'google',
          password: null
        });
        console.log('  Created new user:', profile.email);
      }
    }

    // Step D — Create JWT and redirect
    const token = makeToken(user._id);
    setCookie(res, token);

    const redirectTo = `${process.env.CLIENT_URL}/auth-callback?token=${token}`;
    console.log('  Redirecting to frontend:', process.env.CLIENT_URL + '/auth-callback');
    return res.redirect(redirectTo);

  } catch (err) {
    console.error('Google callback FAILED:', err.message);
    if (err.response) {
      console.error('  HTTP status:', err.response.status);
      console.error('  Response:', JSON.stringify(err.response.data));
    }
    return res.redirect(`${process.env.CLIENT_URL}/login?error=server`);
  }
});

// ── ME ────────────────────────────────────────────────────
router.get('/me', require('../middleware/authMiddleware'), (req, res) => {
  const u = req.user;
  res.json({
    _id: u._id, name: u.name,
    email: u.email, avatar: u.avatar,
    provider: u.provider
  });
});

// ── LOGOUT ────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
  res.json({ message: 'Logged out' });
});

module.exports = router;