import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Product.css';

const API_URL = 'http://localhost:5000';

const ProductListingPage = ({ addToCart, onFilterChange, activeFilters = {} }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(4); // Changed to show 4 products per page
  const navigate = useNavigate();

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
        setFilteredProducts(productsData); // Initialize filtered products

        try {
          const wishlistResponse = await axios.get(`${API_URL}/api/wishlist`);
          const wishlistData = wishlistResponse.data?.data || wishlistResponse.data || [];

          const productIds = [];
          if (Array.isArray(wishlistData)) {
            wishlistData.forEach(wishlist => {
              if (wishlist?.items && Array.isArray(wishlist.items)) {
                wishlist.items.forEach(item => {
                  if (item?.product_id) {
                    productIds.push(item.product_id);
                  }
                });
              }
            });
          }

          setWishlistItems(productIds);
        } catch (wishlistError) {
          console.log('Wishlist not loaded:', wishlistError);
          setWishlistItems([]);
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

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleWishlistClick = async (productId, e) => {
    e?.stopPropagation();
    if (!productId || wishlistLoading) return;

    setWishlistLoading(true);
    try {
      const isInWishlist = wishlistItems.includes(productId);

      if (isInWishlist) {
        await axios.delete(`${API_URL}/api/wishlist/${productId}`);
        setWishlistItems(prev => prev.filter(id => id !== productId));
      } else {
        await axios.post(`${API_URL}/api/wishlist`, {
          product_id: productId
        });
        setWishlistItems(prev => [...prev, productId]);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      alert(err.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (product, e) => {
    e?.stopPropagation();
    try {
      if (!addToCart) {
        throw new Error('addToCart function not provided');
      }

      await addToCart(product);
    } catch (err) {
      console.error('Add to cart error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to add to cart');
    }
  };

  const handleProductClick = (productId) => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="products-container-new">
      <div className="products-section">
        <div className="products-header-new">
          <h1 className="products-title">Our Products</h1>
          <h2 className="products-subtitle">Best selling</h2>
          <button className="view-all-btn-new">VIEW ALL PRODUCTS</button>
        </div>

        <div className="products-grid-new">
          {currentProducts.map((product) => {
            const productId = product.product_id || product.id;
            if (!productId) return null;

            return (
              <div
                key={productId}
                className="product-card-new"
                onClick={() => handleProductClick(productId)}
              >
                <div className="product-image-container-new">
                  <button
                    className={`wishlist-btn-new ${wishlistItems.includes(productId) ? 'active' : ''}`}
                    onClick={(e) => handleWishlistClick(productId, e)}
                    disabled={wishlistLoading}
                    title={wishlistItems.includes(productId) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {wishlistLoading ? '⏳' : (wishlistItems.includes(productId) ? '❤️' : '🤍')}
                  </button>
                  <img
                    src={product.imageUrl || `${API_URL}/images/Products/${product.image}` || 'https://via.placeholder.com/300'}
                    alt={product.name || 'Product image'}
                    className="product-image-new"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300';
                      e.target.onerror = null;
                    }}
                  />
                </div>

                <div className="product-details-new">
                  <h3 className="product-name-new">{product.name || 'Unnamed Product'}</h3>
                  <p className="product-description-new">{product.description || 'A delicious snack item'}</p>
                  <div className="product-footer-new">
                    <div className="product-price-new">${product.price || '0'}.00</div>
                    <button
                      className="add-to-cart-btn-new"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      🛒
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="pagination-dots-new">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`dot-new ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => paginate(i + 1)}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListingPage;