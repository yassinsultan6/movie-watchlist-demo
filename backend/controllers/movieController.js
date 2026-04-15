const movieService = require('../services/movieService');

exports.createMovie = async (req, res, next) => {
  try {
    const movie = await movieService.createMovie(req.body, req.user.id, req.file);
    res.status(201).json(movie);
  } catch (err) {
    err.type = err.type || 'MovieCreationError';
    next(err);
  }
};

exports.getAllMovies = async (req, res, next) => {
  try {
    const movies = await movieService.getAllMovies(req.user.id);
    res.status(200).json(movies);
  } catch (err) {
    err.type = err.type || 'MovieFetchError';
    next(err);
  }
};

exports.getMovieById = async (req, res, next) => {
  try {
    const movie = await movieService.getMovieById(req.params.id, req.user.id);
    res.status(200).json(movie);
  } catch (err) {
    err.type = err.type || 'MovieNotFoundError';
    next(err);
  }
};

exports.updateMovie = async (req, res, next) => {
  try {
    const updated = await movieService.updateMovie(req.params.id, req.user.id, req.body, req.file);
    res.status(200).json(updated);
  } catch (err) {
    err.type = err.type || 'MovieUpdateError';
    next(err);
  }
};

exports.deleteMovie = async (req, res, next) => {
  try {
    await movieService.deleteMovie(req.params.id, req.user.id);
    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (err) {
    err.type = err.type || 'MovieDeletionError';
    next(err);
  }
};
