import { useState, useEffect } from 'react';
import Header from '../../Components/Header/Header';
import image1 from '../../assets/image1.jpg';
import image2 from '../../assets/image2.jpg';
import Product from '../../Components/Product/Product';
import './Home.css';

const Home = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <div>
        <Header />
        <div className={`ad-section ${visible ? 'show' : ''}`}>
          <div className="ad-text">
            <h1>🔥 Hot & Special</h1>
            <h2>UNLEASH YOUR TASTE BUDS!</h2>
            <p>Where every grain of rice tells a story of tradition and joy</p>
            <span className="ad-badge">Organic Ingredients · Ready in 30 min</span>
          </div>
          <div className="ad-images">
            <img src={image1} alt="Palada Payasam Bowl" className="ad-img" />
            <img src={image2} alt="Product Box" className="ad-img" />
          </div>
        </div>
        
      </div>
      <Product/>
    </>
  );
};

export default Home;
