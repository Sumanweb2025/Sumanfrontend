// SignIn.jsx - Eurasia Foods Style - Fixed Layout with Google Sign-In
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import './SignIn.css';

const SignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [signinData, setSigninData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSigninData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!signinData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signinData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!signinData.password) {
      newErrors.password = 'Password is required';
    } else if (signinData.password.length < 6) {
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
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email: signinData.email.toLowerCase().trim(),
        password: signinData.password
      });

      if (response.data.success) {
        // Handle both data structures - with or without data wrapper
        const token = response.data.token || response.data.data?.token;
        const user = response.data.user || response.data.data?.user;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        alert('Welcome back to Food Court!');
        navigate('/', { replace: true });
      }

    } catch (error) {
      console.error('SignIn error:', error);

      if (error.response && error.response.data) {
        const { data } = error.response;

        if (data.errors && Array.isArray(data.errors)) {
          const formattedErrors = {};
          data.errors.forEach(err => {
            formattedErrors[err.path || err.param] = err.msg;
          });
          setErrors(formattedErrors);
        } else if (data.message) {
          setErrors({ api: data.message });
        } else {
          setErrors({ api: 'Sign in failed. Please try again.' });
        }
      } else if (error.request) {
        setErrors({ api: 'Network error. Please check your connection and try again.' });
      } else {
        setErrors({ api: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('Google Response:', credentialResponse); // Debug log
    setGoogleLoading(true);
    setErrors({});

    try {
      // Fixed: Use 'token' instead of 'idToken' to match backend
      const response = await axios.post('http://localhost:8000/api/auth/google', {
        token: credentialResponse.credential
      });

      console.log('Backend Response:', response.data); // Debug log

      if (response.data.success) {
        // Handle both data structures - with or without data wrapper
        const token = response.data.token || response.data.data?.token;
        const user = response.data.user || response.data.data?.user;
        
        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          alert('Welcome back! Signed in with Google successfully.');
          navigate('/', { replace: true });
        } else {
          console.error('Missing token or user data:', { token, user });
          setErrors({ api: 'Authentication data incomplete. Please try again.' });
        }
      } else {
        setErrors({ api: response.data.message || 'Google Sign-In failed. Please try again.' });
      }

    } catch (error) {
      console.error('Google Sign-In Error:', error);
      console.error('Error Response:', error.response?.data); // Debug log

      if (error.response && error.response.data) {
        const message = error.response.data.message || 'Google Sign-In failed. Please try again.';
        setErrors({ api: message });
      } else if (error.request) {
        setErrors({ api: 'Network error. Please check your connection and try again.' });
      } else {
        setErrors({ api: 'Google Sign-In failed. Please try again.' });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google Sign-In failed:', error);
    setErrors({ api: 'Google Sign-In failed. Please try again.' });
    setGoogleLoading(false);
  };

  return (
    <div className="signin-wrapper">
      <div className="signin-left">
        <div className="promo-text">
          <h1>Welcome Back to Food Court</h1>
          <p>Best Asian food under one roof<br />Takeaway | Dining | Delivery</p>
        </div>
      </div>

      <div className="signin-right">
        <h2 className="form-title">Sign In to Your Account</h2>
        <p className="form-subtitle">Continue your culinary journey</p>

        {/* Google Sign-In Section */}
        <div className="google-signin-section">
          <div className="google-signin">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              size="large"
              width="100%"
              text="signin_with"
              shape="rectangular"
              theme="outline"
              clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
            />
          </div>
          {googleLoading && (
            <div className="google-loading">
              <span className="spinner"></span> Signing in with Google...
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className="signin-form">
          <div className="error-message-container">
            {errors.api && <div className="error-message">{errors.api}</div>}
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={signinData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              autoComplete="email"
            />
            <div className="error-text-wrapper">
              <span className="error-text">{errors.email || ''}</span>
            </div>
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={signinData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              autoComplete="current-password"
            />
            <div className="error-text-wrapper">
              <span className="error-text">{errors.password || ''}</span>
            </div>
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={signinData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <div className="forgot-password">
              <a href="/forgot-password">Forgot Password?</a>
            </div>
          </div>

          <div className="signin-btn-container">
            <button type="submit" className="signin-btn" disabled={loading || googleLoading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Signing In...
                </>
              ) : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="signin-footer">
          <p>Don't have an account? <a href="/signup">Create Account</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;