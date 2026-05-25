const User = require('../models/User');
const Reminder = require('../models/Reminder');

const addToWatchlist = async (userId, movieId) => {
  if (!movieId) {
    const error = new Error('movieId is required');
    error.status = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { watchlist: movieId } },
    { new: true }
  ).populate('watchlist');

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Cleanup any future reminders for this user/movie
  _cleanupFutureReminders(userId, movieId).catch(() => {});

  return user.watchlist;
};

const removeFromWatchlist = async (userId, movieId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { watchlist: movieId } },
    { new: true }
  ).populate('watchlist');

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return user.watchlist;
};

// When a user removes a movie from their watchlist, remove any future scheduled reminders
// so they won't receive further emails for that movie.
const _cleanupFutureReminders = async (userId, movieId) => {
  try {
    await Reminder.deleteMany({ user: userId, movie: movieId, streamingTime: { $gt: new Date() } });
  } catch (err) {
    // Log and continue; failures here shouldn't block the main operation
    console.error('Failed to cleanup future reminders:', err.message);
  }
};


const getWatchlist = async (userId) => {
  const user = await User.findById(userId).populate('watchlist');
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return user.watchlist;
};

module.exports = {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
};
