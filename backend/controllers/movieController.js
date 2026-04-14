const movieService = require('../services/movieService');

exports.createMovie = async (req, res) => {
  try {
    const movie = await movieService.createMovie(req.body, req.user.id, req.file);
    res.status(201).json(movie);
  } catch (err) {
    res.status(err.status || 400).json({ 
      status: 'error',
      statusCode: err.status || 400,
      type: 'MovieCreationError',
      message: err.message 
    });
  }
};

exports.getAllMovies = async (req, res) => {
  try {
    const movies = await movieService.getAllMovies(req.user.id);
    res.status(200).json(movies);
  } catch (err) {
    res.status(err.status || 500).json({ 
      status: 'error',
      statusCode: err.status || 500,
      type: 'MovieFetchError',
      message: err.message, 
      error: err.message 
    });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const movie = await movieService.getMovieById(req.params.id, req.user.id);
    res.status(200).json(movie);
  } catch (err) {
    res.status(err.status || 500).json({ 
      status: 'error',
      statusCode: err.status || 500,
      type: 'MovieNotFoundError',
      message: err.message, 
      error: err.message 
    });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const updated = await movieService.updateMovie(req.params.id, req.user.id, req.body, req.file);
    res.status(200).json(updated);
  } catch (err) {
    res.status(err.status || 400).json({ 
      status: 'error',
      statusCode: err.status || 400,
      type: 'MovieUpdateError',
      message: err.message 
    });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    await movieService.deleteMovie(req.params.id, req.user.id);
    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ 
      status: 'error',
      statusCode: err.status || 500,
      type: 'MovieDeletionError',
      message: err.message, 
      error: err.message 
    });
  }
};
