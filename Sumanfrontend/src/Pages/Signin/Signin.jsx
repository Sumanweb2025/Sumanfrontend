import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signin.css';

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(loginData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    } else if (loginData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store authentication data
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Trigger global auth update
      window.dispatchEvent(new CustomEvent('auth-change', {
        detail: { loggedIn: true, user: data.user }
      }));

      navigate('/'); // Redirect to home page

    } catch (error) {
      console.error('Login error:', error);
      setErrors({ api: error.message || 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password'); // Better than alert
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        {/* Logo and header */}
        <div className="signin-logo">
          <span className="red">F</span><span className="orange">o</span><span className="green">o</span><span className="red">d</span>
          <span className="orange">C</span><span className="green">o</span><span className="red">u</span><span className="orange">r</span><span className="green">t</span>
        </div>
        
        <div className="signin-header">
          <h2>Welcome Back!</h2>
          <p className="signin-subtitle">Fill out the form below to login</p>
        </div>
        
        {/* Error message */}
        {errors.api && <div className="error-message">{errors.api}</div>}
        
        {/* Login form */}
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              autoComplete="email"
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              autoComplete="current-password"
              disabled={loading}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          <div className="remember-me">
            <input
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              checked={loginData.rememberMe}
              onChange={handleChange}
              disabled={loading}
            />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>
          
          <button 
            type="submit" 
            className="signin-btn" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : 'Sign In'}
          </button>
        </form>
        
        {/* Footer links */}
        <div className="signin-links">
          <button 
            type="button" 
            className="forgot-password-btn"
            onClick={handleForgotPassword}
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>
        
        <div className="signin-footer">
          <p>Don't have an account? <a href="/signup">Sign Up</a></p>
        </div>
        
        <div className="copyright">
          © {new Date().getFullYear()} Food Court. All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default SignIn;