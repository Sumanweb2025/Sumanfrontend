import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cart.css';
import Header from '../../Components/Header/Header';
import Footer from "../../Components/Footer/Footer";
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const API_URL = 'http://localhost:8000/';

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await axios.get(`${API_URL}api/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const cartData = response.data?.data || response.data;
      setCartItems(cartData.items || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.response?.data?.message || 'Failed to load cart');
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    const token = localStorage.getItem('token');
    if (!token || newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      await axios.put(`${API_URL}api/cart/${productId}`,
        { quantity: newQuantity },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setCartItems(prev =>
        prev.map(item => {
          const itemProductId = item.productId._id || item.productId;
          if (itemProductId === productId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      );

      // Dispatch custom event to update header count
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity');
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

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      await axios.delete(`${API_URL}api/cart/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setCartItems(prev =>
        prev.filter(item => (item.productId._id || item.productId) !== productId)
      );

      // Dispatch custom event to update header count
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error('Error removing from cart:', err);
      alert('Failed to remove item from cart');
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

    if (!window.confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}api/cart/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setCartItems([]);

      // Dispatch custom event to update header count
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error('Error clearing cart:', err);
      alert('Failed to clear cart');
    }
  };

  const handleProductClick = (product) => {
    const productData = product.productId || product;
    navigate(`/product/${productData.product_id || productData._id}`, {
      state: { product: productData }
    });
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleCheckout = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to continue with checkout');
      navigate('/signin');
      return;
    }

    // Check if cart has items
    if (cartItems.length === 0) {
      alert('Your cart is empty. Add some items before checkout.');
      return;
    }

    // Navigate to checkout page
    navigate('/checkout');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.productId?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.18; // 18% GST
  };

  const calculateShipping = (subtotal) => {
    return subtotal > 500 ? 0 : 50; // Free shipping above ₹500
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping(subtotal);
    return subtotal + tax + shipping;
  };

  const getTotalItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
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
      <Header />
      <div className="cart-page">
        <div className="cart-container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span onClick={() => navigate('/')}>Home</span> /
            <span className="current">Shopping Cart</span>
          </div>

          <div className="cart-header">
            <h1>Shopping Cart</h1>
            <p>{getTotalItemCount()} item{getTotalItemCount() !== 1 ? 's' : ''}</p>
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Add items to your cart to see them here. Browse our products and find something you love!</p>
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
                    onClick={handleClearCart}
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="cart-items">
                  {cartItems.map((item) => {
                    const product = item.productId;
                    const productId = product._id || product.id;
                    const isUpdating = updatingItems.has(productId);

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
                            src={product.imageUrl || `${API_URL}/uploads/${product.image}`}
                            alt={product.name}
                            className="product-image"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300';
                              e.target.onerror = null;
                            }}
                          />
                        </div>

                        <div className="item-details">
                          <h3
                            className="item-name"
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

                          <div className="item-price">₹{product.price}</div>

                          {product.description && (
                            <p className="item-description">
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
                            onClick={() => updateQuantity(productId, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                          >
                            -
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(productId, item.quantity + 1)}
                            disabled={isUpdating}
                          >
                            +
                          </button>
                        </div>

                        <div className="item-total">
                          ₹{(product.price * item.quantity).toFixed(2)}
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
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="summary-row">
                    <span>Tax (GST 18%):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>

                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                  </div>

                  {shipping === 0 && (
                    <div className="free-shipping-notice">
                      🎉 You've earned free shipping!
                    </div>
                  )}

                  {shipping > 0 && (
                    <div className="shipping-notice">
                      Add ₹{(500 - subtotal).toFixed(2)} more for free shipping
                    </div>
                  )}

                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
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
      <Footer />
    </>
  );
};

export default CartPage;