import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizCard from '../components/QuizCard';
import { getAllQuizzes, searchQuizzes } from '../api/quizApi'; // API functions

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Difficulties
  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  useEffect(() => {
    // Check user login
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token) {
      navigate('/login');
    } else {
      setUsername(user.name || 'User');
    }
  }, [navigate]);

  // Fetch quizzes from backend
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        // Fetch all quizzes from database
        let results = await getAllQuizzes();
        console.log('Total quizzes fetched:', results.length);

        // Apply client-side filters
        // Filter by search query (quiz title)
        if (searchQuery.trim()) {
          results = results.filter(q => 
            q.title && q.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
          console.log(`After title filter (${searchQuery}):`, results.length);
        }

        // Filter by difficulty
        if (selectedDifficulty !== 'all') {
          results = results.filter(q => q.difficulty === selectedDifficulty);
          console.log(`After difficulty filter (${selectedDifficulty}):`, results.length);
        }

        console.log('Final filtered results:', results.length);
        setFilteredQuizzes(results);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setFilteredQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [searchQuery, selectedDifficulty]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleStartQuiz = (quiz) => {
    navigate('/attempt-quiz', { state: { quiz } });
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Quiz App Dashboard</h1>
        <div className="header-buttons">
          <button onClick={() => navigate('/')} className="home-button">🏠 Home</button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </div>

      {/* Welcome */}
      <div className="welcome-section">
        <h2>Welcome, {username}! 👋</h2>
        <p>Search or browse quizzes by topic, subject, or difficulty.</p>
      </div>

      {/* Search & Filters */}
      <div className="quiz-filters">
        <input
          type="text"
          className="search-bar"
          placeholder="🔍 Search quizzes by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          value={selectedDifficulty} 
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="difficulty-dropdown"
        >
          {difficulties.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      {/* Quiz Cards */}
      <div className="quiz-cards-grid">
        {loading ? (
          <p>Loading quizzes...</p>
        ) : filteredQuizzes.length > 0 ? (
          filteredQuizzes.map(quiz => (
            <QuizCard key={quiz._id || quiz.id} quiz={quiz} onStart={handleStartQuiz} />
          ))
        ) : (
          <div className="no-results">
            <p>
              No quizzes found
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedDifficulty !== 'all' && ` for ${selectedDifficulty} difficulty`}
              . Try different filters.
            </p>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>
          Showing {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedDifficulty !== 'all' && ` (${selectedDifficulty} difficulty)`}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
