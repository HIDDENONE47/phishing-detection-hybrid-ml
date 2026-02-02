import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Explicitly check if user has admin role
  const isAdmin = user && user.role === 'admin';

  const handleProtectedRouteClick = (path: string) => {
    if (!isAuthenticated) {
      toast.info('Please login to continue');
      navigate('/login');
      return;
    }
    
    // If trying to access admin routes but not admin
    if (path.includes('admin') && !isAdmin) {
      toast.error('Admin access required');
      navigate('/app/dashboard');
      return;
    }
    
    navigate(path);
  };

  // If user data is not loaded yet, show minimal sidebar
  if (!user) {
    return (
      <div className="sidebar">
        <div className="sidebar-menu">
          <div className="loading-sidebar">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-menu">
        {isAdmin ? (
          // Admin Sidebar Menu
          <>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleProtectedRouteClick('/app/admin-dashboard');
              }}
              className={location.pathname === '/app/admin-dashboard' ? 'active' : ''}
            >
              <i className="fas fa-tachometer-alt"></i>
              <span>Admin Dashboard</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleProtectedRouteClick('/app/user-management');
              }}
              className={location.pathname === '/app/user-management' ? 'active' : ''}
            >
              <i className="fas fa-users"></i>
              <span>User Management</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleProtectedRouteClick('/app/url-scan');
              }}
              className={location.pathname === '/app/url-scan' ? 'active' : ''}
            >
              <i className="fas fa-link"></i>
              <span>URL Scan</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleProtectedRouteClick('/app/email-scan');
              }}
              className={location.pathname === '/app/email-scan' ? 'active' : ''}
            >
              <i className="fas fa-envelope"></i>
              <span>Email Scan</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleProtectedRouteClick('/app/reports');
              }}
              className={location.pathname === '/app/reports' ? 'active' : ''}
            >
              <i className="fas fa-chart-bar"></i>
              <span>Reports</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleProtectedRouteClick('/app/settings');
              }}
              className={location.pathname === '/app/settings' ? 'active' : ''}
            >
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </a>
          </>
        ) : (
          // Regular User Sidebar Menu
          <>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleProtectedRouteClick('/app/dashboard');
              }}
              className={location.pathname === '/app/dashboard' ? 'active' : ''}
            >
              <i className="fas fa-chart-line"></i>
              <span>Dashboard</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleProtectedRouteClick('/app/url-scan');
              }}
              className={location.pathname === '/app/url-scan' ? 'active' : ''}
            >
              <i className="fas fa-link"></i>
              <span>URL Scan</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleProtectedRouteClick('/app/email-scan');
              }}
              className={location.pathname === '/app/email-scan' ? 'active' : ''}
            >
              <i className="fas fa-envelope"></i>
              <span>Email Scan</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleProtectedRouteClick('/app/reports');
              }}
              className={location.pathname === '/app/reports' ? 'active' : ''}
            >
              <i className="fas fa-file-alt"></i>
              <span>Reports</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleProtectedRouteClick('/app/settings');
              }}
              className={location.pathname === '/app/settings' ? 'active' : ''}
            >
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 


