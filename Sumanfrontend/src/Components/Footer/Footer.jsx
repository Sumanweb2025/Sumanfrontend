import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import payment from '../../assets/stripe-cards.png';
import logo from '../../assets/logo.jpeg';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="iyappaa-footer">
      <div className="footer-part-main">
        {/* Logo + Contact */}
        <div className="footer-part-left">
          <img src={logo} alt="Iyappaa Logo" className="footer-part-logo" />
          <p className="footer-part-tagline">Unleash Your Taste Buds !</p>
          <p className="footer-part-contact red-text">+1 416 562 6363</p>
          <p className="footer-part-contact red-text">sellappan@gmail.com</p>
        </div>

        {/* Address & Hours */}
        <div className="footer-part-column">
          <h4>Address</h4>
          <p>Iyappaa Sweets & Snacks</p>
          <p>2721, Markham Road, Unit #16, 17, 18</p>
          <p>Scarborough – M1X 1L5, Toronto, Canada</p>
          <p>Call: +1 416 562 6363</p>
          <h4>Hours</h4>
          <p>9:30am – 6:30pm Monday to Friday</p>
        </div>

        {/* Useful Links */}
        <div className="footer-part-column">
          <h4>Useful Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/sweets">Shop</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* My Account */}
        <div className="footer-part-column">
          <h4>My Account</h4>
          <ul>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/myorders">Order History</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/track-order">Order Tracking</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </div>

        {/* Information */}
        <div className="footer-part-column">
          <h4>Information</h4>
          <ul>
            <li><Link to="/terms">Terms & Condition</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/return">Return Policy</Link></li>
          </ul>
        </div>
      </div>

      {/* Social Icons & Footer Bottom */}
      <div className="footer-part-bottom">
        <div className="footer-part-social">
          <FaFacebookF />
          <FaInstagram />
          <FaWhatsapp />
        </div>

        <p className="footer-part-copyright">
          Copyright © 2025 iyappaa.com All Rights Reserved.
        </p>
        <div className="footer-part-payments">
          <img src={payment} alt="Payment Methods" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
