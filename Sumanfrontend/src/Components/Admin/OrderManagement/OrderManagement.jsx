import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Eye, 
  Edit, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  Mail
} from 'lucide-react';
import './OrderManagement.css';

// API configuration
const API_BASE_URL = 'http://localhost:8000/api';

const OrderManagement = ({ api, adminToken, setIsLoading, setError, handleApiError }) => {
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, [currentPage, searchTerm, statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(paymentFilter && { paymentStatus: paymentFilter })
      });
      
      const response = await api.get(`/admin/orders/stats?${params}`, adminToken);
      
      if (response.success) {
        setOrders(response.data.recentOrdersDetails || []);
        // Note: Add pagination info to API response
        setTotalPages(Math.ceil((response.data.totalOrders || 0) / 10));
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await api.get('/admin/orders/stats', adminToken);
      
      if (response.success) {
        setOrderStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setIsLoading(true);
      
      const response = await api.put(`/orders/${selectedOrder._id}/status`, {
        status: newStatus
      }, adminToken);
      
      if (response.success) {
        setOrders(prev => prev.map(order => 
          order._id === selectedOrder._id 
            ? { ...order, status: newStatus }
            : order
        ));
        setShowStatusUpdateModal(false);
        setNewStatus('');
        setSelectedOrder(null);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/orders/${orderId}`, adminToken);
      
      if (response.success) {
        setSelectedOrder(response.data);
        setShowOrderDetails(true);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadOrderPDF = async (orderId, type = 'invoice') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/pdf/${type}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${orderId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <Clock className="status-icon" />,
      'confirmed': <CheckCircle className="status-icon" />,
      'processing': <Package className="status-icon" />,
      'shipped': <Truck className="status-icon" />,
      'delivered': <CheckCircle className="status-icon" />,
      'cancelled': <XCircle className="status-icon" />
    };
    return icons[status] || <Clock className="status-icon" />;
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="order-management-container">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1>Order Management</h1>
          <p>Track and manage customer orders and deliveries</p>
        </div>
        <div className="header-actions">
          <button className="admin-btn admin-btn-outline">
            <Download className="icon" />
            Export Orders
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {orderStats && (
        <div className="stats-grid">
          <div className="admin-card stats-card">
            <div className="stat-item">
              <div className="stat-icon">
                <ShoppingBag className="icon" />
              </div>
              <div className="stat-content">
                <h3>{orderStats.totalOrders || 0}</h3>
                <p>Total Orders</p>
              </div>
            </div>
          </div>

          <div className="admin-card stats-card orders">
            <div className="stat-item">
              <div className="stat-icon">
                <Clock className="icon" />
              </div>
              <div className="stat-content">
                <h3>{orderStats.todayOrders || 0}</h3>
                <p>Today's Orders</p>
              </div>
            </div>
          </div>

          <div className="admin-card stats-card users">
            <div className="stat-item">
              <div className="stat-icon">
                <CheckCircle className="icon" />
              </div>
              <div className="stat-content">
                <h3>{orderStats.pendingOrders || 0}</h3>
                <p>Pending Orders</p>
              </div>
            </div>
          </div>

          <div className="admin-card stats-card revenue">
            <div className="stat-item">
              <div className="stat-icon">
                <XCircle className="icon" />
              </div>
              <div className="stat-content">
                <h3>{orderStats.cancelledOrders || 0}</h3>
                <p>Cancelled Orders</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search orders by order number, customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-form-select"
        >
          <option value="">All Status</option>
          {statusOptions.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
        
        <select 
          value={paymentFilter} 
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="admin-form-select"
        >
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        
        <button className="admin-btn admin-btn-outline">
          <Filter className="icon" />
          More Filters
        </button>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">All Orders</h2>
          <span className="order-count">{orders.length} orders</span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Details</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div className="order-info">
                        <span className="order-number">#{order.orderNumber}</span>
                        <span className="order-items">{order.items?.length || 0} items</span>
                      </div>
                    </td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">
                          {order.userId?.name || `${order.billingAddress?.firstName} ${order.billingAddress?.lastName}`}
                        </span>
                        <span className="customer-email">
                          {order.userId?.email || order.contactInfo?.email}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        {getStatusIcon(order.status)}
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="payment-info">
                        <span className={`payment-badge ${order.paymentStatus === 'paid' ? 'payment-paid' : order.paymentStatus === 'failed' ? 'payment-failed' : 'payment-pending'}`}>
                          {order.paymentStatus}
                        </span>
                        <span className="payment-method">{order.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="amount">{formatCurrency(order.orderSummary?.total)}</td>
                    <td className="date">{formatDate(order.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => viewOrderDetails(order._id)}
                          className="admin-btn admin-btn-outline"
                          title="View details"
                        >
                          <Eye className="icon" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            setShowStatusUpdateModal(true);
                          }}
                          className="admin-btn admin-btn-primary"
                          title="Update status"
                        >
                          <Edit className="icon" />
                        </button>
                        <button
                          onClick={() => downloadOrderPDF(order._id, 'invoice')}
                          className="admin-btn admin-btn-secondary"
                          title="Download invoice"
                        >
                          <FileText className="icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <ShoppingBag className="empty-state-icon" />
            <h3>No orders found</h3>
            <p>No orders match your search criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="admin-btn admin-btn-outline"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`admin-btn ${currentPage === page ? 'admin-btn-primary' : 'admin-btn-outline'}`}
              >
                {page}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="admin-btn admin-btn-outline"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setShowOrderDetails(false)}>
          <div className="admin-modal large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Order Details - #{selectedOrder.orderNumber}</h3>
              <button
                className="admin-modal-close"
                onClick={() => setShowOrderDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              {/* Order Status and Basic Info */}
              <div className="order-header-section">
                <div className="order-status-display">
                  {getStatusIcon(selectedOrder.status)}
                  <span className={`status-badge large ${getStatusBadgeClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="order-meta">
                  <p><strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                  <p><strong>Payment Status:</strong> 
                    <span className={`payment-badge ${selectedOrder.paymentStatus === 'paid' ? 'payment-paid' : selectedOrder.paymentStatus === 'failed' ? 'payment-failed' : 'payment-pending'}`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </p>
                </div>
              </div>

              {/* Customer Information */}
              <div className="section">
                <h4>Customer Information</h4>
                <div className="customer-details">
                  <p><strong>Name:</strong> {selectedOrder.billingAddress?.firstName} {selectedOrder.billingAddress?.lastName}</p>
                  <p><strong>Email:</strong> {selectedOrder.contactInfo?.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.billingAddress?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Billing Address */}
              <div className="section">
                <h4>Billing Address</h4>
                <div className="address">
                  <p>{selectedOrder.billingAddress?.address}</p>
                  <p>{selectedOrder.billingAddress?.city}, {selectedOrder.billingAddress?.province}</p>
                  <p>{selectedOrder.billingAddress?.postalCode}, {selectedOrder.billingAddress?.country}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="section">
                <h4>Order Items</h4>
                <div className="order-items">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-image">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} />
                        ) : (
                          <Package className="icon" />
                        )}
                      </div>
                      <div className="item-details">
                        <h5>{item.name}</h5>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: {formatCurrency(item.price)}</p>
                      </div>
                      <div className="item-total">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="section">
                <h4>Order Summary</h4>
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.orderSummary?.subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax:</span>
                    <span>{formatCurrency(selectedOrder.orderSummary?.tax)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>{formatCurrency(selectedOrder.orderSummary?.shipping)}</span>
                  </div>
                  {selectedOrder.orderSummary?.discount > 0 && (
                    <div className="summary-row">
                      <span>Discount:</span>
                      <span>-{formatCurrency(selectedOrder.orderSummary.discount)}</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span><strong>Total:</strong></span>
                    <span><strong>{formatCurrency(selectedOrder.orderSummary?.total)}</strong></span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="admin-modal-actions">
              <button 
                className="admin-btn admin-btn-outline"
                onClick={() => setShowOrderDetails(false)}
              >
                Close
              </button>
              <button 
                className="admin-btn admin-btn-secondary"
                onClick={() => downloadOrderPDF(selectedOrder._id, 'invoice')}
              >
                <FileText className="icon" />
                Download Invoice
              </button>
              <button 
                className="admin-btn admin-btn-primary"
                onClick={() => {
                  setNewStatus(selectedOrder.status);
                  setShowStatusUpdateModal(true);
                }}
              >
                <Edit className="icon" />
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusUpdateModal && selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setShowStatusUpdateModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Update Order Status</h3>
              <button
                className="admin-modal-close"
                onClick={() => setShowStatusUpdateModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="current-status">
                <p><strong>Current Status:</strong></p>
                <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              
              <div className="admin-form-group">
                <label className="admin-form-label">New Status</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="admin-form-select"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="admin-modal-actions">
              <button 
                className="admin-btn admin-btn-outline"
                onClick={() => setShowStatusUpdateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="admin-btn admin-btn-primary"
                onClick={handleStatusUpdate}
                disabled={newStatus === selectedOrder.status}
              >
                <Edit className="icon" />
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;