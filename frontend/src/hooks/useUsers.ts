import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { userService } from '../services/userService';
const userService = { getUsers: async (page:any, limit:any)=>({}), getUserById: async (id:any)=>({}), createUser: async (d:any)=>({}), updateUser: async (i:any, d:any)=>({}), deleteUser: async (id:any)=>({}), healthCheck: async ()=>({}) };
import type { CreateUserRequest, UpdateUserRequest } from '../types';

// Query keys
export const USER_QUERY_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_QUERY_KEYS.all, 'list'] as const,
  list: (page: number, limit: number) => [...USER_QUERY_KEYS.lists(), { page, limit }] as const,
  details: () => [...USER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...USER_QUERY_KEYS.details(), id] as const,
};

// Custom hooks
export const useUsers = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.list(page, limit),
    queryFn: () => userService.getUsers(page, limit),
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: CreateUserRequest) => userService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: UpdateUserRequest }) =>
      userService.updateUser(id, userData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: userService.healthCheck,
    refetchInterval: 30000, // Check every 30 seconds
  });
};
