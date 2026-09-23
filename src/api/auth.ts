import api from './axios';
import { LoginCredentials, LoginResponse, User } from '@/types/auth';

/**
 * Authenticates user with username and password
 * API Endpoint: POST https://dummyjson.com/auth/login
 */
export const loginApi = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', {
    username: credentials.username,
    password: credentials.password,
    expiresInMins: 60, // Optional token expiry
  });
  return response.data;
};

/**
 * Fetches authenticated user profile
 * API Endpoint: GET https://dummyjson.com/auth/me
 */
export const getCurrentUserApi = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};
