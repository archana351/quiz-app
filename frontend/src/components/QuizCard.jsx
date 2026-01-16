// src/components/QuizCard.jsx
import React from 'react';

const QuizCard = ({ quiz, onStart }) => {
  if (!quiz) return null;

  const { title, topic, difficulty, questions } = quiz;
  const questionCount = Array.isArray(questions) ? questions.length : 0;

  return (
    <div className="quiz-card">
      <div className="quiz-card-header">
        <h3 className="quiz-title">{title}</h3>
        <span className={`difficulty-badge ${difficulty}`}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
      </div>
      <p className="quiz-topic">📚 {topic}</p>
      <p className="quiz-questions">❓ {questionCount} Questions</p>
      <button
        className="quiz-start-btn"
        onClick={() => onStart(quiz)}
      >
        Start Quiz →
      </button>
    </div>
  );
};

export default QuizCard;
