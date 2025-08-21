import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '@/lib/api';
import type { User, UsersResponse, CreateUserData, APIError } from '@/lib/api';

// Query keys for caching
export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...userQueryKeys.lists(), { filters }] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const,
  managed: () => [...userQueryKeys.all, 'managed'] as const,
  organizationMembers: () => [...userQueryKeys.all, 'organization-members'] as const,
  byRole: (role: string) => [...userQueryKeys.all, 'by-role', role] as const,
};

// Hook to get all users with pagination and filters
export const useUsers = (params?: { 
  page?: number; 
  limit?: number; 
  search?: string; 
  role?: string; 
}) => {
  return useQuery<UsersResponse, APIError>({
    queryKey: userQueryKeys.list(params || {}),
    queryFn: () => usersAPI.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get managed users
export const useManagedUsers = () => {
  return useQuery<UsersResponse, APIError>({
    queryKey: userQueryKeys.managed(),
    queryFn: usersAPI.getManaged,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get organization members
export const useOrganizationMembers = () => {
  return useQuery<UsersResponse, APIError>({
    queryKey: userQueryKeys.organizationMembers(),
    queryFn: usersAPI.getOrganizationMembers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get users by role
export const useUsersByRole = (role: string) => {
  return useQuery<UsersResponse, APIError>({
    queryKey: userQueryKeys.byRole(role),
    queryFn: () => usersAPI.getByRole(role),
    enabled: !!role,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a new user
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean; data: User }, APIError, CreateUserData>({
    mutationFn: usersAPI.create,
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
    onError: (error) => {
      console.error('Create user failed:', error);
    },
  });
};

// Hook to delete a user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean; message: string }, APIError, string>({
    mutationFn: usersAPI.delete,
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
    onError: (error) => {
      console.error('Delete user failed:', error);
    },
  });
};

// Hook to update a user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean; data: User }, APIError, { id: string; data: Partial<User> }>({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
    onError: (error) => {
      console.error('Update user failed:', error);
    },
  });
};

// Hook to move a user
export const useMoveUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    { success: boolean; data: User }, 
    APIError, 
    { userId: string; newParentId: string | null }
  >({
    mutationFn: ({ userId, newParentId }) => usersAPI.move(userId, newParentId),
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
    onError: (error) => {
      console.error('Move user failed:', error);
    },
  });
};
