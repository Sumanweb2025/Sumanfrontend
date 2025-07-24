import React from 'react';
import './MainHeader.css';
import { FaSearch, FaUser, FaHeart, FaShoppingCart } from 'react-icons/fa';

const MainHeader = () => {
  return (
    <div className="main-header">
      {/* Logo */}
      <img src="/logo.png" alt="Logo" className="main-logo" />

      {/* Search Bar */}
      <div className="search-bar">
        <input type="text" placeholder="Search products..." />
        <FaSearch />
      </div>

      {/* Free Delivery & Offers */}
      <div className="info-section">
        <div>
          <div><strong>Free Delivery</strong></div>
          <div>Details & restrictions</div>
        </div>
        <div>
          <div><strong>Daily Offers</strong></div>
          <div>Discount 20% off</div>
        </div>
      </div>

      {/* Icons */}
      <div className="header-icons">
        <FaUser />
        <FaHeart />
        <FaShoppingCart />
      </div>
    </div>
  );
};

export default MainHeader;