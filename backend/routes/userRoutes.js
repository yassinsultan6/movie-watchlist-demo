const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// Returns the full current user object from the DB — used after OAuth/verification token callback
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email role isVerified authMethod');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile', authMiddleware, (req, res) => {
  return res.status(200).json({
    message: 'Protected profile route',
    userId: req.user.id,
  });
});

module.exports = router;
