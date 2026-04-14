const { registerUser, loginUser } = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const { token, user } = await registerUser(req.body);

    return res.status(201).json({ token, user });
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
