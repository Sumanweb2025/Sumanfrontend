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

  // Helper function to get full image URL
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

  // FIXED: Fetch user profile with proper error handling
  const fetchUserProfile = async (token) => {
    // Don't fetch if no token
    if (!token) {
      // console.log('No token - skipping profile fetch');
      return;
    }

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

        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      // FIXED: Proper 401 handling
      if (error.response?.status === 401) {
        console.log('Token expired or invalid - clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setProfileImage(null);
      } else {
        console.error('Error fetching user profile:', error.message);
      }
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

      // Fetch fresh profile data and counts
      fetchUserProfile(token);
      fetchCounts(token);
    } else if (userType === 'guest' && guestSessionId) {
      setIsGuest(true);
      fetchGuestCounts(guestSessionId);
    }

    // Listen for profile update events
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
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch counts for logged-in users
  const fetchCounts = async (token) => {
    await Promise.allSettled([
      fetchWishlistCount(token),
      fetchCartCount(token)
    ]);
  };

  // Fetch counts for guest users
  const fetchGuestCounts = async (sessionId) => {
    await Promise.allSettled([
      fetchGuestWishlistCount(sessionId),
      fetchGuestCartCount(sessionId)
    ]);
  };

  // FIXED: Wishlist count with proper error handling
  const fetchWishlistCount = async (token) => {
    if (!token) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}api/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const wishlistData = response.data?.data || response.data;
      setWishlistCount(wishlistData.products?.length || 0);
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('Unauthorized - clearing token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      setWishlistCount(0);
    }
  };

  // FIXED: Guest wishlist count
  const fetchGuestWishlistCount = async (sessionId) => {
    if (!sessionId) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}api/wishlist`, {
        headers: { 'X-Session-ID': sessionId }
      });

      const wishlistData = response.data?.data || response.data;
      setWishlistCount(wishlistData.products?.length || 0);
    } catch (err) {
      console.log('Error fetching guest wishlist:', err.message);
      setWishlistCount(0);
    }
  };

  // FIXED: Cart count with proper error handling
  const fetchCartCount = async (token) => {
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}api/cart/count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const countData = response.data?.data || response.data;
      setCartCount(countData.count || 0);
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('Unauthorized - clearing token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      setCartCount(0);
    }
  };

  // FIXED: Guest cart count
  const fetchGuestCartCount = async (sessionId) => {
    if (!sessionId) {
      setCartCount(0);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}api/cart/count`, {
        headers: { 'X-Session-ID': sessionId }
      });

      const countData = response.data?.data || response.data;
      setCartCount(countData.count || 0);
    } catch (err) {
      console.log('Error fetching guest cart:', err.message);
      setCartCount(0);
    }
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    setShowMobileMenu(false);
    if (isGuest) {
      navigate('/signin');
    } else {
      navigate('/profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('guestSessionId');
    localStorage.removeItem('hasSeenGuestModal');

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

        <div className="main-header-icons desktop-icons">
          <div className="main-user-profile-section" ref={dropdownRef}>
            <div
              className="main-user-info"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user ? (
                <>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MainHeader;