const User = require('../models/User');
const Movie = require('../models/Movie');

/**
 * GET /api/admin/users
 * Returns all users (id, name, email, role, isVerified, createdAt).
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('name email role isVerified authMethod createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({ statusCode: 200, users });
  } catch (err) {
    err.type = 'AdminFetchUsersError';
    next(err);
  }
};

/**
 * GET /api/admin/users/:userId/watchlist
 * Returns a specific user's watchlist.
 */
exports.getUserWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name email watchlist')
      .populate('watchlist');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      statusCode: 200,
      user: { id: user._id, name: user.name, email: user.email },
      watchlist: user.watchlist,
    });
  } catch (err) {
    err.type = 'AdminFetchWatchlistError';
    next(err);
  }
};

/**
 * GET /api/admin/movies
 * Returns ALL movies from all users.
 */
exports.getAllMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ statusCode: 200, movies });
  } catch (err) {
    err.type = 'AdminFetchMoviesError';
    next(err);
  }
};

/**
 * DELETE /api/admin/movies/:movieId
 * Allows admin to delete any movie regardless of owner.
 */
exports.deleteMovie = async (req, res, next) => {
  try {
    const deleted = await Movie.findByIdAndDelete(req.params.movieId);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Movie not found',
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Movie deleted successfully',
    });
  } catch (err) {
    err.type = 'AdminDeleteMovieError';
    next(err);
  }
};

/**
 * PATCH /api/admin/users/:userId/role
 * Allows admin to change a user's role.
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        type: 'ValidationError',
        message: 'Role must be "user" or "admin"',
      });
    }

    // Prevent admin from demoting themselves
    if (req.params.userId === req.user.id) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        type: 'ValidationError',
        message: 'You cannot change your own role',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true, select: 'name email role' }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: `User role updated to "${role}"`,
      user,
    });
  } catch (err) {
    err.type = 'AdminUpdateRoleError';
    next(err);
  }
};
