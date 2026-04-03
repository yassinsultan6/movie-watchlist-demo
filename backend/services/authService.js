const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET is not configured');
    error.status = 500;
    throw error;
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already in use');
    error.status = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken(user._id);

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email },
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email },
  };
};

module.exports = {
  registerUser,
  loginUser,
};
