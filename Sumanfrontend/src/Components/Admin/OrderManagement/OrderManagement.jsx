import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  ExternalLink,
  Edit,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  Truck,
  Eye
} from 'lucide-react';
import './OrderManagement.css';

// API configuration
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

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
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');

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

      const updateData = {
        status: newStatus
      };

      // Add tracking number if provided
      if (trackingNumber.trim()) {
        updateData.trackingNumber = trackingNumber.trim();
      }

      // Add estimated delivery date if provided
      if (estimatedDeliveryDate) {
        updateData.estimatedDeliveryDate = estimatedDeliveryDate;
      }

      const response = await api.put(`/orders/${selectedOrder._id}/status`, updateData, adminToken);

      if (response.success) {
        setOrders(prev => prev.map(order =>
          order._id === selectedOrder._id
            ? { 
                ...order, 
                status: newStatus,
                trackingNumber: trackingNumber || order.trackingNumber,
                estimatedDeliveryDate: estimatedDeliveryDate || order.estimatedDeliveryDate
              }
            : order
        ));
        setShowStatusUpdateModal(false);
        setNewStatus('');
        setTrackingNumber('');
        setEstimatedDeliveryDate('');
        setSelectedOrder(null);

        // Show success message
        alert(`✅ Order status updated to "${newStatus}". Customer will receive an email notification.`);
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
      const response = await api.get(`/admin/orders/${orderId}`, adminToken);

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

  const downloadOrderPDF = async (orderId, paymentMethod) => {
    try {
      const response = await fetch(`${API_BASE_URL}api/invoices/download-invoice/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const pdfType = paymentMethod === 'cod' ? 'Bill' : 'Invoice';
        a.download = `${pdfType}-${orderId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download PDF:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const viewOrderPDF = async (orderId, paymentMethod) => {
    try {
      const response = await fetch(`${API_BASE_URL}api/invoices/download-invoice/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Clean up the URL after a delay to ensure the PDF loads
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else {
        console.error('Failed to view PDF:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error viewing PDF:', error);
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
                        {order.orderSummary?.firstOrderDiscount && parseFloat(order.orderSummary.firstOrderDiscount) > 0 && (
                          <span className="first-order-badge" style={{
                            marginLeft: '6px',
                            padding: '2px 8px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: '600'
                          }}>
                            First Order
                          </span>
                        )}
                        <span className="order-items">{order.items?.length || 0} items</span>
                      </div>
                    </td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">
                          {order.customerInfo?.name ||
                            order.userId?.name ||
                            `${order.billingAddress?.firstName} ${order.billingAddress?.lastName}`}
                          {(order.isGuestOrder || order.customerInfo?.isGuest) && (
                            <span className="guest-badge" style={{
                              marginLeft: '8px',
                              padding: '2px 6px',
                              background: '#fbbf24',
                              color: '#78350f',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: '600'
                            }}>
                              Guest
                            </span>
                          )}
                        </span>
                        <span className="customer-email">
                          {order.customerInfo?.email ||
                            order.userId?.email ||
                            order.contactInfo?.email}
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
                            setTrackingNumber(order.trackingNumber || '');
                            setEstimatedDeliveryDate(order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : '');
                            setShowStatusUpdateModal(true);
                          }}
                          className="admin-btn admin-btn-primary"
                          title="Update status"
                        >
                          <Edit className="icon" />
                        </button>
                        <button
                          onClick={() => downloadOrderPDF(order._id, order.paymentMethod)}
                          className="admin-btn admin-btn-secondary"
                          title={`Download ${order.paymentMethod === 'cod' ? 'Bill' : 'Paid Invoice'}`}
                        >
                          <FileText className="icon" />
                        </button>
                        <button
                          onClick={() => viewOrderPDF(order._id, order.paymentMethod)}
                          className="admin-btn admin-btn-outline"
                          title={`View ${order.paymentMethod === 'cod' ? 'Bill' : 'Paid Invoice'}`}
                        >
                          <ExternalLink className="icon" />
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

            <div className="admin-order-modal-content">
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
                onClick={() => downloadOrderPDF(selectedOrder._id, selectedOrder.paymentMethod)}
              >
                <FileText className="icon" />
                Download {selectedOrder.paymentMethod === 'cod' ? 'Bill' : 'Paid Invoice'}
              </button>
              <button
                className="admin-btn admin-btn-outline"
                onClick={() => viewOrderPDF(selectedOrder._id, selectedOrder.paymentMethod)}
              >
                <ExternalLink className="icon" />
                View {selectedOrder.paymentMethod === 'cod' ? 'Bill' : 'Paid Invoice'}
              </button>
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => {
                  setNewStatus(selectedOrder.status);
                  setTrackingNumber(selectedOrder.trackingNumber || '');
                  setEstimatedDeliveryDate(selectedOrder.estimatedDeliveryDate ? new Date(selectedOrder.estimatedDeliveryDate).toISOString().split('T')[0] : '');
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
        <div className="admin-order-modal-overlay" onClick={() => setShowStatusUpdateModal(false)}>
          <div className="admin-order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-order-modal-header">
              <h3 className="admin-order-modal-title">Update Order Status</h3>
              <button
                className="admin-order-modal-close"
                onClick={() => setShowStatusUpdateModal(false)}
              >
                ×
              </button>
            </div>

            <div className="admin-order-modal-content">
              <div className="current-status">
                <p><strong>Current Status:</strong></p>
                <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">New Status *</label>
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
              {/* Tracking Number Field - Show for shipped/delivered status */}
              {(newStatus === 'shipped' || newStatus === 'delivered') && (
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Tracking Number {newStatus === 'shipped' && '(Optional)'}
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="admin-form-input"
                  />
                  <small className="form-help-text">
                    Tracking number will be sent to customer via email
                  </small>
                </div>
              )}

              {/* Estimated Delivery Date - Show for processing/shipped status */}
              {(newStatus === 'processing' || newStatus === 'shipped') && (
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Estimated Delivery Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="admin-form-input"
                  />
                  <small className="form-help-text">
                    Expected delivery date for customer reference
                  </small>
                </div>
              )}

              {/* Email Notification Info */}
              {(newStatus === 'processing' || newStatus === 'shipped' || newStatus === 'delivered') && (
                <div style={{
                  background: '#e3f2fd',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px',
                  border: '1px solid #90caf9'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1976d2', fontWeight: '500' }}>
                    📧 Email Notification
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
                    Customer will receive an automated email notification about this status update to <strong>{selectedOrder.contactInfo?.email}</strong>
                  </p>
                </div>
              )}
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