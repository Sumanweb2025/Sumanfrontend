import React, { useEffect, useRef, useState } from 'react';
import './Ourproduct1.css';

const ProductDiscovery = () => {
  const imageRefs = useRef([]);
  const textRef = useRef(null);
  const buttonsRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    setTimeout(() => setIsLoaded(true), 200);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    if (textRef.current) observer.observe(textRef.current);
    if (buttonsRef.current) observer.observe(buttonsRef.current);

    return () => {
      imageRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
      if (textRef.current) observer.unobserve(textRef.current);
      if (buttonsRef.current) observer.unobserve(buttonsRef.current);
    };
  }, []);

  const images = [
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'
  ];

  return (
    <div className="discovery-container">
      <div className="discovery-content">
        <div className="discovery-text">
          <div 
            ref={textRef}
            className={`text-content ${isLoaded ? 'loaded' : ''}`}
          >
            <h2 className="discovery-title">Discover Our Products</h2>
            <h3 className="discovery-subtitle">Craving something sweets & Snacks? We've got you covered</h3>
            <p className="discovery-description">
              Indulge your sweet tooth with our irresistible selection of treats! Whether you're looking for a quick snack or a special dessert to brighten your day, we've got the perfect sweet for every craving.
            </p>
          </div>
          <div 
            ref={buttonsRef}
            className={`discovery-buttons ${isLoaded ? 'loaded' : ''}`}
          >
            <button className="discovery-btn primary btn-animate">
              <span className="btn-text">View Our Menu</span>
              <div className="btn-ripple"></div>
            </button>
            <button className="discovery-btn secondary btn-animate">
              <span className="btn-text">View Products</span>
              <div className="btn-ripple"></div>
            </button>
          </div>
        </div>
        <div className="discovery-image-grid">
          {images.map((img, index) => (
            <div
              key={index}
              ref={(el) => (imageRefs.current[index] = el)}
              className={`discovery-image-container ${index % 2 === 0 ? 'left-image' : 'right-image'} image-container`}
              style={{ transitionDelay: `${1.2 + index * 0.15}s` }}
            >
              <div className="image-wrapper">
                <img src={img} alt={`Product ${index + 1}`} className="discovery-image" />
                <div className="image-overlay"></div>
                <div className="image-glow"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Decorative elements like iyappaa site */}
      <div className="decorative-element-1"></div>
      <div className="decorative-element-2"></div>
    </div>
  );
};

export default ProductDiscovery;