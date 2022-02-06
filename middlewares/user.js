const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BigPromise = require('./bigPromise');
const CustomError = require('../utils/customError');

module.exports.isLoggedIn = BigPromise(async (req, res, next)=>{
  const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
  
  if(!token) {
    throw new CustomError("Unauthorized", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id);

  next();

});

module.exports.customRole = (...roles) => BigPromise(async (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new CustomError("Unauthorized route", 401);
  }
  next();
})