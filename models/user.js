const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxLength: [40, 'Name should be under 40 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    validate: [validator.isEmail, "Please enter email in correct format"],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: [6, 'Password should be atleast 6 char'],
    select: false
  },
  role: {
    type: String,
    default: 'user'
  },
  photo: {
    id: {
      type: String,
      required: true
    },
    secure_url: {
      type: String,
      required: true,
      validate: [validator.isURL, "Please enter a valid url"]
    }
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// Validate the password with passed on user password
userSchema.methods.isCorrectPassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

// Create and return jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({
    id: this._id
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  })
}

// Generate forgot password token
userSchema.methods.getForgotPasswordToken = function () {
  // Generate a long and random string
  const forgotToken = crypto.randomBytes(20).toString('hex');

  // Getting a hash - make sure to get a hash on backend
  this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex');

  // Time of token
  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

  return forgotToken;
}

const User = mongoose.model('User', userSchema);
module.exports = User;