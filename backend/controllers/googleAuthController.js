const { getGoogleAuthUrl, handleGoogleCallback } = require('../config/passport');

exports.googleRedirect = (req, res) => {
  const url = getGoogleAuthUrl();
  res.redirect(url);
};

exports.googleCallback = async (req, res) => {
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error || !code) {
    const msg = error || 'No authorization code received';
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(msg)}`);
  }

  try {
    const { token } = await handleGoogleCallback(code);
    return res.redirect(`${frontendUrl}/login?token=${token}`);
  } catch (err) {
    console.error('GOOGLE CALLBACK ERROR:', err.response?.data || err.message);
    const msg = err.response?.data?.error_description || err.message || 'Google authentication failed';
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(msg)}`);
  }
};

