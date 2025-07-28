import React, { useState } from 'react';
import sweetsImage from '../../assets/candy.png';
import groceryImage from '../../assets/image8.png';
import snacksImage from '../../assets/image7.jpg';
import './Gudproduct.css';

const products = [
  {
    name: 'Achu Munuku',
    price: '$20.00',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    name: 'Delelous Burfi',
    price: '$20.00',
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    name: 'SESAME BLACK BALL 80G',
    price: '$20.00',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    name: 'SESAME WHITE BALL 80G',
    price: '$20.00',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    name: 'Peanut Balls 100G',
    price: '$20.00',
    image: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    name: 'Peanut Halwa 150G',
    price: '$20.00',
    image: 'https://images.unsplash.com/photo-1607478900771-4f50e7eec937?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  }
];

const ProductCard = ({ product }) => (
  <div className="get-product-card">
    <img src={product.image} alt={product.name} />
    <h3>{product.name}</h3>
    <p>{product.price}</p>
  </div>
);

const ProductPage = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    console.log('Subscribed with email:', email);
    setSubscribed(true);
  };

  return (
    <div className="get-product-page">
      <header>
        <h1>Our Products</h1>
        <h2>What Special Today</h2>
        <div className="get-category-toggle">
          <button className="get-active">Sweets</button>
          <button>Snacks</button>
        </div>
      </header>

      <section className="get-product-list">
        {products.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
      </section>

      <footer>
        <button className="get-shop-button">SHOP NOW</button>
      </footer>

      <div className="deal-cards-container">
        <div className="deal-card sweets">
          <p className="tagline">Today’s Best Deal</p>
          <h2 className="title">DELICIOUS SWEETS</h2>
          <p className="subtitle">The best options of the day in your town</p>
          <button>SHOP NOW</button>
          <img src={sweetsImage} alt="Sweets" className="deal-image" />
        </div>

        <div className="deal-card grocery">
          <p className="tagline">Healthy & Delicious</p>
          <h2 className="title">GROCERY</h2>
          <p className="subtitle">This weekend only</p>
          <button>SHOP NOW</button>
          <img src={groceryImage} alt="Grocery" className="deal-image" />
        </div>

        <div className="deal-card snacks">
          <h2 className="title">GRAB YOUR SNACKS</h2>
          <p className="subtitle">Super Delicious</p>
          <button>SHOP NOW</button>
          <img src={snacksImage} alt="Snacks" className="deal-image" />
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="newsletter-container">
        <div className="newsletter-left">
          <h2 className="newsletter-heading">Newsletter</h2>
          <p className="newsletter-offer">Get 10% off your order!</p>
          <p className="newsletter-description">
            Enter your email and receive a 10% discount on your next order!
          </p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-button">
              SUBSCRIBE
            </button>
          </form>
          {subscribed && <p className="newsletter-success">🎉 Subscribed successfully!</p>}
        </div>
        <div className="newsletter-right">
          <img src="/images/vegetables.png" alt="Vegetables" className="newsletter-image" />
          <img src="/images/ladoos.png" alt="Ladoos" className="newsletter-image" />
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
