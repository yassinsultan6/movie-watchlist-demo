const express = require('express');
const router = express.Router();

const {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
} = require('../controllers/watchlistController');

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.delete('/:movieId', removeFromWatchlist);

module.exports = router;
