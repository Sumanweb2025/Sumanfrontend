import React from 'react';
import './Navbar.css';
import { FaPhoneAlt } from 'react-icons/fa';

const Navbar = () => {
  const navLinks = ['Home', 'About Us', 'Sweets', 'Snacks', 'Grocery', 'Contact'];

  return (
    <div className="navbar">
      {/* Navigation Links */}
      <div className="nav-links">
        {navLinks.map((item) => (
          <a key={item} href="#">{item}</a>
        ))}
      </div>

      {/* Phone Info */}
      <div className="phone-info">
        <FaPhoneAlt />
        <span>Call Us At</span>
        <span className="phone-number">+1 647 573 6363</span>
      </div>
    </div>
  );
};

export default Navbar;