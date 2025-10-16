import React, { useState, useEffect } from 'react';
import './CartPopup.css';

const CartPopup = ({ isOpen, onClose, product, cartItems, onContinueShopping, onViewCart, activeOffer }) => {
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

  // Check if product is eligible for offer
  const isProductEligibleForOffer = (checkProduct) => {
    if (!activeOffer || !checkProduct) return false;

    const productId = checkProduct.product_id || checkProduct._id || checkProduct.id;

    // Check if offer is active and within date range
    const now = new Date();
    const startDate = new Date(activeOffer.startDate);
    const endDate = new Date(activeOffer.endDate);

    if (!activeOffer.isActive || now < startDate || now > endDate) {
      return false;
    }

    // Priority 1: Check specific products
    if (activeOffer.applicableProducts && activeOffer.applicableProducts.length > 0) {
      return activeOffer.applicableProducts.some(p => {
        const offerProductId = typeof p === 'object' ? (p.product_id || p._id) : p;
        return String(offerProductId) === String(productId);
      });
    }

    // Priority 2: Check categories
    if (activeOffer.applicableCategories && activeOffer.applicableCategories.length > 0) {
      return activeOffer.applicableCategories.some(
        cat => cat.toLowerCase() === (checkProduct.category || '').toLowerCase()
      );
    }

    // Priority 3: Apply to all
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

  const getTotalAmount = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => {
      const itemProduct = item.productId || item;
      const price = itemProduct?.price || item.price || 0;
      const finalPrice = isProductEligibleForOffer(itemProduct) ? calculateDiscountedPrice(price) : price;
      return total + (finalPrice * item.quantity);
    }, 0);
  };

  const handleContinueShopping = () => {
    onContinueShopping();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="cart-popup-overlay">
      <div className="cart-popup">
        <div className="cart-popup-header">
          <h3>SHOPPING CART</h3>
          <button className="cart-popup-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="cart-popup-content">
          <div className="cart-popup-item-added">
            <div className="cart-popup-item-image">
              {isProductEligibleForOffer(product) && activeOffer && (
                <div className="cart-popup-offer-badge">
                  {activeOffer.discount}{activeOffer.discountType === 'percentage' ? '%' : '$'} OFF
                </div>
              )}
              <img src={product.imageUrl || product.image || '/api/placeholder/80/80'} alt={product.name} />
            </div>
            <div className="cart-popup-item-details">
              <h4>{product.name}</h4>
              {(product.selectedGram || product.gram || product.Gram) && (
                <p className="cart-popup-item-gram" style={{ fontSize: '0.85rem', color: '#666', margin: '4px 0' }}>
                  Size: {product.selectedGram || product.gram || product.Gram}
                </p>
              )}

              {isProductEligibleForOffer(product) && activeOffer ? (
                <div className="cart-popup-price-container">
                  <p className="cart-popup-item-price cart-popup-discounted-price">
                    ${calculateDiscountedPrice(product.price).toFixed(2)}
                  </p>
                  <p className="cart-popup-item-original-price">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="cart-popup-item-price">${product.price}</p>
              )}
              <p className="cart-popup-item-date">{formatDate(new Date())}</p>
            </div>
            <div className="cart-popup-quantity-display">
              <span>Qty: 1</span>
            </div>
          </div>

          {cartItems && cartItems.length > 1 && (
            <div className="cart-popup-other-cart-items">
              <h4>Other items in cart:</h4>
              {cartItems.slice(0, 2).map((item, index) => {
                const itemProduct = item.productId || item;
                if (itemProduct._id === product._id || itemProduct.id === product.id) return null;

                return (
                  <div key={index} className="cart-popup-summary-item">
                    <img
                      src={itemProduct.imageUrl || itemProduct.image || '/api/placeholder/40/40'}
                      alt={itemProduct.name}
                    />
                    <div className="cart-popup-summary-item-info">
                      <span className="cart-popup-summary-item-name">{itemProduct.name}</span>
                      <span className="cart-popup-summary-item-price">${itemProduct.price} x {item.quantity}</span>
                    </div>
                  </div>
                );
              })}
              {cartItems.length > 3 && (
                <p className="more-items">+{cartItems.length - 3} more items</p>
              )}
            </div>
          )}

          <div className="cart-popup-summary">
            <div className="cart-popup-summary-row">
              <span>Items in cart:</span>
              <span>{cartCount}</span>
            </div>
            <div className="cart-popup-summary-row total">
              <span>Subtotal:</span>
              <span>${getTotalAmount().toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="popup-footer">
          <button className="cart-popup-view-cart-btn" onClick={onViewCart}>
            VIEW CART
          </button>
          <button className="cart-popup-continue-shopping-btn" onClick={handleContinueShopping}>
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPopup;