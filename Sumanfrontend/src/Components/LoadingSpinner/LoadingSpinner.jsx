import React from 'react';
import './LoadingSpinner.css';
import logo from '../../assets/logo-title.png';

const LoadingSpinner = ({ 
  isLoading, 
  brandName = "Your Brand Name", 
  loadingText = "Loading...", 
  logoUrl = logo,
  logoSize = 60,
  primaryColor = "#e31e24",
  backgroundColor = "rgba(255, 255, 255, 0.96)"
}) => {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay" style={{ backgroundColor }}>
      <div className="loading-container">
        {logoUrl ? (
          <div className="logo-spinner-container">
            <div className="spinner-ring" style={{ borderTopColor: primaryColor }}>
              <div className="spinner-ring-inner" style={{ borderTopColor: primaryColor }}></div>
            </div>
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="company-logo"
              style={{ 
                width: logoSize, 
                height: logoSize 
              }}
            />
          </div>
        ) : (
          <div className="professional-spinner">
            <div className="spinner-circle" style={{ borderTopColor: primaryColor }}></div>
            <div className="spinner-circle-inner" style={{ borderTopColor: primaryColor }}></div>
          </div>
        )}
        
        <div className="loading-content">
          <h3 className="loading-brand-name" style={{ color: primaryColor }}>
            {brandName}
          </h3>
          <p className="loading-text">{loadingText}</p>
          <div className="progress-dots">
            <span className="dot" style={{ backgroundColor: primaryColor }}></span>
            <span className="dot" style={{ backgroundColor: primaryColor }}></span>
            <span className="dot" style={{ backgroundColor: primaryColor }}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;