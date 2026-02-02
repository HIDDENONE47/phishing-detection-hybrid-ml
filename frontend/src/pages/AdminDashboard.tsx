import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/AdminDashboard.css';

// Define User interface matching backend structure (assuming populated in some cases)
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  scans?: number; // Optional in some contexts
  lastActive?: string; // Optional
}

// Define FeedbackItem interface matching backend populated structure
interface FeedbackItem {
  _id: string;
  user: { // Populated user field structure
    _id: string;
    name: string;
    email: string;
  };
  feedback: string;
  createdAt: string; // ISO string from backend
  status: 'open' | 'replied' | 'closed';
  adminReply?: string;
  repliedAt?: string; // ISO string from backend
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScans: 0,
    phishingDetected: 0,
    safeScans: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [recentScans, setRecentScans] = useState<any[]>([]); // Keep as any for now if structure is varied
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState({
    stats: true,
    users: true,
    scans: true,
    feedback: true,
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        setLoading({ stats: false, users: false, scans: false, feedback: false });
        return;
      }

      try {
        // Fetch statistics (assuming this route exists and works)
        // const statsResponse = await axios.get('http://localhost:5000/api/admin/stats', {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        // setStats(statsResponse.data);
        setLoading(prev => ({ ...prev, stats: false })); // Keep loading false for now if route is commented

        // Fetch users
        const usersResponse = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Map backend user data to frontend User interface
        setUsers(usersResponse.data.users);
        setLoading(prev => ({ ...prev, users: false }));

        // Fetch recent scans (assuming this route exists and works)
        // const scansResponse = await axios.get('http://localhost:5000/api/admin/recent-scans', {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        // setRecentScans(scansResponse.data.scans);
        setLoading(prev => ({ ...prev, scans: false })); // Keep loading false for now if route is commented

        // Fetch feedback
        const feedbackResponse = await axios.get('http://localhost:5000/api/feedback', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Assuming feedbackResponse.data.feedback is an array of objects matching FeedbackItem structure
        setFeedbackList(feedbackResponse.data.feedback);
        setLoading(prev => ({ ...prev, feedback: false }));

      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load admin data');
        setLoading({
          stats: false,
          users: false,
          scans: false,
          feedback: false,
        });
      }
    };

    fetchAdminData();
  }, []);

  // Dummy data for demonstration
  // Ensure dummy data conforms to the defined interfaces
  const dummyStats = {
    totalUsers: 42,
    totalScans: 256,
    phishingDetected: 37,
    safeScans: 219,
  };

  const dummyUsers: User[] = [
    { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', scans: 15, lastActive: '2024-03-15' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', scans: 8, lastActive: '2024-03-14' },
    { _id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin', scans: 23, lastActive: '2024-03-16' },
  ];

  const dummyScans = [
    { id: 1, userId: 1, userName: 'John Doe', type: 'URL', target: 'https://example.com', result: 'Safe', date: '2024-03-15' },
    { id: 2, userId: 2, userName: 'Jane Smith', type: 'Email', target: 'suspicious@phish.com', result: 'Phishing', date: '2024-03-14' },
    { id: 3, userId: 1, userName: 'John Doe', type: 'URL', target: 'https://secure-bank.com', result: 'Safe', date: '2024-03-14' },
  ];

  const dummyFeedback: FeedbackItem[] = [
    { _id: '1', user: { _id: 'user1', name: 'User One', email: 'user1@example.com' }, feedback: 'This is a test feedback.', createdAt: new Date().toISOString(), status: 'open' },
    { _id: '2', user: { _id: 'user2', name: 'User Two', email: 'user2@example.com' }, feedback: 'Another feedback message.', createdAt: new Date().toISOString(), status: 'replied', adminReply: 'Thank you for your feedback.', repliedAt: new Date().toISOString() },
  ];

  // Use dummy data if API data is loading
  const displayStats = loading.stats ? dummyStats : stats;
  const displayUsers = loading.users ? dummyUsers : users;
  const displayScans = loading.scans ? dummyScans : recentScans;
  const displayFeedbackList = loading.feedback ? dummyFeedback : feedbackList; // Use dummy feedback if loading

  // Handler functions for feedback actions
  const handleViewFeedback = (feedbackItem: FeedbackItem) => {
    // Implement view logic here (e.g., show in a modal)
    alert(`Feedback from ${feedbackItem.user.name}:\n\n${feedbackItem.feedback}\n\nStatus: ${feedbackItem.status}${feedbackItem.adminReply ? '\n\nAdmin Reply: ' + feedbackItem.adminReply : ''}`);
    console.log('Viewing Feedback:', feedbackItem);
  };

  const handleReplyFeedback = async (feedbackItem: FeedbackItem) => {
    // Implement reply logic here (e.g., show a modal with a form)
    const adminReply = prompt('Enter your reply for feedback from ' + feedbackItem.user.name + ':');
    
    if (adminReply === null || !adminReply.trim()) {
      toast.info('Reply cancelled or empty.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required to reply.');
      return;
    }

    try {
      // Call backend API to add admin reply
      const response = await axios.put(`http://localhost:5000/api/feedback/${feedbackItem._id}/reply`, 
        { adminReply },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        toast.success('Reply sent successfully!');
        // Update the feedback item in the state to reflect the reply
        setFeedbackList(feedbackList.map(item => 
          item._id === feedbackItem._id ? { ...item, status: 'replied', adminReply: adminReply, repliedAt: new Date().toISOString() } : item
        ));
      } else {
        toast.error(response.data.message || 'Failed to send reply.');
      }
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast.error(error.response?.data?.message || 'Server error occurred while sending reply.');
    }
  };

  const handleCloseFeedback = async (feedbackItem: FeedbackItem) => {
     if (!window.confirm('Are you sure you want to close this feedback?')) {
       return;
     }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required to close feedback.');
      return;
    }

    try {
      // Call backend API to close feedback
      const response = await axios.put(`http://localhost:5000/api/feedback/${feedbackItem._id}/close`, 
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success('Feedback closed successfully!');
        // Update the feedback item in the state to reflect the closed status
         setFeedbackList(feedbackList.map(item => 
          item._id === feedbackItem._id ? { ...item, status: 'closed' } : item
        ));
      } else {
        toast.error(response.data.message || 'Failed to close feedback.');
      }
    } catch (error: any) {
      console.error('Error closing feedback:', error);
      toast.error(error.response?.data?.message || 'Server error occurred while closing feedback.');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">Manage users, view statistics, and monitor system activity</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button 
          className={activeTab === 'scans' ? 'active' : ''} 
          onClick={() => setActiveTab('scans')}
        >
          Scan Reports
        </button>
        <button 
          className={activeTab === 'feedback' ? 'active' : ''} 
          onClick={() => setActiveTab('feedback')}
        >
          Feedback
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''} 
          onClick={() => setActiveTab('settings')}
        >
          System Settings
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="admin-overview">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users">👥</div>
              <div className="stat-info">
                <h3>Total Users</h3>
                <p className="stat-value">{displayStats.totalUsers}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon scans">🔍</div>
              <div className="stat-info">
                <h3>Total Scans</h3>
                <p className="stat-value">{displayStats.totalScans}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon phishing">⚠️</div>
              <div className="stat-info">
                <h3>Phishing Detected</h3>
                <p className="stat-value">{displayStats.phishingDetected}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon safe">✅</div>
              <div className="stat-info">
                <h3>Safe Scans</h3>
                <p className="stat-value">{displayStats.safeScans}</p>
              </div>
            </div>
          </div>

          <div className="admin-panels">
            <div className="recent-users panel">
              <h2>Recent Users</h2>
              <div className="user-list">
                {loading.users ? (
                  <div className="loading">Loading users...</div>
                ) : displayUsers.length === 0 ? (
                  <div className="no-data">No users found</div>
                ) : (
                  displayUsers.slice(0, 5).map((user) => (
                    <div key={user._id} className="user-item">
                      <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                      <div className="user-meta">
                        <span className={`user-role ${user.role}`}>{user.role}</span>
                        <span className="user-date">{user.lastActive || 'Never'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button className="view-all" onClick={() => setActiveTab('users')}>
                View All Users
              </button>
            </div>

            <div className="recent-scans panel">
              <h2>Recent Scans</h2>
              <div className="scan-list">
                {loading.scans ? (
                  <div className="loading">Loading scans...</div>
                ) : displayScans.length === 0 ? (
                  <div className="no-data">No scans found</div>
                ) : (
                  displayScans.slice(0, 5).map((scan) => (
                    <div key={scan.id} className="scan-item">
                      <div className="scan-info">
                        <span className={`scan-type ${scan.type.toLowerCase()}`}>
                          {scan.type}
                        </span>
                        <span className="scan-target">{scan.target}</span>
                      </div>
                      <div className="scan-meta">
                        <span className={`scan-result ${scan.result.toLowerCase()}`}>
                          {scan.result}
                        </span>
                        <span className="scan-date">{scan.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button className="view-all" onClick={() => setActiveTab('scans')}>
                View All Scans
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-management">
          <div className="panel-header">
            <h2>User Management</h2>
            <div className="panel-actions">
              <input type="text" placeholder="Search users..." className="search-input" />
              {/* Add User button? */}
              {/* <button className="add-user-btn">Add New User</button> */}
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
              {loading.users ? (
                <div className="loading">Loading users...</div>
              ) : displayUsers.length === 0 ? (
                <div className="no-data">No users found</div>
              ) : (
                displayUsers.map((user) => (
                  <div key={user._id} className="table-row">
                    <div className="cell">{user.name}</div>
                    <div className="cell">{user.email}</div>
                    <div className="cell">
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                    </div>
                    <div className="cell">{user.scans || 0}</div>
                    <div className="cell">{user.lastActive || 'Never'}</div>
                    <div className="cell actions">
                      {/* Add actions like Edit/Delete here if needed */}
                      {/* <button className="action-btn edit">Edit</button>
                      <button className="action-btn delete">Delete</button> */}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scans' && (
        <div className="scans-management">
          <div className="panel-header">
            <h2>Scan Reports</h2>
            <div className="panel-actions">
              <select className="filter-select">
                <option value="all">All Scans</option>
                <option value="url">URL Scans</option>
                <option value="email">Email Scans</option>
              </select>
              <button className="export-btn">Export Data</button>
            </div>
          </div>

          <div className="scans-table">
            <div className="table-header">
              <div className="header-cell">User</div>
              <div className="header-cell">Type</div>
              <div className="header-cell">Target</div>
              <div className="header-cell">Result</div>
              <div className="header-cell">Date</div>
              <div className="header-cell">Actions</div>
            </div>
            <div className="table-body">
              {loading.scans ? (
                <div className="loading">Loading scans...</div>
              ) : displayScans.length === 0 ? (
                <div className="no-data">No scans found</div>
              ) : (
                displayScans.map((scan) => (
                  <div key={scan.id} className="table-row">
                    <div className="cell">{scan.userName}</div>
                    <div className="cell">
                      <span className={`type-badge ${scan.type.toLowerCase()}`}>
                        {scan.type}
                      </span>
                    </div>
                    <div className="cell target">{scan.target}</div>
                    <div className="cell">
                      <span className={`result-badge ${scan.result.toLowerCase()}`}>
                        {scan.result}
                      </span>
                    </div>
                    <div className="cell">{scan.date}</div>
                    <div className="cell actions">
                      {/* Add actions here if needed */}
                      {/* <button className="action-btn view">View</button>
                      <button className="action-btn delete">Delete</button> */}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="feedback-management">
          <div className="panel-header">
            <h2>Feedback Management</h2>
            <div className="panel-actions">
              {/* Add search or filter for feedback if needed */}
              <input type="text" placeholder="Search feedback..." className="search-input" />
              {/* Maybe an add feedback button here for admin to submit feedback on behalf of a user? */}
              {/* <button className="add-feedback-btn">Add New Feedback</button> */}
            </div>
          </div>

          <div className="feedback-table">
            <div className="table-header">
              <div className="header-cell">User</div>
              <div className="header-cell">Feedback</div>
              <div className="header-cell">Date</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Actions</div>
            </div>
            <div className="table-body">
              {loading.feedback ? (
                <div className="loading">Loading feedback...</div>
              ) : displayFeedbackList.length === 0 ? (
                <div className="no-data">No feedback submitted yet.</div>
              ) : (
                displayFeedbackList.map((feedback) => (
                  <div key={feedback._id} className="table-row">
                    <div className="cell">{feedback.user?.name || 'N/A'}</div>
                    <div className="cell">{feedback.feedback}</div>
                    <div className="cell">{new Date(feedback.createdAt).toLocaleDateString()}</div>
                    <div className="cell">{feedback.status}</div>
                    <div className="cell actions">
                      {/* Action buttons for View, Reply, Close */}
                      <button className="action-btn view" onClick={() => handleViewFeedback(feedback)}>View</button>
                      {feedback.status !== 'closed' && (
                         <button className="action-btn reply" onClick={() => handleReplyFeedback(feedback)}>Reply</button>
                      )}
                       {feedback.status !== 'closed' && (
                        <button className="action-btn close" onClick={() => handleCloseFeedback(feedback)}>Close</button>
                       )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="system-settings">
          <div className="panel-header">
            <h2>System Settings</h2>
          </div>

          <div className="settings-grid">
            <div className="settings-card">
              <h3>Security Settings</h3>
              <div className="settings-form">
                <div className="form-group">
                  <label>Minimum Password Length</label>
                  <input type="number" defaultValue={8} min={6} max={16} />
                </div>
                <div className="form-group">
                  <label>Session Timeout (minutes)</label>
                  <input type="number" defaultValue={30} min={5} max={120} />
                </div>
                <div className="form-group checkbox">
                  <input type="checkbox" id="force2fa" defaultChecked />
                  <label htmlFor="force2fa">Force 2FA for Admins</label>
                </div>
              </div>
              <button className="save-btn">Save Changes</button>
            </div>

            <div className="settings-card">
              <h3>Scan Settings</h3>
              <div className="settings-form">
                <div className="form-group">
                  <label>URL Scan Timeout (seconds)</label>
                  <input type="number" defaultValue={10} min={5} max={30} />
                </div>
                <div className="form-group">
                  <label>Email Scan Sensitivity</label>
                  <select defaultValue="medium">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group checkbox">
                  <input type="checkbox" id="autoUpdate" defaultChecked />
                  <label htmlFor="autoUpdate">Auto-update Detection Rules</label>
                </div>
              </div>
              <button className="save-btn">Save Changes</button>
            </div>

            <div className="settings-card">
              <h3>Notification Settings</h3>
              <div className="settings-form">
                <div className="form-group checkbox">
                  <input type="checkbox" id="emailNotif" defaultChecked />
                  <label htmlFor="emailNotif">Email Notifications</label>
                </div>
                <div className="form-group checkbox">
                  <input type="checkbox" id="securityAlerts" defaultChecked />
                  <label htmlFor="securityAlerts">Security Alerts</label>
                </div>
                <div className="form-group checkbox">
                  <input type="checkbox" id="weeklyReports" defaultChecked />
                  <label htmlFor="weeklyReports">Weekly Reports</label>
                </div>
              </div>
              <button className="save-btn">Save Changes</button>
            </div>

            <div className="settings-card danger-zone">
              <h3>Danger Zone</h3>
              <div className="danger-actions">
                <div className="danger-action">
                  <div>
                    <h4>Reset All Settings</h4>
                    <p>This will reset all settings to their default values.</p>
                  </div>
                  <button className="danger-btn">Reset</button>
                </div>
                <div className="danger-action">
                  <div>
                    <h4>Clear All Scan Data</h4>
                    <p>This will permanently delete all scan data.</p>
                  </div>
                  <button className="danger-btn">Clear</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 
