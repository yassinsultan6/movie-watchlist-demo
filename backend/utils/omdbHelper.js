const axios = require('axios');

const OMDB_BASE_URL = 'https://www.omdbapi.com/';
const OMDB_API_KEY = process.env.OMDB_API_KEY;

async function fetchOmdbData(title) {
  try {
    const response = await axios.get(`${OMDB_BASE_URL}?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);

    if (response.data.Response === 'False') {
      return null;
    }

    return {
      posterUrl: response.data.Poster || '',
      imdbId: response.data.imdbID || '',
      imdbRating: response.data.imdbRating || '',
      imdbVotes: response.data.imdbVotes || '',
    };
  } catch (error) {
    console.error('Error fetching OMDB data:', error.message);
    return null;
  }
}

async function searchOmdb(query) {
  try {
    const response = await axios.get(`${OMDB_BASE_URL}?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`);

    if (response.data.Response === 'True') {
      return response.data.Search || [];
    }

    return [];
  } catch (error) {
    console.error('Error searching OMDB:', error.message);
    return [];
  }
}

async function getOmdbMovieDetails(imdbID) {
  try {
    const response = await axios.get(`${OMDB_BASE_URL}?i=${encodeURIComponent(imdbID)}&apikey=${OMDB_API_KEY}`);

    if (response.data.Response === 'True') {
      return {
        title: response.data.Title || '',
        director: response.data.Director || '',
        genre: response.data.Genre || '',
        releaseYear: response.data.Year || '',
        posterUrl: response.data.Poster || '',
        imdbId: response.data.imdbID || '',
        imdbRating: response.data.imdbRating || '',
        imdbVotes: response.data.imdbVotes || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching OMDB details:', error.message);
    return null;
  }
}

module.exports = {
  fetchOmdbData,
  searchOmdb,
  getOmdbMovieDetails,
};