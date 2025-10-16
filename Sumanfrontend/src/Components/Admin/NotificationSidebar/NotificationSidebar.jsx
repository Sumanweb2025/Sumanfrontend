import React, { useState, useEffect } from 'react';
import './NotificationSidebar.css';

const NotificationSidebar = ({ isOpen, onClose, adminToken }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ensure notifications is always an array
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  // Fetch notifications when the sidebar is opened
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_ADMIN_API_URL}/admin/notifications`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const result = await response.json();

      // Handle the response structure correctly
      if (result.success && result.data) {
        const notificationsData = Array.isArray(result.data) ? result.data : [];
        // Add isRead property to all notifications (default false since backend doesn't track this)
        const notificationsWithReadStatus = notificationsData.map(notification => ({
          ...notification,
          _id: notification.orderId || notification.userId || notification.productId || Math.random().toString(),
          isRead: false,
          createdAt: notification.time
        }));
        setNotifications(notificationsWithReadStatus);
        //console.log('Fetched notifications:', notificationsWithReadStatus);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = (notificationId) => {
    // Update the local state to mark as read
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification._id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    // Update the local state to mark all as read
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({
        ...notification,
        isRead: true
      }))
    );
  };

  const formatNotificationTime = (time) => {
    const now = new Date();
    const notificationTime = new Date(time);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order': return '🛒';
      case 'payment': return '💰';
      case 'new_user': return '👤';
      case 'cancellation': return '❌';
      case 'refund': return '💸';
      case 'low_stock': return '📦';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_order': return '#22c55e';
      case 'payment': return '#3b82f6';
      case 'new_user': return '#8b5cf6';
      case 'cancellation': return '#ef4444';
      case 'refund': return '#f59e0b';
      case 'low_stock': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-sidebar" onClick={e => e.stopPropagation()}>
        <div className="notification-header">
          <h3>All Notifications ({safeNotifications.length})</h3>
          <div className="notification-actions">
            {safeNotifications.some(n => !n.isRead) && (
              <button
                className="mark-all-read"
                onClick={markAllAsRead}
                disabled={isLoading}
              >
                Mark all as read
              </button>
            )}
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
        </div>

        <div className="notification-list">
          {isLoading ? (
            <div className="loading-notifications">Loading notifications...</div>
          ) : error ? (
            <div className="notification-error">{error}</div>
          ) : safeNotifications.length === 0 ? (
            <div className="no-notifications">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
              <p>No notifications yet</p>
            </div>
          ) : (
            safeNotifications.map(notification => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => markAsRead(notification._id)}
              >
                {!notification.isRead && <div className="unread-indicator"></div>}
                <div
                  className="notification-icon-bubble"
                  style={{
                    backgroundColor: getNotificationColor(notification.type),
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <h4 style={{
                    margin: '0 0 0.25rem 0',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {notification.title}
                  </h4>
                  <p style={{
                    margin: '0 0 0.5rem 0',
                    color: '#374151',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word'
                  }}>
                    {notification.message}
                  </p>
                  <span className="notification-time">
                    {formatNotificationTime(notification.time || notification.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSidebar;