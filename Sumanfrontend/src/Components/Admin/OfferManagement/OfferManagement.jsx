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
    applicableProducts: [],
    minimumOrderAmount: 0
  });

  // Product selection states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [categoryBrands, setCategoryBrands] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [viewingOfferProducts, setViewingOfferProducts] = useState(null);

  const categories = ['Sweets', 'Snacks', 'Grocery', 'All'];

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

  // Fetch brands by category
  const fetchBrandsByCategory = async (category) => {
    if (!category || category === 'All') return;

    try {
      setLoadingBrands(true);
      const response = await api.get(`/offers/brands-by-category?category=${category}`, adminToken);
      if (response.success) {
        setCategoryBrands(response.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      alert('Failed to load brands');
    } finally {
      setLoadingBrands(false);
    }
  };

  // Fetch products by category and brand
  const fetchProductsByCategory = async (category, brand = '') => {
    if (!category || category === 'All') return;

    try {
      setLoadingProducts(true);
      let url = `/offers/products-by-category?category=${category}`;
      if (brand) {
        url += `&brand=${brand}`;
      }
      const response = await api.get(url, adminToken);
      if (response.success) {
        setCategoryProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Handle category selection for product filtering
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedBrand(''); // Reset brand when category changes
    setCategoryBrands([]);
    fetchBrandsByCategory(category);
    fetchProductsByCategory(category);
  };

  // Handle brand selection
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    fetchProductsByCategory(selectedCategory, brand);
  };

  // Toggle product selection
  const handleProductToggle = (product) => {
    const productId = product._id;
    const isSelected = selectedProducts.some(p => p._id === productId);

    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
      setFormData({
        ...formData,
        applicableProducts: formData.applicableProducts.filter(id => id !== productId)
      });
    } else {
      setSelectedProducts([...selectedProducts, product]);
      setFormData({
        ...formData,
        applicableProducts: [...formData.applicableProducts, productId]
      });
    }
  };

  // Select all products in current category
  const handleSelectAllProducts = () => {
    const allProductIds = categoryProducts.map(p => p._id);
    setSelectedProducts([...selectedProducts, ...categoryProducts.filter(p => !selectedProducts.some(sp => sp._id === p._id))]);
    setFormData({
      ...formData,
      applicableProducts: [...new Set([...formData.applicableProducts, ...allProductIds])]
    });
  };

  // Clear selected products
  const handleClearSelectedProducts = () => {
    setSelectedProducts([]);
    setFormData({
      ...formData,
      applicableProducts: []
    });
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
      applicableProducts: offer.applicableProducts?.map(p => p._id || p) || [],
      minimumOrderAmount: offer.minimumOrderAmount || 0
    });
    // Set selected products for display
    setSelectedProducts(offer.applicableProducts || []);
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
      applicableProducts: [],
      minimumOrderAmount: 0
    });
    setEditingOffer(null);
    setSelectedProducts([]);
    setCategoryProducts([]);
    setCategoryBrands([]);
    setSelectedCategory('');
    setSelectedBrand('');
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
          className="offer-btn-primary"
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
              <th>Products</th>
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
                  <td>
                    {offer.applicableProducts && offer.applicableProducts.length > 0 ? (
                      <span
                        className="offer-products-count"
                        onClick={() => {
                          setViewingOfferProducts(offer);
                          setShowProductsModal(true);
                        }}
                        style={{ cursor: 'pointer' }}
                        title="Click to view products"
                      >
                        {offer.applicableProducts.length} products
                      </span>
                    ) : offer.applicableCategories && offer.applicableCategories.length > 0 ? (
                      <span className="offer-categories-tag">
                        {offer.applicableCategories.join(', ')}
                      </span>
                    ) : (
                      <span className="offer-all-products">All Products</span>
                    )}
                  </td>
                  <td>{new Date(offer.startDate).toLocaleDateString()}</td>
                  <td>{new Date(offer.endDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`offer-status-badge ${status.class}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="offer-actions">
                    <button
                      className="offer-btn-edit"
                      onClick={() => handleEdit(offer)}
                    >
                      Edit
                    </button>
                    <button
                      className={`offer-btn-toggle ${offer.isActive ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleStatus(offer._id)}
                    >
                      {offer.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="offer-btn-delete"
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

              {/* Product Selection Section */}
              <div className="offer-form-group">
                <label>Select Specific Products (Optional)</label>
                <p className="offer-help-text">Leave empty to apply offer to all products in selected categories</p>

                {/* Category filter for products */}
                <div className="offer-product-category-filter">
                  <label>Filter by Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    className="offer-category-select"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.filter(c => c !== 'All').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Brand filter */}
                {selectedCategory && categoryBrands.length > 0 && (
                  <div className="offer-product-brand-filter">
                    <label>Filter by Brand (Optional):</label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => handleBrandSelect(e.target.value)}
                      className="offer-brand-select"
                    >
                      <option value="">All Brands</option>
                      {categoryBrands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Selected Products Display */}
                {selectedProducts.length > 0 && (
                  <div className="offer-selected-products">
                    <div className="offer-selected-header">
                      <span>Selected Products: {selectedProducts.length}</span>
                      <button
                        type="button"
                        className="btn-clear-selection"
                        onClick={handleClearSelectedProducts}
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="offer-selected-list">
                      {selectedProducts.map(product => (
                        <div key={product._id} className="offer-selected-product-item">
                          <span>{product.name} ({product.gram}g)</span>
                          <button
                            type="button"
                            onClick={() => handleProductToggle(product)}
                            className="btn-remove-product"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products List */}
                {selectedCategory && (
                  <div className="offer-products-list">
                    <div className="offer-products-header">
                      <span>{categoryProducts.length} products found</span>
                      {categoryProducts.length > 0 && (
                        <button
                          type="button"
                          className="btn-select-all"
                          onClick={handleSelectAllProducts}
                        >
                          Select All
                        </button>
                      )}
                    </div>

                    {loadingProducts ? (
                      <div className="offer-loading">Loading products...</div>
                    ) : (
                      <div className="offer-products-grid">
                        {categoryProducts.map(product => {
                          const isSelected = selectedProducts.some(p => p._id === product._id);
                          return (
                            <div
                              key={product._id}
                              className={`offer-product-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleProductToggle(product)}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleProductToggle(product)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="offer-product-info">
                                <span className="offer-product-name">{product.name}</span>
                                <span className="offer-product-details">
                                  {product.brand} | {product.gram}g | ${product.price}
                                </span>
                                {formData.discount && formData.discountType ? (
                                  <span className="offer-product-price-preview">
                                    <span className="offer-price-original">${product.price}</span>
                                    <span className="offer-price-arrow">→</span>
                                    <span className="offer-price-discounted">
                                      ${formData.discountType === 'percentage'
                                        ? (product.price - (product.price * formData.discount / 100)).toFixed(2)
                                        : Math.max(0, product.price - formData.discount).toFixed(2)
                                      }
                                    </span>
                                    <span className="offer-price-savings">
                                      (Save ${formData.discountType === 'percentage'
                                        ? ((product.price * formData.discount / 100).toFixed(2))
                                        : formData.discount
                                      })
                                    </span>
                                  </span>
                                ) : (
                                  <span className="offer-product-details">
                                    ${product.price}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
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
                  className="offer-btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="offer-btn-primary">
                  {editingOffer ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Products View Modal */}
      {showProductsModal && viewingOfferProducts && (
        <div className="offer-modal-overlay" onClick={() => setShowProductsModal(false)}>
          <div className="offer-modal-content offer-products-view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="offer-modal-header">
              <h3>Products in "{viewingOfferProducts.title}"</h3>
              <button className="offer-modal-close" onClick={() => setShowProductsModal(false)}>
                ×
              </button>
            </div>
            <div className="offer-modal-body">
              <div className="offer-products-view-list">
                {viewingOfferProducts.applicableProducts && viewingOfferProducts.applicableProducts.length > 0 ? (
                  viewingOfferProducts.applicableProducts.map((product, index) => (
                    <div key={product._id || index} className="offer-product-view-item">
                      <div className="offer-product-view-info">
                        <span className="offer-product-view-number">{index + 1}</span>
                        <div className="offer-product-view-details">
                          <h4>{product.name}</h4>
                          <p>
                            <strong>Brand:</strong> {product.brand} |
                            <strong> Category:</strong> {product.category} |
                            <strong> Weight:</strong> {product.gram}g |
                            <strong> Price:</strong> ${product.price}
                          </p>
                          <p className="offer-discount-preview">
                            <strong>Discount:</strong> {viewingOfferProducts.discount}{viewingOfferProducts.discountType === 'percentage' ? '%' : '$'} OFF
                            {viewingOfferProducts.discountType === 'percentage' && (
                              <span className="offer-discounted-amount"> → ${(product.price - (product.price * viewingOfferProducts.discount / 100)).toFixed(2)}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="offer-no-products">No specific products selected</p>
                )}
              </div>
            </div>
            <div className="offer-modal-footer">
              <button className="offer-btn-secondary" onClick={() => setShowProductsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferManagement;
