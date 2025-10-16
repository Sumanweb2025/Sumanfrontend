
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaUserCircle } from 'react-icons/fa';
import './GuestPopup.css';

const GuestWelcomeModal = ({ isOpen, onContinueAsGuest, onSignIn, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignIn = () => {
    onSignIn();
    navigate('/signin');
  };

  const handleContinueAsGuest = () => {
    onContinueAsGuest();
  };

  return (
    <div className="guest-modal-overlay" onClick={onClose}>
      <div className="guest-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="guest-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="guest-modal-content">
          {/* Icon */}
          <div className="guest-modal-icon">
            <FaUserCircle />
          </div>

          {/* Header */}
          <div className="guest-modal-header">
            <h2>Welcome to Iyappaa Sweets!</h2>
            <p>How would you like to continue?</p>
          </div>

          {/* Benefits List */}
          <div className="guest-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">🛍️</span>
              <span>Browse & Shop Products</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">❤️</span>
              <span>Save to Wishlist</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🎁</span>
              <span>Exclusive Member Offers</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="guest-modal-actions">
            <button
              className="guest-btn signin-btn"
              onClick={handleSignIn}
            >
              Sign In / Sign Up
            </button>
            <button
              className="guest-btn continue-guest-btn"
              onClick={handleContinueAsGuest}
            >
              Continue as Guest
            </button>
          </div>

          {/* Note */}
          <p className="guest-modal-note">
            Sign in to unlock exclusive discounts and track your orders
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestWelcomeModal;