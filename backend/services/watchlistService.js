const User = require('../models/User');

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
