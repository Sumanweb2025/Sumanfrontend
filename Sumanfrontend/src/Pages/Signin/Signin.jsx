import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logoImage from '../../assets/logo-title.png';
import './Signin.css';

// Google Sign-In Component
const GoogleSignIn = ({ onSuccess, onError, loading }) => {
  useEffect(() => {
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
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [signinData, setSigninData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const API_URL = import.meta.env.VITE_APP_API_URL;

  // Helper function to safely store user data with image handling
  const storeUserData = (user, token) => {
    try {
      const userDataToStore = {
        ...user,
        profileImage: user.profileImage || user.picture || null
      };

      // console.log('Storing user data:', {
      //   name: userDataToStore.name,
      //   email: userDataToStore.email,
      //   hasProfileImage: !!userDataToStore.profileImage,
      //   profileImageType: userDataToStore.profileImage ?
      //     (userDataToStore.profileImage.startsWith('data:') ? 'base64' : 'url') : 'none'
      // });

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userDataToStore));

      return true;
    } catch (error) {
      console.error('Error storing user data:', error);
      return false;
    }
  };

  // NEW: Helper function to handle post-login actions
  const handleLoginSuccess = (user, token) => {
    // Store user data
    const stored = storeUserData(user, token);

    if (!stored) {
      setErrors({ api: 'Failed to save user data. Please try again.' });
      toast.error('Failed to save user data. Please try again.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    }

    // NEW: Clear guest-related data
    const guestSessionId = localStorage.getItem('guestSessionId');
    if (guestSessionId) {
      console.log('Guest session detected - data will be migrated by backend');
      // Backend has already merged the data via sessionId in request
    }

    localStorage.removeItem('userType');
    localStorage.removeItem('guestSessionId');
    localStorage.removeItem('hasSeenGuestModal'); // Reset modal for next logout

    // Show success message
    toast.success(`Welcome back, ${user.name}!`, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // NEW: Handle redirect
    setTimeout(() => {
      const returnUrl = localStorage.getItem('returnUrl');
      if (returnUrl) {
        localStorage.removeItem('returnUrl');
        navigate(returnUrl, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }, 1500);

    return true;
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
      // NEW: Get guest session ID for migration
      const guestSessionId = localStorage.getItem('guestSessionId');

      const response = await axios.post(`${API_URL}api/auth/login`, {
        email: signinData.email.toLowerCase().trim(),
        password: signinData.password,
        sessionId: guestSessionId // NEW: Send to backend for migration
      });

      if (response.data.success) {
        const token = response.data.data.token;
        const user = response.data.data.user;

        // Use centralized login success handler
        handleLoginSuccess(user, token);
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
          toast.error(data.message, {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          setErrors({ api: 'Sign in failed. Please try again.' });
          toast.error('Sign in failed. Please try again.', {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } else if (error.request) {
        const errorMsg = 'Network error. Please check your connection and try again.';
        setErrors({ api: errorMsg });
        toast.error(errorMsg, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.';
        setErrors({ api: errorMsg });
        toast.error(errorMsg, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setGoogleLoading(true);
    setErrors({});

    try {
      // NEW: Get guest session ID for migration
      const guestSessionId = localStorage.getItem('guestSessionId');

      const response = await axios.post(`${API_URL}api/auth/google-auth`, {
        credential,
        sessionId: guestSessionId // NEW: Send to backend for migration
      });

      if (response.data.success) {
        const { token, user } = response.data.data;

        // Use centralized login success handler
        handleLoginSuccess(user, token);
      }

    } catch (error) {
      console.error('Google auth error:', error);

      let errorMsg = 'Google authentication failed';
      if (error.response && error.response.data) {
        errorMsg = error.response.data.message || errorMsg;
        setErrors({ api: errorMsg });
      } else if (error.request) {
        errorMsg = 'Network error. Please check your connection and try again.';
        setErrors({ api: errorMsg });
      } else {
        errorMsg = 'An unexpected error occurred. Please try again.';
        setErrors({ api: errorMsg });
      }
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (errorMessage) => {
    setErrors({ api: errorMessage });
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div className="signin-wrapper">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="signin-form-logo">
        <img src={logoImage} alt="Suman Foods Logo" />
        <span className="signin-form-logo-text">Iyappaa Sweets & Snacks</span>
      </div>
      <div className="signin-right">
        <p className="signin-form-subtitle">Please enter your details</p>
        <h2 className="signin-form-title">Welcome back</h2>

        {errors.api && <div className="signin-error-message">{errors.api}</div>}

        <form onSubmit={handleSubmit} className="signin-form">
          <div className="signin-form-group">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={signinData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              autoComplete="email"
            />
            <div className="signin-error-text-wrapper">
              <span className="signin-error-text">{errors.email || ''}</span>
            </div>
          </div>

          <div className="signin-form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={signinData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              autoComplete="current-password"
            />
            <div className="signin-error-text-wrapper">
              <span className="signin-error-text">{errors.password || ''}</span>
            </div>
          </div>

          <div className="signin-form-options">
            <div className="signin-remember-me">
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
              <a href="/forgot-password">Forgot password</a>
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

        <div className="signin-footer">
          <p>Don't have an account? <a href="/signup">Sign up</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;