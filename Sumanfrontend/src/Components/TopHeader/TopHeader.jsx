import React from 'react';
import './TopHeader.css';
import { FaTruck, FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';

const TopHeader = () => {
  const messages = [
    { icon: <FaTruck />, text: "Track Your Order Status" },
    { icon: null, text: "100% Secure delivery" },
    { icon: null, text: "Free shipping on orders above $7.86" },
    { icon: null, text: "24/7 Customer Support Available" },
    { icon: null, text: "Easy Returns & Exchange Policy" }
  ];

  return (
    <div className="top-header">
      {/* Desktop Layout */}
      <div className="desktop-layout">
        <div className="desktop-news-ticker">
          <div className="desktop-ticker-content">
            {messages.map((message, index) => (
              <span key={index} className="desktop-ticker-item">
                {message.icon && message.icon}
                {message.text}
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {messages.map((message, index) => (
              <span key={`duplicate-${index}`} className="desktop-ticker-item">
                {message.icon && message.icon}
                {message.text}
              </span>
            ))}
          </div>
        </div>
        <div className="desktop-social">
          <FaFacebookF />
          <FaInstagram />
          <FaWhatsapp />
        </div>
      </div>

      {/* Mobile Layout with News Ticker */}
      <div className="mobile-layout">
        <div className="news-ticker">
          <div className="ticker-content">
            {messages.map((message, index) => (
              <span key={index} className="ticker-item">
                {message.icon && message.icon}
                {message.text}
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {messages.map((message, index) => (
              <span key={`duplicate-${index}`} className="ticker-item">
                {message.icon && message.icon}
                {message.text}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mobile-social">
          <FaFacebookF />
          <FaInstagram />
          <FaWhatsapp />
        </div>
      </div>
    </div>
  );
};

export default TopHeader;