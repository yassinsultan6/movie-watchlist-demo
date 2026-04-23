const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendVerification } = require('../controllers/authController');
const { validateRegister, validateLogin, validateResendVerification } = require('../middleware/authValidation');
const { resendVerificationLimiter } = require('../middleware/rateLimiter');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/resend-verification', resendVerificationLimiter, validateResendVerification, resendVerification);
router.get('/verify-email', verifyEmail);

module.exports = router;
