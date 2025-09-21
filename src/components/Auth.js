import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

function Auth({ onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    restaurant_id: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Determine base URL
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction 
    ? 'https://waiter-backend-futa.onrender.com'
    : 'http://localhost:5001';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        console.log('Attempting login with:', formData.username);
        const response = await axios.post(`${baseUrl}/api/auth/login`, {
          username: formData.username,
          password: formData.password
        });

        console.log('Login successful:', response.data);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLogin(response.data.user);
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const response = await axios.post(`${baseUrl}/api/auth/register`, {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          restaurant_id: formData.restaurant_id
        });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onRegister(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (googleData) => {
    setLoading(true);
    setError('');

    try {
      console.log('Attempting Google auth with:', googleData.email);
      const response = await axios.post(`${baseUrl}/api/auth/google`, {
        googleId: googleData.googleId,
        email: googleData.email,
        firstName: googleData.givenName,
        lastName: googleData.familyName,
        profilePicture: googleData.imageUrl
      });

      console.log('Google auth successful:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      restaurant_id: ''
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🍽️ Waiter FM</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Welcome back!' : 'Join the team!'}
          </p>
          {isLogin && (
            <div className="demo-credentials">
              <p><strong>Demo Admin:</strong> username: <code>admin</code>, password: <code>admin123</code></p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="Enter your username or email"
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your first name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your last name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm your password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="restaurant_id">Restaurant ID (Optional)</label>
                <input
                  type="text"
                  id="restaurant_id"
                  name="restaurant_id"
                  value={formData.restaurant_id}
                  onChange={handleInputChange}
                  placeholder="e.g., REST001, Downtown Branch"
                />
              </div>
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? '⏳ Loading...' : (isLogin ? '🚀 Login' : '📝 Register')}
          </button>

          <div className="google-auth-section">
            <div className="divider">
              <span>or</span>
            </div>
            <button 
              type="button"
              className="google-auth-button"
              onClick={() => {
                // For demo purposes, simulate Google auth
                const mockGoogleData = {
                  googleId: 'demo_' + Date.now(),
                  email: 'demo@example.com',
                  givenName: 'Demo',
                  familyName: 'User',
                  imageUrl: 'https://via.placeholder.com/100'
                };
                handleGoogleAuth(mockGoogleData);
              }}
              disabled={loading}
            >
              <span className="google-icon">🔍</span>
              Continue with Google
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button" 
              className="toggle-button"
              onClick={toggleMode}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>

        <div className="demo-info">
          <h3>🎯 Demo Credentials</h3>
          <div className="demo-credentials">
            <div className="demo-role">
              <strong>Admin:</strong> admin / admin123
            </div>
            <div className="demo-role">
              <strong>Waiter:</strong> Register a new account
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
