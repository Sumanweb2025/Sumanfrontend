import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { 
  FaPhoneAlt, 
  FaChevronDown,
  FaStore,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { 
  MdHome,
  MdPerson,
  MdCake,
  MdFastfood,
  MdShoppingCart,
  MdContactPhone,
  MdLocalGasStation
} from 'react-icons/md';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [showBrands, setShowBrands] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef();
  const brandDropdownRef = useRef();
  const mobileNavRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowBrands(false);
      }
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target)) {
        setShowBrandDropdown(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target)) {
        setShowMobileNav(false);
      }
    };

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 100);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const categories = [
    { name: 'HOME', icon: <MdHome style={{ color: '#000000', marginTop: '7px' }} />, path: '/' },
    { name: 'ABOUT US', icon: <MdPerson style={{ color: '#000000', marginTop: '5px' }} />, path: '/aboutus' },
    { name: 'SWEETS', icon: <MdCake style={{ color: '#000000' }} />, path: '/sweets' },
    { name: 'SNACKS', icon: <MdFastfood style={{ color: '#000000' }} />, path: '/snacks' },
    { name: 'GROCERIES', icon: <MdShoppingCart style={{ color: '#000000' }} />, path: '/groceries' },
    { name: 'CONTACT US', icon: <MdContactPhone style={{ color: '#000000' }} />, path: '/contact' },
  ];

  const allCategoriesItems = [
    { name: 'SWEETS', icon: <MdCake style={{ color: '#000000' }} />, path: '/sweets' },
    { name: 'SNACKS', icon: <MdFastfood style={{ color: '#000000' }} />, path: '/snacks' },
    { name: 'GROCERIES', icon: <MdShoppingCart style={{ color: '#000000' }} />, path: '/groceries' },
    { 
      name: 'BRANDS', 
      icon: <FaStore style={{ color: '#000000' }} />, 
      isDropdown: true
    }
  ];

  const brandLinks = [
    { name: 'Iyyappa', path: '/brands/iyyappa' },
    { name: 'Amrith', path: '/brands/amrith' },
    { name: 'Venba', path: '/brands/venba' },
    { name: 'Little Krishna', path: '/brands/little-krishna' },
  ];

  return (
    <div className={`Header-navbar ${isScrolled ? 'navbar-fixed' : ''}`}>
      {/* All Categories Button - Always Visible */}
      <div className="all-categories-dropdown" ref={dropdownRef}>
        <button 
          className="all-categories-btn" 
          onClick={() => setShowBrands(!showBrands)}
        >
          <FaBars className="hamburger-icon" />
          ALL CATEGORIES
          <FaChevronDown className="dropdown-arrow" />
        </button>
        {showBrands && (
          <div className="categories-dropdown-content">
            {allCategoriesItems.map((item) => (
              <div key={item.name}>
                {item.isDropdown ? (
                  <div 
                    className="dropdown-section brands-section" 
                    ref={brandDropdownRef}
                    onMouseEnter={() => setShowBrandDropdown(true)}
                    onMouseLeave={() => setShowBrandDropdown(false)}
                  >
                    <div className="dropdown-section-header brands-header">
                      <span className="category-icon">{item.icon}</span>
                      <span className="category-name">{item.name}</span>
                      <FaChevronDown className="brands-arrow-right" />
                    </div>
                    {showBrandDropdown && (
                      <div className="brands-dropdown">
                        {brandLinks.map((brand) => (
                          <Link key={brand.name} to={brand.path} className="brand-item">
                            {brand.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to={item.path} className="category-item">
                    <span className="category-icon">{item.icon}</span>
                    <span className="category-name">{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Category Links */}
      <div className="Header-nav-links desktop-only">
        {categories.map((category) => (
          <Link key={category.name} to={category.path} className="category-link">
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </Link>
        ))}
      </div>

      {/* Mobile Navigation Menu */}
      <div className="mobile-nav-toggle mobile-tablet-only" ref={mobileNavRef}>
        <button 
          className="mobile-nav-btn" 
          onClick={() => setShowMobileNav(!showMobileNav)}
        >
          {showMobileNav ? <FaTimes /> : <FaBars />}
        </button>
        
        {/* Mobile Navigation Dropdown */}
        {showMobileNav && (
          <div className="mobile-nav-dropdown">
            {categories.map((category) => (
              <Link 
                key={category.name} 
                to={category.path} 
                className="mobile-nav-item"
                onClick={() => setShowMobileNav(false)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Phone Info */}
      <div className="phone-info">
        <FaPhoneAlt />
        <span className="call-text">Call Us At</span>
        <span className="phone-number">+1 647 573 6363</span>
      </div>
    </div>
  );
};

export default Navbar;