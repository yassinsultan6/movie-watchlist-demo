const axios = require('axios');

async function fetchOmdbData(title) {
  try {
    const response = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${process.env.OMDB_API_KEY}`);
    
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

module.exports = { fetchOmdbData };