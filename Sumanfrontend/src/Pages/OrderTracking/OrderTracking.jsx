import React, { useState } from 'react';
import './OrderTracking.css';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_URL = 'http://localhost:8000';

  const handleTrackOrder = async () => {
    if (!orderId.trim() || !billingEmail.trim()) {
      setError('Please enter both Order ID and Billing Email');
      return;
    }

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await fetch(`${API_URL}/api/orders/track-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId.trim(),
          email: billingEmail.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrderData(data.data);
      } else {
        setError(data.message || 'Order not found. Please check your Order ID and email.');
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      setError('Unable to track order. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTrackOrder();
    }
  };

  // Helper function to get the correct image URL - same logic as MyOrders
  const getImageUrl = (item) => {
    // Priority order based on backend logic:
    // 1. imageUrl from item level (backend response)
    // 2. imageUrl from productId (populated product)
    // 3. Construct from productId.image
    // 4. Construct from item.image
    // 5. Fallback to placeholder

    if (item.imageUrl) {
      return item.imageUrl;
    }
    
    if (item.productId?.imageUrl) {
      return item.productId.imageUrl;
    }
    
    if (item.productId?.image) {
      return `${API_URL}/images/Products/${item.productId.image}`;
    }
    
    if (item.image) {
      return `${API_URL}/images/Products/${item.image}`;
    }
    
    return 'https://via.placeholder.com/60?text=No+Image';
  };

  // Handle image loading errors with fallback
  const handleImageError = (e, item) => {
    const img = e.target;
    
    // Try alternative image paths
    if (img.src.includes('/images/Products/')) {
      // Try with uploads path instead
      const imageName = item.productId?.image || item.image;
      if (imageName) {
        img.src = `${API_URL}/uploads/${imageName}`;
      } else {
        img.src = 'https://via.placeholder.com/60?text=No+Image';
      }
    } else if (img.src.includes('/uploads/')) {
      // If uploads also fails, use placeholder
      img.src = 'https://via.placeholder.com/60?text=No+Image';
    } else {
      // Final fallback
      img.src = 'https://via.placeholder.com/60?text=No+Image';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f39c12';
      case 'confirmed': return '#3498db';
      case 'processing': return '#9b59b6';
      case 'shipped': return '#2ecc71';
      case 'delivered': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'failed': return '#e74c3c';
      case 'refunded': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  return (
    <>
    <LoadingSpinner 
                    isLoading={loading} 
                    brandName="Track Your Orders" 
                    loadingText="Loading your tracking information..."
                    progressColor="#3b82f6"
                  />
      <Header />
      <div className="order-tracking-page">
        {/* Header Section */}
        <div className="tracking-header">
          <h1 className="main-title">Order Status Tracking</h1>
          <div className="breadcrumb">
            <span>Home</span>
            <span className="separator">›</span>
            <span className="current">Order Status Tracking</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="tracking-container">
          <div className="tracking-card">
            <h2 className="section-title">Track Your Order Status Here</h2>
            
            <p className="instruction-text">
              To track your order please enter your Order ID in the box below and press the "Track" button. 
              This was given to you on your receipt and in the confirmation email you should have received.
            </p>

            {/* Form Section */}
            <div className="form-section">
              <div className="input-group">
                <label className="input-label">Order ID</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Found in your order confirmation email."
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Billing email</label>
                <input
                  type="email"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Email you used during checkout."
                  className="form-input"
                />
              </div>

              <button
                onClick={handleTrackOrder}
                disabled={loading}
                className={`track-button ${loading ? 'loading' : ''}`}
              >
                {loading ? 'TRACKING...' : 'TRACK'}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Order Results */}
            {orderData && (
              <div className="order-results">
                <h3 className="results-title">Order Details</h3>

                <div className="order-info-grid">
                  <div className="info-card">
                    <strong className="info-label">Order Number:</strong>
                    <div className="info-value">{orderData.orderNumber}</div>
                  </div>

                  <div className="info-card">
                    <strong className="info-label">Order Date:</strong>
                    <div className="info-value">
                      {new Date(orderData.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="info-card">
                    <strong className="info-label">Total Amount:</strong>
                    <div className="info-value">${orderData.total}</div>
                  </div>

                  <div className="info-card">
                    <strong className="info-label">Order Status:</strong>
                    <div 
                      className="status-value"
                      style={{ color: getStatusColor(orderData.status) }}
                    >
                      {orderData.status?.toUpperCase()}
                    </div>
                  </div>

                  <div className="info-card">
                    <strong className="info-label">Payment Status:</strong>
                    <div 
                      className="status-value"
                      style={{ color: getPaymentStatusColor(orderData.paymentStatus) }}
                    >
                      {orderData.paymentStatus?.toUpperCase()}
                    </div>
                  </div>

                  <div className="info-card">
                    <strong className="info-label">Payment Method:</strong>
                    <div className="info-value">
                      {orderData.paymentMethod?.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="order-summary">
                  <h4 className="summary-title">Order Summary</h4>
                  <div className="summary-details">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>${orderData.subtotal}</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax (13% HST):</span>
                      <span>${orderData.tax}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span>${orderData.shipping}</span>
                    </div>
                    {orderData.discount > 0 && (
                      <div className="summary-row discount">
                        <span>Discount {orderData.appliedCoupon ? `(${orderData.appliedCoupon.code})` : ''}:</span>
                        <span>-${orderData.discount}</span>
                      </div>
                    )}
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>${orderData.total}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="order-items-section">
                  <h4 className="items-title">Order Items</h4>
                  <div className="items-list">
                    {orderData.items?.map((item, index) => (
                      <div key={index} className="order-item">
                        <img
                          src={getImageUrl(item)}
                          alt={item.productId?.name || item.name || 'Product'}
                          className="item-image"
                          onError={(e) => handleImageError(e, item)}
                        />
                        <div className="item-details">
                          <div className="item-name">
                            {item.productId?.name || item.name || 'Product Name'}
                          </div>
                          <div className="item-info">
                            Quantity: {item.quantity} × ${item.productId?.price || item.price || 0}
                          </div>
                          <div className="item-total">
                            ${((item.quantity || 0) * (item.productId?.price || item.price || 0)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                {orderData.billingAddress && (
                  <div className="shipping-address">
                    <h4 className="address-title">Shipping Address</h4>
                    <div className="address-details">
                      <p>{orderData.billingAddress.firstName} {orderData.billingAddress.lastName}</p>
                      <p>{orderData.billingAddress.address}</p>
                      {orderData.billingAddress.apartment && <p>{orderData.billingAddress.apartment}</p>}
                      <p>{orderData.billingAddress.city}, {orderData.billingAddress.province} {orderData.billingAddress.postalCode}</p>
                      <p>{orderData.billingAddress.country}</p>
                      {orderData.billingAddress.phone && <p>Phone: {orderData.billingAddress.phone}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderTracking;