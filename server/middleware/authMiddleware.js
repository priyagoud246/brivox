// // // const jwt = require('jsonwebtoken');

// // // module.exports = (req, res, next) => {
// // //   // Extract the 'token' cookie
// // //   const token = req.cookies.token; 

// // //   if (!token) {
// // //     return res.status(401).json({ message: 'No token, authorization denied' });
// // //   }

// // //   try {
// // //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // //     req.user = decoded; // Attach user ID to request
// // //     next();
// // //   } catch (err) {
// // //     res.status(401).json({ message: 'Token is not valid' });
// // //   }
// // // };

// // const jwt = require('jsonwebtoken');

// // module.exports = (req, res, next) => {
// //   // 1. Ensure cookie-parser is working and extract the token
// //   const token = req.cookies && req.cookies.token; 

// //   if (!token) {
// //     return res.status(401).json({ message: 'Authentication required: No token found' });
// //   }

// //   try {
// //     // 2. Verify the token using the secret
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
// //     // 3. Attach the user payload to the request object
// //     req.user = decoded; 
// //     next();
// //   } catch (err) {
// //     // 4. Log the error internally for debugging, but don't expose it to the user
// //     console.error('JWT Verification Error:', err.message);
// //     return res.status(401).json({ message: 'Authentication failed: Invalid or expired token' });
// //   }
// // };


// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//   // DEBUG: See exactly what the server receives in the cookies
//   console.log('--- Auth Middleware Check ---');
//   console.log('Cookies received:', req.cookies);
//   console.log('Secret used for verification:', process.env.JWT_SECRET ? 'SET' : 'MISSING');

//   const token = req.cookies?.token; 

//   if (!token) {
//     console.log('Auth Failed: No token present');
//     return res.status(401).json({ message: 'Authentication required: No token found' });
//   }

//   try {
//     // Attempt verification
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; 
//     console.log('Auth Success: User authenticated');
//     next();
//   } catch (err) {
//     // This catches invalid tokens OR tokens signed with a different secret
//     console.error('JWT Verification Error:', err.message);
//     return res.status(401).json({ 
//       message: 'Authentication failed: Invalid or expired token',
//       debug: err.message 
//     });
//   }
// };
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};