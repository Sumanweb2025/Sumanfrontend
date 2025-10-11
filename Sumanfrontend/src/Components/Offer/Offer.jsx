import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Offer.css';

const SpecialOffer = () => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [offer, setOffer] = useState(null);
  const [isActive, setIsActive] = useState(false);

  const API_URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await fetch(`${API_URL}api/offers/active`);
        const response = await res.json();

        // If backend says there's no offer or offer data is null
        if (!response.success || !response.data) {
          setIsActive(false);
          return;
        }

        const offerData = response.data;
        const endDate = new Date(offerData.endDate);
        const startDate = new Date(offerData.startDate);
        const now = new Date();

         // Check if offer is within valid date range and is active
        if (now < startDate || now > endDate || !offerData.isActive) {
          setIsActive(false);
          return;
        }

        setOffer(offerData);
        setIsActive(true);

        // Countdown logic
        const calculateTimeLeft = () => {
          const now = new Date();
          const diff = endDate - now;

          if (diff <= 0) {
            setIsActive(false); // Offer expired
            return null;
          }

          return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60),
          };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
          const updatedTime = calculateTimeLeft();
          if (updatedTime) {
            setTimeLeft(updatedTime);
          } else {
            clearInterval(timer); // Stop timer if expired
          }
        }, 1000);

        return () => clearInterval(timer);
      } catch (error) {
        console.error('Error fetching offer:', error);
        setIsActive(false);
      }
    };

    fetchOffer();
  }, [API_URL]);

  // If there's no valid offer, return nothing
  if (!isActive || !offer || !timeLeft) return null;

  return (
    <motion.section
      className="special-offer"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="offer-container">
        <div className="offer-content">
          <div className="offer-text">
            <h2 className="sub-title text-animate offer-subtitle">🎉 Limited Time</h2>
            <h1 className="card-title text-animate offer-title shimmer-text">
              {offer.title} – {offer.discount}{offer.discountType === 'percentage' ? '%' : ' CAD'} OFF
            </h1>
            <p className="body-text text-animate offer-description">
              {offer.description}
            </p>

            <div className="countdown-timer">
              {['days', 'hours', 'minutes', 'seconds'].map((unit, i) => (
                <React.Fragment key={unit}>
                  <div className="countdown-item">
                    <span className="countdown-value">{timeLeft[unit]}</span>
                    <span className="countdown-label">{unit}</span>
                  </div>
                  {i < 3 && <div className="countdown-separator">:</div>}
                </React.Fragment>
              ))}
            </div>

            <button
              className="button-text offer-button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Shop Now
            </button>
          </div>

          <motion.div
            className="offer-image"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            style={offer.imageUrl ? { backgroundImage: `url(${offer.imageUrl})` } : {}}
          >
            <motion.div
              className="discount-badge pulse"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span>{offer.discount}{offer.discountType === 'percentage' ? '%' : ''}</span>
              <span>OFF</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default SpecialOffer;
