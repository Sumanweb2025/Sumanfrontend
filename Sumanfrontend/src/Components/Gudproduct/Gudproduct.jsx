import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Gudproduct.css';
import WishlistPopup from '../../Components/WishlistPopup/WishlistPopup';
import CartPopup from '../../Components/CartPopup/CartPopup';

const API_URL = import.meta.env.VITE_APP_API_URL;

const FeaturedProducts = () => {
  const [activeCategory, setActiveCategory] = useState('sweets');
  const [products, setProducts] = useState({
    sweets: [],
    snacks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wishlist and Cart states
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Popup states
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();

  // API endpoints
  const API_ENDPOINTS = {
    sweets: `${API_URL}api/products/search?category=sweets`,
    snacks: `${API_URL}api/products/search?category=snacks`
  };

  // Show newsletter message
  const showNewsletterMessage = (type, text) => {
    setNewsletterMessage({ type, text });
    setTimeout(() => setNewsletterMessage({ type: '', text: '' }), 5000);
  };

  // Newsletter subscription handler
  const handleNewsletterSubscription = async (e) => {
    e?.preventDefault();

    if (!newsletterEmail) {
      showNewsletterMessage('error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      showNewsletterMessage('error', 'Please enter a valid email address');
      return;
    }

    setNewsletterLoading(true);

    try {
      // Get user token if available
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add auth header if user is logged in
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Prepare subscription data
      const subscriptionData = {
        email: newsletterEmail,
        subscriptionType: 'newsletter',
        source: 'website',
        preferences: {
          emailNotifications: true,
          promotionalEmails: true,
          weeklyDigest: true,
          smsNotifications: false
        }
      };

      // If user is logged in, we can add more details
      if (token) {
        try {
          // Try to get user info for more personalized subscription
          const userResponse = await axios.get(`${API_URL}api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (userResponse.data && userResponse.data.name) {
            subscriptionData.name = userResponse.data.name;
          }
          if (userResponse.data && userResponse.data.phone) {
            subscriptionData.phone = userResponse.data.phone;
          }
        } catch (userError) {
          console.log('Could not fetch user details:', userError);
          // Continue without user details
        }
      }

      // Make subscription API call
      const response = await axios.post(`${API_URL}api/subscription/subscribe`, subscriptionData, {
        headers
      });

      if (response.data) {
        showNewsletterMessage('success', 'Successfully subscribed! Check your email for verification. 🎉');
        setNewsletterEmail('');

        // Optional: Track subscription event
        if (window.gtag) {
          window.gtag('event', 'newsletter_subscription', {
            event_category: 'engagement',
            event_label: 'newsletter_signup'
          });
        }
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);

      let errorMessage = 'Failed to subscribe. Please try again.';

      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400) {
          const errorData = error.response.data;
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.errors && errorData.errors.length > 0) {
            errorMessage = errorData.errors[0].msg;
          }
        } else if (error.response.status === 409) {
          errorMessage = 'You are already subscribed to our newsletter!';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }

      showNewsletterMessage('error', errorMessage);
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Handle Enter key press in newsletter input
  const handleNewsletterKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNewsletterSubscription(e);
    }
  };

  // Fetch products from backend
  const fetchProducts = async (category) => {
    try {
      const response = await fetch(API_ENDPOINTS[category], {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${category}: ${response.status}`);
      }

      const data = await response.json();

      if (data.products) {
        return data.products;
      } else if (Array.isArray(data)) {
        return data;
      } else if (data.data) {
        return data.data;
      } else if (data.results) {
        return data.results;
      } else {
        return [];
      }
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
      throw error;
    }
  };

  // Load products and user data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch both categories in parallel
        const [sweetsData, snacksData] = await Promise.all([
          fetchProducts('sweets'),
          fetchProducts('snacks')
        ]);

        setProducts({
          sweets: sweetsData || [],
          snacks: snacksData || []
        });

        // NEW: Fetch wishlist and cart for both logged-in and guest users
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        const sessionId = localStorage.getItem('guestSessionId');

        if (token) {
          // Logged-in user
          try {
            const wishlistResponse = await axios.get(`${API_URL}api/wishlist`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const wishlistData = wishlistResponse.data?.data || wishlistResponse.data;
            setWishlistItems(wishlistData.products?.map(item => item.productId._id || item.productId) || []);

            const cartResponse = await axios.get(`${API_URL}api/cart`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const cartData = cartResponse.data?.data || cartResponse.data;
            setCartItems(cartData.items || []);
          } catch (userDataError) {
            console.log('User data not loaded:', userDataError);
            setWishlistItems([]);
            setCartItems([]);
          }
        } else if (userType === 'guest' && sessionId) {
          // Guest user
          try {
            const wishlistResponse = await axios.get(`${API_URL}api/wishlist`, {
              headers: { 'X-Session-ID': sessionId }
            });
            const wishlistData = wishlistResponse.data?.data || wishlistResponse.data;
            setWishlistItems(wishlistData.products?.map(item => item.productId._id || item.productId) || []);

            const cartResponse = await axios.get(`${API_URL}api/cart`, {
              headers: { 'X-Session-ID': sessionId }
            });
            const cartData = cartResponse.data?.data || cartResponse.data;
            setCartItems(cartData.items || []);
          } catch (guestDataError) {
            console.log('Guest data not loaded:', guestDataError);
            setWishlistItems([]);
            setCartItems([]);
          }
        }
      } catch (error) {
        setError(`Failed to load products: ${error.message}`);
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Handle wishlist click
  const handleWishlistClick = async (e, product) => {
    e.stopPropagation();
    if (!product || wishlistLoading) return;

    const headers = {};
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    let sessionId = localStorage.getItem('guestSessionId');

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (userType === 'guest' && sessionId) {
      headers['X-Session-ID'] = sessionId;
    } else {
      // Not logged in and not guest - prompt user
      if (window.confirm('Add to wishlist as guest or sign in to save permanently. Click OK to sign in, Cancel for guest mode.')) {
        localStorage.setItem('returnUrl', window.location.pathname);
        navigate('/signin');
        return;
      } else {
        // Create guest session
        sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userType', 'guest');
        localStorage.setItem('guestSessionId', sessionId);
        headers['X-Session-ID'] = sessionId;
      }
    }

    setWishlistLoading(true);
    try {
      const config = { headers };
      const productId = product._id?.$oid || product._id || product.product_id || product.id;
      const isInWishlist = wishlistItems.includes(productId);

      if (isInWishlist) {
        await axios.delete(`${API_URL}api/wishlist/${productId}`, config);
        setWishlistItems(prev => prev.filter(id => id !== productId));
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      } else {
        await axios.post(`${API_URL}api/wishlist`, { productId }, config);
        setWishlistItems(prev => [...prev, productId]);
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
        // Pass product data to popup
        const productForPopup = {
          ...product,
          product_id: productId,
          _id: productId
        };
        setSelectedProduct(productForPopup);
        setShowWishlistPopup(true);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      alert(err.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  // Handle add to cart
  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    if (!product) return;

    const headers = {};
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    let sessionId = localStorage.getItem('guestSessionId');

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (userType === 'guest' && sessionId) {
      headers['X-Session-ID'] = sessionId;
    } else {
      // Not logged in and not guest - prompt user
      if (window.confirm('Add to cart as guest or sign in for exclusive offers. Click OK to sign in, Cancel for guest mode.')) {
        localStorage.setItem('returnUrl', window.location.pathname);
        navigate('/signin');
        return;
      } else {
        // Create guest session
        sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userType', 'guest');
        localStorage.setItem('guestSessionId', sessionId);
        headers['X-Session-ID'] = sessionId;
      }
    }

    try {
      const config = { headers };
      const productId = product._id?.$oid || product._id || product.product_id || product.id;

      await axios.post(`${API_URL}api/cart`, { productId, quantity: 1 }, config);

      const cartResponse = await axios.get(`${API_URL}api/cart`, config);
      const cartData = cartResponse.data?.data || cartResponse.data;
      setCartItems(cartData.items || []);

      window.dispatchEvent(new CustomEvent('cartUpdated'));
      // Preserve product ID for popup
      const productForPopup = {
        ...product,
        product_id: productId,
        _id: productId
      };
      setSelectedProduct(productForPopup);
      setShowCartPopup(true);
    } catch (err) {
      console.error('Add to cart error:', err);
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  // Handle add to cart from wishlist popup
  const handleAddToCartFromWishlist = async (productId) => {
    try {
      const headers = {};
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('guestSessionId');

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      } else {
        throw new Error('No session available');
      }

      const config = { headers };
      await axios.post(`${API_URL}api/cart`, { productId, quantity: 1 }, config);

      const cartResponse = await axios.get(`${API_URL}api/cart`, config);
      const cartData = cartResponse.data?.data || cartResponse.data;
      setCartItems(cartData.items || []);

      window.dispatchEvent(new CustomEvent('cartUpdated'));
      return true;
    } catch (err) {
      console.error('Add to cart error:', err);
      throw err;
    }
  };

  // Handle product click
  const handleProductClick = (product) => {
    if (!product) return;

    // Show loading spinner when navigating to product details
    setLoading(true);

    // Small delay to show the loading spinner before navigation
    setTimeout(() => {
      const productId = product._id?.$oid || product._id || product.product_id;

      navigate(`/product/${productId}`, {
        state: {
          product,
          productName: product.name,
        }
      });
    }, 1000);
  };

  // Popup handlers
  const handleContinueShopping = () => {
    setShowWishlistPopup(false);
    setShowCartPopup(false);
    setSelectedProduct(null);
  };

  const handleOpenWishlistPage = () => {
    setShowWishlistPopup(false);
    navigate('/wishlist');
  };

  const handleViewCart = () => {
    setShowCartPopup(false);
    navigate('/cart');
  };

  // Handle shop now click
  const handleShopNow = () => {
    // console.log('Shop now clicked for category:', activeCategory);
    if (activeCategory === 'sweets') {
      navigate('/sweets');
    } else if (activeCategory === 'snacks') {
      navigate('/snacks');
    }
  };

  const currentProducts = products[activeCategory] || [];
  const displayProducts = currentProducts.slice(0, 6);

  if (loading) {
    return (
      <div className="gud-product-loading-container">
        <div className="gud-product-loading-spinner"></div>
        <p>Loading special products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="special-today-section">
        <div className="gud-container">
          {/* Header */}
          <div className="gud-section-header">
            <h3 className="sub-title text-center text-animate section-subtitle">Our Products</h3>
            <h1 className="section-title text-animate text-center gud-section-title">What Special Today</h1>
            <div className="gud-divider"></div>
          </div>

          {/* Category Tabs */}
          <div className="category-tabs">
            <button
              className={`tab-button ${activeCategory === 'sweets' ? 'active' : ''}`}
              onClick={() => setActiveCategory('sweets')}
            >
              SWEETS
            </button>
            <button
              className={`tab-button ${activeCategory === 'snacks' ? 'active' : ''}`}
              onClick={() => setActiveCategory('snacks')}
            >
              SNACKS
            </button>
          </div>

          {/* Products Grid */}
          <div className="gud-products-grid">
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => {
                const productId = product._id?.$oid || product._id || product.product_id;
                if (!productId) return null;

                return (
                  <div
                    key={productId}
                    className="gud-product-card"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="gud-product-image-card">
                      <img
                        src={product.imageUrl || `${API_URL}/images/Products/${product.image}` || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300';
                          e.target.onerror = null;
                        }}
                      />

                      {/* Wishlist heart */}
                      <button
                        className={`wishlist-heart ${wishlistItems.includes(productId) ? 'active' : ''}`}
                        onClick={(e) => handleWishlistClick(e, product)}
                        disabled={wishlistLoading}
                        title={wishlistItems.includes(productId) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        {wishlistLoading ? '⏳' : (wishlistItems.includes(productId) ? '❤️' : '♡')}
                      </button>

                      <div className="gud-product-info">
                        <h3 className="gud-product-name">{product.name}</h3>
                        {/* <span className="price-text text-animate gud-product-price">${(product.price || 0).toFixed(2)}</span> */}

                        <div className="product-footer">
                          <button
                            className="gudproduct-add-to-cart-btn"
                            onClick={(e) => handleAddToCart(e, product)}
                            title="Add to Cart"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-products">
                <p>No {activeCategory} products available at the moment.</p>
              </div>
            )}
          </div>

          {/* Shop Now Button */}
          {displayProducts.length > 0 && (
            <div className="shop-now-container">
              <button className="button-text shop-now-btn" onClick={handleShopNow}>
                SHOP NOW
              </button>
            </div>
          )}

          {/* Featured Cards */}
          {/* <div className="featured-cards">
            <div className="feature-card delicious-sweets">
              <div className="feature-card-content">
                <span className="feature-card-tag">Today's HeartBeat</span>
                <h2 className="card-title text-animate feature-card-title">DELICIOUS SWEETS</h2>
                <p className="body-text feature-card-description">The best options of the day in your town</p>
                <button className="button-text feature-card-button" onClick={() => navigate('/sweets')}>
                  SHOP NOW
                </button>
              </div>
            </div>

            <div className="feature-card grocery">
              <div className="feature-card-content">
                <span className="feature-card-tag">Healthy & Delicious</span>
                <h2 className="card-title text-animate feature-card-title">GROCERY</h2>
                <p className="body-text feature-card-description">This weekend only</p>
                <button className="button-text feature-card-button" onClick={() => navigate('/groceries')}>
                  SHOP NOW
                </button>
              </div>
            </div>

            <div className="feature-card grab-snacks">
              <div className="feature-card-content">
                <h2 className="card-title text-animate feature-card-title">GRAB YOUR SNACKS</h2>
                <button className="button-text feature-card-button special" onClick={() => navigate('/snacks')}>
                  SHOP NOW
                </button>
              </div>
            </div>
          </div> */}
        </div>

        {/* Enhanced Newsletter Section */}
        <div className="newsletter-section">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3 className="small-text text-animate newsletter-title">$20 discount for your first order</h3>
              <h2 className="sub-title text-animate newsletter-subtitle">Join our newsletter and get...</h2>
              <p className="body-text newsletter-description">
                Join our email subscription now to get updates on
                promotions and coupons.
              </p>
            </div>

            {/* Add this wrapper div */}
            <div className="newsletter-form-wrapper">
              <div className="newsletter-form">
                {/* Newsletter Message */}
                {newsletterMessage.text && (
                  <div className={`newsletter-message ${newsletterMessage.type === 'success' ? 'success' : 'error'}`}>
                    {newsletterMessage.text}
                  </div>
                )}

                <div className="newsletter-input-container">
                  <span className="newsletter-email-icon">📧</span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="newsletter-input"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    onKeyPress={handleNewsletterKeyPress}
                    disabled={newsletterLoading}
                  />
                </div>
                <button
                  className={`newsletter-btn ${newsletterLoading ? 'loading' : ''}`}
                  onClick={handleNewsletterSubscription}
                  disabled={newsletterLoading}
                >
                  {newsletterLoading ? (
                    <>
                      <span className="newsletter-spinner"></span>
                      SUBSCRIBING...
                    </>
                  ) : (
                    'SUBSCRIBE'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wishlist Popup */}
      <WishlistPopup
        isOpen={showWishlistPopup}
        onClose={() => setShowWishlistPopup(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCartFromWishlist}
        onContinueShopping={handleContinueShopping}
        onOpenWishlistPage={handleOpenWishlistPage}
      />

      {/* Cart Popup */}
      <CartPopup
        isOpen={showCartPopup}
        onClose={() => setShowCartPopup(false)}
        product={selectedProduct}
        cartItems={cartItems}
        onContinueShopping={handleContinueShopping}
        onViewCart={handleViewCart}
      />
    </>
  );
};

export default FeaturedProducts;