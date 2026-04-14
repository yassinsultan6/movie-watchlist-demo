import React from 'react';

const MovieCard = ({ movie, onEdit, onDelete, onAddToWatchlist, isInWatchlist }) => {
  return (
    <div className="movie-card" style={{ textAlign: 'left', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <img 
          src={movie.posterUrl.startsWith('/uploads/') ? `http://localhost:5000${movie.posterUrl}` : (movie.posterUrl || 'https://via.placeholder.com/150x200?text=No+Poster')} 
          alt={`${movie.title} poster`} 
          style={{ width: '150px', height: '200px', objectFit: 'cover', marginBottom: '1rem' }} 
        />
        {movie.imdbId ? (
          <a href={`https://www.imdb.com/title/${movie.imdbId}/`} target="_blank" rel="noopener noreferrer">
            <h3>{movie.title}</h3>
          </a>
        ) : (
          <h3>{movie.title}</h3>
        )}
        {movie.imdbRating && (
          <p><strong>IMDb Rating:</strong> {movie.imdbRating} {movie.imdbVotes && `(${movie.imdbVotes} votes)`}</p>
        )}
        <p><strong>Director:</strong> {movie.director}</p>
        <p><strong>Genre:</strong> {movie.genre}</p>
        <p><strong>Year:</strong> {movie.releaseYear}</p>
      </div>
      <div>
        <button 
          onClick={() => onAddToWatchlist(movie._id)} 
          className="btn" 
          style={{
            width: '100%',
            marginTop: '1rem',
            backgroundColor: isInWatchlist ? '#999' : '#03dac6',
            color: '#000',
            cursor: isInWatchlist ? 'not-allowed' : 'pointer',
          }}
          disabled={isInWatchlist}
          aria-pressed={isInWatchlist}
        >
          {isInWatchlist ? '✓ Added to Watchlist' : 'Add to Watchlist'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button onClick={() => onEdit(movie)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
            Edit
          </button>
          <button onClick={() => onDelete(movie._id)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', backgroundColor: 'var(--error-color)' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
