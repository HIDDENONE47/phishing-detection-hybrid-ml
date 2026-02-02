import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Explicitly check if user has admin role
  const isAdmin = user && user.role === 'admin';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!', {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    navigate('/login');
  };

  const handleProtectedRouteClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please login to continue', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate('/login');
    } else if (path.includes('admin') && !isAdmin) {
      toast.error('Admin access required', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate('/app/dashboard');
    } else {
      navigate(path);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          {isAdmin ? (
            <>🛡️ Phishing Detection <span className="admin-badge">ADMIN</span></>
          ) : (
            <>🛡️ Phishing Detection</>
          )}
        </Link>
      </div>
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            {isAdmin ? (
              // Admin Navigation Links
              <>
                <a href="#" onClick={(e) => handleProtectedRouteClick(e, '/app/admin-dashboard')}>Dashboard</a>
                <a href="#" onClick={(e) => handleProtectedRouteClick(e, '/app/user-management')}>Users</a>
                <a href="#" onClick={(e) => handleProtectedRouteClick(e, '/app/scan-reports')}>Reports</a>
              </>
            ) : (
              // Regular User Navigation Links
              <>
                <a href="#" onClick={(e) => handleProtectedRouteClick(e, '/app/url-scan')}>URL Scan</a>
                <a href="#" onClick={(e) => handleProtectedRouteClick(e, '/app/email-scan')}>Email Scan</a>
                <a href="#" onClick={(e) => handleProtectedRouteClick(e, '/app/dashboard')}>Dashboard</a>
              </>
            )}
            <div className="user-dropdown">
              <button className="user-dropdown-btn" onClick={toggleDropdown}>
                <i className="fas fa-user-circle"></i>
                <span>{user?.name || 'User'}</span>
                <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'}`}></i>
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span className="user-name">{user?.name || 'User'}</span>
                    <span className="user-email">{user?.email || 'user@example.com'}</span>
                    <span className={`user-role ${isAdmin ? 'admin' : 'user'}`}>
                      {isAdmin ? 'Administrator' : 'User'}
                    </span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    navigate(isAdmin ? '/app/admin-settings' : '/app/settings');
                  }}>
                    <i className="fas fa-cog"></i> Settings
                  </a>
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    handleLogout();
                  }}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </a>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/signup" className="signup-btn">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 

