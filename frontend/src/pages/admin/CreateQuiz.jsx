import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz } from '../../api/quizApi';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', timeLimit: 10, isPublic: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    try {
      const res = await createQuiz(form);
      const quizId = res?.data?.quiz?._id || res?.data?.id;
      if (quizId) {
        navigate(`/admin/quizzes/${quizId}/questions`);
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Create New Quiz</h2>
      {error && <div className="error-alert">{error}</div>}
      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} placeholder="Quiz title" required />
        </label>
        <label>
          Description
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description" />
        </label>
        <label>
          Time Limit (minutes)
          <input type="number" min="1" name="timeLimit" value={form.timeLimit} onChange={handleChange} />
        </label>
        <label className="checkbox">
          <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleChange} />
          Public
        </label>
        <div className="actions">
          <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Creating...' : 'Create Quiz'}</button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
