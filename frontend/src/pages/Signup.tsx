import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Login.css';
import api, { authService } from '../services/api';
import axios from 'axios';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  // const [showAdminKeyField, setShowAdminKeyField] = useState(false); // State to control admin key field visibility

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting to register with:', {
        name: formData.name,
        email: formData.email,
        password: '********', // Don't log actual password
        role: formData.role,
        adminKey: formData.role === 'admin' ? '********' : undefined // Don't log actual admin key
      });
      
      // Use the appropriate registration endpoint based on role
      if (formData.role === 'admin') {
        try {
          console.log('Trying admin registration...');
          // Use the dedicated admin endpoint
          const response = await axios.post('http://localhost:5000/api/auth/register-admin', {
            name: formData.name,
            email: formData.email,
            password: formData.password
          }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
          });
          
          console.log('Admin registration successful:', response.data);
          handleSuccess(response.data);
        } catch (adminError) {
          console.error('Admin registration failed:', adminError);
          throw adminError;
        }
      } else {
        // Regular user registration
        try {
          console.log('Trying direct axios call for user registration...');
          const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'user' // Explicitly set role to user
          }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
          });
          
          console.log('Registration successful:', response.data);
          handleSuccess(response.data);
        } catch (axiosError) {
          console.error('Axios direct call failed:', axiosError);
          
          // Approach 2: Try with fetch API as fallback
          console.log('Trying fetch API...');
          try {
            const fetchResponse = await fetch('http://localhost:5000/api/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'user' // Explicitly set role to user
              })
            });
            
            if (!fetchResponse.ok) {
              const errorData = await fetchResponse.json();
              throw new Error(errorData.message || `HTTP error! Status: ${fetchResponse.status}`);
            }
            
            const data = await fetchResponse.json();
            console.log('Fetch registration successful:', data);
            handleSuccess(data);
          } catch (fetchError) {
            console.error('Fetch API failed:', fetchError);
            throw fetchError; // Re-throw to be caught by the outer catch
          }
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Determine the most appropriate error message
      let errorMessage = 'Registration failed';
      
      if (err.message === 'Failed to fetch' || err.code === 'ECONNABORTED' || err.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuccess = (data: any) => {
    const roleMessage = data.user.role === 'admin' 
      ? 'Admin account created successfully! Redirecting to login...' 
      : 'Account created successfully! Redirecting to login...';
    
    toast.success(roleMessage, {
      position: "top-center",
      autoClose: 2000,
    });

    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle role selection and show/hide admin key field
  const handleRoleChange = (role: 'user' | 'admin') => {
    setFormData(prev => ({ ...prev, role }));
    // setShowAdminKeyField(role === 'admin');
  };

  return (
    <div className="login-page">
      <ToastContainer />
      <div className="login-container">
        <div className="login-header">
          <div className="logo">🛡️</div>
          <h1>Create Account</h1>
          <p className="subtitle">Join us to secure your digital world</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Account Type Selection */}
          <div className="form-group">
            <label htmlFor="role">Account Type</label>
            <div className="role-buttons">
              <button
                type="button"
                className={`role-button ${formData.role === 'user' ? 'active' : ''}`}
                onClick={() => handleRoleChange('user')}
              >
                <span className="role-icon">👤</span>
                <span>User</span>
              </button>
              <button
                type="button"
                className={`role-button ${formData.role === 'admin' ? 'active' : ''}`}
                onClick={() => handleRoleChange('admin')}
              >
                <span className="role-icon">👑</span>
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Admin Key Field - Only shown when admin role is selected */}
          {/* {showAdminKeyField && (
            <div className="form-group">
              <label htmlFor="adminKey">Admin Registration Key</label>
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  type="password"
                  id="adminKey"
                  name="adminKey"
                  value={formData.adminKey}
                  onChange={handleChange}
                  placeholder="Enter admin registration key"
                  required
                />
              </div>
              <small className="helper-text">Required for admin registration. Contact system administrator for the key.</small>
            </div>
          )} */}

          <button type="submit" className={`login-button ${isLoading ? 'loading' : ''}`}>
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="signup-prompt">
            Already have an account?{' '}
            <Link to="/login" className="signup-link">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
