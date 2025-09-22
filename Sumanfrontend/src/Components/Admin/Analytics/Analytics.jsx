import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  Activity,
  DollarSign,
  ShoppingBag,
  Users
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import './Analytics.css';

const Analytics = ({ api, adminToken, setIsLoading, setError, handleApiError }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const periodOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/analytics?period=${period}`, adminToken);

      if (response.success) {
        setAnalyticsData(response.data);
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
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  const formatDate = (dateObj) => {
    if (period === '7d' || period === '30d') {
      return `${dateObj.month}/${dateObj.day}`;
    } else if (period === '3m' || period === '1y') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[dateObj.month - 1];
    }
    return `${dateObj.month}/${dateObj.year}`;
  };

  const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Prepare chart data
  const revenueChartData = analyticsData?.revenueData?.map(item => ({
    date: formatDate(item._id),
    revenue: item.revenue,
    orders: item.orderCount
  })) || [];

  const salesChartData = analyticsData?.salesData?.map(item => ({
    date: formatDate(item._id),
    orders: item.orders,
    revenue: item.revenue
  })) || [];

  const topProductsData = analyticsData?.topSellingProducts?.slice(0, 5).map(item => ({
    name: item.product?.name || 'Unknown Product',
    sold: item.totalSold,
    revenue: item.revenue
  })) || [];

  // Calculate growth percentages (mock data for demonstration)
  const calculateGrowth = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const totalRevenue = revenueChartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = salesChartData.reduce((sum, item) => sum + item.orders, 0);
  const averageOrderValue = totalRevenue / totalOrders || 0;

  // Mock growth data (in a real app, this would come from comparing periods)
  const growthData = {
    revenue: 12.5,
    orders: 8.3,
    customers: 15.2,
    conversion: -2.1
  };

  const exportData = () => {
    const dataToExport = {
      period,
      totalRevenue,
      totalOrders,
      averageOrderValue,
      revenueData: revenueChartData,
      salesData: salesChartData,
      topProducts: topProductsData
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Track sales performance, revenue trends and customer insights</p>
        </div>
        <div className="header-actions">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="admin-form-select"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button onClick={fetchAnalyticsData} className="admin-btn admin-btn-outline">
            <RefreshCw className="icon" />
            Refresh
          </button>
          <button onClick={exportData} className="admin-btn admin-btn-outline">
            <Download className="icon" />
            Export Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="admin-card metric-card revenue-metric">
              <div className="metric-header">
                <div className="metric-icon">
                  <DollarSign className="icon" />
                </div>
                <div className="metric-growth positive">
                  <TrendingUp className="growth-icon" />
                  <span>+{growthData.revenue}%</span>
                </div>
              </div>
              <div className="metric-content">
                <h3>{formatCurrency(totalRevenue)}</h3>
                <p>Total Revenue</p>
              </div>
            </div>

            <div className="admin-card metric-card orders-metric">
              <div className="metric-header">
                <div className="metric-icon">
                  <ShoppingBag className="icon" />
                </div>
                <div className="metric-growth positive">
                  <TrendingUp className="growth-icon" />
                  <span>+{growthData.orders}%</span>
                </div>
              </div>
              <div className="metric-content">
                <h3>{formatNumber(totalOrders)}</h3>
                <p>Total Orders</p>
              </div>
            </div>

            <div className="admin-card metric-card customers-metric">
              <div className="metric-header">
                <div className="metric-icon">
                  <Users className="icon" />
                </div>
                <div className="metric-growth positive">
                  <TrendingUp className="growth-icon" />
                  <span>+{growthData.customers}%</span>
                </div>
              </div>
              <div className="metric-content">
                <h3>{formatCurrency(averageOrderValue)}</h3>
                <p>Avg Order Value</p>
              </div>
            </div>

            <div className="admin-card metric-card conversion-metric">
              <div className="metric-header">
                <div className="metric-icon">
                  <Activity className="icon" />
                </div>
                <div className="metric-growth negative">
                  <TrendingDown className="growth-icon" />
                  <span>{growthData.conversion}%</span>
                </div>
              </div>
              <div className="metric-content">
                <h3>{((totalOrders / (totalOrders * 1.2)) * 100).toFixed(1)}%</h3>
                <p>Conversion Rate</p>
              </div>
            </div>
          </div>

          {/* Main Charts */}
          <div className="charts-grid">
            {/* Revenue Trend */}
            <div className="admin-card chart-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Revenue Trend</h2>
                <div className="chart-controls">
                  <button
                    className={`chart-btn ${selectedMetric === 'revenue' ? 'active' : ''}`}
                    onClick={() => setSelectedMetric('revenue')}
                  >
                    Revenue
                  </button>
                  <button
                    className={`chart-btn ${selectedMetric === 'orders' ? 'active' : ''}`}
                    onClick={() => setSelectedMetric('orders')}
                  >
                    Orders
                  </button>
                </div>
              </div>
              <div className="chart-container large">
                {revenueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={selectedMetric === 'revenue' ? formatCurrency : formatNumber} />
                      <Tooltip
                        formatter={(value, name) => [
                          selectedMetric === 'revenue' ? formatCurrency(value) : formatNumber(value),
                          name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey={selectedMetric}
                        stroke="#22c55e"
                        fillOpacity={1}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-chart">
                    <BarChart3 className="empty-chart-icon" />
                    <p>No revenue data available for this period</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sales Performance */}
            <div className="admin-card chart-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Sales Performance</h2>
              </div>
              <div className="chart-container">
                {salesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatNumber(value), 'Orders']} />
                      <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-chart">
                    <BarChart3 className="empty-chart-icon" />
                    <p>No sales data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="bottom-charts-grid">
            {/* Top Products */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Top Selling Products</h2>
              </div>
              {topProductsData.length > 0 ? (
                <div className="top-products-list">
                  {topProductsData.map((product, index) => (
                    <div key={index} className="product-rank-item">
                      <div className="product-rank">#{index + 1}</div>
                      <div className="product-info">
                        <h4>{product.name}</h4>
                        <div className="product-stats">
                          <span className="sold-count">{product.sold} sold</span>
                          <span className="product-revenue">{formatCurrency(product.revenue)}</span>
                        </div>
                      </div>
                      <div className="product-progress">
                        <div
                          className="progress-bar"
                          style={{ width: `${(product.sold / topProductsData[0].sold) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <BarChart3 className="empty-state-icon" />
                  <h3>No product data</h3>
                  <p>Product sales data will appear here</p>
                </div>
              )}
            </div>

            {/* Revenue Distribution */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Revenue Distribution</h2>
              </div>
              <div className="chart-container">
                {topProductsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={topProductsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {topProductsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-chart">
                    <BarChart3 className="empty-chart-icon" />
                    <p>No distribution data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;