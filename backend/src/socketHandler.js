// ==========================
// socketHandler.js
// ==========================
// Socket.IO event handlers for quiz functionality
// Add this to your server.js file

const setupSocketIO = (io) => {
  // Track active quiz rooms and participants
  const quizRooms = new Map(); // quizId -> { participants: Map, scores: [] }
  const userQuizzes = new Map(); // userId -> quizId

  io.on('connection', (socket) => {
    console.log(`✓ User connected: ${socket.id}`);

    // ===== JOIN QUIZ =====
    socket.on('joinQuiz', (data) => {
      const { userId, quizId, quizTitle } = data;
      const roomName = `quiz-${quizId}`;

      console.log(`User ${userId} joining quiz ${quizId}`);

      // Join socket room
      socket.join(roomName);

      // Track user to quiz mapping
      userQuizzes.set(socket.id, quizId);

      // Initialize quiz room if not exists
      if (!quizRooms.has(quizId)) {
        quizRooms.set(quizId, {
          title: quizTitle,
          participants: new Map(),
          scores: [],
          startTime: new Date(),
        });
      }

      // Add participant
      const room = quizRooms.get(quizId);
      room.participants.set(userId, {
        socketId: socket.id,
        joinedAt: new Date(),
        score: 0,
        answers: [],
      });

      // Notify all users in room that someone joined
      io.to(roomName).emit('userJoined', {
        userId,
        participantCount: room.participants.size,
        message: `${userId.substring(0, 8)} joined the quiz`,
      });

      console.log(`Quiz ${quizId} now has ${room.participants.size} participants`);
    });

    // ===== SUBMIT ANSWER =====
    socket.on('submitAnswer', (data) => {
      const { userId, quizId, questionIndex, selectedOption } = data;
      const roomName = `quiz-${quizId}`;

      const room = quizRooms.get(quizId);
      if (room && room.participants.has(userId)) {
        const participant = room.participants.get(userId);
        participant.answers[questionIndex] = selectedOption;

        console.log(
          `User ${userId} submitted answer for question ${questionIndex + 1}`
        );

        // Optionally broadcast quiz update
        io.to(roomName).emit('quizUpdate', {
          quizId,
          activeParticipants: room.participants.size,
          timestamp: new Date(),
        });
      }
    });

    // ===== COMPLETE QUIZ =====
    socket.on('completeQuiz', (data) => {
      const { userId, quizId, score, total, percentage } = data;
      const roomName = `quiz-${quizId}`;

      const room = quizRooms.get(quizId);
      if (room && room.participants.has(userId)) {
        const participant = room.participants.get(userId);
        participant.score = score;
        participant.percentage = percentage;
        participant.completedAt = new Date();

        // Add to scores array
        room.scores.push({
          userId,
          score,
          total,
          percentage,
          completedAt: new Date(),
        });

        // Sort by score descending
        room.scores.sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return b.percentage - a.percentage;
        });

        console.log(`User ${userId} completed quiz with score ${score}/${total}`);

        // Broadcast updated leaderboard to all participants
        const leaderboard = room.scores.map((score, index) => ({
          rank: index + 1,
          userId: score.userId,
          userName: score.userName || `User ${score.userId.substring(0, 8)}`,
          score: score.score,
          total: score.total,
          percentage: score.percentage,
          completedAt: score.completedAt,
        }));

        io.to(roomName).emit('leaderboardUpdate', {
          quizId,
          scores: leaderboard,
          totalParticipants: room.participants.size,
          completedCount: room.scores.length,
        });

        console.log(`Leaderboard broadcasted for quiz ${quizId}`);
      }
    });

    // ===== DISCONNECT =====
    socket.on('disconnect', () => {
      console.log(`✗ User disconnected: ${socket.id}`);

      const quizId = userQuizzes.get(socket.id);
      if (quizId) {
        const room = quizRooms.get(quizId);
        if (room) {
          // Find and remove user
          let disconnectedUserId = null;
          for (const [userId, participant] of room.participants) {
            if (participant.socketId === socket.id) {
              disconnectedUserId = userId;
              room.participants.delete(userId);
              break;
            }
          }

          if (disconnectedUserId) {
            const roomName = `quiz-${quizId}`;
            io.to(roomName).emit('userLeft', {
              userId: disconnectedUserId,
              participantCount: room.participants.size,
              message: `${disconnectedUserId.substring(0, 8)} left the quiz`,
            });

            console.log(
              `User ${disconnectedUserId} left. Quiz ${quizId} now has ${room.participants.size} participants`
            );
          }

          // Clean up empty rooms
          if (room.participants.size === 0) {
            quizRooms.delete(quizId);
            console.log(`Quiz room ${quizId} cleaned up`);
          }
        }

        userQuizzes.delete(socket.id);
      }
    });

    // ===== ERROR HANDLING =====
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return {
    quizRooms,
    userQuizzes,
  };
};

module.exports = setupSocketIO;
