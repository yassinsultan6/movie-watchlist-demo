const User = require('../models/User');


exports.addToWatchlist = async (req, res) => {
  try {
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({ message: 'movieId is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { watchlist: movieId } }, 
      { new: true }
    ).populate('watchlist');

    res.status(200).json(user.watchlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.removeFromWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { watchlist: movieId } },
      { new: true }
    ).populate('watchlist');

    res.status(200).json(user.watchlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('watchlist');
    res.status(200).json(user.watchlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
