const Movie = require('../models/Movie');
const User = require('../models/User');
const Reminder = require('../models/Reminder');
const { sendStreamingReminderEmail } = require('../utils/sendEmail');

const LEAD_MINUTES = parseInt(process.env.REMINDER_LEAD_MINUTES || '15', 10);
const CHECK_INTERVAL_SEC = parseInt(process.env.REMINDER_CHECK_INTERVAL_SEC || '60', 10);

const ms = (n) => n;

async function runOnce() {
  try {
    const now = new Date();
    const start = new Date(now.getTime() + LEAD_MINUTES * 60 * 1000);
    const end = new Date(start.getTime() + CHECK_INTERVAL_SEC * 1000);

    console.log(`[reminderJob] Checking reminders between ${start.toISOString()} and ${end.toISOString()}`);

    const movies = await Movie.find({ streamingTimes: { $elemMatch: { $gte: start, $lt: end } } });
    if (!movies || movies.length === 0) return;

    for (const movie of movies) {
      const matchingTimes = movie.streamingTimes.filter((t) => t >= start && t < end);
      if (!matchingTimes.length) continue;

      // find users who have this movie in their watchlist
      const users = await User.find({ watchlist: movie._id, isVerified: true }).select('email name');
      if (!users || users.length === 0) continue;

      for (const st of matchingTimes) {
        for (const user of users) {
          try {
            // Skip if reminder already exists
            const exists = await Reminder.findOne({ user: user._id, movie: movie._id, streamingTime: st });
            if (exists) continue;

            const movieLink = movie.imdbId ? `https://www.imdb.com/title/${movie.imdbId}/` : '';

            // Send email
            await sendStreamingReminderEmail({ to: user.email, name: user.name, movieTitle: movie.title, streamingTime: st, movieLink });

            // Record sent reminder
            await Reminder.create({ user: user._id, movie: movie._id, streamingTime: st, sentAt: new Date() });
          } catch (err) {
            console.error(`[reminderJob] Failed sending reminder for user ${user.email}, movie ${movie.title} at ${st}:`, err.message);
            // don't mark as sent so it can be retried
          }
        }
      }
    }
  } catch (err) {
    console.error('[reminderJob] Error during run:', err);
  }
}

function start() {
  const intervalMs = CHECK_INTERVAL_SEC * 1000;
  // Run once immediately
  runOnce().catch((e) => console.error('[reminderJob] Initial run error:', e));
  setInterval(() => runOnce().catch((e) => console.error('[reminderJob] Interval run error:', e)), intervalMs);
}

module.exports = { start, runOnce };
