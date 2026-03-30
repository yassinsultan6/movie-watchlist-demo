const Movie = require('../models/Movie');


exports.createMovie = async (req, res) => {
  try {
    const { title, director, genre, releaseYear } = req.body;

    if (!title || !releaseYear) {
      return res.status(400).json({ message: 'Title and releaseYear are required.' });
    }

    const movie = await Movie.create({
      title,
      director,
      genre,
      releaseYear,
      createdBy: req.user.id
    });

    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    res.status(200).json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.updateMovie = async (req, res) => {
  try {
    const updated = await Movie.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Movie not found' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.deleteMovie = async (req, res) => {
  try {
    const deleted = await Movie.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!deleted) return res.status(404).json({ message: 'Movie not found' });

    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
