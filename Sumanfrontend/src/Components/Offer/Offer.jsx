import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Offer.css';

const SpecialOffer = () => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [offer, setOffer] = useState(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/offers/active');
        const data = await res.json();

        // If backend says there's no offer
        if (data.message === 'No active offer') {
          setIsActive(false);
          return;
        }

        const endDate = new Date(data.endDate);
        const now = new Date();

        // If offer expired
        if (endDate <= now) {
          setIsActive(false);
          return;
        }

        setOffer(data);
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
      } catch {
        setIsActive(false);
      }
    };

    fetchOffer();
  }, []);

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
            <h1 className="card-title text-animate offer-title shimmer-text">Special Offer – {offer.discount}% OFF</h1>
            <p className="body-text text-animate offer-description">
              Our sweetest deals are here! Grab {offer.title} at delicious discounts before time runs out.
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
          >
            <motion.div
              className="discount-badge pulse"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span>{offer.discount}%</span>
              <span>OFF</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default SpecialOffer;
