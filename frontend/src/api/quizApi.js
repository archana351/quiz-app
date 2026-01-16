import axios from 'axios';
import { getAuthToken } from './authApi';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: { 'Content-Type': 'application/json' },
});

// Add token to headers if available
client.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// =====================
// QUIZ API FUNCTIONS
// =====================

// Get all quizzes from database
// Used by Dashboard to display all available quizzes on load
export const getAllQuizzes = async () => {
  try {
    const response = await client.get('/quizzes');
    return response.data.data || [];
  } catch (error) {
    console.error('Get all quizzes error:', error.response?.data || error.message);
    return [];
  }
};

// Create a new quiz (teacher only)
export const createQuiz = (payload) => client.post('/quizzes', payload);

// Start a quiz (teacher only)
export const startQuiz = (quizId) => client.patch(`/quizzes/${quizId}/start`);

// End a quiz (teacher only)
export const endQuiz = (quizId) => client.patch(`/quizzes/${quizId}/end`);

// Submit quiz answers and get validated results
export const submitQuizAnswers = (quizId, answers, meta = {}) => 
  client.post(`/quizzes/${quizId}/submit`, { quizId, answers, ...meta });

// Submit quiz attempt with integrity metrics
export const submitQuizAttempt = ({ quizId, answers, copyCount = 0, tabSwitchCount = 0, timeTaken = 0 }) =>
  client.post('/quiz-attempts/submit', {
    quizId,
    answers,
    copyCount,
    tabSwitchCount,
    timeTaken,
  });

// Add a question to a quiz
export const addQuestion = (quizId, question) => 
  client.post(`/quizzes/${quizId}/questions`, question);

// Get analytics data for quizzes
export const getAnalytics = () => client.get('/quizzes/analytics');

// =====================
// AI-POWERED SEARCH
// =====================
// Search quizzes by topic or subject using AI
export const searchQuizzes = async (topic) => {
  try {
    const response = await client.get('/quizzes/search', {
      params: { topic },
    });

    // Return the quiz data array
    return response.data.data || [];
  } catch (error) {
    console.error('Search quizzes error:', error.response?.data || error.message);
    return [];
  }
};

export default client;
