import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MainHeader.css';
import logoImage from '../../assets/logo.jpeg';
import {
  FaSearch, FaUser, FaHeart, FaShoppingCart,
  FaChevronDown, FaSignOutAlt, FaUserCircle, FaSignInAlt,
  FaTruck, FaTag, FaBars, FaTimes, FaAward
} from 'react-icons/fa';

const MainHeader = ({ onProfileClick, onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false); 
  const [profileImage, setProfileImage] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const API_URL = import.meta.env.VITE_APP_API_URL;

  // NEW: Helper function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's a base64 data URL, return as is
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // If it's already a full URL (Google images, external URLs)
    if (imageUrl.includes('googleapis.com') || 
        imageUrl.includes('googleusercontent.com') || 
        imageUrl.startsWith('http://') || 
        imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // For local uploaded images
    if (imageUrl.startsWith('/uploads/')) {
      return `${API_URL}${imageUrl}`;
    }
    
    // Fallback
    return imageUrl.startsWith('/') ? 
      `${API_URL}${imageUrl}` : 
      `${API_URL}/${imageUrl}`;
  };

  // NEW: Fetch user profile with image
  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        const userData = response.data.data.user;
        setUser(userData);
        
        // Set profile image
        if (userData.profileImage) {
          const fullImageUrl = getImageUrl(userData.profileImage);
          setProfileImage(fullImageUrl);
        } else if (userData.picture) {
          setProfileImage(userData.picture);
        } else if (userData.googleProfileImage) {
          setProfileImage(userData.googleProfileImage);
        } else {
          setProfileImage(null);
        }
        
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');
    const guestSessionId = localStorage.getItem('guestSessionId');

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsGuest(false);
      
      // Set initial profile image from localStorage
      if (parsedUser.profileImage) {
        setProfileImage(getImageUrl(parsedUser.profileImage));
      } else if (parsedUser.picture) {
        setProfileImage(parsedUser.picture);
      } else if (parsedUser.googleProfileImage) {
        setProfileImage(parsedUser.googleProfileImage);
      }
      
      // Fetch fresh profile data from server
      fetchUserProfile(token);
      fetchCounts(token);
    } else if (userType === 'guest' && guestSessionId) {
      setIsGuest(true);
      fetchGuestCounts(guestSessionId);
    }

    // NEW: Listen for profile update events
    const handleProfileUpdate = () => {
      const token = localStorage.getItem('token');
      if (token) {
        fetchUserProfile(token);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);


    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    const handleWishlistUpdate = () => {
      if (token) {
        fetchWishlistCount(token);
      } else if (guestSessionId) {
        fetchGuestWishlistCount(guestSessionId);
      }
    };

    const handleCartUpdate = () => {
      if (token) {
        fetchCartCount(token);
      } else if (guestSessionId) {
        fetchGuestCartCount(guestSessionId);
      }
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // NEW: Fetch counts for logged-in users
  const fetchCounts = async (token) => {
    await Promise.all([
      fetchWishlistCount(token), 
      fetchCartCount(token)
    ]);
  };

  // NEW: Fetch counts for guest users
  const fetchGuestCounts = async (sessionId) => {
    await Promise.all([
      fetchGuestWishlistCount(sessionId),
      fetchGuestCartCount(sessionId)
    ]);
  };

  const fetchWishlistCount = async (token) => {
    try {
      const response = await axios.get(`${API_URL}api/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const wishlistData = response.data?.data || response.data;
      setWishlistCount(wishlistData.products?.length || 0);
    } catch (err) {
      console.error('Error fetching wishlist count:', err);
      setWishlistCount(0);
    }
  };

  // NEW: Fetch guest wishlist count
  const fetchGuestWishlistCount = async (sessionId) => {
    try {
      const response = await axios.get(`${API_URL}api/wishlist`, {
        headers: { 'X-Session-ID': sessionId }
      });

      const wishlistData = response.data?.data || response.data;
      setWishlistCount(wishlistData.products?.length || 0);
    } catch (err) {
      console.error('Error fetching guest wishlist count:', err);
      setWishlistCount(0);
    }
  };

  const fetchCartCount = async (token) => {
    try {
      const response = await axios.get(`${API_URL}api/cart/count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const countData = response.data?.data || response.data;
      setCartCount(countData.count || 0);
    } catch (err) {
      console.error('Error fetching cart count:', err);
      setCartCount(0);
    }
  };

  // NEW: Fetch guest cart count
  const fetchGuestCartCount = async (sessionId) => {
    try {
      const response = await axios.get(`${API_URL}api/cart/count`, {
        headers: { 'X-Session-ID': sessionId }
      });

      const countData = response.data?.data || response.data;
      setCartCount(countData.count || 0);
    } catch (err) {
      console.error('Error fetching guest cart count:', err);
      setCartCount(0);
    }
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    setShowMobileMenu(false);
    if (isGuest) {
      // NEW: Redirect guest to sign in
      navigate('/signin');
    } else {
      navigate('/profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType'); // NEW
    localStorage.removeItem('guestSessionId'); // NEW
    localStorage.removeItem('hasSeenGuestModal'); // NEW
    
    setUser(null);
    setProfileImage(null);
    setIsGuest(false);
    setWishlistCount(0);
    setCartCount(0);
    setShowDropdown(false);
    setShowMobileMenu(false);
    
    if (onLogout) onLogout();
    navigate('/');
  };

  const handleLoginClick = () => {
    setShowMobileMenu(false);
    
    // NEW: Store current page for redirect after login
    const currentPath = window.location.pathname;
    if (currentPath !== '/signin' && currentPath !== '/signup') {
      localStorage.setItem('returnUrl', currentPath);
    }
    
    navigate('/signin');
  };

  const handleWishlistClick = () => {
    setShowMobileMenu(false);
    navigate('/wishlist');
  };

  const handleCartClick = () => {
    setShowMobileMenu(false);
    navigate('/cart');
  };

  return (
    <div className="main-header">
      <div className="header-top">
        <img
          src={logoImage}
          alt="Logo"
          className="main-logo"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', height: "130px", width: "400px" }}
        />

        {/* <div className="search-bar desktop-search">
          <input type="text" placeholder="Search products..." />
          <FaSearch />
        </div> */}

        {/* <div className="info-section">
          <div className="info-item">
            <FaAward className="info-icon" />
            <div className="info-text">
              <div><strong>Quality Products</strong></div>
              <div>100% authentic items</div>
            </div>
          </div>
          <div className="info-item">
            <FaTag className="info-icon" />
            <div className="info-text">
              <div><strong>Daily Offers</strong></div>
              <div>Discount 20% off</div>
            </div>
          </div>
        </div> */}

        <div className="main-header-icons desktop-icons">
          <div className="main-user-profile-section" ref={dropdownRef}>
            <div
              className="main-user-info"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user ? (
                <>
                  {/* NEW: Display profile image if available */}
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="main-user-avatar-image"
                      onError={(e) => {
                        console.error('Profile image load error');
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline-block';
                      }}
                    />
                  ) : (
                    <FaUserCircle className="main-user-avatar" />
                  )}
                  <span className="main-user-name">{user.name}</span>
                </>
              ) : isGuest ? (
                // NEW: Show guest indicator
                <>
                  <FaUser className="main-header-login-icon" />
                  <span className="main-user-name">Guest</span>
                </>
              ) : (
                <FaUser className="main-header-login-icon" />
              )}
              <FaChevronDown className={`dropdown-arrow ${showDropdown ? 'rotated' : ''}`} />
            </div>

            {showDropdown && (
              <div className="user-dropdown">
                {user ? (
                  <>
                    <div className="dropdown-item" onClick={handleProfileClick}>
                      <FaUser />
                      <span>Profile</span>
                    </div>
                    <div className="dropdown-item logout" onClick={handleLogout}>
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </div>
                  </>
                ) : isGuest ? (
                  // NEW: Guest dropdown options
                  <>
                    <div className="dropdown-item" onClick={handleLoginClick}>
                      <FaSignInAlt />
                      <span>Sign In to Save Cart</span>
                    </div>
                    <div className="dropdown-item" onClick={() => {
                      localStorage.removeItem('userType');
                      localStorage.removeItem('guestSessionId');
                      setIsGuest(false);
                      setCartCount(0);
                      setWishlistCount(0);
                      navigate('/');
                    }}>
                      <FaSignOutAlt />
                      <span>Exit Guest Mode</span>
                    </div>
                  </>
                ) : (
                  <div className="dropdown-item" onClick={handleLoginClick}>
                    <FaSignInAlt />
                    <span>Sign In</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className="icon-wrapper"
            onClick={handleWishlistClick}
            title="Wishlist"
          >
            <div className="icon-container">
              <FaHeart />
              {wishlistCount > 0 && (
                <span className="icon-badge">{wishlistCount > 99 ? '99+' : wishlistCount}</span>
              )}
            </div>
          </div>

          <div
            className="icon-wrapper"
            onClick={handleCartClick}
            title="Shopping Cart"
          >
            <div className="icon-container">
              <FaShoppingCart />
              {cartCount > 0 && (
                <span className="icon-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mobile-icons">
          <div
            className="icon-wrapper mobile-cart"
            onClick={handleCartClick}
            title="Shopping Cart"
          >
            <div className="icon-container">
              <FaShoppingCart />
              {cartCount > 0 && (
                <span className="icon-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </div>
          </div>

          <div
            className="mobile-menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>

      <div className="mobile-search">
        <div className="search-bar">
          <input type="text" placeholder="Search products..." />
          <FaSearch />
        </div>
      </div>

      {showMobileMenu && (
        <div className="mobile-menu" ref={mobileMenuRef}>
          <div className="mobile-menu-content">
            <div className="mobile-user-section">
              {user ? (
                <div className="mobile-user-info">
                  {/* NEW: Display profile image in mobile menu */}
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="mobile-user-avatar-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline-block';
                      }}
                    />
                  ) : (
                    <FaUserCircle className="mobile-user-avatar" />
                  )}
                  <span className="mobile-user-name">{user.name}</span>
                </div>
              ) : isGuest ? (
                // NEW: Guest mobile display
                <div className="mobile-user-info">
                  <FaUser className="mobile-login-icon" />
                  <span className="mobile-user-name">Guest User</span>
                </div>
              ) : (
                <div className="mobile-login-prompt">
                  <FaUser className="mobile-login-icon" />
                  <span>Please sign in</span>
                </div>
              )}
            </div>

            <div className="mobile-menu-items">
              {user ? (
                <>
                  <div className="mobile-menu-item" onClick={handleProfileClick}>
                    <FaUser />
                    <span>Profile</span>
                  </div>
                  <div className="mobile-menu-item" onClick={handleWishlistClick}>
                    <FaHeart />
                    <span>Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="mobile-menu-badge">{wishlistCount > 99 ? '99+' : wishlistCount}</span>
                    )}
                  </div>
                  <div className="mobile-menu-item logout" onClick={handleLogout}>
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </div>
                </>
              ) : isGuest ? (
                // NEW: Guest mobile menu
                <>
                  <div className="mobile-menu-item" onClick={handleWishlistClick}>
                    <FaHeart />
                    <span>Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="mobile-menu-badge">{wishlistCount > 99 ? '99+' : wishlistCount}</span>
                    )}
                  </div>
                  <div className="mobile-menu-item" onClick={handleLoginClick}>
                    <FaSignInAlt />
                    <span>Sign In to Save</span>
                  </div>
                  <div className="mobile-menu-item logout" onClick={() => {
                    localStorage.removeItem('userType');
                    localStorage.removeItem('guestSessionId');
                    setIsGuest(false);
                    setShowMobileMenu(false);
                    navigate('/');
                  }}>
                    <FaSignOutAlt />
                    <span>Exit Guest Mode</span>
                  </div>
                </>
              ) : (
                <div className="mobile-menu-item" onClick={handleLoginClick}>
                  <FaSignInAlt />
                  <span>Sign In</span>
                </div>
              )}
            </div>

            {/* <div className="mobile-info-section">
              <div className="mobile-info-item">
                <FaAward className="mobile-info-icon" />
                <div className="mobile-info-text">
                  <div><strong>Quality Products</strong></div>
                  <div>100% authentic items</div>
                </div>
              </div>
              <div className="mobile-info-item">
                <FaTag className="mobile-info-icon" />
                <div className="mobile-info-text">
                  <div><strong>Daily Offers</strong></div>
                  <div>Discount 20% off</div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainHeader;