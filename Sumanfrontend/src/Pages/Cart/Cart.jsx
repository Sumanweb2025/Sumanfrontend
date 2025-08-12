import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cart.css';
import Header from '../../Components/Header/Header';
import Banner from '../../Components/ShippingBanner/ShippingBanner';
import Footer from "../../Components/Footer/Footer";
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">{getIcon()}</span>
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-actions">
          <button className="modal-btn cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-btn confirm-btn" onClick={onConfirm}>
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [toasts, setToasts] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    fetchCart();
  }, []);

  // Toast functions
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const cartData = response.data?.data || response.data;
      console.log('Cart data received:', cartData); // Debug log
      setCartItems(cartData.items || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.response?.data?.message || 'Failed to load cart');
      showToast('Failed to load cart items', 'error');
      setLoading(false);
    }
  };

  // Helper function to get correct image URL
  const getImageUrl = (product) => {
    // First priority: imageUrl from backend (now added by cart controller)
    if (product.imageUrl) {
      return product.imageUrl;
    }

    // Second priority: construct from image field using Products path
    if (product.image) {
      return `${API_URL}/images/Products/${product.image}`;
    }

    // Fallback: placeholder
    return 'https://via.placeholder.com/300x300?text=No+Image';
  };

  // Helper function to safely parse numbers
  const safeParseFloat = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const safeParseInt = (value) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const updateQuantity = async (productId, newQuantity) => {
    const token = localStorage.getItem('token');
    if (!token || newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      const response = await axios.put(`${API_URL}/api/cart/${productId}`,
        { quantity: newQuantity },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Update with response data to ensure consistency
      const updatedCartData = response.data?.data;
      if (updatedCartData && updatedCartData.items) {
        setCartItems(updatedCartData.items);
      } else {
        // Fallback to local update
        setCartItems(prev =>
          prev.map(item => {
            const itemProductId = item.productId._id || item.productId;
            if (itemProductId === productId) {
              return { ...item, quantity: newQuantity };
            }
            return item;
          })
        );
      }

      // Dispatch custom event to update header count
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      showToast('Cart updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating quantity:', err);
      showToast('Failed to update quantity', 'error');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveFromCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Get the product name for toast message
    const productName = cartItems.find(item => 
      (item.productId._id || item.productId) === productId
    )?.productId?.name || 'Item';

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      const response = await axios.delete(`${API_URL}/api/cart/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Update with response data to ensure consistency
      const updatedCartData = response.data?.data;
      if (updatedCartData && updatedCartData.items) {
        setCartItems(updatedCartData.items);
      } else {
        // Fallback to local update
        setCartItems(prev =>
          prev.filter(item => (item.productId._id || item.productId) !== productId)
        );
      }

      // Dispatch custom event to update header count
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      showToast(`${productName} removed from cart`, 'success');
    } catch (err) {
      console.error('Error removing from cart:', err);
      showToast('Failed to remove item from cart', 'error');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/api/cart/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setCartItems([]);
      setShowClearConfirm(false);

      // Dispatch custom event to update header count
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      showToast('Cart cleared successfully!', 'success');
    } catch (err) {
      console.error('Error clearing cart:', err);
      showToast('Failed to clear cart', 'error');
    }
  };

  const handleProductClick = (product) => {
    const productData = product.productId || product;
    navigate(`/product/${productData.product_id || productData._id}`, {
      state: { product: productData }
    });
  };

  const handleContinueShopping = () => {
    navigate('/sweets');
  };

  const handleCheckout = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please sign in to continue with checkout', 'warning');
      navigate('/signin');
      return;
    }

    // Check if cart has items
    if (cartItems.length === 0) {
      showToast('Your cart is empty. Add some items before checkout.', 'warning');
      return;
    }

    // Navigate to checkout page
    navigate('/checkout');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = safeParseFloat(item.productId?.price);
      const quantity = safeParseInt(item.quantity);
      console.log(`Item: ${item.productId?.name}, Price: ${price}, Quantity: ${quantity}`); // Debug log
      return total + (price * quantity);
    }, 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.13; // 13% HST (common Canadian rate)
  };

  const calculateShipping = (subtotal) => {
    return subtotal > 75 ? 0 : 15; // Free shipping above $75 CAD
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping(subtotal);
    return subtotal + tax + shipping;
  };

  const getTotalItemCount = () => {
    return cartItems.reduce((total, item) => total + safeParseInt(item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal);
  const total = calculateTotal();

  return (
    <>
      <LoadingSpinner
        isLoading={loading}
        brandName="Cart Items"
        loadingText="Loading cart items..."
        progressColor="#3b82f6"
      />
      
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearCart}
        title="Clear Cart"
        message="Are you sure you want to clear your entire cart? This action cannot be undone."
      />

      <Header />
      <div className="cart-page">
        <div className="cart-container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span className="small-text text-animate" onClick={() => navigate('/')}>Home</span> /
            <span className="small-text text-animate current">Shopping Cart</span>
          </div>

          <div className="cart-header">
            <h1 className='main-title text-animate'>Shopping Cart</h1>
            <p className='sub-title text-animate'>{getTotalItemCount()} item{getTotalItemCount() !== 1 ? 's' : ''}</p>
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">🛒</div>
              <h2 className='main-title text-animate'>Your cart is empty</h2>
              <p className='sub-title text-animate'>Add items to your cart to see them here. Browse our products and find something you love!</p>
              <button
                className="continue-shopping-btn"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="cart-content">
              <div className="cart-items-section">
                <div className="cart-actions-header">
                  <h2>Cart Items</h2>
                  <button
                    className="clear-cart-btn"
                    onClick={() => setShowClearConfirm(true)}
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="cart-items">
                  {cartItems.map((item) => {
                    const product = item.productId;
                    const productId = product._id || product.id;
                    const isUpdating = updatingItems.has(productId);
                    const imageUrl = getImageUrl(product);
                    const price = safeParseFloat(product.price);
                    const quantity = safeParseInt(item.quantity);

                    return (
                      <div key={productId} className={`cart-item ${isUpdating ? 'updating' : ''}`}>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveFromCart(productId)}
                          disabled={isUpdating}
                          title="Remove from cart"
                        >
                          {isUpdating ? '⏳' : '×'}
                        </button>

                        <div
                          className="item-image-container"
                          onClick={() => handleProductClick(product)}
                        >
                          <img
                            src={imageUrl}
                            alt={product.name || 'Product'}
                            className="product-image"
                            onError={(e) => {
                              console.log('Image failed to load:', e.target.src);
                              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                              e.target.onerror = null;
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', imageUrl);
                            }}
                          />
                        </div>

                        <div className="item-details">
                          <h3
                            className="card-title text-animate item-name"
                            onClick={() => handleProductClick(product)}
                          >
                            {product.name}
                          </h3>

                          {product.brand && (
                            <p className="item-brand">{product.brand}</p>
                          )}

                          {product.category && (
                            <p className="item-category">{product.category}</p>
                          )}

                          <div className="price-text item-price">${price.toFixed(2)}</div>

                          {product.description && (
                            <p className="small-text item-description">
                              {product.description.length > 80
                                ? `${product.description.substring(0, 80)}...`
                                : product.description
                              }
                            </p>
                          )}
                        </div>

                        <div className="quantity-controls">
                          <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(productId, quantity - 1)}
                            disabled={quantity <= 1 || isUpdating}
                          >
                            -
                          </button>
                          <span className="quantity">{quantity}</span>
                          <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(productId, quantity + 1)}
                            disabled={isUpdating}
                          >
                            +
                          </button>
                        </div>

                        <div className="item-total">
                          ${(price * quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="cart-summary-section">
                <div className="cart-summary">
                  <h2>Order Summary</h2>

                  <div className="summary-row">
                    <span>Subtotal ({getTotalItemCount()} items):</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="summary-row">
                    <span>Tax (HST 13%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>

                  {shipping === 0 && (
                    <div className="free-shipping-notice">
                      🎉 You've earned free shipping!
                    </div>
                  )}

                  {shipping > 0 && (
                    <div className="shipping-notice">
                      Add ${(75 - subtotal).toFixed(2)} more for free shipping
                    </div>
                  )}

                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <button
                    className="checkout-btn"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>

                  <button
                    className="continue-shopping-link"
                    onClick={handleContinueShopping}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Banner />
      <Footer />
    </>
  );
};

export default CartPage;