import axios from 'axios';

/**
 * Axios instance for API requests
 * Uses environment variable for base URL to support different environments
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
  },
});

export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export default api;
