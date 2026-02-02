import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const UserDashboard: React.FC = () => {
  // Dummy data for demonstration
  const stats = [
    { title: 'Total Scans', value: '156', icon: '🔍', color: '#4F46E5' },
    { title: 'Phishing Detected', value: '23', icon: '⚠️', color: '#EF4444' },
    { title: 'Safe URLs', value: '133', icon: '✅', color: '#10B981' },
    { title: 'Scan Accuracy', value: '98%', icon: '🎯', color: '#F59E0B' },
  ];

  const recentScans = [
    { id: 1, url: 'https://example.com', status: 'Safe', date: '2024-03-15', type: 'URL' },
    { id: 2, url: 'suspicious-email@phish.com', status: 'Phishing', date: '2024-03-14', type: 'Email' },
    { id: 3, url: 'https://secure-bank.com', status: 'Safe', date: '2024-03-14', type: 'URL' },
  ];

  // State for feedback form
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // State for user's feedback list
  const [userFeedbackList, setUserFeedbackList] = useState<any[]>([]); // Use a more specific type if available
  const [loadingUserFeedback, setLoadingUserFeedback] = useState(true);
  const [userFeedbackError, setUserFeedbackError] = useState<string | null>(null);

  // Get user and token from auth context
  const { user, isAuthenticated } = useAuth();

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText.trim()) {
      setSubmissionError('Feedback cannot be empty.');
      return;
    }

    if (!isAuthenticated || !user?.id) {
        setSubmissionError('You must be logged in to submit feedback.');
        toast.error('You must be logged in to submit feedback.');
        return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

    try {
      const response = await axios.post('http://localhost:5000/api/feedback', 
        { feedback: feedbackText },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        toast.success('Feedback submitted successfully!');
        setFeedbackText(''); // Clear the form
      } else {
        setSubmissionError(response.data.message || 'Failed to submit feedback.');
        toast.error(response.data.message || 'Failed to submit feedback.');
      }
    } catch (error: any) {
      console.error('Feedback submission error:', error);
      setSubmissionError(error.response?.data?.message || 'Server error occurred.');
      toast.error(error.response?.data?.message || 'Server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch user's feedback on component mount
  useEffect(() => {
    const fetchUserFeedback = async () => {
      if (!isAuthenticated || !user?.id) {
        setUserFeedbackError('You must be logged in to view feedback.');
        setLoadingUserFeedback(false);
        return;
      }

      setLoadingUserFeedback(true);
      setUserFeedbackError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setUserFeedbackError('Authentication token not found.');
        setLoadingUserFeedback(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/feedback/my', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setUserFeedbackList(response.data.feedback);
        } else {
          setUserFeedbackError(response.data.message || 'Failed to fetch feedback.');
        }
      } catch (error: any) {
        console.error('Error fetching user feedback:', error);
        setUserFeedbackError(error.response?.data?.message || 'Server error occurred while fetching feedback.');
      } finally {
        setLoadingUserFeedback(false);
      }
    };

    // Only fetch if authenticated
    if (isAuthenticated) {
      fetchUserFeedback();
    }
  }, [isAuthenticated, user?.id]); // Refetch if authentication status or user ID changes

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'User'}! 👋</h1>
        <p className="subtitle">Here's what's happening with your security scans</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderColor: stat.color }}>
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20` }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/app/url-scan" className="action-button url-scan">
              <span className="action-icon">🔗</span>
              <span className="action-text">Scan URL</span>
            </Link>
            <Link to="/app/email-scan" className="action-button email-scan">
              <span className="action-icon">📧</span>
              <span className="action-text">Scan Email</span>
            </Link>
            <Link to="/app/reports" className="action-button view-reports">
              <span className="action-icon">📊</span>
              <span className="action-text">View Reports</span>
            </Link>
          </div>
        </div>

        <div className="recent-scans">
          <h2>Recent Scans</h2>
          <div className="scans-list">
            {recentScans.map((scan) => (
              <div key={scan.id} className="scan-item">
                <div className="scan-info">
                  <span className="scan-type">{scan.type}</span>
                  <span className="scan-url">{scan.url}</span>
                  <span className="scan-date">{scan.date}</span>
                </div>
                <span className={`scan-status ${scan.status.toLowerCase()}`}>
                  {scan.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Submission Section */}
      <div className="feedback-section">
        <h2>Submit Feedback</h2>
        <form onSubmit={handleFeedbackSubmit}>
          <div className="form-group">
            <label htmlFor="feedback">Your Feedback:</label>
            <textarea
              id="feedback"
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your thoughts or report an issue..."
              required
              disabled={isSubmitting}
            ></textarea>
          </div>
          {submissionError && <div className="error-message">{submissionError}</div>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      {/* User Feedback List Section */}
      <div className="user-feedback-list-section">
        <h2>My Feedback</h2>
        {loadingUserFeedback ? (
          <div className="loading">Loading your feedback...</div>
        ) : userFeedbackError ? (
          <div className="error-message">{userFeedbackError}</div>
        ) : userFeedbackList.length === 0 ? (
          <div className="no-data">You have not submitted any feedback yet.</div>
        ) : (
          <div className="feedback-list">
            {userFeedbackList.map((feedbackItem) => (
              <div key={feedbackItem._id} className="feedback-item">
                <div className="feedback-content">
                  <p><strong>Feedback:</strong> {feedbackItem.feedback}</p>
                  <p><strong>Status:</strong> {feedbackItem.status}</p>
                  {feedbackItem.adminReply && (
                    <p><strong>Admin Reply:</strong> {feedbackItem.adminReply}</p>
                  )}
                  <p className="feedback-date">Submitted on: {new Date(feedbackItem.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="security-tips">
        <h2>Security Tips</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <span className="tip-icon">🔒</span>
            <h3>Use Strong Passwords</h3>
            <p>Create unique passwords for each account and use a password manager.</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">🔍</span>
            <h3>Verify URLs</h3>
            <p>Always check URLs before clicking, especially in emails.</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">📱</span>
            <h3>Enable 2FA</h3>
            <p>Add an extra layer of security with two-factor authentication.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 