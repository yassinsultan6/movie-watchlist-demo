const watchlistService = require('../services/watchlistService');

exports.addToWatchlist = async (req, res) => {
  try {
    const watchlist = await watchlistService.addToWatchlist(req.user.id, req.body.movieId);
    res.status(200).json(watchlist);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message, error: err.message });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  try {
    const watchlist = await watchlistService.removeFromWatchlist(req.user.id, req.params.movieId);
    res.status(200).json(watchlist);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message, error: err.message });
  }
};

exports.getWatchlist = async (req, res) => {
  try {
    const watchlist = await watchlistService.getWatchlist(req.user.id);
    res.status(200).json(watchlist);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message, error: err.message });
  }
};
