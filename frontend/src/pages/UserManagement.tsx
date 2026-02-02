import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminDashboard.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  scans: number;
  lastActive: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [customPopup, setCustomPopup] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null,
  });
  
  useEffect(() => {
    // First check if user is authenticated and is admin
    const userData = localStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : null;
    
    if (!userObj || userObj.role !== 'admin') {
      console.log('User not admin or not authenticated, redirecting');
      toast.error('Admin access required');
      navigate('/app/dashboard');
      return;
    }
    
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found in localStorage');
        setError('Authentication required');
        toast.error('Authentication required');
        navigate('/login');
        return;
      }

      try {
        console.log('Fetching users with token:', token.substring(0, 10) + '...');
        
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('API Response:', response.data);
        
        if (response.data && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
          console.log('Users set in state:', response.data.users);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Invalid data format received from server');
          toast.error('Invalid data format received from server');
        }
      } catch (error: any) {
        console.error('Error fetching users:', error);
        
        let errorMessage = 'Failed to load users';
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          
          if (error.response.status === 401) {
            errorMessage = 'Authentication required';
            // Don't navigate away or logout - just show the error
            toast.error(errorMessage);
          } else if (error.response.status === 403) {
            errorMessage = 'Admin access required';
            // Don't navigate away - just show the error
            toast.error(errorMessage);
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
            toast.error(errorMessage);
          }
        } else if (error.request) {
          console.error('Error request:', error.request);
          errorMessage = 'No response from server. Please check if the backend is running.';
          toast.error(errorMessage);
        } else {
          console.error('Error message:', error.message);
          errorMessage = error.message;
          toast.error(errorMessage);
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    const token = localStorage.getItem('token');
    
    // Function to show custom popup
    const showCustomPopup = (message: string, type: 'success' | 'error') => {
      setCustomPopup({ message, type });
      setTimeout(() => {
        setCustomPopup({ message: '', type: null });
      }, 3000); // Hide after 3 seconds
    };
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('User deleted successfully');
      // Remove user from state
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Failed to delete user';
        
        // Check for the specific admin deletion error message
        if (errorMessage === 'You cannot delete an admin account.') {
          showCustomPopup('Action failed, you\'re trying to delete an admin account', 'error');
        } else if (errorMessage === 'You cannot delete another administrator') {
          showCustomPopup('Action failed, you cannot delete another administrator', 'error');
        } else {
          // For other errors, show a generic toast or a custom error popup
          toast.error(errorMessage);
        }
      } else {
        toast.error('Failed to delete user');
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>User Management</h1>
        <p className="subtitle">Manage user accounts and permissions</p>
      </div>

      <div className="panel-header">
        <div className="panel-actions">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table">
        <div className="table-header">
          <div className="header-cell">Name</div>
          <div className="header-cell">Email</div>
          <div className="header-cell">Role</div>
          <div className="header-cell">Scans</div>
          <div className="header-cell">Last Active</div>
          <div className="header-cell">Actions</div>
        </div>
        <div className="table-body">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="no-data">No users found</div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="table-row">
                <div className="cell">{user.name || 'N/A'}</div>
                <div className="cell">{user.email || 'N/A'}</div>
                <div className="cell">
                  <span className={`role-badge ${user.role || 'user'}`}>{user.role || 'user'}</span>
                </div>
                <div className="cell">{user.scans || 0}</div>
                <div className="cell">{user.lastActive || 'Never'}</div>
                <div className="cell actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => navigate(`/app/edit-user/${user.id}`)}
                  >
                    Edit
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {customPopup.type && (
        <div className={`custom-popup custom-popup-${customPopup.type}`}>
          {customPopup.message}
        </div>
      )}
    </div>
  );
};

export default UserManagement;



