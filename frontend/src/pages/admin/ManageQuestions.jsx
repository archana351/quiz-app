import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { addQuestion } from '../../api/quizApi';

const emptyQuestion = { text: '', options: ['', '', '', ''], correctIndex: 0 };

const ManageQuestions = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(emptyQuestion);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const updateOption = (i, value) => {
    setQuestion((prev) => ({ ...prev, options: prev.options.map((o, idx) => idx === i ? value : o) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!question.text.trim()) { setError('Question text is required'); return; }
    if (question.options.some((o) => !o.trim())) { setError('All options are required'); return; }

    setLoading(true);
    try {
      await addQuestion(id, question);
      setSuccess('Question added');
      setQuestion(emptyQuestion);
    } catch (err) {
      setError(err?.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Manage Questions</h2>
      {error && <div className="error-alert">{error}</div>}
      {success && <div className="success-alert">{success}</div>}
      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          Question
          <input value={question.text} onChange={(e) => setQuestion({ ...question, text: e.target.value })} placeholder="Enter question" />
        </label>
        <div className="options">
          {question.options.map((opt, i) => (
            <label key={i}>
              Option {i + 1}
              <input value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
            </label>
          ))}
        </div>
        <label>
          Correct Answer
          <select value={question.correctIndex} onChange={(e) => setQuestion({ ...question, correctIndex: Number(e.target.value) })}>
            {[0,1,2,3].map((i) => <option key={i} value={i}>{`Option ${i+1}`}</option>)}
          </select>
        </label>
        <div className="actions">
          <button className="submit-btn" disabled={loading}>{loading ? 'Saving...' : 'Add Question'}</button>
        </div>
      </form>
    </div>
  );
};

export default ManageQuestions;
