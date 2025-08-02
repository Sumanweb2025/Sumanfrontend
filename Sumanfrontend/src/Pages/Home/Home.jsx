import { useState, useEffect } from 'react';
import Header from '../../Components/Header/Header';
import homeheader from '../../assets/homeheader.png';
import image2 from '../../assets/image2.jpg';
import Product from '../../Components/Product/Product';
import Oruproduct from '../../Components/Ourproduct/Ourproduct';
import Ourproduct1 from "../../Components/Ourproduct1/Ourproduct1";
import GutProduct from '../../Components/Gudproduct/Gudproduct';
import Offer from '../../Components/Offer/Offer';
import Banner from '../../Components/ShippingBanner/ShippingBanner';
import Testimonials from '../../Components/Testimonials/Testimonial'; 
import Footer from '../../Components/Footer/Footer';
import './Home.css';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const Home = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      // Simulate API/data loading
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000); // 1 second loading delay
  
      return () => clearTimeout(timer);
    }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <><LoadingSpinner 
              isLoading={loading} 
              brandName="Iyappaa Foods" 
              loadingText="Loading our site..."
              progressColor="#3b82f6"
            />
      
        <Header />
        <div className='home-container'>
        <div className={`ad-section ${visible ? 'show' : ''}`}>
          <div className="ad-left">
            <h3 className="ad-title">Hot & Special</h3>
            <h2 className="ad-subtext">
              UNLEASH YOUR <span className="highlight-text">TASTE BUDS!</span>
            </h2>
            <p className='ad-description'>Where every grain of rice tells a story of tradition and joy</p>
          </div>
          <div className="ad-right">
            <img src={homeheader} alt="Delicious Dish" className="ad-main-img" />
          </div>
        </div>


      </div>
      <Oruproduct />
      <Product />
      <Ourproduct1 />
      <Offer />
      <GutProduct />
      <Testimonials />
      <Banner />
      <Footer />
    </>
  );
};

export default Home;
