import React from 'react';
import { 
  Home, 
  Users, 
  ShoppingBag, 
  CreditCard, 
  Package, 
  TrendingUp,
  X 
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview & Statistics'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Manage Users & Feedback'
    },
    {
      id: 'products',
      label: 'Product Management',
      icon: Package,
      description: 'Products & Inventory'
    },
    {
      id: 'orders',
      label: 'Order Management',
      icon: ShoppingBag,
      description: 'Orders & Tracking'
    },
    {
      id: 'payments',
      label: 'Payment Management',
      icon: CreditCard,
      description: 'Payments & Refunds'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Sales & Revenue Reports'
    }
  ];

  const handleMenuClick = (itemId) => {
    setActiveTab(itemId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo">
              <span>I</span>
            </div>
            <div className="company-info">
              <h2>Iyappaa Admin</h2>
              <p>Sweets & Snacks</p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            className="sidebar-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="icon" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">Main Menu</h3>
            <ul className="nav-list">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <li key={item.id} className="nav-item">
                    <button
                      onClick={() => handleMenuClick(item.id)}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      title={item.description}
                    >
                      <div className="nav-icon">
                        <IconComponent className="icon" />
                      </div>
                      <div className="nav-content">
                        <span className="nav-label">{item.label}</span>
                        <span className="nav-description">{item.description}</span>
                      </div>
                      {isActive && <div className="active-indicator" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Sidebar Footer */}
        {/* <div className="sidebar-footer">
          <div className="footer-card">
            <div className="footer-icon">
              <TrendingUp className="icon" />
            </div>
            <div className="footer-content">
              <h4>Need Help?</h4>
              <p>Check our documentation or contact support for assistance.</p>
              <button className="help-btn">Get Support</button>
            </div>
          </div>
          
          <div className="version-info">
            <p>Admin Panel v2.1.0</p>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default Sidebar;