const router = require('express').Router();
const SME = require('../models/SME');
const auth = require('../middleware/authMiddleware');

// Get all SMEs (Public route)
router.get('/', async (req, res) => { 
  try {
    const { sector, search } = req.query;
    let query = {};
    
    if (sector && sector !== 'All') query.sector = sector;
    if (search) {
      query.$or = [
        { name:     { $regex: search, $options: 'i' } },
        { role:     { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { sector:   { $regex: search, $options: 'i' } }
      ];
    }
    
    const smes = await SME.find(query).limit(100);
    res.json(smes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get nearest SMEs (Protected route)
router.get('/nearest', auth, async (req, res) => {
  try {
    const { lng, lat, maxDistance = 500000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ error: "Longitude and Latitude are required" });
    }

    const smes = await SME.find({
      coordinates: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(10);
    
    res.json(smes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;