import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  ExternalLink
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import './PaymentManagement.css';

const PaymentManagement = ({ api, adminToken, setIsLoading, setError, handleApiError }) => {
  const [paymentStats, setPaymentStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // API configuration
  const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/payments/stats', adminToken);

      if (response.success) {
        setPaymentStats(response.data);
        setRecentPayments(response.data.recentPayments || []);
        setRefunds(response.data.refundStats || []);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
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

  const getPaymentStatusIcon = (status) => {
    const icons = {
      'success': <CheckCircle className="status-icon" />,
      'paid': <CheckCircle className="status-icon" />,
      'pending': <Clock className="status-icon" />,
      'failed': <XCircle className="status-icon" />,
      'refunded': <TrendingDown className="status-icon" />
    };
    return icons[status] || <Clock className="status-icon" />;
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'success': 'status-success',
      'paid': 'status-success',
      'pending': 'status-pending',
      'failed': 'status-failed',
      'refunded': 'status-refunded',
      'completed': 'status-success',
      'processing': 'status-processing'
    };
    return statusClasses[status] || 'status-pending';
  };

  const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Prepare chart data
  const paymentMethodData = paymentStats?.paymentMethodStats?.map(item => ({
    name: item._id === 'card' ? 'Card Payment' : 'Cash on Delivery',
    value: item.count,
    revenue: item.revenue
  })) || [];

  const revenueData = paymentStats?.paymentMethodStats?.map(item => ({
    method: item._id === 'card' ? 'Card' : 'COD',
    revenue: item.revenue
  })) || [];

  const downloadOrderPDF = async (orderId, paymentMethod) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/download-invoice/${orderId}`, {
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

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const filteredPayments = recentPayments.filter(payment => {
    const matchesSearch = payment.orderId?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || payment.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = refund.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customerInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || refund.refundStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="payment-management-container">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1>Payment Management</h1>
          <p>Monitor transactions, refunds and payment methods</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchPaymentData} className="admin-btn admin-btn-outline">
            <RefreshCw className="icon" />
            Refresh
          </button>
          <button className="admin-btn admin-btn-outline">
            <Download className="icon" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {paymentStats && (
        <div className="stats-grid">
          <div className="admin-card stats-card revenue">
            <div className="stat-item">
              <div className="stat-icon">
                <DollarSign className="icon" />
              </div>
              <div className="stat-content">
                <h3>{formatCurrency(
                  paymentStats.paymentMethodStats?.reduce((total, item) => total + item.revenue, 0) || 0
                )}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="admin-card stats-card">
            <div className="stat-item">
              <div className="stat-icon">
                <CreditCard className="icon" />
              </div>
              <div className="stat-content">
                <h3>{recentPayments.length}</h3>
                <p>Total Payments</p>
              </div>
            </div>
          </div>

          <div className="admin-card stats-card orders">
            <div className="stat-item">
              <div className="stat-icon">
                <TrendingDown className="icon" />
              </div>
              <div className="stat-content">
                <h3>{formatCurrency(paymentStats.totalRefunded || 0)}</h3>
                <p>Total Refunded</p>
              </div>
            </div>
          </div>

          <div className="admin-card stats-card users">
            <div className="stat-item">
              <div className="stat-icon">
                <RefreshCw className="icon" />
              </div>
              <div className="stat-content">
                <h3>{refunds.length}</h3>
                <p>Total Refunds</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-section">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Payment Methods Distribution</h2>
          </div>
          <div className="chart-container">
            {paymentMethodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <CreditCard className="empty-chart-icon" />
                <p>No payment data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Revenue by Payment Method</h2>
          </div>
          <div className="chart-container">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <TrendingUp className="empty-chart-icon" />
                <p>No revenue data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <CreditCard className="icon" />
          Payments ({recentPayments.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'refunds' ? 'active' : ''}`}
          onClick={() => setActiveTab('refunds')}
        >
          <TrendingDown className="icon" />
          Refunds ({refunds.length})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
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
          {activeTab === 'payments' ? (
            <>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </>
          ) : (
            <>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </>
          )}
        </select>

        <button className="admin-btn admin-btn-outline">
          <Filter className="icon" />
          More Filters
        </button>
      </div>

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Recent Payments</h2>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading payments...</p>
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id}>
                      <td>
                        <div className="transaction-id">
                          <span className="tx-id">{payment.stripePaymentIntentId || payment._id.slice(-8)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="order-info">
                          <span className="order-number">
                            #{payment.orderId?.orderNumber}
                            {payment.transactionDetails?.firstOrderDiscount &&
                              parseFloat(payment.transactionDetails.firstOrderDiscount) > 0 && (
                                <span style={{
                                  marginLeft: '6px',
                                  padding: '2px 6px',
                                  background: '#10b981',
                                  color: 'white',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: '600'
                                }}>
                                  First Order
                                </span>
                              )}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="customer-info">
                          <span className="customer-name">
                            {payment.isGuestOrder || !payment.userId ? (
                              <>
                                {payment.customerInfo?.firstName} {payment.customerInfo?.lastName}
                                <span className="guest-badge" style={{
                                  marginLeft: '6px',
                                  padding: '2px 6px',
                                  background: '#fbbf24',
                                  color: '#78350f',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: '600'
                                }}>
                                  Guest
                                </span>
                              </>
                            ) : (
                              payment.orderId?.userId?.name || 'Unknown'
                            )}
                          </span>
                          <span className="customer-email">
                            {payment.isGuestOrder || !payment.userId ? (
                              payment.customerInfo?.email
                            ) : (
                              payment.orderId?.userId?.email
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="amount">{formatCurrency(payment.amount)}</td>
                      <td>
                        <span className="payment-method">{payment.paymentMethod}</span>
                      </td>
                      <td>
                        <div className="status-cell">
                          {getPaymentStatusIcon(payment.paymentStatus)}
                          <span className={`status-badge ${getStatusBadgeClass(payment.paymentStatus)}`}>
                            {payment.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="date">{formatDate(payment.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => viewPaymentDetails(payment)}
                            className="admin-btn admin-btn-outline"
                            title="View details"
                          >
                            <Eye className="icon" />
                          </button>
                          <button
                            onClick={() => downloadOrderPDF(payment.orderId?._id, payment.paymentMethod)}
                            className="admin-btn admin-btn-secondary"
                            title={`Download ${payment.paymentMethod === 'cod' ? 'Bill' : 'Paid Invoice'}`}
                          >
                            <FileText className="icon" />
                          </button>
                          <button
                            onClick={() => viewOrderPDF(payment.orderId?._id, payment.paymentMethod)}
                            className="admin-btn admin-btn-outline"
                            title={`View ${payment.paymentMethod === 'cod' ? 'Bill' : 'Paid Invoice'}`}
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
              <CreditCard className="empty-state-icon" />
              <h3>No payments found</h3>
              <p>No payments match your search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Refunds Tab */}
      {activeTab === 'refunds' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Refund Transactions</h2>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading refunds...</p>
            </div>
          ) : filteredRefunds.length > 0 ? (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Refund ID</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRefunds.map((refund) => (
                    <tr key={refund._id}>
                      <td>
                        <div className="refund-id">
                          <span className="rf-id">{refund.stripeRefundId || refund._id.slice(-8)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="order-info">
                          <span className="order-number">#{refund.orderNumber}</span>
                        </div>
                      </td>
                      <td>
                        <div className="customer-info">
                          <span className="customer-name">
                            {refund.customerInfo?.firstName} {refund.customerInfo?.lastName}
                          </span>
                          <span className="customer-email">{refund.customerInfo?.email}</span>
                        </div>
                      </td>
                      <td className="amount refund-amount">{formatCurrency(refund.refundAmount)}</td>
                      <td>
                        <span className="refund-reason">{refund.refundReason || 'Customer request'}</span>
                      </td>
                      <td>
                        <div className="status-cell">
                          {getPaymentStatusIcon(refund.refundStatus)}
                          <span className={`status-badge ${getStatusBadgeClass(refund.refundStatus)}`}>
                            {refund.refundStatus}
                          </span>
                        </div>
                      </td>
                      <td className="date">{formatDate(refund.createdAt)}</td>
                      <td>
                        <button
                          onClick={() => viewPaymentDetails(refund)}
                          className="admin-btn admin-btn-outline"
                          title="View details"
                        >
                          <Eye className="icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <TrendingDown className="empty-state-icon" />
              <h3>No refunds found</h3>
              <p>No refunds match your search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentDetails && selectedPayment && (
        <div className="admin-modal-overlay" onClick={() => setShowPaymentDetails(false)}>
          <div className="admin-modal large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {activeTab === 'payments' ? 'Payment Details' : 'Refund Details'}
              </h3>
              <button
                className="admin-modal-close"
                onClick={() => setShowPaymentDetails(false)}
              >
                ×
              </button>
            </div>

            <div className="admin-payment-modal-content">
              <div className="payment-details">
                <div className="detail-row">
                  <span className="detail-label">Transaction ID:</span>
                  <span className="detail-value">
                    {selectedPayment.stripePaymentIntentId || selectedPayment._id}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value amount">
                    {formatCurrency(selectedPayment.amount || selectedPayment.refundAmount)}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${getStatusBadgeClass(selectedPayment.paymentStatus || selectedPayment.refundStatus)}`}>
                    {selectedPayment.paymentStatus || selectedPayment.refundStatus}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Method:</span>
                  <span className="detail-value">{selectedPayment.paymentMethod || 'Refund'}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(selectedPayment.createdAt)}</span>
                </div>

                {selectedPayment.refundReason && (
                  <div className="detail-row">
                    <span className="detail-label">Reason:</span>
                    <span className="detail-value">{selectedPayment.refundReason}</span>
                  </div>
                )}

                {selectedPayment.orderId && (
                  <div className="detail-row">
                    <span className="detail-label">Order:</span>
                    <span className="detail-value">#{selectedPayment.orderId.orderNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                className="admin-btn admin-btn-outline"
                onClick={() => setShowPaymentDetails(false)}
              >
                Close
              </button>
              {selectedPayment.orderId && (
                <>
                  <button
                    className="admin-btn admin-btn-secondary"
                    onClick={() => downloadOrderPDF(selectedPayment.orderId._id || selectedPayment.orderId, selectedPayment.paymentMethod)}
                  >
                    <FileText className="icon" />
                    Download {selectedPayment.paymentMethod === 'cod' ? 'Bill' : 'Paid Invoice'}
                  </button>
                  <button
                    className="admin-btn admin-btn-outline"
                    onClick={() => viewOrderPDF(selectedPayment.orderId._id || selectedPayment.orderId, selectedPayment.paymentMethod)}
                  >
                    <ExternalLink className="icon" />
                    View {selectedPayment.paymentMethod === 'cod' ? 'Bill' : 'Paid Invoice'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;