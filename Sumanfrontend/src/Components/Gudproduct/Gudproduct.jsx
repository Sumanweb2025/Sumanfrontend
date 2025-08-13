import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Gudproduct.css';
import WishlistPopup from '../../Components/WishlistPopup/WishlistPopup';
import CartPopup from '../../Components/CartPopup/CartPopup';

const API_URL = 'http://localhost:8000';

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

  const navigate = useNavigate();

  // API endpoints
  const API_ENDPOINTS = {
    sweets: `${API_URL}/api/products/search?category=sweets`,
    snacks: `${API_URL}/api/products/search?category=sweets`
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
      console.log(`${category} API Response:`, data);

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

        // Fetch wishlist and cart if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Fetch wishlist
            const wishlistResponse = await axios.get(`${API_URL}/api/wishlist`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const wishlistData = wishlistResponse.data?.data || wishlistResponse.data;
            setWishlistItems(wishlistData.products?.map(item => item.productId._id || item.productId) || []);

            // Fetch cart
            const cartResponse = await axios.get(`${API_URL}/api/cart`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const cartData = cartResponse.data?.data || cartResponse.data;
            setCartItems(cartData.items || []);
          } catch (userDataError) {
            console.log('Wishlist/Cart not loaded:', userDataError);
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
  const handleWishlistClick = async (product, e) => {
    e?.stopPropagation();
    if (!product || wishlistLoading) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add items to your wishlist');
      return;
    }

    setWishlistLoading(true);
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const productId = product.product_id || product._id || product.id;
      const isInWishlist = wishlistItems.includes(productId);

      if (isInWishlist) {
        await axios.delete(`${API_URL}/api/wishlist/${productId}`, config);
        setWishlistItems(prev => prev.filter(id => id !== productId));

        // Dispatch custom event to update header count
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      } else {
        await axios.post(`${API_URL}/api/wishlist`, { productId }, config);
        setWishlistItems(prev => [...prev, productId]);

        // Dispatch custom event to update header count
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));

        // Show wishlist popup
        setSelectedProduct(product);
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
  const handleAddToCart = async (product, e) => {
    e?.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to your cart');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const productId = product.product_id || product._id || product.id;
      await axios.post(`${API_URL}/api/cart`, { productId, quantity: 1 }, config);

      // Update cart items
      const cartResponse = await axios.get(`${API_URL}/api/cart`, config);
      const cartData = cartResponse.data?.data || cartResponse.data;
      setCartItems(cartData.items || []);

      // Dispatch custom event to update header count
      window.dispatchEvent(new CustomEvent('cartUpdated'));

      // Show cart popup
      setSelectedProduct(product);
      setShowCartPopup(true);
    } catch (err) {
      console.error('Add to cart error:', err);
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  // Handle add to cart from wishlist popup
  const handleAddToCartFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.post(`${API_URL}/api/cart`, { productId, quantity: 1 }, config);

      // Update cart items
      const cartResponse = await axios.get(`${API_URL}/api/cart`, config);
      const cartData = cartResponse.data?.data || cartResponse.data;
      setCartItems(cartData.items || []);

      // Dispatch custom event to update header count
      window.dispatchEvent(new CustomEvent('cartUpdated'));

      return true;
    } catch (err) {
      console.error('Add to cart error:', err);
      throw err;
    }
  };

  // Handle product click
  const handleProductClick = (productId) => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
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
    console.log('Shop now clicked for category:', activeCategory);
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
      <div className="loading-container">
        <div className="loading-spinner"></div>
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
                    onClick={() => handleProductClick(productId)}
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
                        onClick={(e) => handleWishlistClick(product, e)}
                        disabled={wishlistLoading}
                        title={wishlistItems.includes(productId) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        {wishlistLoading ? '⏳' : (wishlistItems.includes(productId) ? '❤️' : '♡')}
                      </button>

                      <div className="gud-product-info">
                        <h3 className="gud-product-name">{product.name}</h3>
                        <span className="price-text text-animate gud-product-price">${(product.price || 0).toFixed(2)}</span>

                        <div className="product-footer">
                          <button
                            className="gudproduct-add-to-cart-btn"
                            onClick={(e) => handleAddToCart(product, e)}
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
          <div className="featured-cards">
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
          </div>
        </div>
        {/* Newsletter Section */}
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
            <div className="newsletter-form">
              <div className="newsletter-input-container">
                <span className="newsletter-email-icon">📧</span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                />
              </div>
              <button className="newsletter-btn">SUBSCRIBE</button>
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