
const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');

const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for poster uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.use(authMiddleware);

router.post('/', upload.single('poster'), createMovie);
router.get('/', getAllMovies);
router.get('/:id', getMovieById);
router.put('/:id', upload.single('poster'), updateMovie);
router.delete('/:id', deleteMovie);

module.exports = router;
