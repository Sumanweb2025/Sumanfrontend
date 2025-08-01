import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signin.css'; // You can reuse similar styles

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
          
          <button type="submit" className="login-btn" disabled={loading}>
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