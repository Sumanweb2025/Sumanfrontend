import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState('');

  const API_URL = import.meta.env.VITE_APP_API_URL;

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const validateEmail = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateEmail();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}api/auth/forgot-password`, {
        email: email.toLowerCase().trim()
      });

      if (response.data.success) {
        setEmailSent(true);
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

    } catch (error) {
      console.error('Forgot password error:', error);

      if (error.response && error.response.data) {
        const { data } = error.response;

        if (data.message) {
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
          setErrors({ api: 'Failed to send reset email. Please try again.' });
          toast.error('Failed to send reset email. Please try again.', {
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

  return (
    <div className="forgot-password-wrapper">
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
      <div className="forgot-password-form-logo">
        <img src="/src/assets/logo-title.png" alt="Suman Foods Logo" />
        <span className="forgot-password-form-logo-text">Iyappaa Sweets & Snacks</span>
      </div>
      <div className="forgot-password-right">
        {!emailSent ? (
          <>
            <p className="forgot-password-form-subtitle">Reset your password</p>
            <h2 className="forgot-password-form-title">Forgot Password</h2>

            {errors.api && <div className="forgot-password-error-message">{errors.api}</div>}

            <form onSubmit={handleSubmit} className="forgot-password-form">
              <p className="forgot-password-description">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div className="forgot-password-form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  autoComplete="email"
                />
                <div className="forgot-password-error-text-wrapper">
                  <span className="forgot-password-error-text">{errors.email || ''}</span>
                </div>
              </div>

              <div className="forgot-password-btn-container">
                <button type="submit" className="forgot-password-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span> Sending...
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </div>
            </form>

            <div className="forgot-password-footer">
              <p>Remember your password? <a href="/signin">Sign in</a></p>
            </div>
          </>
        ) : (
          <div className="forgot-password-success">
            <div className="success-icon">✓</div>
            <h2 className="forgot-password-form-title">Check Your Email</h2>
            <p className="forgot-password-success-message">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="forgot-password-info">
              Click the link in the email to reset your password. If you don't see the email, check your spam folder.
            </p>
            <div className="forgot-password-btn-container">
              <button
                onClick={() => navigate('/signin')}
                className="forgot-password-btn"
              >
                Back to Sign In
              </button>
            </div>
            <div className="forgot-password-footer">
              <p>Didn't receive the email? <button onClick={() => setEmailSent(false)} className="resend-link">Try again</button></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
