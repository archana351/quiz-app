import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllQuizzes } from '../../api/quizApi';
import { getCurrentUser } from '../../api/authApi';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActiveQuiz();
  }, []);

  const fetchActiveQuiz = async () => {
    setLoading(true);
    try {
      const quizzes = await getAllQuizzes();
      const active = quizzes.find(q => q.isActive === true);
      setActiveQuiz(active || null);
    } catch (err) {
      setError('Failed to fetch active quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (activeQuiz) {
      navigate('/attempt-quiz', { state: { quiz: activeQuiz } });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!user || (user.role !== 'student' && user.role !== 'teacher')) {
    return (
      <div className="page-wrapper">
        <p>Unauthorized. Please login.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <h2>Student Dashboard</h2>
        <div className="header-buttons">
          <button onClick={() => navigate('/')}>Home</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="card">
        <h3>Active Quiz</h3>
        {error && <div className="error-alert">{error}</div>}
        {loading ? (
          <p>Loading...</p>
        ) : activeQuiz ? (
          <div>
            <h4>{activeQuiz.title}</h4>
            <p>Topic: {activeQuiz.topic}</p>
            <p>Difficulty: {activeQuiz.difficulty}</p>
            <p>Questions: {activeQuiz.questions?.length || 0}</p>
            <button onClick={handleJoin} className="submit-btn">
              Start Quiz
            </button>
          </div>
        ) : (
          <p>No active quiz available. Please wait for your teacher to start a quiz.</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
