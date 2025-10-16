import React, { useState, useEffect } from 'react';
import './WishlistPopup.css';

const WishlistPopup = ({ isOpen, onClose, product, onAddToCart, onContinueShopping, onOpenWishlistPage, activeOffer }) => {
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsAddedToCart(false);
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleAddToCart = async () => {
    try {
      const productId = product.product_id || product._id || product.id;
      await onAddToCart(productId);
      setIsAddedToCart(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleViewCart = () => {
    onClose();
    // Navigate to cart page
    window.location.href = '/cart';
  };

  const handleContinueShopping = () => {
    onContinueShopping();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if product is eligible for offer
  const isProductEligibleForOffer = () => {
    if (!activeOffer || !product) return false;

    const productId = product.product_id || product._id || product.id;

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
        cat => cat.toLowerCase() === (product.category || '').toLowerCase()
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

  return (
    <div className="wishlist-popup-overlay">
      <div className="wishlist-popup">
        <div className="wishlist-popup-header">
          <h3>Wishlist (1)</h3>
          <button className="wishlist-popup-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="wishlist-popup-item">
          <button className="wishlist-popup-remove-item-btn">×</button>
          <div className="wishlist-popup-item-image">
            {isProductEligibleForOffer() && activeOffer && (
              <div className="wishlist-popup-offer-badge">
                {activeOffer.discount}{activeOffer.discountType === 'percentage' ? '%' : '$'} OFF
              </div>
            )}
            <img src={product.imageUrl || product.image || '/api/placeholder/80/80'} alt={product.name} />
          </div>
          <div className="wishlist-popup-item-details">
            <h4>{product.name}</h4>
            {product.selectedGram && (
              <p className="wishlist-popup-item-gram" style={{ fontSize: '0.85rem', color: '#666', margin: '4px 0' }}>
                Size: {product.selectedGram}
              </p>
            )}
            {isProductEligibleForOffer() && activeOffer ? (
              <div className="wishlist-popup-price-container">
                <p className="wishlist-popup-item-price wishlist-popup-discounted-price">
                  ${calculateDiscountedPrice(product.price).toFixed(2)}
                </p>
                <p className="wishlist-popup-item-original-price">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            ) : (
              <p className="wishlist-popup-item-price">${product.price}</p>
            )}
            <p className="wishlist-popup-item-date">{formatDate(new Date())}</p>
          </div>
          <div className="wishlist-popup-item-actions">
            {!isAddedToCart ? (
              <button className="wishlist-popup-add-to-cart-btn" onClick={handleAddToCart}>
                ADD TO CART
              </button>
            ) : (
              <button className="wishlist-popup-view-cart-btn" onClick={handleViewCart}>
                VIEW CART
              </button>
            )}
          </div>
        </div>

        <div className="popup-footer">
          <button className="open-wishlist-btn" onClick={onOpenWishlistPage}>
            OPEN WISHLIST PAGE
          </button>
          <button className="wishlist-popup-continue-shopping-btn" onClick={handleContinueShopping}>
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistPopup;