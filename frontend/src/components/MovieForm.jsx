import React, { useState, useEffect, useRef } from 'react';
import { searchOmdbMovies, getOmdbMovieDetails } from '../services/movieService';

const MovieForm = ({ onSubmit, onCancel, initialData, scrollRef, serverErrors = {}, onServerErrorsChange }) => {
  const [movie, setMovie] = useState({
    title: '',
    director: '',
    genre: '',
    releaseYear: '',
    posterUrl: '',
    imdbId: '',
    imdbRating: '',
    imdbVotes: '',
  });
  const [posterFile, setPosterFile] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const titleInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const currentYear = new Date().getFullYear();
  const setServerErrors = onServerErrorsChange || (() => {});

  const getFieldError = (field) => validationErrors[field] || serverErrors[field];

  const clearFieldError = (field) => {
    setValidationErrors((prevErrors) => {
      const next = { ...prevErrors };
      delete next[field];
      return next;
    });
    setServerErrors((prevErrors) => {
      const next = { ...prevErrors };
      delete next[field];
      delete next.general;
      return next;
    });
  };

  const clearAllErrors = () => {
    setValidationErrors({});
    setServerErrors({});
  };

  useEffect(() => {
    if (initialData) {
      setMovie({
        title: initialData.title || '',
        director: initialData.director || '',
        genre: initialData.genre || '',
        releaseYear: initialData.releaseYear || '',
        posterUrl: initialData.posterUrl || '',
        imdbId: initialData.imdbId || '',
        imdbRating: initialData.imdbRating || '',
        imdbVotes: initialData.imdbVotes || '',
      });
      // Show optional fields if editing and any optional field has value
      setShowOptionalFields(
        !!(initialData.posterUrl || initialData.imdbId || initialData.imdbRating || initialData.imdbVotes)
      );
      clearAllErrors();
    } else {
      setShowOptionalFields(false);
      clearAllErrors();
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    setPosterFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovie((prevMovie) => ({ ...prevMovie, [name]: value }));
    clearFieldError(name);
  };

  const MIN_SUGGESTION_LENGTH = 2;

  const fetchSuggestions = async (query) => {
    if (query.length < MIN_SUGGESTION_LENGTH) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsLoadingSuggestions(true);
    const results = await searchOmdbMovies(query);
    setSuggestions(results);
    setSelectedSuggestionIndex(-1);
    setShowSuggestions(true);
    setIsLoadingSuggestions(false);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setMovie((prev) => ({ ...prev, title: value }));
    clearFieldError('title');
    clearTimeout(window.titleTimeout);
    window.titleTimeout = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleTitleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prevIndex) => Math.min(prevIndex + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prevIndex) => Math.max(prevIndex - 1, -1));
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedSuggestionIndex].imdbID);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (imdbID) => {
    const details = await getOmdbMovieDetails(imdbID);
    if (details) {
      setMovie({
        title: details.title,
        director: details.director,
        genre: details.genre,
        releaseYear: parseInt(details.releaseYear) || '',
        posterUrl: details.posterUrl, // keep as URL for display, but file will override
        imdbId: details.imdbId,
        imdbRating: details.imdbRating,
        imdbVotes: details.imdbVotes,
      });
      setPosterFile(null); // reset file
    }
    setShowSuggestions(false);
    setSuggestions([]);
    setShowOptionalFields(false);
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    Object.keys(movie).forEach((key) => {
      if (movie[key] !== undefined && movie[key] !== null && movie[key] !== '') {
        formData.append(key, movie[key]);
      }
    });
    if (posterFile) {
      formData.append('poster', posterFile);
    }
    onSubmit(formData);
  };

  const validateForm = () => {
    const errors = {};

    // Validate title
    if (!movie.title || movie.title.trim() === '') {
      errors.title = 'Title is required';
    }

    // Validate director
    if (!movie.director || movie.director.trim() === '') {
      errors.director = 'Director is required';
    }

    // Validate genre
    if (!movie.genre || movie.genre.trim() === '') {
      errors.genre = 'Genre is required';
    }

    // Validate release year
    if (!movie.releaseYear) {
      errors.releaseYear = 'Release year is required';
    } else {
      const year = parseInt(movie.releaseYear);
      const currentYear = new Date().getFullYear();
      if (year < 1888 || year > currentYear + 1) {
        errors.releaseYear = `Year must be between 1888 and ${currentYear + 1}`;
      }
    }

    // Validate IMDb rating if provided
    if (movie.imdbRating) {
      const rating = parseFloat(movie.imdbRating);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        errors.imdbRating = 'IMDb rating must be a number between 0 and 10';
      }
    }

    // Validate IMDb votes if provided
    if (movie.imdbVotes) {
      if (!/^[0-9,]+$/.test(movie.imdbVotes)) {
        errors.imdbVotes = 'IMDb votes must be a valid number (digits and commas only)';
      }
    }

    // Validate poster file if provided
    if (posterFile) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(posterFile.type)) {
        errors.posterFile = 'Poster file must be a valid image (JPEG, PNG, GIF, or WebP)';
      }
      if (posterFile.size > 5 * 1024 * 1024) {
        errors.posterFile = 'Poster file must be less than 5MB';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        titleInputRef.current &&
        !titleInputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="form-container" style={{ marginBottom: '2rem' }} ref={scrollRef}>
      <form onSubmit={handleSubmit}>
        <h2>{initialData ? 'Edit Movie' : 'Add New Movie'}</h2>
        {serverErrors.general && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            {serverErrors.general}
          </div>
        )}
        <div className="form-group form-group-with-dropdown">
          <label>Title</label>
            <input
              type="text"
              name="title"
              value={movie.title}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              onFocus={() => { if (movie.title.length >= MIN_SUGGESTION_LENGTH && suggestions.length > 0) setShowSuggestions(true); }}
              ref={titleInputRef}
              required
              autoComplete="off"
              placeholder="Start typing a title..."
              aria-autocomplete="list"
              aria-controls="title-suggestions"
              aria-expanded={showSuggestions}
              aria-activedescendant={selectedSuggestionIndex >= 0 ? `suggestion-${selectedSuggestionIndex}` : undefined}
              style={{ borderColor: getFieldError('title') ? 'red' : '' }}
            />
            <div className="suggestion-help" style={{ marginTop: '0.35rem', color: 'var(--muted-text)', fontSize: '0.9rem' }}>
              Type 2+ letters to see suggestions, or choose Other to enter manually.
            </div>
            {getFieldError('title') && <span style={{ color: 'red', fontSize: '0.9rem' }}>{getFieldError('title')}</span>}
            {showSuggestions && (
              <ul
                id="title-suggestions"
                ref={suggestionsRef}
                className="suggestions-list"
                role="listbox"
              >
                {isLoadingSuggestions ? (
                  <li className="suggestion-item" style={{ padding: '0.5rem' }}>Loading suggestions...</li>
                ) : (
                  <>
                    {suggestions.length === 0 ? (
                      <li className="suggestion-item suggestion-notice">No matches found</li>
                    ) : (
                      suggestions.map((suggestion, index) => (
                        <li
                          id={`suggestion-${index}`}
                          key={suggestion.imdbID}
                          onClick={() => handleSuggestionClick(suggestion.imdbID)}
                          className={`suggestion-item ${selectedSuggestionIndex === index ? 'selected' : ''}`}
                          role="option"
                          aria-selected={selectedSuggestionIndex === index}
                        >
                          {suggestion.Title} ({suggestion.Year})
                        </li>
                      ))
                    )}
                    <li
                      onClick={() => { 
                        setShowSuggestions(false); 
                        setSuggestions([]); 
                        setShowOptionalFields(true);
                      }}
                      className="suggestion-item suggestion-option"
                      role="button"
                    >
                      Other (enter manually)
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Director</label>
              <input
              type="text"
              name="director"
              value={movie.director}
              onChange={handleChange}
              required
              style={{ borderColor: getFieldError('director') ? 'red' : '' }}
            />
            {getFieldError('director') && <span style={{ color: 'red', fontSize: '0.9rem' }}>{getFieldError('director')}</span>}
          </div>
          <div className="form-group">
            <label>Genre</label>
            <input
              type="text"
              name="genre"
              value={movie.genre}
              onChange={handleChange}
              required
              style={{ borderColor: getFieldError('genre') ? 'red' : '' }}
            />
            {getFieldError('genre') && <span style={{ color: 'red', fontSize: '0.9rem' }}>{getFieldError('genre')}</span>}
          </div>
          <div className="form-group">
            <label>Release Year</label>
            <input
              type="number"
              name="releaseYear"
              value={movie.releaseYear}
              onChange={handleChange}
              required
              style={{ borderColor: getFieldError('releaseYear') ? 'red' : '' }}
            />
            {getFieldError('releaseYear') && <span style={{ color: 'red', fontSize: '0.9rem' }}>{getFieldError('releaseYear')}</span>}
          </div>
          <div className="form-group">
            <label>Poster (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ borderColor: getFieldError('posterFile') ? 'red' : '' }}
            />
            {getFieldError('posterFile') && <span style={{ color: 'red', fontSize: '0.9rem' }}>{getFieldError('posterFile')}</span>}
          </div>
          {showOptionalFields && (
            <>
              <div className="form-group">
                <label>IMDb ID (optional)</label>
                <input type="text" name="imdbId" value={movie.imdbId} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>IMDb Rating (optional)</label>
                <input
                  type="text"
                  name="imdbRating"
                  value={movie.imdbRating}
                  onChange={handleChange}
                  placeholder="0-10"
                  style={{ borderColor: getFieldError('imdbRating') ? 'red' : '' }}
                />
                {getFieldError('imdbRating') && <span style={{ color: 'red', fontSize: '0.9rem' }}>{getFieldError('imdbRating')}</span>}
              </div>
              <div className="form-group full-width">
                <label>IMDb Votes (optional)</label>
                <input
                  type="text"
                  name="imdbVotes"
                  value={movie.imdbVotes}
                  onChange={handleChange}
                  placeholder="e.g., 1,234,567"
                  style={{ borderColor: getFieldError('imdbVotes') ? 'red' : '' }}
                />
                {getFieldError('imdbVotes') && <span style={{ color: 'red', fontSize: '0.9rem' }}>{getFieldError('imdbVotes')}</span>}
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn" disabled={!movie.title.trim() || !movie.director.trim() || !movie.genre.trim() || !movie.releaseYear || Object.keys(validationErrors).length > 0 || Object.keys(serverErrors).length > 0}>
            Save Movie
          </button>
          <button type="button" onClick={onCancel} className="btn" style={{ backgroundColor: '#666' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default MovieForm;
