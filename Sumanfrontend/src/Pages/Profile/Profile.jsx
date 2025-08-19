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

 // Helper function to get full image URL - COMPLETE FIXED VERSION
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  console.log('🔍 Processing image URL:', imageUrl);
  
  // If it's a base64 data URL, return as is (CRITICAL FIX)
  if (imageUrl.startsWith('data:')) {
    console.log('📊 Base64 data URL detected:', imageUrl.substring(0, 50) + '...');
    return imageUrl;
  }
  
  // If it's already a full URL (Google images, external URLs, or full server URLs), return as is
  if (imageUrl.includes('googleapis.com') || 
      imageUrl.includes('googleusercontent.com') || 
      imageUrl.startsWith('http://') || 
      imageUrl.startsWith('https://')) {
    console.log('✅ External/Full URL detected:', imageUrl);
    return imageUrl;
  }
  
  // For local uploaded images (starts with /uploads/), prepend server URL
  if (imageUrl.startsWith('/uploads/')) {
    const fullUrl = `http://localhost:8000${imageUrl}`;
    console.log('🏠 Local image URL created:', fullUrl);
    return fullUrl;
  }
  
  // Fallback: if it doesn't start with /, assume it's a relative path and add server URL
  const fullUrl = imageUrl.startsWith('/') ? 
    `http://localhost:8000${imageUrl}` : 
    `http://localhost:8000/${imageUrl}`;
  console.log('🔧 Fallback URL created:', fullUrl);
  return fullUrl;
};

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
        console.log('✅ Profile data received:', data.data.user);
        setUser(data.data.user);
        
        // The backend now handles the priority logic and returns the correct URL in profileImage
        const imageUrl = data.data.user.profileImage;
        
        console.log('🔍 Profile image from backend:', {
          profileImage: data.data.user.profileImage,
          picture: data.data.user.picture,
          googleProfileImage: data.data.user.googleProfileImage,
          authProvider: data.data.user.authProvider
        });
        
        if (imageUrl) {
          const fullImageUrl = getImageUrl(imageUrl);
          console.log('🖼️ Final profile image URL:', fullImageUrl);
          setProfileImagePreview(fullImageUrl);
        } else {
          console.log('📷 No profile image found');
          setProfileImagePreview(null);
        }
        
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
        console.error('Failed to fetch profile:', data.message);
        if (data.message?.includes('token')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Check if current image is from Google - UPDATED
  const isGoogleProfileImage = () => {
    if (!user || !user.authProvider) return false;
    
    // Check if user signed in with Google and has Google profile image
    const isGoogleUser = user.authProvider === 'google';
    const hasGoogleImage = user.picture || user.googleProfileImage;
    const currentImageIsGoogle = profileImagePreview && 
      (profileImagePreview.includes('googleapis.com') || profileImagePreview.includes('googleusercontent.com'));
    
    console.log('🔍 Google image check:', {
      isGoogleUser,
      hasGoogleImage,
      currentImageIsGoogle,
      profileImagePreview,
      hasNewImage: !!profileImage
    });
    
    return isGoogleUser && hasGoogleImage && currentImageIsGoogle && !profileImage;
  };

  // Handle profile image selection
  const handleImageSelect = (e) => {
    console.log('🖼️ File selection started');
    const file = e.target.files[0];
    
    if (file) {
      console.log('📁 Selected file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
      });

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
      
      console.log('✅ File validation passed');
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('✅ Preview created for new upload');
        setProfileImagePreview(e.target.result);
      };
      reader.onerror = (e) => {
        console.error('❌ FileReader error:', e);
        alert('Failed to create image preview');
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile image - UPDATED
  const handleRemoveImage = () => {
    console.log('🗑️ Removing current image');
    setProfileImage(null);
    
    // For Google users, fallback to Google image; for others, remove completely
    if (user?.authProvider === 'google' && (user.picture || user.googleProfileImage)) {
      const googleImageUrl = user.picture || user.googleProfileImage;
      const fallbackUrl = getImageUrl(googleImageUrl);
      console.log('↩️ Falling back to Google image:', fallbackUrl);
      setProfileImagePreview(fallbackUrl);
    } else {
      console.log('❌ Removing image completely');
      setProfileImagePreview(null);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload profile image
  const uploadProfileImage = async () => {
    console.log('🚀 Starting image upload...');
    
    if (!profileImage) {
      console.log('❌ No profile image to upload');
      return null;
    }
    
    try {
      const token = localStorage.getItem('token');
      const formDataObj = new FormData();
      formDataObj.append('profileImage', profileImage);
      
      console.log('📤 Uploading to backend...');
      const response = await fetch('http://localhost:8000/api/auth/upload-profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });
      
      console.log('📡 Upload response status:', response.status);
      const data = await response.json();
      console.log('📦 Upload response data:', data);
      
      if (data.success) {
        console.log('✅ Image uploaded successfully:', data.data.imageUrl);
        return data.data.imageUrl;
      }
      throw new Error(data.message || 'Failed to upload image');
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      // Clean phone number as user types
      let cleanValue = value.replace(/\D/g, ''); // Remove non-digits
      
      // Remove leading 0
      if (cleanValue.startsWith('0')) {
        cleanValue = cleanValue.substring(1);
      }
      
      // Limit to 10 digits
      if (cleanValue.length > 10) {
        cleanValue = cleanValue.substring(0, 10);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: cleanValue
      }));
      return;
    }
    
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
    console.log('💾 Starting profile save...');
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Upload image first if there's a new image
      let imageUrl = null;
      if (profileImage) {
        console.log('📸 Uploading new image...');
        imageUrl = await uploadProfileImage();
        console.log('✅ Image uploaded:', imageUrl);
      }
      
      // Prepare update data
      const updateData = { ...formData };
      
      // Clean phone number
      if (updateData.phone) {
        let cleanPhone = updateData.phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) {
          cleanPhone = cleanPhone.substring(1);
        }
        
        if (cleanPhone.length === 10) {
          updateData.phone = cleanPhone;
        } else if (cleanPhone.length === 0) {
          delete updateData.phone; // Remove empty phone
        } else {
          alert(`Invalid phone number. Please enter 10 digits. Current: ${cleanPhone.length} digits`);
          setLoading(false);
          return;
        }
      }
      
      if (imageUrl) {
        updateData.profileImage = imageUrl;
      }
      
      console.log('📝 Update data being sent:', updateData);
      
      const response = await fetch('http://localhost:8000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      console.log('📦 Profile update response:', data);
      
      if (data.success) {
        console.log('✅ Profile updated successfully');
        setUser(data.data.user);
        
        // Update image preview with the response from backend (which handles the URL logic)
        if (data.data.user.profileImage) {
          const fullImageUrl = getImageUrl(data.data.user.profileImage);
          console.log('🖼️ Setting updated profile image:', fullImageUrl);
          setProfileImagePreview(fullImageUrl);
        }
        
        setIsEditing(false);
        setProfileImage(null); // Clear the file input
        
        // Update user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        alert('Profile updated successfully!');
      } else {
        console.error('❌ Profile update failed:', data);
        let errorMessage = 'Failed to update profile:\n';
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage += data.errors.map(err => `• ${err.msg || err.message}`).join('\n');
        } else if (data.message) {
          errorMessage += data.message;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('❌ Canceling edit mode');
    setIsEditing(false);
    setProfileImage(null);
    
    // Reset to original image from user data
    if (user?.profileImage) {
      const fullOriginalUrl = getImageUrl(user.profileImage);
      console.log('↩️ Resetting to original image:', fullOriginalUrl);
      setProfileImagePreview(fullOriginalUrl);
    } else {
      console.log('❌ No original image to reset to');
      setProfileImagePreview(null);
    }
    
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
                      onLoad={() => console.log('✅ Image loaded successfully:', profileImagePreview)}
                      onError={(e) => {
                        console.error('❌ Image failed to load:', e.target.src);
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
                    <div className="phone-input-wrapper">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit mobile number"
                        maxLength="10"
                      />
                      {formData.phone && (
                        <small style={{ 
                          color: formData.phone.length === 10 ? 'green' : 'red',
                          display: 'block',
                          marginTop: '4px'
                        }}>
                          {formData.phone.length}/10 digits
                          {formData.phone.length === 10 && ' ✅'}
                          {formData.phone.length > 0 && formData.phone.length !== 10 && ' ❌'}
                        </small>
                      )}
                    </div>
                  ) : (
                    <span className="profile-form-value">
                      {user.phone ? `+91 ${user.phone}` : 'Not provided'}
                    </span>
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
                  <label>Sign-in Method</label>
                  <span className="profile-form-value">
                    {user.authProvider === 'google' ? '🔍 Google Account' : '📧 Email & Password'}
                  </span>
                </div>
                
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