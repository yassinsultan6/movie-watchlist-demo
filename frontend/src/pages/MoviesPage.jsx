import React, { useState, useEffect, useContext } from 'react';
import * as movieService from '../services/movieService';
import NotificationContext from '../context/NotificationContext';
import MovieCard from '../components/MovieCard';
import MovieForm from '../components/MovieForm';
import Spinner from '../components/Spinner';
import ConfirmationModal from '../components/ConfirmationModal';

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState({ open: false, title: '', message: '', onConfirm: null });
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const data = await movieService.getMovies();
        setMovies(data);
      } catch {
        showNotification('Failed to fetch movies.', 'error');
      } finally {
        setLoading(false);
      }
    };

    const fetchWatchlistIds = async () => {
      try {
        const data = await movieService.getWatchlist();
        const watchlist = Array.isArray(data) ? data : data.watchlist || [];
        const ids = watchlist.map((movie) => movie._id);
        setWatchlistIds(ids);
      } catch {
        // keep movies loaded even if watchlist fails
      }
    };

    fetchMovies();
    fetchWatchlistIds();
  }, [showNotification]);

  const handleFormSubmit = async (movieData) => {
    try {
      if (editingMovie) {
        const updatedMovie = await movieService.updateMovie(editingMovie._id, movieData);
        setMovies(movies.map(m => (m._id === editingMovie._id ? updatedMovie : m)));
        showNotification('Movie updated successfully!', 'success');
      } else {
        const newMovie = await movieService.createMovie(movieData);
        setMovies([newMovie, ...movies]);
        showNotification('Movie added successfully!', 'success');
      }
      setEditingMovie(null);
      setShowForm(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'An error occurred.';
      showNotification(errorMsg, 'error');
    }
  };

  const handleDelete = (id, title) => {
    setConfirmConfig({
      open: true,
      title: 'Delete Movie',
      message: `Are you sure you want to remove "${title}" from your movies?`,
      onConfirm: async () => {
        try {
          await movieService.deleteMovie(id);
          setMovies(movies.filter(m => m._id !== id));
          showNotification('Movie deleted.', 'success');
        } catch {
          showNotification('Failed to delete movie.', 'error');
        } finally {
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleAddToWatchlist = async (movieId) => {
    if (watchlistIds.includes(movieId)) {
      showNotification('This movie is already in your watchlist.', 'info');
      return;
    }

    try {
      const data = await movieService.addMovieToWatchlist(movieId);
      const updatedWatchlist = Array.isArray(data) ? data : data.watchlist || [];
      const ids = updatedWatchlist.map((movie) => movie._id);
      setWatchlistIds(ids);
      showNotification('Movie added to your watchlist!', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add to watchlist.';
      showNotification(errorMsg, 'error');
    }
  };

  const handleEditClick = (movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMovie(null);
  };

  if (loading) return <Spinner />;

  return (
    <div className="container">
      <h1>Movie Collection</h1>
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="btn" style={{ marginBottom: '2rem' }}>
          Add New Movie
        </button>
      )}
      {showForm && (
        <MovieForm
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
          initialData={editingMovie}
        />
      )}
      <div className="movie-grid">
        {movies.map(movie => (
          <MovieCard
            key={movie._id}
            movie={movie}
            onEdit={handleEditClick}
            onDelete={() => handleDelete(movie._id, movie.title)}
            onAddToWatchlist={handleAddToWatchlist}
            isInWatchlist={watchlistIds.includes(movie._id)}
          />
        ))}
      </div>
      <ConfirmationModal
        open={confirmConfig.open}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default MoviesPage;
