import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { getCurrentUser } from '../api/authApi';

const QuizRoom = ({ quizId }) => {
  const socket = useSocket();
  const [scores, setScores] = useState([]);

  const user = getCurrentUser();

  useEffect(() => {
    if (!socket || !user) return;

    // Join quiz room
    socket.emit('joinQuiz', quizId, user);

    // Listen for new participants
    socket.on('userJoined', (data) => {
      console.log(`${data.name} joined the quiz`);
    });

    // Listen for score updates
    socket.on('updateScores', ({ userId, score }) => {
      setScores((prev) => [...prev.filter(s => s.userId !== userId), { userId, score }]);
    });

    return () => {
      socket.emit('leaveQuiz', quizId);
      socket.off('userJoined');
      socket.off('updateScores');
    };
  }, [socket, quizId, user]);

  const submitQuiz = (score) => {
    if (!socket) return;
    socket.emit('submitQuiz', { quizId, userId: user.id, score });
  };

  return (
    <div>
      <h2>Quiz Room: {quizId}</h2>
      <button onClick={() => submitQuiz(Math.floor(Math.random() * 101))}>
        Submit Quiz (Test)
      </button>
      <h3>Scores:</h3>
      <ul>
        {scores.map((s, idx) => (
          <li key={idx}>{s.userId}: {s.score}</li>
        ))}
      </ul>
    </div>
  );
};

export default QuizRoom;
