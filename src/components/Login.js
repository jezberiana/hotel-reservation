import React, { useState } from 'react';

const Login = ({ onLogin, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation - in real app, this would be an API call
      if (formData.email && formData.password) {
        // Mock user data
        const userData = {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: formData.email,
          phone: '+63 917 123 4567'
        };
        onLogin(userData);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account to continue booking</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="auth-btn primary"
            disabled={isLoading}
          >
            {isLoading ? '🔄 Signing In...' : '🔐 Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? 
            <button 
              onClick={onSwitchToSignup}
              className="auth-link"
            >
              Sign up here
            </button>
          </p>
        </div>

        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Email: demo@hotel.com</p>
          <p>Password: demo123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
