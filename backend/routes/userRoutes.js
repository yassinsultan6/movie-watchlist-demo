const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.get('/profile', authMiddleware, (req, res) => {
  return res.status(200).json({
    message: 'Protected profile route',
    userId: req.user.id,
  });
});

module.exports = router;
