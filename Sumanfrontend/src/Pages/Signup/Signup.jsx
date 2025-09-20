import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Signup.css';


const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

   const API_URL = import.meta.env.VITE_APP_API_URL;

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
      toast.error('Please fix the form errors before submitting ❌', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}api/auth/signup`, {
        name: signupData.name.trim(),
        email: signupData.email.toLowerCase().trim(),
        password: signupData.password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.data && response.data.success) {
        // Store auth data
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        
        toast.success(`Welcome to Iyappaa Sweets & Snacks, ${signupData.name}! Your account has been created successfully 🎉`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Navigate after showing toast for a moment
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        setErrors({ api: 'Account creation failed. Please try again.' });
        toast.error('Account creation failed. Please try again. ❌', {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

    } catch (error) {
      console.error('SignUp error:', error);

      if (error.response) {
        
        const { data, status } = error.response;

        if (status === 400 && data.errors && Array.isArray(data.errors)) {
          // Handle validation errors from server
          const formattedErrors = {};
          data.errors.forEach(err => {
            const field = err.path || err.param || err.field;
            formattedErrors[field] = err.msg || err.message;
          });
          setErrors(formattedErrors);
          toast.error('Please fix the form errors and try again ❌', {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else if (status === 409) {
          // Handle duplicate email
          setErrors({ email: 'An account with this email already exists' });
          toast.error('An account with this email already exists ❌', {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else if (data.message) {
          setErrors({ api: data.message });
           toast.error(`${data.message} ❌`, {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          const errorMsg = `Server error (${status}). Please try again.`;
          setErrors({ api: errorMsg });
         toast.error(`${errorMsg} ❌`, {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } else if (error.request) {
        // Network error
        const errorMsg = 'Cannot connect to server. Please check if the backend is running on http://localhost:8000';
        setErrors({ api: errorMsg });
        toast.error(`${errorMsg} 🌐`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        const errorMsg = 'Request timed out. Please try again.';
        setErrors({ api: errorMsg });
         toast.error(`${errorMsg} ❌`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        // Other error
        const errorMsg = 'An unexpected error occurred. Please try again.';
        setErrors({ api: errorMsg });
        toast.error(`${errorMsg} ❌`, {
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

  return (
    <div className="signup-wrapper">
       {/* Toast Container */}
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
      <div className="signup-form-logo">
          <img src="/src/assets/logo-title.png" alt="Suman Foods Logo" />
          <span className="signup-form-logo-text">Iyappaa Sweets & Snacks</span>
        </div>
      <div className="signup-right">
        <p className="signup-form-subtitle">Please enter your details</p>
        <h2 className="signup-form-title">Create Your Account</h2>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* API Error Display */}
          {errors.api && (
            <div className="signup-error-message-container">
              <div className="signup-error-message">{errors.api}</div>
            </div>
          )}

          {/* Name Field */}
          <div className="signup-form-group">
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
              <div className="signup-error-text-wrapper">
                <span className="signup-error-text">{errors.name}</span>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="signup-form-group">
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
              <div className="signup-error-text-wrapper">
                <span className="signup-error-text">{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="signup-form-group">
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
              <div className="signup-error-text-wrapper">
                <span className="signup-error-text">{errors.password}</span>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="signup-form-group">
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
              <div className="signup-error-text-wrapper">
                <span className="signup-error-text">{errors.confirmPassword}</span>
              </div>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="signup-form-options">
            <div className="signup-agree-terms">
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
              <div className="signup-error-text-wrapper">
                <span className="signup-error-text">{errors.agreeToTerms}</span>
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
  );
};

export default SignUp;