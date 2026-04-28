import api from './api';

export const fetchAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data.users;
};

export const fetchUserWatchlist = async (userId) => {
  const response = await api.get(`/admin/users/${userId}/watchlist`);
  return response.data;
};

export const fetchAllMovies = async () => {
  const response = await api.get('/admin/movies');
  return response.data.movies;
};

export const adminDeleteMovie = async (movieId) => {
  const response = await api.delete(`/admin/movies/${movieId}`);
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};
