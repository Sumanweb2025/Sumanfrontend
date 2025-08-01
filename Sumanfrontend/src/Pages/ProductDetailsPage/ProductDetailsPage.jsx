import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import './ProductDetailsPage.css';

const ProductDetailsPage = ({ addToCart }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

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

    const fetchWishlist = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/wishlist`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const wishlistData = response.data?.data || response.data;
          setWishlistItems(wishlistData.map(item => item.product_id || item.productId));
        } catch (err) {
          console.log('Wishlist not loaded', err);
        }
      }
    };

    fetchProductDetails();
    fetchRelatedProducts();
    fetchWishlist();
  }, [id, product, API_URL]);

  const handleWishlistClick = async () => {
    const productId = product.product_id || product.id;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to your wishlist');
        return;
      }
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      const isInWishlist = wishlistItems.includes(productId);
      if (isInWishlist) {
        await axios.delete(`${API_URL}/api/wishlist/${productId}`, config);
        setWishlistItems(prev => prev.filter(id => id !== productId));
      } else {
        await axios.post(`${API_URL}/api/wishlist`, { productId }, config);
        setWishlistItems(prev => [...prev, productId]);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      alert(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to your cart');
        return;
      }
      
      // Add quantity to product object
      const productWithQuantity = { ...product, quantity };
      await addToCart(productWithQuantity);
      alert(`${quantity} x ${product.name} added to cart!`);
    } catch (err) {
      console.error('Add to cart error:', err);
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleRelatedProductClick = (relatedProduct) => {
    navigate(`/product/${relatedProduct.product_id || relatedProduct.id}`, { 
      state: { product: relatedProduct } 
    });
    window.scrollTo(0, 0);
  };

  if (loading) return <div className="loading">Loading product details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!product) return <div className="error">Product not found</div>;

  const productImages = [
    product.imageUrl || `${API_URL}/uploads/${product.image}`,
    // Add more images if available
  ];

  const isInWishlist = wishlistItems.includes(product.product_id || product.id);

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
                {Array(5).fill().map((_, i) => (
                  <span key={i} className={i < Math.floor(product.rating || 0) ? 'star-filled' : 'star-empty'}>
                    ★
                  </span>
                ))}
                <span className="rating-text">({product.rating?.toFixed(1) || '0.0'}) Reviews</span>
              </div>

              <div className="product-price">
                <span className="current-price">₹{(product.price * quantity).toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="original-price">₹{(product.originalPrice * quantity).toFixed(2)}</span>
                )}
                {quantity > 1 && (
                  <span className="price-per-unit">₹{product.price} per unit</span>
                )}
              </div>

              {product.piece && (
                <div className="product-piece">
                  <strong>Quantity:</strong> {product.piece} pieces
                </div>
              )}

              <div className="product-description">
                <h3>Description</h3>
                <p>{product.description || 'No description available.'}</p>
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

                <div className="action-buttons">
                  <button className="add-to-cart-btn" onClick={handleAddToCart}>
                    Add to Cart
                  </button>
                  <button 
                    className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                    onClick={handleWishlistClick}
                  >
                    {isInWishlist ? '❤️ In Wishlist' : '♡ Add to Wishlist'}
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="product-details-table">
                <h3>Product Details</h3>
                <table>
                  <tbody>
                    <tr>
                      <td>Brand</td>
                      <td>{product.brand}</td>
                    </tr>
                    <tr>
                      <td>Category</td>
                      <td>{product.category}</td>
                    </tr>
                    {product.piece && (
                      <tr>
                        <td>Pieces</td>
                        <td>{product.piece}</td>
                      </tr>
                    )}
                    <tr>
                      <td>Price</td>
                      <td>₹{product.price}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
                      <div className="related-product-price">₹{relatedProduct.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetailsPage;