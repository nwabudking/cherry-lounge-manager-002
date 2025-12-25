import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, RestaurantSettings } from '@/lib/api/settings';
import { toast } from 'sonner';

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  restaurant: () => [...settingsKeys.all, 'restaurant'] as const,
};

// Settings hooks
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.restaurant(),
    queryFn: settingsApi.getSettings,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<RestaurantSettings>) => settingsApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => settingsApi.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Logo uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload logo');
    },
  });
}
