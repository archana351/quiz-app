import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const TeacherDashboard = () => {
  const { quizId } = useParams();
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch quiz attempts for specific quiz
  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        console.log('📌 quizId from URL:', quizId);

        if (!quizId) {
          setError('Quiz ID not found in URL');
          setLoading(false);
          return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('🔐 Token exists:', !!token);

        const response = await axios.get(
          `http://localhost:5000/api/quiz-attempts/${quizId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const attempts = response.data.data?.attempts || response.data.attempts || [];
        console.log('✅ API Response:', response.data);
        console.log('📊 Attempts array:', attempts);
        console.log('📋 Attempts count:', attempts.length);

        setQuizAttempts(attempts);
        setLoading(false);
      } catch (err) {
        console.error('❌ API Error:', err.response?.data || err.message);
        setError(`Failed to fetch quiz attempts: ${err.response?.data?.message || err.message}`);
        setLoading(false);
      }
    };

    if (quizId) {
      fetchAttempts();
    } else {
      console.warn('⚠️ No quizId in URL params');
      setLoading(false);
    }
  }, [quizId]);

  if (loading) return <p className="p-4 text-lg">Loading quiz attempts...</p>;
  if (error) return <p className="p-4 text-red-600 font-bold">{error}</p>;
  if (!quizId) return <p className="p-4 text-red-600 font-bold">Quiz ID not found in URL</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Quiz Analysis - Student Attempts</h2>
      <p className="text-gray-600 mb-4">Quiz ID: {quizId}</p>

      {quizAttempts.length === 0 ? (
        <p className="text-gray-600 text-lg font-semibold">No student has submitted this quiz yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2 text-left">Student Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-center">Correct Answers</th>
                <th className="border px-4 py-2 text-center">Wrong Answers</th>
                <th className="border px-4 py-2 text-center">Score</th>
                <th className="border px-4 py-2 text-center">Cheating Status</th>
                <th className="border px-4 py-2 text-center">Submitted Date</th>
              </tr>
            </thead>
            <tbody>
              {quizAttempts.map((attempt, index) => {
                const cheatingStatus =
                  typeof attempt.cheatingDetected === 'boolean'
                    ? attempt.cheatingDetected
                    : false;

                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 font-semibold">{attempt.studentName || 'Unknown'}</td>
                    <td className="border px-4 py-2">{attempt.studentEmail || 'N/A'}</td>
                    <td className="border px-4 py-2 text-center font-bold text-green-700">{attempt.correctCount ?? 0}</td>
                    <td className="border px-4 py-2 text-center font-bold text-red-700">{attempt.wrongCount ?? 0}</td>
                    <td className="border px-4 py-2 text-center font-bold">{attempt.correctCount ?? 0}</td>
                    <td className="border px-4 py-2 text-center font-semibold" style={{ color: cheatingStatus ? '#dc2626' : '#15803d' }}>
                      {cheatingStatus ? 'Yes' : 'No'}
                    </td>
                    <td className="border px-4 py-2 text-center text-sm text-gray-700">
                      {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
