import React, { useState, useEffect } from 'react';

const Leaderboard = ({ quizId, userId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Update leaderboard when data changes
  const updateLeaderboard = (data) => {
    if (data && data.scores && Array.isArray(data.scores)) {
      // Sort by score descending and position descending
      const sorted = [...data.scores].sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return b.percentage - a.percentage;
      });
      setLeaderboard(sorted);
    }
  };

  // Check if current user is in leaderboard
  const getCurrentUserRank = () => {
    const userEntry = leaderboard.find(entry => entry.userId === userId);
    if (userEntry) {
      return leaderboard.indexOf(userEntry) + 1;
    }
    return null;
  };

  return (
    <div className="leaderboard-container">
      <h3 className="leaderboard-title">📊 Live Leaderboard</h3>
      
      {isLoading ? (
        <div className="leaderboard-loading">Loading leaderboard...</div>
      ) : leaderboard.length === 0 ? (
        <div className="leaderboard-empty">No scores yet. Be the first!</div>
      ) : (
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <div className="leaderboard-rank">Rank</div>
            <div className="leaderboard-user">User</div>
            <div className="leaderboard-percentage">%</div>
          </div>
          
          {leaderboard.slice(0, 10).map((entry, index) => {
            const isCurrentUser = entry.userId === userId;
            return (
              <div
                key={`${entry.userId}-${index}`}
                className={`leaderboard-row ${isCurrentUser ? 'current-user' : ''}`}
              >
                <div className="leaderboard-rank">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </div>
                <div className="leaderboard-user">
                  {entry.userName || `User ${entry.userId.substring(0, 8)}`}
                  {isCurrentUser && ' (You)'}
                </div>
                <div className="leaderboard-percentage">{entry.percentage}%</div>
              </div>
            );
          })}
        </div>
      )}

      {getCurrentUserRank() && (
        <div className="leaderboard-user-position">
          Your Rank: #{getCurrentUserRank()} out of {leaderboard.length}
        </div>
      )}

      {/* Expose updateLeaderboard to parent */}
      <div style={{ display: 'none' }} ref={(el) => {
        if (el && !el.updateLeaderboard) {
          el.updateLeaderboard = updateLeaderboard;
        }
      }} />
    </div>
  );
};

export default Leaderboard;
