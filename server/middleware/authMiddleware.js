const jwt  = require('jsonwebtoken')
const User = require('../models/User')

module.exports = async (req, res, next) => {
  let token = null

  // Check Authorization header first
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }

  // Fall back to cookie
  if (!token && req.cookies?.token) {
    token = req.cookies.token
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated - no token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    req.user = user
    next()
  } catch (err) {
    console.error('JWT verify failed:', err.message)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}