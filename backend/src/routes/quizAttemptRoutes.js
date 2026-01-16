const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');

// Import controllers
const {
  submitQuizAttempt,
  getQuizAttemptsByQuizId,
  getAllQuizAttemptsForTeacher
} = require('../controllers/quizAttemptController');

// ==========================
// ROUTES
// ==========================

// Student submits quiz (ML cheating detection included)
router.post('/submit', auth, submitQuizAttempt);

// Teacher: get attempts for a specific quiz
// GET /api/quiz-attempts/quiz/:quizId
router.get('/quiz/:quizId', auth, getQuizAttemptsByQuizId);

// Teacher: get ALL quiz attempts (dashboard view)
// GET /api/quiz-attempts
router.get('/', auth, getAllQuizAttemptsForTeacher);

module.exports = router;
