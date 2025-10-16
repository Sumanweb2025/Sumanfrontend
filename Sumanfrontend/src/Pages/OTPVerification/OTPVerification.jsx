import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './OTPVerification.css';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);
  const [errors, setErrors] = useState({});

  const inputRefs = useRef([]);
  const API_URL = import.meta.env.VITE_APP_API_URL;

  // Get data from navigation state - UPDATED to include countryCode
  const { tempUserId, phone, countryCode, fullPhoneNumber, name, email } = location.state || {};

  // Security: Redirect if no required data - UPDATED
  useEffect(() => {
    if (!tempUserId || !phone || !countryCode) {
      toast.error('Session expired. Please start signup again.');
      navigate('/signup', { replace: true });
    }
  }, [tempUserId, phone, countryCode, navigate]);

  // Timer effects (unchanged)
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    let interval = null;
    if (blockTimer > 0) {
      interval = setInterval(() => {
        setBlockTimer(timer => {
          if (timer <= 1) {
            setIsBlocked(false);
            setAttempts(0);
            return 0;
          }
          return timer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [blockTimer]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    if (value.length > 1) {
      handlePaste(value);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && value && newOtp.every(digit => digit)) {
      setTimeout(() => handleVerifyOtp(newOtp.join('')), 100);
    }
  };

  const handlePaste = (pastedValue) => {
    const digits = pastedValue.replace(/\D/g, '').slice(0, 6);
    const newOtp = Array(6).fill('').map((_, index) => digits[index] || '');
    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    if (digits.length === 6) {
      setTimeout(() => handleVerifyOtp(digits), 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // UPDATED: Verify OTP with countryCode
  const handleVerifyOtp = async (otpString = null) => {
    const otpValue = otpString || otp.join('');

    if (!otpValue || otpValue.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    if (isBlocked) {
      toast.error(`Too many failed attempts. Please wait ${Math.ceil(blockTimer / 60)} minutes.`);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}api/auth/verify-otp`, {
        tempUserId,
        otp: otpValue,
        phone,
        countryCode  // ADDED: Send countryCode
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000
      });

      if (response.data && response.data.success) {
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        toast.success(`Welcome ${name}! Your account has been verified successfully`);

        setTimeout(() => {
          navigate('/signin', {
            replace: true,
            state: { verified: true, email }
          });
        }, 2000);
      }

    } catch (error) {
      console.error('OTP verification error:', error);

      if (error.response) {
        const { data, status } = error.response;

        if (status === 400) {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);

          if (newAttempts >= 3) {
            setIsBlocked(true);
            setBlockTimer(300);
            toast.error('Too many failed attempts. Please wait 5 minutes before trying again.');
            setOtp(['', '', '', '', '', '']);
          } else {
            const remainingAttempts = 3 - newAttempts;
            setErrors({ otp: data.message || 'Invalid OTP' });
            toast.error(`Invalid OTP. ${remainingAttempts} attempts remaining.`);

            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
          }
        } else if (status === 429) {
          toast.error('Too many requests. Please wait before trying again.');
        } else if (status === 404) {
          toast.error('Session expired. Please start signup again.');
          navigate('/signup', { replace: true });
        } else {
          const errorMsg = data.message || 'Verification failed. Please try again.';
          setErrors({ otp: errorMsg });
          toast.error(errorMsg);
        }
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection and try again.');
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Resend OTP with countryCode
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resendLoading || isBlocked) return;

    setResendLoading(true);

    try {
      const response = await axios.post(`${API_URL}api/auth/resend-otp`, {
        tempUserId,
        phone,
        countryCode  // ADDED: Send countryCode
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000
      });

      if (response.data && response.data.success) {
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
        setAttempts(0);
        inputRefs.current[0]?.focus();
        toast.success('New OTP sent successfully!');
      }

    } catch (error) {
      console.error('Resend OTP error:', error);

      if (error.response?.status === 429) {
        toast.error('Too many resend requests. Please wait before trying again.');
        setResendTimer(120);
      } else if (error.response?.status === 404) {
        toast.error('Session expired. Please start signup again.');
        navigate('/signup', { replace: true });
      } else {
        toast.error('Failed to resend OTP. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToSignup = () => {
    navigate('/signup', { replace: true });
  };

  // UPDATED: Format phone number to show with country code
  const formatPhoneNumber = (phoneNum, countryCodeVal) => {
    if (!phoneNum) return '';

    // If fullPhoneNumber is available, use it
    if (fullPhoneNumber) {
      return fullPhoneNumber;
    }

    // Otherwise construct it
    return `${countryCodeVal || ''} ${phoneNum}`;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${seconds}s`;
  };

  if (!tempUserId || !phone || !countryCode) {
    return null;
  }

  return (
    <div className="otp-wrapper">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="otp-form-logo">
        <img src="/src/assets/logo-title.png" alt="Iyappaa Logo" />
        <span className="otp-form-logo-text">Iyappaa Sweets & Snacks</span>
      </div>

      <div className="otp-container">
        <div className="otp-header">
          <h2 className="otp-title">Verify Your Phone</h2>
          <p className="otp-subtitle">
            We've sent a 6-digit verification code to
          </p>
          <p className="otp-phone-display">
            {formatPhoneNumber(phone, countryCode)}
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="otp-form">
          {errors.otp && (
            <div className="otp-error-container">
              <div className="otp-error-message">{errors.otp}</div>
            </div>
          )}

          {isBlocked && (
            <div className="otp-block-warning">
              Too many failed attempts. Please wait {formatTime(blockTimer)} before trying again.
            </div>
          )}

          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={(e) => {
                  e.preventDefault();
                  handlePaste(e.clipboardData.getData('text'));
                }}
                className={`otp-input ${errors.otp ? 'error' : ''} ${digit ? 'filled' : ''}`}
                disabled={loading || isBlocked}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button
            type="submit"
            className="otp-verify-btn"
            disabled={loading || isBlocked || otp.some(digit => !digit)}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Verifying...
              </>
            ) : 'Verify OTP'}
          </button>
        </form>

        <div className="otp-footer">
          <div className="otp-resend-section">
            <p>Didn't receive the code?</p>
            {resendTimer > 0 ? (
              <span className="otp-resend-timer">
                Resend available in {formatTime(resendTimer)}
              </span>
            ) : (
              <button
                type="button"
                className="otp-resend-btn"
                onClick={handleResendOtp}
                disabled={resendLoading || isBlocked}
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <div className="otp-back-section">
            <button
              type="button"
              className="otp-back-btn"
              onClick={handleBackToSignup}
              disabled={loading}
            >
              ← Back to Signup
            </button>
          </div>
        </div>

        <div className="otp-security-info">
          <p>🔒 This code will expire in 10 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;