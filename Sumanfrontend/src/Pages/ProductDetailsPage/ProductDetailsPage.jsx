import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import './ProductDetailsPage.css';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';
import WishlistPopup from '../../Components/WishlistPopup/WishlistPopup';
import CartPopup from '../../Components/CartPopup/CartPopup';

const ProductDetailsPage = ({ addToCart }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('description');
  
  // Review states
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  
  // Popup states
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const API_URL = 'http://localhost:8000/';

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!product) {
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL}api/products/${id}`);
          setProduct(response.data?.data || response.data);
        } catch (err) {
          console.error('Error fetching product:', err);
          setError(err.response?.data?.message || 'Product not found');
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchRelatedProducts = async () => {
      if (product) {
        try {
          const response = await axios.get(`${API_URL}api/products/search?category=${product.category}&limit=4`);
          const relatedData = response.data?.data || response.data?.products || response.data;
          setRelatedProducts(relatedData.filter(p => (p.product_id || p.id) !== (product.product_id || product.id)));
        } catch (err) {
          console.error('Error fetching related products:', err);
        }
      }
    };

    const fetchWishlistAndCart = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const config = {
            headers: { 'Authorization': `Bearer ${token}` }
          };

          // Fetch wishlist
          const wishlistResponse = await axios.get(`${API_URL}api/wishlist`, config);
          const wishlistData = wishlistResponse.data?.data || wishlistResponse.data;
          setWishlistItems(wishlistData.products?.map(item => item.productId._id || item.productId) || 
                          wishlistData.map(item => item.product_id || item.productId) || []);

          // Fetch cart
          const cartResponse = await axios.get(`${API_URL}api/cart`, config);
          const cartData = cartResponse.data?.data || cartResponse.data;
          setCartItems(cartData.items || []);

          // Fetch user's review for this product
          if (product) {
            try {
              const reviewResponse = await axios.get(`${API_URL}api/reviews/product/${product.product_id || product.id}/user`, config);
              setUserReview(reviewResponse.data?.data);
            } catch (reviewErr) {
              setUserReview(null);
            }
          }
        } catch (err) {
          console.log('User data not loaded', err);
        }
      }
    };

    const fetchReviews = async () => {
      if (product) {
        try {
          const response = await axios.get(`${API_URL}api/reviews/product/${product.product_id || product.id}`);
          setReviews(response.data?.data?.reviews || []);
        } catch (err) {
          console.error('Error fetching reviews:', err);
        }
      }
    };

    fetchProductDetails();
    fetchRelatedProducts();
    fetchWishlistAndCart();
    fetchReviews();
  }, [id, product, API_URL]);

  const handleWishlistClick = async () => {
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

  const handleAddToCart = async () => {
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
      await axios.post(`${API_URL}api/cart`, { productId, quantity }, config);
      
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

  const handleRelatedProductClick = (relatedProduct) => {
    setLoading(true);
    navigate(`/product/${relatedProduct.product_id || relatedProduct.id}`, { 
      state: { product: relatedProduct } 
    });
    window.scrollTo(0, 0);
  };

  const handleRatingClick = (rating) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to submit a review');
      return;
    }

    if (!reviewForm.rating || !reviewForm.comment.trim()) {
      alert('Please provide both rating and comment');
      return;
    }

    if (userReview) {
      alert('You have already reviewed this product');
      return;
    }

    setReviewLoading(true);
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post(
        `${API_URL}api/reviews/product/${product.product_id || product.id}`,
        reviewForm,
        config
      );

      alert('Review submitted successfully!');
      
      // Refresh product data and reviews
      const productResponse = await axios.get(`${API_URL}api/products/${id}`);
      setProduct(productResponse.data?.data || productResponse.data);

      const reviewsResponse = await axios.get(`${API_URL}api/reviews/product/${product.product_id || product.id}`);
      setReviews(reviewsResponse.data?.data?.reviews || []);

      setUserReview(response.data.data);
      setReviewForm({ rating: 0, comment: '' });
    } catch (err) {
      console.error('Review submit error:', err);
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderRatingStars = (rating, interactive = false, onClick = null, onHover = null, onLeave = null) => {
    return Array(5).fill().map((_, i) => (
      <span
        key={i}
        className={`star ${interactive ? 'interactive' : ''} ${
          i < rating ? 'star-filled' : 'star-empty'
        }`}
        onClick={interactive ? () => onClick(i + 1) : undefined}
        onMouseEnter={interactive ? () => onHover?.(i + 1) : undefined}
        onMouseLeave={interactive ? onLeave : undefined}
      >
        ★
      </span>
    ));
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

  // Tab content rendering functions
  const renderDescription = () => (
    <div className="tab-content-description">
      <h3>Product Description</h3>
      <p>{product.description || 'No description available for this product.'}</p>
      
      {product.features && (
        <div className="product-features">
          <h4>Key Features</h4>
          <ul>
            {product.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
      
      {product.specifications && (
        <div className="product-specs">
          <h4>Specifications</h4>
          <p>{product.specifications}</p>
        </div>
      )}
    </div>
  );

  const renderAdditionalInfo = () => (
    <div className="tab-content-additional">
      <h3>Additional Information</h3>
      <table className="additional-info-table">
        <tbody>
          <tr>
            <td><strong>Brand</strong></td>
            <td>{product.brand || 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Category</strong></td>
            <td>{product.category || 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>SKU</strong></td>
            <td>{product.sku || product.product_id || product.id || 'N/A'}</td>
          </tr>
          {product.piece && (
            <tr>
              <td><strong>Quantity per Pack</strong></td>
              <td>{product.piece} pieces</td>
            </tr>
          )}
          <tr>
            <td><strong>Weight</strong></td>
            <td>{product.weight || 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Color</strong></td>
            <td>{product.color || 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Warranty</strong></td>
            <td>{product.warranty || 'Standard manufacturer warranty'}</td>
          </tr>
          <tr>
            <td><strong>Country of Origin</strong></td>
            <td>{product.country || 'N/A'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderReviews = () => (
    <div className="tab-content-reviews">
      <div className="reviews-summary">
        <h3>Customer Reviews</h3>
        <div className="rating-summary">
          <div className="overall-rating">
            <span className="rating-number">{product.rating?.toFixed(1) || '0.0'}</span>
            <div className="rating-stars">
              {renderRatingStars(Math.floor(product.rating || 0))}
            </div>
            <span className="rating-count">
              Based on {product.review_count || 0} {(product.review_count || 0) === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Write Review Form */}
      {!userReview && (
        <div className="write-review-form">
          <h4>Write a Review</h4>
          <form onSubmit={handleReviewSubmit}>
            <div className="rating-input">
              <label>Rating:</label>
              <div className="stars-input">
                {renderRatingStars(
                  hoveredRating || reviewForm.rating,
                  true,
                  handleRatingClick,
                  setHoveredRating,
                  () => setHoveredRating(0)
                )}
              </div>
            </div>

            <div className="comment-input">
              <label>Your Review:</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your thoughts about this product..."
                maxLength="500"
                rows="4"
                required
              />
              <small className="char-count">
                {reviewForm.comment.length}/500 characters
              </small>
            </div>

            <button 
              type="submit" 
              className="submit-review-btn"
              disabled={reviewLoading}
            >
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {userReview && (
        <div className="user-review-notice">
          <p>✅ You have already reviewed this product. Thank you for your feedback!</p>
        </div>
      )}

      {/* Display Reviews */}
      {reviews.length > 0 ? (
        <div className="reviews-list">
          <h4>All Reviews ({reviews.length})</h4>
          {reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <span className="reviewer-name">{review.user_name}</span>
                <span className="review-date">{formatDate(review.createdAt)}</span>
              </div>
              
              <div className="review-rating">
                {renderRatingStars(review.rating)}
                <span className="rating-text">({review.rating}/5)</span>
              </div>
              
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <LoadingSpinner 
        isLoading={loading} 
        brandName="Product Details" 
        loadingText="Loading our product details..."
        progressColor="#3b82f6"
      />
    );
  }

  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Product not found</div>;

  const productImages = [
    product.imageUrl || `${API_URL}/uploads/${product.image}`,
  ];

  const isInWishlist = wishlistItems.includes(product.product_id || product._id || product.id);

  return (
    <>
      <Header />
      <div className="product-details-page">
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span onClick={() => navigate('/')} className="clickable">Home</span> / 
            <span onClick={() => navigate(`/${product.category?.toLowerCase()}`)} className="clickable">
              {product.category}
            </span> /  
            <span className="current">{product.name}</span>
          </div>

          <div className="product-details-content">
            {/* Wishlist Button - Top Right */}
            <button 
              className={`product-details-wishlist-btn ${isInWishlist ? 'active' : ''}`}
              onClick={handleWishlistClick}
              disabled={wishlistLoading}
            >
              {isInWishlist ? '❤️' : '♡'}
            </button>

            {/* Product Images */}
            <div className="product-images">
              <div className="main-image">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500';
                    e.target.onerror = null;
                  }}
                />
              </div>
              {productImages.length > 1 && (
                <div className="image-thumbnails">
                  {productImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className={selectedImage === index ? 'active' : ''}
                      onClick={() => setSelectedImage(index)}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100';
                        e.target.onerror = null;
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-brand">Brand: {product.brand}</div>
              <div className="product-category">Category: {product.category}</div>
              
              <div className="product-rating">
                {renderRatingStars(Math.floor(product.rating || 0))}
                <span className="rating-text">
                  ({product.rating?.toFixed(1) || '0.0'}) 
                  {product.review_count ? ` - ${product.review_count} ${product.review_count === 1 ? 'Review' : 'Reviews'}` : ' '}
                </span>
              </div>

              <div className="product-price">
                <span className="current-price">${(product.price * quantity).toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="original-price">${(product.originalPrice * quantity).toFixed(2)}</span>
                )}
                {quantity > 1 && (
                  <span className="price-per-unit">${product.price} per unit</span>
                )}
              </div>

              {/* Stock status section */}
  <div className="product-stock-info">
    {product.piece > 0 ? (
      <>
        <div className="product-stock in-stock">In Stock</div>
        
      </>
    ) : (
      <div className="product-stock out-of-stock">Out of Stock</div>
    )}
  </div>

              <div className="product-actions">
                <div className="quantity-selector">
                  <label>Quantity:</label>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity-value">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="details-action-buttons">
                  <button className="details-add-to-cart-btn" onClick={handleAddToCart}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Section */}
          <div className="product-tabs-section">
            <div className="tabs-navigation">
              <button 
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`tab-btn ${activeTab === 'additional' ? 'active' : ''}`}
                onClick={() => setActiveTab('additional')}
              >
                Additional Information
              </button>
              <button 
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({reviews.length})
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && renderDescription()}
              {activeTab === 'additional' && renderAdditionalInfo()}
              {activeTab === 'reviews' && renderReviews()}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="related-products">
              <h2>Related Products</h2>
              <div className="related-products-grid">
                {relatedProducts.slice(0, 4).map((relatedProduct) => (
                  <div 
                    key={relatedProduct.product_id || relatedProduct.id}
                    className="related-product-card"
                    onClick={() => handleRelatedProductClick(relatedProduct)}
                  >
                    <img
                      src={relatedProduct.imageUrl || `${API_URL}/uploads/${relatedProduct.image}`}
                      alt={relatedProduct.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200';
                        e.target.onerror = null;
                      }}
                    />
                    <div className="related-product-info">
                      <h4>{relatedProduct.name}</h4>
                      <div className="related-product-price">${relatedProduct.price}</div>
                      <div className="related-product-rating">
                        {renderRatingStars(Math.floor(relatedProduct.rating || 0))}
                        <span>({relatedProduct.rating?.toFixed(1) || '0.0'})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

export default ProductDetailsPage;