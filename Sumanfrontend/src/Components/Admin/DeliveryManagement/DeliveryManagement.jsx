import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeliveryManagement.css';

const DeliveryManagement = ({ adminToken }) => {
  const [activeTab, setActiveTab] = useState('assign'); // assign, deliveries, persons
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Assign Delivery State
  const [orders, setOrders] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');

  // Deliveries List State
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryFilter, setDeliveryFilter] = useState('');

  // Create Delivery Person State
  const [newPerson, setNewPerson] = useState({
    name: '',
    employeeId: '',
    phone: '',
    email: '',
    pin: '',
    vehicleNumber: '',
    vehicleType: 'bike'
  });

  // Edit Delivery Person State
  const [editingPerson, setEditingPerson] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const API_URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    if (activeTab === 'assign') {
      fetchOrders();
      fetchDeliveryPersons();
    } else if (activeTab === 'deliveries') {
      fetchDeliveries();
    } else if (activeTab === 'persons') {
      fetchDeliveryPersons();
    }
  }, [activeTab, deliveryFilter]);

    // Fetch orders that need delivery assignment
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching orders from:', `${API_URL}api/orders/admin/all?limit=100`);
      console.log('Admin token:', adminToken ? 'Present' : 'Missing');
      
      const response = await axios.get(`${API_URL}api/orders/admin/all?limit=100`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('Orders API Response:', response.data);
      
      // Check if response has data
      if (response.data && response.data.success) {
        // Backend returns: { success: true, data: { orders: [...], totalPages, currentPage, total } }
        const ordersData = response.data.data.orders || [];
        
        console.log('Total orders fetched:', ordersData.length);
        
        // Log all order statuses to see what we have
        console.log('Order statuses:', ordersData.map(o => ({ orderNumber: o.orderNumber, status: o.status })));
        
        // Filter orders that can be assigned for delivery
        // Include: pending, confirmed, processing (exclude: cancelled, delivered, shipped)
        const unassignedOrders = ordersData.filter(
          order => ['pending', 'confirmed', 'processing'].includes(order.status)
        );
        
        console.log('Unassigned orders (pending/confirmed/processing):', unassignedOrders.length);
        console.log('Filtered orders:', unassignedOrders.map(o => ({ orderNumber: o.orderNumber, status: o.status })));
        setOrders(unassignedOrders);
      } else {
        console.warn('No data in response');
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch delivery persons
  const fetchDeliveryPersons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}api/delivery/admin/delivery-persons`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setDeliveryPersons(response.data.data);
    } catch (err) {
      setError('Failed to fetch delivery persons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all deliveries
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const url = deliveryFilter 
        ? `${API_URL}api/delivery/admin/all?status=${deliveryFilter}`
        : `${API_URL}api/delivery/admin/all`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setDeliveries(response.data.data.deliveries);
    } catch (err) {
      setError('Failed to fetch deliveries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Assign delivery
  const handleAssignDelivery = async (e) => {
    e.preventDefault();
    
    if (!selectedOrder || !selectedPerson) {
      setError('Please select both order and delivery person');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await axios.post(
        `${API_URL}api/delivery/assign`,
        {
          orderId: selectedOrder,
          deliveryPersonId: selectedPerson
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      setSuccess('Delivery assigned successfully!');
      setSelectedOrder('');
      setSelectedPerson('');
      fetchOrders(); // Refresh orders list
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign delivery');
    } finally {
      setLoading(false);
    }
  };

  // Create delivery person
  const handleCreatePerson = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      await axios.post(
        `${API_URL}api/delivery/admin/delivery-person`,
        newPerson,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      setSuccess('Delivery person created successfully!');
      setNewPerson({
        name: '',
        employeeId: '',
        phone: '',
        email: '',
        pin: '',
        vehicleNumber: '',
        vehicleType: 'bike'
      });
      
      fetchDeliveryPersons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create delivery person');
    } finally {
      setLoading(false);
    }
  };

  // Edit delivery person
  const handleEditPerson = (person) => {
    setEditingPerson({
      id: person._id,
      name: person.name,
      phone: person.phone,
      email: person.email || '',
      vehicleNumber: person.vehicleNumber || '',
      vehicleType: person.vehicleType,
      isActive: person.isActive
    });
    setShowEditModal(true);
  };

  // Update delivery person
  const handleUpdatePerson = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      await axios.put(
        `${API_URL}api/delivery/admin/delivery-person/${editingPerson.id}`,
        {
          name: editingPerson.name,
          phone: editingPerson.phone,
          email: editingPerson.email,
          vehicleNumber: editingPerson.vehicleNumber,
          vehicleType: editingPerson.vehicleType,
          isActive: editingPerson.isActive
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      setSuccess('Delivery person updated successfully!');
      setShowEditModal(false);
      setEditingPerson(null);
      fetchDeliveryPersons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update delivery person');
    } finally {
      setLoading(false);
    }
  };

  // Delete delivery person
  const handleDeletePerson = async (personId) => {
    if (!window.confirm('Are you sure you want to delete this delivery person? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      await axios.delete(
        `${API_URL}api/delivery/admin/delivery-person/${personId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      setSuccess('Delivery person deleted successfully!');
      fetchDeliveryPersons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete delivery person');
    } finally {
      setLoading(false);
    }
  };

  // Delete delivery assignment
  const handleDeleteDelivery = async (deliveryId) => {
    if (!window.confirm('Are you sure you want to delete this delivery assignment? The order will be moved back to processing.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      await axios.delete(
        `${API_URL}api/delivery/admin/delivery/${deliveryId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      setSuccess('Delivery assignment deleted successfully!');
      fetchDeliveries();
      fetchOrders(); // Refresh orders list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete delivery assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-management">
      <div className="delivery-header">
        <h2>Delivery Management</h2>
        <p>Manage deliveries and delivery persons</p>
      </div>

      {/* Tabs */}
      <div className="delivery-tabs">
        <button
          className={`delivery-admin-tab-btn ${activeTab === 'assign' ? 'active' : ''}`}
          onClick={() => setActiveTab('assign')}
        >
          Assign Delivery
        </button>
        <button
          className={`delivery-admin-tab-btn ${activeTab === 'deliveries' ? 'active' : ''}`}
          onClick={() => setActiveTab('deliveries')}
        >
          All Deliveries
        </button>
        <button
          className={`delivery-admin-tab-btn ${activeTab === 'persons' ? 'active' : ''}`}
          onClick={() => setActiveTab('persons')}
        >
          Delivery Persons
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="delivery-admin-alert delivery-admin-alert-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      
      {success && (
        <div className="delivery-admin-alert delivery-admin-alert-success">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Content */}
      <div className="delivery-content">
        {/* Assign Delivery Tab */}
        {activeTab === 'assign' && (
          <div className="assign-delivery-section">
            <div className="section-card">
              <h3>Assign Order to Delivery Person</h3>
              <form onSubmit={handleAssignDelivery}>
                <div className="delivery-admin-form-group">
                  <label>Select Order</label>
                  <select
                    value={selectedOrder}
                    onChange={(e) => setSelectedOrder(e.target.value)}
                    required
                  >
                    <option value="">-- Select Order --</option>
                    {orders && orders.length > 0 ? orders.map(order => (
                      <option key={order._id} value={order._id}>
                        {order.orderNumber} - {order.billingAddress.firstName} {order.billingAddress.lastName} - ₹{order.orderSummary.total.toFixed(2)}
                      </option>
                    )) : null}
                  </select>
                </div>

                <div className="delivery-admin-form-group">
                  <label>Select Delivery Person</label>
                  <select
                    value={selectedPerson}
                    onChange={(e) => setSelectedPerson(e.target.value)}
                    required
                  >
                    <option value="">-- Select Delivery Person --</option>
                    {deliveryPersons && deliveryPersons.length > 0 ? deliveryPersons.filter(p => p.isActive).map(person => (
                      <option key={person._id} value={person.employeeId}>
                        {person.name} ({person.employeeId}) - {person.vehicleType}
                      </option>
                    )) : null}
                  </select>
                </div>

                <button type="submit" className="delivery-admin-assign-btn btn-primary" disabled={loading}>
                  {loading ? 'Assigning...' : 'Assign Delivery'}
                </button>
              </form>
            </div>

            {/* Orders List */}
            <div className="section-card">
              <h3>Pending Orders ({orders.length})</h3>
              <div className="orders-list">
                {orders.length === 0 ? (
                  <p className="empty-message">No orders pending assignment</p>
                ) : (
                  orders.map(order => (
                    <div key={order._id} className="order-item">
                      <div className="order-info">
                        <h4>{order.orderNumber}</h4>
                        <p>Customer: {order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                        <p>Amount: ${order.orderSummary.total.toFixed(2)}</p>
                        <p>Payment: {order.paymentMethod === 'cod' ? '💵 COD' : '💳 Paid'}</p>
                      </div>
                      <span className={`status-badge ${order.status}`}>{order.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div className="deliveries-section">
            <div className="section-card">
              <div className="filter-bar">
                <h3>All Deliveries ({deliveries.length})</h3>
                <select
                  value={deliveryFilter}
                  onChange={(e) => setDeliveryFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="assigned">Assigned</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="deliveries-list">
                {deliveries.length === 0 ? (
                  <p className="empty-message">No deliveries found</p>
                ) : (
                  deliveries.map(delivery => (
                    <div key={delivery._id} className="delivery-item">
                      <div className="delivery-header-row">
                        <h4>{delivery.orderNumber}</h4>
                        <span className={`status-badge ${delivery.deliveryStatus}`}>
                          {delivery.deliveryStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="delivery-details">
                        <p><strong>Delivery Person:</strong> {delivery.deliveryPersonName}</p>
                        <p><strong>Customer:</strong> {delivery.customerInfo.name}</p>
                        <p><strong>Phone:</strong> {delivery.customerInfo.phone}</p>
                        <p><strong>Address:</strong> {delivery.customerInfo.address}</p>
                        <p><strong>Amount:</strong> ${delivery.orderAmount.toFixed(2)} 
                          {delivery.paymentMethod === 'cod' && <span className="cod-badge">COD</span>}
                        </p>
                        <p><strong>Assigned:</strong> {new Date(delivery.assignedAt).toLocaleString()}</p>
                        {delivery.deliveredAt && (
                          <p><strong>Delivered:</strong> {new Date(delivery.deliveredAt).toLocaleString()}</p>
                        )}
                        {delivery.failureReason && (
                          <p className="failure-reason"><strong>Failure Reason:</strong> {delivery.failureReason}</p>
                        )}
                      </div>
                      <div className="delivery-actions">
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteDelivery(delivery._id)}
                          disabled={delivery.deliveryStatus === 'delivered'}
                          title={delivery.deliveryStatus === 'delivered' ? 'Cannot delete completed delivery' : 'Delete delivery assignment'}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delivery Persons Tab */}
        {activeTab === 'persons' && (
          <div className="persons-section">
            {/* Create New Person */}
            <div className="section-card">
              <h3>Create New Delivery Person</h3>
              <form onSubmit={handleCreatePerson}>
                <div className="delivery-admin-form-row">
                  <div className="delivery-admin-form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={newPerson.name}
                      onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="delivery-admin-form-group">
                    <label>Employee ID *</label>
                    <input
                      type="text"
                      value={newPerson.employeeId}
                      onChange={(e) => setNewPerson({...newPerson, employeeId: e.target.value.toUpperCase()})}
                      placeholder="DP001"
                      required
                    />
                  </div>
                </div>

                <div className="delivery-admin-form-row">
                  <div className="delivery-admin-form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      value={newPerson.phone}
                      onChange={(e) => setNewPerson({...newPerson, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="delivery-admin-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={newPerson.email}
                      onChange={(e) => setNewPerson({...newPerson, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="delivery-admin-form-row">
                  <div className="delivery-admin-form-group">
                    <label>PIN (4-6 digits) *</label>
                    <input
                      type="password"
                      value={newPerson.pin}
                      onChange={(e) => setNewPerson({...newPerson, pin: e.target.value})}
                      minLength="4"
                      maxLength="6"
                      required
                    />
                  </div>
                  <div className="delivery-admin-form-group">
                    <label>Vehicle Type</label>
                    <select
                      value={newPerson.vehicleType}
                      onChange={(e) => setNewPerson({...newPerson, vehicleType: e.target.value})}
                    >
                      <option value="bike">Bike</option>
                      <option value="scooter">Scooter</option>
                      <option value="car">Car</option>
                      <option value="van">Van</option>
                      <option value="bicycle">Bicycle</option>
                    </select>
                  </div>
                </div>

                <div className="delivery-admin-form-group">
                  <label>Vehicle Number</label>
                  <input
                    type="text"
                    value={newPerson.vehicleNumber}
                    onChange={(e) => setNewPerson({...newPerson, vehicleNumber: e.target.value.toUpperCase()})}
                    placeholder="TN01AB1234"
                  />
                </div>

                <button type="submit" className="delivery-admin-create-btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Delivery Person'}
                </button>
              </form>
            </div>

            {/* Delivery Persons List */}
            <div className="section-card">
              <h3>All Delivery Persons ({deliveryPersons.length})</h3>
              <div className="persons-list">
                {deliveryPersons.length === 0 ? (
                  <p className="empty-message">No delivery persons found</p>
                ) : (
                  deliveryPersons.map(person => (
                    <div key={person._id} className="person-item">
                      <div className="person-info">
                        <h4>{person.name}</h4>
                        <p><strong>ID:</strong> {person.employeeId}</p>
                        <p><strong>Phone:</strong> {person.phone}</p>
                        {person.email && <p><strong>Email:</strong> {person.email}</p>}
                        <p><strong>Vehicle:</strong> {person.vehicleType} {person.vehicleNumber && `- ${person.vehicleNumber}`}</p>
                      </div>
                      <div className="person-stats">
                        <div className="delivery-person-stat">
                          <span className="delivery-person-stat-value">{person.totalDeliveries}</span>
                          <span className="delivery-person-stat-label">Total</span>
                        </div>
                        <div className="delivery-person-stat">
                          <span className="delivery-person-stat-value">{person.successfulDeliveries}</span>
                          <span className="delivery-person-stat-label">Success</span>
                        </div>
                        <div className="delivery-person-stat">
                          <span className="delivery-person-stat-value">{person.failedDeliveries}</span>
                          <span className="delivery-person-stat-label">Failed</span>
                        </div>
                        <div className="delivery-person-stat">
                          <span className="delivery-person-stat-value">
                            {person.totalDeliveries > 0 
                              ? ((person.successfulDeliveries / person.totalDeliveries) * 100).toFixed(0)
                              : 0}%
                          </span>
                          <span className="delivery-person-stat-label">Rate</span>
                        </div>
                      </div>
                      <div className="person-actions">
                        <button 
                          className="btn-edit"
                          onClick={() => handleEditPerson(person)}
                          title="Edit delivery person"
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeletePerson(person._id)}
                          title="Delete delivery person"
                        >
                          Delete
                        </button>
                      </div>
                      <span className={`status-badge ${person.isActive ? 'active' : 'inactive'}`}>
                        {person.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Person Modal */}
      {showEditModal && editingPerson && (
        <div className="delivery-admin-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="delivery-admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delivery-admin-modal-header">
              <h3>Edit Delivery Person</h3>
              <button className="delivery-admin-modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdatePerson}>
              <div className="delivery-admin-form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={editingPerson.name}
                  onChange={(e) => setEditingPerson({...editingPerson, name: e.target.value})}
                  required
                />
              </div>
              <div className="delivery-admin-form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={editingPerson.phone}
                  onChange={(e) => setEditingPerson({...editingPerson, phone: e.target.value})}
                  required
                />
              </div>
              <div className="delivery-admin-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingPerson.email}
                  onChange={(e) => setEditingPerson({...editingPerson, email: e.target.value})}
                />
              </div>
              <div className="delivery-admin-form-group">
                <label>Vehicle Type</label>
                <select
                  value={editingPerson.vehicleType}
                  onChange={(e) => setEditingPerson({...editingPerson, vehicleType: e.target.value})}
                >
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="bicycle">Bicycle</option>
                </select>
              </div>
              <div className="delivery-admin-form-group">
                <label>Vehicle Number</label>
                <input
                  type="text"
                  value={editingPerson.vehicleNumber}
                  onChange={(e) => setEditingPerson({...editingPerson, vehicleNumber: e.target.value.toUpperCase()})}
                  placeholder="TN01AB1234"
                />
              </div>
              <div className="delivery-admin-form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editingPerson.isActive}
                    onChange={(e) => setEditingPerson({...editingPerson, isActive: e.target.checked})}
                  />
                  <span>Active</span>
                </label>
              </div>
              <div className="delivery-admin-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="delivery-admin-update-btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="delivery-admin-loading-overlay">
          <div className="delivery-admin-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default DeliveryManagement;
