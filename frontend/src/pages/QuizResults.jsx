import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);

  useEffect(() => {
    const storedResults = localStorage.getItem('quizResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleBackToDashboard = () => {
    localStorage.removeItem('quizResults');
    navigate('/dashboard');
  };

  const handleRetakeQuiz = () => {
    localStorage.removeItem('quizResults');
    navigate('/attempt-quiz');
  };

  if (!results) {
    return <div className="loading">Loading results...</div>;
  }

  const passed = parseFloat(results.percentage) >= 50;

  return (
    <div className="results-wrapper">
      <div className="results-container">
        {/* Results Header */}
        <div className={`results-header ${passed ? 'passed' : 'failed'}`}>
          <div className="results-icon">
            {passed ? '🎉' : '📚'}
          </div>
          <h1>{passed ? 'Congratulations!' : 'Keep Learning!'}</h1>
          <p>{results.timeUp ? 'Time\'s up! Here are your results.' : 'You\'ve completed the quiz!'}</p>
        </div>

        {/* Score Card */}
        <div className="score-card">
          <div className="score-circle">
            <svg viewBox="0 0 100 100" className="score-svg">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e9ecef"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={passed ? '#28a745' : '#dc3545'}
                strokeWidth="10"
                strokeDasharray={`${(results.percentage * 2.827).toFixed(2)} 282.7`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="score-text">
              <span className="score-percentage">{results.percentage}%</span>
              <span className="score-fraction">{results.score}/{results.total}</span>
            </div>
          </div>
          <h2 className="quiz-title">{results.quiz}</h2>
          <p className="score-status">{passed ? 'Passed' : 'Not Passed'}</p>
        </div>

        {/* Statistics */}
        <div className="results-stats">
          <div className="stat-item">
            <span className="stat-label">Correct Answers</span>
            <span className="stat-value correct">{results.score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Wrong Answers</span>
            <span className="stat-value wrong">{results.total - results.score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Questions</span>
            <span className="stat-value">{results.total}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="results-actions">
          <button className="action-btn primary" onClick={() => navigate('/')}>
            🏠 Home
          </button>
          <button className="action-btn secondary" onClick={handleBackToDashboard}>
            Dashboard
          </button>
          <button className="action-btn secondary" onClick={handleRetakeQuiz}>
            Retake Quiz
          </button>
        </div>

        {/* Performance Message */}
        <div className="performance-message">
          {results.percentage >= 80 && <p>🌟 Excellent work! You have a strong understanding of this topic.</p>}
          {results.percentage >= 50 && results.percentage < 80 && <p>👍 Good job! Keep practicing to improve further.</p>}
          {results.percentage < 50 && <p>💪 Don't give up! Review the material and try again.</p>}
        </div>

        {/* Detailed Answer Review */}
        {results.detailedResults && results.detailedResults.length > 0 && (
          <div className="answer-review-section">
            <h3>Answer Review</h3>
            {results.detailedResults.map((result) => (
              <div key={result.questionIndex} className={`answer-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="answer-header">
                  <span className="question-number">Q{result.questionIndex + 1}</span>
                  <span className={`answer-status ${result.isCorrect ? 'correct-status' : 'incorrect-status'}`}>
                    {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
                <p className="question-text">{result.question}</p>
                <div className="answer-details">
                  <div className="your-answer">
                    <strong>Your Answer:</strong> {result.studentAnswer || 'Not answered'}
                  </div>
                  {!result.isCorrect && (
                    <div className="correct-answer">
                      <strong>Correct Answer:</strong> {result.correctAnswer}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
