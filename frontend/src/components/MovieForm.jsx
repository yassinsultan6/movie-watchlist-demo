import React, { useState, useEffect } from 'react';

const MovieForm = ({ onSubmit, onCancel, initialData }) => {
  const [movie, setMovie] = useState({
    title: '',
    director: '',
    genre: '',
    releaseYear: '',
  });

  useEffect(() => {
    if (initialData) {
      setMovie({
        title: initialData.title || '',
        director: initialData.director || '',
        genre: initialData.genre || '',
        releaseYear: initialData.releaseYear || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovie((prevMovie) => ({ ...prevMovie, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(movie);
  };

  return (
    <div className="form-container" style={{ marginBottom: '2rem' }}>
      <form onSubmit={handleSubmit}>
        <h2>{initialData ? 'Edit Movie' : 'Add New Movie'}</h2>
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" value={movie.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Director</label>
          <input type="text" name="director" value={movie.director} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Genre</label>
          <input type="text" name="genre" value={movie.genre} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Release Year</label>
          <input type="number" name="releaseYear" value={movie.releaseYear} onChange={handleChange} required />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn">Save Movie</button>
          <button type="button" onClick={onCancel} className="btn" style={{ backgroundColor: '#666' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default MovieForm;
