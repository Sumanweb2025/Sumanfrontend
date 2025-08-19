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

  // Helper function to safely store user data with image handling
  const storeUserData = (user, token) => {
    try {
      // Create a cleaned user object for storage
      const userDataToStore = {
        ...user,
        // Ensure profile image is properly formatted
        profileImage: user.profileImage || user.picture || null
      };

      console.log('Storing user data:', {
        name: userDataToStore.name,
        email: userDataToStore.email,
        hasProfileImage: !!userDataToStore.profileImage,
        profileImageType: userDataToStore.profileImage ? 
          (userDataToStore.profileImage.startsWith('data:') ? 'base64' : 'url') : 'none'
      });

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userDataToStore));
      
      return true;
    } catch (error) {
      console.error('Error storing user data:', error);
      return false;
    }
  };

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
        // Always use the nested data structure (consistent with backend)
        const token = response.data.data.token;
        const user = response.data.data.user;
        
        console.log('Regular login - User data received:', {
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          picture: user.picture,
          authProvider: user.authProvider
        });

        // Store user data safely
        const stored = storeUserData(user, token);
        
        if (stored) {
          alert('Welcome back to Food Court!');
          navigate('/', { replace: true });
        } else {
          setErrors({ api: 'Failed to save user data. Please try again.' });
        }
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

  const handleGoogleSuccess = async (credential) => {
    setGoogleLoading(true);
    setErrors({});

    try {
      console.log('Sending Google credential to backend...');
      
      const response = await axios.post('http://localhost:8000/api/auth/google-auth', {
        credential
      });

      console.log('Google auth response:', response.data);

      if (response.data.success) {
        const { token, user } = response.data.data;
        
        console.log('Google login - User data received:', {
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          picture: user.picture,
          googleProfileImage: user.googleProfileImage,
          authProvider: user.authProvider,
          profileImageInfo: user.profileImageInfo
        });

        // Store user data safely
        const stored = storeUserData(user, token);
        
        if (stored) {
          alert(`Welcome ${user.name}! Google sign-in successful.`);
          navigate('/', { replace: true });
        } else {
          setErrors({ api: 'Failed to save user data. Please try again.' });
        }
      }

    } catch (error) {
      console.error('Google auth error:', error);
      
      if (error.response && error.response.data) {
        setErrors({ api: error.response.data.message || 'Google authentication failed' });
      } else if (error.request) {
        setErrors({ api: 'Network error. Please check your connection and try again.' });
      } else {
        setErrors({ api: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (errorMessage) => {
    setErrors({ api: errorMessage });
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
        <form onSubmit={handleSubmit} className="signin-form">
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