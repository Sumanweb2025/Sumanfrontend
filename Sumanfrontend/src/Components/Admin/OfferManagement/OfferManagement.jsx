import React, { useState, useEffect } from 'react';
import './OfferManagement.css';

const OfferManagement = ({ api, adminToken }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    discountType: 'percentage',
    imageUrl: '',
    startDate: '',
    endDate: '',
    isActive: true,
    applicableCategories: [],
    minimumOrderAmount: 0
  });

  const categories = ['Sweets', 'Snacks', 'Groceries', 'All'];

  useEffect(() => {
    fetchOffers();
    fetchStats();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/offers/all', adminToken);
      if (response.success) {
        setOffers(response.data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/offers/stats', adminToken);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCategoryChange = (category) => {
    const currentCategories = formData.applicableCategories;
    if (currentCategories.includes(category)) {
      setFormData({
        ...formData,
        applicableCategories: currentCategories.filter(c => c !== category)
      });
    } else {
      setFormData({
        ...formData,
        applicableCategories: [...currentCategories, category]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingOffer 
        ? `/offers/${editingOffer._id}` 
        : '/offers/create';
      
      const method = editingOffer ? 'put' : 'post';
      const response = await api[method](endpoint, formData, adminToken);

      if (response.success) {
        alert(response.message);
        setShowModal(false);
        resetForm();
        fetchOffers();
        fetchStats();
      }
    } catch (error) {
      alert('Error saving offer: ' + error.message);
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      discount: offer.discount,
      discountType: offer.discountType,
      imageUrl: offer.imageUrl || '',
      startDate: offer.startDate.split('T')[0],
      endDate: offer.endDate.split('T')[0],
      isActive: offer.isActive,
      applicableCategories: offer.applicableCategories || [],
      minimumOrderAmount: offer.minimumOrderAmount || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        const response = await api.delete(`/offers/${id}`, adminToken);
        if (response.success) {
          alert('Offer deleted successfully');
          fetchOffers();
          fetchStats();
        }
      } catch (error) {
        alert('Error deleting offer: ' + error.message);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_ADMIN_API_URL}/offers/${id}/toggle-status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchOffers();
        fetchStats();
      }
    } catch (error) {
      alert('Error toggling status: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discount: '',
      discountType: 'percentage',
      imageUrl: '',
      startDate: '',
      endDate: '',
      isActive: true,
      applicableCategories: [],
      minimumOrderAmount: 0
    });
    setEditingOffer(null);
  };

  const getOfferStatus = (offer) => {
    const now = new Date();
    const start = new Date(offer.startDate);
    const end = new Date(offer.endDate);

    if (!offer.isActive) return { text: 'Inactive', class: 'status-inactive' };
    if (now < start) return { text: 'Upcoming', class: 'status-upcoming' };
    if (now > end) return { text: 'Expired', class: 'status-expired' };
    return { text: 'Active', class: 'status-active' };
  };

//   if (loading) {
//     return <div className="offer-loading-spinner">Loading offers...</div>;
//   }

  return (
    <div className="offer-management">
      <div className="offer-header">
        <h2>Offer Management</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Create New Offer
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="offer-stats-grid">
          <div className="offer-stat-card">
            <h3>{stats.totalOffers}</h3>
            <p>Total Offers</p>
          </div>
          <div className="offer-stat-card active">
            <h3>{stats.activeOffers}</h3>
            <p>Active Offers</p>
          </div>
          <div className="offer-stat-card upcoming">
            <h3>{stats.upcomingOffers}</h3>
            <p>Upcoming Offers</p>
          </div>
          <div className="offer-stat-card expired">
            <h3>{stats.expiredOffers}</h3>
            <p>Expired Offers</p>
          </div>
        </div>
      )}

      {/* Offers Table */}
      <div className="offers-table-container">
        <table className="offers-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Discount</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(offer => {
              const status = getOfferStatus(offer);
              return (
                <tr key={offer._id}>
                  <td>
                    <strong>{offer.title}</strong>
                    <br />
                    <small>{offer.description.substring(0, 50)}...</small>
                  </td>
                  <td>
                    {offer.discount}{offer.discountType === 'percentage' ? '%' : ' CAD'} OFF
                  </td>
                  <td>{new Date(offer.startDate).toLocaleDateString()}</td>
                  <td>{new Date(offer.endDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`offer-status-badge ${status.class}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(offer)}
                    >
                      Edit
                    </button>
                    <button 
                      className={`btn-toggle ${offer.isActive ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleStatus(offer._id)}
                    >
                      {offer.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(offer._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="offer-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="offer-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="offer-modal-header">
              <h3>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h3>
              <button 
                className="offer-close-btn"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="offer-form">
              <div className="offer-form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Summer Sale"
                />
              </div>

              <div className="offer-form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Describe your offer..."
                />
              </div>

              <div className="offer-form-row">
                <div className="offer-form-group">
                  <label>Discount *</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="e.g., 20"
                  />
                </div>

                <div className="offer-form-group">
                  <label>Discount Type *</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (CAD)</option>
                  </select>
                </div>
              </div>

              <div className="offer-form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="offer-form-row">
                <div className="offer-form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="offer-form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="offer-form-group">
                <label>Minimum Order Amount (CAD)</label>
                <input
                  type="number"
                  name="minimumOrderAmount"
                  value={formData.minimumOrderAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="offer-form-group">
                <label>Applicable Categories</label>
                <div className="checkbox-group">
                  {categories.map(category => (
                    <label key={category} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.applicableCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>

              <div className="offer-form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>

              <div className="offer-form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingOffer ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferManagement;
