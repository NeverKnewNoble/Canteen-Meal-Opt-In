import { supabase } from '@/lib/supabase';
import { toast } from '@/components/alert';
import type { Menu, MenuMeal, MenuFormData } from '@/types/menu';

// Set today's special meal for a menu
export const setTodaysSpecial = async (menuId: string, mealId: string): Promise<Menu> => {
  try {
    const { data, error } = await supabase
      .from('menu')
      .update({ todays_special: mealId })
      .eq('id', menuId)
      .select()
      .single();

    if (error) {
      console.error('Error setting today\'s special:', error);
      toast.error('Failed to set special meal');
      throw error;
    }

    toast.success('Special meal set successfully');
    return data;
  } catch (error) {
    console.error('Error in setTodaysSpecial:', error);
    toast.error('Failed to set special meal');
    throw error;
  }
};

// Helper function to get status color
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

// Get all menus
export const getAllMenus = async (): Promise<Menu[]> => {
  try {
    const { data: menus, error } = await supabase
      .from('menu')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching menus:', error);
      toast.error('Failed to fetch menus');
      throw error;
    }

    return menus || [];
  } catch (error) {
    console.error('Error in getAllMenus:', error);
    toast.error('Failed to load menus');
    throw error;
  }
};

// Create a new menu
export const createMenu = async (menuData: MenuFormData): Promise<Menu> => {
  try {
    const { data, error } = await supabase
      .from('menu')
      .insert([
        {
          name: menuData.name,
          date: menuData.date,
          deadline: menuData.deadline,
          status: menuData.status,
          todays_special: null, // Use null to avoid foreign key constraint
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating menu:', error);
      toast.error('Failed to create menu');
      throw error;
    }

    toast.success('Menu created successfully');
    return data;
  } catch (error) {
    console.error('Error in createMenu:', error);
    toast.error('Failed to create menu');
    throw error;
  }
};

// Edit/update a menu
export const updateMenu = async (menuId: string, menuData: Partial<MenuFormData>): Promise<Menu> => {
  try {
    const updateData: any = {};

    if (menuData.name !== undefined) updateData.name = menuData.name;
    if (menuData.date !== undefined) updateData.date = menuData.date;
    if (menuData.deadline !== undefined) updateData.deadline = menuData.deadline;
    if (menuData.status !== undefined) updateData.status = menuData.status;

    const { data, error } = await supabase
      .from('menu')
      .update(updateData)
      .eq('id', menuId)
      .select()
      .single();

    if (error) {
      console.error('Error updating menu:', error);
      toast.error('Failed to update menu');
      throw error;
    }

    toast.success('Menu updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateMenu:', error);
    toast.error('Failed to update menu');
    throw error;
  }
};

// Delete a menu
export const deleteMenu = async (menuId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('menu')
      .delete()
      .eq('id', menuId);

    if (error) {
      console.error('Error deleting menu:', error);
      toast.error('Failed to delete menu');
      throw error;
    }

    toast.success('Menu deleted successfully');
  } catch (error) {
    console.error('Error in deleteMenu:', error);
    toast.error('Failed to delete menu');
    throw error;
  }
};

// Get menu by ID
export const getMenuById = async (menuId: string): Promise<Menu | null> => {
  try {
    const { data: menu, error } = await supabase
      .from('menu')
      .select('*')
      .eq('id', menuId)
      .single();

    if (error) {
      console.error('Error fetching menu:', error);
      return null;
    }

    return menu;
  } catch (error) {
    console.error('Error in getMenuById:', error);
    return null;
  }
};

// Search menus by name
export const searchMenus = async (searchQuery: string): Promise<Menu[]> => {
  try {
    const { data: menus, error } = await supabase
      .from('menu')
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error searching menus:', error);
      toast.error('Failed to search menus');
      throw error;
    }

    return menus || [];
  } catch (error) {
    console.error('Error in searchMenus:', error);
    toast.error('Failed to search menus');
    throw error;
  }
};

// Get menus by status
export const getMenusByStatus = async (status: string): Promise<Menu[]> => {
  try {
    const { data: menus, error } = await supabase
      .from('menu')
      .select('*')
      .eq('status', status)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching menus by status:', error);
      toast.error('Failed to fetch menus');
      throw error;
    }

    return menus || [];
  } catch (error) {
    console.error('Error in getMenusByStatus:', error);
    toast.error('Failed to load menus');
    throw error;
  }
};

// Get menus by date range
export const getMenusByDateRange = async (startDate: string, endDate: string): Promise<Menu[]> => {
  try {
    const { data: menus, error } = await supabase
      .from('menu')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching menus by date range:', error);
      toast.error('Failed to fetch menus');
      throw error;
    }

    return menus || [];
  } catch (error) {
    console.error('Error in getMenusByDateRange:', error);
    toast.error('Failed to load menus');
    throw error;
  }
};

// Get tomorrow's menu
export const getTomorrowsMenu = async (): Promise<Menu | null> => {
  try {
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    const { data: menu, error } = await supabase
      .from('menu')
      .select(`
        *,
        meals!meals_menu_id_fkey (
          id,
          name,
          description,
          menu_id,
          created_at
        )
      `)
      .eq('date', tomorrowString)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching tomorrow\'s menu:', error);
      return null;
    }

    return menu;
  } catch (error) {
    console.error('Error in getTomorrowsMenu:', error);
    return null;
  }
};