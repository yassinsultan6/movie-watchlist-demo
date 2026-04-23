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
      error.message = error.response.data.message || error.response.data.type || error.message;
    }
    throw error;
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
      error.message = error.response.data.message || error.message;
    }
    throw error;
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
// --- OMDB Functions ---
export const searchOmdbMovies = async (query) => {
  try {
    const response = await api.get('/movies/omdb/search', {
      params: { q: query },
    });
    return response.data || [];
  } catch (error) {
    console.error('Error searching OMDB:', error);
    return [];
  }
};

export const getOmdbMovieDetails = async (imdbID) => {
  try {
    const response = await api.get(`/movies/omdb/${encodeURIComponent(imdbID)}`);
    return response.data || null;
  } catch (error) {
    console.error('Error fetching OMDB details:', error);
    return null;
  }
};