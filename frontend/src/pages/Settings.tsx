import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Settings.css';

interface SettingsForm {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  scanNotifications: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
}

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null,
  });
  const [activeView, setActiveView] = useState<'account' | 'notifications' | 'security'>('account');
  const [formData, setFormData] = useState<SettingsForm>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    scanNotifications: true,
  });
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSecurityChange = (setting: keyof SecuritySettings, value: boolean | number) => {
    setSecurity(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  const showPopup = (message: string, type: 'success' | 'error') => {
    setPopup({ message, type });
    setTimeout(() => {
      setPopup({ message: '', type: null });
    }, 3000); // Hide after 3 seconds
  };

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate password change if attempting to change password
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          showPopup('New passwords do not match', 'error');
          setIsLoading(false);
          return;
        }
        if (!formData.currentPassword) {
          showPopup('Current password is required to change password', 'error');
          setIsLoading(false);
          return;
        }
      }

      // Call API to update user settings
      const response = await axios.put(
        'http://localhost:5000/api/users/settings',
        {
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      updateUser(response.data);
      showPopup('Settings updated successfully', 'success');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to update settings';
        console.error('API Error Response Data:', error.response?.data);
        showPopup(errorMessage, 'error');
      } else {
        showPopup('An unexpected error occurred', 'error');
      }
      console.error('Settings update error:', error);
    } finally {
      console.log('Finished handleAccountUpdate');
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setIsLoading(true);
    try {
      await axios.put(
        'http://localhost:5000/api/users/notifications',
        notifications,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      showPopup('Notification preferences updated', 'success');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to update notification settings';
        showPopup(errorMessage, 'error');
      } else {
        showPopup('An unexpected error occurred', 'error');
      }
      console.error('Notification settings update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityUpdate = async () => {
    setIsLoading(true);
    try {
      await axios.put(
        'http://localhost:5000/api/users/security',
        security,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      showPopup('Security settings updated', 'success');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to update security settings';
        showPopup(errorMessage, 'error');
      } else {
        showPopup('An unexpected error occurred', 'error');
      }
      console.error('Security settings update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'account':
        return (
          <div className="settings-section">
            <h2>Account Settings</h2>
            <form className="settings-form" onSubmit={handleAccountUpdate}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter to change password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                className="save-button"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        );
      case 'notifications':
        return (
          <div className="settings-section">
            <h2>Notification Preferences</h2>
            <div className="settings-form">
              <div className="toggle-group">
                <label htmlFor="emailNotifications">Email Notifications</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={notifications.emailNotifications}
                    onChange={() => handleNotificationChange('emailNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-group">
                <label htmlFor="scanNotifications">Scan Result Notifications</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    id="scanNotifications"
                    checked={notifications.scanNotifications}
                    onChange={() => handleNotificationChange('scanNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <button
                onClick={handleNotificationUpdate}
                className="save-button"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="settings-section">
            <h2>Security Settings</h2>
            <div className="settings-form">
              <div className="toggle-group">
                <label htmlFor="twoFactorAuth">Two-Factor Authentication</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    id="twoFactorAuth"
                    checked={security.twoFactorAuth}
                    onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
                <input
                  type="number"
                  id="sessionTimeout"
                  min="5"
                  max="120"
                  value={security.sessionTimeout}
                  onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                />
              </div>

              <button
                onClick={handleSecurityUpdate}
                className="save-button"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Security Settings'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-nav">
          <button
            className={`nav-button ${activeView === 'account' ? 'active' : ''}`}
            onClick={() => setActiveView('account')}
          >
            Account Settings
          </button>
          <button
            className={`nav-button ${activeView === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveView('notifications')}
          >
            Notifications
          </button>
          <button
            className={`nav-button ${activeView === 'security' ? 'active' : ''}`}
            onClick={() => setActiveView('security')}
          >
            Security
          </button>
        </div>
        {renderContent()}
      </div>
      {popup.type && (
        <div className={`custom-popup custom-popup-${popup.type}`}>
          {popup.message}
        </div>
      )}
    </div>
  );
};

export default Settings; 