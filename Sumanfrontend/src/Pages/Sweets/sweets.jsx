import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './sweets.css';
import Header from '../../Components/Header/Header';
import Footer from "../../Components/Footer/Footer";

const SweetsListingPage = ({ addToCart, onFilterChange, activeFilters }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);

  const API_URL = 'http://localhost:8000/';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await axios.get(`${API_URL}api/products/search?category=sweets`);
        const productsData = productsResponse.data?.data || productsResponse.data?.products || productsResponse.data;
        setProducts(productsData);

        const token = localStorage.getItem('token');
        if (token) {
          try {
            const wishlistResponse = await axios.get(`${API_URL}/api/wishlist`, {
              headers: { 'Authorization': `Bearer ${token}` }
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
      result = result.filter(product => product.brand?.toLowerCase() === activeFilters.brand.toLowerCase());
    }
    if (activeFilters?.category) {
      result = result.filter(product => product.category?.toLowerCase() === activeFilters.category.toLowerCase());
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
        return searchTerms.every(term => productFields.includes(term));
      });
    }
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, activeFilters, searchTerm]);

  const clearFilter = (type) => {
    const newFilters = {...activeFilters, [type]: ''};
    if (onFilterChange) onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    if (onFilterChange) onFilterChange({ brand: '', category: '' });
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleClearSearch = () => setSearchTerm('');

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

  if (loading) return <div className="loading">Loading sweets...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <>
      <Header />
      <div className="sweets-container">
        <h1>Welcome to the Suman Food!</h1>
        <h2>Sweets Products</h2>

        {(activeFilters?.brand || activeFilters?.category) && (
          <div className="active-filters">
            <h3>Active Filters:</h3>
            {activeFilters.brand && (
              <span className="filter-tag">
                Brand: {activeFilters.brand}
                <button onClick={() => clearFilter('brand')} className="clear-filter">×</button>
              </span>
            )}
            {activeFilters.category && (
              <span className="filter-tag">
                Category: {activeFilters.category}
                <button onClick={() => clearFilter('category')} className="clear-filter">×</button>
              </span>
            )}
            <button className="clear-all-filters" onClick={clearAllFilters}>Clear All</button>
          </div>
        )}

        <div className="search-container">
          <input
            type="text"
            placeholder="Search sweets by name, brand or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={handleClearSearch}>Clear</button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty">No sweets found matching your criteria</div>
        ) : (
          <>
            <div className="sweets-grid">
              {currentProducts.map((product) => (
                <div key={product.product_id || product.id} className="sweet-product-card">
                  <div className="product-image-container">
                    <img
                      src={product.imageUrl || `${API_URL}/uploads/${product.image}`}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300';
                        e.target.onerror = null;
                      }}
                    />
                  </div>

                  <div className="sweet-product-details">
                    <h2 className="product-name">{product.name}</h2>
                    <div className="product-brand">{product.brand}</div>
                    <div className="product-category">{product.category}</div>
                    <div className="product-price">₹{product.price}</div>
                    {product.piece && <div className="product-piece">{product.piece} pieces</div>}

                    <div className="product-rating">
                      {Array(5).fill().map((_, i) => (
                        <span key={i} className={i < Math.floor(product.rating || 0) ? 'star-filled' : 'star-empty'}>
                          ★
                        </span>
                      ))}
                      <span>({product.rating?.toFixed(1) || '0.0'})</span>
                    </div>

                    <p className="product-description">
                      {product.description?.length > 100
                        ? `${product.description.substring(0, 100)}...`
                        : product.description}
                    </p>

                    <div className="product-actions">
                      <button className="add-to-cart" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                      <button
                        className={`wishlist ${wishlistItems.includes(product.product_id || product.id) ? 'active' : ''}`}
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
              <div className="pagination-dots">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`dot ${currentPage === i + 1 ? 'active' : ''}`}
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

export default SweetsListingPage;
