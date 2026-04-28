const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendVerification } = require('../controllers/authController');
const { googleRedirect, googleCallback } = require('../controllers/googleAuthController');
const { validateRegister, validateLogin, validateResendVerification } = require('../middleware/authValidation');
const { resendVerificationLimiter } = require('../middleware/rateLimiter');

// Email/Password authentication
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/resend-verification', resendVerificationLimiter, validateResendVerification, resendVerification);
router.get('/verify-email', verifyEmail);

// Google OAuth
router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);

module.exports = router;

