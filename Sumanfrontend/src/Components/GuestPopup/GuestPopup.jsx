// Create: src/Components/GuestPopup/GuestPopup.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GuestPopup.css';

const GuestPopup = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleContinueAsGuest = () => {
    // Set guest mode flag
    localStorage.setItem('isGuestMode', 'true');
    localStorage.setItem('guestSessionId', `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    onClose();
  };

  const handleSignIn = () => {
    // Store current page URL for redirect after login
    const currentUrl = window.location.pathname + window.location.search;
    localStorage.setItem('returnUrl', currentUrl);
    navigate('/signin');
  };

  const handleSignUp = () => {
    // Store current page URL for redirect after signup
    const currentUrl = window.location.pathname + window.location.search;
    localStorage.setItem('returnUrl', currentUrl);
    navigate('/signup');
  };

  return (
    <div className="guest-popup-overlay">
      <div className="guest-popup-content">
        <div className="guest-popup-header">
          <h2>Welcome to Iyappaa Foods!</h2>
          <button className="guest-popup-close" onClick={onClose}>×</button>
        </div>
        
        <div className="guest-popup-body">
          <div className="guest-popup-message">
            <p>As a guest user, you can:</p>
            <ul>
              <li>✓ View all our delicious products</li>
              <li>✓ Add items to your wishlist</li>
              <li>✓ Add products to your cart</li>
              <li>✓ Place orders seamlessly</li>
            </ul>
            
            <div className="guest-popup-offer">
              <h3>🎉 Special Offer for New Users!</h3>
              <p>Sign in to get <strong>2% discount</strong> on your first order!</p>
            </div>
          </div>
          
          <div className="guest-popup-actions">
            <button 
              className="guest-popup-btn guest-btn-primary"
              onClick={handleContinueAsGuest}
            >
              Continue as Guest
            </button>
            
            <div className="guest-popup-auth-buttons">
              <button 
                className="guest-popup-btn guest-btn-signin"
                onClick={handleSignIn}
              >
                Sign In
              </button>
              
              <button 
                className="guest-popup-btn guest-btn-signup"
                onClick={handleSignUp}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestPopup;