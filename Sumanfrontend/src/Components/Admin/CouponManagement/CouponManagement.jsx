import React, { useState, useEffect } from 'react';
import './CouponManagement.css';

const CouponManagement = ({ api, adminToken }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderAmount: 0,
    maximumDiscountAmount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    isActive: true,
    applicableCategories: [],
    userUsageLimit: 1
  });

  const categories = ['Sweets', 'Snacks', 'Groceries', 'All'];

  useEffect(() => {
    fetchCoupons();
    fetchStats();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coupons/all', adminToken);
      if (response.success) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/coupons/stats', adminToken);
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
      const submitData = {
        ...formData,
        code: formData.code.toUpperCase(),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        maximumDiscountAmount: formData.maximumDiscountAmount ? parseFloat(formData.maximumDiscountAmount) : null
      };

      const endpoint = editingCoupon
        ? `/coupons/${editingCoupon._id}`
        : '/coupons/create';

      const method = editingCoupon ? 'put' : 'post';
      const response = await api[method](endpoint, submitData, adminToken);

      if (response.success) {
        alert(response.message);
        setShowModal(false);
        resetForm();
        fetchCoupons();
        fetchStats();
      }
    } catch (error) {
      alert('Error saving coupon: ' + error.message);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumOrderAmount: coupon.minimumOrderAmount,
      maximumDiscountAmount: coupon.maximumDiscountAmount || '',
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil.split('T')[0],
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive,
      applicableCategories: coupon.applicableCategories || [],
      userUsageLimit: coupon.userUsageLimit
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const response = await api.delete(`/coupons/${id}`, adminToken);
        if (response.success) {
          alert('Coupon deleted successfully');
          fetchCoupons();
          fetchStats();
        }
      } catch (error) {
        alert('Error deleting coupon: ' + error.message);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_ADMIN_API_URL}/coupons/${id}/toggle-status`,
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
        fetchCoupons();
        fetchStats();
      }
    } catch (error) {
      alert('Error toggling status: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrderAmount: 0,
      maximumDiscountAmount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      isActive: true,
      applicableCategories: [],
      userUsageLimit: 1
    });
    setEditingCoupon(null);
  };

  const getCouponStatus = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (!coupon.isActive) return { text: 'Inactive', class: 'status-inactive' };
    if (now < validFrom) return { text: 'Not Started', class: 'status-upcoming' };
    if (now > validUntil) return { text: 'Expired', class: 'status-expired' };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { text: 'Limit Reached', class: 'status-expired' };
    }
    return { text: 'Active', class: 'status-active' };
  };

  const calculateUsagePercentage = (coupon) => {
    if (!coupon.usageLimit) return null;
    return Math.round((coupon.usedCount / coupon.usageLimit) * 100);
  };

  //   if (loading) {
  //     return <div className="loading-spinner">Loading coupons...</div>;
  //   }

  return (
    <div className="coupon-management">
      <div className="coupon-header">
        <h2>Coupon Management</h2>
        <button
          className="coupon-btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Create New Coupon
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="coupon-stats-grid">
          <div className="coupon-stat-card">
            <h3>{stats.totalCoupons}</h3>
            <p>Total Coupons</p>
          </div>
          <div className="coupon-stat-card active">
            <h3>{stats.activeCoupons}</h3>
            <p>Active Coupons</p>
          </div>
          <div className="coupon-stat-card expired">
            <h3>{stats.expiredCoupons}</h3>
            <p>Expired Coupons</p>
          </div>
          <div className="coupon-stat-card">
            <h3>{stats.mostUsedCoupons?.length || 0}</h3>
            <p>Popular Coupons</p>
          </div>
        </div>
      )}

      {/* Most Used Coupons */}
      {stats && stats.mostUsedCoupons && stats.mostUsedCoupons.length > 0 && (
        <div className="popular-coupons">
          <h3>Most Used Coupons</h3>
          <div className="popular-coupons-list">
            {stats.mostUsedCoupons.map(coupon => (
              <div key={coupon._id} className="popular-coupon-item">
                <span className="coupon-code">{coupon.code}</span>
                <span className="coupon-desc">{coupon.description}</span>
                <span className="coupon-usage">
                  Used: {coupon.usedCount}
                  {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="coupons-table-container">
        <table className="coupons-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Discount</th>
              <th>Valid Period</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => {
              const status = getCouponStatus(coupon);
              const usagePercent = calculateUsagePercentage(coupon);
              return (
                <tr key={coupon._id}>
                  <td>
                    <strong className="coupon-code-text">{coupon.code}</strong>
                  </td>
                  <td>
                    {coupon.description}
                    <br />
                    <small>Min Order: ${coupon.minimumOrderAmount}</small>
                  </td>
                  <td>
                    {coupon.discountValue}
                    {coupon.discountType === 'percentage' ? '%' : ' CAD'} OFF
                    {coupon.maximumDiscountAmount && (
                      <><br /><small>Max: ${coupon.maximumDiscountAmount}</small></>
                    )}
                  </td>
                  <td>
                    <small>
                      From: {new Date(coupon.validFrom).toLocaleDateString()}
                      <br />
                      To: {new Date(coupon.validUntil).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <div className="coupon-usage-info">
                      <span>
                        {coupon.usedCount} / {coupon.usageLimit || '∞'}
                      </span>
                      {usagePercent !== null && (
                        <div className="coupon-usage-bar">
                          <div
                            className="coupon-usage-progress"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`coupon-status-badge ${status.class}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="coupon-actions">
                    <button
                      className="coupon-btn-edit"
                      onClick={() => handleEdit(coupon)}
                    >
                      Edit
                    </button>
                    <button
                      className={`coupon-btn-toggle ${coupon.isActive ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleStatus(coupon._id)}
                    >
                      {coupon.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="coupon-btn-delete"
                      onClick={() => handleDelete(coupon._id)}
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
        <div className="coupon-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="coupon-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="coupon-modal-header">
              <h3>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
              <button
                className="coupon-close-btn"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="coupon-form">
              <div className="coupon-form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., SAVE20"
                  style={{ textTransform: 'uppercase' }}
                  disabled={editingCoupon !== null}
                />
                <small>Code will be automatically converted to uppercase</small>
              </div>

              <div className="coupon-form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="2"
                  placeholder="Describe the coupon offer..."
                />
              </div>

              <div className="coupon-form-row">
                <div className="coupon-form-group">
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

                <div className="coupon-form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 10.00'}
                  />
                </div>
              </div>

              <div className="coupon-form-row">
                <div className="coupon-form-group">
                  <label>Minimum Order Amount (CAD) *</label>
                  <input
                    type="number"
                    name="minimumOrderAmount"
                    value={formData.minimumOrderAmount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="coupon-form-group">
                  <label>Maximum Discount (CAD)</label>
                  <input
                    type="number"
                    name="maximumDiscountAmount"
                    value={formData.maximumDiscountAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                  />
                  <small>Leave empty for no limit</small>
                </div>
              </div>

              <div className="coupon-form-row">
                <div className="coupon-form-group">
                  <label>Valid From *</label>
                  <input
                    type="date"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="coupon-form-group">
                  <label>Valid Until *</label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="coupon-form-row">
                <div className="coupon-form-group">
                  <label>Total Usage Limit</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Optional - Leave empty for unlimited"
                  />
                  <small>Maximum number of times this coupon can be used</small>
                </div>

                <div className="coupon-form-group">
                  <label>User Usage Limit *</label>
                  <input
                    type="number"
                    name="userUsageLimit"
                    value={formData.userUsageLimit}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                  <small>Times one user can use this coupon</small>
                </div>
              </div>

              <div className="coupon-form-group">
                <label>Applicable Categories</label>
                <div className="coupon-checkbox-group">
                  {categories.map(category => (
                    <label key={category} className="coupon-checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.applicableCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                      {category}
                    </label>
                  ))}
                </div>
                <small>Leave empty to apply to all categories</small>
              </div>

              <div className="coupon-form-group">
                <label className="coupon-checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>

              <div className="coupon-form-actions">
                <button
                  type="button"
                  className="coupon-btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="coupon-btn-primary">
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
