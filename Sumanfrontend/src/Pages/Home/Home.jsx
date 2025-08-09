import { useState, useEffect } from 'react';
import Header from '../../Components/Header/Header';
import homeheader from '../../assets/homeheader.png';

import Product from '../../Components/Product/Product';
import Oruproduct from '../../Components/Ourproduct/Ourproduct';
import Ourproduct1 from "../../Components/Ourproduct1/Ourproduct1";
import GutProduct from '../../Components/Gudproduct/Gudproduct';
import Offer from '../../Components/Offer/Offer';
import Banner from '../../Components/ShippingBanner/ShippingBanner';
import Testimonials from '../../Components/Testimonials/Testimonial'; 
import Footer from '../../Components/Footer/Footer';
import './Home.css';

const Home = () => {
  const [visible, setVisible] = useState(false);
  const [textAnimated, setTextAnimated] = useState(false);
  const [imageAnimated, setImageAnimated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector('.ad-section');
      if (section) {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        
        if (isVisible && !visible) {
          setVisible(true);
          
          // Staggered animation - text first, then image
          setTimeout(() => setTextAnimated(true), 100);
          setTimeout(() => setImageAnimated(true), 400);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // for initial load
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visible]);

  // Reset animations when component unmounts or reloads
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!visible) {
        setTextAnimated(false);
        setImageAnimated(false);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <>
      <div className="home-container">
        <Header />

        {/* Parallax Wrapper */}
        <div className="parallax-bg">
           <div class="animated-line"></div>
          <div className={`ad-section ${visible ? 'show' : ''}`}>
            <div className={`ad-left ${textAnimated ? 'text-animated' : ''}`}>
              <h3 className="ad-title">Hot & Special</h3>
              <h2 className="ad-subtext">
                UNLEASH YOUR <span className="highlight-text">TASTE BUDS!</span>
              </h2>
              <p className="ad-description">
                Where every grain of rice tells a story of tradition and joy
              </p>
            </div>
            <div className={`ad-right ${imageAnimated ? 'image-animated' : ''}`}>
              <img src={homeheader} alt="Delicious Dish" className="ad-main-img" />
            </div>
          </div>
        </div>
      </div>

      <Oruproduct />
      <Product />
      {/* <Ourproduct1 /> */}
      <Offer />
      <GutProduct />
      <Testimonials />
      <Banner />
      <Footer />
    </>
  );
};

export default Home;