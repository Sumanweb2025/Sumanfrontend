import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Phone, Mail, Truck, Key, Save, ArrowLeft, Package } from 'lucide-react';
import './DeliveryProfile.css';

const DeliveryProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // profile, changePin
  
  // Profile form
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    vehicleNumber: '',
    vehicleType: 'bike'
  });

  // Change PIN form
  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const token = localStorage.getItem('deliveryToken');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}api/delivery/my-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(response.data.data);
      setFormData({
        phone: response.data.data.phone || '',
        email: response.data.data.email || '',
        vehicleNumber: response.data.data.vehicleNumber || '',
        vehicleType: response.data.data.vehicleType || 'bike'
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      await axios.put(
        `${API_URL}api/delivery/my-profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Profile updated successfully!');
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    
    if (pinData.newPin !== pinData.confirmPin) {
      setError('New PIN and Confirm PIN do not match');
      return;
    }

    if (pinData.newPin.length < 4 || pinData.newPin.length > 6) {
      setError('PIN must be 4-6 digits');
      return;
    }

    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      await axios.put(
        `${API_URL}api/delivery/change-pin`,
        {
          currentPin: pinData.currentPin,
          newPin: pinData.newPin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('PIN changed successfully!');
      setPinData({ currentPin: '', newPin: '', confirmPin: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change PIN');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="delivery-profile-loading">
        <div className="delivery-profile-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="delivery-profile-container">
      {/* Header */}
      <div className="delivery-profile-header">
        <button className="delivery-profile-back-btn" onClick={() => navigate('/delivery/dashboard')}>
          <ArrowLeft />
          <span>Back to Dashboard</span>
        </button>
        <h1>My Profile</h1>
      </div>

      {/* Messages */}
      {error && (
        <div className="delivery-profile-alert delivery-profile-alert-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="delivery-profile-alert delivery-profile-alert-success">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Profile Content */}
      <div className="delivery-profile-content">
        {/* Sidebar */}
        <div className="delivery-profile-sidebar">
          <div className="delivery-profile-avatar">
            <div className="delivery-profile-avatar-circle">
              <User size={48} />
            </div>
            <h2>{profile?.name}</h2>
            <p className="delivery-profile-employee-id">{profile?.employeeId}</p>
            <span className={`delivery-profile-status-badge ${profile?.isActive ? 'active' : 'inactive'}`}>
              {profile?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="delivery-profile-stats">
            <div className="delivery-profile-stat-item">
              <Package />
              <div>
                <span className="delivery-profile-stat-value">{profile?.totalDeliveries || 0}</span>
                <span className="delivery-profile-stat-label">Total Deliveries</span>
              </div>
            </div>
            <div className="delivery-profile-stat-item">
              <span className="delivery-profile-stat-icon">✅</span>
              <div>
                <span className="delivery-profile-stat-value">{profile?.successfulDeliveries || 0}</span>
                <span className="delivery-profile-stat-label">Successful</span>
              </div>
            </div>
            <div className="delivery-profile-stat-item">
              <span className="delivery-profile-stat-icon">❌</span>
              <div>
                <span className="delivery-profile-stat-value">{profile?.failedDeliveries || 0}</span>
                <span className="delivery-profile-stat-label">Failed</span>
              </div>
            </div>
            <div className="delivery-profile-stat-item">
              <span className="delivery-profile-stat-icon">📊</span>
              <div>
                <span className="delivery-profile-stat-value">
                  {profile?.totalDeliveries > 0
                    ? ((profile.successfulDeliveries / profile.totalDeliveries) * 100).toFixed(0)
                    : 0}%
                </span>
                <span className="delivery-profile-stat-label">Success Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="delivery-profile-main">
          {/* Tabs */}
          <div className="delivery-profile-tabs">
            <button
              className={`delivery-profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              <span>Profile Information</span>
            </button>
            <button
              className={`delivery-profile-tab-btn ${activeTab === 'changePin' ? 'active' : ''}`}
              onClick={() => setActiveTab('changePin')}
            >
              <Key size={18} />
              <span>Change PIN</span>
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="delivery-profile-tab-content">
              <h3>Update Profile Information</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="delivery-profile-form-row">
                  <div className="delivery-profile-form-group">
                    <label>Name</label>
                    <div className="delivery-profile-input-with-icon">
                      <User size={18} />
                      <input
                        type="text"
                        value={profile?.name || ''}
                        disabled
                      />
                    </div>
                    <small>Name cannot be changed</small>
                  </div>

                  <div className="delivery-profile-form-group">
                    <label>Employee ID</label>
                    <div className="delivery-profile-input-with-icon">
                      <Package size={18} />
                      <input
                        type="text"
                        value={profile?.employeeId || ''}
                        disabled
                      />
                    </div>
                    <small>Employee ID cannot be changed</small>
                  </div>
                </div>

                <div className="delivery-profile-form-row">
                  <div className="delivery-profile-form-group">
                    <label>Phone *</label>
                    <div className="delivery-profile-input-with-icon">
                      <Phone size={18} />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="delivery-profile-form-group">
                    <label>Email</label>
                    <div className="delivery-profile-input-with-icon">
                      <Mail size={18} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="delivery-profile-form-row">
                  <div className="delivery-profile-form-group">
                    <label>Vehicle Type</label>
                    <div className="delivery-profile-input-with-icon">
                      <Truck size={18} />
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                      >
                        <option value="bike">Bike</option>
                        <option value="scooter">Scooter</option>
                        <option value="car">Car</option>
                        <option value="van">Van</option>
                        <option value="bicycle">Bicycle</option>
                      </select>
                    </div>
                  </div>

                  <div className="delivery-profile-form-group">
                    <label>Vehicle Number</label>
                    <div className="delivery-profile-input-with-icon">
                      <Truck size={18} />
                      <input
                        type="text"
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})}
                        placeholder="TN01AB1234"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="delivery-profile-update-btn btn-primary" disabled={updating}>
                  <Save size={18} />
                  <span>{updating ? 'Updating...' : 'Update Profile'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Change PIN Tab */}
          {activeTab === 'changePin' && (
            <div className="delivery-profile-tab-content">
              <h3>Change Your PIN</h3>
              <form onSubmit={handleChangePin}>
                <div className="delivery-profile-form-group">
                  <label>Current PIN *</label>
                  <div className="delivery-profile-input-with-icon">
                    <Key size={18} />
                    <input
                      type="password"
                      value={pinData.currentPin}
                      onChange={(e) => setPinData({...pinData, currentPin: e.target.value})}
                      minLength="4"
                      maxLength="6"
                      required
                    />
                  </div>
                </div>

                <div className="delivery-profile-form-group">
                  <label>New PIN *</label>
                  <div className="delivery-profile-input-with-icon">
                    <Key size={18} />
                    <input
                      type="password"
                      value={pinData.newPin}
                      onChange={(e) => setPinData({...pinData, newPin: e.target.value})}
                      minLength="4"
                      maxLength="6"
                      required
                    />
                  </div>
                  <small>PIN must be 4-6 digits</small>
                </div>

                <div className="delivery-profile-form-group">
                  <label>Confirm New PIN *</label>
                  <div className="delivery-profile-input-with-icon">
                    <Key size={18} />
                    <input
                      type="password"
                      value={pinData.confirmPin}
                      onChange={(e) => setPinData({...pinData, confirmPin: e.target.value})}
                      minLength="4"
                      maxLength="6"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="delivery-profile-change-btn btn-primary" disabled={updating}>
                  <Key size={18} />
                  <span>{updating ? 'Changing...' : 'Change PIN'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryProfile;
