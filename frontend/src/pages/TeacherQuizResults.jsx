import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const TeacherQuizResults = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        console.log("🔍 Fetching results for quizId:", quizId);
        console.log("🔑 Token exists:", !!token);

        const response = await axios.get(
          `http://localhost:5000/api/quiz-attempts/quiz/${quizId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("FULL API RESPONSE:", response.data);
        console.log("Response status:", response.data.status);
        console.log("Response data object:", response.data.data);

        const attempts = response.data?.data?.attempts || [];
        console.log('RESULT DATA (attempts array):', attempts);
        console.log('Number of attempts:', attempts.length);

        if (attempts.length > 0) {
          console.log('First attempt sample:', attempts[0]);
        }

        setAttempts(attempts);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching quiz results:', err);
        console.error('❌ Error response:', err.response?.data);
        console.error('❌ Error status:', err.response?.status);
        setError(err.response?.data?.message || 'Failed to fetch quiz results');
        setAttempts([]);
        setLoading(false);
      }
    };

    if (quizId) {
      fetchResults();
    } else {
      console.warn('⚠️ No quizId provided');
    }
  }, [quizId]);

  if (loading) return <div className="p-4"><p>Loading quiz results...</p></div>;

  return (
    <div className="p-4" style={{ backgroundColor: '#1f2937', color: 'white', minHeight: '100vh' }}>
      <div className="mb-6">
        <button
          onClick={() => navigate('/teacher')}
          className="bg-gray-600 hover:bg-gray-700 text-white rounded"
          style={{ padding: '14px 32px', fontSize: '18px', fontWeight: 'bold' }}
        >
          ← Back to Teacher Dashboard
        </button>
      </div>

      <h2 className="text-4xl font-bold mb-6" style={{ color: 'white' }}>Quiz Results</h2>

      {error && <p className="text-red-400 font-bold mb-4" style={{ fontSize: '18px' }}>{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ backgroundColor: '#374151', fontSize: '20px', border: '3px solid #6b7280' }}>
          <thead>
            <tr className="bg-gray-800" style={{ borderBottom: '3px solid #6b7280' }}>
              <th className="px-6 py-5 text-left" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', borderRight: '2px solid #6b7280' }}>Student Name</th>
              <th className="px-6 py-5 text-left" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', borderRight: '2px solid #6b7280' }}>Email</th>
              <th className="px-6 py-5 text-center" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', borderRight: '2px solid #6b7280' }}>Correct Answers</th>
              <th className="px-6 py-5 text-center" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', borderRight: '2px solid #6b7280' }}>Wrong Answers</th>
              <th className="px-6 py-5 text-center" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', borderRight: '2px solid #6b7280' }}>Score</th>
              <th className="px-6 py-5 text-center" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', borderRight: '2px solid #6b7280' }}>Cheating Detected</th>
              <th className="px-6 py-5 text-center" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {attempts.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-5 text-center font-semibold" style={{ color: '#9ca3af', fontSize: '20px', borderTop: '2px solid #6b7280' }}>
                  No student submissions yet
                </td>
              </tr>
            ) : (
              attempts.map((attempt, index) => (
                <tr key={index} className="hover:bg-gray-700" style={{ backgroundColor: '#374151', borderTop: '2px solid #6b7280' }}>
                  <td className="px-6 py-5 font-semibold" style={{ color: 'white', fontSize: '19px', borderRight: '2px solid #6b7280' }}>
                    {attempt.studentName}
                  </td>
                  <td className="px-6 py-5" style={{ color: '#e5e7eb', fontSize: '19px', borderRight: '2px solid #6b7280' }}>
                    {attempt.studentEmail}
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-green-400" style={{ fontSize: '19px', borderRight: '2px solid #6b7280' }}>
                    {attempt.correctCount}
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-red-400" style={{ fontSize: '19px', borderRight: '2px solid #6b7280' }}>
                    {attempt.wrongCount}
                  </td>
                  <td className="px-6 py-5 text-center font-bold" style={{ color: 'white', fontSize: '19px', borderRight: '2px solid #6b7280' }}>
                    {attempt.correctCount + attempt.wrongCount}
                  </td>
                  <td
                    className="px-6 py-5 text-center font-semibold"
                    style={{ color: attempt.cheatingDetected ? '#f87171' : '#86efac', fontSize: '19px', borderRight: '2px solid #6b7280' }}
                  >
                    {attempt.cheatingDetected ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-5 text-center" style={{ color: '#d1d5db', fontSize: '18px' }}>
                    {new Date(attempt.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherQuizResults;
