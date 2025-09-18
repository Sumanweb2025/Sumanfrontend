import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  TrendingUp,
  TrendingDown,
  Eye,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import './Dashboard.css';

const Dashboard = ({ api, adminToken, setIsLoading, setError, handleApiError }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await api.get('/admin/dashboard/overview', adminToken);
      console.log('Dashboard API Response:', response);
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // FIXED: Proper rating stars display
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating % 1) >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="rating-stars">
        {/* Full stars */}
        {Array(fullStars).fill(0).map((_, index) => (
          <Star key={`full-${index}`} className="star-icon filled" />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <Star key="half" className="star-icon half-filled" />
        )}
        
        {/* Empty stars */}
        {Array(emptyStars).fill(0).map((_, index) => (
          <Star key={`empty-${index}`} className="star-icon" />
        ))}
      </div>
    );
  };

  // Chart colors
  const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading && !dashboardData) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-error">
        <AlertCircle className="error-icon" />
        <h3>Failed to load dashboard</h3>
        <p>Unable to fetch dashboard data. Please try refreshing the page.</p>
        <button onClick={() => fetchDashboardData()} className="admin-btn admin-btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const { stats, recentOrders, topProducts, orderStatus } = dashboardData;

  // Prepare chart data
  const orderStatusData = orderStatus?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const revenueComparisonData = [
    { name: 'Today', amount: stats?.todayRevenue || 0 },
    { name: 'Monthly', amount: stats?.monthlyRevenue || 0 },
    { name: 'Total', amount: stats?.totalRevenue || 0 }
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your business today.</p>
        </div>
        <button 
          onClick={() => fetchDashboardData(true)} 
          className={`admin-btn admin-btn-outline ${refreshing ? 'refreshing' : ''}`}
          disabled={refreshing}
        >
          <RefreshCw className={`icon ${refreshing ? 'spinning' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="admin-card stats-card revenue">
          <div className="stat-item">
            <div className="stat-icon">
              <DollarSign className="icon" />
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(stats?.totalRevenue)}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <TrendingUp className="icon" />
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(stats?.todayRevenue)}</h3>
              <p>Today's Revenue</p>
            </div>
          </div>
        </div>

        <div className="admin-card stats-card orders">
          <div className="stat-item">
            <div className="stat-icon">
              <ShoppingBag className="icon" />
            </div>
            <div className="stat-content">
              <h3>{formatNumber(stats?.totalOrders)}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <Clock className="icon" />
            </div>
            <div className="stat-content">
              <h3>{stats?.todayOrders || 0}</h3>
              <p>Today's Orders</p>
            </div>
          </div>
        </div>

        <div className="admin-card stats-card users">
          <div className="stat-item">
            <div className="stat-icon">
              <Users className="icon" />
            </div>
            <div className="stat-content">
              <h3>{formatNumber(stats?.totalUsers)}</h3>
              <p>Total Users</p>
            </div>
          </div>
        </div>

        <div className="admin-card stats-card">
          <div className="stat-item">
            <div className="stat-icon">
              <Package className="icon" />
            </div>
            <div className="stat-content">
              <h3>{formatNumber(stats?.totalProducts)}</h3>
              <p>Total Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Data */}
      <div className="chart-section">
        {/* Revenue Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Revenue Overview</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Order Status Distribution</h2>
          </div>
          <div className="chart-container">
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <AlertCircle className="empty-state-icon" />
                <h3>No order data available</h3>
                <p>Order status distribution will appear here once you have orders.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Recent Orders</h2>
            <button className="admin-btn admin-btn-outline">
              <Eye className="icon" />
              View All
            </button>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="dashboard-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <span className="order-number">{order.orderNumber}</span>
                      </td>
                      <td>
                        <div className="customer-info">
                          <span className="customer-name">{order.userId?.name || 'N/A'}</span>
                          <span className="customer-email">{order.userId?.email || ''}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="amount">{formatCurrency(order.orderSummary?.total)}</td>
                      <td className="date">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <ShoppingBag className="empty-state-icon" />
              <h3>No recent orders</h3>
              <p>Recent orders will appear here once customers start placing orders.</p>
            </div>
          )}
        </div>

        {/* Top Products - FIXED */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Top Rated Products</h2>
            <button className="admin-btn admin-btn-outline">
              <Eye className="icon" />
              View All
            </button>
          </div>
          {topProducts && topProducts.length > 0 ? (
            <div className="products-list">
              {topProducts.map((item, index) => (
                <div key={item._id || index} className="product-item">
                  <div className="product-rank">#{index + 1}</div>
                  <div className="product-info">
                    <h4 className="product-name">{item.product?.name || 'Unknown Product'}</h4>
                    <div className="product-rating">
                      {renderRatingStars(item.avgRating || 0)}
                      <span className="rating-value">
                        {item.avgRating ? item.avgRating.toFixed(1) : '0.0'}/5.0
                      </span>
                      <span className="rating-count">
                        ({item.reviewCount || 0} {item.reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                      {item.product?.price && (
                        <span className="product-price">
                          {formatCurrency(item.product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Star className="empty-state-icon" />
              <h3>No product reviews yet</h3>
              <p>Top rated products will appear here once customers start leaving reviews.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;