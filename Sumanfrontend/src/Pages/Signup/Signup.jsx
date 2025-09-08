import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './Signup.css';

// Toast Component
const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`signup-toast signup-toast-${type}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
        </div>
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({
    message: '',
    type: 'info',
    isVisible: false
  });
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  // Toast helper functions
  const showToast = (message, type = 'info') => {
    setToast({
      message,
      type,
      isVisible: true
    });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!signupData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (signupData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!signupData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else if (signupData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!signupData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log('Validation errors:', validationErrors);
      showToast('Please fix the form errors before submitting', 'error');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting signup with:', {
        name: signupData.name.trim(),
        email: signupData.email.toLowerCase().trim(),
        password: '***hidden***'
      });

      const response = await axios.post('http://localhost:8000/api/auth/signup', {
        name: signupData.name.trim(),
        email: signupData.email.toLowerCase().trim(),
        password: signupData.password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('Signup response:', response.data);

      if (response.data && response.data.success) {
        // Store auth data
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        
        showToast(`Welcome to Iyappaa Sweets & Snacks, ${signupData.name}! Your account has been created successfully.`, 'success');
        
        // Navigate after showing toast for a moment
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        // Handle case where response doesn't have expected structure
        console.error('Unexpected response structure:', response.data);
        setErrors({ api: 'Account creation failed. Please try again.' });
        showToast('Account creation failed. Please try again.', 'error');
      }

    } catch (error) {
      console.error('SignUp error:', error);

      if (error.response) {
        // Server responded with error status
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        
        const { data, status } = error.response;

        if (status === 400 && data.errors && Array.isArray(data.errors)) {
          // Handle validation errors from server
          const formattedErrors = {};
          data.errors.forEach(err => {
            const field = err.path || err.param || err.field;
            formattedErrors[field] = err.msg || err.message;
          });
          setErrors(formattedErrors);
          showToast('Please fix the form errors and try again', 'error');
        } else if (status === 409) {
          // Handle duplicate email
          setErrors({ email: 'An account with this email already exists' });
          showToast('An account with this email already exists', 'error');
        } else if (data.message) {
          setErrors({ api: data.message });
          showToast(data.message, 'error');
        } else {
          const errorMsg = `Server error (${status}). Please try again.`;
          setErrors({ api: errorMsg });
          showToast(errorMsg, 'error');
        }
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.request);
        const errorMsg = 'Cannot connect to server. Please check if the backend is running on http://localhost:8000';
        setErrors({ api: errorMsg });
        showToast(errorMsg, 'error');
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        const errorMsg = 'Request timed out. Please try again.';
        setErrors({ api: errorMsg });
        showToast(errorMsg, 'error');
      } else {
        // Other error
        console.error('Unexpected error:', error.message);
        const errorMsg = 'An unexpected error occurred. Please try again.';
        setErrors({ api: errorMsg });
        showToast(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      {/* Toast Notification */}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />

      <div className="signup-left">
        <div className="promo-text">
          <h1>Join Iyappaa Sweets & Snacks Today</h1>
          <p>Best Sweets and Snacks under one roof<br />Takeaway | Dining | Delivery</p>
        </div>
      </div>

      <div className="signup-right">
        <div className="signup-content">
        <h2 className="form-title">Create Your Account</h2>
        <p className="form-subtitle">Start your journey</p>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* API Error Display */}
          {errors.api && (
            <div className="error-message-container">
              <div className="error-message">{errors.api}</div>
            </div>
          )}

          {/* Name Field */}
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={signupData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              autoComplete="name"
              required
            />
            {errors.name && (
              <div className="error-text-wrapper">
                <span className="error-text">{errors.name}</span>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={signupData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              autoComplete="email"
              required
            />
            {errors.email && (
              <div className="error-text-wrapper">
                <span className="error-text">{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 characters)"
              value={signupData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              autoComplete="new-password"
              minLength="6"
              required
            />
            {errors.password && (
              <div className="error-text-wrapper">
                <span className="error-text">{errors.password}</span>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={signupData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              autoComplete="new-password"
              required
            />
            {errors.confirmPassword && (
              <div className="error-text-wrapper">
                <span className="error-text">{errors.confirmPassword}</span>
              </div>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="form-options">
            <div className="agree-terms">
              <input
                type="checkbox"
                name="agreeToTerms"
                id="agreeToTerms"
                checked={signupData.agreeToTerms}
                onChange={handleChange}
                required
              />
              <label htmlFor="agreeToTerms">
                     I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
              </label>
            </div>
            {errors.agreeToTerms && (
              <div className="error-text-wrapper">
                <span className="error-text">{errors.agreeToTerms}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="signup-btn-container">
            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Creating Account...
                </>
              ) : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <a href="/signin">Sign In</a></p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;