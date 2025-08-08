import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signin.css';

// Google Sign-In Component
const GoogleSignIn = ({ onSuccess, onError, loading }) => {
  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular'
          }
        );
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      onSuccess(response.credential);
    } catch (error) {
      console.error('Google sign-in error:', error);
      onError('Google sign-in failed');
    }
  };

  return (
    <div className="google-signin-container">
      <div id="google-signin-button" style={{ opacity: loading ? 0.6 : 1 }}></div>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!loginData.password) {
      newErrors.password = 'Password is required';
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
        email: loginData.email.toLowerCase().trim(),
        password: loginData.password
      });

      if (response.data.success) {
        // Store user data and token
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Redirect to home page
        navigate('/', { replace: true });
      }

    } catch (error) {
      console.error('Login error:', error);
      
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
          setErrors({ api: 'Login failed. Please try again.' });
        }
      } else {
        setErrors({ api: 'Network error. Please check your connection and try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setGoogleLoading(true);
    setErrors({});

    try {
      const response = await axios.post('http://localhost:8000/api/auth/google-auth', {
        credential
      });

      if (response.data.success) {
        // Store user data and token
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Redirect to home page
        navigate('/', { replace: true });
      }

    } catch (error) {
      console.error('Google auth error:', error);
      
      if (error.response && error.response.data) {
        setErrors({ api: error.response.data.message || 'Google authentication failed' });
      } else {
        setErrors({ api: 'Network error. Please try again.' });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (errorMessage) => {
    setErrors({ api: errorMessage });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <span className="red">F</span><span className="orange">o</span><span className="green">o</span><span className="red">d</span>
          <span className="orange">C</span><span className="green">o</span><span className="red">u</span><span className="orange">r</span><span className="green">t</span>
        </div>
        
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Please sign in to your account</p>
        </div>
        
        {errors.api && <div className="error-message">{errors.api}</div>}
        
        {/* Google Sign-In Button */}
        <div className="google-auth-section">
          <GoogleSignIn 
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            loading={googleLoading}
          />
          {googleLoading && (
            <div className="google-loading">
              <span className="spinner"></span> Signing in with Google...
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="auth-divider">
          <span>or</span>
        </div>
        
        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={loginData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              autoComplete="email"
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
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          <button type="submit" className="login-btn" disabled={loading || googleLoading}>
            {loading ? (
              <>
                <span className="spinner"></span> Signing In...
              </>
            ) : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <a href="/signup">Sign Up</a></p>
        </div>
        
        <div className="copyright">
          © 2025 Food Court. All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default Login;