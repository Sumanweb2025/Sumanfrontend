import React, { useEffect, useRef } from 'react';
import './Ourproduct1.css';

const ProductDiscovery = () => {
  const imageRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      imageRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  // Sample Unsplash images (replace with your actual product images)
  const images = [
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  ];

  return (
    <div className="discovery-container">
      <div className="discovery-content">
        <div className="discovery-text">
          <h1 className="discovery-title">Discover Our Products</h1>
          <h2 className="discovery-subtitle">
            Craving something<br />
            sweets & Snacks?<br />
            We've got you covered
          </h2>
          <p className="discovery-description">
            Indulge your sweet tooth with our irresistible selection of treats!<br />
            Whether you're looking for a quick snack or a special dessert to<br />
            brighten your day, we've got the perfect sweet for every craving.
          </p>
          <div className="discovery-buttons">
            <button className="discovery-btn primary">VIEW OUR MENU</button>
            <button className="discovery-btn secondary">View all products</button>
          </div>
        </div>
        
        <div className="discovery-image-grid">
          {images.map((img, index) => (
            <div 
              key={index}
              ref={(el) => (imageRefs.current[index] = el)}
              className={`discovery-image-container ${index % 2 === 0 ? 'left' : 'right'}`}
            >
              <img 
                src={img}
                alt={`Sweet product ${index + 1}`}
                className="discovery-image"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDiscovery;