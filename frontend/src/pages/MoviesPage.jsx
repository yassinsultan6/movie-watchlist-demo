import React, { useState, useEffect, useContext } from 'react';
import * as movieService from '../services/movieService';
import { NotificationContext } from '../App';
import MovieCard from '../components/MovieCard';
import MovieForm from '../components/MovieForm';
import Spinner from '../components/Spinner';

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchMovies();
    fetchWatchlistIds();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await movieService.getMovies();
      setMovies(data);
    } catch (err) {
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
    } catch (err) {
      // keep movies loaded even if watchlist fails
    }
  };

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await movieService.deleteMovie(id);
        setMovies(movies.filter(m => m._id !== id));
        showNotification('Movie deleted.', 'success');
      } catch (err) {
        showNotification('Failed to delete movie.', 'error');
      }
    }
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
            onDelete={handleDelete}
            onAddToWatchlist={handleAddToWatchlist}
            isInWatchlist={watchlistIds.includes(movie._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MoviesPage;
