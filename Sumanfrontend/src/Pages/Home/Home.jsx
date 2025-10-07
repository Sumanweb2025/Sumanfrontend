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
import GuestWelcomeModal from '../../Components/GuestPopup/GuestPopup'; // NEW
import './Home.css';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';
import homeheader1 from '../../assets/iyappa home header1.png';
import homeheader2 from '../../assets/Amirth home header.png';
import homeheader3 from '../../assets/venba home header.png';
import homeheader4 from '../../assets/little krishna home header.png';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [showGuestModal, setShowGuestModal] = useState(false); // NEW
  
  // Background images array
  const carouselImages = [
    { url: homeheader1 },
    { url: homeheader2 },
    { url: homeheader3 },
    { url: homeheader4 }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      
      // NEW: Check if user has seen the modal and is not logged in
      const hasSeenModal = localStorage.getItem('hasSeenGuestModal');
      const token = localStorage.getItem('token');
      
      if (!hasSeenModal && !token) {
        // Show modal after 1 second delay
        setTimeout(() => {
          setShowGuestModal(true);
        }, 1000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // NEW: Handle guest modal actions
  const handleContinueAsGuest = () => {
    localStorage.setItem('hasSeenGuestModal', 'true');
    localStorage.setItem('userType', 'guest');
    
    // Generate and store session ID for guest
    const sessionId = generateSessionId();
    localStorage.setItem('guestSessionId', sessionId);
    
    setShowGuestModal(false);
  };

  const handleCloseGuestModal = () => {
    localStorage.setItem('hasSeenGuestModal', 'true');
    setShowGuestModal(false);
  };

  // NEW: Generate unique session ID for guest users
  const generateSessionId = () => {
    return 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Auto slide functionality
  useEffect(() => {
    let slideInterval;
    let progressInterval;

    const startSlideshow = () => {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 0;
          return prev + 2;
        });
      }, 100);

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

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setProgress(0);
    setIsAutoPlaying(false);
    
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

  const handleDotClick = (index) => {
    goToSlide(index);
  };

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
        brandName="Iyappaa Sweets" 
        loadingText="Loading our site..."
        progressColor="#3b82f6"
      />

      {/* NEW: Guest Welcome Modal */}
      <GuestWelcomeModal
        isOpen={showGuestModal}
        onClose={handleCloseGuestModal}
        onContinueAsGuest={handleContinueAsGuest}
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
                />
              ))}
            </div>

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

            <div className="carousel-pagination">
              {carouselImages.map((_, index) => (
                <div
                  key={index}
                  className={`pagination-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => handleDotClick(index)}
                />
              ))}
            </div>

            <div className="carousel-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <Oruproduct />
      <Product />
      <Offer />
      <GutProduct />
      <Testimonials />
      <Banner />
      <Footer />
    </>
  );
};

export default Home;