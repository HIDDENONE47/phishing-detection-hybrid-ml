import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminDashboard.css';

const EditUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/app/dashboard');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const { name, email, role } = response.data.user;
        setFormData({ name, email, role });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to load user data');
        navigate('/app/user-management');
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('User updated successfully');
      navigate('/app/user-management');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  if (loading) {
    return <div className="loading">Loading user data...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Edit User</h1>
        <p className="subtitle">Update user information</p>
      </div>

      <div className="edit-user-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate('/app/user-management')}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;

