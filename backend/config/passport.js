const axios = require('axios');
const User = require('../models/User');
const { generateToken } = require('../services/authService');

/**
 * Build Google OAuth authorization URL (step 1 — redirect user here)
 */
const getGoogleAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Exchange code for tokens and return user info (step 2 — called in callback)
 */
const handleGoogleCallback = async (code) => {
  // Exchange authorization code for access token
  const tokenResponse = await axios.post(
    'https://oauth2.googleapis.com/token',
    {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const { access_token } = tokenResponse.data;

  // Fetch user profile from Google
  const profileResponse = await axios.get(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    { headers: { Authorization: `Bearer ${access_token}` } }
  );

  const { sub: googleId, email, name } = profileResponse.data;

  // Find or create user
  let user = await User.findOne({ googleId });

  if (!user) {
    user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      // Link Google account to existing email account
      user.googleId = googleId;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        authMethod: 'google',
        isVerified: true,
      });
    }
  }

  return { token: generateToken(user._id, user.role), user };
};

module.exports = { getGoogleAuthUrl, handleGoogleCallback };

