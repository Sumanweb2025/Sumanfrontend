import React, { useState, useEffect, useRef } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaTrash,
  FaShieldAlt,
  FaCalendarAlt,
  FaIdBadge
} from 'react-icons/fa';
import './AdminProfile.css';

const AdminProfile = ({ api, adminToken, setIsLoading, setError, handleApiError }) => {
  const [adminData, setAdminData] = useState(null);
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
  const [imageDeleted, setImageDeleted] = useState(false);

  const API_URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/profile', adminToken);

      if (response.success) {
        const admin = response.data;
        setAdminData(admin);

        // Set profile image
        if (admin.profileImage) {
          const imageUrl = getImageUrl(admin.profileImage);
          setProfileImagePreview(imageUrl);
        }

        // Set form data
        setFormData({
          name: admin.name || '',
          phone: admin.phone || '',
          address: {
            street: admin.address?.street || '',
            city: admin.address?.city || '',
            state: admin.address?.state || '',
            pincode: admin.address?.pincode || '',
            country: admin.address?.country || 'India'
          }
        });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }

    if (imageUrl.includes('googleapis.com') ||
      imageUrl.includes('googleusercontent.com') ||
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('/uploads/')) {
      return `${API_URL}${imageUrl}`;
    }

    return imageUrl.startsWith('/') ?
      `${API_URL}${imageUrl}` :
      `${API_URL}/${imageUrl}`;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setProfileImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    //console.log('Removing image');
    setProfileImage(null);
    setProfileImagePreview(null);
    setImageDeleted(true); // Mark image as deleted

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImage) return null;

    try {
      const formDataObj = new FormData();
      formDataObj.append('profileImage', profileImage);

      const response = await fetch(`${API_URL}api/auth/upload-profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        body: formDataObj
      });

      const data = await response.json();

      if (data.success) {
        return data.data.imageUrl;
      }
      throw new Error(data.message || 'Failed to upload image');
    } catch (error) {
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      let cleanValue = value.replace(/\D/g, '');

      if (cleanValue.startsWith('0')) {
        cleanValue = cleanValue.substring(1);
      }

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
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken') || adminToken;

      // Step 1: Handle image deletion first if image was removed
      if (imageDeleted) {
        //console.log('Deleting profile image...');

        const deleteResponse = await fetch(`${API_URL}api/auth/remove-profile-image`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const deleteData = await deleteResponse.json();
        if (deleteData.success) {
          //console.log('Image deleted successfully');
        }
      }

      // Step 2: Upload new image if selected
      let imageUrl = null;
      if (profileImage) {
        //console.log('Uploading new profile image...');

        const formDataObj = new FormData();
        formDataObj.append('profileImage', profileImage);

        const uploadResponse = await fetch(`${API_URL}api/auth/upload-profile-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataObj
        });

        const uploadData = await uploadResponse.json();

        if (uploadData.success) {
          imageUrl = uploadData.data.imageUrl;
          console.log('Image uploaded successfully');
        } else {
          throw new Error(uploadData.message || 'Failed to upload image');
        }
      }

      // Step 3: Update profile with text fields
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };

      // Clean phone number (make optional)
      if (updateData.phone) {
        let cleanPhone = updateData.phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) {
          cleanPhone = cleanPhone.substring(1);
        }

        if (cleanPhone.length === 10) {
          updateData.phone = cleanPhone;
        } else if (cleanPhone.length === 0) {
          delete updateData.phone;
        } else {
          alert(`Invalid phone number. Please enter 10 digits.`);
          setLoading(false);
          return;
        }
      }

      //console.log('Update data being sent:', updateData);

      const response = await api.put('/admin/profile', updateData, token);

      if (response.success) {
        await fetchAdminProfile();
        setIsEditing(false);
        setProfileImage(null);
        setImageDeleted(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      handleApiError(error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    //console.log('Canceling edit mode');
    setIsEditing(false);
    setProfileImage(null);
    setImageDeleted(false); // Reset deletion flag

    if (adminData?.profileImage) {
      const fullOriginalUrl = getImageUrl(adminData.profileImage);
      setProfileImagePreview(fullOriginalUrl);
    } else {
      setProfileImagePreview(null);
    }

    if (adminData) {
      setFormData({
        name: adminData.name || '',
        phone: adminData.phone || '',
        address: {
          street: adminData.address?.street || '',
          city: adminData.address?.city || '',
          state: adminData.address?.state || '',
          pincode: adminData.address?.pincode || '',
          country: adminData.address?.country || 'India'
        }
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!adminData) {
    return (
      <div className="admin-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin profile...</p>
      </div>
    );
  }

  return (
    <div className="admin-profile-container">
      <div className="admin-profile-header">
        <div>
          <h1>Admin Profile</h1>
          <p>Manage your administrator account settings</p>
        </div>
        {!isEditing && (
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setIsEditing(true)}
          >
            <FaEdit /> Edit Profile
          </button>
        )}
      </div>

      <div className="admin-profile-section">
        <div className="admin-profile-content">
          {/* Profile Image Section */}
          <div className="admin-profile-image-section">
            <div className="admin-profile-image-container">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Admin Profile"
                  className="admin-profile-image"
                />
              ) : (
                <FaUser className="admin-profile-image-icon" />
              )}

              {isEditing && (
                <div className="image-actions">
                  <button
                    type="button"
                    className="image-btn upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaCamera />
                  </button>
                  {profileImagePreview && (
                    <button
                      type="button"
                      className="image-btn remove-btn"
                      onClick={handleRemoveImage}
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
              <p className="image-help">Click camera to upload photo (Max 5MB)</p>
            )}

            <div className="admin-badge">
              <FaShieldAlt className="badge-icon" />
              <span>Administrator</span>
            </div>
          </div>

          {/* Admin Info Cards */}
          <div className="admin-info-cards">
            <div className="info-card">
              <div className="info-card-icon">
                <FaIdBadge />
              </div>
              <div className="info-card-content">
                <span className="info-label">Admin ID</span>
                <span className="info-value">{adminData._id?.slice(-8) || 'N/A'}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <FaCalendarAlt />
              </div>
              <div className="info-card-content">
                <span className="info-label">Member Since</span>
                <span className="info-value">{formatDate(adminData.createdAt)}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <FaShieldAlt />
              </div>
              <div className="info-card-content">
                <span className="info-label">Role</span>
                <span className="info-value role-badge">Admin</span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="admin-profile-form">
            <div className="admin-form-fields">
              <div className="admin-form-group">
                <label><FaUser /> Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="admin-form-input"
                  />
                ) : (
                  <span className="admin-form-value">{adminData.name}</span>
                )}
              </div>

              <div className="admin-form-group">
                <label><FaEnvelope /> Email</label>
                <span className="form-value readonly">{adminData.email}</span>
                <small>Email cannot be changed</small>
              </div>

              <div className="admin-form-group">
                <label><FaPhone /> Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    className="admin-form-input"
                  />
                ) : (
                  <span className="admin-form-value">
                    {adminData.phone ? `+91 ${adminData.phone}` : 'Not provided'}
                  </span>
                )}
              </div>

              <div className="admin-form-group">
                <label>Street Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    placeholder="Enter street address"
                    className="admin-form-input"
                  />
                ) : (
                  <span className="admin-form-value">{adminData.address?.street || 'Not provided'}</span>
                )}
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="admin-form-input"
                    />
                  ) : (
                    <span className="admin-form-value">{adminData.address?.city || 'Not provided'}</span>
                  )}
                </div>

                <div className="admin-form-group">
                  <label>State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="admin-form-input"
                    />
                  ) : (
                    <span className="admin-form-value">{adminData.address?.state || 'Not provided'}</span>
                  )}
                </div>

                <div className="admin-form-group">
                  <label>Pincode</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleInputChange}
                      placeholder="Pincode"
                      className="admin-form-input"
                    />
                  ) : (
                    <span className="admin-form-value">{adminData.address?.pincode || 'Not provided'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="admin-form-actions">
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  className="admin-btn admin-btn-outline"
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
  );
};

export default AdminProfile;