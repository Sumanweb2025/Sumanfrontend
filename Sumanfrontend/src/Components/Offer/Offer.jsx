import React from 'react';
import './Offer.css'; // Move styles to external CSS file

const SpecialOfferBanner = () => {
  return (
    <div className="offer-banner">
      <div className="image-section">
        <img src="/images/donut.png" alt="Donut" />
        <img src="/images/twist.png" alt="Twisted Pastry" />
      </div>

      <div className="offer-details">
        <div className="discount-badge">
      <div className="bubble">
        <div className="text">
          <div className="percent">30%</div>
          <div className="off">Off</div>
        </div>
        <div className="curve bottom"></div>
        <div className="curve bottom second"></div>
      </div>
    </div>
        <h1>SPECIAL OFFER</h1>
        <h3>Comming Soon!</h3>
        <button>DISCOVER NOW</button>
      </div>
    </div>
  );
};

export default SpecialOfferBanner;
