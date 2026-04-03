const Movie = require('../models/Movie');

const createMovie = async ({ title, director, genre, releaseYear }, userId) => {
  if (!title || !releaseYear) {
    const error = new Error('Title and releaseYear are required.');
    error.status = 400;
    throw error;
  }

  const movie = await Movie.create({
    title,
    director,
    genre,
    releaseYear,
    createdBy: userId,
  });

  return movie;
};

const getAllMovies = async (userId) => {
  return Movie.find({ createdBy: userId }).sort({ createdAt: -1 });
};

const getMovieById = async (movieId, userId) => {
  const movie = await Movie.findOne({
    _id: movieId,
    createdBy: userId,
  });

  if (!movie) {
    const error = new Error('Movie not found');
    error.status = 404;
    throw error;
  }

  return movie;
};

const updateMovie = async (movieId, userId, updates) => {
  const updated = await Movie.findOneAndUpdate(
    { _id: movieId, createdBy: userId },
    updates,
    { new: true, runValidators: true }
  );

  if (!updated) {
    const error = new Error('Movie not found');
    error.status = 404;
    throw error;
  }

  return updated;
};

const deleteMovie = async (movieId, userId) => {
  const deleted = await Movie.findOneAndDelete({
    _id: movieId,
    createdBy: userId,
  });

  if (!deleted) {
    const error = new Error('Movie not found');
    error.status = 404;
    throw error;
  }

  return deleted;
};

module.exports = {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
};
