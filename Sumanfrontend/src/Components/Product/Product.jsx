import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Product.css';
import WishlistPopup from '../../Components/WishlistPopup/WishlistPopup';
import CartPopup from '../../Components/CartPopup/CartPopup';

const API_URL = import.meta.env.VITE_APP_API_URL;

const ProductListingPage = ({ addToCart, onFilterChange, activeFilters = {} }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();

  // Popup states
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isAutoPlaying && filteredProducts.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prevSlide => {
          return prevSlide >= filteredProducts.length - 1 ? 0 : prevSlide + 1;
        });
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, filteredProducts.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const productsResponse = await axios.get(`${API_URL}api/products/featured?limit=10`);
        let productsData = [];

        if (productsResponse.data?.data) {
          productsData = productsResponse.data.data;
        } else if (productsResponse.data?.products) {
          productsData = productsResponse.data.products;
        } else if (Array.isArray(productsResponse.data)) {
          productsData = productsResponse.data;
        }

        setProducts(productsData);
        setFilteredProducts(productsData);

        // NEW: Check for both logged-in user and guest
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
          } catch (error) {
            console.log('User data not loaded:', error);
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
          } catch (error) {
            console.log('Guest data not loaded:', error);
            setWishlistItems([]);
            setCartItems([]);
          }
        }

      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSlideChange = (slideIndex) => {
    setCurrentSlide(slideIndex);
    setIsAutoPlaying(false);
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleWishlistClick = async (product, e) => {
    e?.stopPropagation();
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
      const productId = product.product_id || product._id || product.id;
      const isInWishlist = wishlistItems.includes(productId);

      if (isInWishlist) {
        await axios.delete(`${API_URL}api/wishlist/${productId}`, config);
        setWishlistItems(prev => prev.filter(id => id !== productId));
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      } else {
        await axios.post(`${API_URL}api/wishlist`, { productId }, config);
        setWishlistItems(prev => [...prev, productId]);
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
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

  const handleAddToCart = async (product, e) => {
    e?.stopPropagation();

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
      const productId = product.product_id || product._id || product.id;

      await axios.post(`${API_URL}api/cart`, { productId, quantity: 1 }, config);

      const cartResponse = await axios.get(`${API_URL}api/cart`, config);
      const cartData = cartResponse.data?.data || cartResponse.data;
      setCartItems(cartData.items || []);

      window.dispatchEvent(new CustomEvent('cartUpdated'));
      setSelectedProduct(product);
      setShowCartPopup(true);
    } catch (err) {
      console.error('Add to cart error:', err);
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

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

  // CORRECTED: handleProductClick function similar to snacks page
  const handleProductClick = (product, e) => {
    e?.stopPropagation();

    // Get product ID with multiple fallbacks
    const productId = product.product_id || product._id || product.id;


    if (productId) {
      // Navigate with state data like snacks page
      navigate(`/product/${productId}`, {
        state: {
          product,
          productName: product.name,
          isGrouped: false, // Since this is from homepage
          fromCarousel: true // Additional info that it came from homepage carousel
        }
      });
    } else {
      console.error('No valid product ID found:', product);
      alert('Unable to view product details. Product ID not found.');
    }
  };

  const handleViewAllProducts = () => {
    navigate('/sweets');
  };

  const nextSlide = () => {
    setCurrentSlide(prevSlide =>
      prevSlide >= filteredProducts.length - 1 ? 0 : prevSlide + 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevSlide = () => {
    setCurrentSlide(prevSlide =>
      prevSlide <= 0 ? filteredProducts.length - 1 : prevSlide - 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // if (loading) return <div className="iyappaa-loading">Loading products...</div>;
  // if (error) return <div className="iyappaa-error">Error: {error}</div>;

  const currentProduct = filteredProducts[currentSlide];
  const productId = currentProduct?.product_id || currentProduct?._id || currentProduct?.id;

  return (
    <>
      <section className="home-products-section">
        {/* Background decorative elements */}

        <div className="home-bg-leaf iyappaa-leaf-1"></div>
        <div className="home-bg-leaf iyappaa-leaf-2"></div>
        <div className="home-bg-chili iyappaa-chili-1"></div>

        <div className="home-carousel-container">
          <div className="home-section-header">
            <h2 className="section-title text-center text-animate home-main-title">Best Selling</h2>
            <div className="home-divider"></div>
            {/* <h3 className="sub-title text-center  home-sub-title">Products</h3> */}
            {/* <div className="home-divider">-</div> */}

          </div>

          {/* Product Carousel */}
          <div className="home-product-carousel">
            <div className="home-carousel-wrapper">
              <div
                className="home-carousel-slides"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                  transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {filteredProducts.map((product, index) => {
                  const productId = product.product_id || product._id || product.id;
                  if (!productId) return null;

                  return (
                    <div key={productId} className="home-carousel-slide">
                      <div className="home-product-showcase">
                        {/* Left Side - Product Description */}
                        <div className="home-product-info">
                          <div className="small-text text-animate home-product-category">
                            {product.category || 'Traditional Snacks'}
                          </div>
                          <h3 className="card-title text-animate home-product-name">
                            {product.name || 'Unnamed Product'}
                          </h3>
                          <p className="body-text text-animate home-product-description">
                            {product.description || 'A traditional South Indian snack made with authentic ingredients and spices for the perfect taste experience. Rich in flavor and made with love using traditional recipes passed down through generations.'}
                          </p>

                          <div className="home-product-price-section">
                            <span className="price-text home-price">${(product.price || 0).toFixed(2)}</span>
                            {product.originalPrice && (
                              <span className="home-original-price">${product.originalPrice.toFixed(2)}</span>
                            )}
                          </div>

                          <div className="home-product-actions">
                            <button
                              className="button-text home-add-to-cart-btn"
                              onClick={(e) => handleAddToCart(product, e)}
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="m1 1 4 4 14 2-1 7H6"></path>
                              </svg>
                              Add to Cart
                            </button>

                            <button
                              className={`button-text home-wishlist-btn ${wishlistItems.includes(productId) ? 'active' : ''}`}
                              onClick={(e) => handleWishlistClick(product, e)}
                              disabled={wishlistLoading}
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill={wishlistItems.includes(productId) ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                              </svg>
                              {wishlistItems.includes(productId) ? 'Wishlisted' : 'Add to Wishlist'}
                            </button>
                          </div>

                          <button
                            className="home-view-details-btn"
                            onClick={(e) => handleProductClick(product, e)}
                          >
                            View Details →
                          </button>
                        </div>

                        {/* Right Side - Product Image */}
                        <div className="home-product-image-section">
                          <div className="home-image-container">
                            <img
                              src={product.imageUrl || `${API_URL}/images/Products/${product.image}` || 'https://via.placeholder.com/500'}
                              alt={product.name || 'Product image'}
                              className="home-main-product-img"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/500';
                                e.target.onerror = null;
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              className="home-nav-arrow home-prev-arrow"
              onClick={prevSlide}
              disabled={filteredProducts.length <= 1}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>

            <button
              className="home-nav-arrow home-next-arrow"
              onClick={nextSlide}
              disabled={filteredProducts.length <= 1}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,6 15,12 9,18"></polyline>
              </svg>
            </button>
          </div>

          {/* View All Products Button */}
          <div className="home-view-all-section">
            <button
              className="button-text home-view-all-btn"
              onClick={handleViewAllProducts}
            >
              VIEW ALL PRODUCTS
            </button>
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

export default ProductListingPage;