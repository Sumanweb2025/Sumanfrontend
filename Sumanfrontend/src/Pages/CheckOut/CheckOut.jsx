import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CheckOut.css';
import Header from '../../Components/Header/Header';
import Footer from "../../Components/Footer/Footer";
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';
import StripePaymentComponent from '../../Components/Payments/StripePayments';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState([]);
  const [orderSummary, setOrderSummary] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [formData, setFormData] = useState({
    contactInfo: {
      email: ''
    },
    billingAddress: {
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      province: 'Tamil Nadu',
      postalCode: '',
      country: 'India',
      phone: ''
    },
    paymentMethod: 'card'
  });

  const [errors, setErrors] = useState({});

  const API_URL = 'http://localhost:8000/';

  // Countries and their states/provinces
  const countriesData = {
    'India': ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'],
    'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
  };

  // Payment methods configuration
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, RuPay - Secure payment via Stripe',
      icon: '💳',
      requiresStripe: true
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Pay using any UPI app - GooglePay, PhonePe, Paytm',
      icon: '📱',
      requiresStripe: false,
      isOnline: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Pay directly from your bank account',
      icon: '🏦',
      requiresStripe: false,
      isOnline: true
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive',
      icon: '💰',
      requiresStripe: false
    }
  ];

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  useEffect(() => {
    // Reset province when country changes
    if (formData.billingAddress.country) {
      const provinces = countriesData[formData.billingAddress.country] || [];
      if (provinces.length > 0 && !provinces.includes(formData.billingAddress.province)) {
        setFormData(prev => ({
          ...prev,
          billingAddress: {
            ...prev.billingAddress,
            province: provinces[0] || ''
          }
        }));
      }
    }
  }, [formData.billingAddress.country]);

  const fetchCheckoutData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await axios.get(`${API_URL}api/orders/checkout`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = response.data.data;
      setOrderItems(data.items);
      setOrderSummary(data.summary);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching checkout data:', error);
      if (error.response?.status === 400) {
        navigate('/cart');
      }
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}api/orders/apply-coupon`,
        { couponCode: couponCode.trim() },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const couponData = response.data.data;
      setAppliedCoupon(couponData);
      
      // Update order summary with discount
      setOrderSummary(prev => ({
        ...prev,
        discount: couponData.discount,
        total: (parseFloat(prev.subtotal) + parseFloat(prev.tax) + parseFloat(prev.shipping) - couponData.discount).toFixed(2)
      }));

      setShowCouponInput(false);
      setCouponCode('');
    } catch (error) {
      console.error('Error applying coupon:', error);
      alert(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setOrderSummary(prev => ({
      ...prev,
      discount: 0,
      total: (parseFloat(prev.subtotal) + parseFloat(prev.tax) + parseFloat(prev.shipping)).toFixed(2)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.contactInfo.email) {
      newErrors['contactInfo.email'] = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactInfo.email)) {
      newErrors['contactInfo.email'] = 'Please enter a valid email';
    }

    // Billing address validation
    const required = ['firstName', 'lastName', 'address', 'city', 'province', 'postalCode'];
    required.forEach(field => {
      if (!formData.billingAddress[field]) {
        newErrors[`billingAddress.${field}`] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    // Postal code validation based on country
    if (formData.billingAddress.postalCode) {
      if (formData.billingAddress.country === 'India' && !/^\d{6}$/.test(formData.billingAddress.postalCode)) {
        newErrors['billingAddress.postalCode'] = 'Please enter a valid 6-digit postal code';
      } else if (formData.billingAddress.country === 'United States' && !/^\d{5}(-\d{4})?$/.test(formData.billingAddress.postalCode)) {
        newErrors['billingAddress.postalCode'] = 'Please enter a valid ZIP code';
      }
    }

    // Payment method validation
    if (!formData.paymentMethod) {
      newErrors['paymentMethod'] = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentSuccess = (orderData) => {
    setOrderDetails(orderData);
    setShowSuccess(true);
    
    // Dispatch cart update event
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const handlePaymentError = (errorMessage) => {
    alert(errorMessage);
    setSubmitting(false);
  };

  const handleNonCardPaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const orderData = {
        ...formData,
        appliedCoupon: appliedCoupon
      };

      const response = await axios.post(
        `${API_URL}api/orders`,
        orderData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      handlePaymentSuccess(response.data.data);
    } catch (error) {
      console.error('Error placing order:', error);
      handlePaymentError(error.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    // For non-card payments, handle directly
    if (formData.paymentMethod !== 'card') {
      handleNonCardPaymentSubmit(e);
    }
    // For card payments, validation is done, payment will be handled by StripePaymentComponent
  };

  const toggleApartmentField = () => {
    const apartmentField = document.getElementById('apartment');
    if (apartmentField.style.display === 'none' || !apartmentField.style.display) {
      apartmentField.style.display = 'block';
    } else {
      apartmentField.style.display = 'none';
    }
  };

  const getPaymentMethodIcon = (method) => {
    const paymentMethod = paymentMethods.find(pm => pm.id === method);
    return paymentMethod ? paymentMethod.icon : '💳';
  };

  const getPaymentStatusText = () => {
    const method = paymentMethods.find(pm => pm.id === formData.paymentMethod);
    if (!method) return 'Processing...';
    
    switch (method.id) {
      case 'card':
        return 'Payment Completed';
      case 'upi':
        return 'UPI Payment Completed';
      case 'netbanking':
        return 'Net Banking Payment Completed';
      case 'cod':
        return 'Order Confirmed - COD';
      default:
        return 'Order Confirmed';
    }
  };

  if (loading) {
    return (
      <>
        <LoadingSpinner 
          isLoading={loading} 
          brandName="Checkout" 
          loadingText="Loading checkout..."
          progressColor="#3b82f6"
        />
        <Header />
        <Footer />
      </>
    );
  }

  if (showSuccess) {
    return (
      <>
        <Header />
        <div className="checkout-page">
          <div className="success-modal-overlay">
            <div className="success-modal">
              <div className="success-content">
                <div className="success-icon">🎉</div>
                <h1 className="success-title">Order Placed Successfully!</h1>
                <p className="success-message">
                  Thank you for your order. We've sent a confirmation email with detailed invoice to{' '}
                  <strong>{formData.contactInfo.email}</strong>
                </p>
                
                <div className="order-details">
                  <p className="order-label">Order Number</p>
                  <p className="order-number">{orderDetails?.orderNumber}</p>
                  <p className="order-label">Total Amount</p>
                  <p className="order-total">${orderDetails?.total}</p>
                  {orderDetails?.paymentStatus === 'paid' && (
                    <>
                      <p className="order-label">Payment Status</p>
                      <p className="payment-success">✅ {getPaymentStatusText()}</p>
                    </>
                  )}
                  {formData.paymentMethod === 'cod' && (
                    <>
                      <p className="order-label">Payment Method</p>
                      <p className="payment-cod">💰 Cash on Delivery</p>
                    </>
                  )}
                </div>

                <div className="success-actions">
                  <button
                    className="btn-primary"
                    onClick={() => navigate('/myorders')}
                  >
                    View My Orders
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => navigate('/sweets')}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="checkout-page">
        {/* Header */}
        <div className="checkout-header">
          <div className="checkout-container">
            <h1 className="checkout-title">Checkout</h1>
            <div className="breadcrumb">
              <span onClick={() => navigate('/')}>Home</span>
              <span className="breadcrumb-separator"> › </span>
              <span className="current">Checkout</span>
            </div>
          </div>
        </div>

        <div className="checkout-container">
          <div className="checkout-content">
            {/* Left Side - Forms */}
            <div className="checkout-left">
              {/* Contact Information */}
              <div className="checkout-section">
                <h2 className="checkout-section-title">Contact information</h2>
                <p className="checkout-section-description">We'll use this email to send you details and updates about your order.</p>
                
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.contactInfo.email}
                    onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                    className={`form-input ${errors['contactInfo.email'] ? 'error' : ''}`}
                  />
                  {errors['contactInfo.email'] && (
                    <p className="error-message">
                      <span className="error-icon">⚠</span>
                      {errors['contactInfo.email']}
                    </p>
                  )}
                </div>
                
                <p className="guest-notice">You are currently checking out as a guest.</p>
              </div>

              {/* Billing Address */}
              <div className="checkout-section">
                <h2 className="checkout-section-title">Billing address</h2>
                <p className="checkout-section-description">Enter the billing address that matches your payment method.</p>

                <form onSubmit={handleSubmit}>
                  {/* Country */}
                  <div className="form-group">
                    <select
                      value={formData.billingAddress.country}
                      onChange={(e) => handleInputChange('billingAddress', 'country', e.target.value)}
                      className="form-input"
                    >
                      {Object.keys(countriesData).map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  {/* Name fields */}
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="First name"
                        value={formData.billingAddress.firstName}
                        onChange={(e) => handleInputChange('billingAddress', 'firstName', e.target.value)}
                        className={`form-input ${errors['billingAddress.firstName'] ? 'error' : ''}`}
                      />
                      {errors['billingAddress.firstName'] && (
                        <p className="error-message">
                          <span className="error-icon">⚠</span>
                          {errors['billingAddress.firstName']}
                        </p>
                      )}
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Last name"
                        value={formData.billingAddress.lastName}
                        onChange={(e) => handleInputChange('billingAddress', 'lastName', e.target.value)}
                        className={`form-input ${errors['billingAddress.lastName'] ? 'error' : ''}`}
                      />
                      {errors['billingAddress.lastName'] && (
                        <p className="error-message">
                          <span className="error-icon">⚠</span>
                          {errors['billingAddress.lastName']}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Address"
                      value={formData.billingAddress.address}
                      onChange={(e) => handleInputChange('billingAddress', 'address', e.target.value)}
                      className={`form-input ${errors['billingAddress.address'] ? 'error' : ''}`}
                    />
                    {errors['billingAddress.address'] && (
                      <p className="error-message">
                        <span className="error-icon">⚠</span>
                        {errors['billingAddress.address']}
                      </p>
                    )}
                  </div>

                  {/* Apartment */}
                  <div className="form-group">
                    <button
                      type="button"
                      onClick={toggleApartmentField}
                      className="add-apartment-btn"
                    >
                      + Add apartment, suite, etc.
                    </button>
                    <input
                      id="apartment"
                      type="text"
                      placeholder="Apartment, suite, etc. (optional)"
                      value={formData.billingAddress.apartment}
                      onChange={(e) => handleInputChange('billingAddress', 'apartment', e.target.value)}
                      className="form-input apartment-field"
                      style={{display: 'none', marginTop: '0.75rem'}}
                    />
                  </div>

                  {/* City and Province */}
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.billingAddress.city}
                        onChange={(e) => handleInputChange('billingAddress', 'city', e.target.value)}
                        className={`form-input ${errors['billingAddress.city'] ? 'error' : ''}`}
                      />
                      {errors['billingAddress.city'] && (
                        <p className="error-message">
                          <span className="error-icon">⚠</span>
                          {errors['billingAddress.city']}
                        </p>
                      )}
                    </div>
                    <div className="form-group">
                      <select
                        value={formData.billingAddress.province}
                        onChange={(e) => handleInputChange('billingAddress', 'province', e.target.value)}
                        className="form-input"
                      >
                        <option value="">Select State/Province</option>
                        {(countriesData[formData.billingAddress.country] || []).map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Postal Code and Phone */}
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Postal code"
                        value={formData.billingAddress.postalCode}
                        onChange={(e) => handleInputChange('billingAddress', 'postalCode', e.target.value)}
                        className={`form-input ${errors['billingAddress.postalCode'] ? 'error' : ''}`}
                      />
                      {errors['billingAddress.postalCode'] && (
                        <p className="error-message">
                          <span className="error-icon">⚠</span>
                          {errors['billingAddress.postalCode']}
                        </p>
                      )}
                    </div>
                    <div className="form-group">
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={formData.billingAddress.phone}
                        onChange={(e) => handleInputChange('billingAddress', 'phone', e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Payment Options */}
              <div className="checkout-section">
                <h2 className="checkout-section-title">Payment options</h2>
                
                <div className="checkout-payment-methods">
                  {paymentMethods.map((method) => (
                    <label key={method.id} className="checkout-payment-method">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={(e) => setFormData(prev => ({...prev, paymentMethod: e.target.value}))}
                        className="payment-radio"
                      />
                      <div className="checkout-payment-content">
                        <div className="payment-icon">{method.icon}</div>
                        <div className="payment-info">
                          <div className="payment-name">{method.name}</div>
                          <div className="payment-desc">{method.description}</div>
                          {method.isOnline && (
                            <div className="payment-status" style={{color: '#059669', fontSize: '0.75rem'}}>
                              ✅ Instant Payment
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Stripe Payment Form - Only show for card payments */}
                {formData.paymentMethod === 'card' && (
                  <StripePaymentComponent
                    formData={formData}
                    appliedCoupon={appliedCoupon}
                    orderSummary={orderSummary}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    submitting={submitting}
                    setSubmitting={setSubmitting}
                  />
                )}

                {/* UPI Payment Instructions */}
                {formData.paymentMethod === 'upi' && (
                  <div className="payment-instructions">
                    <div className="upi-payment-info">
                      <h3 style={{color: '#059669', margin: '0 0 1rem 0'}}>📱 UPI Payment Instructions</h3>
                      <div style={{background: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
                        <p style={{margin: '0 0 0.5rem 0', color: '#166534'}}>
                          <strong>Step 1:</strong> Click "Place Order" to confirm your order
                        </p>
                        <p style={{margin: '0 0 0.5rem 0', color: '#166534'}}>
                          <strong>Step 2:</strong> You'll receive UPI payment link via email
                        </p>
                        <p style={{margin: '0', color: '#166534'}}>
                          <strong>Step 3:</strong> Complete payment using any UPI app
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking Instructions */}
                {formData.paymentMethod === 'netbanking' && (
                  <div className="payment-instructions">
                    <div className="netbanking-payment-info">
                      <h3 style={{color: '#1e40af', margin: '0 0 1rem 0'}}>🏦 Net Banking Instructions</h3>
                      <div style={{background: '#f0f9ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
                        <p style={{margin: '0 0 0.5rem 0', color: '#1e40af'}}>
                          <strong>Step 1:</strong> Click "Place Order" to confirm your order
                        </p>
                        <p style={{margin: '0 0 0.5rem 0', color: '#1e40af'}}>
                          <strong>Step 2:</strong> You'll be redirected to your bank's secure portal
                        </p>
                        <p style={{margin: '0', color: '#1e40af'}}>
                          <strong>Step 3:</strong> Login and complete the payment
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Non-Card Payment Button */}
                {formData.paymentMethod !== 'card' && (
                  <>
                    <div className="checkout-terms-section">
                      <p className="checkout-terms-text">
                        By proceeding with your purchase you agree to our Terms and Conditions and{' '}
                        <a href="#" className="privacy-link">Privacy Policy</a>
                      </p>
                    </div>

                    <button
                      type="submit"
                      onClick={handleNonCardPaymentSubmit}
                      disabled={submitting}
                      className="place-order-btn"
                      style={{
                        background: formData.paymentMethod === 'upi' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' :
                                   formData.paymentMethod === 'netbanking' ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' :
                                   'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                      }}
                    >
                      {submitting && <span className="loading-spinner"></span>}
                      {submitting ? 'Processing...' : 
                       formData.paymentMethod === 'upi' ? `Pay ₹${orderSummary.total} via UPI` :
                       formData.paymentMethod === 'netbanking' ? `Pay ₹${orderSummary.total} via Net Banking` :
                       `PLACE ORDER (₹${orderSummary.total} COD)`}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="checkout-right">
              <div className="checkout-order-summary">
                <div className="checkout-summary-header">
                  <h2 className="checkout-summary-title">Order summary</h2>
                </div>

                {/* Order Items */}
                <div className="checkout-order-items">
                  {orderItems.map((item) => (
                    <div key={item.productId._id} className="checkout-order-item">
                      <div className="checkout-item-image-container">
                        <img
                          src={item.productId.imageUrl || `${API_URL}/uploads/${item.productId.image}`}
                          alt={item.productId.name}
                          className="checkout-item-image"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64';
                          }}
                        />
                        <span className="checkout-item-quantity-badge">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="checkout-item-details">
                        <h3 className="checkout-item-name">{item.productId.name}</h3>
                        <p className="checkout-item-price">${item.productId.price}</p>
                        {item.productId.brand && (
                          <p className="checkout-item-brand">{item.productId.brand}</p>
                        )}
                      </div>
                      <div className="checkout-item-total">
                        <p>${(item.productId.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Section */}
                <div className="coupon-section">
                  {!appliedCoupon ? (
                    <div>
                      <button
                        onClick={() => setShowCouponInput(!showCouponInput)}
                        className="coupon-btn"
                      >
                        <span>Add a coupon</span>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className={`coupon-arrow ${showCouponInput ? 'rotated' : ''}`}>
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414L11.414 12l3.293 3.293a1 1 0 01-1.414 1.414L10 13.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 12 5.293 8.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {showCouponInput && (
                        <div className="coupon-input-container">
                          <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="coupon-input"
                          />
                          <button
                            onClick={applyCoupon}
                            disabled={couponLoading || !couponCode.trim()}
                            className="coupon-apply-btn"
                          >
                            {couponLoading ? 'Applying...' : 'Apply'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="applied-coupon">
                      <div className="coupon-success">
                        <span className="coupon-success-text">🎉 {appliedCoupon.code} applied</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="coupon-remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Order Totals */}
                <div className="totals-section">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>${orderSummary.subtotal}</span>
                  </div>
                  
                  <div className="total-row">
                    <span>Tax (HST 13%)</span>
                    <span>${orderSummary.tax}</span>
                  </div>
                  
                  <div className="total-row">
                    <span>Shipping</span>
                    <span>{parseFloat(orderSummary.shipping) === 0 ? 'FREE' : `$${orderSummary.shipping}`}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="total-row discount-row">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>- ${appliedCoupon.discount}</span>
                    </div>
                  )}
                  
                  {parseFloat(orderSummary.shipping) === 0 && (
                    <div className="free-shipping-notice">
                      🎉 You've earned free shipping!
                    </div>
                  )}

                  {/* Total */}
                  <div className="total-row final">
                    <span>Total</span>
                    <span>${orderSummary.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;