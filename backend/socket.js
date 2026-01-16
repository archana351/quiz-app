// ==========================
// socket.js
// ==========================
// Socket.IO event handlers for real-time quiz availability updates

module.exports = (io) => {
  // Track active quiz participants for real-time presence
  const quizRooms = new Map(); // quizId -> { participants: Map }
  const userQuizzes = new Map(); // socketId -> quizId

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
          startTime: new Date(),
        });
      }

      // Add participant
      const room = quizRooms.get(quizId);
      room.participants.set(userId, {
        socketId: socket.id,
        joinedAt: new Date(),
      });

      // Notify all users in room that someone joined
      io.to(roomName).emit('userJoined', {
        userId,
        participantCount: room.participants.size,
        message: `User joined the quiz`,
      });

      console.log(`Quiz ${quizId} now has ${room.participants.size} participants`);
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
              message: `User left the quiz`,
            });

            console.log(`User ${disconnectedUserId} left. Quiz ${quizId} now has ${room.participants.size} participants`);
          }

          // Clean up empty rooms
          if (room.participants.size === 0) {
            quizRooms.delete(quizId);
            console.log(`Empty quiz room ${quizId} cleaned up`);
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
