import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://quiz-app-backend-o4nv.onrender.com/api';

const authApi = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// -------------------------------
// REQUEST INTERCEPTOR (ADD TOKEN)
// -------------------------------
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------------
// RESPONSE INTERCEPTOR (401 HANDLING)
// -------------------------------
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// -------------------------------
// REGISTER USER
// -------------------------------
export const registerUser = async (userData) => {
  try {
    console.log('Sending registration request:', userData);

    const response = await authApi.post('/register', userData);

    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem(
        'user',
        JSON.stringify(response.data.data.user)
      );
    }

    return response.data;
  } catch (error) {
    console.error('Registration error:', error);

    // 🔴 Backend not running / network issue
    if (!error.response) {
      throw new Error('Server not running. Please try again later.');
    }

    // 🔴 Backend validation error
    const message =
      error.response.data?.message || 'Registration failed';
    throw new Error(message);
  }
};

// -------------------------------
// LOGIN USER
// -------------------------------
export const loginUser = async (credentials) => {
  try {
    console.log('Sending login request:', credentials);

    const response = await authApi.post('/login', credentials);

    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem(
        'user',
        JSON.stringify(response.data.data.user)
      );
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error);

    // 🔴 Backend not running / network issue
    if (!error.response) {
      throw new Error('Server not running. Please try again later.');
    }

    // 🔴 Backend auth error (user not registered / wrong password)
    const message =
      error.response.data?.message || 'Login failed';
    throw new Error(message);
  }
};

// -------------------------------
// LOGOUT
// -------------------------------
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// -------------------------------
// HELPERS
// -------------------------------
export const getAuthToken = () => localStorage.getItem('token');

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export default authApi;
