import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/logo-title.png';

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL;

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo('Starting login process...');

    try {
      setDebugInfo('Sending request to backend...');
      
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      setDebugInfo(`Response received. Status: ${response.status}`);

      const result = await response.json();
      setDebugInfo(`Response data: ${JSON.stringify(result, null, 2)}`);

      // Log everything for debugging
      // console.log('=== LOGIN DEBUG INFO ===');
      // console.log('Response Status:', response.status);
      // console.log('Response Data:', result);
      // console.log('Success:', result.success);
      // console.log('Has data:', !!result.data);
      // console.log('Has admin:', !!result.data?.admin);
      // console.log('Admin role:', result.data?.admin?.role);
      // console.log('Token:', result.data?.token);
      // console.log('========================');

      if (response.ok && result.success) {
        if (result.data && result.data.admin) {
          if (result.data.admin.role === 'admin') {
            setDebugInfo('Login successful! Storing token and redirecting...');
            localStorage.setItem('adminToken', result.data.token);
            localStorage.setItem('adminInfo', JSON.stringify(result.data.admin));
            
            // Small delay to see the success message
            setTimeout(() => {
              navigate('/admin/dashboard');
            }, 1000);
          } else {
            setError(`Access denied. User role is '${result.data.admin.role}' but 'admin' required.`);
            setDebugInfo(`Role check failed. Expected: 'admin', Got: '${result.data.admin.role}'`);
          }
        } else {
          setError('Invalid response structure from server');
          setDebugInfo('Response missing admin data');
        }
      } else {
        setError(result.message || `Server error: ${response.status}`);
        setDebugInfo(`Request failed: ${result.message || response.status}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection.');
      setDebugInfo(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
      <div className="admin-form-logo">
        <img style={{ width:'auto', height: '120px' , objectFit: 'contain'}} src={logoImage} alt="Iyappaa Logo" />
        <p style={{fontSize:'16px', color: '#6b7280' , marginBottom: '10px'}}>
            Iyappaa Sweets & Snacks
          </p>
      </div>
      <div style={{ maxWidth: '500px', width: '100%', padding: '32px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>Admin Login</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Sign in to access admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px', 
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
              placeholder="user@company.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px', 
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
              placeholder="********"
            />
          </div>

          {error && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fee2e2', 
              color: '#dc2626', 
              borderRadius: '8px', 
              fontSize: '14px', 
              marginBottom: '20px',
              border: '1px solid #fecaca'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* {debugInfo && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#f0f9ff', 
              color: '#0369a1', 
              borderRadius: '8px', 
              fontSize: '12px', 
              marginBottom: '20px',
              border: '1px solid #bae6fd',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              <strong>Debug:</strong> {debugInfo}
            </div>
          )} */}

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              backgroundColor: loading ? '#9ca3af' : '#22c55e', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '16px', 
              fontWeight: '500', 
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Test Credentials:</h3>
          <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
            <div>Email: admin@iyappasweets.com</div>
            <div>Password: admin123</div>
          </div>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px', fontSize: '12px', color: '#6b7280' }}>
          <strong>API Endpoint:</strong> {API_BASE_URL}/admin/login
        </div> */}
      </div>
      {/* Footer */}
        <div style={{marginTop: '24px' , textAlign: 'center'}}>
          <p style={{fontSize: '13px' , color:'#6b7280' , margin: '0'}}>© 2025 Iyappaa Sweets & Snacks. All rights reserved.</p>
        </div>
    </div>
  );
};

export default AdminLogin;