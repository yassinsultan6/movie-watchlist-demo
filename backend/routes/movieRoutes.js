
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

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Unsupported file type. Allowed: JPEG, PNG, GIF, WebP.'));
    } else {
      cb(null, true);
    }
  },
});

router.use(authMiddleware);

router.post('/', upload.single('poster'), createMovie);
router.get('/', getAllMovies);
router.get('/:id', getMovieById);
router.put('/:id', upload.single('poster'), updateMovie);
router.delete('/:id', deleteMovie);

module.exports = router;
