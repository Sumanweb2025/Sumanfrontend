import React, { useState, useEffect } from 'react';
import './Profile.css';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const ProfilePage = ({ onBack }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });
  

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:8000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.data.user);
        setFormData({
          name: data.data.user.name || '',
          phone: data.data.user.phone || '',
          address: {
            street: data.data.user.address?.street || '',
            city: data.data.user.address?.city || '',
            state: data.data.user.address?.state || '',
            pincode: data.data.user.address?.pincode || '',
            country: data.data.user.address?.country || 'India'
          }
        });
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.data.user);
        setIsEditing(false);
        
        // Update user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          pincode: user.address?.pincode || '',
          country: user.address?.country || 'India'
        }
      });
    }
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <LoadingSpinner 
                    isLoading={loading} 
                    brandName="My Profile" 
                    loadingText="Loading your profile..."
                    progressColor="#3b82f6"
                  />
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          <h1>My Profile</h1>
          {!isEditing && (
            <button 
              className="edit-button"
              onClick={() => setIsEditing(true)}
            >
              <FaEdit /> Edit
            </button>
          )}
        </div>

        <div className="profile-content">
          <div className="profile-page-avatar">
            <FaUser className='profile-icon'/>
          </div>

          <div className="profile-form">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label>
                  <FaUser /> Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                  />
                ) : (
                  <span className="form-value">{user.name}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FaEnvelope /> Email
                </label>
                <span className="form-value readonly">{user.email}</span>
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>
                  <FaPhone /> Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <span className="form-value">{user.phone || 'Not provided'}</span>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="form-section">
              <h3>
                <FaMapMarkerAlt /> Address Information
              </h3>
              
              <div className="form-group">
                <label>Street Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    placeholder="Enter street address"
                  />
                ) : (
                  <span className="form-value">{user.address?.street || 'Not provided'}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  ) : (
                    <span className="form-value">{user.address?.city || 'Not provided'}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      placeholder="State"
                    />
                  ) : (
                    <span className="form-value">{user.address?.state || 'Not provided'}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Pincode</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleInputChange}
                      placeholder="Pincode"
                    />
                  ) : (
                    <span className="form-value">{user.address?.pincode || 'Not provided'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="form-section">
              <h3>Account Information</h3>
              <div className="form-group">
                <label>Member Since</label>
                <span className="form-value">
                  {new Date(user.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="form-group">
                <label>Last Login</label>
                <span className="form-value">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="form-actions">
                <button 
                  className="save-button"
                  onClick={handleSave}
                  disabled={loading}
                >
                  <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProfilePage;