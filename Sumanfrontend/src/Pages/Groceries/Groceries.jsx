import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Groceries.css'; // reuse the same styles
import Header from '../../Components/Header/Header';
import Footer from "../../Components/Footer/Footer";

const GroceriesPage = ({ addToCart, onFilterChange, activeFilters }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);

  const API_URL = 'http://localhost:5000/';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await axios.get(`${API_URL}api/products/search?category=Groceries`);
        const productsData = productsResponse.data?.data || productsResponse.data?.products || productsResponse.data;
        setProducts(productsData);

        const token = localStorage.getItem('token');
        if (token) {
          try {
            const wishlistResponse = await axios.get(`${API_URL}/api/wishlist`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            const wishlistData = wishlistResponse.data?.data || wishlistResponse.data;
            setWishlistItems(wishlistData.map(item => item.product_id || item.productId));
          } catch (wishlistError) {
            console.log('Wishlist not loaded', wishlistError);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  useEffect(() => {
    let result = [...products];

    if (activeFilters?.brand) {
      result = result.filter(product =>
        product.brand?.toLowerCase() === activeFilters.brand.toLowerCase()
      );
    }

    if (activeFilters?.category) {
      result = result.filter(product =>
        product.category?.toLowerCase() === activeFilters.category.toLowerCase()
      );
    }

    if (searchTerm.trim()) {
      const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);

      result = result.filter(product => {
        const productFields = [
          product.name?.toLowerCase() || '',
          product.brand?.toLowerCase() || '',
          product.category?.toLowerCase() || '',
          product.description?.toLowerCase() || '',
          product.tags?.join(' ')?.toLowerCase() || ''
        ].join(' ');

        return searchTerms.every(term =>
          productFields.includes(term)
        );
      });
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, activeFilters, searchTerm]);

  const clearFilter = (type) => {
    const newFilters = { ...activeFilters, [type]: '' };
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearAllFilters = () => {
    if (onFilterChange) {
      onFilterChange({ brand: '', category: '' });
    }
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleWishlistClick = async (productId) => {
    if (!productId || wishlistLoading) return;

    setWishlistLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to your wishlist');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const isInWishlist = wishlistItems.includes(productId);

      if (isInWishlist) {
        await axios.delete(`${API_URL}/api/wishlist/${productId}`, config);
        setWishlistItems(prev => prev.filter(id => id !== productId));
      } else {
        await axios.post(`${API_URL}/api/wishlist`, { productId }, config);
        setWishlistItems(prev => [...prev, productId]);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      alert(err.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to your cart');
        return;
      }

      await addToCart(product);
      alert(`${product.name} added to cart!`);
    } catch (err) {
      console.error('Add to cart error:', err);
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) return <div className="loading">Loading Groceries...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <>
      <Header />
      <div className="gro-products-container">
        <h1>Welcome to the Suman Food!</h1>
        <h2>Groceries</h2>

        {(activeFilters?.brand || activeFilters?.category) && (
          <div className="gre-active-filters">
            <h3>Active Filters:</h3>
            {activeFilters.brand && (
              <span className="gre-filter-tag">
                Brand: {activeFilters.brand}
                <button onClick={() => clearFilter('brand')} className="clear-filter">×</button>
              </span>
            )}
            {activeFilters.category && (
              <span className="gre-filter-tag">
                Category: {activeFilters.category}
                <button onClick={() => clearFilter('category')} className="clear-filter">×</button>
              </span>
            )}
            <button className="gre-clear-all-filters" onClick={clearAllFilters}>Clear All</button>
          </div>
        )}

        <div className="gre-search-container">
          <input
            type="text"
            placeholder="Search groceries by name, brand or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="gre-search-input"
          />
          {searchTerm && (
            <button className="gre-clear-search" onClick={handleClearSearch}>Clear</button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty">No groceries found</div>
        ) : (
          <>
            <div className="gre-products-grid">
              {currentProducts.map((product) => (

                <div key={product.product_id || product.id} className="gre-product-card">
                  <div className="gre-product-image-container">

                    <img
                      src={product.imageUrl || `${API_URL}/uploads/${product.image}`}
                      alt={product.name}
                      className="gre-product-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300';
                        e.target.onerror = null;
                      }}
                    />
                  </div>

                  <div className="gre-product-details">
                    <h2 className="gre-product-name">{product.name}</h2>
                    <div className="gre-product-brand">{product.brand}</div>
                    <div className="gre-product-category">{product.category}</div>
                    <div className="gre-product-price">₹{product.price}</div>
                    {product.piece && <div className="gre-product-piece">{product.piece} pieces</div>}


                    <div className="gre-product-rating">
                      {Array(5).fill().map((_, i) => (
                        <span key={i} className={i < Math.floor(product.rating || 0) ? 'gre-star-filled' : 'gre-star-empty'}>
                          ★
                        </span>
                      ))}
                      <span>({product.rating?.toFixed(1) || '0.0'})</span>
                    </div>

                    <p className="gre-product-description">
                      {product.description?.length > 100
                        ? `${product.description.substring(0, 100)}...`
                        : product.description}
                    </p>

                    <div className="gre-product-actions">
                      <button className="gre-add-to-cart" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                      <button
                        className={`gre-wishlist ${wishlistItems.includes(product.product_id || product.id) ? 'active' : ''}`}
                        onClick={() => handleWishlistClick(product.product_id || product.id)}
                        disabled={wishlistLoading}
                      >
                        {wishlistItems.includes(product.product_id || product.id) ? '❤️' : '♡'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="gre-pagination-dots">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`gre-dot ${currentPage === i + 1 ? 'gre-active' : ''}`}
                    onClick={() => paginate(i + 1)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default GroceriesPage;
