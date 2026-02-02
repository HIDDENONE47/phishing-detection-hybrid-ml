import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setAuthState: (token: string, user: User) => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  setAuthState: () => {},
  refreshToken: async () => false,
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage on initial render
  useEffect(() => {
    const loadUserFromStorage = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('User loaded from localStorage:', parsedUser.email, 'Role:', parsedUser.role);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    loadUserFromStorage();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    console.log('User logged in:', userData.email, 'Role:', userData.role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    console.log('User logged out');
  };

  const setAuthState = (token: string, userData: User) => {
    login(token, userData);
  };

  // Function to refresh the token or verify it's still valid
  const refreshToken = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token to refresh');
      return false;
    }

    try {
      // This endpoint should just verify the token is valid
      // You might need to create this endpoint if it doesn't exist
      const response = await axios.get('http://localhost:5000/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Token verification successful');
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      // Only logout if the error is specifically about invalid token
      // Don't logout for network errors or server errors
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
      }
      return false;
    }
  };

  const updateUser = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    console.log('User data updated:', userData.email);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      login, 
      logout,
      setAuthState,
      refreshToken,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 





