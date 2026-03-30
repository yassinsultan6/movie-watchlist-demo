import api from './api';

// --- Movie CRUD Functions ---
export const getMovies = async () => {
  const response = await api.get('/movies');
  return response.data;
};
export const getMovieById = async (id) => {
  const response = await api.get(`/movies/${id}`);
  return response.data;
};
export const createMovie = async (movieData) => {
  const response = await api.post('/movies', movieData);
  return response.data;
};
export const updateMovie = async (id, movieData) => {
  const response = await api.put(`/movies/${id}`, movieData);
  return response.data;
};
export const deleteMovie = async (id) => {
  const response = await api.delete(`/movies/${id}`);
  return response.data;
};

// --- Watchlist Functions ---

// GET /api/watchlist
export const getWatchlist = async () => {
  const response = await api.get('/watchlist');
  return response.data;
};

// POST /api/watchlist
export const addMovieToWatchlist = async (movieId) => {
  // The backend expects an object with the movieId
  const response = await api.post('/watchlist', { movieId });
  return response.data;
};

// DELETE /api/watchlist/:id
export const removeMovieFromWatchlist = async (movieId) => {
  const response = await api.delete(`/watchlist/${movieId}`);
  return response.data;
};
