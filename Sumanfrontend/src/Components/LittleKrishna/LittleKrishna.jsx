import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LittleKrishna.css';
import Header from '../Header/Header';
import Banner from '../ShippingBanner/ShippingBanner';
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
  const [activeOffer, setActiveOffer] = useState(null);
  const API_URL = import.meta.env.VITE_APP_API_URL;

  //'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'

  // Carousel images for hero section
  const carouselImages = [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1980&q=80'
  ];

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

  // Check if product is eligible for offer
  const isProductEligibleForOffer = (productId) => {
    if (!activeOffer) return false;

    // Check if offer is active and within date range
    const now = new Date();
    const startDate = new Date(activeOffer.startDate);
    const endDate = new Date(activeOffer.endDate);

    if (!activeOffer.isActive || now < startDate || now > endDate) {
      return false;
    }

    // Priority 1: Check specific products (HIGHEST PRIORITY)
    if (activeOffer.applicableProducts && activeOffer.applicableProducts.length > 0) {
      // If specific products are selected, ONLY those products get the offer
      const isEligible = activeOffer.applicableProducts.some(p => {
        // Handle both populated objects and IDs
        const offerProductId = typeof p === 'object' ? (p.product_id || p._id) : p;
        // Compare as strings to handle ObjectId vs string comparison
        return String(offerProductId) === String(productId);
      });

      // Debug logging (remove after testing)
      if (productId) {
        console.log(`Checking product ${productId}:`, isEligible);
      }

      return isEligible;
    }

    // Priority 2: Check categories (if no specific products selected)
    if (activeOffer.applicableCategories && activeOffer.applicableCategories.length > 0) {
      // Check if current page category matches offer categories
      return activeOffer.applicableCategories.some(
        cat => cat.toLowerCase() === 'sweets'
      );
    }

    // Priority 3: If NEITHER products NOR categories specified, apply to all
    return true;
  };

  // Calculate discounted price
  const calculateDiscountedPrice = (originalPrice) => {
    if (!activeOffer || !originalPrice) return originalPrice;

    let discountedPrice = originalPrice;

    if (activeOffer.discountType === 'percentage') {
      const discountAmount = (originalPrice * activeOffer.discount) / 100;
      discountedPrice = originalPrice - discountAmount;
    } else if (activeOffer.discountType === 'fixed') {
      discountedPrice = originalPrice - activeOffer.discount;
    }

    return Math.max(0, discountedPrice);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await axios.get(`${API_URL}api/products/search?brand=little krishna`);
        const productsData = productsResponse.data?.data || productsResponse.data?.products || productsResponse.data;

        // Fetch active offer
        try {
          const offerResponse = await axios.get(`${API_URL}api/offers/active`);
          if (offerResponse.data?.success && offerResponse.data?.data) {
            setActiveOffer(offerResponse.data.data);
          }
        } catch (offerError) {
          console.log('No active offer found');
        }

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
    // result = result.filter(product =>
    //   product.price >= priceRange[0] && product.price <= priceRange[1]
    // );

    // New Price range filter
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
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      // Get selected variant info
      const selectedIndex = getSelectedVariant(product);
      const selectedVariant = product.variants[selectedIndex] || product.variants[0];
      const productId = selectedVariant.productId;

      const isInWishlist = wishlistItems.includes(productId);

      if (isInWishlist) {
        await axios.delete(`${API_URL}api/wishlist/${productId}`, config);
        setWishlistItems(prev => prev.filter(id => id !== productId));
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      } else {
        await axios.post(`${API_URL}api/wishlist`, { productId }, config);
        setWishlistItems(prev => [...prev, productId]);
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
        // Pass selected variant data to popup
        const productForPopup = {
          ...product,
          selectedGram: selectedVariant.gram,
          price: selectedVariant.price,
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

  const handleAddToCart = async (e, productData) => {
    e.stopPropagation();

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
      const productId = productData.productId || productData.product_id || productData._id || productData.id;

      await axios.post(`${API_URL}api/cart`, { productId, quantity: 1 }, config);

      // Update cart items
      const cartResponse = await axios.get(`${API_URL}api/cart`, config);
      const cartData = cartResponse.data?.data || cartResponse.data;
      setCartItems(cartData.items || []);

      window.dispatchEvent(new CustomEvent('cartUpdated'));
      // Add selectedGram for popup display
      const productForPopup = {
        ...productData,
        selectedGram: productData.gram || productData.Gram,
        // Ensure product ID fields are preserved (not overridden by variant)
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
        brandName="Little Krishna"
        loadingText="Loading Little Krishna products..."
        progressColor="#4CAF50"
      />
      <Header />
      <div className="little-krishna-page">
        {/* Hero Carousel Section */}
        {/* <div className="little-krishna-hero-carousel">
          <div className="little-krishna-carousel-container">
            <div className="little-krishna-carousel-wrapper" style={{ transform: `translateX(-${currentCarouselIndex * (100 / 3)}%)` }}>
              {carouselImages.map((image, index) => (
                <div key={index} className="little-krishna-carousel-slide">
                  <img src={image} alt={`Little Krishna Foods ${index + 1}`} />
                  <div className="little-krishna-carousel-overlay">
                    <div className="little-krishna-carousel-content">
                      <h1 className="little-krishna-carousel-title">Little Krishna Foods</h1>
                      <p className="little-krishna-carousel-subtitle">Premium Quality Traditional Foods</p>
                      <button className="little-krishna-carousel-cta">Explore Products</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="little-krishna-carousel-nav prev" onClick={handlePrevCarousel}>
              <span>❮</span>
            </button>
            <button className="little-krishna-carousel-nav next" onClick={handleNextCarousel}>
              <span>❯</span>
            </button>
            <div className="little-krishna-carousel-indicators">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  className={`little-krishna-indicator ${index === currentCarouselIndex ? 'active' : ''}`}
                  onClick={() => setCurrentCarouselIndex(index)}
                />
              ))}
            </div>
          </div>
        </div> */}

        <div className="little-krishna-container">
          {/* Breadcrumb */}
          <div className="little-krishna-breadcrumb">
            <span
              className="little-krishna-link"
              onClick={() => navigate('/')}

            >
              Home
            </span>
            / <span>Brands</span> / <span className="little-krishna-current">Little Krishna</span>
          </div>


          {/* Categories Section */}
          <div className="little-krishna-categories-section">
            <h2 className="categories-title">FEATURED CATEGORIES</h2>
            <div className="little-krishna-categories-grid">
              {/* All Products */}
              <div
                className={`little-krishna-category-card ${selectedCategories.length === 0 ? 'active' : ''}`}
                onClick={() => setSelectedCategories([])}
              >
                <div className="little-krishna-category-image">
                  <img src="https://cdn-icons-png.flaticon.com/512/3737/3737726.png" alt="All Products" />
                </div>
                <div className="little-krishna-category-name">All Products</div>
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
                    className={`little-krishna-category-card ${selectedCategories.includes(category) ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="little-krishna-category-image">
                      <img src={getCategoryImage()} alt={category} />
                    </div>
                    <div className="little-krishna-category-name">{category}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="little-krishna-page-content">
            {/* Sidebar Filters */}
            <div className="little-krishna-sidebar">
              <div className="little-krishna-filter-section">
                <h3>Quick Listing</h3>
                <div className="little-krishna-search-container">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="little-krishna-search-input"
                  />
                </div>
              </div>

              <div className="little-krishna-filter-section">
                <h3>Categories</h3>
                <div className="little-krishna-filter-options">
                  {uniqueCategories.map(category => (
                    <label key={category} className="little-krishna-filter-option">
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

              <div className="little-krishna-filter-section">
                <h3>Price Range</h3>
                <div className="little-krishna-price-range">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="little-krishna-price-slider"
                  />
                  <div className="little-krishna-price-values">
                    ${priceRange[0]} - ${priceRange[1]}
                  </div>
                </div>
              </div>

              <div className="little-krishna-filter-section">
                <h3>Best Deals</h3>
                <div className="little-krishna-deal-items">
                  {products.slice(0, 3).map(product => (
                    <div key={product.product_id || product.id} className="little-krishna-deal-item">
                      <img
                        src={product.imageUrl || `${API_URL}/uploads/${product.image}`}
                        alt={product.name}
                        className="little-krishna-deal-image"
                      />
                      <div className="little-krishna-deal-info">
                        <div className="little-krishna-deal-name">{product.name}</div>
                        <div className="little-krishna-deal-price">${product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="little-krishna-clear-filters-btn" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>

            {/* Main Content */}
            <div className="little-krishna-main-content">
              <div className="little-krishna-page-header">
                <h1 className='main-title text-animate'>Our Products</h1>
                <div className="little-krishna-sort-controls">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="little-krishna-sort-select"
                  >
                    <option value="default">Default Sorting</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>
              </div>

              <div className="little-krishna-results-info">
                Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} results
              </div>

              {filteredProducts.length === 0 ? (
                <div className="empty">No Little Krishna products found matching your criteria</div>
              ) : (
                <>
                  <div className="little-krishna-products-grid">
                    {currentProducts.map((product) => (
                      <div
                        key={product.product_id || product.id}
                        className="little-krishna-product-card"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="little-krishna-product-image-container">
                          {/* Offer Badge */}
                          {(() => {
                            const selectedIndex = getSelectedVariant(product);
                            const selectedVariant = product.variants[selectedIndex] || product.variants[0];
                            const hasOffer = isProductEligibleForOffer(selectedVariant.productId);

                            if (hasOffer && activeOffer) {
                              return (
                                <div className="little-krishna-offer-badge">
                                  {activeOffer.discount}{activeOffer.discountType === 'percentage' ? '%' : '$'} OFF
                                </div>
                              );
                            }
                            return null;
                          })()}
                          <div className="little-krishna-image-wrapper">
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
                              className="little-krishna-product-image primary-image"
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
                                  className="little-krishna-product-image secondary-image"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                          </div>
                          <button
                            className={`little-krishna-wishlist-btn ${(() => {
                              const selectedIndex = getSelectedVariant(product);
                              const selectedVariant = product.variants[selectedIndex] || product.variants[0];
                              return wishlistItems.includes(selectedVariant.productId);
                            })() ? 'active' : ''}`}
                            onClick={(e) => handleWishlistClick(e, product)}
                            disabled={wishlistLoading}
                          >
                            {(() => {
                              const selectedIndex = getSelectedVariant(product);
                              const selectedVariant = product.variants[selectedIndex] || product.variants[0];
                              return wishlistItems.includes(selectedVariant.productId) ? '❤️' : '♡';
                            })()}
                          </button>

                          {/* Stock Status */}
                          {(() => {
                            const selectedIndex = getSelectedVariant(product);
                            const selectedVariant = product.variants[selectedIndex] || product.variants[0];
                            const stock = selectedVariant.piece || 0;

                            return stock > 0 ? (
                              <div className="little-krishna-stock-badge in-stock">
                                In Stock
                              </div>
                            ) : (
                              <div className="little-krishna-stock-badge out-of-stock">
                                Out of Stock
                              </div>
                            );
                          })()}
                        </div>

                        <div className="little-krishna-product-info">
                          <h3 className="card-title little-krishna-product-name">{product.name}</h3>
                          <div className="little-krishna-product-brand">{product.brand}</div>
                          <div className="little-krishna-product-category">{product.category}</div>

                          <div className="little-krishna-product-rating">
                            {Array(5).fill().map((_, i) => (
                              <span key={i} className={i < Math.floor(product.rating || 0) ? 'star-filled' : 'star-empty'}>
                                ★
                              </span>
                            ))}
                            <span className="little-krishna-rating-text">({product.rating?.toFixed(1) || '0.0'})</span>
                          </div>

                          {/* <div className="little-krishna-product-price-section">{(() => {
                            const selectedIndex = getSelectedVariant(product);
                            const selectedVariant = product.variants[selectedIndex] || product.variants[0];
                            const originalPrice = selectedVariant.price;
                            const hasOffer = isProductEligibleForOffer(selectedVariant.productId);

                            if (originalPrice === undefined || originalPrice === null) {
                              return <span className="price-text" style={{ color: '#999', fontSize: "0.9rem" }}>$0 (Price not fixed)</span>;
                            }

                            if (hasOffer && activeOffer) {
                              const discountedPrice = calculateDiscountedPrice(originalPrice);
                              return (
                                <>
                                  <span className="price-text little-krishna-discounted-price">${discountedPrice.toFixed(2)}</span>
                                  <span className="little-krishna-original-price">${originalPrice.toFixed(2)}</span>
                                </>
                              );
                            }

                            return <span className="price-text">${originalPrice.toFixed(2)}</span>;
                          })()}</div> */}

                          {/* Gram Variants Display */}
                          {product.hasMultipleVariants ? (
                            <div className="little-krishna-gram-variants">
                              {product.variants.map((variant, index) => {
                                const selectedIndex = getSelectedVariant(product);
                                const isSelected = selectedIndex === index;
                                const isOutOfStock = (variant.piece || 0) <= 0;

                                return (
                                  <button
                                    key={variant.productId}
                                    className={`little-krishna-gram-button ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                                    onClick={(e) => handleVariantSelect(product, index, e)}
                                    disabled={isOutOfStock}
                                  >
                                    {variant.gram}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="little-krishna-single-gram">
                              <span className="little-krishna-gram-display">{product.variants[0]?.gram || 'Standard'}</span>
                            </div>
                          )}

                          {/* Add to Cart Button */}
                          {(() => {
                            const selectedIndex = getSelectedVariant(product);
                            const selectedVariant = product.variants[selectedIndex] || product.variants[0];
                            const stock = selectedVariant.piece || 0;

                            return stock > 0 ? (
                              <button
                                className="little-krishna-add-to-cart-btn"
                                onClick={(e) => handleAddToCart(e, { ...product, ...selectedVariant })}
                              >
                                Add to Cart
                              </button>
                            ) : (
                              <button
                                className="little-krishna-add-to-cart-btn sold-out-btn"
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
                    <div className="little-krishna-pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="little-krishna-pagination-btn"
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          className={`little-krishna-pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                          onClick={() => paginate(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="little-krishna-pagination-btn"
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
        activeOffer={activeOffer}
      />

      {/* Cart Popup */}
      <CartPopup
        isOpen={showCartPopup}
        onClose={() => setShowCartPopup(false)}
        product={selectedProduct}
        cartItems={cartItems}
        onContinueShopping={handleContinueShopping}
        onViewCart={handleViewCart}
        activeOffer={activeOffer}
      />

      <Banner />
      <Footer />
    </>
  );
};

export default ProductListingPage;