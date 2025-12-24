/**
 * API Service Layer
 *
 * Centralized service for all API calls to Laravel backend.
 * Provides type-safe methods with proper error handling and security.
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getApiBaseUrl } from '@/lib/apiConfig';
import { API_TIMEOUTS } from '@/lib/constants';
import type { ApiResponse, Course, Blog, FooterSettings, FormDetails } from '@/types/api';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Create axios instance with security and performance configurations
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: API_TIMEOUTS.DEFAULT,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    // Security: Don't send credentials unless explicitly needed
    withCredentials: false,
  });

  // Request interceptor for logging and security
  client.interceptors.request.use(
    config => {
      // Add request timestamp for performance tracking
      config.metadata = { startTime: Date.now() };
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      // Handle network errors
      if (!error.response) {
        throw new ApiError('Network error: Unable to reach the server', 0, error);
      }

      // Handle HTTP errors
      const status = error.response.status;
      const data = error.response.data as { message?: string; error?: string };

      throw new ApiError(
        data?.message || data?.error || `HTTP ${status} Error`,
        status,
        error.response.data
      );
    }
  );

  return client;
};

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

const apiClient = createApiClient();

/**
 * Generic API request wrapper with error handling
 */
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (axios.isAxiosError(error)) {
      throw new ApiError(
        error.message || 'An unexpected error occurred',
        error.response?.status,
        error.response?.data
      );
    }
    throw new ApiError('An unexpected error occurred');
  }
}

/**
 * Courses Service
 */
export const coursesService = {
  /**
   * Get all courses
   */
  async getAll(): Promise<Course[]> {
    const response = await request<ApiResponse<Course[]> | Course[]>({
      url: '/courses',
      method: 'GET',
    });

    // Handle different response formats
    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as ApiResponse<Course[]>).data || [];
    }
    return [];
  },

  /**
   * Get course by ID
   */
  async getById(id: number): Promise<Course | null> {
    try {
      const response = await request<ApiResponse<Course> | Course>({
        url: `/courses/${id}`,
        method: 'GET',
      });

      if (response && typeof response === 'object' && 'data' in response) {
        return (response as ApiResponse<Course>).data || null;
      }
      return response as Course;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get course by slug
   */
  async getBySlug(slug: string): Promise<Course | null> {
    try {
      const response = await request<ApiResponse<Course> | Course>({
        url: `/courses/slug/${slug}`,
        method: 'GET',
      });

      if (response && typeof response === 'object' && 'data' in response) {
        return (response as ApiResponse<Course>).data || null;
      }
      return response as Course;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },
};

/**
 * Blogs Service
 */
export const blogsService = {
  /**
   * Get all blogs
   */
  async getAll(): Promise<Blog[]> {
    const response = await request<ApiResponse<Blog[]> | Blog[]>({ url: '/blogs', method: 'GET' });

    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as ApiResponse<Blog[]>).data || [];
    }
    return [];
  },

  /**
   * Get blog by slug
   */
  async getBySlug(slug: string): Promise<Blog | null> {
    try {
      const response = await request<ApiResponse<Blog> | Blog>({
        url: `/blogs/${slug}`,
        method: 'GET',
      });

      if (response && typeof response === 'object' && 'data' in response) {
        return (response as ApiResponse<Blog>).data || null;
      }
      return response as Blog;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },
};

/**
 * Footer Service
 */
export const footerService = {
  /**
   * Get footer settings
   */
  async getSettings(): Promise<FooterSettings | null> {
    try {
      const response = await request<ApiResponse<FooterSettings> | FooterSettings>({
        url: '/footer-settings',
        method: 'GET',
      });

      if (response && typeof response === 'object' && 'data' in response) {
        return (response as ApiResponse<FooterSettings>).data || null;
      }
      return response as FooterSettings;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },
};

/**
 * Form Service
 */
export const formService = {
  /**
   * Get form details
   */
  async getFormDetails(): Promise<FormDetails | null> {
    try {
      const response = await request<ApiResponse<FormDetails> | FormDetails | FormDetails[]>({
        url: '/form-details',
        method: 'GET',
      });

      // Handle array response (get latest)
      if (Array.isArray(response)) {
        return response[response.length - 1] || null;
      }

      if (response && typeof response === 'object' && 'data' in response) {
        const data = (response as ApiResponse<FormDetails>).data;
        return Array.isArray(data) ? data[data.length - 1] || null : data || null;
      }
      return response as FormDetails;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Submit enrollment form
   */
  async submitEnrollment(data: {
    name: string;
    email: string;
    phone: string;
    courses: number[];
    page?: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await request<ApiResponse>({
      url: '/enroll',
      method: 'POST',
      data,
    });

    if (response && typeof response === 'object' && 'message' in response) {
      return {
        success: true,
        message: (response as ApiResponse).message || 'Demo booked successfully!',
      };
    }

    return {
      success: true,
      message: 'Demo booked successfully!',
    };
  },
};

/**
 * Homepage Service
 */
export const homepageService = {
  /**
   * Get homepage content
   */
  async getContent(): Promise<unknown> {
    try {
      const response = await request<ApiResponse>({ url: '/homepage', method: 'GET' });

      if (response && typeof response === 'object' && 'data' in response) {
        return (response as ApiResponse).data;
      }
      return response;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },
};

// Export default client for custom requests
export default apiClient;
