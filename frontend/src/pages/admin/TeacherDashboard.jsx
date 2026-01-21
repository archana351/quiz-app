import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz, startQuiz, endQuiz } from '../../api/quizApi';
import { getCurrentUser } from '../../api/authApi';

const emptyQuestion = { question: '', options: ['', ''], correctAnswer: '' };

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('general');
  const [difficulty, setDifficulty] = useState('easy');
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [showMyQuizzes, setShowMyQuizzes] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  const handleQuestionChange = (idx, field, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = [...copy[qIdx].options];
      opts[optIdx] = value;
      copy[qIdx] = { ...copy[qIdx], options: opts };
      return copy;
    });
  };

  const addOption = (qIdx) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = [...copy[qIdx].options, ''];
      copy[qIdx] = { ...copy[qIdx], options: opts };
      return copy;
    });
  };

  const addQuestion = () => setQuestions((prev) => [...prev, { ...emptyQuestion }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const payload = { title, topic, subject, difficulty, questions };
      const res = await createQuiz(payload);
      setMessage('Quiz created successfully! Use Start button to activate it.');
      // reset minimal
      setTitle('');
      setTopic('');
      setQuestions([]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const fetchMyQuizzes = async () => {
    setLoadingQuizzes(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://quiz-app-backend-o4nv.onrender.com/api/quizzes/my-quizzes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch quizzes');
      }

      setMyQuizzes(data.data || []);
      setShowMyQuizzes(true);
    } catch (err) {
      setError(err.message || 'Failed to fetch quizzes');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete quiz');
      }

      setMessage('✓ Quiz deleted successfully');
      // Refresh the quizzes list
      await fetchMyQuizzes();
    } catch (err) {
      setError(err.message || 'Failed to delete quiz');
    }
  };

  const handleStartQuiz = async (quizId) => {
    try {
      setError('');
      await startQuiz(quizId);
      setMessage('✓ Quiz started! Students can now join.');
      await fetchMyQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start quiz');
    }
  };

  const handleEndQuiz = async (quizId) => {
    try {
      setError('');
      await endQuiz(quizId);
      setMessage('✓ Quiz ended!');
      await fetchMyQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to end quiz');
    }
  };

  if (!user || user.role !== 'teacher') {
    return (
      <div className="page-wrapper">
        <p>Unauthorized. Please login as a teacher.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <h2>Teacher Dashboard</h2>
        <div className="header-buttons">
          <button onClick={() => navigate('/')}>Home</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="cleanup-section">
        <button 
          onClick={fetchMyQuizzes} 
          disabled={loadingQuizzes}
          className="view-quizzes-btn"
        >
          {loadingQuizzes ? 'Loading...' : '📊 View My Quizzes'}
        </button>
      </div>

      {showMyQuizzes && (
        <div className="my-quizzes-section">
          <h3>My Quizzes</h3>
          {myQuizzes.length === 0 ? (
            <p className="no-quizzes">No quizzes created yet</p>
          ) : (
            <div className="quizzes-list">
              {myQuizzes.map((quiz) => (
                <div key={quiz._id} className="quiz-item">
                  <div className="quiz-info">
                    <h4>
                      {quiz.title}
                      <span className={`status-badge ${quiz.isActive ? 'active' : 'inactive'}`}>
                        {quiz.isActive ? '🟢 Active' : '⚫ Inactive'}
                      </span>
                    </h4>
                    <p className="quiz-meta">📚 {quiz.topic} | ❓ {quiz.questions?.length || 0} questions | <span className={`difficulty ${quiz.difficulty}`}>{quiz.difficulty}</span></p>
                  </div>
                  <div className="quiz-actions">
                    {quiz.isActive ? (
                      <button 
                        onClick={() => handleEndQuiz(quiz._id)}
                        className="end-quiz-btn"
                      >
                        ⏹️ End
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStartQuiz(quiz._id)}
                        className="start-quiz-btn"
                      >
                        ▶️ Start
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/teacher/results/${quiz._id}`)}
                      className="view-quiz-btn"
                      style={{ padding: '12px 24px', fontSize: '16px', fontWeight: 'bold' }}
                    >
                      📈 View Results
                    </button>
                    <button 
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="delete-quiz-btn"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button 
            onClick={() => setShowMyQuizzes(false)}
            className="close-list-btn"
          >
            Close
          </button>
        </div>
      )}

      <form className="card" onSubmit={handleSubmit}>
        <h3>Create Quiz (Manual)</h3>
        {message && <div className="success-alert">{message}</div>}
        {error && <div className="error-alert">{error}</div>}

        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz title" required />

        <label>Topic</label>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" required />

        <label>Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />

        <label>Difficulty</label>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <div className="questions-section">
          <h4>Questions</h4>
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="question-block">
              <label>Question {qIdx + 1}</label>
              <input
                value={q.question}
                onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                placeholder="Question text"
              />

              <label>Options</label>
              {q.options.map((opt, optIdx) => (
                <input
                  key={optIdx}
                  value={opt}
                  onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                  placeholder={`Option ${optIdx + 1}`}
                />
              ))}
              <button type="button" onClick={() => addOption(qIdx)} className="secondary-btn">+ Add Option</button>

              <label>Correct Answer</label>
              <input
                value={q.correctAnswer}
                onChange={(e) => handleQuestionChange(qIdx, 'correctAnswer', e.target.value)}
                placeholder="Correct answer text"
              />
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="secondary-btn">+ Add Question</button>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creating...' : 'Create Quiz'}
        </button>
      </form>
    </div>
  );
};

export default TeacherDashboard;
