import React, { useState, useEffect } from 'react';
import './Testimonial.css';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sample testimonials data - you can replace this with your actual data
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      location: "Chennai",
      rating: 5,
      comment: "Amazing quality rice! The taste is authentic and reminds me of my grandmother's cooking. Fast delivery too!",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      location: "Coimbatore", 
      rating: 5,
      comment: "Best rice I've ever purchased online. The packaging was excellent and the rice quality is top-notch. Highly recommended!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Meera Devi",
      location: "Madurai",
      rating: 4,
      comment: "Traditional taste with modern convenience. The rice cooks perfectly every time. My family loves it!",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Arjun Patel",
      location: "Salem",
      rating: 5,
      comment: "Exceptional service and product quality. The rice has that authentic South Indian taste we were looking for.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
    },
    {
      id: 5,
      name: "Lakshmi Iyer",
      location: "Trichy",
      rating: 5,
      comment: "Perfect rice for our daily meals. The quality is consistent and the taste is amazing. Will definitely order again!",
      image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=80&h=80&fit=crop&crop=face"
    }
  ];

  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePrev = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleDotClick = (index) => {
    if (!isAnimating && index !== currentIndex) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsAnimating(false);
      }, 300);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span 
        key={index} 
        className={`star ${index < rating ? 'filled' : ''}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">What Our Customers Say</h2>
          <p className="testimonials-subtitle">Real reviews from real customers</p>
        </div>

        <div className="testimonials-content">
          <button 
            className="nav-button prev-button" 
            onClick={handlePrev}
            disabled={isAnimating}
          >
            &#8249;
          </button>

          <div className="testimonial-card-container">
            <div className={`testimonial-card ${isAnimating ? 'fade-out' : 'fade-in'}`}>
              <div className="testimonial-content">
                <div className="quote-icon">"</div>
                <p className="testimonial-text">{testimonials[currentIndex].comment}</p>
                <div className="testimonial-rating">
                  {renderStars(testimonials[currentIndex].rating)}
                </div>
              </div>
              <div className="testimonial-author">
                <img 
                  src={testimonials[currentIndex].image} 
                  alt={testimonials[currentIndex].name}
                  className="author-image"
                />
                <div className="author-info">
                  <h4 className="author-name">{testimonials[currentIndex].name}</h4>
                  <p className="author-location">{testimonials[currentIndex].location}</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            className="nav-button next-button" 
            onClick={handleNext}
            disabled={isAnimating}
          >
            &#8250;
          </button>
        </div>

        <div className="testimonials-pagination">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`pagination-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              disabled={isAnimating}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;