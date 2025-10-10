import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Groceries.css';
import Header from '../../Components/Header/Header';
import Banner from '../../Components/ShippingBanner/ShippingBanner';
import Footer from "../../Components/Footer/Footer";
import WishlistPopup from '../../Components/WishlistPopup/WishlistPopup';
import CartPopup from '../../Components/CartPopup/CartPopup';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const GroceryListingPage = ({ addToCart, onFilterChange, activeFilters }) => {
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
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Popup states
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const [selectedVariants, setSelectedVariants] = useState({}); // Track selected variant for each product

  // Add ref for scroll target
  const mainContentRef = useRef(null);

  const API_URL = import.meta.env.VITE_APP_API_URL;

  // Get unique brands and categories for filters
  const uniqueBrands = [...new Set(products.map(product => product.brand).filter(Boolean))];
  const uniqueCategories = [...new Set(products.map(product => product.category).filter(Boolean))];

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
        // Fetch groceries category
        const productsResponse = await axios.get(`${API_URL}api/products/search?category=grocery`);
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

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(product => selectedBrands.includes(product.brand));
    }

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
  }, [products, selectedBrands, selectedCategories, priceRange, searchTerm, sortBy]);

  const handleBrandChange = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
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
    // Show existing loading spinner when navigating to product details
    setLoading(true);

    // Small delay to show the loading spinner before navigation
    setTimeout(() => {
      // Navigate to product details page
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
        selectedGram: productData.gram || productData.Gram
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

  return (
    <>
      <LoadingSpinner
        isLoading={loading}
        brandName="Groceries"
        loadingText="Loading grocery items..."
        progressColor="#3b82f6"
      />
      <Header />
      <div className="grocery-page">
        <div className="grocery-container">
          {/* Breadcrumb */}
          <div className="grocery-breadcrumb">
            <span
              className="grocery-link"
              onClick={() => navigate('/')}

            >
              Home
            </span>  / <span className="grocery-current">Groceries</span>
          </div>

          <div className="grocery-page-content">
            {/* Sidebar Filters */}
            <div className="grocery-sidebar">
              <div className="grocery-filter-section">
                <h3>Quick Listing</h3>
                <div className="grocery-search-container">
                  <input
                    type="text"
                    placeholder="Search grocery items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="grocery-search-input"
                  />
                </div>
              </div>

              <div className="grocery-filter-section">
                <h3>Categories</h3>
                <div className="grocery-filter-options">
                  {uniqueCategories.map(category => (
                    <label key={category} className="grocery-filter-option">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                      <span>{category}</span>
                      <span className="grocery-count">
                        ({products.filter(p => p.category === category).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grocery-filter-section">
                <h3>Brands</h3>
                <div className="grocery-filter-options">
                  {uniqueBrands.map(brand => (
                    <label key={brand} className="grocery-filter-option">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                      />
                      <span>{brand}</span>
                      <span className="grocery-count">
                        ({products.filter(p => p.brand === brand).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grocery-filter-section">
                <h3>Price Range</h3>
                <div className="grocery-price-range">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="grocery-price-slider"
                  />
                  <div className="grocery-price-values">
                    ${priceRange[0]} - ${priceRange[1]}
                  </div>
                </div>
              </div>

              <div className="grocery-filter-section">
                <h3>Best Deals</h3>
                <div className="grocery-deal-items">
                  {products.slice(0, 3).map(product => (
                    <div key={product.product_id || product.id} className="grocery-deal-item">
                      <img
                        src={product.imageUrl || `${API_URL}/uploads/${product.image}`}
                        alt={product.name}
                        className="grocery-deal-image"
                      />
                      <div className="grocery-deal-info">
                        <div className="grocery-deal-name">{product.name}</div>
                        <div className="grocery-deal-price">${product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="grocery-clear-filters-btn" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>

            {/* Main Content */}
            <div className="grocery-main-content" ref={mainContentRef}>
              <div className="grocery-page-header">
                <h1 className='main-title text-animate'>Grocery Items</h1>
                <div className="grocery-sort-controls">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="grocery-sort-select"
                  >
                    <option value="default">Default Sorting</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>
              </div>

              <div className="grocery-results-info">
                Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} results
              </div>

              {filteredProducts.length === 0 ? (
                <div className="grocery-empty">No grocery items found matching your criteria</div>
              ) : (
                <>
                  <div className="grocery-products-grid">
                    {currentProducts.map((product) => (
                      <div
                        key={product.product_id || product.id}
                        className="grocery-product-card"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="grocery-product-image-container">
                          <div className="grocery-image-wrapper">
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
                              className="grocery-product-image primary-image"
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
                                  className="grocery-product-image secondary-image"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                          </div>
                          <button
                            className={`grocery-wishlist-btn ${(() => {
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
                        </div>

                        <div className="grocery-product-info">
                          <h3 className="card-title grocery-product-name">{product.name}</h3>
                          <div className="grocery-product-brand">{product.brand}</div>

                          <div className="grocery-product-rating">
                            {Array(5).fill().map((_, i) => (
                              <span key={i} className={i < Math.floor(product.rating || 0) ? 'grocery-star-filled' : 'grocery-star-empty'}>
                                ★
                              </span>
                            ))}
                            <span className="price-text grocery-rating-text">({product.rating?.toFixed(1) || '0.0'})</span>
                          </div>

                          <div className="grocery-product-price"> {(() => {
                            const selectedIndex = getSelectedVariant(product);
                            const selectedVariant = product.variants[selectedIndex] || product.variants[0];
                            const price = selectedVariant.price;

                            return price !== undefined && price !== null
                              ? `$${price}`
                              : <span style={{ color: '#999', fontSize: "0.9rem" }}>$0 (Price not fixed)</span>;
                          })()}</div>

                          {/* Gram Variants Display */}
                          {product.hasMultipleVariants ? (
                            <div className="grocery-gram-variants">
                              {product.variants.map((variant, index) => {
                                const selectedIndex = getSelectedVariant(product);
                                const isSelected = selectedIndex === index;
                                const isOutOfStock = (variant.piece || 0) <= 0;

                                return (
                                  <button
                                    key={variant.productId}
                                    className={`grocery-gram-button ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                                    onClick={(e) => handleVariantSelect(product, index, e)}
                                    disabled={isOutOfStock}
                                  >
                                    {variant.gram}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="grocery-single-gram">
                              <span className="grocery-gram-display">{product.variants[0]?.gram || 'Standard'}</span>
                            </div>
                          )}
                          {/* Stock Status */}
                          {(() => {
                            const selectedIndex = getSelectedVariant(product);
                            const selectedVariant = product.variants[selectedIndex] || product.variants[0];
                            const stock = selectedVariant.piece || 0;

                            return stock > 0 ? (
                              <div className="grocery-product-stock in-stock">
                                In Stock
                              </div>
                            ) : (
                              <div className="grocery-product-stock out-of-stock">
                                Out of Stock
                              </div>
                            );
                          })()}

                          {/* Add to Cart Button */}
                          {(() => {
                            const selectedIndex = getSelectedVariant(product);
                            const selectedVariant = product.variants[selectedIndex] || product.variants[0];
                            const stock = selectedVariant.piece || 0;

                            return stock > 0 ? (
                              <button
                                className="grocery-add-to-cart-btn"
                                onClick={(e) => handleAddToCart(e, { ...product, ...selectedVariant })}
                              >
                                Add to Cart
                              </button>
                            ) : (
                              <button
                                className="grocery-add-to-cart-btn sold-out-btn"
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
                    <div className="grocery-pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="grocery-pagination-btn"
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          className={`grocery-pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                          onClick={() => paginate(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="grocery-pagination-btn"
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

export default GroceryListingPage;