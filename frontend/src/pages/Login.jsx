import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import { loginUser } from '../api/authApi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific errors
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccessMessage('');
    setErrors((prev) => {
      const { submit, ...rest } = prev;
      return rest;
    });

    try {
      console.log('Attempting login with email:', formData.email);
      const response = await loginUser(formData);

      // Backend returns {status: 'success', data: {user, token}, message: ...}
      if (response?.status === 'success' && response?.data?.token) {
        console.log('Login successful:', response);

        // Show success message
        setSuccessMessage('✅ Login successful! Redirecting...');
        
        // Redirect after 1s
        setTimeout(() => {
          const userRole = response?.data?.user?.role || response?.data?.data?.user?.role;
          if (userRole === 'teacher') {
            navigate('/teacher');
          } else {
            navigate('/student');
          }
        }, 1000);
      } else {
        throw new Error(response?.message || 'Invalid response from server');
      }
    } catch (error) {
      console.error('Login error caught:', error);
      
      // Get error message from API response
      const errorMessage = error.message || 'Login failed. Please try again.';
      
      // Show error in alert AND in the form
      alert('❌ Login Failed\n\n' + errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login</h2>

        {/* Success Message */}
        {successMessage && <div className="success-alert">{successMessage}</div>}

        {/* Error Messages */}
        {errors.submit && (
          <div className="error-alert">
            <span>⚠️ {errors.submit}</span>
            <button
              type="button"
              onClick={() => setErrors({})}
              className="close-alert-btn"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            label="Email"
            required
            error={errors.email}
          />

          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            label="Password"
            required
            error={errors.password}
          />

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
