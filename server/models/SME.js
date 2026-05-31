const mongoose = require('mongoose');
const SMESchema = new mongoose.Schema({
  name: String,
  role: String,
  location: String,
  sector: String,
  services: [String],
  affiliation: String,
  stage: String,
  profExp: Number,
  domainExp: Number,
  education: String,
  flag: String,
  color: String,
  // For geolocation-based nearest SME feature:
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]  // [longitude, latitude]
  }
}, { timestamps: true });

SMESchema.index({ coordinates: '2dsphere' }); // enables geo queries
module.exports = mongoose.model('SME', SMESchema);