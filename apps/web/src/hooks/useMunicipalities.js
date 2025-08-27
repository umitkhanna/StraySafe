import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { municipalitiesAPI } from '../lib/api';

// React Query hook for fetching municipalities
export const useMunicipalities = (params = {}) => {
  return useQuery({
    queryKey: ['municipalities', params],
    queryFn: () => municipalitiesAPI.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// React Query hook for fetching single municipality
export const useMunicipality = (id) => {
  return useQuery({
    queryKey: ['municipality', id],
    queryFn: () => municipalitiesAPI.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// React Query hook for creating municipality
export const useCreateMunicipality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: municipalitiesAPI.create,
    onSuccess: () => {
      // Invalidate and refetch municipalities
      queryClient.invalidateQueries(['municipalities']);
    },
    onError: (error) => {
      console.error('Error creating municipality:', error);
    },
  });
};

// React Query hook for updating municipality
export const useUpdateMunicipality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => municipalitiesAPI.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch municipalities
      queryClient.invalidateQueries(['municipalities']);
      // Update the specific municipality cache
      queryClient.invalidateQueries(['municipality', variables.id]);
    },
    onError: (error) => {
      console.error('Error updating municipality:', error);
    },
  });
};

// React Query hook for deleting municipality
export const useDeleteMunicipality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: municipalitiesAPI.delete,
    onSuccess: () => {
      // Invalidate and refetch municipalities
      queryClient.invalidateQueries(['municipalities']);
    },
    onError: (error) => {
      console.error('Error deleting municipality:', error);
    },
  });
};
