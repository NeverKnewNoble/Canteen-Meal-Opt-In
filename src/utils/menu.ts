import { apiFetch } from '@/utils/api-client';
import { toast } from '@/components/alert';
import type { Menu, MenuFormData } from '@/types/menu';

export const setTodaysSpecial = async (
  menuId: string,
  mealId: string
): Promise<Menu> => {
  try {
    const data = await apiFetch<Menu>(`/api/menu/${menuId}`, {
      method: 'PATCH',
      body: JSON.stringify({ todays_special: mealId }),
    });
    toast.success('Special meal set successfully');
    return data;
  } catch (error) {
    console.error('Error in setTodaysSpecial:', error);
    toast.error('Failed to set special meal');
    throw error;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'upcoming':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getAllMenus = async (): Promise<Menu[]> => {
  try {
    return await apiFetch<Menu[]>('/api/menu');
  } catch (error) {
    console.error('Error in getAllMenus:', error);
    toast.error('Failed to load menus');
    throw error;
  }
};

export const createMenu = async (menuData: MenuFormData): Promise<Menu> => {
  try {
    const data = await apiFetch<Menu>('/api/menu', {
      method: 'POST',
      body: JSON.stringify(menuData),
    });
    toast.success('Menu created successfully');
    return data;
  } catch (error) {
    console.error('Error in createMenu:', error);
    toast.error('Failed to create menu');
    throw error;
  }
};

export const updateMenu = async (
  menuId: string,
  menuData: Partial<MenuFormData>
): Promise<Menu> => {
  try {
    const data = await apiFetch<Menu>(`/api/menu/${menuId}`, {
      method: 'PATCH',
      body: JSON.stringify(menuData),
    });
    toast.success('Menu updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateMenu:', error);
    toast.error('Failed to update menu');
    throw error;
  }
};

export const deleteMenu = async (menuId: string): Promise<void> => {
  try {
    await apiFetch<{ ok: boolean }>(`/api/menu/${menuId}`, { method: 'DELETE' });
    toast.success('Menu deleted successfully');
  } catch (error) {
    console.error('Error in deleteMenu:', error);
    toast.error('Failed to delete menu');
    throw error;
  }
};

export const getMenuById = async (menuId: string): Promise<Menu | null> => {
  try {
    return await apiFetch<Menu>(`/api/menu/${menuId}`);
  } catch {
    return null;
  }
};

export const searchMenus = async (searchQuery: string): Promise<Menu[]> => {
  try {
    const q = new URLSearchParams({ search: searchQuery });
    return await apiFetch<Menu[]>(`/api/menu?${q}`);
  } catch (error) {
    console.error('Error in searchMenus:', error);
    toast.error('Failed to search menus');
    throw error;
  }
};

export const getMenusByStatus = async (status: string): Promise<Menu[]> => {
  try {
    const q = new URLSearchParams({ status });
    return await apiFetch<Menu[]>(`/api/menu?${q}`);
  } catch (error) {
    console.error('Error in getMenusByStatus:', error);
    toast.error('Failed to load menus');
    throw error;
  }
};

export const getMenusByDateRange = async (
  startDate: string,
  endDate: string
): Promise<Menu[]> => {
  try {
    const q = new URLSearchParams({ startDate, endDate });
    return await apiFetch<Menu[]>(`/api/menu?${q}`);
  } catch (error) {
    console.error('Error in getMenusByDateRange:', error);
    toast.error('Failed to load menus');
    throw error;
  }
};

/** Server applies expiry rules and returns the current active menu with nested meals. */
export const getActiveMenu = async (): Promise<Menu | null> => {
  try {
    return await apiFetch<Menu | null>('/api/menu/active');
  } catch (error) {
    console.error('Error in getActiveMenu:', error);
    return null;
  }
};

/** Server applies expiry rules and returns tomorrow’s menu (or earliest active) with meals. */
export const getTomorrowsMenu = async (): Promise<Menu | null> => {
  try {
    return await apiFetch<Menu | null>('/api/menu/tomorrow');
  } catch (error) {
    console.error('Error in getTomorrowsMenu:', error);
    return null;
  }
};
