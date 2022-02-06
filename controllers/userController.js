const fileUpload = require('express-fileupload');
const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const cloudinary = require('cloudinary');
const { sendMail } = require('../utils/emailUtils');
const crypto = require('crypto');

module.exports.signup = BigPromise(async (req, res) => {
  const { email, name, password } = req.body;

  if(!(email && name && password)) {
    throw new CustomError("Email, name and password are mandatory", 400);
  }
  
  let result;
  if(req.files) {
    let file = req.files.photo;
    if(!file) {
      throw new CustomError("Please provide the files", 400);
    }
    result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: 'users',
      width: 150,
      crop: 'scale'
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result?.public_id,
      secure_url: result?.secure_url
    }
  });

  return cookieToken(user, res);
});

module.exports.login = BigPromise(async (req, res) => {
  const { email, password } = req.body;

  // Check for presence of email and password
  if(!(password && email)) {
    throw new CustomError("Please provide email and password", 400);
  }
  const user = await User.findOne({ email }).select("+password");

  if(!user) {
    throw new CustomError("Incorrect email or password", 400);
  }

  const isPasswordMatch = await user.isCorrectPassword(password);

  if(!isPasswordMatch) {
    throw new CustomError("Incorrect email or password", 400);
  }

  return cookieToken(user, res);
});

module.exports.logout = BigPromise((req, res)=>{
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true
  })
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports.forgotPassword = BigPromise(async (req, res) => {
  const { email } = req.body;
  if(!email) {
    throw new CustomError("Please provide your email", 400);
  }

  const user = await User.findOne({email});
  if(!user) {
    throw new CustomError("User does not exist", 400);
  }

  const forgotPasswordToken = user.getForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${forgotPasswordToken}`;

  const message = `Copy paste this link in your url and hit enter \n\n ${resetPasswordUrl}`;

  try {
    await sendMail({
      email,
      subject: 'Reset your password',
      message,
      html: `<h3>Click on the link to reset password: <a href=${resetPasswordUrl}>${resetPasswordUrl}</a></h3>`
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully"
    });
  } catch(error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new CustomError(error.message, 500);
  }

});

module.exports.passwordReset = BigPromise(async (req, res) => {
  const token = req.params.token;
  const forgotPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: {
      $gt: Date.now()
    }
  });

  if(!user) {
    throw new CustomError("Token is invalid", 400);
  }

  const { password, confirmPassword } = req.body;

  if(!(password && confirmPassword) || password !== confirmPassword) {
    throw new CustomError("Invalid password", 400);
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  return cookieToken(user, res);
});

module.exports.getLoggedInUserDetails = BigPromise(async (req, res) => {
  const user = await User.findById(req.user.id);

  return res.status(200).json({
    success: true,
    user
  });
});

module.exports.changePassword = BigPromise(async (req, res) => {
  const { oldPassword, password } = req.body;
  if(!(oldPassword && password)) {
    throw new CustomError('Please provide the passwords', 400);
  }
  const userId = req.user.id;

  const user = await User.findById(userId).select('+password');

  const isPasswordMatch = await user.isCorrectPassword(oldPassword);

  if(!isPasswordMatch) {
    throw new CustomError('Current password is incorrect', 400);
  }

  user.password = password;

  await user.save();

  return cookieToken(user, res);

});

module.exports.updateProfile = BigPromise(async (req, res) => {

  const { name, email } = req.body;
  const userId = req.user.id;

  const newData = {
    name,
    email
  };

  if(req.files?.photo) {
    const user = User.findById(req.user.id);
    
    const imageId = user.photo.id;
    await cloudinary.v2.uploader.destroy(imageId);

    const  result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
      folder: 'users',
      width: 150,
      crop: 'scale'
    });

    newData.photo = {
      id: res.public_id,
      secure_url: result.secure_url
    }
  }

  await User.findByIdAndUpdate(userId, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  res.status(200).json({
    success: true
  });

});

module.exports.adminAllUsers = BigPromise(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users
  })
});

module.exports.adminGetOneUser = BigPromise(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if(!user) {
    throw new CustomError('User not found.', 404);
  }

  res.status(200).json({
    success: true,
    user
  })
});

module.exports.adminUpdateOneUser = BigPromise(async (req, res) => {
  const { name, email, role } = req.body;
  const { userId } = req.params;

  const newData = {
    name,
    email,
    role
  };

  await User.findByIdAndUpdate(userId, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  res.status(200).json({
    success: true
  });
});

module.exports.adminDeleteOneUser = BigPromise(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if(!user) {
    throw new CustomError('User not found', 400);
  }

  const imageId = user.photo.id;

  await cloudinary.v2.uploader.destroy(imageId);

  await user.remove();

  res.status(200).json({
    success: true
  });
});

module.exports.managerAllUsers = BigPromise(async (req, res) => {
  const users = await User.find({ role: 'user' });

  res.status(200).json({
    success: true,
    users
  })
});