const mongoose = require('mongoose');

const { Schema } = mongoose;

const GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Other',
];

const movieSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title must not be empty'],
      maxlength: [150, 'Title must be at most 150 characters'],
    },
    director: {
      type: String,
      required: [true, 'Director is required'],
      trim: true,
      minlength: [1, 'Director must not be empty'],
      maxlength: [100, 'Director name must be at most 100 characters'],
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
      minlength: [1, 'Genre must not be empty'],
      maxlength: [50, 'Genre must be at most 50 characters'],
    },
    releaseYear: {
      type: Number,
      min: [1888, 'Release year must be after 1888'],
      max: [
        new Date().getFullYear() + 1,
        'Release year seems invalid (too far in the future)',
      ],
      required: [true, 'Release year is required'],
    },
    posterUrl: {
      type: String,
      default: '',
    },
    imdbId: {
      type: String,
      default: '',
    },
    imdbRating: {
      type: String,
      default: '',
      validate: {
        validator: (value) => value === '' || (!Number.isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 10),
        message: 'IMDb rating must be a number between 0 and 10',
      },
    },
    imdbVotes: {
      type: String,
      default: '',
      validate: {
        validator: (value) => value === '' || /^[0-9,]+$/.test(value),
        message: 'IMDb votes must be digits and commas only',
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'CreatedBy (user) is required'],
    },
  },
  {
    timestamps: true, 
    versionKey: false,
  }
);

movieSchema.index({ title: 1, releaseYear: -1 });
movieSchema.index({ genre: 1 });
movieSchema.index({ createdBy: 1 });

movieSchema.index({ title: 'text', director: 'text' });

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
