import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  // Initialize Socket.IO connection
  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:5000', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('✓ Connected to Socket.IO server');
      });

      this.socket.on('disconnect', () => {
        console.log('✗ Disconnected from Socket.IO server');
      });

      this.socket.on('error', (error) => {
        console.error('Socket.IO Error:', error);
      });
    }

    return this.socket;
  }

  // Emit joinQuiz event
  joinQuiz(userId, quizId, quizTitle) {
    if (this.socket) {
      this.socket.emit('joinQuiz', {
        userId,
        quizId,
        quizTitle,
        joinedAt: new Date().toISOString(),
      });
      console.log(`Joined quiz: ${quizId} as user: ${userId}`);
    }
  }

  // Emit submitAnswer event
  submitAnswer(userId, quizId, questionIndex, selectedOption) {
    if (this.socket) {
      this.socket.emit('submitAnswer', {
        userId,
        quizId,
        questionIndex,
        selectedOption,
        timestamp: new Date().toISOString(),
      });
      console.log(`Submitted answer for question ${questionIndex}`);
    }
  }

  // Emit quiz completion event
  completeQuiz(userId, quizId, score, total) {
    if (this.socket) {
      this.socket.emit('completeQuiz', {
        userId,
        quizId,
        score,
        total,
        percentage: ((score / total) * 100).toFixed(1),
        completedAt: new Date().toISOString(),
      });
      console.log(`Completed quiz ${quizId} with score ${score}/${total}`);
    }
  }

  // Listen for leaderboard updates
  onLeaderboardUpdate(callback) {
    if (this.socket) {
      this.socket.on('leaderboardUpdate', (data) => {
        console.log('Leaderboard updated:', data);
        callback(data);
      });
    }
  }

  // Listen for user joined event
  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('userJoined', (data) => {
        console.log('User joined:', data);
        callback(data);
      });
    }
  }

  // Listen for quiz update event
  onQuizUpdate(callback) {
    if (this.socket) {
      this.socket.on('quizUpdate', (data) => {
        console.log('Quiz updated:', data);
        callback(data);
      });
    }
  }

  // Remove listener
  offLeaderboardUpdate() {
    if (this.socket) {
      this.socket.off('leaderboardUpdate');
    }
  }

  offUserJoined() {
    if (this.socket) {
      this.socket.off('userJoined');
    }
  }

  offQuizUpdate() {
    if (this.socket) {
      this.socket.off('quizUpdate');
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket.IO disconnected');
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

// Export singleton instance
export default new SocketService();
