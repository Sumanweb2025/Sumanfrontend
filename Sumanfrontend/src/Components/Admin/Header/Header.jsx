import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, User, LogOut, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import './Header.css';

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen, api, adminToken, setError, setActiveTab }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    // Create audio context for notification sounds
    audioRef.current = new Audio();

    // Load sound preference from localStorage
    const savedSoundPreference = localStorage.getItem('adminNotificationSound');
    if (savedSoundPreference !== null) {
      setSoundEnabled(JSON.parse(savedSoundPreference));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  // Fetch admin profile
  useEffect(() => {
    fetchAdminProfile();
  }, []);

  // Fetch notifications periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Play notification sound
  const playNotificationSound = (notificationType = 'default') => {
    if (!soundEnabled || !audioRef.current) return;

    try {
      // Create different sounds for different notification types
      const soundConfig = getSoundConfig(notificationType);

      // Create audio context and generate sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = soundConfig.frequency;
      oscillator.type = soundConfig.type;

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundConfig.duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + soundConfig.duration);

      // For multiple beeps
      if (soundConfig.repeat > 1) {
        for (let i = 1; i < soundConfig.repeat; i++) {
          setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();

            osc2.connect(gain2);
            gain2.connect(audioContext.destination);

            osc2.frequency.value = soundConfig.frequency;
            osc2.type = soundConfig.type;

            gain2.gain.setValueAtTime(0, audioContext.currentTime);
            gain2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundConfig.duration);

            osc2.start();
            osc2.stop(audioContext.currentTime + soundConfig.duration);
          }, i * 200);
        }
      }
    } catch (error) {
      console.log('Audio not supported or blocked:', error);
    }
  };

  const getSoundConfig = (type) => {
    const configs = {
      new_order: { frequency: 800, type: 'sine', duration: 0.3, repeat: 2 },
      payment: { frequency: 600, type: 'square', duration: 0.2, repeat: 1 },
      cancellation: { frequency: 400, type: 'triangle', duration: 0.5, repeat: 1 },
      refund: { frequency: 500, type: 'sine', duration: 0.4, repeat: 1 },
      low_stock: { frequency: 700, type: 'sawtooth', duration: 0.6, repeat: 3 },
      default: { frequency: 650, type: 'sine', duration: 0.3, repeat: 1 }
    };
    return configs[type] || configs.default;
  };

  const fetchAdminProfile = async () => {
    try {
      const response = await api.get('/admin/profile', adminToken);
      if (response.success) {
        setAdminProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/notifications', adminToken);
      if (response.success) {
        const newNotifications = response.data;
        setNotifications(newNotifications);

        // Check for new notifications and play sound
        if (newNotifications.length > previousNotificationCount && previousNotificationCount > 0) {
          const newNotification = newNotifications[0]; // Assuming newest is first
          playNotificationSound(newNotification.type);

          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
              badge: '/favicon.ico'
            });
          }
        }

        setPreviousNotificationCount(newNotifications.length);
        setUnreadCount(newNotifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem('adminNotificationSound', JSON.stringify(newSoundEnabled));

    // Play a test sound when enabling
    if (newSoundEnabled) {
      playNotificationSound('default');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // Request notification permission on component mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminNotificationSound');
    window.location.href = '/admin/login';
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
      case 'new_user': return '👤';  // NEW
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

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          className="admin-mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="admin-icon" />
        </button>
        <h1 className="admin-header-title">Admin Dashboard</h1>
      </div>

      <div className="admin-header-right">
        {/* Sound Toggle Button */}
        <button
          className={`admin-header-btn admin-sound-btn ${soundEnabled ? 'sound-enabled' : 'sound-disabled'}`}
          onClick={toggleSound}
          title={`${soundEnabled ? 'Disable' : 'Enable'} notification sounds`}
        >
          {soundEnabled ? (
            <Volume2 className="admin-icon" />
          ) : (
            <VolumeX className="admin-icon" />
          )}
        </button>

        {/* Refresh Button */}
        <button
          className="admin-header-btn admin-refresh-btn"
          onClick={fetchNotifications}
          disabled={loading}
          title="Refresh notifications"
        >
          <RefreshCw className={`admin-icon ${loading ? 'spinning' : ''}`} />
        </button>

        {/* Notifications */}
        <div className="admin-notification-container" ref={notificationRef}>
          <button
            className="admin-header-btn admin-notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="admin-icon" />
            {unreadCount > 0 && (
              <span className="admin-notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="admin-notification-dropdown">
              <div className="admin-notification-header">
                <h3>Notifications</h3>
                <div className="admin-notification-header-right">
                  <span className="admin-notification-count">{notifications.length} new</span>
                  <button
                    className="admin-sound-toggle-small"
                    onClick={toggleSound}
                    title={`${soundEnabled ? 'Disable' : 'Enable'} sounds`}
                  >
                    {soundEnabled ? '🔊' : '🔇'}
                  </button>
                </div>
              </div>

              <div className="admin-notification-list">
                {notifications.length > 0 ? (
                  notifications.slice(0, 10).map((notification, index) => (
                    <div key={index} className="admin-notification-item">
                      <div
                        className="admin-notification-icon"
                        style={{ backgroundColor: getNotificationColor(notification.type) }}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="admin-notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span className="admin-notification-time">
                          {formatNotificationTime(notification.time)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="admin-no-notifications">
                    <Bell className="admin-icon" />
                    <p>No new notifications</p>
                  </div>
                )}
              </div>

              {notifications.length > 10 && (
                <div className="admin-notification-footer">
                  <button className="admin-view-all-btn">View All Notifications</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="admin-profile-container" ref={profileRef}>
          <button
            className="admin-profile-btn"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="admin-profile-avatar">
              {adminProfile?.profileImage ? (
                <img src={adminProfile.profileImage} alt="Admin" />
              ) : (
                <User className="admin-icon" />
              )}
            </div>
            <span className="admin-profile-name">
              {adminProfile?.name || 'Admin'}
            </span>
          </button>

          {showProfile && (
            <div className="admin-profile-dropdown">
              <div className="admin-profile-info">
                <div className="admin-profile-avatar large">
                  {adminProfile?.profileImage ? (
                    <img src={adminProfile.profileImage} alt="Admin" />
                  ) : (
                    <User className="admin-icon" />
                  )}
                </div>
                <div className="admin-profile-details">
                  <h3>{adminProfile?.name || 'Admin User'}</h3>
                  <p>{adminProfile?.email}</p>
                  <span className="admin-role-badge">Administrator</span>
                </div>
              </div>

              <div className="admin-profile-actions">
                <button
                  className="admin-profile-action-btn"
                  onClick={() => {
                    setShowProfile(false);
                    if (setActiveTab) {
                      setActiveTab('profile');
                    }
                  }}
                >
                  <User className="admin-icon" />
                  View Profile
                </button>

                <button className="admin-profile-action-btn logout" onClick={handleLogout}>
                  <LogOut className="admin-icon" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;