const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/sendEmail');

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateToken = (userId, role = 'user') => {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET is not configured');
    error.status = 500;
    throw error;
  }

  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const registerUser = async ({ name, email, password }) => {
  try {
    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('Email already in use');
      error.status = 409;
      throw error;
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenHash = hashToken(verificationToken);
    const verificationTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationTokenHash,
      verificationTokenExpires,
    });

    // Send verification email
    let emailSendError = null;
    try {
      const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      await sendVerificationEmail({
        to: email,
        name: name,
        verifyUrl: verifyUrl
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
      emailSendError = emailError;
      // Continue despite email failure - user can request email resend later
    }

    // Return response (no JWT before verification)
    const response = {
      user,
      message: 'Registered successfully. Please verify your email.',
    };

    // Include email send warning if applicable
    if (emailSendError) {
      response.warning = 'Registration successful but verification email could not be sent. Please try again or contact support.'
    }

    return response;
  } catch (error) {
    console.error('Error in registerUser:', error);
    throw error;
  }
};

const verifyEmailToken = async (token, email) => {
  try {
    if (!token || !email) {
      const error = new Error('Token and email are required');
      error.status = 400;
      throw error;
    }

    // Hash the incoming token to match stored hash
    const tokenHash = hashToken(token);

    // Find user by email, token hash, and non-expired token
    const user = await User.findOne({
      email: email.toLowerCase(),
      verificationTokenHash: tokenHash,
      verificationTokenExpires: { $gt: Date.now() },
    }).select('+verificationTokenHash +verificationTokenExpires');

    if (!user) {
      const error = new Error('Invalid or expired verification token');
      error.status = 400;
      throw error;
    }

    // Mark email as verified and clear token fields
    user.isVerified = true;
    user.verificationTokenHash = null;
    user.verificationTokenExpires = null;
    await user.save();

    // Generate JWT token after successful verification
    const jwtToken = generateToken(user._id, user.role);

    return {
      message: 'Email verified successfully. You can now log in.',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
    };
  } catch (error) {
    console.error('Error in verifyEmailToken:', error);
    throw error;
  }
};

const loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    // Google-only account — no password stored
    if (user.authMethod === 'google' && !user.password) {
      const error = new Error('This account uses Google login. Please sign in with Gmail.');
      error.status = 400;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    // Check if email is verified
    if (!user.isVerified) {
      const error = new Error('Please verify your email before logging in.');
      error.status = 403;
      throw error;
    }

    const token = generateToken(user._id, user.role);

    return {
      token,
      user: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified, role: user.role },
    };
  } catch (error) {
    console.error('Error in loginUser:', error);
    throw error; // Re-throw to let controller handle
  }
};

const resendVerificationEmail = async ({ email }) => {
  try {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // If user not found, return generic message to avoid email enumeration
    if (!user) {
      return {
        message: 'If the email exists, a verification link has been sent.',
      };
    }

    // If already verified, return message
    if (user.isVerified) {
      return {
        message: 'Email already verified. You can log in with your credentials.',
      };
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenHash = hashToken(verificationToken);
    const verificationTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Update user with new token
    user.verificationTokenHash = verificationTokenHash;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Send verification email
    let emailSendError = null;
    try {
      const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      await sendVerificationEmail({
        to: email,
        name: user.name,
        verifyUrl,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
      emailSendError = emailError;
      // Continue despite email failure
    }

    // Return generic success message to avoid email enumeration
    return {
      message: 'If the email exists, a verification link has been sent.',
      ...(emailSendError && { warning: 'Verification email could not be sent. Please try again.' }),
    };
  } catch (error) {
    console.error('Error in resendVerificationEmail:', error);
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmailToken,
  resendVerificationEmail,
  generateToken,
};
