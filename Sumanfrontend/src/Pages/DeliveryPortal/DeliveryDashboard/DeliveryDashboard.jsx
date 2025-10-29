import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  Truck,
  User,
  AlertCircle,
  Bell,
  Menu,
  X,
  Home,
  List,
  BarChart,
  Settings,
  Navigation,
  Calendar,
  FileText
} from 'lucide-react';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeDeliveryTab, setActiveDeliveryTab] = useState('pending');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const deliveryPerson = JSON.parse(localStorage.getItem('deliveryPerson') || '{}');
  const token = localStorage.getItem('deliveryToken');
  const API_URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    if (!token) {
      navigate('/delivery/login');
      return;
    }
    fetchAllData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [activeDeliveryTab]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchDeliveries(),
      fetchStats(),
      fetchNotifications()
    ]);
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch deliveries based on active tab
      let url = `${API_URL}api/delivery/my-deliveries`;
      if (activeDeliveryTab === 'completed') {
        url += '?status=delivered';
      } else if (activeDeliveryTab === 'failed') {
        url += '?status=failed';
      }

      console.log('Fetching deliveries from:', url);
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Deliveries response:', response.data);
      
      if (response.data && response.data.data) {
        setDeliveries(response.data.data);
      } else {
        setDeliveries([]);
      }
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
      setError('Failed to fetch deliveries');
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${API_URL}api/delivery/my-stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('Stats response:', response.data);
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${API_URL}api/delivery/my-deliveries`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Create notifications for new/pending deliveries
      const newDeliveries = response.data.data.filter(d => 
        d.deliveryStatus === 'assigned' && 
        !d.notificationRead
      );
      
      setNotifications(newDeliveries.map(d => ({
        id: d._id,
        message: `New delivery assigned: Order #${d.orderNumber}`,
        time: new Date(d.assignedAt).toLocaleString(),
        read: false
      })));
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleStatusUpdate = async (deliveryId, newStatus, notes = '') => {
    try {
      setActionLoading(deliveryId);
      
      let url = `${API_URL}api/delivery/${deliveryId}`;
      let data = {};

      if (newStatus === 'out_for_delivery') {
        url += '/out-for-delivery';
      } else if (newStatus === 'delivered') {
        url += '/delivered';
        data = { deliveryNotes: notes };
      } else if (newStatus === 'failed') {
        url += '/failed';
        data = { failureReason: notes };
      }

      await axios.put(url, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh data
      await fetchAllData();
      
      alert(`Delivery status updated to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update delivery status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('deliveryToken');
    localStorage.removeItem('deliveryPerson');
    navigate('/delivery/login');
  };

  const handleDeliveryClick = (deliveryId) => {
    navigate(`/delivery/details/${deliveryId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'green';
      case 'out_for_delivery': return 'blue';
      case 'failed': return 'red';
      default: return 'yellow';
    }
  };

  const renderDashboard = () => (
    <div className="delivery-dashboard-content">
      <div className="delivery-dashboard-header-section">
        <h2>Dashboard Overview</h2>
        <p>Welcome back, {deliveryPerson.name}!</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="delivery-dashboard-stats-grid">
          <div className="delivery-dashboard-stat-card blue">
            <div className="delivery-dashboard-stat-icon">
              <Clock />
            </div>
            <div className="delivery-dashboard-stat-info">
              <h3>{stats.pendingDeliveries || 0}</h3>
              <p>Pending Deliveries</p>
            </div>
          </div>

          <div className="delivery-dashboard-stat-card green">
            <div className="delivery-dashboard-stat-icon">
              <CheckCircle />
            </div>
            <div className="delivery-dashboard-stat-info">
              <h3>{stats.todayDeliveries || 0}</h3>
              <p>Today's Deliveries</p>
            </div>
          </div>

          <div className="delivery-dashboard-stat-card purple">
            <div className="delivery-dashboard-stat-icon">
              <TrendingUp />
            </div>
            <div className="delivery-dashboard-stat-info">
              <h3>{stats.totalDeliveries || 0}</h3>
              <p>Total Deliveries</p>
            </div>
          </div>

          <div className="delivery-dashboard-stat-card yellow">
            <div className="delivery-dashboard-stat-icon">
              <BarChart />
            </div>
            <div className="delivery-dashboard-stat-info">
              <h3>{stats.successRate || 0}%</h3>
              <p>Success Rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="delivery-dashboard-quick-actions">
        <h3>Quick Actions</h3>
        <div className="delivery-dashboard-action-buttons">
          <button 
            className="delivery-dashboard-action-btn primary"
            onClick={() => setActiveTab('deliveries')}
          >
            <List />
            <span>View All Deliveries</span>
          </button>
          <button 
            className="delivery-dashboard-action-btn secondary"
            onClick={() => {
              setActiveTab('deliveries');
              setActiveDeliveryTab('pending');
            }}
          >
            <Truck />
            <span>Pending Deliveries ({stats?.pendingDeliveries || 0})</span>
          </button>
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="delivery-dashboard-recent-deliveries">
        <h3>Recent Deliveries</h3>
        {deliveries.slice(0, 3).map(delivery => (
          <div key={delivery._id} className="delivery-dashboard-recent-delivery-card">
            <div className="delivery-dashboard-delivery-info">
              <h4>Order #{delivery.orderNumber}</h4>
              <p>{delivery.customerInfo.name}</p>
            </div>
            <span className={`delivery-dashboard-status-badge ${getStatusColor(delivery.deliveryStatus)}`}>
              {delivery.deliveryStatus.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDeliveries = () => (
    <div className="delivery-dashboard-deliveries-content">
      <div className="delivery-dashboard-deliveries-header">
        <h2>My Deliveries</h2>
        <button className="delivery-dashboard-refresh-btn" onClick={fetchAllData}>
          <TrendingUp />
          <span>Refresh</span>
        </button>
      </div>

      {/* Delivery Tabs */}
      <div className="delivery-dashboard-delivery-tabs">
        <button
          className={`delivery-dashboard-tab-btn ${activeDeliveryTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveDeliveryTab('pending')}
        >
          <Clock />
          <span>Pending ({stats?.pendingDeliveries || 0})</span>
        </button>
        <button
          className={`delivery-dashboard-tab-btn ${activeDeliveryTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveDeliveryTab('completed')}
        >
          <CheckCircle />
          <span>Completed</span>
        </button>
        <button
          className={`delivery-dashboard-tab-btn ${activeDeliveryTab === 'failed' ? 'active' : ''}`}
          onClick={() => setActiveDeliveryTab('failed')}
        >
          <XCircle />
          <span>Failed</span>
        </button>
      </div>

      {/* Deliveries List */}
      {loading ? (
        <div className="delivery-dashboard-loading-state">
          <div className="delivery-dashboard-spinner"></div>
          <p>Loading deliveries...</p>
        </div>
      ) : error ? (
        <div className="delivery-dashboard-error-state">
          <AlertCircle />
          <p>{error}</p>
        </div>
      ) : deliveries.length === 0 ? (
        <div className="delivery-dashboard-empty-state">
          <Package />
          <h3>No deliveries found</h3>
          <p>You have no {activeDeliveryTab} deliveries at the moment</p>
        </div>
      ) : (
        <div className="delivery-dashboard-deliveries-grid">
          {deliveries.map((delivery) => (
            <div key={delivery._id} className="delivery-dashboard-delivery-card-new">
              <div className="delivery-dashboard-card-header">
                <div className="delivery-dashboard-order-info">
                  <h3>Order #{delivery.orderNumber}</h3>
                  <span className={`delivery-dashboard-status-badge ${getStatusColor(delivery.deliveryStatus)}`}>
                    {delivery.deliveryStatus.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="delivery-dashboard-order-amount">
                  <DollarSign />
                  <span>${delivery.orderAmount.toFixed(2)}</span>
                  {delivery.paymentMethod === 'cod' && (
                    <span className="delivery-dashboard-cod-badge">COD</span>
                  )}
                </div>
              </div>

              <div className="delivery-dashboard-card-body">
                <div className="delivery-dashboard-customer-section">
                  <h4>Customer Details</h4>
                  <div className="delivery-dashboard-detail-row">
                    <User />
                    <span>{delivery.customerInfo.name}</span>
                  </div>
                  <div className="delivery-dashboard-detail-row">
                    <Phone />
                    <a href={`tel:${delivery.customerInfo.phone}`}>
                      {delivery.customerInfo.phone}
                    </a>
                  </div>
                  {delivery.customerInfo.email && (
                    <div className="delivery-dashboard-detail-row">
                      <Mail />
                      <span>{delivery.customerInfo.email}</span>
                    </div>
                  )}
                  <div className="delivery-dashboard-detail-row">
                    <MapPin />
                    <span>{delivery.customerInfo.address}</span>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(delivery.customerInfo.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="delivery-dashboard-navigate-btn"
                  >
                    <Navigation />
                    <span>Navigate</span>
                  </a>
                </div>

                <div className="delivery-dashboard-order-items">
                  <h4>Order Items ({delivery.orderItems.length})</h4>
                  {delivery.orderItems.map((item, index) => (
                    <div key={index} className="delivery-dashboard-item-row">
                      <span>{item.productName}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="delivery-dashboard-info-section">
                  <div className="delivery-dashboard-info-row">
                    <Calendar />
                    <span>Assigned: {new Date(delivery.assignedAt).toLocaleString()}</span>
                  </div>
                  {delivery.deliveredAt && (
                    <div className="delivery-dashboard-info-row">
                      <CheckCircle />
                      <span>Delivered: {new Date(delivery.deliveredAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="delivery-dashboard-card-actions">
                {delivery.deliveryStatus === 'assigned' && (
                  <>
                    <button
                      className="delivery-dashboard-action-btn primary"
                      onClick={() => handleStatusUpdate(delivery._id, 'out_for_delivery')}
                      disabled={actionLoading === delivery._id}
                    >
                      <Truck />
                      <span>Mark Out for Delivery</span>
                    </button>
                    <button
                      className="delivery-dashboard-action-btn secondary"
                      onClick={() => handleDeliveryClick(delivery._id)}
                    >
                      <FileText />
                      <span>View Details</span>
                    </button>
                  </>
                )}
                
                {delivery.deliveryStatus === 'out_for_delivery' && (
                  <>
                    <button
                      className="delivery-dashboard-action-btn success"
                      onClick={() => {
                        const notes = prompt('Add delivery notes (optional):');
                        handleStatusUpdate(delivery._id, 'delivered', notes || '');
                      }}
                      disabled={actionLoading === delivery._id}
                    >
                      <CheckCircle />
                      <span>Mark as Delivered</span>
                    </button>
                    <button
                      className="delivery-dashboard-action-btn danger"
                      onClick={() => {
                        const reason = prompt('Enter failure reason:');
                        if (reason) {
                          handleStatusUpdate(delivery._id, 'failed', reason);
                        }
                      }}
                      disabled={actionLoading === delivery._id}
                    >
                      <XCircle />
                      <span>Mark as Failed</span>
                    </button>
                  </>
                )}

                {(delivery.deliveryStatus === 'delivered' || delivery.deliveryStatus === 'failed') && (
                  <button
                    className="delivery-dashboard-action-btn secondary"
                    onClick={() => handleDeliveryClick(delivery._id)}
                  >
                    <FileText />
                    <span>View Details</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'deliveries':
        return renderDeliveries();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="delivery-dashboard-new">
      {/* Sidebar */}
      <aside className={`delivery-dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="delivery-dashboard-sidebar-header">
          <div className="delivery-dashboard-logo">
            <div className="logo">
              <span>I</span>
            </div>
            {sidebarOpen && <div className='company-info'><h2>Iyappaa Delivery</h2><p>Portal</p></div>}
          </div>
        </div>

        <nav className="delivery-dashboard-sidebar-nav">
          <button
            className={`delivery-dashboard-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Home />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button
            className={`delivery-dashboard-nav-item ${activeTab === 'deliveries' ? 'active' : ''}`}
            onClick={() => setActiveTab('deliveries')}
          >
            <List />
            {sidebarOpen && <span>My Deliveries</span>}
            {stats?.pendingDeliveries > 0 && (
              <span className="delivery-dashboard-badge">{stats.pendingDeliveries}</span>
            )}
          </button>
        </nav>

        <div className="delivery-dashboard-sidebar-footer">
          <button 
            className="delivery-dashboard-user-info"
            onClick={() => navigate('/delivery/profile')}
            title="View Profile"
          >
            <div className="delivery-dashboard-user-avatar">
              <User />
            </div>
            {sidebarOpen && (
              <div className="delivery-dashboard-user-details">
                <p className="delivery-dashboard-user-name">{deliveryPerson.name}</p>
                <p className="delivery-dashboard-user-id">{deliveryPerson.employeeId}</p>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="delivery-dashboard-main-wrapper">
        {/* Header */}
        <header className="delivery-dashboard-main-header">
          <div className="delivery-dashboard-header-left">
            <button
              className="delivery-dashboard-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu />
            </button>
            <h1>Delivery Portal</h1>
          </div>

          <div className="delivery-dashboard-header-right">
            <button
              className="delivery-dashboard-notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell />
              {notifications.length > 0 && (
                <span className="delivery-dashboard-notification-badge">{notifications.length}</span>
              )}
            </button>

            <button className="delivery-dashboard-logout-btn" onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </button>
          </div>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="delivery-dashboard-notifications-dropdown">
              <div className="delivery-dashboard-dropdown-header">
                <h3>Notifications</h3>
                <button onClick={() => setShowNotifications(false)}>
                  <X />
                </button>
              </div>
              <div className="delivery-dashboard-notifications-list">
                {notifications.length === 0 ? (
                  <p className="delivery-dashboard-no-notifications">No new notifications</p>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="delivery-dashboard-notification-item">
                      <Bell />
                      <div>
                        <p>{notif.message}</p>
                        <span>{notif.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="delivery-dashboard-main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
