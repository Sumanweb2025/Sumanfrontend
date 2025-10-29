import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

// Import all components
import Header from '../../Components/Admin/Header/Header';
import Sidebar from '../../Components/Admin/Sidebar/Sidebar';
import Dashboard from '../../Components/Admin/Dashboard/Dashboard';
import UserManagement from '../../Components/Admin/UserManagement/UserManagement';
import ProductManagement from '../../Components/Admin/ProductManagement/ProductManagement';
import OrderManagement from '../../Components/Admin/OrderManagement/OrderManagement';
import PaymentManagement from '../../Components/Admin/PaymentManagement/PaymentManagement';
import OfferManagement from '../../Components/Admin/OfferManagement/OfferManagement';
import CouponManagement from '../../Components/Admin/CouponManagement/CouponManagement';
import Analytics from '../../Components/Admin/Analytics/Analytics';
import AdminProfile from '../../Components/Admin/AdminProfile/AdminProfile';
import DeliveryManagement from '../../Components/Admin/DeliveryManagement/DeliveryManagement';

// API configuration
const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL;

// API utility functions
const api = {
  get: async (endpoint, token) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  },

  post: async (endpoint, data, token) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  },

  put: async (endpoint, data, token) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  },

  delete: async (endpoint, token) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  }
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

  // Check authentication
  useEffect(() => {
    if (!adminToken) {
      // Redirect to admin login
      window.location.href = '/admin/login';
      return;
    }
  }, [adminToken]);

  // Error boundary for API calls
  const handleApiError = (error) => {
    console.error('API Error:', error);
    setError(error.message);
    setIsLoading(false);

    if (error.message.includes('401')) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
  };

  // Render active component
  const renderActiveComponent = () => {
    const commonProps = {
      api,
      adminToken,
      setIsLoading,
      setError,
      handleApiError
    };

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...commonProps} />;
      case 'users':
        return <UserManagement {...commonProps} />;
      case 'products':
        return <ProductManagement {...commonProps} />;
      case 'orders':
        return <OrderManagement {...commonProps} />;
      case 'payments':
        return <PaymentManagement {...commonProps} />;
      case 'delivery':
        return <DeliveryManagement {...commonProps} />;
      case 'offers':
        return <OfferManagement {...commonProps} />;
      case 'coupons':
        return <CouponManagement {...commonProps} />;
      case 'analytics':
        return <Analytics {...commonProps} />;
      case 'profile':
        return <AdminProfile {...commonProps} />;
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  if (!adminToken) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-dashboard">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content */}
        <div className="admin-main-content">
          {/* Header */}
          <Header
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            api={api}
            adminToken={adminToken}
            setError={setError}
            setActiveTab={setActiveTab}
          />

          {/* Content Area */}
          <div className="admin-content">
            {/* Loading Overlay */}
            {isLoading && (
              <div className="admin-loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="admin-error-message">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="error-close">×</button>
              </div>
            )}

            {/* Active Component */}
            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;