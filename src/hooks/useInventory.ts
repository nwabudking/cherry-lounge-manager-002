import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, InventoryItem, StockMovement, Supplier } from '@/lib/api/inventory';
import { toast } from 'sonner';

// Query keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  items: () => [...inventoryKeys.all, 'items'] as const,
  activeItems: () => [...inventoryKeys.items(), 'active'] as const,
  lowStockItems: () => [...inventoryKeys.items(), 'low-stock'] as const,
  item: (id: string) => [...inventoryKeys.items(), id] as const,
  movements: (itemId?: string) => [...inventoryKeys.all, 'movements', itemId] as const,
  suppliers: () => [...inventoryKeys.all, 'suppliers'] as const,
  activeSuppliers: () => [...inventoryKeys.suppliers(), 'active'] as const,
  supplier: (id: string) => [...inventoryKeys.suppliers(), id] as const,
};

// Inventory Items hooks
export function useInventoryItems() {
  return useQuery({
    queryKey: inventoryKeys.items(),
    queryFn: inventoryApi.getItems,
  });
}

export function useActiveInventoryItems() {
  return useQuery({
    queryKey: inventoryKeys.activeItems(),
    queryFn: inventoryApi.getActiveItems,
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: inventoryKeys.lowStockItems(),
    queryFn: inventoryApi.getLowStockItems,
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: inventoryKeys.item(id),
    queryFn: () => inventoryApi.getItem(id),
    enabled: !!id,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<InventoryItem>) => inventoryApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      toast.success('Inventory item created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create inventory item');
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) => 
      inventoryApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      toast.success('Inventory item updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update inventory item');
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      toast.success('Inventory item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete inventory item');
    },
  });
}

// Stock movements hooks
export function useStockMovements(itemId?: string) {
  return useQuery({
    queryKey: inventoryKeys.movements(itemId),
    queryFn: () => inventoryApi.getMovements(itemId),
  });
}

export function useAddStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, quantity, notes }: { itemId: string; quantity: number; notes?: string }) => 
      inventoryApi.addStock(itemId, quantity, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
      toast.success('Stock added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add stock');
    },
  });
}

export function useRemoveStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, quantity, notes }: { itemId: string; quantity: number; notes?: string }) => 
      inventoryApi.removeStock(itemId, quantity, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
      toast.success('Stock removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove stock');
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, newStock, notes }: { itemId: string; newStock: number; notes?: string }) => 
      inventoryApi.adjustStock(itemId, newStock, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
      toast.success('Stock adjusted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to adjust stock');
    },
  });
}

// Suppliers hooks
export function useSuppliers() {
  return useQuery({
    queryKey: inventoryKeys.suppliers(),
    queryFn: inventoryApi.getSuppliers,
  });
}

export function useActiveSuppliers() {
  return useQuery({
    queryKey: inventoryKeys.activeSuppliers(),
    queryFn: inventoryApi.getActiveSuppliers,
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: inventoryKeys.supplier(id),
    queryFn: () => inventoryApi.getSupplier(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Supplier>) => inventoryApi.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.suppliers() });
      toast.success('Supplier created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create supplier');
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Supplier> }) => 
      inventoryApi.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.suppliers() });
      toast.success('Supplier updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update supplier');
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.suppliers() });
      toast.success('Supplier deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete supplier');
    },
  });
}
