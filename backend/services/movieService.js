const Movie = require('../models/Movie');
const { fetchOmdbData } = require('../utils/omdbHelper');

const currentYear = new Date().getFullYear();

const createValidationError = (errors) => {
  const error = new Error('Validation failed');
  error.status = 400;
  error.type = 'ValidationError';
  error.errors = errors;
  return error;
};

const validateMoviePayload = (payload = {}, file) => {
  const errors = [];
  const {
    title,
    director,
    genre,
    releaseYear,
    imdbRating,
    imdbVotes,
  } = payload;

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (!director || typeof director !== 'string' || !director.trim()) {
    errors.push({ field: 'director', message: 'Director is required' });
  }

  if (!genre || typeof genre !== 'string' || !genre.trim()) {
    errors.push({ field: 'genre', message: 'Genre is required' });
  }

  if (releaseYear === undefined || releaseYear === null || `${releaseYear}`.trim() === '') {
    errors.push({ field: 'releaseYear', message: 'Release year is required' });
  } else {
    const year = parseInt(releaseYear, 10);
    if (Number.isNaN(year) || year < 1888 || year > currentYear + 1) {
      errors.push({
        field: 'releaseYear',
        message: `Year must be between 1888 and ${currentYear + 1}`,
      });
    }
  }

  if (imdbRating !== undefined && imdbRating !== null && `${imdbRating}`.trim() !== '') {
    const rating = parseFloat(imdbRating);
    if (Number.isNaN(rating) || rating < 0 || rating > 10) {
      errors.push({ field: 'imdbRating', message: 'IMDb rating must be a number between 0 and 10' });
    }
  }

  if (imdbVotes !== undefined && imdbVotes !== null && `${imdbVotes}`.trim() !== '') {
    if (!/^[0-9,]+$/.test(imdbVotes)) {
      errors.push({ field: 'imdbVotes', message: 'IMDb votes must be a valid number (digits and commas only)' });
    }
  }

  if (file) {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.mimetype)) {
      errors.push({ field: 'posterFile', message: 'Poster file must be a valid image (JPEG, PNG, GIF, or WebP)' });
    }
    if (file.size > 5 * 1024 * 1024) {
      errors.push({ field: 'posterFile', message: 'Poster file must be less than 5MB' });
    }
  }

  if (errors.length) {
    throw createValidationError(errors);
  }
};

const createMovie = async ({ title, director, genre, releaseYear, posterUrl, imdbId, imdbRating, imdbVotes }, userId, file) => {
  validateMoviePayload({ title, director, genre, releaseYear, imdbRating, imdbVotes }, file);

  let omdbData = null;
  try {
    omdbData = await fetchOmdbData(title);
  } catch (error) {
    // Ignore OMDB fetch errors, proceed with payload data.
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
    releaseYear: parseInt(releaseYear, 10),
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

const updateMovie = async (movieId, userId, updates = {}, file) => {
  validateMoviePayload(updates, file);

  const {
    title,
    director,
    genre,
    releaseYear,
    posterUrl,
    imdbId,
    imdbRating,
    imdbVotes,
  } = updates;

  const posterPath = file ? '/uploads/' + file.filename : (posterUrl || '');

  const updated = await Movie.findOneAndUpdate(
    { _id: movieId, createdBy: userId },
    {
      title,
      director,
      genre,
      releaseYear: parseInt(releaseYear, 10),
      posterUrl: posterPath,
      imdbId: imdbId || '',
      imdbRating: imdbRating || '',
      imdbVotes: imdbVotes || '',
    },
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
