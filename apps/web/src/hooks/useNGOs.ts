import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ngosAPI } from '../lib/api';
import type { NGOsResponse } from '../lib/types';

export const useNGOs = (params?: any) => {
  return useQuery<NGOsResponse>({
    queryKey: ['ngos', params],
    queryFn: () => ngosAPI.getAll(params),
  });
};

export const useCreateNGO = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ngosAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngos'] });
    },
  });
};

export const useUpdateNGO = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ngosAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngos'] });
    },
  });
};

export const useDeleteNGO = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ngosAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngos'] });
    },
  });
};
