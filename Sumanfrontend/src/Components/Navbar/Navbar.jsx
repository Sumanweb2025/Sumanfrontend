import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { FaPhoneAlt, FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [showBrands, setShowBrands] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowBrands(false);
      }
    };

    // Attach event listener
    document.addEventListener('mousedown', handleOutsideClick);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Sweets', path: '/sweets' },
    { name: 'Snacks', path: '/snacks' },
    { name: 'Grocery', path: '/groceries' },
    { name: 'Contact', path: '/contact' },
  ];

  const brandLinks = [
    { name: 'Iyyappa', path: '/brands/iyyappa' },
    { name: 'Amrith', path: '/brands/amrith' },
    { name: 'Venba', path: '/brands/venba' },
  ];

  return (
    <div className="navbar">
      {/* Navigation Links */}
      <div className="nav-links">
        {navLinks.map((item) => (
          <Link key={item.name} to={item.path}>{item.name}</Link>
        ))}

        {/* Brands Dropdown with Ref */}
        <div className="dropdown" ref={dropdownRef}>
          <button className="dropdown-toggle" onClick={() => setShowBrands(!showBrands)}>
            Brands <FaChevronDown style={{ marginLeft: '6px' }} />
          </button>
          {showBrands && (
            <div className="dropdown-content">
              {brandLinks.map((brand) => (
                <Link key={brand.name} to={brand.path}>{brand.name}</Link>
              ))}
            </div>
          )}
        </div>
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
