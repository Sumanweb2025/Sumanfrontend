import { useState, useEffect } from 'react';
import Header from '../../Components/Header/Header';

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
import homeheader1 from '../../assets/iyappa home header1.png';
import homeheader2 from '../../assets/Amirth home header.png';
import homeheader3 from '../../assets/venba home header.png';
import homeheader4 from '../../assets/little krishna home header.png';

const Home = () => {
  const [loading, setLoading] = useState(true);
  
  // Background images array - Your local assets
  const carouselImages = [
    {
      url: homeheader1,
    },
    {
      url: homeheader2,
    },
    {
      url: homeheader3,
    },
    {
      url: homeheader4,
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  useEffect(() => {
    // Simulate API/data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Auto slide functionality
  useEffect(() => {
    let slideInterval;
    let progressInterval;

    const startSlideshow = () => {
      // Progress bar animation
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            return 0;
          }
          return prev + 2; // Increase by 2% every 100ms (5000ms total)
        });
      }, 100);

      // Slide change
      slideInterval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % carouselImages.length);
        setProgress(0);
      }, 5000);
    };

    const stopSlideshow = () => {
      if (slideInterval) clearInterval(slideInterval);
      if (progressInterval) clearInterval(progressInterval);
    };

    if (isAutoPlaying && !loading) {
      startSlideshow();
    } else {
      stopSlideshow();
    }

    return () => {
      stopSlideshow();
    };
  }, [isAutoPlaying, loading, carouselImages.length]);

  // Handle manual navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
    setProgress(0);
    setIsAutoPlaying(false);
    
    // Resume autoplay after 3 seconds
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 3000);
  };

  const nextSlide = () => {
    const next = (currentSlide + 1) % carouselImages.length;
    goToSlide(next);
  };

  const prevSlide = () => {
    const prev = currentSlide === 0 ? carouselImages.length - 1 : currentSlide - 1;
    goToSlide(prev);
  };

  // Handle dot click
  const handleDotClick = (index) => {
    goToSlide(index);
  };

  // Pause on hover
  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  return (
    <>
      <LoadingSpinner 
        isLoading={loading} 
        brandName="Iyappaa Foods" 
        loadingText="Loading our site..."
        progressColor="#3b82f6"
      />
      <div className="home-container">
        <Header />

        {/* Image Carousel Section */}
        <div 
          className="image-carousel-section"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="carousel-container">
            {/* Carousel Slides */}
            <div className="carousel-slides">
              {carouselImages.map((image, index) => (
                <div
                  key={index}
                  className={`carousel-slide ${
                    index === currentSlide 
                      ? 'active' 
                      : index === currentSlide - 1 || (currentSlide === 0 && index === carouselImages.length - 1)
                        ? 'prev'
                        : 'next'
                  }`}
                  style={{ backgroundImage: `url(${image.url})` }}
                >
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button 
              className="carousel-nav carousel-nav-prev"
              onClick={prevSlide}
              aria-label="Previous image"
            >
              <svg viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>

            <button 
              className="carousel-nav carousel-nav-next"
              onClick={nextSlide}
              aria-label="Next image"
            >
              <svg viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>

            {/* Pagination Dots */}
            <div className="carousel-pagination">
              {carouselImages.map((_, index) => (
                <div
                  key={index}
                  className={`pagination-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => handleDotClick(index)}
                />
              ))}
            </div>

            {/* Progress Bar */}
            <div className="carousel-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
              ></div>
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