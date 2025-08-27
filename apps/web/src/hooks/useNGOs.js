import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ngosAPI } from '../lib/api';

// React Query hook for fetching NGOs
export const useNGOs = (params = {}) => {
  return useQuery({
    queryKey: ['ngos', params],
    queryFn: () => ngosAPI.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// React Query hook for fetching single NGO
export const useNGO = (id) => {
  return useQuery({
    queryKey: ['ngo', id],
    queryFn: () => ngosAPI.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// React Query hook for creating NGO
export const useCreateNGO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ngosAPI.create,
    onSuccess: () => {
      // Invalidate and refetch NGOs
      queryClient.invalidateQueries(['ngos']);
    },
    onError: (error) => {
      console.error('Error creating NGO:', error);
    },
  });
};

// React Query hook for updating NGO
export const useUpdateNGO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => ngosAPI.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch NGOs
      queryClient.invalidateQueries(['ngos']);
      // Update the specific NGO cache
      queryClient.invalidateQueries(['ngo', variables.id]);
    },
    onError: (error) => {
      console.error('Error updating NGO:', error);
    },
  });
};

// React Query hook for deleting NGO
export const useDeleteNGO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ngosAPI.delete,
    onSuccess: () => {
      // Invalidate and refetch NGOs
      queryClient.invalidateQueries(['ngos']);
    },
    onError: (error) => {
      console.error('Error deleting NGO:', error);
    },
  });
};
