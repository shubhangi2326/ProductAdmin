import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'https://dummyjson.com';

export const AUTH_TOKEN_KEY = 'admin_auth_token';
export const USER_INFO_KEY = 'admin_user_info';

// Shared Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach bearer token to outgoing requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check cookie first, fallback to localStorage
    let token = Cookies.get(AUTH_TOKEN_KEY);
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem(AUTH_TOKEN_KEY) || undefined;
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If request was intentionally canceled (via AbortController or CancelToken), pass through original cancel error
    if (
      axios.isCancel(error) ||
      error?.name === 'CanceledError' ||
      error?.name === 'AbortError' ||
      error?.message === 'canceled'
    ) {
      return Promise.reject(error);
    }

    const axiosErr = error as AxiosError<{ message?: string }>;

    // Handle 401 Unauthorized (Expired or invalid token)
    if (axiosErr.response?.status === 401) {
      if (typeof window !== 'undefined') {
        Cookies.remove(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_INFO_KEY);

        // Only redirect if not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }

    // Extract human-readable error message for genuine network errors
    const customErrorMessage =
      axiosErr.response?.data?.message ||
      axiosErr.message ||
      'An unexpected network error occurred. Please try again.';

    return Promise.reject(new Error(customErrorMessage));
  }
);

export default api;
