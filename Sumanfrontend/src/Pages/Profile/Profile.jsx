import React, { useState, useEffect, useRef } from 'react';
import './Profile.css';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaArrowLeft, FaCamera, FaTrash, FaShoppingBag, FaSignOutAlt, FaUserTimes, FaEye, FaCalendarAlt } from 'react-icons/fa';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const ProfilePage = ({ onBack }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
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
    fetchUserProfile();
  }, []);

  // Fetch user orders
  const fetchUserOrders = async () => {
    try {
          const token = localStorage.getItem('token');
          if (!token) {
            window.location.href = '/signin';
            return;
          }
    
          const response = await axios.get(`${API_URL}api/orders`, {
            headers: { Authorization: `Bearer ${token}` }
          });
    
          setOrders(response.data.data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching orders:', error);
          setLoading(false);
        }
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/signin');
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    const confirmMessage = 'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data including orders and wishlist.';
    
    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}api/auth/account`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (data.success) {
          alert('Account deleted successfully');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          alert('Failed to delete account: ' + data.message);
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error deleting account: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

 // Helper function to get full image URL - COMPLETE FIXED VERSION
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  //console.log('🔍 Processing image URL:', imageUrl);
  
  // If it's a base64 data URL, return as is (CRITICAL FIX)
  if (imageUrl.startsWith('data:')) {
    //console.log('📊 Base64 data URL detected:', imageUrl.substring(0, 50) + '...');
    return imageUrl;
  }
  
  // If it's already a full URL (Google images, external URLs, or full server URLs), return as is
  if (imageUrl.includes('googleapis.com') || 
      imageUrl.includes('googleusercontent.com') || 
      imageUrl.startsWith('http://') || 
      imageUrl.startsWith('https://')) {
    //console.log('✅ External/Full URL detected:', imageUrl);
    return imageUrl;
  }
  
  // For local uploaded images (starts with /uploads/), prepend server URL
  if (imageUrl.startsWith('/uploads/')) {
    const fullUrl = `${API_URL}${imageUrl}`;
    //console.log('🏠 Local image URL created:', fullUrl);
    return fullUrl;
  }
  
  // Fallback: if it doesn't start with /, assume it's a relative path and add server URL
  const fullUrl = imageUrl.startsWith('/') ? 
    `${API_URL}${imageUrl}` : 
    `${API_URL}/${imageUrl}`;
  //console.log('🔧 Fallback URL created:', fullUrl);
  return fullUrl;
};

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/signin';
        return;
      }

      const response = await fetch(`${API_URL}api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        //console.log('✅ Profile data received:', data.data.user);
        setUser(data.data.user);
        

        // The backend now handles the priority logic and returns the correct URL in profileImage
        const imageUrl = data.data.user.profileImage;
        
        // console.log('🔍 Profile image from backend:', {
        //   profileImage: data.data.user.profileImage,
        //   picture: data.data.user.picture,
        //   googleProfileImage: data.data.user.googleProfileImage,
        //   authProvider: data.data.user.authProvider
        // });
        
        if (imageUrl) {
          const fullImageUrl = getImageUrl(imageUrl);
          //console.log('🖼️ Final profile image URL:', fullImageUrl);
          setProfileImagePreview(fullImageUrl);
        } else {
          //console.log('📷 No profile image found');
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
          window.location.href = '/signin';
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
    
    // console.log('🔍 Google image check:', {
    //   isGoogleUser,
    //   hasGoogleImage,
    //   currentImageIsGoogle,
    //   profileImagePreview,
    //   hasNewImage: !!profileImage
    // });
    
    return isGoogleUser && hasGoogleImage && currentImageIsGoogle && !profileImage;

  };

  // Handle profile image selection
  const handleImageSelect = (e) => {

    //console.log('🖼️ File selection started');
    const file = e.target.files[0];
    
    if (file) {
      //console.log('📁 Selected file:', {
      //  name: file.name,
      //  size: file.size,
      //  type: file.type,
      //  sizeMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
      //});


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
      

      //console.log('✅ File validation passed');

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {

        //console.log('✅ Preview created for new upload');
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
  //console.log('Removing current image');
  setProfileImage(null);
  setImageDeleted(true); // Mark for deletion
  
  // For Google users, fallback to Google image; for others, remove completely
  if (user?.authProvider === 'google' && (user.picture || user.googleProfileImage)) {
    const googleImageUrl = user.picture || user.googleProfileImage;
    const fallbackUrl = getImageUrl(googleImageUrl);
    //console.log('Falling back to Google image:', fallbackUrl);
    setProfileImagePreview(fallbackUrl);
  } else {
    //console.log('Removing image completely');
    setProfileImagePreview(null);
  }
  
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

  // Upload profile image
  const uploadProfileImage = async () => {

    //console.log('🚀 Starting image upload...');
    
    if (!profileImage) {
      //console.log('❌ No profile image to upload');
      return null;
    }
    
    try {
      const token = localStorage.getItem('token');
      const formDataObj = new FormData();
      formDataObj.append('profileImage', profileImage);
      
      console.log('📤 Uploading to backend...');

      const response = await fetch(`${API_URL}api/auth/upload-profile-image`, {
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
  console.log('Starting profile save...');
  setLoading(true);
  
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Session expired. Please login again.');
      navigate('/signin');
      return;
    }
    
    // Step 1: Handle image deletion if marked
    if (imageDeleted && !profileImage) {
      //console.log('Deleting profile image...');
      
      const deleteResponse = await fetch(`${API_URL}api/auth/remove-profile-image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const deleteData = await deleteResponse.json();
      if (deleteData.success) {
        console.log('Image deleted successfully');
      }
    }
    
    // Step 2: Upload new image if selected
    let imageUrl = null;
    if (profileImage) {
      console.log('Uploading new image...');
      
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
      
      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(uploadData.message || 'Failed to upload image');
      }
      
      imageUrl = uploadData.data.imageUrl;
      //console.log('Image uploaded successfully');
    }
    
    // Step 3: Prepare minimal update data (NO validation issues)
    const updateData = {
      name: formData.name || user.name
    };
    
    // Only include phone if it's provided and valid
    if (formData.phone) {
      let cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1);
      }
      
      if (cleanPhone.length === 10) {
        updateData.phone = cleanPhone;
      } else if (cleanPhone.length > 0) {
        alert(`Invalid phone number. Please enter 10 digits.`);
        setLoading(false);
        return;
      }
    }
    
    // Only include address fields if they exist
    const addressData = {};
    if (formData.address.street) addressData.street = formData.address.street;
    if (formData.address.city) addressData.city = formData.address.city;
    if (formData.address.state) addressData.state = formData.address.state;
    if (formData.address.pincode) addressData.pincode = formData.address.pincode;
    if (formData.address.country) addressData.country = formData.address.country;
    
    if (Object.keys(addressData).length > 0) {
      updateData.address = addressData;
    }
    
    //console.log('Update data being sent:', updateData);
    
    const response = await fetch(`${API_URL}api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      let errorMessage = 'Failed to update profile:\n';
      if (data.errors && Array.isArray(data.errors)) {
        errorMessage += data.errors.map(err => `${err.msg || err.message}`).join('\n');
      } else if (data.message) {
        errorMessage += data.message;
      }
      throw new Error(errorMessage);
    }
    
    //console.log('Profile updated successfully');
    setUser(data.data.user);
    
    if (data.data.user.profileImage) {
      const fullImageUrl = getImageUrl(data.data.user.profileImage);
      setProfileImagePreview(fullImageUrl);
    } else {
      setProfileImagePreview(null);
    }
    
    setIsEditing(false);
    setProfileImage(null);
    setImageDeleted(false);
    
    localStorage.setItem('user', JSON.stringify(data.data.user));
    alert('Profile updated successfully!');
    
  } catch (error) {
    console.error('Save error:', error);
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
  
  if (user?.profileImage) {
    const fullOriginalUrl = getImageUrl(user.profileImage);
    setProfileImagePreview(fullOriginalUrl);
  } else {
    setProfileImagePreview(null);
  }

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
    return (
      <div className="profile-page">
        <LoadingSpinner 
          isLoading={true} 
          brandName="Profile" 
          loadingText="Loading your profile..."
        />
      </div>
    );
  }

  return (
    <>
      <LoadingSpinner 
        isLoading={loading} 
        brandName="Profile" 
        loadingText="Processing..."
      />
      <div className="profile-page">
        <div className="profile-container">
          {/* Header */}
          <div className="profile-header">
            <button 
              className="back-button" 
              onClick={handleBack}
              type="button"
            >
              <FaArrowLeft /> Back
            </button>
            <h1>My Account</h1>
          </div>

          <div className="profile-content">
            {/* Sidebar */}
            <div className="profile-sidebar">
              <div className="profile-user-info">
                <div className="profile-avatar">
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt="Profile" 
                      className="profile-avatar-img"
                    />
                  ) : (
                    <FaUser className="profile-avatar-icon" />
                  )}
                </div>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>

              <nav className="profile-nav">
                <button 
                  className={`profile-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveSection('profile')}
                >
                  <FaUser /> Profile Details
                </button>
                <button 
                  className={`profile-nav-item ${activeSection === 'orders' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection('orders');
                    fetchUserOrders();
                  }}
                >
                  <FaShoppingBag /> My Orders
                </button>
                <button 
                  className="profile-nav-item logout-btn"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt /> Logout
                </button>
                <button 
                  className="profile-nav-item delete-btn"
                  onClick={handleDeleteAccount}
                >
                  <FaUserTimes /> Delete Account
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="profile-main">

              {/* Profile Details Section */}
              {activeSection === 'profile' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Profile Details</h2>
                    {!isEditing && (
                      <button 
                        className="edit-btn"
                        onClick={() => setIsEditing(true)}
                      >
                        <FaEdit /> Edit
                      </button>
                    )}
                  </div>

                  <div className="profile-form">

                    {/* Profile Image Section */}
                    <div className="profile-image-section">
                      <div className="profile-image-container">
                        {profileImagePreview ? (
                          <img 
                            src={profileImagePreview} 
                            alt="Profile" 
                            className="profile-image"
                          />
                        ) : (
                          <FaUser className="profile-image-icon" />
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
                            {profileImagePreview && !isGoogleProfileImage() && (
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
                    </div>

                    {/* Form Fields */}
                    <div className="form-fields">
                      <div className="form-group">
                        <label><FaUser /> Name</label>
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
                        <label><FaEnvelope /> Email</label>
                        <span className="form-value readonly">{user.email}</span>
                        <small>Email cannot be changed</small>
                      </div>

                      <div className="form-group">
                        <label><FaPhone /> Phone</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter 10-digit mobile number"
                            maxLength="10"
                          />
                        ) : (
                          <span className="form-value">
                            {user.phone ? `+91 ${user.phone}` : 'Not provided'}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label><FaMapMarkerAlt /> Street Address</label>
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

                    {/* Action Buttons */}
                    {isEditing && (
                      <div className="form-actions">
                        <button 
                          className="save-btn"
                          onClick={handleSave}
                          disabled={loading}
                        >
                          <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                          className="cancel-btn"
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* My Orders Section */}
              {activeSection === 'orders' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>My Orders</h2>
                  </div>

                  {ordersLoading ? (
                    <div className="orders-loading">
                      <LoadingSpinner 
                        isLoading={true} 
                        brandName="Orders" 
                        loadingText="Loading your orders..."
                      />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="no-orders">
                      <FaShoppingBag className="no-orders-icon" />
                      <h3>No Orders Found</h3>
                      <p>You haven't placed any orders yet.</p>
                      <button 
                        className="shop-now-btn"
                        onClick={() => navigate('/')}
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="orders-list">
                      {orders.map((order) => (
                        <div key={order._id} className="order-card">
                          <div className="order-header">
                            <div className="order-info">
                              <h4>Order #{order.orderNumber}</h4>
                              <p className="order-date">
                                <FaCalendarAlt /> {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="order-status">
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(order.status) }}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="order-details">
                            <div className="order-items">
                              <p><strong>{order.items?.length || 0} items</strong></p>
                              <div className="item-names">
                                {order.items?.slice(0, 2).map((item, index) => (
                                  <span key={index} className="item-name">
                                    {item.productId?.name || 'Product'}
                                  </span>
                                ))}
                                {order.items?.length > 2 && (
                                  <span className="more-items">+{order.items.length - 2} more</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="order-total">
                              <p className="total-amount">
                                ${(order.orderSummary?.total ?? order.total)?.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="order-actions">
                            <button 
                              className="view-order-btn"
                              onClick={() => navigate('/myorders')}
                            >
                              <FaEye /> View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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