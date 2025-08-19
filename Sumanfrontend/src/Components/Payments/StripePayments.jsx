
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY);

// Card Element Options
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSmoothing: 'antialiased',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true,
};

// Payment Form Component
const PaymentForm = ({ 
  formData, 
  appliedCoupon, 
  orderSummary, 
  onSuccess, 
  onError, 
  submitting, 
  setSubmitting 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const API_URL = 'http://localhost:8000/';

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : null);
  };

  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      onError('Stripe is not loaded properly. Please refresh and try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card information is required');
      return;
    }

    setProcessingPayment(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Step 1: Create Payment Intent
      const paymentIntentResponse = await axios.post(
        `${API_URL}api/orders/create-payment-intent`,
        { appliedCoupon },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const { clientSecret } = paymentIntentResponse.data.data;

      // Step 2: Confirm Payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${formData.billingAddress.firstName} ${formData.billingAddress.lastName}`,
            email: formData.contactInfo.email,
            address: {
              line1: formData.billingAddress.address,
              line2: formData.billingAddress.apartment || '',
              city: formData.billingAddress.city,
              state: formData.billingAddress.province,
              postal_code: formData.billingAddress.postalCode,
              country: formData.billingAddress.country === 'India' ? 'IN' : 'US',
            },
            phone: formData.billingAddress.phone || '',
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        onError(error.message || 'Payment failed. Please try again.');
        setProcessingPayment(false);
        return;
      }

      // Step 3: Confirm payment success and create order
      if (paymentIntent.status === 'succeeded') {
        const confirmResponse = await axios.post(
          `${API_URL}api/orders/confirm-payment`,
          {
            paymentIntentId: paymentIntent.id,
            contactInfo: formData.contactInfo,
            billingAddress: formData.billingAddress,
            paymentMethod: 'card'
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        onSuccess(confirmResponse.data.data);
      } else {
        onError('Payment was not completed successfully');
      }
    } catch (error) {
      console.error('Payment process error:', error);
      onError(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="stripe-payment-form">
      <div className="card-element-container">
        <label className="card-element-label">Card Information</label>
        <div className="card-element-wrapper">
          <CardElement
            options={cardElementOptions}
            onChange={handleCardChange}
          />
        </div>
        {cardError && (
          <div className="card-error">
            <span className="error-icon">⚠</span>
            {cardError}
          </div>
        )}
      </div>
      
      <div className="payment-security-notice">
        <div className="security-icons">
          <span>🔒</span>
        </div>
        <p>Your payment information is encrypted and secure</p>
      </div>

      <button
        type="button"
        onClick={handleStripePayment}
        disabled={!stripe || submitting || processingPayment}
        className="pay-now-btn"
      >
        {processingPayment && <span className="loading-spinner"></span>}
        {processingPayment 
          ? 'Processing Payment...' 
          : `Pay $${orderSummary.total} Now`
        }
      </button>
    </div>
  );
};

// Main Stripe Payment Component
const StripePaymentComponent = ({ 
  formData, 
  appliedCoupon, 
  orderSummary, 
  onSuccess, 
  onError, 
  submitting, 
  setSubmitting 
}) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        formData={formData}
        appliedCoupon={appliedCoupon}
        orderSummary={orderSummary}
        onSuccess={onSuccess}
        onError={onError}
        submitting={submitting}
        setSubmitting={setSubmitting}
      />
    </Elements>
  );
};

export default StripePaymentComponent;