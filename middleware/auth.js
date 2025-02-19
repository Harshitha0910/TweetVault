const jwt = require('jsonwebtoken');
const userModel = require('../models/user.js'); 

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).send('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).send('User not found.');
    }
    req.user = { id: user._id, email: user.email };
    next();
  } catch (error) {
    res.status(400).send('Invalid token.');
  }
};

module.exports = { verifyToken };
