const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const session      = require('express-session');
const passport     = require('passport');
require('dotenv').config();

const app    = express();
const isProd = process.env.NODE_ENV === 'production';

console.log('=== BRIVOX Server Starting ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('MONGO_URI set:', !!process.env.MONGO_URI);
console.log('GOOGLE_CLIENT_ID set:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET set:', !!process.env.GOOGLE_CLIENT_SECRET);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'https://brivox-client.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, true);
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Cookie']
}));

// Fix for new path-to-regexp — use regex instead of '*'
app.options(/(.*)/, cors());

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret:            process.env.SESSION_SECRET || 'fallback_secret',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    secure:   isProd,
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Load passport AFTER passport middleware — no function wrapper
require('./config/passport');

app.get('/',        (req, res) => res.json({ message: 'BRIVOX API running', env: process.env.NODE_ENV }));
app.get('/health',  (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/api/debug', (req, res) => res.json({
  NODE_ENV:          process.env.NODE_ENV,
  CLIENT_URL:        process.env.CLIENT_URL,
  MONGO_URI_set:     !!process.env.MONGO_URI,
  GOOGLE_ID_set:     !!process.env.GOOGLE_CLIENT_ID,
  GOOGLE_SECRET_set: !!process.env.GOOGLE_CLIENT_SECRET,
  JWT_SECRET_set:    !!process.env.JWT_SECRET,
  SESSION_set:       !!process.env.SESSION_SECRET,
  callbackURL:       isProd
    ? 'https://brivox-api.onrender.com/api/auth/google/callback'
    : 'http://localhost:5000/api/auth/google/callback'
}));

try {
  const authRouter = require('./routes/auth');
  const smeRouter  = require('./routes/sme');
  if (typeof authRouter !== 'function') throw new Error('auth router invalid');
  if (typeof smeRouter  !== 'function') throw new Error('sme router invalid');
  app.use('/api/auth', authRouter);
  app.use('/api/sme',  smeRouter);
  console.log('✓ Routes loaded');
} catch (err) {
  console.error('Route loading failed:', err.message);
  process.exit(1);
}

app.use((err, req, res, next) => {
  console.error('=== UNHANDLED ERROR ===', err.message);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✓ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('✕ MongoDB failed:', err.message);
    process.exit(1);
  });