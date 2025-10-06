
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaHeart, FaShoppingCart, FaUser, FaTags, FaGift, FaTimes } from 'react-icons/fa';
import './GuestPopup.css';

const GuestWelcomeModal = ({ isOpen, onClose, onContinueAsGuest }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    navigate('/signin');
  };

  const handleContinueAsGuest = () => {
    onContinueAsGuest();
    onClose();
  };

  const guestFeatures = [
    {
      icon: <FaShoppingBag />,
      title: 'Browse Products',
      description: 'View all our delicious sweets and snacks'
    },
    {
      icon: <FaHeart />,
      title: 'Add to Wishlist',
      description: 'Save your favorite items for later'
    },
    {
      icon: <FaShoppingCart />,
      title: 'Add to Cart',
      description: 'Build your perfect order'
    },
    {
      icon: <FaShoppingBag />,
      title: 'Place Orders',
      description: 'Complete checkout as a guest'
    }
  ];

  const memberBenefits = [
    {
      icon: <FaTags />,
      title: '2% Discount',
      description: 'On your first order'
    },
    {
      icon: <FaGift />,
      title: 'Exclusive Offers',
      description: 'Access to special deals'
    },
    {
      icon: <FaUser />,
      title: 'Order History',
      description: 'Track all your orders'
    }
  ];

  return (
    <div className="guest-modal-overlay" onClick={onClose}>
      <div className="guest-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="guest-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="guest-modal-content">
          <div className="guest-modal-header">
            <h2>🎉 Welcome to Iyappaa Foods!</h2>
            <p className="guest-modal-subtitle">Choose how you'd like to continue</p>
          </div>

          <div className="guest-modal-sections">
            {/* Guest Features Section */}
            <div className="guest-section">
              <h3 className="guest-popup-section-title">
                <span className="guest-badge">Guest</span>
                Continue as Guest
              </h3>
              <p className="section-description">
                You can still enjoy shopping with us:
              </p>
              
              <div className="features-list">
                {guestFeatures.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <div className="feature-icon guest-icon">{feature.icon}</div>
                    <div className="feature-content">
                      <h4>{feature.title}</h4>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="guest-modal-divider">
              <span>OR</span>
            </div>

            {/* Member Benefits Section */}
            <div className="member-section">
              <h3 className="section-title">
                <span className="member-badge">Member</span>
                Sign In for More Benefits
              </h3>
              <p className="section-description">
                Unlock exclusive perks and rewards:
              </p>
              
              <div className="features-list">
                {memberBenefits.map((benefit, index) => (
                  <div key={index} className="feature-item">
                    <div className="feature-icon member-icon">{benefit.icon}</div>
                    <div className="feature-content">
                      <h4>{benefit.title}</h4>
                      <p>{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="member-highlight">
                <div className="highlight-badge">✨ SPECIAL OFFER</div>
                <p>Get <strong>2% OFF</strong> on your first order + many more exclusive offers!</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="guest-modal-actions">
            <button 
              className="guest-btn continue-guest-btn"
              onClick={handleContinueAsGuest}
            >
              Continue as Guest
            </button>
            <button 
              className="guest-btn signin-btn"
              onClick={handleSignIn}
            >
              Sign In / Sign Up
            </button>
          </div>

          <p className="guest-modal-note">
            Don't worry! You can sign in anytime to save your cart and access member benefits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestWelcomeModal;