import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../../api/quizApi';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAnalytics();
        setStats(res?.data || { quizzes: 0, attempts: 0, avgScore: 0 });
      } catch (err) {
        setError(err?.message || 'Failed to load analytics');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-container">
      <h2>Quiz Analytics</h2>
      {error && <div className="error-alert">{error}</div>}
      {!stats ? (
        <p>Loading...</p>
      ) : (
        <div className="analytics-grid">
          <div className="stat-card"><h4>Total Quizzes</h4><p>{stats.quizzes}</p></div>
          <div className="stat-card"><h4>Total Attempts</h4><p>{stats.attempts}</p></div>
          <div className="stat-card"><h4>Average Score</h4><p>{stats.avgScore}%</p></div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
