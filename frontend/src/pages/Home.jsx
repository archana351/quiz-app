import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="home-navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <h1>📝 Quiz App</h1>
          </div>
          <div className="navbar-buttons">
            <button onClick={() => navigate('/login')} className="nav-btn login-nav-btn">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="nav-btn register-nav-btn">
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Online Quiz System</h1>
          <p className="hero-description">
            Take quizzes, track your score, and learn better
          </p>
          <button className="start-quiz-btn" onClick={() => navigate('/register')}>
            Start Quiz
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
