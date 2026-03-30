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
      trim: true,
      maxlength: [100, 'Director name must be at most 100 characters'],
      default: 'Unknown',
    },
    genre: {
      type: String,
      enum: {
        values: GENRES,
        message: 'Genre `{VALUE}` is not supported',
      },
      default: 'Other',
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
