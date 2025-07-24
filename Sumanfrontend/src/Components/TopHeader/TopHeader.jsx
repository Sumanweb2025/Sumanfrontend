import React from 'react';
import './TopHeader.css';
import { FaTruck, FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';

const TopHeader = () => {
  return (
    <div className="top-header">
      <div className="top-left">
        <FaTruck /> Track Your Order Status
      </div>
      <div className="top-center">100% Secure delivery</div>
      <div className="top-right">
        <FaFacebookF />
        <FaInstagram />
        <FaWhatsapp />
      </div>
    </div>
  );
};

export default TopHeader;