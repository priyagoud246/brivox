const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  googleId:  { type: String },
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String }, // null for Google users
  avatar:    { type: String },
  provider:  { type: String, default: 'local' } // 'local' or 'google'
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);