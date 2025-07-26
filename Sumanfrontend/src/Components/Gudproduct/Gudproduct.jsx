import React from 'react';
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

const ProductPage = () => (
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
      {products.map(product => (
        <ProductCard key={product.name} product={product} />
      ))}
    </section>

    <footer>
      <button className="get-shop-button">SHOP NOW</button>
    </footer>
  </div>
);

export default ProductPage;
