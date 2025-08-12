import React, { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MainHeader.css';
import logoImage from '../../assets/logo.jpeg';
import { 
  FaSearch, FaUser, FaHeart, FaShoppingCart, 
  FaChevronDown, FaSignOutAlt, FaUserCircle, FaSignInAlt,
  FaTruck, FaTag, FaBars, FaTimes
} from 'react-icons/fa';

const MainHeader = ({ onProfileClick, onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const API_URL = 'http://localhost:8000/';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchCounts();
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    // Listen for custom events to update counts
    const handleWishlistUpdate = () => fetchWishlistCount();
    const handleCartUpdate = () => fetchCartCount();

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCounts = async () => {
    await Promise.all([fetchWishlistCount(), fetchCartCount()]);
  };

  const fetchWishlistCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setWishlistCount(0);
        return;
      }

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

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartCount(0);
        return;
      }

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

  const handleProfileClick = () => {
    setShowDropdown(false);
    setShowMobileMenu(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setWishlistCount(0);
    setCartCount(0);
    setShowDropdown(false);
    setShowMobileMenu(false);
    if (onLogout) onLogout();
    navigate('/');
  };

  const handleLoginClick = () => {
    setShowMobileMenu(false);
    navigate('/signin');
  };

  const handleWishlistClick = () => {
    if (!user) {
      alert('Please login to view your wishlist');
      navigate('/signin');
      return;
    }
    setShowMobileMenu(false);
    navigate('/wishlist');
  };

  const handleCartClick = () => {
    if (!user) {
      alert('Please login to view your cart');
      navigate('/signin');
      return;
    }
    setShowMobileMenu(false);
    navigate('/cart');
  };

  return (
    <div className="main-header">
      <div className="header-top">
        {/* Logo */}
        <img 
          src={logoImage} 
          alt="Logo" 
          className="main-logo" 
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />

        {/* Desktop Search Bar */}
        <div className="search-bar desktop-search">
          <input type="text" placeholder="Search products..." />
          <FaSearch />
        </div>

        {/* Delivery & Offers - Desktop Only */}
        <div className="info-section">
          <div className="info-item">
            <FaTruck className="info-icon" />
            <div className="info-text">
              <div><strong>Free Delivery</strong></div>
              <div>Details & restrictions</div>
            </div>
          </div>
          <div className="info-item">
            <FaTag className="info-icon" />
            <div className="info-text">
              <div><strong>Daily Offers</strong></div>
              <div>Discount 20% off</div>
            </div>
          </div>
        </div>

        {/* Desktop Icons */}
        <div className="header-icons desktop-icons">
          {/* User Icon with dropdown */}
          <div className="user-profile-section" ref={dropdownRef}>
            <div 
              className="user-info"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user ? (
                <>
                  <FaUserCircle className="user-avatar" />
                  <span className="user-name">{user.name}</span>
                </>
              ) : (
                <FaUser className="header-login-icon" />
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
                ) : (
                  <div className="dropdown-item" onClick={handleLoginClick}>
                    <FaSignInAlt />
                    <span>Sign In</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wishlist */}
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

          {/* Cart */}
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

        {/* Mobile Icons */}
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

      {/* Mobile Search Bar */}
      <div className="mobile-search">
        <div className="search-bar">
          <input type="text" placeholder="Search products..." />
          <FaSearch />
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu" ref={mobileMenuRef}>
          <div className="mobile-menu-content">
            {/* User Section */}
            <div className="mobile-user-section">
              {user ? (
                <div className="mobile-user-info">
                  <FaUserCircle className="mobile-user-avatar" />
                  <span className="mobile-user-name">{user.name}</span>
                </div>
              ) : (
                <div className="mobile-login-prompt">
                  <FaUser className="mobile-login-icon" />
                  <span>Please sign in</span>
                </div>
              )}
            </div>

            {/* Menu Items */}
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
              ) : (
                <div className="mobile-menu-item" onClick={handleLoginClick}>
                  <FaSignInAlt />
                  <span>Sign In</span>
                </div>
              )}
            </div>

            {/* Mobile Info Section */}
            <div className="mobile-info-section">
              <div className="mobile-info-item">
                <FaTruck className="mobile-info-icon" />
                <div className="mobile-info-text">
                  <div><strong>Free Delivery</strong></div>
                  <div>Details & restrictions</div>
                </div>
              </div>
              <div className="mobile-info-item">
                <FaTag className="mobile-info-icon" />
                <div className="mobile-info-text">
                  <div><strong>Daily Offers</strong></div>
                  <div>Discount 20% off</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainHeader;