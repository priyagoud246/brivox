const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app    = express();
const isProd = process.env.NODE_ENV === 'production';

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

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB connected');

    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/sme',  require('./routes/sme'));

    app.get('/', (req, res) => res.json({ message: 'BRIVOX API running' }));
    app.get('/health', (req, res) => res.json({ status: 'ok' }));

    app.use((err, req, res, next) => {
      console.error('UNHANDLED ERROR:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✓ Server on port ${PORT}`));

  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
}

startServer();