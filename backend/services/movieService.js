const Movie = require('../models/Movie');
const { fetchOmdbData } = require('../utils/omdbHelper');

const createMovie = async ({ title, director, genre, releaseYear, posterUrl, imdbId, imdbRating, imdbVotes }, userId, file) => {
  if (!title || !releaseYear) {
    const error = new Error('Title and releaseYear are required.');
    error.status = 400;
    throw error;
  }

  let omdbData = null;
  try {
    omdbData = await fetchOmdbData(title);
  } catch (error) {
    // Ignore OMDB fetch errors, proceed with empty strings
  }

  let posterPath = '';
  if (file) {
    posterPath = '/uploads/' + file.filename;
  } else if (omdbData && omdbData.posterUrl) {
    posterPath = omdbData.posterUrl;
  } else if (posterUrl) {
    posterPath = posterUrl;
  }

  const movie = await Movie.create({
    title,
    director,
    genre,
    releaseYear,
    posterUrl: posterPath,
    imdbId: omdbData ? omdbData.imdbId : (imdbId || ''),
    imdbRating: omdbData ? omdbData.imdbRating : (imdbRating || ''),
    imdbVotes: omdbData ? omdbData.imdbVotes : (imdbVotes || ''),
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

const updateMovie = async (movieId, userId, updates, file) => {
  if (file) {
    updates.posterUrl = '/uploads/' + file.filename;
  }

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
