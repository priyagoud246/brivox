const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const session      = require('express-session');
const passport     = require('passport');
require('dotenv').config();

const app  = express();
const isProd = process.env.NODE_ENV === 'production';

console.log('Starting BRIVOX server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Client URL:', process.env.CLIENT_URL);

// ── CORS ──────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'https://brivox-client.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    console.warn('Blocked origin:', origin);
    callback(null, true); // allow all in dev — tighten in prod if needed
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Cookie']
}));

app.options('*', cors());

// ── MIDDLEWARE ────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret:            process.env.SESSION_SECRET || 'fallback_secret_change_me',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    secure:   isProd,
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000
  }
}));

// ── PASSPORT ──────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

// ── HEALTH CHECK ──────────────────────────────────────────
app.get('/',       (req, res) => res.json({ message: 'BRIVOX API running', env: process.env.NODE_ENV }));
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── ROUTES ────────────────────────────────────────────────
try {
  const authRouter = require('./routes/auth');
  const smeRouter  = require('./routes/sme');

  if (typeof authRouter !== 'function') throw new Error('routes/auth.js must export a Router');
  if (typeof smeRouter  !== 'function') throw new Error('routes/sme.js must export a Router');

  app.use('/api/auth', authRouter);
  app.use('/api/sme',  smeRouter);
  console.log('✓ Routes loaded');
} catch (err) {
  console.error('Route loading failed:', err.message);
  process.exit(1);
}

// ── GLOBAL ERROR HANDLER ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ── DATABASE + START ──────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✓ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });