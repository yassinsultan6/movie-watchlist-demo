import api from './api';

// --- Movie CRUD Functions ---
export const getMovies = async () => {
  try {
    const response = await api.get('/movies');
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No response from server');
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch movies');
    } else {
      throw new Error('Network error or no response from server');
    }
  }
};

export const getMovieById = async (id) => {
  try {
    const response = await api.get(`/movies/${id}`);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No response from server');
    }
  } catch (error) {
    console.error('Error fetching movie:', error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch movie');
    } else {
      throw new Error('Network error or no response from server');
    }
  }
};

export const createMovie = async (movieData) => {
  try {
    const response = await api.post('/movies', movieData);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No response from server');
    }
  } catch (error) {
    console.error('Error creating movie:', error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to create movie');
    } else {
      throw new Error('Network error or no response from server');
    }
  }
};

export const updateMovie = async (id, movieData) => {
  try {
    const response = await api.put(`/movies/${id}`, movieData);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No response from server');
    }
  } catch (error) {
    console.error('Error updating movie:', error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to update movie');
    } else {
      throw new Error('Network error or no response from server');
    }
  }
};

export const deleteMovie = async (id) => {
  try {
    const response = await api.delete(`/movies/${id}`);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No response from server');
    }
  } catch (error) {
    console.error('Error deleting movie:', error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to delete movie');
    } else {
      throw new Error('Network error or no response from server');
    }
  }
};

// --- Watchlist Functions ---

// GET /api/watchlist
export const getWatchlist = async () => {
  try {
    const response = await api.get('/watchlist');
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No response from server');
    }
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch watchlist');
    } else {
      throw new Error('Network error or no response from server');
    }
  }
};

// POST /api/watchlist
export const addMovieToWatchlist = async (movieId) => {
  try {
    const response = await api.post('/watchlist', { movieId });
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No response from server');
    }
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to add to watchlist');
    } else {
      throw new Error('Network error or no response from server');
    }
  }
};

// DELETE /api/watchlist/:id
export const removeMovieFromWatchlist = async (movieId) => {
  try {
    const response = await api.delete(`/watchlist/${movieId}`);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No response from server');
    }
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to remove from watchlist');
    } else {
      throw new Error('Network error or no response from server');
    }
  }
};
