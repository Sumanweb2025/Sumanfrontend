import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Myorders.css';
import Header from '../../Components/Header/Header';
import Banner from '../../Components/ShippingBanner/ShippingBanner';
import Footer from '../../Components/Footer/Footer';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/signin';
        return;
      }

      const response = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const canCancelOrder = (order) => {
    // Check if order status allows cancellation
    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    if (!cancellableStatuses.includes(order.status)) {
      return false;
    }

    // Check 48-hour time limit
    const orderTime = new Date(order.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime - orderTime;
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    return hoursDifference <= 48;
  };

  // Add this function for handling cancel order
  const handleCancelOrder = async (orderId, orderPaymentMethod, orderAmount) => {
    // Get cancellation reason from user
    const reason = prompt('Please provide a reason for cancelling this order (optional):');

    // Show different confirmation messages based on payment method
    let confirmMessage = 'Are you sure you want to cancel this order?';
    if (orderPaymentMethod === 'card') {
      confirmMessage += `\n\nRefund of $${orderAmount.toFixed(2)} will be initiated and processed within 3-5 business days.`;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Send reason in request body
      const response = await axios.put(
        `${API_URL}/api/orders/${orderId}/cancel`,
        {
          reason: reason || 'Customer requested cancellation'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Show different success messages based on payment method
        let successMessage = 'Order cancelled successfully!';

        if (orderPaymentMethod === 'card') {
          successMessage += `\n\nRefund Details:
        • Amount: $${orderAmount.toFixed(2)} CAD
        • Status: Processing
        • Expected in your account: 3-5 business days
        
        You will receive a confirmation email with refund details.`;
        } else if (orderPaymentMethod === 'cod') {
          successMessage += '\n\nSince this was a COD order, no refund processing is needed.';
        }

        alert(successMessage);
        fetchOrders(); // Refresh the orders list
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel order. Please try again or contact customer service.';
      alert(errorMessage);
    }
  };

  // Helper function to get the correct image URL
  const getImageUrl = (item) => {
    // Priority order based on your backend logic:
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

  return (
    <>
      <LoadingSpinner
        isLoading={loading}
        brandName="My Orders"
        loadingText="Loading your orders..."
        progressColor="#3b82f6"
      />
      <Header />
      <div className="my-orders-page">
        <div className="my-orders-container">
          <h1 className="main-title text-animate my-orders-page-title">My Orders</h1>
          {loading ? (
            <p className="loading-text">Loading your orders...</p>
          ) : orders.length === 0 ? (
            <p className="no-orders">You have not placed any orders yet.</p>
          ) : (
            <div className="my-orders-list">
              {orders.map((order) => (
                <div key={order._id} className="my-order-card">
                  <div className="my-order-header">
                    <div>
                      <span className="my-order-label">Order No:</span>
                      <span>{order.orderNumber}</span>
                    </div>
                    <div>
                      <span className="my-order-label">Date:</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="my-order-details">
                    <div>
                      <span className="my-order-label">Total:</span>
                      <span>
                        $
                        {(order.orderSummary?.total ?? order.total)?.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="my-order-label">Payment:</span>
                      <span>{order.paymentMethod.toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="my-order-label">Status:</span>
                      <span className={`my-order-status ${order.status}`}>{order.status}</span>
                    </div>
                    {/* ADD THIS NEW REFUND STATUS DISPLAY */}
                    {order.status === 'cancelled' && order.paymentMethod === 'card' && order.refundStatus && order.refundStatus !== 'none' && (
                      <div>
                        <span className="my-order-label">Refund:</span>
                        <span className={`my-order-refund-status ${order.refundStatus}`}>
                          {order.refundStatus.charAt(0).toUpperCase() + order.refundStatus.slice(1)}
                        </span>
                      </div>
                    )}

                    {/* ADD CANCELLATION REASON DISPLAY */}
                    {order.status === 'cancelled' && order.cancellationReason && (
                      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                        <span className="my-order-label">Reason:</span>
                        <span>{order.cancellationReason}</span>
                      </div>
                    )}

                    {/* UPDATE THE CANCEL BUTTON CALL */}
                    {canCancelOrder(order) && (
                      <div>
                        <button
                          className="cancel-order-btn"
                          onClick={() => handleCancelOrder(order._id, order.paymentMethod, order.orderSummary?.total ?? order.total)}
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="my-order-items">
                    {order.items.map((item) => (
                      <div key={item._id} className="my-order-item">
                        <img
                          src={getImageUrl(item)}
                          alt={item.name || item.productId?.name || 'Product'}
                          onError={(e) => handleImageError(e, item)}
                        />
                        <div>
                          <p className="my-order-item-name">
                            {item.name || item.productId?.name || 'Product Name'}
                          </p>
                          <p>Qty: {item.quantity}</p>
                          <p>${(item.quantity * (item.price || item.productId?.price || 0)).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Banner />
      <Footer />
    </>
  );
};

export default MyOrders;