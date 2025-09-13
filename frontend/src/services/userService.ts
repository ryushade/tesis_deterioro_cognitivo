import { apiClient } from './api';
import type { User, CreateUserRequest, UpdateUserRequest, ApiResponse, PaginatedResponse } from '../types';

export const userService = {
  // Get all users
  getUsers: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: CreateUserRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id: number, userData: UpdateUserRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<ApiResponse<{ status: string }>> => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};
