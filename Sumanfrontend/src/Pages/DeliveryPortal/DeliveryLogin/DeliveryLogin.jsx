import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, Lock, User, AlertCircle } from 'lucide-react';
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
            <Package />
          </div>
          <h1 className="delivery-login-title">
            Delivery Portal
          </h1>
          <p className="delivery-login-subtitle">
            Iyappaa Sweets & Snacks
          </p>
        </div>

        {/* Login Card */}
        <div className="delivery-login-card">
          <h2 className="delivery-login-card-title">
            Delivery Person Login
          </h2>

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
          <p>© 2024 Iyappaa Sweets & Snacks. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLogin;
