import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Myorders.css';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://localhost:8000/';

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

      const response = await axios.get(`${API_URL}api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
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
          <h1 className="my-orders-page-title">My Orders</h1>
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
                      <span>₹{order.total}</span>
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
                          src={item.productId.imageUrl || `${API_URL}/uploads/${item.productId.image}`}
                          alt={item.productId.name}
                          onError={(e) => (e.target.src = 'https://via.placeholder.com/60')}
                        />
                        <div>
                          <p className="my-order-item-name">{item.productId.name}</p>
                          <p>Qty: {item.quantity}</p>
                          <p>₹{(item.quantity * item.productId.price).toFixed(2)}</p>
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
      <Footer />
    </>
  );
};

export default MyOrders;
