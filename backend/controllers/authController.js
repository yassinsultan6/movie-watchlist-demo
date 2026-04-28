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
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Verification link is invalid or incomplete')}`);
    }

    // Verify email and get JWT token
    const { token: jwtToken, user } = await verifyEmailToken(token, email);

    // Redirect to frontend login page with token — LoginPage handles it just like OAuth
    return res.redirect(`${frontendUrl}/login?token=${jwtToken}&verified=true`);
  } catch (err) {
    console.error('EMAIL VERIFICATION ERROR:', err);
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(err.message || 'Email verification failed')}`);
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

