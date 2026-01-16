import React from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../api/authApi';

const AdminDashboard = () => {
  const user = getCurrentUser();

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome{user ? `, ${user.name}` : ''}! Manage quizzes and view analytics.</p>
      </div>

      <div className="admin-grid">
        <Link to="/admin/quizzes/new" className="admin-card">
          <h3>Create Quiz</h3>
          <p>Set quiz details, time limit, visibility.</p>
        </Link>

        <Link to="/admin/analytics" className="admin-card">
          <h3>Quiz Analytics</h3>
          <p>Track attempts, average scores, completion rates.</p>
        </Link>

        <Link to="/" className="admin-card">
          <h3>Back to Home</h3>
          <p>Return to user dashboard.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
