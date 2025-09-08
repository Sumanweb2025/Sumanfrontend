import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Eye, 
  Mail, 
  Phone, 
  Calendar,
  ShoppingBag,
  Heart,
  DollarSign,
  Filter,
  Download,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import './UserManagement.css';

const UserManagement = ({ api, adminToken, setIsLoading, setError, handleApiError }) => {
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'feedback'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalFeedback, setTotalFeedback] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchFeedback();
    }
  }, [activeTab, currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await api.get(`/admin/users?${params}`, adminToken);
      console.log('Users API Response:', response);
      
      if (response.success) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalUsers(response.data.total || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      const response = await api.get(`/admin/users/feedback?${params}`, adminToken);
      console.log('Feedback API Response:', response);
      
      if (response.success) {
        setFeedback(response.data.reviews || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalFeedback(response.data.total || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch feedback');
      }
    } catch (error) {
      console.error('Fetch feedback error:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const showUserDetailsModal = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount || 0);
  };

  const getRatingStars = (rating) => {
    const numRating = Number(rating) || 0;
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`star-icon ${index < numRating ? 'filled' : ''}`}
      />
    ));
  };

  const exportUsers = () => {
    if (!users.length) {
      setError('No users to export');
      return;
    }

    try {
      const csvData = users.map(user => ({
        Name: user.name || 'N/A',
        Email: user.email || 'N/A',
        Phone: user.phone || 'N/A',
        'Join Date': formatDate(user.createdAt),
        'Total Orders': user.orderCount || 0,
        'Total Spent': user.totalSpent || 0,
        'Wishlist Items': user.wishlistCount || 0
      }));

      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to export users');
      console.error('Export error:', error);
    }
  };

  const refreshData = () => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchFeedback();
    }
  };

  return (
    <div className="user-management-container">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1>User Management</h1>
          <p>Manage your customers and view their feedback</p>
        </div>
        <div className="header-actions">
          <button onClick={refreshData} className="admin-btn admin-btn-outline">
            <RefreshCw className="icon" />
            Refresh
          </button>
          {activeTab === 'users' && (
            <button onClick={exportUsers} className="admin-btn admin-btn-outline">
              <Download className="icon" />
              Export Users
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('users');
            setCurrentPage(1);
            setSearchTerm('');
          }}
        >
          <Users className="icon" />
          Users ({totalUsers})
        </button>
        <button
          className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('feedback');
            setCurrentPage(1);
            setSearchTerm('');
          }}
        >
          <MessageSquare className="icon" />
          User Feedback ({totalFeedback})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="tab-content">
          {/* Search and Filters */}
          <div className="search-filter-bar">
            <div className="search-input">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <button className="admin-btn admin-btn-outline">
              <Filter className="icon" />
              Filter
            </button>
            <span className="user-count">{totalUsers} total users</span>
          </div>

          {/* Users Table */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">All Users</h2>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : users.length > 0 ? (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Contact</th>
                      <th>Join Date</th>
                      <th>Orders</th>
                      <th>Total Spent</th>
                      <th>Wishlist</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar">
                              {user.profileImage ? (
                                <img src={user.profileImage} alt={user.name} />
                              ) : (
                                <div className="avatar-placeholder">
                                  {(user.name || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="user-details">
                              <span className="user-name">{user.name || 'N/A'}</span>
                              <span className="user-email">{user.email || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div className="contact-item">
                              <Mail className="contact-icon" />
                              <span>{user.email || 'N/A'}</span>
                            </div>
                            {user.phone && (
                              <div className="contact-item">
                                <Phone className="contact-icon" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="join-date">
                            <Calendar className="date-icon" />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="orders-count">
                            <ShoppingBag className="stat-icon" />
                            <span>{user.orderCount || 0}</span>
                          </div>
                        </td>
                        <td>
                          <div className="total-spent">
                            <DollarSign className="stat-icon" />
                            <span>{formatCurrency(user.totalSpent)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="wishlist-count">
                            <Heart className="stat-icon" />
                            <span>{user.wishlistCount || 0}</span>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => showUserDetailsModal(user)}
                            className="admin-btn admin-btn-primary"
                            title="View user details"
                          >
                            <Eye className="icon" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <Users className="empty-state-icon" />
                <h3>No users found</h3>
                <p>{searchTerm ? 'No users match your search criteria.' : 'No users registered yet.'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="tab-content">
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">User Reviews & Feedback</h2>
              <span className="user-count">{totalFeedback} total reviews</span>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading feedback...</p>
              </div>
            ) : feedback.length > 0 ? (
              <div className="feedback-list">
                {feedback.map((review) => (
                  <div key={review._id} className="feedback-item">
                    <div className="feedback-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {(review.user_id?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="reviewer-details">
                          <span className="reviewer-name">{review.user_id?.name || 'Anonymous'}</span>
                          <span className="reviewer-email">{review.user_id?.email || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="feedback-meta">
                        <div className="rating-display">
                          {getRatingStars(review.rating)}
                          <span className="rating-value">{review.rating || 0}/5</span>
                        </div>
                        <span className="feedback-date">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="feedback-content">
                      <div className="product-info">
                        <span className="product-name">
                          Product: {review.product_id?.name || 'Unknown Product'}
                        </span>
                      </div>
                      
                      {review.comment && (
                        <div className="review-comment">
                          <p>"{review.comment}"</p>
                        </div>
                      )}
                      
                      <div className="feedback-actions">
                        <button className="feedback-btn helpful">
                          <ThumbsUp className="icon" />
                          Helpful
                        </button>
                        <button className="feedback-btn not-helpful">
                          <ThumbsDown className="icon" />
                          Not Helpful
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <MessageSquare className="empty-state-icon" />
                <h3>No feedback yet</h3>
                <p>User reviews and feedback will appear here once customers start leaving reviews.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="admin-btn admin-btn-outline"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = index + 1;
            } else if (currentPage <= 3) {
              pageNum = index + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + index;
            } else {
              pageNum = currentPage - 2 + index;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
                className={`admin-btn ${currentPage === pageNum ? 'admin-btn-primary' : 'admin-btn-outline'}`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="admin-btn admin-btn-outline"
          >
            Next
          </button>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setShowUserDetails(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">User Details</h3>
              <button
                className="admin-modal-close"
                onClick={() => setShowUserDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="user-profile-section">
                <div className="profile-avatar large">
                  {selectedUser.profileImage ? (
                    <img src={selectedUser.profileImage} alt={selectedUser.name} />
                  ) : (
                    <div className="avatar-placeholder large">
                      {(selectedUser.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="profile-info">
                  <h3>{selectedUser.name || 'N/A'}</h3>
                  <p className="user-email">{selectedUser.email || 'N/A'}</p>
                  <span className="join-date">
                    Member since {formatDate(selectedUser.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="user-stats-grid">
                <div className="stat-item">
                  <ShoppingBag className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-value">{selectedUser.orderCount || 0}</span>
                    <span className="stat-label">Total Orders</span>
                  </div>
                </div>
                <div className="stat-item">
                  <DollarSign className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-value">{formatCurrency(selectedUser.totalSpent)}</span>
                    <span className="stat-label">Total Spent</span>
                  </div>
                </div>
                <div className="stat-item">
                  <Heart className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-value">{selectedUser.wishlistCount || 0}</span>
                    <span className="stat-label">Wishlist Items</span>
                  </div>
                </div>
              </div>
              
              {selectedUser.phone && (
                <div className="address-section">
                  <h4>Contact Information</h4>
                  <div className="address-info">
                    <p><Phone className="contact-icon" /> {selectedUser.phone}</p>
                  </div>
                </div>
              )}

              {selectedUser.address && (
                <div className="address-section">
                  <h4>Address Information</h4>
                  <div className="address-info">
                    <p>{selectedUser.address.street}</p>
                    <p>{selectedUser.address.city}, {selectedUser.address.province}</p>
                    <p>{selectedUser.address.postalCode}, {selectedUser.address.country}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="admin-modal-actions">
              <button 
                className="admin-btn admin-btn-outline"
                onClick={() => setShowUserDetails(false)}
              >
                Close
              </button>
              <button className="admin-btn admin-btn-primary">
                <Mail className="icon" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;