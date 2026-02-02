import axios, { AxiosError } from 'axios';

// Make sure this matches your backend URL
const API_BASE_URL = "http://localhost:5000/api";


// Log the API base URL for debugging
console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for slower connections
  timeout: 15000,
  // Include credentials for cross-origin requests if needed
  withCredentials: true
});

// Add request interceptor to include auth token and log requests
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration and log responses
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server might be down or slow');
    }

    if (!error.response) {
      console.error('Network error - no response received. Backend might be down or unreachable.');
    } else if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface ApiErrorResponse {
  message: string;
}

export const authService = {
  login: async (email: string, password: string) => {
    try {
      console.log('authService: Attempting login with email:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('authService: Login successful');
      return response.data;
    } catch (error: unknown) {
      console.error('authService: Login error:', error);

      // If it's a network error, provide a clearer message
      const axiosError = error as AxiosError;
      if (!axiosError.response) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }

      // Otherwise, pass through the original error
      throw error;
    }
  },

  register: async (name: string, email: string, password: string, role: string = 'user') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },

  registerAdmin: async (name: string, email: string, password: string) => {
    try {
      console.log('authService: Attempting admin registration with email:', email);
      const response = await api.post('/auth/register-admin', {
        name,
        email,
        password
      });
      console.log('authService: Admin registration successful');
      return response.data;
    } catch (error: unknown) {
      console.error('authService: Admin registration error:', error);

      // If it's a network error, provide a clearer message
      const axiosError = error as AxiosError;
      if (!axiosError.response) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }

      // Otherwise, pass through the original error
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const scanService = {
  scanUrl: async (url: string) => {
    const response = await api.post('/urlscan/analyze', { url });
    return response.data;
  },

  scanEmail: async (emailContent: string) => {
    const response = await api.post('/scan/email', { emailContent });
    return response.data;
  },
};

export const reportService = {
  getStats: async (timeRange: string, scanType: string) => {
    const response = await api.get(`/reports/stats`, {
      params: { timeRange, scanType }
    });
    return response.data;
  },

  getDownloadUrl: (timeRange: string, scanType: string) => {
    const token = localStorage.getItem('token');
    return `${API_BASE_URL}/reports/download?timeRange=${timeRange}&scanType=${scanType}&token=${token}`;
  },

  downloadReport: async (timeRange: string, scanType: string) => {
    const response = await api.get(`/reports/download`, {
      params: { timeRange, scanType },
      responseType: 'blob', // Important for file download
    });
    return response;
  },

  downloadSingleReport: async (scanId: string) => {
    const response = await api.get(`/reports/download/${scanId}`, {
      responseType: 'blob',
    });
    return response;
  },

  getScanHistory: async (limit: number = 10) => {
    const response = await api.get(`/reports/history`, {
      params: { limit }
    });
    return response.data;
  }
};

export default api;








