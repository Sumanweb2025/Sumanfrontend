import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Iyyapa.css';
import Header from '../Header/Header';
import Banner from '../ShippingBanner/ShippingBanner';
import iyappabanner from "../../assets/iyappabanner1.png";
import iyappabanner1 from "../../assets/iyappabanner2.jpg";
import Footer from "../Footer/Footer";
import WishlistPopup from '../WishlistPopup/WishlistPopup';
import CartPopup from '../CartPopup/CartPopup';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const ProductListingPage = ({ addToCart, onFilterChange, activeFilters }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(9);
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Popup states
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const [selectedVariants, setSelectedVariants] = useState({}); // Track selected variant for each product

  // Add ref for scroll target
  const mainContentRef = useRef(null);

  const API_URL = import.meta.env.VITE_APP_API_URL;

  // Carousel images for hero section
  const carouselImages = [iyappabanner,iyappabanner1];

  // Get unique categories for filters
  const uniqueCategories = [...new Set(products.map(product => product.category).filter(Boolean))];

  // Carousel auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCarouselIndex(prev => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const groupProductsByName = (productsData) => {
    const grouped = {};

    productsData.forEach(product => {
      const productName = product.name || product.Name;

      if (!grouped[productName]) {
        // Create group with first product as base
        grouped[productName] = {
          ...product,
          variants: [],
          minPrice: product.price || 0,
          hasMultipleVariants: false
        };
      }

      // Add variant to group
      grouped[productName].variants.push({
        productId: product.product_id || product.id,
        gram: product.gram || product.Gram,
        price: product.price || 0,
        piece: product.piece || product.Piece
      });

      // Update minimum price for display
      if ((product.price || 0) < grouped[productName].minPrice) {
        grouped[productName].minPrice = product.price || 0;
        grouped[productName].price = product.price || 0; // Update display price
      }
    });

    // Convert to array and mark multiple variants
    const groupedArray = Object.values(grouped).map(product => {
      product.hasMultipleVariants = product.variants.length > 1;
      return product;
    });

    return groupedArray;
  };

  // Add helper function to get selected variant for a product:
  const getSelectedVariant = (product) => {
    const productKey = product.name;
    return selectedVariants[productKey] || 0; // Default to first variant
  };

  // Add function to handle variant selection:
  const handleVariantSelect = (product, variantIndex, e) => {
    e.stopPropagation(); // Prevent card click
    const productKey = product.name;
    setSelectedVariants(prev => ({
      ...prev,
      [productKey]: variantIndex
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await axios.get(`${API_URL}api/products/search?brand=Iyappaa`);
        const productsData = productsResponse.data?.data || productsResponse.data?.products || productsResponse.data;

        // Group products by name
        const groupedProducts = groupProductsByName(productsData);
        setProducts(groupedProducts);

        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Fetch wishlist
            const wishlistResponse = await axios.get(`${API_URL}api/wishlist`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const wishlistData = wishlistResponse.data?.data || wishlistResponse.data;
            setWishlistItems(wishlistData.products?.map(item => item.productId._id || item.productId) || []);

            // Fetch cart
            const cartResponse = await axios.get(`${API_URL}api/cart`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const cartData = cartResponse.data?.data || cartResponse.data;
            setCartItems(cartData.items || []);
          } catch (wishlistError) {
            console.log('Wishlist/Cart not loaded', wishlistError);
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

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(product => selectedCategories.includes(product.category));
    }

    // Price range filter
    result = result.filter(product => {
      const price = product.price || 0; // Treat missing price as 0
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Search filter
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

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, selectedCategories, priceRange, searchTerm, sortBy]);

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCategoryClick = (category) => {
    setSelectedCategories([category]);
    setSearchTerm('');
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setSearchTerm('');
    setSortBy('default');
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Modified paginate function with scroll
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    
    // Scroll to top of main content area
    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    } else {
      // Fallback - scroll to top of page
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }
  };

  const handleProductClick = (product) => {
    setLoading(true);
    setTimeout(() => {
      const selectedIndex = getSelectedVariant(product);
      const selectedVariant = product.variants[selectedIndex] || product.variants[0];

      // Use selected variant's product ID for navigation
      const productId = selectedVariant.productId;

      navigate(`/product/${productId}`, {
        state: {
          product,
          productName: product.name,
          variants: product.variants,
          isGrouped: product.hasMultipleVariants,
          selectedVariantId: selectedVariant.productId
        }
      });
    }, 1000);
  };

  const handleWishlistClick = async (e, product) => {
    e.stopPropagation();
    if (!product || wishlistLoading) return;

    const token = localStorage.getItem('token');
    if (!token) {
     // Store current page URL for redirect after login
      const currentUrl = window.location.pathname + window.location.search;
      localStorage.setItem('returnUrl', currentUrl);
      
      // Show alert and redirect to sign-in page
      if (window.confirm('Please log in to add items to your wishlist.')) {
        navigate('/signin');
      }
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
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

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

  const handleAddToCart = async (e, productData) => {
    e.stopPropagation(); // Prevent card click
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Store current page URL for redirect after login
        const currentUrl = window.location.pathname + window.location.search;
        localStorage.setItem('returnUrl', currentUrl);
        
        // Show alert and redirect to sign-in page
        if (window.confirm('Please log in to add items to your cart.')) {
          navigate('/signin');
        }
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Use the specific variant's product ID
      const productId = productData.productId || productData.product_id || productData._id || productData.id;
      await axios.post(`${API_URL}api/cart`, { productId, quantity: 1 }, config);

      // Update cart items
      const cartResponse = await axios.get(`${API_URL}api/cart`, config);
      const cartData = cartResponse.data?.data || cartResponse.data;
      setCartItems(cartData.items || []);

      // Dispatch custom event to update header count
      window.dispatchEvent(new CustomEvent('cartUpdated'));

      // Show cart popup with the specific variant
      setSelectedProduct(productData);
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

  const handlePrevCarousel = () => {
    setCurrentCarouselIndex(prev =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  };

  const handleNextCarousel = () => {
    setCurrentCarouselIndex(prev => (prev + 1) % carouselImages.length);
  };

  return (
    <>
      <LoadingSpinner
        isLoading={loading}
        brandName="Iyappaa Foods"
        loadingText="Loading Iyappaa products..."
        progressColor="#4CAF50"
      />
      <Header />
      <div className="iyyapa-page">
        {/* Hero Carousel Section */}
        <div className="iyyapa-hero-carousel">
          <div className="iyyapa-carousel-container">
            <div className="iyyapa-carousel-wrapper" style={{ transform: `translateX(-${currentCarouselIndex * (100 / 3)}%)` }}>
              {carouselImages.map((image, index) => (
                <div key={index} className="iyyapa-carousel-slide">
                  <img src={image} alt={`Iyyapa Foods ${index + 1}`} />
                  <div className="iyyapa-carousel-overlay">
                    <div className="iyyapa-carousel-content">
                      <h1 className="iyyapa-carousel-title">Iyappaa Foods</h1>
                      <p className="iyyapa-carousel-subtitle">Premium Quality Traditional Foods</p>
                      {/* <button className="iyyapa-carousel-cta">Explore Products</button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="iyyapa-carousel-nav prev" onClick={handlePrevCarousel}>
              <span>❮</span>
            </button>
            <button className="iyyapa-carousel-nav next" onClick={handleNextCarousel}>
              <span>❯</span>
            </button>
            <div className="iyyapa-carousel-indicators">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  className={`iyyapa-indicator ${index === currentCarouselIndex ? 'active' : ''}`}
                  onClick={() => setCurrentCarouselIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="iyyapa-container">
          {/* Breadcrumb */}
          <div className="iyyapa-breadcrumb">
  <span 
    className="iyyapa-link" 
    onClick={() => navigate('/')}
    
  >
    Home
  </span> 
  / <span>Brands</span> / <span className="iyyapa-current">Iyappaa</span>
</div>

          {/* Categories Section */}
          <div className="iyyapa-categories-section">
            <h2 className="categories-title">FEATURED CATEGORIES</h2>
            <div className="iyyapa-categories-grid">
              {/* All Products */}
              <div
                className={`iyyapa-category-card ${selectedCategories.length === 0 ? 'active' : ''}`}
                onClick={() => setSelectedCategories([])}
              >
                <div className="iyyapa-category-image">
                  <img src="https://cdn-icons-png.flaticon.com/512/3737/3737726.png" alt="All Products" />
                </div>
                <div className="iyyapa-category-name">All Products</div>
              </div>

              {/* Dynamic Categories */}
              {uniqueCategories.map(category => {
                // Get category image based on category name
                const getCategoryImage = () => {
                  switch (category.toLowerCase()) {
                    case 'sweets':
                      return 'https://cdn-icons-png.flaticon.com/512/3081/3081985.png';
                    case 'groceries':
                      return 'https://cdn-icons-png.flaticon.com/512/884/884039.png';
                    case 'snacks':
                      return 'https://cdn-icons-png.flaticon.com/512/3081/3081863.png';
                    default:
                      return 'https://cdn-icons-png.flaticon.com/512/3737/3737726.png';
                  }
                };

                return (
                  <div
                    key={category}
                    className={`iyyapa-category-card ${selectedCategories.includes(category) ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="iyyapa-category-image">
                      <img src={getCategoryImage()} alt={category} />
                    </div>
                    <div className="iyyapa-category-name">{category}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="iyyapa-page-content">
            {/* Sidebar Filters */}
            <div className="iyyapa-sidebar">
              <div className="iyyapa-filter-section">
                <h3>Quick Listing</h3>
                <div className="iyyapa-search-container">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="iyyapa-search-input"
                  />
                </div>
              </div>

              <div className="iyyapa-filter-section">
                <h3>Categories</h3>
                <div className="iyyapa-filter-options">
                  {uniqueCategories.map(category => (
                    <label key={category} className="iyyapa-filter-option">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                      <span>{category}</span>
                      <span className="count">
                        ({products.filter(p => p.category === category).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="iyyapa-filter-section">
                <h3>Price Range</h3>
                <div className="iyyapa-price-range">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="iyyapa-price-slider"
                  />
                  <div className="iyyapa-price-values">
                    ${priceRange[0]} - ${priceRange[1]}
                  </div>
                </div>
              </div>

              <div className="iyyapa-filter-section">
                <h3>Best Deals</h3>
                <div className="iyyapa-deal-items">
                  {products.slice(0, 3).map(product => (
                    <div key={product.product_id || product.id} className="iyyapa-deal-item">
                      <img
                        src={product.imageUrl || `${API_URL}/uploads/${product.image}`}
                        alt={product.name}
                        className="iyyapa-deal-image"
                      />
                      <div className="iyyapa-deal-info">
                        <div className="iyyapa-deal-name">{product.name}</div>
                        <div className="iyyapa-deal-price">${product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="iyyapa-clear-filters-btn" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>

            {/* Main Content */}
            <div className="iyyapa-main-content" ref={mainContentRef}>
              <div className="iyyapa-page-header">
                <h1 className='main-title text-animate'>Our Products</h1>
                <div className="iyyapa-sort-controls">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="iyyapa-sort-select"
                  >
                    <option value="default">Default Sorting</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>
              </div>

              <div className="iyyapa-results-info">
                Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} results
              </div>

              {filteredProducts.length === 0 ? (
                <div className="empty">No Iyyapa products found matching your criteria</div>
              ) : (
                <>
                  <div className="iyyapa-products-grid">
                    {currentProducts.map((product) => (
                      <div
                        key={product.product_id || product.id}
                        className="iyyapa-product-card"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="iyyapa-product-image-container">
                          <div className="iyyapa-image-wrapper">
                            {/* Primary Image - uses first image in array */}
                            <img
                              src={
                                product.imageUrl ||
                                (product.imageUrls && product.imageUrls[0]) ||
                                (product.image && Array.isArray(product.image) && product.image.length > 0
                                  ? `${API_URL}/images/Products/${product.image[0]}`
                                  : `${API_URL}/images/Products/${product.image}`)
                              }
                              alt={product.name}
                              className="iyyapa-product-image primary-image"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300';
                                e.target.onerror = null;
                              }}
                            />

                            {/* Secondary Image for Hover - uses second image in array */}
                            {(
                              product.secondaryImageUrl ||
                              product.hoverImageUrl ||
                              (product.imageUrls && product.imageUrls.length > 1) ||
                              (product.image && Array.isArray(product.image) && product.image.length > 1)
                            ) && (
                                <img
                                  src={
                                    product.secondaryImageUrl ||
                                    product.hoverImageUrl ||
                                    (product.imageUrls && product.imageUrls[1]) ||
                                    (product.image && Array.isArray(product.image) && product.image.length > 1
                                      ? `${API_URL}/images/Products/${product.image[1]}`
                                      : null)
                                  }
                                  alt={`${product.name} hover view`}
                                  className="iyyapa-product-image secondary-image"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                          </div>
                          <button
                            className={`iyyapa-wishlist-btn ${wishlistItems.includes(product.product_id || product._id || product.id) ? 'active' : ''}`}
                            onClick={(e) => handleWishlistClick(e, product)}
                            disabled={wishlistLoading}
                          >
                            {wishlistItems.includes(product.product_id || product._id || product.id) ? '❤️' : '♡'}
                          </button>

                          {/* Stock Status */}
                          {(() => {
                            const selectedIndex = getSelectedVariant(product);
                            const selectedVariant = product.variants[selectedIndex] || product.variants[0];
                            const stock = selectedVariant.piece || 0;

                            return stock > 0 ? (
                              <div className="iyyapa-stock-badge in-stock">
                                In Stock
                              </div>
                            ) : (
                              <div className="iyyapa-stock-badge out-of-stock">
                                Out of Stock
                              </div>
                            );
                          })()}
                        </div>

                        <div className="iyyapa-product-info">
                          <h3 className="card-title iyyapa-product-name">{product.name}</h3>
                          <div className="iyyapa-product-brand">{product.brand}</div>
                          <div className="iyyapa-product-category">{product.category}</div>

                          <div className="iyyapa-product-rating">
                            {Array(5).fill().map((_, i) => (
                              <span key={i} className={i < Math.floor(product.rating || 0) ? 'star-filled' : 'star-empty'}>
                                ★
                              </span>
                            ))}
                            <span className="iyyapa-rating-text">({product.rating?.toFixed(1) || '0.0'})</span>
                          </div>

                          <div className="price-text iyyapa-product-price">{(() => {
                            const selectedIndex = getSelectedVariant(product);
                            const selectedVariant = product.variants[selectedIndex] || product.variants[0];
                            const price = selectedVariant.price;

                            return price !== undefined && price !== null
                              ? `$${price}`
                              : <span style={{ color: '#999', fontSize: "0.9rem" }}>$0 (Price not fixed)</span>;
                          })()}</div>

                          {/* Gram Variants Display */}
                          {product.hasMultipleVariants ? (
                            <div className="iyyapa-gram-variants">
                              {product.variants.map((variant, index) => {
                                const selectedIndex = getSelectedVariant(product);
                                const isSelected = selectedIndex === index;
                                const isOutOfStock = (variant.piece || 0) <= 0;

                                return (
                                  <button
                                    key={variant.productId}
                                    className={`iyyapa-gram-button ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                                    onClick={(e) => handleVariantSelect(product, index, e)}
                                    disabled={isOutOfStock}
                                  >
                                    {variant.gram}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="iyyapa-single-gram">
                              <span className="iyyapa-gram-display">{product.variants[0]?.gram || 'Standard'}</span>
                            </div>
                          )}

                          {/* Add to Cart Button */}
                          {(() => {
                            const selectedIndex = getSelectedVariant(product);
                            const selectedVariant = product.variants[selectedIndex] || product.variants[0];
                            const stock = selectedVariant.piece || 0;

                            return stock > 0 ? (
                              <button
                                className="iyyapa-add-to-cart-btn"
                                onClick={(e) => handleAddToCart(e, { ...product, ...selectedVariant })}
                              >
                                Add to Cart
                              </button>
                            ) : (
                              <button
                                className="iyyapa-add-to-cart-btn sold-out-btn"
                                disabled
                              >
                                Sold Out
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="iyyapa-pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="iyyapa-pagination-btn"
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          className={`iyyapa-pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                          onClick={() => paginate(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="iyyapa-pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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

      <Banner />
      <Footer />
    </>
  );
};

export default ProductListingPage;