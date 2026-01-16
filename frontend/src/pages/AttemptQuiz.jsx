import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import socketService from '../services/socketService';
import { submitQuizAnswers, submitQuizAttempt } from '../api/quizApi';
import Leaderboard from '../components/Leaderboard';

const AttemptQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const quizData = location.state?.quiz;
  const leaderboardRef = useRef(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [hasJoinedQuiz, setHasJoinedQuiz] = useState(false);
  const [copyCount, setCopyCount] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [cheatingDetected, setCheatingDetected] = useState(false);

  // ✅ SAFELY EXTRACT QUESTIONS
  const questions = quizData?.questions || [];

  // ✅ FIX: DEFINE totalQuestions ONCE
  const totalQuestions = questions.length;

  // ===============================
  // AUTH + DATA GUARD
  // ===============================
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');

    if (!token) {
      navigate('/login');
      return;
    }

    if (storedUserId) {
      setUserId(storedUserId);
    }

    if (!quizData || totalQuestions === 0) {
      navigate('/dashboard');
    }
  }, [navigate, quizData, totalQuestions]);

  // ===============================
  // SOCKET.IO INITIALIZATION
  // ===============================
  useEffect(() => {
    if (!userId || !quizData) return;

    // Connect to Socket.IO
    const socket = socketService.connect();

    // Join quiz room
    if (!hasJoinedQuiz) {
      socketService.joinQuiz(userId, quizData._id || quizData.id, quizData.title);
      setHasJoinedQuiz(true);
    }

    // Listen for leaderboard updates
    const handleLeaderboardUpdate = (data) => {
      setLeaderboardData(data);
    };

    socketService.onLeaderboardUpdate(handleLeaderboardUpdate);

    // Cleanup on unmount
    return () => {
      socketService.offLeaderboardUpdate();
    };
  }, [userId, quizData, hasJoinedQuiz]);

  // ===============================
  // TIMER
  // ===============================
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // ===============================
  // EXAM INTEGRITY TRACKING
  // ===============================
  useEffect(() => {
    const handleCopy = () => setCopyCount((prev) => prev + 1);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabSwitchCount((prev) => prev + 1);
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // ===============================
  // HANDLERS
  // ===============================
  const handleAnswerSelect = (optionIndex) => {
    const selectedOptionText = questions[currentQuestion]?.options[optionIndex];
    const questionId = questions[currentQuestion]?._id; // Get actual ObjectId
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOptionText  // Store with ObjectId as key
    }));

    // Emit answer submission to Socket.IO
    if (userId && quizData) {
      socketService.submitAnswer(
        userId,
        quizData._id || quizData.id,
        currentQuestion,
        selectedOptionText
      );
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const getAnsweredCount = () => Object.keys(answers).length;

  const handleSubmitQuiz = async () => {
    try {
      console.log('📤 Submitting quiz:', quizData._id || quizData.id);
      console.log('📝 Answers:', answers);
      console.log('🔍 Copy count:', copyCount, 'Tab switches:', tabSwitchCount);

      // Format answers for the backend
      const formattedAnswers = Object.keys(answers).map(questionId => ({
        questionId,
        selectedOption: answers[questionId]
      }));

      // Call the quiz attempt endpoint with ML cheating detection
      const response = await submitQuizAttempt({
        quizId: quizData._id || quizData.id,
        answers: formattedAnswers,
        copyCount,
        tabSwitchCount,
        timeTaken: 600 - timeRemaining
      });

      console.log('✅ Quiz submitted successfully:', response.data);

      const resultData = response.data.data;

      // Store result data in state
      setCorrectCount(resultData.correctCount || 0);
      setWrongCount(resultData.wrongCount || 0);
      setCheatingDetected(resultData.cheatingPercentage >= 70 || false);

      // Emit quiz completion to Socket.IO
      if (userId && quizData) {
        socketService.completeQuiz(
          userId,
          quizData._id || quizData.id,
          resultData.correctCount,
          questions.length
        );
      }

      // Store results
      const results = {
        quiz: quizData.title,
        score: resultData.correctCount,
        total: questions.length,
        percentage: ((resultData.correctCount / questions.length) * 100).toFixed(2),
        passed: resultData.correctCount >= questions.length / 2,
        answers: answers
      };

      localStorage.setItem('quizResults', JSON.stringify(results));
      
      // Disconnect from Socket.IO before navigating
      socketService.disconnect();
      
      // Navigate immediately
      navigate('/quiz-results');
    } catch (err) {
      alert('Error submitting quiz: ' + (err.response?.data?.message || err.message));
      console.error('❌ Submit quiz error:', err);
    }
  };

  const handleAutoSubmit = async () => {
    try {
      // Call backend to validate answers and get results
      const response = await submitQuizAnswers(quizData._id || quizData.id, answers, { copyCount, tabSwitchCount });
      const resultData = response.data.data;

      // Store result data in state
      setCorrectCount(resultData.correctCount || resultData.score || 0);
      setWrongCount(resultData.wrongCount || (resultData.totalQuestions - (resultData.score || 0)) || 0);
      setCheatingDetected(resultData.cheatingDetected || false);

      // Emit quiz completion to Socket.IO
      if (userId && quizData) {
        socketService.completeQuiz(
          userId,
          quizData._id || quizData.id,
          resultData.score,
          resultData.totalQuestions
        );
      }

      const results = {
        quiz: resultData.quizTitle,
        score: resultData.score,
        total: resultData.totalQuestions,
        percentage: resultData.percentage,
        passed: resultData.passed,
        answers: answers,
        detailedResults: resultData.detailedResults,
        timeUp: true
      };

      localStorage.setItem('quizResults', JSON.stringify(results));
      
      // Disconnect from Socket.IO before navigating
      socketService.disconnect();
      
      // Navigate immediately
      navigate('/quiz-results');
    } catch (err) {
      console.error('Auto submit error:', err);
      navigate('/quiz-results');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage =
    totalQuestions === 0 ? 0 : ((getAnsweredCount() / totalQuestions) * 100).toFixed(0);

  // ===============================
  // UI
  // ===============================
  return (
    <div className="quiz-attempt-wrapper">
      {/* RESULT CARD */}
        {/* Popup removed per request */}

      <div className="quiz-attempt-main">
        {/* LEFT: QUIZ CONTENT */}
        <div className="quiz-content">
          {/* HEADER */}
          <div className="quiz-attempt-header">
            <div>
              <h2>{quizData?.title}</h2>
              <p>{quizData?.topic || 'General'}</p>
            </div>
            <div className={`timer ${timeRemaining <= 60 ? 'timer-warning' : ''}`}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
          </div>

          {/* PROGRESS */}
          <div className="progress-section">
            <div className="progress-info">
              <span>Question {currentQuestion + 1} / {totalQuestions}</span>
              <span className="answered-count">{getAnsweredCount()} answered</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          {/* QUESTION */}
          <div className="question-section">
            <div className="question-box">
              <span className="question-number">{currentQuestion + 1}.</span>
              <span className="question-text">{questions[currentQuestion]?.question}</span>
            </div>
          </div>

          {/* OPTIONS */}
          <div className="options-container">
            {questions[currentQuestion]?.options?.map((option, index) => (
              <label
                key={index}
                className={`option-label ${answers[questions[currentQuestion]?._id] === option ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  className="option-input"
                  name={`question-${currentQuestion}`}
                  checked={answers[questions[currentQuestion]?._id] === option}
                  onChange={() => handleAnswerSelect(index)}
                />
                <span className="option-text">{option}</span>
              </label>
            ))}
          </div>

          {/* NAVIGATION */}
          <div className="navigation-buttons">
            <button 
              className="nav-btn prev-btn" 
              onClick={handlePrevious} 
              disabled={currentQuestion === 0}
            >
              ← Previous
            </button>

            <div className="nav-center">
              <span className="question-indicator">
                {currentQuestion + 1} / {totalQuestions}
              </span>
            </div>

            {currentQuestion < totalQuestions - 1 ? (
              <button className="nav-btn next-btn" onClick={handleNext}>
                Next →
              </button>
            ) : (
              <button className="nav-btn submit-btn" onClick={handleSubmitQuiz}>
                Submit Quiz ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptQuiz;
