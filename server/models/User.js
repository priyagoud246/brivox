const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, default: null  },
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: false, default: null },
  avatar:   { type: String, default: ''    },
  provider: { type: String, default: 'local', enum: ['local', 'google'] },
}, { timestamps: true });

// Only hash password for local accounts — never runs for Google accounts
UserSchema.pre('save', async function(next) {
  // Skip if password not modified or no password (Google users)
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 12);
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.methods.matchPassword = async function(entered) {
  if (!this.password) return false;
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);