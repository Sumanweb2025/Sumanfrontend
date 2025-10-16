import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import "./Signup.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    countryCode: '',
    agreeToTerms: false
  });

  const API_URL = import.meta.env.VITE_APP_API_URL;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (value, data) => {
    // value contains the full number with country code
    // data.dialCode contains just the country code
    const phoneWithoutCountryCode = value.slice(data.dialCode.length);

    setSignupData(prev => ({
      ...prev,
      phone: phoneWithoutCountryCode,
      countryCode: `+${data.dialCode}`
    }));

    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!signupData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (signupData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!signupData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!signupData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (signupData.phone.length < 7) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!signupData.countryCode) {
      newErrors.phone = 'Please select a country code';
    }

    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else if (signupData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!signupData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}api/auth/signup`, {
        name: signupData.name.trim(),
        email: signupData.email.toLowerCase().trim(),
        phone: signupData.phone,
        countryCode: signupData.countryCode,
        password: signupData.password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      if (response.data && response.data.success) {
        toast.success('OTP sent to your phone number!');

        setTimeout(() => {
          navigate('/verify-otp', {
            state: {
              tempUserId: response.data.data.tempUserId,
              phone: signupData.phone,
              countryCode: signupData.countryCode,
              fullPhoneNumber: response.data.data.phoneDisplay,
              name: signupData.name.trim(),
              email: signupData.email.trim()
            }
          });
        }, 1000);
      }

    } catch (error) {
      console.error('SignUp error:', error);

      if (error.response) {
        const { data, status } = error.response;

        if (status === 400 && data.errors && Array.isArray(data.errors)) {
          const formattedErrors = {};
          data.errors.forEach(err => {
            const field = err.path || err.param || err.field;
            formattedErrors[field] = err.msg || err.message;
          });
          setErrors(formattedErrors);
          toast.error('Please fix the form errors and try again');
        } else if (status === 409) {
          setErrors({ email: data.message || 'An account with this email or phone already exists' });
          toast.error(data.message || 'An account with this email or phone already exists');
        } else if (status === 429) {
          setErrors({ api: 'Too many requests. Please wait before trying again.' });
          toast.error('Too many requests. Please wait before trying again.');
        } else if (data.message) {
          setErrors({ api: data.message });
          toast.error(data.message);
        } else {
          const errorMsg = `Server error (${status}). Please try again.`;
          setErrors({ api: errorMsg });
          toast.error(errorMsg);
        }
      } else if (error.request) {
        const errorMsg = 'Cannot connect to server. Please check your connection.';
        setErrors({ api: errorMsg });
        toast.error(errorMsg);
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.';
        setErrors({ api: errorMsg });
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
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
          {errors.api && (
            <div className="signup-error-message-container">
              <div className="signup-error-message">{errors.api}</div>
            </div>
          )}

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

          <div className="signup-form-group">
            <PhoneInput
              country={'ca'}
              value={signupData.countryCode.replace('+', '') + signupData.phone}
              onChange={handlePhoneChange}
              enableSearch={true}
              countryCodeEditable={false}
              specialLabel=""
              inputProps={{
                name: 'phone',
                required: true,
              }}
              inputStyle={{
                width: '100%',
                fontSize: '14px'
              }}
            />
            {errors.phone && (
              <div className="signup-error-text-wrapper">
                <span className="signup-error-text">{errors.phone}</span>
              </div>
            )}
          </div>

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

          <div className="signup-btn-container">
            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Sending OTP...
                </>
              ) : 'Send OTP'}
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