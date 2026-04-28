const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const {
  getAllUsers,
  getUserWatchlist,
  getAllMovies,
  deleteMovie,
  updateUserRole,
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/users', getAllUsers);
router.get('/users/:userId/watchlist', getUserWatchlist);
router.patch('/users/:userId/role', updateUserRole);

router.get('/movies', getAllMovies);
router.delete('/movies/:movieId', deleteMovie);

module.exports = router;
