import React, { useState, useEffect } from 'react'; // ✅ added missing imports
import image5 from '../../assets/image5.jpeg';
import milkchocolate from '../../assets/milkchocolate.jpg';
import './Offer.css';

const SpecialOfferBanner = () => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 30);

  const calculateTimeLeft = () => {
    const diff = +new Date(targetDate) - Date.now();
    return {
      total: diff,
      days: Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0),
      hours: Math.max(Math.floor((diff / (1000 * 60 * 60)) % 24), 0),
      minutes: Math.max(Math.floor((diff / (1000 * 60)) % 60), 0),
      seconds: Math.max(Math.floor((diff / 1000) % 60), 0),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="offers-banner">
      <div className="offer-image-section">
        <img src={image5} alt="Donut" />
        <img src={milkchocolate} alt="Twisted Pastry" />
      </div>

      <div className="offer-details">
        <div className="offer-discount-badge">
          <div className="offer-bubble">
            <div className="offer-text">
              <div className="offer-percent">30%</div>
              <div className="off">Off</div>
            </div>
            <div className="offer-curve bottom"></div>
            <div className="offer-curve bottom second"></div>
          </div>
        </div>
        <h1>SPECIAL OFFER</h1>
        
        <div className="offer-countdown">
          {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
            <div key={unit} className="block">
              <div className="number">{timeLeft[unit]}</div>
              <div className="label">
                {unit.charAt(0).toUpperCase() + unit.slice(1)}
              </div>
            </div>
          ))}
        </div>

        
        <h3>Coming Soon!</h3>
        <button>DISCOVER NOW</button>
      </div>
    </div>
  );
};

export default SpecialOfferBanner;
