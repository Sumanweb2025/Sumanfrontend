import React from 'react';
import './LoadingSpinner.css';
import logo from '../../assets/logo-title.png';

const LoadingSpinner = ({ 
  isLoading, 
  brandName = "Your Brand Name", 
  loadingText = "Loading...", 
  logoUrl = logo,
  logoSize = 80,
  dotColor = "#3b82f6",
  backgroundColor = "rgba(255, 255, 255, 0.95)"
}) => {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay" style={{ backgroundColor }}>
      <div className="loading-container">
        {logoUrl ? (
          <div className="logo-container">
            <img 
              src={logoUrl} 
              alt="Company Logo" 
              className="company-logo"
              style={{ 
                width: logoSize, 
                height: logoSize 
              }}
            />
            <div className="logo-pulse-ring"></div>
          </div>
        ) : (
          <div className="spinner">
            <div 
              className="dot" 
              style={{ backgroundColor: dotColor }}
            ></div>
            <div 
              className="dot" 
              style={{ backgroundColor: dotColor }}
            ></div>
            <div 
              className="dot" 
              style={{ backgroundColor: dotColor }}
            ></div>
          </div>
        )}
        <h2 className="loading-brand-name" style={{ color: dotColor }}>
          {brandName}
        </h2>
        <p className="loading-text">{loadingText}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
