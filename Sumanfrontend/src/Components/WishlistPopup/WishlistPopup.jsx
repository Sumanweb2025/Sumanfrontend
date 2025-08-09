import React, { useState, useEffect } from 'react';
import './WishlistPopup.css';

const WishlistPopup = ({ isOpen, onClose, product, onAddToCart, onContinueShopping, onOpenWishlistPage }) => {
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="wishlist-popup-overlay">
      <div className="wishlist-popup">
        <div className="wishlist-popup-header">
          <h3>Wishlist (1)</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="wishlist-item">
          <button className="remove-item-btn">×</button>
          <div className="item-image">
            <img src={product.imageUrl || product.image || '/api/placeholder/80/80'} alt={product.name} />
          </div>
          <div className="item-details">
            <h4>{product.name}</h4>
            <p className="item-price">${product.price}</p>
            <p className="item-date">{formatDate(new Date())}</p>
          </div>
          <div className="item-actions">
            {!isAddedToCart ? (
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                ADD TO CART
              </button>
            ) : (
              <button className="view-cart-btn" onClick={handleViewCart}>
                VIEW CART
              </button>
            )}
          </div>
        </div>
        
        <div className="popup-footer">
          <button className="open-wishlist-btn" onClick={onOpenWishlistPage}>
            OPEN WISHLIST PAGE
          </button>
          <button className="continue-shopping-btn" onClick={onContinueShopping}>
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistPopup;