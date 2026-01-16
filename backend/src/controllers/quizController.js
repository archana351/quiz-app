const Quiz = require('../models/Quiz');
const { emitToAll } = require('../utils/socket');

// GET all quizzes (no role restriction) - Only show teacher-created quizzes
const getAllQuizzes = async (req, res) => {
  try {
    // Only return quizzes that were created by teachers (have createdBy field)
    const quizzes = await Quiz.find({ createdBy: { $exists: true, $ne: null } })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ status: 'success', data: quizzes });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// POST create quiz (teacher only)
const createQuiz = async (req, res) => {
  try {
    const { title, topic, subject = 'general', difficulty = 'easy', questions = [] } = req.body;

    if (!title || !topic) {
      return res.status(400).json({ status: 'error', message: 'Title and topic are required' });
    }

    // Validate questions only if they are provided
    if (Array.isArray(questions) && questions.length > 0) {
      for (const q of questions) {
        if (!q.question || !Array.isArray(q.options) || q.options.length < 2 || !q.correctAnswer) {
          return res.status(400).json({ status: 'error', message: 'Each question needs text, options (min 2), and correctAnswer' });
        }
      }
    }

    const quiz = await Quiz.create({
      title,
      topic,
      subject,
      difficulty,
      status: 'draft',
      isActive: false,
      createdBy: req.user.id,
      questions,
      createdByAI: false,
    });

    return res.status(201).json({ status: 'success', data: quiz });
  } catch (err) {
    console.error('Create quiz error:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error creating quiz' });
  }
};

// POST join quiz by quizId (students) - only active quizzes
const joinQuizById = async (req, res) => {
  try {
    const { quizId } = req.body;
    if (!quizId) {
      return res.status(400).json({ status: 'error', message: 'quizId is required' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ status: 'error', message: 'Quiz not found' });
    }

    if (!quiz.isActive) {
      return res.status(400).json({ status: 'error', message: 'Quiz is not active' });
    }

    return res.status(200).json({ status: 'success', data: quiz });
  } catch (err) {
    console.error('Join quiz error:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error joining quiz' });
  }
};

// DELETE old quizzes without createdBy field (teacher only)
const deleteOldQuizzes = async (req, res) => {
  try {
    // Delete all quizzes that don't have a createdBy field (old/AI-generated quizzes)
    const result = await Quiz.deleteMany({ 
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null }
      ]
    });

    return res.status(200).json({ 
      status: 'success', 
      message: `Successfully deleted ${result.deletedCount} old quiz(es)`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Delete old quizzes error:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error deleting old quizzes' });
  }
};

// GET teacher's quizzes (teacher only)
const getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ status: 'success', data: quizzes });
  } catch (err) {
    console.error('Get teacher quizzes error:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error fetching quizzes' });
  }
};

// DELETE specific quiz by ID (teacher only)
const deleteQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ status: 'error', message: 'Quiz not found' });
    }

    // Check if the quiz belongs to the current user
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'You can only delete your own quizzes' });
    }

    await Quiz.findByIdAndDelete(quizId);
    return res.status(200).json({ 
      status: 'success', 
      message: 'Quiz deleted successfully' 
    });
  } catch (err) {
    console.error('Delete quiz error:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error deleting quiz' });
  }
};

// POST submit quiz answers and calculate score (student + teacher)
const submitQuizAnswers = async (req, res) => {
  try {
    const { quizId, answers } = req.body; // answers = { 0: 'option_text', 1: 'option_text', ... }

    if (!quizId || !answers || typeof answers !== 'object') {
      return res.status(400).json({ status: 'error', message: 'quizId and answers are required' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ status: 'error', message: 'Quiz not found' });
    }

    if (!quiz.isActive) {
      return res.status(400).json({ status: 'error', message: 'Quiz is not active' });
    }

    // Validate answers and calculate score
    let score = 0;
    let totalQuestions = quiz.questions.length;
    const detailedResults = [];

    console.log('=== Quiz Answer Validation ===');
    console.log('Quiz ID:', quizId);
    console.log('Total Questions:', totalQuestions);
    console.log('Student Answers:', JSON.stringify(answers, null, 2));
    console.log('Answer Keys:', Object.keys(answers));
    console.log('Question IDs:', quiz.questions.map(q => ({ index: quiz.questions.indexOf(q), _id: String(q._id) })));

    quiz.questions.forEach((question, index) => {
      // Accept answers keyed by index OR by question ObjectId (string)
      const studentAnswer =
        answers[index] ??
        answers[question._id] ??
        answers[String(question._id)];
      const correctAnswer = question.correctAnswer;
      
      // Normalize both answers for comparison (trim whitespace)
      const normalizedStudentAnswer = studentAnswer ? String(studentAnswer).trim() : '';
      const normalizedCorrectAnswer = correctAnswer ? String(correctAnswer).trim() : '';
      
      const isCorrect = normalizedStudentAnswer === normalizedCorrectAnswer;

      console.log(`\nQuestion ${index + 1}:`);
      console.log('  Question Text:', question.question);
      console.log('  Student Answer:', `"${studentAnswer}"`);
      console.log('  Correct Answer:', `"${correctAnswer}"`);
      console.log('  Normalized Student:', `"${normalizedStudentAnswer}"`);
      console.log('  Normalized Correct:', `"${normalizedCorrectAnswer}"`);
      console.log('  Is Correct?:', isCorrect);

      if (isCorrect) {
        score++;
      }

      detailedResults.push({
        questionIndex: index,
        question: question.question,
        options: question.options,
        studentAnswer: studentAnswer || null,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect
      });
    });

    const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(2) : 0;
    const passed = percentage >= 50;

    console.log('\n=== Final Score ===');
    console.log('Score:', score, '/', totalQuestions);
    console.log('Percentage:', percentage);

    return res.status(200).json({
      status: 'success',
      data: {
        quizId: quiz._id,
        quizTitle: quiz.title,
        score: score,
        totalQuestions: totalQuestions,
        percentage: percentage,
        passed: passed,
        detailedResults: detailedResults
      }
    });
  } catch (err) {
    console.error('Submit quiz answers error:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error submitting quiz' });
  }
};

// POST /api/quizzes/:quizId/start (teacher only)
const startQuiz = async (req, res) => {
  try {
    if (req.user?.role !== 'teacher') {
      return res.status(403).json({ status: 'error', message: 'Only teachers can start a quiz' });
    }

    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ status: 'error', message: 'Quiz not found' });
    }

    // Close all other quizzes to enforce single active quiz
    await Quiz.updateMany({ _id: { $ne: quizId } }, { isActive: false, status: 'closed' });

    quiz.status = 'active';
    quiz.isActive = true;
    await quiz.save();

    emitToAll('quizStarted', {
      quizId: quiz._id,
      title: quiz.title,
      startedAt: new Date(),
    });

    return res.status(200).json({ status: 'success', data: quiz });
  } catch (err) {
    console.error('Start quiz error:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error starting quiz' });
  }
};

// POST /api/quizzes/:quizId/end (teacher only)
const endQuiz = async (req, res) => {
  try {
    if (req.user?.role !== 'teacher') {
      return res.status(403).json({ status: 'error', message: 'Only teachers can end a quiz' });
    }

    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ status: 'error', message: 'Quiz not found' });
    }

    quiz.status = 'closed';
    quiz.isActive = false;
    await quiz.save();

    emitToAll('quizEnded', {
      quizId: quiz._id,
      title: quiz.title,
      endedAt: new Date(),
    });

    return res.status(200).json({ status: 'success', data: quiz });
  } catch (err) {
    console.error('End quiz error:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error ending quiz' });
  }
};

module.exports = {
  getAllQuizzes,
  createQuiz,
  joinQuizById,
  deleteOldQuizzes,
  getTeacherQuizzes,
  deleteQuizById,
  submitQuizAnswers,
  startQuiz,
  endQuiz,
};
