import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Cart.css';
import Header from '../../Components/Header/Header';
import Banner from '../../Components/ShippingBanner/ShippingBanner';
import Footer from "../../Components/Footer/Footer";
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';


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

// Mobile Cart Item Component
const MobileCartItem = ({ 
  item, 
  product, 
  productId, 
  isUpdating, 
  onUpdateQuantity, 
  onRemove, 
  onProductClick,
  getImageUrl,
  getProductGram,
  safeParseFloat,
  safeParseInt
}) => {
  const price = safeParseFloat(product.price || product.Price);
  const quantity = safeParseInt(item.quantity);
  const productName = product.name || product.Name || 'Unknown Product';
  const productBrand = product.brand || product.Brand;
  const productCategory = product.category || product.Category;
  const imageUrl = getImageUrl(product);

  return (
    <div className={`cart-item ${isUpdating ? 'updating' : ''}`}>
      <button
        className="cart-remove-btn"
        onClick={() => onRemove(productId)}
        disabled={isUpdating}
        title="Remove from cart"
      >
        {isUpdating ? '⏳' : '×'}
      </button>

      <div className="mobile-item-header">
        <div
          className="item-image-container"
          onClick={() => onProductClick(product)}
        >
          <img
            src={imageUrl}
            alt={productName}
            className="product-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
              e.target.onerror = null;
            }}
          />
        </div>

        <div className="mobile-item-info">
          <h3
            className="item-name"
            onClick={() => onProductClick(product)}
          >
            {productName}
          </h3>

          {productBrand && (
            <p className="item-brand">{productBrand}</p>
          )}

          {productCategory && (
            <p className="item-category">{productCategory}</p>
          )}

          <div className="item-price">${price.toFixed(2)}</div>

          {/* Add Gram Display */}
          {getProductGram(product) && (
            <div className="cart-item-gram">
              <span className="cart-gram-label">Size:</span>
              <span className="cart-gram-value">{getProductGram(product)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mobile-controls">
        <div className="quantity-controls">
          <button
            className="quantity-btn"
            onClick={() => onUpdateQuantity(productId, quantity - 1)}
            disabled={quantity <= 1 || isUpdating}
          >
            -
          </button>
          <span className="quantity">{quantity}</span>
          <button
            className="quantity-btn"
            onClick={() => onUpdateQuantity(productId, quantity + 1)}
            disabled={isUpdating}
          >
            +
          </button>
        </div>

        <div className="item-total">
          ${(price * quantity).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

// Desktop Cart Item Component
const DesktopCartItem = ({ 
  item, 
  product, 
  productId, 
  isUpdating, 
  onUpdateQuantity, 
  onRemove, 
  onProductClick,
  getImageUrl,
  getProductGram,
  safeParseFloat,
  safeParseInt
}) => {
  const price = safeParseFloat(product.price || product.Price);
  const quantity = safeParseInt(item.quantity);
  const productName = product.name || product.Name || 'Unknown Product';
  const productBrand = product.brand || product.Brand;
  const productCategory = product.category || product.Category;
  const productDescription = product.description || product.Description;
  const imageUrl = getImageUrl(product);

  return (
    <div className={`cart-item ${isUpdating ? 'updating' : ''}`}>
      <button
        className="cart-remove-btn"
        onClick={() => onRemove(productId)}
        disabled={isUpdating}
        title="Remove from cart"
      >
        {isUpdating ? '⏳' : '×'}
      </button>

      <div
        className="item-image-container"
        onClick={() => onProductClick(product)}
      >
        <img
          src={imageUrl}
          alt={productName}
          className="product-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
            e.target.onerror = null;
          }}
        />
      </div>

      <div className="item-details">
        <h3
          className="card-title text-animate item-name"
          onClick={() => onProductClick(product)}
        >
          {productName}
        </h3>

        {productBrand && (
          <p className="item-brand">{productBrand}</p>
        )}

        {productCategory && (
          <p className="item-category">{productCategory}</p>
        )}

        {/* Add Gram Display */}
        {getProductGram(product) && (
          <div className="cart-item-gram">
            <span className="cart-gram-label">Size:</span>
            <span className="cart-gram-value">{getProductGram(product)}</span>
          </div>
        )}

        <div className="price-text item-price">${price.toFixed(2)}</div>

        {productDescription && (
          <p className="small-text item-description">
            {productDescription.length > 80
              ? `${productDescription.substring(0, 80)}...`
              : productDescription
            }
          </p>
        )}
      </div>

      <div className="quantity-controls">
        <button
          className="quantity-btn"
          onClick={() => onUpdateQuantity(productId, quantity - 1)}
          disabled={quantity <= 1 || isUpdating}
        >
          -
        </button>
        <span className="quantity">{quantity}</span>
        <button
          className="quantity-btn"
          onClick={() => onUpdateQuantity(productId, quantity + 1)}
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
};

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const API_URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    fetchCart();

    // Add resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

      // Filter out items with null or invalid product references
      const validCartItems = (cartData.items || []).filter(item => {
        const isValid = item && item.productId && (
          typeof item.productId === 'object'
            ? item.productId._id || item.productId.id || item.productId.product_id
            : item.productId
        );

        if (!isValid) {
          console.warn('Invalid cart item found:', item);
        }

        return isValid;
      });

      setCartItems(validCartItems);

      // If we filtered out invalid items, show a notification
      if (validCartItems.length < (cartData.items || []).length) {
        const removedCount = (cartData.items || []).length - validCartItems.length;
        toast.warning(`${removedCount} invalid item(s) removed from cart`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "⚠️"
        });

        // Optionally clean up the cart on the server
        if (validCartItems.length === 0) {
          handleClearCart();
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.response?.data?.message || 'Failed to load cart');
      toast.error('Failed to load cart items', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "❌"
      });
      setLoading(false);
    }
  };

  // Helper functions
  const getProductGram = (product) => {
    return product?.gram || product?.Gram || null;
  };

  const getImageUrl = (product) => {
    if (product?.imageUrl) {
      return product.imageUrl;
    }
    if (product?.image) {
      return `${API_URL}/images/Products/${product.image}`;
    }
    return 'https://via.placeholder.com/300x300?text=No+Image';
  };

  const safeParseFloat = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const safeParseInt = (value) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const getProductId = (item) => {
    if (!item || !item.productId) return null;
    const product = item.productId;
    return product._id || product.id || product.product_id || null;
  };

  const getProductData = (item) => {
    if (!item || !item.productId) return null;
    if (typeof item.productId === 'object' && item.productId !== null) {
      return item.productId;
    }
    return null;
  };

  const updateQuantity = async (productId, newQuantity) => {
    const token = localStorage.getItem('token');
    if (!token || newQuantity < 1 || !productId) return;

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      const response = await axios.put(`${API_URL}api/cart/${productId}`,
        { quantity: newQuantity },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const updatedCartData = response.data?.data;
      if (updatedCartData && updatedCartData.items) {
        const validItems = updatedCartData.items.filter(item =>
          item && item.productId && getProductId(item)
        );
        setCartItems(validItems);
      } else {
        setCartItems(prev =>
          prev.map(item => {
            const itemProductId = getProductId(item);
            if (itemProductId === productId) {
              return { ...item, quantity: newQuantity };
            }
            return item;
          })
        );
      }

      window.dispatchEvent(new CustomEvent('cartUpdated'));
      toast.success('Cart updated successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "✅"
      });
    } catch (err) {
      console.error('Error updating quantity:', err);
      toast.error('Failed to update quantity', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "❌"
      });
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
    if (!token || !productId) return;

    const item = cartItems.find(item => getProductId(item) === productId);
    const product = getProductData(item);
    const productName = product?.name || product?.Name || 'Item';

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      const response = await axios.delete(`${API_URL}api/cart/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const updatedCartData = response.data?.data;
      if (updatedCartData && updatedCartData.items) {
        const validItems = updatedCartData.items.filter(item =>
          item && item.productId && getProductId(item)
        );
        setCartItems(validItems);
      } else {
        setCartItems(prev =>
          prev.filter(item => getProductId(item) !== productId)
        );
      }

      window.dispatchEvent(new CustomEvent('cartUpdated'));
      toast.success(`${productName} removed from cart`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "✅"
      });
    } catch (err) {
      console.error('Error removing from cart:', err);
      toast.error('Failed to remove item from cart', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "❌"
      });
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
      await axios.delete(`${API_URL}api/cart/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setCartItems([]);
      setShowClearConfirm(false);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      toast.success('Cart cleared successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "✅"
      });
    } catch (err) {
      console.error('Error clearing cart:', err);
      toast.error('Failed to clear cart', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "❌"
      });
    }
  };

  const handleProductClick = (product) => {
    if (!product) return;
    
    const productId = product._id || product.id || product.product_id;
    if (productId) {
      navigate(`/product/${productId}`, {
        state: { 
          product: product,
          fromCart: true,
          selectedGram: product.gram || product.Gram
        }
      });
    }
  };

  const handleContinueShopping = () => {
    navigate('/sweets');
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('Please sign in to continue with checkout', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "⚠️"
      });
      navigate('/signin');
      return;
    }

    if (cartItems.length === 0) {
      toast.warning('Your cart is empty. Add some items before checkout.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "⚠️"
      });
      return;
    }

    navigate('/checkout');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const product = getProductData(item);
      if (!product) return total;

      const price = safeParseFloat(product.price || product.Price);
      const quantity = safeParseInt(item.quantity);
      return total + (price * quantity);
    }, 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.13; // 13% HST
  };

  const calculateShipping = (subtotal) => {
    return subtotal >= 75 ? 0 : 9.99;
  };

  const getTotalItemCount = () => {
    return cartItems.reduce((total, item) => total + safeParseInt(item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + tax + shipping;

  return (
    <>
      <LoadingSpinner
        isLoading={loading}
        brandName="Cart Items"
        loadingText="Loading cart items..."
        progressColor="#3b82f6"
      />

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

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
                  {cartItems.map((item, index) => {
                    const product = getProductData(item);
                    const productId = getProductId(item);

                    if (!product || !productId) {
                      console.warn('Skipping invalid cart item:', item);
                      return null;
                    }

                    const isUpdating = updatingItems.has(productId);

                    // Use different components for mobile and desktop
                    const CartItemComponent = isMobile ? MobileCartItem : DesktopCartItem;

                    return (
                      <CartItemComponent
                        key={`${productId}-${index}`}
                        item={item}
                        product={product}
                        productId={productId}
                        isUpdating={isUpdating}
                        onUpdateQuantity={updateQuantity}
                        onRemove={handleRemoveFromCart}
                        onProductClick={handleProductClick}
                        getImageUrl={getImageUrl}
                        getProductGram={getProductGram}
                        safeParseFloat={safeParseFloat}
                        safeParseInt={safeParseInt}
                      />
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
                    <span>{shipping === 0 ? 'FREE' : `${shipping.toFixed(2)}`}</span>
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