import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Wishlist.css';
import Header from '../../Components/Header/Header';
import Footer from "../../Components/Footer/Footer";
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [addingToCart, setAddingToCart] = useState(new Set());

  const API_URL = 'http://localhost:8000';

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

      const response = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const wishlistData = response.data?.data || response.data;
      console.log('Wishlist API Response:', wishlistData); // Debug log
      
      setWishlistItems(wishlistData.products || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err.response?.data?.message || 'Failed to load wishlist');
      setLoading(false);
      
      // If authentication error, redirect to signin
      if (err.response?.status === 401) {
        navigate('/signin');
      }
    }
  };

  // Enhanced image URL helper function
  const getImageUrl = (product) => {
    console.log('Getting image URL for product:', product); // Debug log
    
    if (product.imageUrl) {
      return product.imageUrl;
    }
    
    if (product.image) {
      // Try the Products path first (matches your Product Controller)
      return `${API_URL}/images/Products/${product.image}`;
    }
    
    // Fallback: placeholder
    return 'https://via.placeholder.com/300x300?text=No+Image';
  };

  const handleRemoveFromWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setRemovingItems(prev => new Set(prev).add(productId));

    try {
      await axios.delete(`${API_URL}/api/wishlist/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setWishlistItems(prev =>
        prev.filter(item => (item.productId._id || item.productId) !== productId)
      );

      // Dispatch custom event to update header count
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      
      toast.success('Item removed from wishlist! 🗑️', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      toast.error('Failed to remove item from wishlist! ❌', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
      toast.error('Please login to add items to cart! 🔐', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const productId = product._id || product.product_id || product.id;
    setAddingToCart(prev => new Set(prev).add(productId));

    try {
      // Add to cart
      await axios.post(`${API_URL}/api/cart`,
        { productId, quantity: 1 },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Remove from wishlist after successful cart addition
      await axios.delete(`${API_URL}/api/wishlist/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Update local state to remove the product from wishlist
      setWishlistItems(prev =>
        prev.filter(item => (item.productId._id || item.productId || item._id) !== productId)
      );

      // Dispatch custom events to update header counts
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));

      toast.success(`🛒 ${product.name} added to cart!`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error(err.response?.data?.message || 'Failed to add to cart! ❌', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleProductClick = (product) => {
    const productData = product.productId || product;
    navigate(`/product/${productData.product_id || productData._id}`, {
      state: { product: productData }
    });
  };

  const handleContinueShopping = () => {
    navigate('/sweets');
  };

  // Debug logging
  useEffect(() => {
    console.log('Wishlist items state:', wishlistItems);
    wishlistItems.forEach((item, index) => {
      const product = item.productId || item;
      console.log(`Wishlist item ${index}:`, {
        product,
        imageUrl: product.imageUrl,
        image: product.image,
        constructedUrl: getImageUrl(product)
      });
    });
  }, [wishlistItems]);

  return (
    <>
      <LoadingSpinner
        isLoading={loading}
        brandName="Wishlist details"
        loadingText="Loading your wishlist..."
        progressColor="#3b82f6"
      />
      <Header />
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          fontSize: '14px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      />
      
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

          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
              <button onClick={fetchWishlist}>Retry</button>
            </div>
          )}

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
                  const isAddingToCart = addingToCart.has(productId);
                  const imageUrl = getImageUrl(product);

                  return (
                    <div key={productId} className={`wishlist-item ${isRemoving || isAddingToCart ? 'processing' : ''}`}>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveFromWishlist(productId)}
                        disabled={isRemoving || isAddingToCart}
                        title="Remove from wishlist"
                      >
                        {isRemoving ? '⏳' : '×'}
                      </button>

                      <div
                        className="product-image-container"
                        onClick={() => handleProductClick(product)}
                      >
                        <img
                          src={imageUrl}
                          alt={product.name || 'Product'}
                          className="product-image"
                          onError={(e) => {
                            console.log('Image failed to load:', e.target.src);
                            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                            e.target.onerror = null;
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', imageUrl);
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

                        <div className="product-price">${product.price}</div>
                        
                        {product.piece && (
                          <div className="product-piece">{product.piece} pieces</div>
                        )}

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
                          disabled={isAddingToCart || isRemoving}
                        >
                          {isAddingToCart ? (
                            <>
                              <span className="loading-spinner">⏳</span>
                              Adding to Cart...
                            </>
                          ) : (
                            'Add to Cart'
                          )}
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