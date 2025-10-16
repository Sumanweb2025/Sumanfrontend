import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logoImage from '../../assets/logo-title.png';
import './ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const API_URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    // Validate that token and email exist
    if (!token || !email) {
      toast.error('Invalid reset link. Please request a new password reset.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
      });
      setTimeout(() => {
        navigate('/forgot-password');
      }, 2000);
    }
  }, [token, email, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await axios.post(`${API_URL}api/auth/reset-password`, {
        token,
        email,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      }

    } catch (error) {
      console.error('Reset password error:', error);

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
          setErrors({ api: 'Failed to reset password. Please try again.' });
          toast.error('Failed to reset password. Please try again.', {
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

  if (!token || !email) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="reset-password-wrapper">
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
      <div className="reset-password-form-logo">
        <img src={logoImage} alt="Suman Foods Logo" />
        <span className="reset-password-form-logo-text">Iyappaa Sweets & Snacks</span>
      </div>
      <div className="reset-password-right">
        <p className="reset-password-form-subtitle">Create a new password</p>
        <h2 className="reset-password-form-title">Reset Password</h2>

        {errors.api && <div className="reset-password-error-message">{errors.api}</div>}

        <form onSubmit={handleSubmit} className="reset-password-form">
          <p className="reset-password-description">
            Enter your new password below. Make sure it's strong and secure.
          </p>

          <div className="reset-password-form-group">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                className={errors.newPassword ? 'error' : ''}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div className="reset-password-error-text-wrapper">
              <span className="reset-password-error-text">{errors.newPassword || ''}</span>
            </div>
          </div>

          <div className="reset-password-form-group">
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div className="reset-password-error-text-wrapper">
              <span className="reset-password-error-text">{errors.confirmPassword || ''}</span>
            </div>
          </div>

          <div className="password-requirements">
            <p className="requirements-title">Password must contain:</p>
            <ul>
              <li className={formData.newPassword.length >= 6 ? 'valid' : ''}>
                At least 6 characters
              </li>
              <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                One uppercase letter
              </li>
              <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
                One lowercase letter
              </li>
              <li className={/\d/.test(formData.newPassword) ? 'valid' : ''}>
                One number
              </li>
            </ul>
          </div>

          <div className="reset-password-btn-container">
            <button type="submit" className="reset-password-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Resetting...
                </>
              ) : 'Reset Password'}
            </button>
          </div>
        </form>

        <div className="reset-password-footer">
          <p>Remember your password? <a href="/signin">Sign in</a></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
