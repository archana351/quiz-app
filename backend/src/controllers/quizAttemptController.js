const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { spawn } = require('child_process');
const path = require('path');

// Helper: run ML model safely
const runCheatingModel = ({ copyCount, tabSwitchCount, timeTaken, score }) => {
  return new Promise((resolve) => {
    const scriptPath = path.join(
      __dirname,
      '../../ml/predict_cheating.py'
    );

    let output = '0';

    // Try python3 first, fall back to python
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    
    const python = spawn(pythonCmd, [
      scriptPath,
      String(copyCount),
      String(tabSwitchCount),
      String(timeTaken),
      String(score),
    ], {
      shell: true
    });

    python.stdout.on('data', (data) => {
      output = data.toString().trim();
    });

    python.stderr.on('data', (err) => {
      console.error('Python stderr:', err.toString());
    });

    python.on('close', () => {
      const cheatingPercentage = parseFloat(output) || 0;
      resolve(cheatingPercentage);
    });
  });
};

// POST /api/quiz-attempts/submit
const submitQuizAttempt = async (req, res) => {
  try {
    console.log('📥 Received quiz attempt submission');
    console.log('Body:', req.body);
    console.log('User:', req.user);

    const userId = req.user?.id;
    const {
      quizId,
      answers = [],
      copyCount = 0,
      tabSwitchCount = 0,
      timeTaken = 0,
    } = req.body;

    console.log('Parsed data:', { userId, quizId, answersCount: answers.length, copyCount, tabSwitchCount, timeTaken });

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    // Retry logic for MongoDB operations
    let quiz = null;
    let retries = 3;
    
    while (retries > 0 && !quiz) {
      try {
        quiz = await Quiz.findById(quizId).select('questions status isActive').maxTimeMS(10000);
        break;
      } catch (dbError) {
        retries--;
        console.warn(`⚠️ DB query failed, retries left: ${retries}`, dbError.message);
        if (retries === 0) throw dbError;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      }
    }

    if (!quiz) {
      console.error('❌ Quiz not found:', quizId);
      return res.status(404).json({ status: 'error', message: 'Quiz not found' });
    }

    console.log('✅ Quiz found:', quiz._id, 'Questions:', quiz.questions?.length);

    if (!quiz.isActive) {
      return res.status(400).json({ status: 'error', message: 'Quiz is not active' });
    }

    // Map answers
    const answerMap = new Map();
    answers.forEach((a) => {
      if (a?.questionId) {
        answerMap.set(String(a.questionId), a.selectedOption);
      }
    });

    console.log('📝 Answer map size:', answerMap.size);

    let correctCount = 0;
    let wrongCount = 0;

    quiz.questions.forEach((q) => {
      const submitted = answerMap.get(String(q._id));
      if (submitted && submitted.trim() === q.correctAnswer.trim()) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    console.log('📊 Results:', { correctCount, wrongCount });

    // ==========================
    // ML CHEATING DETECTION
    // ==========================
    console.log('🤖 Running ML cheating detection...');
    const cheatingPercentage = await runCheatingModel({
      copyCount,
      tabSwitchCount,
      timeTaken,
      score: correctCount,
    });
    console.log('🔍 Cheating percentage:', cheatingPercentage);

    // ==========================
    // SIMPLE CHEATING DETECTION RULE
    // ==========================
    // If copyCount >= 3 OR tabSwitchCount >= 3, mark as cheating
    const cheatingDetected = copyCount >= 3 || tabSwitchCount >= 3;
    console.log(`✓ Cheating Detection Rule Applied: copyCount=${copyCount}, tabSwitchCount=${tabSwitchCount}, cheatingDetected=${cheatingDetected}`);

    console.log('💾 Saving quiz attempt...');
    
    // Retry logic for save operation
    let quizAttempt = null;
    retries = 3;
    
    while (retries > 0 && !quizAttempt) {
      try {
        quizAttempt = await QuizAttempt.create({
          userId,
          quizId,
          answers,
          correctCount,
          wrongCount,
          copyCount,
          tabSwitchCount,
          timeTaken,
          cheatingPercentage,
        });
        break;
      } catch (dbError) {
        retries--;
        console.warn(`⚠️ DB save failed, retries left: ${retries}`, dbError.message);
        if (retries === 0) throw dbError;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      }
    }

    console.log('✅ Quiz attempt saved successfully');

    return res.status(200).json({
      status: 'success',
      data: {
        correctCount,
        wrongCount,
        cheatingDetected,
        cheatingPercentage,
        message: cheatingDetected
          ? `⚠️ Cheating detected (Copy: ${copyCount}, Tab Switch: ${tabSwitchCount})`
          : 'Quiz submitted successfully',
      },
    });
  } catch (err) {
    console.error('Submit quiz attempt error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error submitting quiz attempt',
    });
  }
};

// GET /api/quiz-attempts/quiz/:quizId
const getQuizAttemptsByQuizId = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userRole = req.user?.role;

    // Only allow teachers to view quiz attempts
    if (userRole !== 'teacher') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Only teachers can view quiz attempts.',
      });
    }

    // Fetch all quiz attempts for this quiz and populate user details
    const attempts = await QuizAttempt.find({ quizId })
      .populate('userId', 'name email')
      .select('correctCount wrongCount copyCount tabSwitchCount cheatingPercentage userId createdAt')
      .sort({ createdAt: -1 });

    // Format the response
    const formattedAttempts = attempts.map((attempt) => {
      const cheatingDetected = attempt.copyCount >= 3 || attempt.tabSwitchCount >= 3;
      
      return {
        studentName: attempt.userId?.name || 'Unknown',
        studentEmail: attempt.userId?.email || 'N/A',
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        cheatingDetected,
        submittedAt: attempt.createdAt,
      };
    });

    return res.status(200).json({
      status: 'success',
      data: {
        quizId,
        totalAttempts: formattedAttempts.length,
        attempts: formattedAttempts,
      },
    });
  } catch (err) {
    console.error('Get quiz attempts error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error fetching quiz attempts',
    });
  }
};

// GET /api/quiz-attempts
const getAllQuizAttemptsForTeacher = async (req, res) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'teacher') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Only teachers can view quiz attempts.',
      });
    }

    const attempts = await QuizAttempt.find()
      .populate('userId', 'name email')
      .populate('quizId', 'title')
      .select('correctCount wrongCount copyCount tabSwitchCount cheatingPercentage userId quizId createdAt')
      .sort({ createdAt: -1 });

    const formattedAttempts = attempts.map((attempt) => {
      const cheatingDetected = attempt.copyCount >= 3 || attempt.tabSwitchCount >= 3;
      
      return {
        quizTitle: attempt.quizId?.title || 'Unknown quiz',
        studentName: attempt.userId?.name || 'Unknown',
        studentEmail: attempt.userId?.email || 'N/A',
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        cheatingDetected,
        submittedAt: attempt.createdAt,
      };
    });

    return res.status(200).json({
      status: 'success',
      data: {
        totalAttempts: formattedAttempts.length,
        attempts: formattedAttempts,
      },
    });
  } catch (err) {
    console.error('Get all quiz attempts error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error fetching quiz attempts',
    });
  }
};

module.exports = { submitQuizAttempt, getQuizAttemptsByQuizId, getAllQuizAttemptsForTeacher };
