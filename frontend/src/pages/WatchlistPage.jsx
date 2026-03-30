import React, { useState, useEffect, useContext } from 'react';
import { getWatchlist, removeMovieFromWatchlist } from '../services/movieService';
import { NotificationContext } from '../App';
import Spinner from '../components/Spinner';

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const data = await getWatchlist();
      setWatchlist(data.watchlist || []);
    } catch (err) {
      showNotification('Failed to fetch watchlist.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (movieId) => {
    if (window.confirm('Remove this movie from your watchlist?')) {
      try {
        await removeMovieFromWatchlist(movieId);
        setWatchlist(watchlist.filter(movie => movie._id !== movieId));
        showNotification('Movie removed from watchlist.', 'success');
      } catch (err) {
        showNotification('Failed to remove movie.', 'error');
      }
    }
  };

  if (loading) return <Spinner />;

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
                onClick={() => handleRemove(movie._id)} 
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
    </div>
  );
};

export default WatchlistPage;
