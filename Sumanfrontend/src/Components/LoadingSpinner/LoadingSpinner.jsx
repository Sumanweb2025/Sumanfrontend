import React from 'react';
import { FadeLoader } from 'react-spinners';
import './LoadingSpinner.css';

const LoadingSpinner = ({
  isLoading,
  brandName = "Your Brand Name",
  loadingText = "Loading...",
  primaryColor = "#e31e24",
  backgroundColor = "rgba(255, 255, 255, 0.96)"
}) => {
  if (!isLoading) return null;

  return (
    <div className="loading-spinner-overlay" style={{ backgroundColor }}>
      <div className="loading-spinner-container">
        <div className="fade-loader-container">
          <FadeLoader
            color={primaryColor}
            loading={isLoading}
            size={15}
            margin={2}
            speedMultiplier={1}
          />
        </div>

        <div className="loading-spinner-content">
          <h3 className="loading-spinner-brand-name" style={{ color: primaryColor }}>
            {brandName}
          </h3>
          <p className="loading-spinner-text">{loadingText}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;