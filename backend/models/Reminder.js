const mongoose = require('mongoose');

const { Schema } = mongoose;

const reminderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movie: {
      type: Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    streamingTime: {
      type: Date,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Ensure only one reminder per user/movie/time
reminderSchema.index({ user: 1, movie: 1, streamingTime: 1 }, { unique: true });

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
