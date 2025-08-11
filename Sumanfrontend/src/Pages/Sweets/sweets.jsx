import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './sweets.css';
import Header from '../../Components/Header/Header';
import Footer from "../../Components/Footer/Footer";
import WishlistPopup from '../../Components/WishlistPopup/WishlistPopup';
import CartPopup from '../../Components/CartPopup/CartPopup';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const SweetsListingPage = ({ addToCart, onFilterChange, activeFilters }) => {
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

  const API_URL = 'http://localhost:8000/';

  // Get unique brands and categories for filters
  const uniqueBrands = [...new Set(products.map(product => product.brand).filter(Boolean))];
  const uniqueCategories = [...new Set(products.map(product => product.category).filter(Boolean))];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await axios.get(`${API_URL}api/products/search?category=sweets`);
        const productsData = productsResponse.data?.data || productsResponse.data?.products || productsResponse.data;
        setProducts(productsData);

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
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
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
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleProductClick = (product) => {
    // Show existing loading spinner when navigating to product details
    setLoading(true);
    
    // Small delay to show the loading spinner before navigation
    setTimeout(() => {
      // Navigate to product details page
      navigate(`/product/${product.product_id || product.id}`, { state: { product } });
    }, 1000);
  };

  const handleWishlistClick = async (e, product) => {
    e.stopPropagation(); // Prevent card click
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
        await axios.delete(`${API_URL}api/wishlist/${productId}`, config);
        setWishlistItems(prev => prev.filter(id => id !== productId));
        
        // Dispatch custom event to update header count
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      } else {
        await axios.post(`${API_URL}api/wishlist`, { productId }, config);
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

      await axios.post(`${API_URL}api/cart`, { productId, quantity: 1 }, config);
      
      // Update cart items
      const cartResponse = await axios.get(`${API_URL}api/cart`, config);
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

  const handleAddToCart = async (e, product) => {
    e.stopPropagation(); // Prevent card click
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
      await axios.post(`${API_URL}api/cart`, { productId, quantity: 1 }, config);
      
      // Update cart items
      const cartResponse = await axios.get(`${API_URL}api/cart`, config);
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


  return (
    <>
    <LoadingSpinner 
        isLoading={loading} 
        brandName="Sweet Delights" 
        loadingText="Loading delicious sweets..."
        progressColor="#3b82f6"
      />
      <Header />
      <div className="sweets-page">
        <div className="sweets-container">
          {/* Breadcrumb */}
          <div className="sweets-breadcrumb">
            <span>Home</span> / <span>Products</span> / <span className="sweets-current">Sweets</span>
          </div>

          <div className="sweets-page-content">
            {/* Sidebar Filters */}
            <div className="sweets-sidebar">
              <div className="sweets-filter-section">
                <h3>Quick Listing</h3>
                <div className="sweets-search-container">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="sweets-search-input"
                  />
                </div>
              </div>

              <div className="sweets-filter-section">
                <h3>Categories</h3>
                <div className="sweets-filter-options">
                  {uniqueCategories.map(category => (
                    <label key={category} className="sweets-filter-option">
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

              <div className="sweets-filter-section">
                <h3>Brands</h3>
                <div className="sweets-filter-options">
                  {uniqueBrands.map(brand => (
                    <label key={brand} className="sweets-filter-option">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                      />
                      <span>{brand}</span>
                      <span className="count">
                        ({products.filter(p => p.brand === brand).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sweets-filter-section">
                <h3>Price Range</h3>
                <div className="sweets-price-range">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="sweets-price-slider"
                  />

                  <div className="sweets-price-values">
                    ${priceRange[0]} - ${priceRange[1]}

                  </div>
                </div>
              </div>

              <div className="sweets-filter-section">
                <h3>Best Deals</h3>
                <div className="sweets-deal-items">
                  {products.slice(0, 3).map(product => (
                    <div key={product.product_id || product.id} className="sweets-deal-item">
                      <img 
                        src={product.imageUrl || `${API_URL}/uploads/${product.image}`}
                        alt={product.name}
                        className="sweets-deal-image"
                      />

                      <div className="sweets-deal-info">
                        <div className="sweets-deal-name">{product.name}</div>
                        <div className="sweets-deal-price">${product.price}</div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="sweets-clear-filters-btn" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>

            {/* Main Content */}
            <div className="sweets-main-content">
              <div className="sweets-page-header">
                <h1>Sweets</h1>
                <div className="sweets-sort-controls">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sweets-sort-select"
                  >
                    <option value="default">Default Sorting</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>
              </div>

              <div className="sweets-results-info">
                Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} results
              </div>

              {filteredProducts.length === 0 ? (
                <div className="empty">No sweets found matching your criteria</div>
              ) : (
                <>
                  <div className="sweets-products-grid">
                    {currentProducts.map((product) => (
                      <div 
                        key={product.product_id || product.id} 
                        className="sweets-product-card"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="sweets-product-image-container">
                          <img
                            src={product.imageUrl || `${API_URL}/uploads/${product.image}`}
                            alt={product.name}
                            className="sweets-product-image"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300';
                              e.target.onerror = null;
                            }}
                          />
                          <button
                            className={`sweets-wishlist-btn ${wishlistItems.includes(product.product_id || product._id || product.id) ? 'active' : ''}`}
                            onClick={(e) => handleWishlistClick(e, product)}
                            disabled={wishlistLoading}
                          >
                            {wishlistItems.includes(product.product_id || product._id || product.id) ? '❤️' : '♡'}
                          </button>
                        </div>

                        <div className="sweets-product-info">
                          <h3 className="sweets-product-name">{product.name}</h3>
                          <div className="sweets-product-brand">{product.brand}</div>
                          
                          <div className="sweets-product-rating">
                            {Array(5).fill().map((_, i) => (
                              <span key={i} className={i < Math.floor(product.rating || 0) ? 'star-filled' : 'star-empty'}>
                                ★
                              </span>
                            ))}
                            <span className="sweets-rating-text">({product.rating?.toFixed(1) || '0.0'})</span>
                          </div>


                          <div className="sweets-product-price">${product.price}</div>
                           {/* Stock status based on piece count */}
                          {product.piece > 0 ? (
                            <div className="sweets-product-stock in-stock">
                              In Stock
                            </div>
                          ) : (
                            <div className="sweets-product-stock out-of-stock">
                              Out of Stock
                            </div>
                          )}

                          <button 
                            className="sweet-add-to-cart-btn"
                            onClick={(e) => handleAddToCart(e, product)}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="sweets-pagination">
                      <button 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="sweets-pagination-btn"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          className={`sweets-pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                          onClick={() => paginate(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button 
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="sweets-pagination-btn"
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
      
      <Footer />
    </>
  );
};

export default SweetsListingPage;