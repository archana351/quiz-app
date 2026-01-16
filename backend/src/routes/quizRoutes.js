const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');

// 👉 IMPORT CONTROLLERS
const { getAllQuizzes, createQuiz, joinQuizById, deleteOldQuizzes, getTeacherQuizzes, deleteQuizById, submitQuizAnswers, startQuiz, endQuiz } = require('../controllers/quizController');

// ============================
// TEST ROUTE (KEEP THIS)
// ============================
router.get('/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Quiz API working',
  });
});

// ============================
// QUIZ ROUTES
// ============================

// GET /api/quizzes
router.get('/', getAllQuizzes);

// POST /api/quizzes (teacher only)
router.post('/', auth, authorizeRoles('teacher'), createQuiz);

// POST /api/quizzes/join (students fetch active quiz by id)
router.post('/join', auth, authorizeRoles('student', 'teacher'), joinQuizById);

// PATCH /api/quizzes/:quizId/start (teacher only)
router.patch('/:quizId/start', auth, authorizeRoles('teacher'), startQuiz);

// PATCH /api/quizzes/:quizId/end (teacher only)
router.patch('/:quizId/end', auth, authorizeRoles('teacher'), endQuiz);

// DELETE /api/quizzes/cleanup (teacher only - removes old quizzes without createdBy)
router.delete('/cleanup', auth, authorizeRoles('teacher'), deleteOldQuizzes);

// GET /api/quizzes/my-quizzes (teacher only - get own quizzes)
router.get('/my-quizzes', auth, authorizeRoles('teacher'), getTeacherQuizzes);

// DELETE /api/quizzes/:quizId (teacher only - delete specific quiz)
router.delete('/:quizId', auth, authorizeRoles('teacher'), deleteQuizById);

// POST /api/quizzes/:quizId/submit (student/teacher - submit quiz and get results)
router.post('/:quizId/submit', auth, authorizeRoles('student', 'teacher'), submitQuizAnswers);

module.exports = router;
