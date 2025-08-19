import React, { useState, useEffect, useRef } from 'react';
import './Profile.css';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaArrowLeft, FaCamera, FaTrash } from 'react-icons/fa';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const ProfilePage = ({ onBack }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef(null);
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
        
        // Handle profile image - priority order: custom uploaded image, then Google profile image
        const imageUrl = data.data.user.profileImage || data.data.user.picture || data.data.user.googleProfileImage;
        setProfileImagePreview(imageUrl || null);
        
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

  // Check if current image is from Google
  const isGoogleProfileImage = () => {
    const googleImageUrl = user?.picture || user?.googleProfileImage;
    return googleImageUrl && profileImagePreview === googleImageUrl && !profileImage;
  };

  // Handle profile image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile image
  const handleRemoveImage = () => {
    setProfileImage(null);
    
    // If user has Google profile image, fallback to that, otherwise null
    const googleImageUrl = user?.picture || user?.googleProfileImage;
    setProfileImagePreview(googleImageUrl || null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload profile image
  const uploadProfileImage = async () => {
    if (!profileImage) return null;
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profileImage', profileImage);
      
      const response = await fetch('http://localhost:8000/api/auth/upload-profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        return data.data.imageUrl;
      }
      throw new Error('Failed to upload image');
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
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
      
      // Upload image first if there's a new image
      let imageUrl = null;
      if (profileImage) {
        imageUrl = await uploadProfileImage();
      }
      
      // Prepare update data
      const updateData = { ...formData };
      if (imageUrl) {
        updateData.profileImage = imageUrl;
      }
      
      const response = await fetch('http://localhost:8000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.data.user);
        setIsEditing(false);
        setProfileImage(null); // Clear the file input
        
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
    setProfileImage(null);
    
    // Reset to original image (custom uploaded or Google profile image)
    const originalImageUrl = user?.profileImage || user?.picture || user?.googleProfileImage;
    setProfileImagePreview(originalImageUrl || null);
    
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
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Enhanced back button handler with fallback options
  const handleBack = () => {
    console.log('Back button clicked'); // Debug log
    
    if (onBack && typeof onBack === 'function') {
      console.log('Calling onBack function'); // Debug log
      onBack();
    } else {
      console.log('onBack not available, using fallback'); // Debug log
      // Fallback options if onBack is not provided
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Navigate to a default route
        window.location.href = '/'; // or wherever you want to go
      }
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
      <div className="profile-acc-page">
        <div className="profile-acc-container">
          <div className="profile-acc-header">
            <button 
              className="back-button" 
              onClick={handleBack}
              type="button"
            >
              <FaArrowLeft /> Back
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

          <div className="profile-acc-content">
            <div className="profile-acc-avatar">
              <div className="avatar-container">
                {profileImagePreview ? (
                  <div className="profile-image-wrapper">
                    <img 
                      src={profileImagePreview} 
                      alt="Profile" 
                      className="profile-image"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="profile-image-fallback" style={{ display: 'none' }}>
                      <FaUser className='profile-acc-icon'/>
                    </div>
                  </div>
                ) : (
                  <FaUser className='profile-acc-icon'/>
                )}
                
                {isEditing && (
                  <div className="avatar-actions">
                    <button
                      type="button"
                      className="avatar-action-btn upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload Photo"
                    >
                      <FaCamera />
                    </button>
                    {profileImagePreview && !isGoogleProfileImage() && (
                      <button
                        type="button"
                        className="avatar-action-btn remove-btn"
                        onClick={handleRemoveImage}
                        title="Remove Photo"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
              </div>
              
              {isEditing && (
                <div className="avatar-help-text">
                  <small>
                    Click camera to upload photo (Max 5MB)
                    {isGoogleProfileImage() && (
                      <>
                        <br />
                        <span style={{ color: '#007bff' }}>
                          Currently showing your Google profile picture
                        </span>
                      </>
                    )}
                  </small>
                </div>
              )}
            </div>

            <div className="profile-acc-form">
              {/* Basic Information */}
              <div className="profile-form-section">
                <h3>Basic Information</h3>
                
                <div className="profile-form-group">
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
                    <span className="profile-form-value">{user.name}</span>
                  )}
                </div>

                <div className="profile-form-group">
                  <label>
                    <FaEnvelope /> Email
                  </label>
                  <span className="profile-form-value readonly">{user.email}</span>
                  <small>Email cannot be changed</small>
                </div>

                <div className="profile-form-group">
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
                    <span className="profile-form-value">{user.phone || 'Not provided'}</span>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div className="profile-form-section">
                <h3>
                  <FaMapMarkerAlt /> Address Information
                </h3>

                <div className="profile-form-group">
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
                    <span className="profile-form-value">{user.address?.street || 'Not provided'}</span>
                  )}
                </div>

                <div className="profile-form-row">
                  <div className="profile-form-group">
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
                      <span className="profile-form-value">{user.address?.city || 'Not provided'}</span>
                    )}
                  </div>

                  <div className="profile-form-group">
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
                      <span className="profile-form-value">{user.address?.state || 'Not provided'}</span>
                    )}
                  </div>

                  <div className="profile-form-group">
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
                      <span className="profile-form-value">{user.address?.pincode || 'Not provided'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="profile-form-section">
                <h3>Account Information</h3>
                <div className="profile-form-group">
                  <label>Member Since</label>
                  <span className="profile-form-value">
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="profile-form-group">
                  <label>Last Login</label>
                  <span className="profile-form-value">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="profile-form-actions">
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