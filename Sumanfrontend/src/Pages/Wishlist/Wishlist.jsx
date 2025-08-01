import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Wishlist.css';
import Header from '../../Components/Header/Header';
import Footer from "../../Components/Footer/Footer";

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItems, setRemovingItems] = useState(new Set());

  const API_URL = 'http://localhost:8000/';

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await axios.get(`${API_URL}api/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const wishlistData = response.data?.data || response.data;
      setWishlistItems(wishlistData.products || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err.response?.data?.message || 'Failed to load wishlist');
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setRemovingItems(prev => new Set(prev).add(productId));

    try {
      await axios.delete(`${API_URL}api/wishlist/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setWishlistItems(prev => 
        prev.filter(item => (item.productId._id || item.productId) !== productId)
      );

      // Dispatch custom event to update header count
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Failed to remove item from wishlist');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      const productId = product._id || product.product_id || product.id;
      await axios.post(`${API_URL}api/cart`, 
        { productId, quantity: 1 }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Dispatch custom event to update header count
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      alert('Product added to cart successfully!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleProductClick = (product) => {
    const productData = product.productId || product;
    navigate(`/product/${productData.product_id || productData._id}`, { 
      state: { product: productData } 
    });
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  if (loading) return (
    <>
      <Header />
      <div className="wishlist-page">
        <div className="loading">Loading your wishlist...</div>
      </div>
      <Footer />
    </>
  );

  if (error) return (
    <>
      <Header />
      <div className="wishlist-page">
        <div className="error">Error: {error}</div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <div className="wishlist-page">
        <div className="wishlist-container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span onClick={() => navigate('/')}>Home</span> / 
            <span className="current">Wishlist</span>
          </div>

          <div className="wishlist-header">
            <h1>My Wishlist</h1>
            <p>{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</p>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="empty-wishlist">
              <div className="empty-icon">💝</div>
              <h2>Your wishlist is empty</h2>
              <p>Add items you love to your wishlist. Review them anytime and easily move them to your cart.</p>
              <button 
                className="continue-shopping-btn"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="wishlist-grid">
                {wishlistItems.map((item) => {
                  const product = item.productId || item;
                  const productId = product._id || product.id;
                  const isRemoving = removingItems.has(productId);
                  
                  return (
                    <div key={productId} className={`wishlist-item ${isRemoving ? 'removing' : ''}`}>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveFromWishlist(productId)}
                        disabled={isRemoving}
                        title="Remove from wishlist"
                      >
                        {isRemoving ? '⏳' : '×'}
                      </button>

                      <div 
                        className="product-image-container"
                        onClick={() => handleProductClick(product)}
                      >
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

                      <div className="product-details">
                        <h3 
                          className="product-name"
                          onClick={() => handleProductClick(product)}
                        >
                          {product.name}
                        </h3>
                        
                        {product.brand && (
                          <p className="product-brand">{product.brand}</p>
                        )}
                        
                        {product.category && (
                          <p className="product-category">{product.category}</p>
                        )}

                        <div className="product-rating">
                          {Array(5).fill().map((_, i) => (
                            <span 
                              key={i} 
                              className={i < Math.floor(product.rating || 0) ? 'star-filled' : 'star-empty'}
                            >
                              ★
                            </span>
                          ))}
                          <span className="rating-text">({product.rating?.toFixed(1) || '0.0'})</span>
                        </div>

                        <div className="product-price">₹{product.price}</div>

                        {product.description && (
                          <p className="product-description">
                            {product.description.length > 100 
                              ? `${product.description.substring(0, 100)}...` 
                              : product.description
                            }
                          </p>
                        )}

                        <button 
                          className="add-to-cart-btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="wishlist-actions">
                <button 
                  className="continue-shopping-btn"
                  onClick={handleContinueShopping}
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WishlistPage;