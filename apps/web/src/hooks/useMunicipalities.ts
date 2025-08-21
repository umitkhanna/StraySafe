import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { municipalitiesAPI, type CreateMunicipalityData } from '@/lib/api';

// Query key factory for municipalities
export const municipalityKeys = {
  all: ['municipalities'] as const,
  lists: () => [...municipalityKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...municipalityKeys.lists(), { filters }] as const,
  details: () => [...municipalityKeys.all, 'detail'] as const,
  detail: (id: string) => [...municipalityKeys.details(), id] as const,
  stats: () => [...municipalityKeys.all, 'stats'] as const,
};

// Get all municipalities
export function useMunicipalities(params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: municipalityKeys.list(params || {}),
    queryFn: () => municipalitiesAPI.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single municipality
export function useMunicipality(municipalityId: string) {
  return useQuery({
    queryKey: municipalityKeys.detail(municipalityId),
    queryFn: () => municipalitiesAPI.getById(municipalityId),
    enabled: !!municipalityId,
  });
}

// Get municipality statistics
export function useMunicipalityStats() {
  return useQuery({
    queryKey: municipalityKeys.stats(),
    queryFn: () => municipalitiesAPI.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Create municipality mutation
export function useCreateMunicipality() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (municipalityData: CreateMunicipalityData) => municipalitiesAPI.create(municipalityData),
    onSuccess: () => {
      // Invalidate and refetch municipality lists
      queryClient.invalidateQueries({ queryKey: municipalityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: municipalityKeys.stats() });
    },
  });
}

// Update municipality mutation
export function useUpdateMunicipality() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ municipalityId, municipalityData }: { municipalityId: string; municipalityData: Partial<CreateMunicipalityData> }) =>
      municipalitiesAPI.update(municipalityId, municipalityData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch municipality lists
      queryClient.invalidateQueries({ queryKey: municipalityKeys.lists() });
      // Update the specific municipality cache
      queryClient.setQueryData(municipalityKeys.detail(variables.municipalityId), data);
      queryClient.invalidateQueries({ queryKey: municipalityKeys.stats() });
    },
  });
}

// Delete municipality mutation
export function useDeleteMunicipality() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (municipalityId: string) => municipalitiesAPI.delete(municipalityId),
    onSuccess: () => {
      // Invalidate and refetch municipality lists
      queryClient.invalidateQueries({ queryKey: municipalityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: municipalityKeys.stats() });
    },
  });
}
