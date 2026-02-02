import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import URLScan from './pages/URLScan';
import EmailScan from './pages/EmailScan';
import AboutPage from './pages/AboutPage';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import EditUser from './pages/EditUser';
import UserManagement from './pages/UserManagement';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if token exists in localStorage as a backup
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!isAuthenticated && (!token || !userData)) {
      console.log('PrivateRoute: User not authenticated, redirecting to login');
      toast.info('Please login to continue', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate('/login', { replace: true });
    } else {
      console.log('PrivateRoute: User is authenticated, allowing access');
    }
  }, [isAuthenticated, navigate]);
  
  // If authenticated or has token, render children
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  if (isAuthenticated || (token && userData)) {
    return <>{children}</>;
  }
  
  // Otherwise, render nothing while redirecting
  return null;
};

// Add a new AdminRoute component for admin-only routes
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    const checkAdminAccess = async () => {
      // Check if user is authenticated and has admin role
      const userData = localStorage.getItem('user');
      const userObj = userData ? JSON.parse(userData) : null;
      const token = localStorage.getItem('token');
      
      if (!token || !userObj) {
        console.log('AdminRoute: No token or user data found');
        toast.error('Authentication required');
        navigate('/login', { replace: true });
        return;
      }
      
      if (userObj.role !== 'admin') {
        console.log('AdminRoute: User not admin, role:', userObj.role);
        toast.error('Admin access required');
        navigate('/app/dashboard', { replace: true });
        return;
      }
      
      // If we get here, user is authenticated as admin
      console.log('AdminRoute: User is authenticated as admin');
      setChecking(false);
    };
    
    checkAdminAccess();
  }, [isAuthenticated, navigate, user]);
  
  if (checking) {
    return <div>Checking admin access...</div>;
  }
  
  // If we get here, user is admin
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/app/*"
            element={
              <div className="app">
                <Navbar />
                <div className="main-content">
                  <Sidebar />
                  <div className="content">
                    <Routes>
                      <Route
                        path="admin-dashboard"
                        element={
                          <AdminRoute>
                            <AdminDashboard />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="user-management"
                        element={
                          <AdminRoute>
                            <UserManagement />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="edit-user/:userId"
                        element={
                          <AdminRoute>
                            <EditUser />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="dashboard"
                        element={
                          <PrivateRoute>
                            <UserDashboard />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="url-scan"
                        element={
                          <PrivateRoute>
                            <URLScan />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="email-scan"
                        element={
                          <PrivateRoute>
                            <EmailScan />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="reports"
                        element={
                          <PrivateRoute>
                            <Reports />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="settings"
                        element={
                          <PrivateRoute>
                            <Settings />
                          </PrivateRoute>
                        }
                      />
                      <Route path="*" element={<Navigate to="/app/dashboard" />} />
                    </Routes>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;













