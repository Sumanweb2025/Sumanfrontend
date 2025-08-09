import React, { useState, useEffect } from 'react';
import './CartPopup.css';

const CartPopup = ({ isOpen, onClose, product, cartItems, onContinueShopping, onViewCart }) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalCount);
    }
  }, [cartItems]);

  if (!isOpen || !product) return null;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTotalAmount = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => {
      const price = item.productId?.price || item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <div className="cart-popup-overlay">
      <div className="cart-popup">
        <div className="cart-popup-header">
          <h3>SHOPPING CART</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="cart-popup-content">
          <div className="cart-item-added">
            <div className="item-image">
              <img src={product.imageUrl || product.image || '/api/placeholder/80/80'} alt={product.name} />
            </div>
            <div className="item-details">
              <h4>{product.name}</h4>
              <p className="item-price">${product.price}</p>
              <p className="item-date">{formatDate(new Date())}</p>
            </div>
            <div className="quantity-display">
              <span>Qty: 1</span>
            </div>
          </div>

          {cartItems && cartItems.length > 1 && (
            <div className="other-cart-items">
              <h4>Other items in cart:</h4>
              {cartItems.slice(0, 2).map((item, index) => {
                const itemProduct = item.productId || item;
                if (itemProduct._id === product._id || itemProduct.id === product.id) return null;
                
                return (
                  <div key={index} className="cart-summary-item">
                    <img 
                      src={itemProduct.imageUrl || itemProduct.image || '/api/placeholder/40/40'} 
                      alt={itemProduct.name} 
                    />
                    <div className="summary-item-info">
                      <span className="summary-item-name">{itemProduct.name}</span>
                      <span className="summary-item-price">${itemProduct.price} x {item.quantity}</span>
                    </div>
                  </div>
                );
              })}
              {cartItems.length > 3 && (
                <p className="more-items">+{cartItems.length - 3} more items</p>
              )}
            </div>
          )}

          <div className="cart-summary">
            <div className="summary-row">
              <span>Items in cart:</span>
              <span>{cartCount}</span>
            </div>
            <div className="summary-row total">
              <span>Subtotal:</span>
              <span>${getTotalAmount().toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="popup-footer">
          <button className="view-cart-btn" onClick={onViewCart}>
            VIEW CART
          </button>
          <button className="continue-shopping-btn" onClick={onContinueShopping}>
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPopup;