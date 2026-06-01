const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app    = express();
const isProd = process.env.NODE_ENV === 'production';

// --- MIDDLEWARE SETUP ---
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

app.options(/(.*)/, cors());
app.use(express.json());
app.use(cookieParser());

// --- ASYNC STARTUP FUNCTION ---
async function startServer() {
  try {
    console.log('=== BRIVOX Server Starting ===');
    
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB connected');

    // 2. Load Routes
    const authRouter = require('./routes/auth');
    const smeRouter  = require('./routes/sme');
    
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/sme',  smeRouter);
    console.log('✓ Routes loaded');

    // 3. Health & Debug Routes
    app.get('/', (req, res) => res.json({ message: 'BRIVOX API running', env: process.env.NODE_ENV }));
    app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
    
    // 4. Global Error Handler
    app.use((err, req, res, next) => {
      console.error('UNHANDLED ERROR:', err.message);
      res.status(500).json({ error: 'Internal server error', details: err.message });
    });

    // 5. Start Listening
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));

  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

// Execute the startup
startServer();