import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, Lock, User, AlertCircle } from 'lucide-react';
import logoImage from '../../../assets/logo-title.png';
import './DeliveryLogin.css';

const DeliveryLogin = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    pin: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}api/delivery/login`,
        formData
      );

      if (response.data.success) {
        // Store token and delivery person info
        localStorage.setItem('deliveryToken', response.data.data.token);
        localStorage.setItem('deliveryPerson', JSON.stringify(response.data.data.deliveryPerson));
        
        // Navigate to delivery dashboard
        navigate('/delivery/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-login-container">
      <div className="delivery-login-wrapper">
        {/* Logo/Header */}
        <div className="delivery-login-header">
          <div className="delivery-logo-circle">
           <img src={logoImage} alt="Iyappaa Logo" />
          </div>
          <p className="delivery-login-subtitle">
            Iyappaa Sweets & Snacks
          </p>
        </div>

        {/* Login Card */}
        <div className="delivery-login-card">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>Delivery Person Login</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Sign in to access delivery dashboard</p>
        </div>

          {error && (
            <div className="delivery-alert">
              <AlertCircle />
              <p className="delivery-alert-text">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="delivery-login-form">
            {/* Employee ID */}
            <div className="delivery-form-group">
              <label className="delivery-form-label">
                Employee ID
              </label>
              <div className="delivery-input-wrapper">
                <User className="delivery-input-icon" />
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="Enter your Employee ID"
                  className="delivery-input uppercase"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {/* PIN */}
            <div className="delivery-form-group">
              <label className="delivery-form-label">
                PIN
              </label>
              <div className="delivery-input-wrapper">
                <Lock className="delivery-input-icon" />
                <input
                  type="password"
                  name="pin"
                  value={formData.pin}
                  onChange={handleChange}
                  placeholder="Enter your 4-digit PIN"
                  className="delivery-input"
                  required
                  maxLength="6"
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="delivery-submit-btn"
            >
              {loading ? (
                <>
                  <div className="delivery-spinner"></div>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="delivery-help-text">
            <p>
              Forgot your PIN? Contact your administrator
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="delivery-login-footer">
          <p>© 2025 Iyappaa Sweets & Snacks. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLogin;
