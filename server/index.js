const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const cookieParser = require('cookie-parser');
const session    = require('express-session');
const passport   = require('passport');
require('dotenv').config();
require('./config/passport');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Cookie'],
  exposedHeaders: ['set-cookie']
}));

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/',       (req, res) => res.json({ message: 'BRIVOX API running' }));
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

try {
  const authRouter = require('./routes/auth');
  const smeRouter  = require('./routes/sme');
  if (typeof authRouter !== 'function') throw new Error('routes/auth.js must export a router');
  if (typeof smeRouter  !== 'function') throw new Error('routes/sme.js must export a router');
  app.use('/api/auth', authRouter);
  app.use('/api/sme',  smeRouter);
  console.log('✓ Routes loaded');
} catch (err) {
  console.error('Route loading failed:', err.message);
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✓ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB failed:', err.message);
    process.exit(1);
  });