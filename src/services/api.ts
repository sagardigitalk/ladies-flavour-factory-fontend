import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing user from local storage', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle 401 (Unauthorized) here to redirect to login
    if (error.response && error.response.status === 401) {
      // potentially redirect to login or clear storage
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
