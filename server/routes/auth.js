const router  = require('express').Router();
const jwt     = require('jsonwebtoken');
const axios   = require('axios');
const User    = require('../models/User');

const isProd = process.env.NODE_ENV === 'production';

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Hardcoded as fallback — never wrong
const REDIRECT_URI = isProd
  ? 'https://brivox-api.onrender.com/api/auth/google/callback'
  : 'http://localhost:5000/api/auth/google/callback';

// Hardcoded as fallback — never wrong
const CLIENT_URL = process.env.CLIENT_URL || 'https://brivox-client.onrender.com';

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
  res.json({
    REDIRECT_URI,
    CLIENT_URL,
    GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID?.slice(0, 20) + '...',
    GOOGLE_CLIENT_SECRET: GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
    MONGO_URI: process.env.MONGO_URI ? 'SET' : 'MISSING',
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

  console.log('=== Google Callback Hit ===');
  console.log('code present:', !!code);
  console.log('error from Google:', error || 'none');
  console.log('REDIRECT_URI:', REDIRECT_URI);
  console.log('CLIENT_URL:', CLIENT_URL);
  console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);
  console.log('GOOGLE_CLIENT_ID set:', !!GOOGLE_CLIENT_ID);
  console.log('GOOGLE_CLIENT_SECRET set:', !!GOOGLE_CLIENT_SECRET);

  if (error || !code) {
    console.error('No code or error from Google:', error);
    return res.redirect(`${CLIENT_URL}/login?error=denied`);
  }

  try {
    // STEP A — Exchange code for access token
    console.log('Step A: exchanging code for token...');
    const tokenParams = new URLSearchParams({
      code,
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    });

    let tokenRes;
    try {
      tokenRes = await axios.post(
        'https://oauth2.googleapis.com/token',
        tokenParams.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
    } catch (tokenErr) {
      console.error('STEP A FAILED - Token exchange error:');
      console.error('Status:', tokenErr.response?.status);
      console.error('Data:', JSON.stringify(tokenErr.response?.data));
      return res.redirect(`${CLIENT_URL}/login?error=token_exchange_failed`);
    }

    const { access_token } = tokenRes.data;
    console.log('Step A done — access_token:', !!access_token);

    if (!access_token) {
      console.error('No access_token. Response:', JSON.stringify(tokenRes.data));
      return res.redirect(`${CLIENT_URL}/login?error=no_token`);
    }

    // STEP B — Get Google profile
    console.log('Step B: fetching Google profile...');
    let profile;
    try {
      const { data } = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      profile = data;
    } catch (profileErr) {
      console.error('STEP B FAILED - Profile fetch error:', profileErr.message);
      return res.redirect(`${CLIENT_URL}/login?error=profile_fetch_failed`);
    }

    console.log('Step B done — email:', profile.email);

    if (!profile.email) {
      return res.redirect(`${CLIENT_URL}/login?error=no_email`);
    }

    // STEP C — Find or create user in MongoDB
let user;
try {
  // First try finding by googleId
  user = await User.findOne({ googleId: profile.id });

  if (!user) {
    // Try finding by email
    user = await User.findOne({ email: profile.email });

    if (user) {
      // User exists — just update with Google info
      user = await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            googleId: profile.id,
            avatar:   profile.picture || user.avatar,
            provider: 'google',
          }
        },
        { new: true, runValidators: false } // ← runValidators: false is KEY
      );
    } else {
      // New user — use findOneAndUpdate with upsert to avoid duplicate errors
      user = await User.findOneAndUpdate(
        { email: profile.email },
        {
          $setOnInsert: {
            googleId: profile.id,
            name:     profile.name || 'BRIVOX User',
            email:    profile.email,
            avatar:   profile.picture || '',
            provider: 'google',
            password: null,
          }
        },
        { 
          new: true, 
          upsert: true,          // ← create if not exists
          runValidators: false,  // ← skip validation
          setDefaultsOnInsert: true 
        }
      );
    }
  }
} catch (dbErr) {
  console.error('STEP C FAILED:', dbErr.message, dbErr.code);
  return res.redirect(`${CLIENT_URL}/login?error=db_error`);
}
    // STEP D — Make JWT and redirect to client
    console.log('Step D: making JWT and redirecting...');
    let token;
    try {
      token = makeToken(user._id);
    } catch (jwtErr) {
      console.error('STEP D FAILED - JWT error:', jwtErr.message);
      return res.redirect(`${CLIENT_URL}/login?error=jwt_failed`);
    }

    setCookie(res, token);
    const redirectTo = `${CLIENT_URL}/auth-callback?token=${token}`;
    console.log('=== SUCCESS - Redirecting to auth-callback ===');
    return res.redirect(redirectTo);

  } catch (err) {
    console.error('=== UNEXPECTED CRASH ===');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
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