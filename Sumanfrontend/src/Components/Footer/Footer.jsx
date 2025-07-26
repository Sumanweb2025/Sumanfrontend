import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="footer-overlay">
        <div className="footer-grid">
          {/* Contact Us */}
          <div className="footer-section">
            <h3>Contact Us</h3>
            <p>123 Market Street, Sulur,<br />Coimbatore – 641402, TamilNadu-India</p>
            <p>Email: exports@sumans.com<br />sumans@tech.com</p>
            <p>Phone: (+91) 9876543210</p>
          </div>

          {/* Useful Links */}
          <div className="footer-section">
            <h3>Useful Links</h3>
            <ul>
              <li>Home</li>
              <li>About Us</li>
              <li>Products</li>
              <li>Contact Us</li>
            </ul>
          </div>

          {/* Follow Us */}
          <div className="footer-section">
            <h3>Follow Us Now</h3>
            <ul>
              <li>Facebook</li>
              <li>Twitter</li>
              <li>Instagram</li>
              <li>YouTube</li>
              <li>Google +</li>
            </ul>
          </div>

          {/* Subscribe */}
          <div className="footer-section">
            <h3>Subscribe</h3>
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe Now</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
