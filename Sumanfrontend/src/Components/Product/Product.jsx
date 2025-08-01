import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Product.css';
import WishlistPopup from '../../Components/WishlistPopup/WishlistPopup';
import CartPopup from '../../Components/CartPopup/CartPopup';

const API_URL = 'http://localhost:8000';

const ProductListingPage = ({ addToCart, onFilterChange, activeFilters = {} }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const productsPerSlide = 4; // Show 4 products per slide
  const navigate = useNavigate();

  // Popup states
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (isAutoPlaying && filteredProducts.length > productsPerSlide) {
      const interval = setInterval(() => {
        setCurrentSlide(prevSlide => {
          const totalSlides = Math.ceil(filteredProducts.length / productsPerSlide);
          return prevSlide >= totalSlides - 1 ? 0 : prevSlide + 1;
        });
      }, 3000); // Change every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, filteredProducts.length, productsPerSlide]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const productsResponse = await axios.get(`${API_URL}/api/products`);
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
          } catch (wishlistError) {
            console.log('Wishlist/Cart not loaded:', wishlistError);
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

  const totalSlides = Math.ceil(filteredProducts.length / productsPerSlide);

  const handleSlideChange = (slideIndex) => {
    setCurrentSlide(slideIndex);
    setIsAutoPlaying(false);
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

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

  const handleProductClick = (productId) => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  if (loading) return <div className="iyappaa-loading">Loading products...</div>;
  if (error) return <div className="iyappaa-error">Error: {error}</div>;

  return (
    <>
      <section className="iyappaa-products-section">
        {/* Background decorative elements */}
        <div className="iyappaa-bg-leaf iyappaa-leaf-1"></div>
        <div className="iyappaa-bg-leaf iyappaa-leaf-2"></div>
        <div className="iyappaa-bg-chili iyappaa-chili-1"></div>
        
        <div className="iyappaa-container">
          <div className="iyappaa-main-layout">
            {/* Left Side - Header and Button */}
            <div className="iyappaa-left-content">
              <div className="iyappaa-section-header">
                <h2 className="iyappaa-main-title">Our Products</h2>
                <h3 className="iyappaa-sub-title">Best selling</h3>
                <div className="iyappaa-divider">-</div>
              </div>
              
              <button 
                className="iyappaa-view-all-btn"
                onClick={handleViewAllProducts}
              >
                VIEW ALL PRODUCTS
              </button>
            </div>

            {/* Right Side - Products Slider */}
            <div className="iyappaa-right-content">
              <div className="iyappaa-products-slider-container">
                <div 
                  className="iyappaa-products-slider"
                  style={{
                    transform: `translateX(-${currentSlide * 100}%)`,
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {Array.from({ length: totalSlides }, (_, slideIndex) => (
                    <div key={slideIndex} className="iyappaa-slide">
                      <div className="iyappaa-products-grid">
                        {filteredProducts
                          .slice(slideIndex * productsPerSlide, (slideIndex + 1) * productsPerSlide)
                          .map((product) => {
                            const productId = product.product_id || product._id || product.id;
                            if (!productId) return null;

                            return (
                              <div
                                key={productId}
                                className="iyappaa-product-item"
                                onClick={() => handleProductClick(productId)}
                              >
                                <div className="iyappaa-product-image-container">
                                  <img
                                    src={product.imageUrl || `${API_URL}/images/Products/${product.image}` || 'https://via.placeholder.com/300'}
                                    alt={product.name || 'Product image'}
                                    className="iyappaa-product-img"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/300';
                                      e.target.onerror = null;
                                    }}
                                  />
                                </div>

                                <div className="iyappaa-product-content">
                                  <h4 className="iyappaa-product-title">
                                    {product.name || 'Unnamed Product'}
                                  </h4>
                                  <p className="iyappaa-product-desc">
                                    {product.description || 'A traditional South Indian snack made with authentic ingredients and spices for the perfect taste experience.'}
                                  </p>
                                  
                                  <div className="iyappaa-product-bottom">
                                    <span className="iyappaa-product-price">₹{product.price || '20'}.00</span>
                                    <button
                                      className="iyappaa-cart-icon-btn"
                                      onClick={(e) => handleAddToCart(product, e)}
                                      title="Add to cart"
                                    >
                                      <svg 
                                        width="18" 
                                        height="18" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                      >
                                        <circle cx="9" cy="21" r="1"></circle>
                                        <circle cx="20" cy="21" r="1"></circle>
                                        <path d="m1 1 4 4 14 2-1 7H6"></path>
                                      </svg>
                                    </button>
                                  </div>
                                </div>

                                {/* Wishlist heart */}
                                <button
                                  className={`iyappaa-wishlist-heart ${wishlistItems.includes(productId) ? 'active' : ''}`}
                                  onClick={(e) => handleWishlistClick(product, e)}
                                  disabled={wishlistLoading}
                                  title={wishlistItems.includes(productId) ? 'Remove from wishlist' : 'Add to wishlist'}
                                >
                                  {wishlistLoading ? '⏳' : (wishlistItems.includes(productId) ? '❤️' : '♡')}
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination dots */}
              {totalSlides > 1 && (
                <div className="iyappaa-pagination-wrapper">
                  {Array.from({ length: totalSlides }, (_, i) => (
                    <button
                      key={i}
                      className={`iyappaa-pagination-dot ${currentSlide === i ? 'active' : ''}`}
                      onClick={() => handleSlideChange(i)}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
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

export default ProductListingPage;