const { registerUser, loginUser, verifyEmailToken, resendVerificationEmail } = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const { user, message } = await registerUser(req.body);

    return res.status(201).json({
      statusCode: 201,
      message,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    return res.status(err.status || 500).json({
      status: 'error',
      statusCode: err.status || 500,
      type: 'RegistrationError',
      message: err.message || 'Server error',
      error: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { token, user } = await loginUser(req.body);

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(err.status || 500).json({
      status: 'error',
      statusCode: err.status || 500,
      type: 'LoginError',
      message: err.message || 'Server error',
      error: err.message,
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;

    // Validate required parameters
    if (!token) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        type: 'ValidationError',
        message: 'Verification token is required',
      });
    }

    if (!email) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        type: 'ValidationError',
        message: 'Email is required',
      });
    }

    // Verify email and get JWT token
    const { message, token: jwtToken, user } = await verifyEmailToken(token, email);

    return res.status(200).json({
      statusCode: 200,
      message,
      token: jwtToken,
      user,
    });
  } catch (err) {
    console.error('EMAIL VERIFICATION ERROR:', err);
    return res.status(err.status || 500).json({
      status: 'error',
      statusCode: err.status || 500,
      type: 'EmailVerificationError',
      message: err.message || 'Server error',
      error: err.message,
    });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { message } = await resendVerificationEmail(req.body);

    return res.status(200).json({
      statusCode: 200,
      message,
    });
  } catch (err) {
    console.error('RESEND VERIFICATION ERROR:', err);
    return res.status(err.status || 500).json({
      status: 'error',
      statusCode: err.status || 500,
      type: 'ResendVerificationError',
      message: err.message || 'Server error',
      error: err.message,
    });
  }
};

