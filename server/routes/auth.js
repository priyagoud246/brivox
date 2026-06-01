const router  = require('express').Router();
const jwt     = require('jsonwebtoken');
const axios   = require('axios');
const User    = require('../models/User');

const isProd = process.env.NODE_ENV === 'production';

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const getRedirectURI = () => isProd
  ? 'https://brivox-api.onrender.com/api/auth/google/callback'
  : 'http://localhost:5000/api/auth/google/callback';

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });
};

// ── DEBUG ─────────────────────────────────────────────────
router.get('/google/test', (req, res) => {
  const REDIRECT_URI = getRedirectURI();
  res.json({
    REDIRECT_URI,
    GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID?.slice(0, 20) + '...',
    NODE_ENV: process.env.NODE_ENV,
    CLIENT_URL: process.env.CLIENT_URL,
  });
});

// ── REGISTER ──────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password min 6 chars' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: 'Email already registered' });

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a56db&color=fff&bold=true`;
    const user   = await User.create({ name, email, password, avatar, provider: 'local' });
    const token  = makeToken(user._id);
    setCookie(res, token);
    return res.json({ _id:user._id, name:user.name, email:user.email, avatar:user.avatar, provider:user.provider, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || user.provider === 'google')
      return res.status(401).json({ error: 'Invalid email or password' });

    const match = await user.matchPassword(password);
    if (!match)
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = makeToken(user._id);
    setCookie(res, token);
    return res.json({ _id:user._id, name:user.name, email:user.email, avatar:user.avatar, provider:user.provider, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GOOGLE STEP 1 ─────────────────────────────────────────
router.get('/google', (req, res) => {
  const REDIRECT_URI = getRedirectURI();
  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// ── GOOGLE STEP 2 — callback ───────────────────────────────
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;
  const REDIRECT_URI    = getRedirectURI();
  const CLIENT_URL      = process.env.CLIENT_URL;

  console.log('=== Google Callback ===');
  console.log('code present:', !!code);
  console.log('error:', error || 'none');
  console.log('REDIRECT_URI:', REDIRECT_URI);
  console.log('CLIENT_URL:', CLIENT_URL);

  if (error || !code) {
    return res.redirect(`${CLIENT_URL}/login?error=denied`);
  }

  try {
    // A — Exchange code for token
    console.log('Step A: exchanging code...');
    const tokenParams = new URLSearchParams({
      code,
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    });

    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      tokenParams.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const { access_token } = tokenRes.data;
    console.log('Step A done — access_token:', !!access_token);

    if (!access_token) {
      console.error('No access_token in response:', tokenRes.data);
      return res.redirect(`${CLIENT_URL}/login?error=no_token`);
    }

    // B — Get profile
    console.log('Step B: fetching profile...');
    const { data: profile } = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    console.log('Step B done — email:', profile.email, 'id:', profile.id);

    if (!profile.email) {
      return res.redirect(`${CLIENT_URL}/login?error=no_email`);
    }

    // C — Find or create user (NO .save() to avoid pre-save hook issues)
    console.log('Step C: finding/creating user...');
    let user = await User.findOne({ googleId: profile.id });
    console.log('Found by googleId:', !!user);

    if (!user) {
      user = await User.findOne({ email: profile.email });
      console.log('Found by email:', !!user);

      if (user) {
        // Update existing user using findByIdAndUpdate to bypass pre-save hook
        user = await User.findByIdAndUpdate(
          user._id,
          {
            googleId: profile.id,
            avatar:   profile.picture || user.avatar,
            provider: 'google',
          },
          { new: true }
        );
        console.log('Linked Google to existing user');
      } else {
        // Create new Google user — password is null so pre-save hook skips hashing
        user = await User.create({
          googleId: profile.id,
          name:     profile.name  || 'BRIVOX User',
          email:    profile.email,
          avatar:   profile.picture || '',
          provider: 'google',
          password: null,
        });
        console.log('Created new user:', profile.email);
      }
    }

    // D — Make JWT and redirect
    console.log('Step D: creating token and redirecting...');
    const token      = makeToken(user._id);
    setCookie(res, token);
    const redirectTo = `${CLIENT_URL}/auth-callback?token=${token}`;
    console.log('Redirecting to:', redirectTo.replace(token, '[TOKEN]'));
    return res.redirect(redirectTo);

  } catch (err) {
    console.error('=== Google callback FAILED ===');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    if (err.response) {
      console.error('HTTP status:', err.response.status);
      console.error('Response data:', JSON.stringify(err.response.data));
    }
    return res.redirect(`${CLIENT_URL}/login?error=server`);
  }
});

// ── ME ────────────────────────────────────────────────────
router.get('/me', require('../middleware/authMiddleware'), (req, res) => {
  const u = req.user;
  res.json({ _id:u._id, name:u.name, email:u.email, avatar:u.avatar, provider:u.provider });
});

// ── LOGOUT ────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly:true, secure:isProd, sameSite:isProd?'none':'lax' });
  res.json({ message: 'Logged out' });
});

module.exports = router;