import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getWatchlist, removeMovieFromWatchlist } from '../services/movieService';
import NotificationContext from '../context/NotificationContext';
import Spinner from '../components/Spinner';
import ConfirmationModal from '../components/ConfirmationModal';

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setIsLoading(true);
        const data = await getWatchlist();
        const watchlist = Array.isArray(data) ? data : data.watchlist || [];
        setWatchlist(watchlist);
      } catch {
        showNotification('Failed to fetch watchlist.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlist();
  }, [showNotification]);

  const handleRemove = (movieId, title) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Remove from Watchlist',
      message: `Do you want to remove "${title}" from your watchlist?`,
      onConfirm: async () => {
        try {
          await removeMovieFromWatchlist(movieId);
          setWatchlist(watchlist.filter(movie => movie._id !== movieId));
          showNotification('Movie removed from watchlist.', 'success');
        } catch (err) {
          const errorType = err?.response?.data?.type || 'Error';
          const errorMsg = err?.response?.data?.message || 'Failed to remove movie.';
          showNotification(`[${errorType}] ${errorMsg}`, 'error');
        } finally {
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="container">
      <h1>My Watchlist</h1>
      {watchlist.length > 0 ? (
        <div className="movie-grid">
          {watchlist.map((movie) => (
            <div key={movie._id} className="movie-card">
              <div>
                <h3>{movie.title}</h3>
                <p><strong>Director:</strong> {movie.director}</p>
                <p><strong>Genre:</strong> {movie.genre}</p>
                <p><strong>Year:</strong> {movie.releaseYear}</p>
              </div>
              <button 
                onClick={() => handleRemove(movie._id, movie.title)} 
                className="btn" 
                style={{ width: '100%', marginTop: '1rem', backgroundColor: 'var(--error-color)' }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Your watchlist is empty.</p>
          <Link to="/movies" className="btn">Browse Movies</Link>
        </div>
      )}
      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default WatchlistPage;
