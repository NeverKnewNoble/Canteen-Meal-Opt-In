import { apiFetch } from '@/utils/api-client';
import { toast } from '@/components/alert';
import type { Selection, SelectionFormData } from '@/types/selection';

export const getAllSelections = async (): Promise<Selection[]> => {
  try {
    return await apiFetch<Selection[]>('/api/selections');
  } catch (error) {
    console.error('Error in getAllSelections:', error);
    toast.error('Failed to load selections');
    throw error;
  }
};

export const createSelection = async (
  selectionData: SelectionFormData
): Promise<Selection> => {
  try {
    const data = await apiFetch<Selection>('/api/selections', {
      method: 'POST',
      body: JSON.stringify(selectionData),
    });
    toast.success('Meal selected successfully');
    return data;
  } catch (error) {
    console.error('Error in createSelection:', error);
    toast.error('Unable to select meal');
    throw error;
  }
};

export const updateSelection = async (
  selectionId: string,
  selectionData: Partial<SelectionFormData>
): Promise<Selection> => {
  try {
    const data = await apiFetch<Selection>(`/api/selections/${selectionId}`, {
      method: 'PATCH',
      body: JSON.stringify(selectionData),
    });
    toast.success('Selection updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateSelection:', error);
    toast.error('Failed to update selection');
    throw error;
  }
};

export const deleteSelection = async (selectionId: string): Promise<void> => {
  try {
    await apiFetch<{ ok: boolean }>(`/api/selections/${selectionId}`, {
      method: 'DELETE',
    });
    toast.success('Selection deleted successfully');
  } catch (error) {
    console.error('Error in deleteSelection:', error);
    toast.error('Failed to delete selection');
    throw error;
  }
};

export const getSelectionsByUserId = async (
  userId: string
): Promise<Selection[]> => {
  try {
    const q = new URLSearchParams({ userId });
    return await apiFetch<Selection[]>(`/api/selections?${q}`);
  } catch (error) {
    console.error('Error in getSelectionsByUserId:', error);
    toast.error('Failed to load user selections');
    throw error;
  }
};

export const getSelectionsByMealId = async (
  mealId: string
): Promise<Selection[]> => {
  try {
    const q = new URLSearchParams({ mealId });
    return await apiFetch<Selection[]>(`/api/selections?${q}`);
  } catch (error) {
    console.error('Error in getSelectionsByMealId:', error);
    toast.error('Failed to load meal selections');
    throw error;
  }
};

export interface SelectionWithDetails {
  id: string;
  userName: string;
  department: string;
  mealName: string;
  optedIn: boolean;
  createdAt: string;
}

export interface BulkSelectionResult {
  created: Selection[];
  createdCount: number;
  skippedUserIds: string[];
  skippedCount: number;
}

export const bulkCreateSelections = async (payload: {
  meal_id: string;
  user_ids: string[];
  opted_in: boolean;
}): Promise<BulkSelectionResult> => {
  try {
    const data = await apiFetch<BulkSelectionResult>('/api/selections/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.createdCount > 0) {
      toast.success(
        `Opted in ${data.createdCount} user${data.createdCount === 1 ? '' : 's'}` +
          (data.skippedCount > 0
            ? ` (${data.skippedCount} skipped — already chose)`
            : '')
      );
    } else if (data.skippedCount > 0) {
      toast.error('All selected users already have a selection for this meal');
    }
    return data;
  } catch (error) {
    console.error('Error in bulkCreateSelections:', error);
    toast.error('Failed to bulk opt-in users');
    throw error;
  }
};

export const getSelectionsByMenuId = async (
  menuId: string
): Promise<SelectionWithDetails[]> => {
  try {
    return await apiFetch<SelectionWithDetails[]>(
      `/api/selections/by-menu/${menuId}`
    );
  } catch (error) {
    console.error('Error in getSelectionsByMenuId:', error);
    toast.error('Failed to load menu selections');
    throw error;
  }
};
