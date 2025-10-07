import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Wishlist.css';
import Header from '../../Components/Header/Header';
import Banner from '../../Components/ShippingBanner/ShippingBanner';
import Footer from "../../Components/Footer/Footer";
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [addingToCart, setAddingToCart] = useState(new Set());

  const [isGuest, setIsGuest] = useState(false);
const [guestSessionId, setGuestSessionId] = useState(null);


  const API_URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  const sessionId = localStorage.getItem('guestSessionId');
  
  if (token) {
    setIsGuest(false);
    fetchWishlist(token, null);
  } else if (userType === 'guest' && sessionId) {
    setIsGuest(true);
    setGuestSessionId(sessionId);
    fetchWishlist(null, sessionId);
  } else {
    // No token and no guest session - redirect to home
    navigate('/');
  }
}, []);

  const fetchWishlist = async (token = null, sessionId = null) => {
  try {
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    } else {
      navigate('/');
      return;
    }

    const response = await axios.get(`${API_URL}api/wishlist`, { headers });

    const wishlistData = response.data?.data || response.data;
    setWishlistItems(wishlistData.products || []);
    setLoading(false);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    setError(err.response?.data?.message || 'Failed to load wishlist');
    setLoading(false);
    
    if (err.response?.status === 401 && !sessionId) {
      navigate('/signin');
    }
  }
};

  const getImageUrl = (product) => {
    if (product.imageUrl) {
      return product.imageUrl;
    }
    
    if (product.image) {
      return `${API_URL}/images/Products/${product.image}`;
    }
    
    return 'https://via.placeholder.com/300x300?text=No+Image';
  };

  const handleRemoveFromWishlist = async (productId) => {
  const headers = {};
  const token = localStorage.getItem('token');
  const sessionId = localStorage.getItem('guestSessionId');
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (sessionId) {
    headers['X-Session-ID'] = sessionId;
  } else {
    return;
  }

  setRemovingItems(prev => new Set(prev).add(productId));

  try {
    await axios.delete(`${API_URL}api/wishlist/${productId}`, { headers });

    setWishlistItems(prev =>
      prev.filter(item => (item.productId._id || item.productId) !== productId)
    );

    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    
    toast.success('Item removed from wishlist! 🗑️', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    toast.error('Failed to remove item from wishlist! ❌', {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: true,
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
  const headers = {};
  const token = localStorage.getItem('token');
  const sessionId = localStorage.getItem('guestSessionId');
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (sessionId) {
    headers['X-Session-ID'] = sessionId;
  } else {
    // Prompt to sign in or continue as guest
    if (window.confirm('Sign in to save your cart. Click OK to sign in, or Cancel to continue as guest.')) {
      localStorage.setItem('returnUrl', '/wishlist');
      navigate('/signin');
    } else {
      // Generate guest session
      const newSessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userType', 'guest');
      localStorage.setItem('guestSessionId', newSessionId);
      headers['X-Session-ID'] = newSessionId;
    }
  }

  const productId = product._id || product.product_id || product.id;
  setAddingToCart(prev => new Set(prev).add(productId));

  try {
    // Add to cart
    await axios.post(`${API_URL}api/cart`,
      { productId, quantity: 1 },
      { headers }
    );

    // Remove from wishlist after successful cart addition
    await axios.delete(`${API_URL}api/wishlist/${productId}`, { headers });

    setWishlistItems(prev =>
      prev.filter(item => (item.productId._id || item.productId || item._id) !== productId)
    );

    window.dispatchEvent(new CustomEvent('cartUpdated'));
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    
    toast.success(`🛒 ${product.name} added to cart!`, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    toast.error(err.response?.data?.message || 'Failed to add to cart! ❌', {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: true,
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
    navigate(`/product/${productData.product_id || productData._id}`);
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  return (
    <>
      <LoadingSpinner
        isLoading={loading}
        brandName="Wishlist details"
        loadingText="Loading your wishlist..."
        progressColor="#3b82f6"
      />
      <Header />
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="breadcrumb">
            <span className='small-text text-animate' onClick={() => navigate('/')}>Home</span> /
            <span className="small-text text-animate current">Wishlist</span>
          </div>

          <div className="wishlist-header">
            <h1 className='main-title text-animate '>MY LIST</h1>
            <p className='sub-title text-animate'>There are {wishlistItems.length} product{wishlistItems.length !== 1 ? 's' : ''} in your My List</p>
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
                className="wishlist-continue-shopping-btn"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="wishlist-table">
              <div className="wishlist-table-header">
                <div className="header-product">Product</div>
                <div className="header-price">Unit Price</div>
                <div className="header-action">Remove</div>
              </div>
              
              <div className="wishlist-items">
                {wishlistItems.map((item) => {
                  const product = item.productId || item;
                  const productId = product._id || product.id;
                  const isRemoving = removingItems.has(productId);
                  const isAddingToCart = addingToCart.has(productId);
                  const imageUrl = getImageUrl(product);

                  return (
                    <div key={productId} className={`wishlist-item ${isRemoving ? 'processing' : ''}`}>
                      <div className="wishlist-item-product" onClick={() => handleProductClick(product)}>
                        <div className="wishlist-product-image-container">
                          <img
                            src={imageUrl}
                            alt={product.name || 'Product'}
                            className="wishlist-product-image"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                              e.target.onerror = null;
                            }}
                          />
                        </div>
                        <div className="wishlist-product-details">
                          <h3 className="wishlist-product-name">{product.name}</h3>
                          <div className="wishlist-product-rating">
                            {Array(5).fill().map((_, i) => (
                              <span
                                key={i}
                                className={i < Math.floor(product.rating || 0) ? 'star-filled' : 'star-empty'}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="price-text wishlist-item-price">
                        ${product.price}
                      </div>
                      
                      <div className="wishlist-item-actions">
                        <button
                          className="button-text wishlist-add-to-cart-btn"
                          onClick={() => handleAddToCart(product)}
                          disabled={isAddingToCart || isRemoving}
                        >
                          {isAddingToCart ? (
                            <>
                              <span className="wishlist-loading-spinner">⏳</span>
                              Adding to Cart...
                            </>
                          ) : (
                            'Add to Cart'
                          )}
                        </button>
                        <button
                          className="wishlist-remove-btn"
                          onClick={() => handleRemoveFromWishlist(productId)}
                          disabled={isRemoving || isAddingToCart}
                          title="Remove from wishlist"
                        >
                          {isRemoving ? '⏳' : '×'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <Banner />
      <Footer />
    </>
  );
};

export default WishlistPage;