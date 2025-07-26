import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [signupData, setSignupData] = useState({
    name: '', // Changed from username to name
    email: '',
    password: '',
    agreeToTerms: false
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!signupData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!signupData.name.trim()) { // Changed from username to name
      newErrors.name = 'Full name is required'; // Updated error message
    } else if (signupData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else if (signupData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(signupData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!signupData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    return newErrors;
  };

  // Handle form submission
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
      const response = await axios.post('http://localhost:8000/api/register', { // Updated endpoint
        name: signupData.name.trim(),
        email: signupData.email.toLowerCase().trim(),
        password: signupData.password
      });

      // Successful registration
      localStorage.setItem('registrationSuccess', 'true');
      navigate('/signin', { state: { fromSignup: true } });

    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.response) {
        // Backend validation errors
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ api: error.response.data.message || 'Registration failed' });
        }
      } else {
        setErrors({ api: 'Network error. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!signupData.password) return 0;
    
    let strength = 0;
    if (signupData.password.length >= 6) strength++;
    if (/[a-z]/.test(signupData.password)) strength++;
    if (/[A-Z]/.test(signupData.password)) strength++;
    if (/\d/.test(signupData.password)) strength++;
    if (/[^a-zA-Z\d]/.test(signupData.password)) strength++;
    
    return (strength / 5) * 100;
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-logo">
          <span className="red">F</span><span className="orange">o</span><span className="green">o</span><span className="red">d</span>
          <span className="orange">C</span><span className="green">o</span><span className="red">u</span><span className="orange">r</span><span className="green">t</span>
        </div>
        
        <div className="signup-header">
          <h2>Join Food Court</h2>
          <p className="signup-subtitle">Create your account to get started</p>
        </div>
        
        {errors.api && <div className="error-message">{errors.api}</div>}
        
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={signupData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <input
              type="text"
              name="name" // Changed from username to name
              placeholder="Full Name" // Updated placeholder
              value={signupData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              autoComplete="name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={signupData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              autoComplete="new-password"
            />
            {signupData.password && (
              <div className="password-strength">
                <div className="strength-meter">
                  <div 
                    className="strength-bar"
                    style={{ width: `${getPasswordStrength()}%` }}
                  ></div>
                </div>
                <span className="strength-text">
                  {(() => {
                    const strength = Math.floor(getPasswordStrength() / 20);
                    switch(strength) {
                      case 0: return 'Very Weak';
                      case 1: return 'Weak';
                      case 2: return 'Fair';
                      case 3: return 'Good';
                      case 4: return 'Strong';
                      case 5: return 'Very Strong';
                      default: return '';
                    }
                  })()}
                </span>
              </div>
            )}
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          <div className="terms-checkbox">
            <input
              type="checkbox"
              name="agreeToTerms"
              id="agreeToTerms"
              checked={signupData.agreeToTerms}
              onChange={handleChange}
              className={errors.agreeToTerms ? 'error' : ''}
            />
            <label htmlFor="agreeToTerms">
              I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            </label>
            {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}
          </div>
          
          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Creating Account...
              </>
            ) : 'Create Account'}
          </button>
        </form>
        
        <div className="signup-footer">
          <p>Already have an account? <a href="/signin">Sign In</a></p>
        </div>
        
        <div className="copyright">
          © 2025 Food Court. All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default SignUp;