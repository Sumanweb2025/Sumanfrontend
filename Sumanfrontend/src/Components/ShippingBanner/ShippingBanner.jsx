import React from 'react';
import './ShippingBanner.css';
import { FaShippingFast, FaLock, FaStar, FaCreditCard } from 'react-icons/fa';

const features = [
  {
    icon: <FaShippingFast />,
    title: 'Free Shipping',
    subtitle: 'Free Shipping For Orders From $50',
  },
  {
    icon: <FaLock />,
    title: 'Secure Delivery',
    subtitle: 'Your Order, Delivered With Care.',
  },
  {
    icon: <FaStar />,
    title: 'Best Quality',
    subtitle: 'Quality Meets Perfection.',
  },
  {
    icon: <FaCreditCard />,
    title: 'Secure Payment',
    subtitle: 'Shop Smart, Pay Secure.',
  },
];

const Banner = () => {
  return (
    <div className="banner">
      {features.map((item, idx) => (
        <div key={idx} className="banner-item">
          <div className="banner-top-row">
            <div className="banner-icon">{item.icon}</div>
            <h3 className="banner-title">{item.title}</h3>
          </div>
          <p className="banner-subtitle">{item.subtitle}</p>
        </div>
      ))}
    </div>
  );
};

export default Banner;
