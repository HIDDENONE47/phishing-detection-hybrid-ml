import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Login.css';
import axios, { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use login instead of setAuthState
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting to login with:', {
        email: formData.email,
        password: '********', // Don't log actual password
      });
      
      // Try multiple approaches to identify the issue
      
      // Approach 1: Use axios directly with full URL
      try {
        console.log('Trying direct axios call for login...');
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
        
        console.log('Login successful:', response.data);
        
        // Use login function to update auth context
        login(response.data.token, response.data.user);
        
        // Show success message based on user role
        const roleMessage = response.data.user.role === 'admin'
          ? 'Logged in as Admin! Redirecting...'
          : 'Login successful! Redirecting...';
        
        toast.success(roleMessage, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Wait for the toast to be visible before redirecting
        setTimeout(() => {
          // Redirect admin to admin dashboard, regular users to user dashboard
          const redirectPath = response.data.user.role === 'admin' 
            ? '/app/admin-dashboard' 
            : '/app/dashboard';
          navigate(redirectPath);
        }, 2000);
      } catch (axiosError) {
        console.error('Axios direct call failed:', axiosError);
        
        // Approach 2: Try with fetch API as fallback
        console.log('Trying fetch API for login...');
        try {
          const fetchResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password
            })
          });
          
          if (!fetchResponse.ok) {
            const errorData = await fetchResponse.json();
            throw new Error(errorData.message || `HTTP error! Status: ${fetchResponse.status}`);
          }
          
          const data = await fetchResponse.json();
          console.log('Fetch login successful:', data);

          // Use login function to update auth context
          login(data.token, data.user);

          // Show success message based on user role
          const roleMessage = data.user.role === 'admin'
            ? 'Logged in as Admin! Redirecting...'
            : 'Login successful! Redirecting...';
          
          toast.success(roleMessage, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });

          // Wait for the toast to be visible before redirecting
          setTimeout(() => {
            // Redirect admin to admin dashboard, regular users to user dashboard
            const redirectPath = data.user.role === 'admin' 
              ? '/app/admin-dashboard' 
              : '/app/dashboard';
            navigate(redirectPath);
          }, 2000);
        } catch (fetchError) {
          console.error('Fetch API failed:', fetchError);
          throw fetchError; // Re-throw to be caught by the outer catch
        }
      }
    } catch (err: unknown) {
      console.error('Login error details:', err);
      
      // Determine the most appropriate error message
      let errorMessage = 'Login failed';
      
      if (err instanceof Error) {
        if (err.message === 'Failed to fetch' || err.message?.includes('Network Error')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          errorMessage = err.message;
        }
      }
      
      // If we have a response with error data (for Axios errors)
      const axiosError = err as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="login-page">
      <ToastContainer />
      <div className="login-container">
        <div className="login-header">
          <div className="logo">🛡️</div>
          <h1>Welcome Back</h1>
          <p className="subtitle">Secure your digital world with us</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
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
            <div className="password-label">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button type="submit" className={`login-button ${isLoading ? 'loading' : ''}`}>
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            <button type="button" className="social-button google">
              <img src="/google-icon.svg" alt="Google" />
              Google
            </button>
            <button type="button" className="social-button github">
              <img src="/github-icon.svg" alt="GitHub" />
              GitHub
            </button>
          </div>
        </form>

        <p className="signup-prompt">
          Don't have an account?{' '}
          <Link to="/signup" className="signup-link">
            Sign up
          </Link>
        </p>

        <div className="login-footer">
          <Link to="/" className="back-home-link">
            <i className="fas fa-arrow-left"></i> Go Back to Home
          </Link>
        </div>
      </div>

      <div className="login-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default Login; 





