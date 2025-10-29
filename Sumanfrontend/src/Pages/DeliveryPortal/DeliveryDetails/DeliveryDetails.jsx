import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
  MapPinned
} from 'lucide-react';
import './DeliveryDetails.css';

const DeliveryDetails = () => {
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [location, setLocation] = useState(null);
  
  const { deliveryId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('deliveryToken');

  useEffect(() => {
    if (!token) {
      navigate('/delivery/login');
      return;
    }
    fetchDeliveryDetails();
    getCurrentLocation();
  }, [deliveryId]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const fetchDeliveryDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}api/delivery/${deliveryId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDelivery(response.data.data);
    } catch (err) {
      setError('Failed to fetch delivery details');
      if (err.response?.status === 401) {
        navigate('/delivery/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkOutForDelivery = async () => {
    try {
      setActionLoading(true);
      await axios.put(
        `${import.meta.env.VITE_APP_API_URL}api/delivery/${deliveryId}/out-for-delivery`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('✅ Marked as out for delivery!');
      fetchDeliveryDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    try {
      setActionLoading(true);
      const payload = {
        notes: deliveryNotes || null,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null
      };

      await axios.put(
        `${import.meta.env.VITE_APP_API_URL}api/delivery/${deliveryId}/delivered`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setShowConfirmModal(false);
      alert('✅ Delivery completed successfully!');
      navigate('/delivery/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as delivered');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkFailed = async () => {
    if (!failureReason.trim()) {
      alert('Please provide a failure reason');
      return;
    }

    try {
      setActionLoading(true);
      await axios.put(
        `${import.meta.env.VITE_APP_API_URL}api/delivery/${deliveryId}/failed`,
        { reason: failureReason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setShowFailModal(false);
      alert('⚠️ Delivery marked as failed');
      navigate('/delivery/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="delivery-details-loading">
        <div className="delivery-details-spinner"></div>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="delivery-error-container">
        <div className="delivery-error-card">
          <AlertCircle className="delivery-error-icon" />
          <h2>Error</h2>
          <p>{error || 'Delivery not found'}</p>
          <button
            onClick={() => navigate('/delivery/dashboard')}
            className="delivery-error-btn"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const canMarkOutForDelivery = delivery.deliveryStatus === 'assigned';
  const canMarkDelivered = ['assigned', 'out_for_delivery'].includes(delivery.deliveryStatus);

  return (
    <div className="delivery-details-page">
      {/* Header */}
      <header className="delivery-details-header">
        <div className="delivery-details-header-content">
          <button
            onClick={() => navigate('/delivery/dashboard')}
            className="delivery-back-btn"
          >
            <ArrowLeft />
          </button>
          <div className="delivery-details-header-info">
            <h1>Delivery Details</h1>
            <p>Order #{delivery.orderNumber}</p>
          </div>
        </div>
      </header>

      <div className="delivery-details-content">
        {/* Status Badge */}
        <div className="delivery-details-status">
          <span className={`delivery-status-badge-large ${delivery.deliveryStatus}`}>
            {delivery.deliveryStatus === 'delivered' && <CheckCircle />}
            {delivery.deliveryStatus === 'out_for_delivery' && <Truck />}
            {delivery.deliveryStatus === 'failed' && <XCircle />}
            {delivery.deliveryStatus.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Customer Information */}
        <div className="delivery-section-card">
          <h2 className="delivery-section-title">
            <MapPin />
            Customer Information
          </h2>
          <div className="delivery-info-grid">
            <div className="delivery-info-item">
              <p className="delivery-info-label">Name</p>
              <p className="delivery-info-value">{delivery.customerInfo.name}</p>
            </div>
            {delivery.customerInfo.phone && (
              <div className="delivery-info-item">
                <p className="delivery-info-label">Phone</p>
                <a
                  href={`tel:${delivery.customerInfo.phone}`}
                  className="delivery-phone-link"
                >
                  <Phone />
                  {delivery.customerInfo.phone}
                </a>
              </div>
            )}
            {delivery.customerInfo.email && (
              <div className="delivery-info-item">
                <p className="delivery-info-label">Email</p>
                <p className="delivery-info-value delivery-email-text">
                  <Mail />
                  {delivery.customerInfo.email}
                </p>
              </div>
            )}
            <div className="delivery-info-item">
              <p className="delivery-info-label">Delivery Address</p>
              <p className="delivery-info-value">{delivery.customerInfo.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(delivery.customerInfo.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="delivery-maps-link"
              >
                <MapPinned />
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="delivery-section-card">
          <h2 className="delivery-section-title">
            <Package />
            Order Items ({delivery.orderItems.length})
          </h2>
          <div className="delivery-items-list">
            {delivery.orderItems.map((item, index) => (
              <div key={index} className="delivery-item">
                <div className="delivery-item-info">
                  <h4>{item.productName}</h4>
                  <p>Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                </div>
                <p className="delivery-item-price">${(item.quantity * item.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Information */}
        <div className="delivery-section-card">
          <h2 className="delivery-section-title">
            <DollarSign />
            Payment Information
          </h2>
          <div>
            <div className="delivery-payment-row">
              <p className="delivery-payment-label">Total Amount</p>
              <p className="delivery-payment-value">${delivery.orderAmount.toFixed(2)}</p>
            </div>
            <div className="delivery-payment-row">
              <p className="delivery-payment-label">Payment Method</p>
              <span className={`delivery-payment-method-badge ${delivery.paymentMethod === 'cod' ? 'cod' : 'paid'}`}>
                {delivery.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Paid Online'}
              </span>
            </div>
            {delivery.paymentMethod === 'cod' && (
              <div className="delivery-cod-alert">
                <p>⚠️ Collect ${delivery.orderAmount.toFixed(2)} in cash from customer</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {canMarkDelivered && (
          <div className="delivery-actions">
            {canMarkOutForDelivery && (
              <button
                onClick={handleMarkOutForDelivery}
                disabled={actionLoading}
                className="delivery-action-btn blue"
              >
                <Truck />
                Mark as Out for Delivery
              </button>
            )}
            
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={actionLoading}
              className="delivery-action-btn green"
            >
              <CheckCircle />
              Mark as Delivered
            </button>

            <button
              onClick={() => setShowFailModal(true)}
              disabled={actionLoading}
              className="delivery-action-btn red"
            >
              <XCircle />
              Mark as Failed
            </button>
          </div>
        )}
      </div>

      {/* Confirm Delivery Modal */}
      {showConfirmModal && (
        <div className="delivery-modal-overlay">
          <div className="delivery-modal">
            <h3 className="delivery-modal-title">Confirm Delivery</h3>
            <p className="delivery-modal-text">
              Are you sure you want to mark this delivery as completed?
            </p>
            
            <div className="delivery-modal-form-group">
              <label className="delivery-modal-label">
                Delivery Notes (Optional)
              </label>
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Add any notes about the delivery..."
                className="delivery-modal-textarea"
                rows="3"
              />
            </div>

            {location && (
              <div className="delivery-modal-info">
                <p>
                  📍 Location captured: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
            )}

            <div className="delivery-modal-actions">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="delivery-modal-btn cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkDelivered}
                disabled={actionLoading}
                className="delivery-modal-btn confirm"
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failed Delivery Modal */}
      {showFailModal && (
        <div className="delivery-modal-overlay">
          <div className="delivery-modal">
            <h3 className="delivery-modal-title">Mark as Failed</h3>
            <p className="delivery-modal-text">
              Please provide a reason for the failed delivery:
            </p>
            
            <div className="delivery-modal-form-group">
              <textarea
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                placeholder="e.g., Customer not available, Wrong address, etc."
                className="delivery-modal-textarea"
                rows="4"
                required
              />
            </div>

            <div className="delivery-modal-actions">
              <button
                onClick={() => setShowFailModal(false)}
                className="delivery-modal-btn cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkFailed}
                disabled={actionLoading || !failureReason.trim()}
                className="delivery-modal-btn confirm"
              >
                {actionLoading ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDetails;