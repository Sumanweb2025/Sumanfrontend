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
  const API_URL = 'http://localhost:8000';

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
      <Banner/>
      <Footer />
    </>
  );
};

export default MyOrders;