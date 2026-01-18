import { supabase } from '@/lib/supabase';
import { toast } from '@/components/alert';
import type { Meal, MealFormData } from '@/types/meal';

// Get all meals
export const getAllMeals = async (): Promise<Meal[]> => {
  try {
    const { data: meals, error } = await supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching meals:', error);
      toast.error('Failed to fetch meals');
      throw error;
    }

    return meals || [];
  } catch (error) {
    console.error('Error in getAllMeals:', error);
    toast.error('Failed to load meals');
    throw error;
  }
};

// Create a new meal
export const createMeal = async (mealData: MealFormData): Promise<Meal> => {
  try {
    const { data, error } = await supabase
      .from('meals')
      .insert([
        {
          name: mealData.name,
          description: mealData.description,
          menu_id: mealData.menu_id,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating meal:', error);
      toast.error('Failed to create meal');
      throw error;
    }

    toast.success('Meal created successfully');
    return data;
  } catch (error) {
    console.error('Error in createMeal:', error);
    toast.error('Failed to create meal');
    throw error;
  }
};

// Edit/update a meal
export const updateMeal = async (mealId: string, mealData: Partial<MealFormData>): Promise<Meal> => {
  try {
    const updateData: any = {};

    if (mealData.name !== undefined) updateData.name = mealData.name;
    if (mealData.description !== undefined) updateData.description = mealData.description;
    if (mealData.menu_id !== undefined) updateData.menu_id = mealData.menu_id;

    const { data, error } = await supabase
      .from('meals')
      .update(updateData)
      .eq('id', mealId)
      .select()
      .single();

    if (error) {
      console.error('Error updating meal:', error);
      toast.error('Failed to update meal');
      throw error;
    }

    toast.success('Meal updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateMeal:', error);
    toast.error('Failed to update meal');
    throw error;
  }
};

// Delete a meal
export const deleteMeal = async (mealId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId);

    if (error) {
      console.error('Error deleting meal:', error);
      toast.error('Failed to delete meal');
      throw error;
    }

    toast.success('Meal deleted successfully');
  } catch (error) {
    console.error('Error in deleteMeal:', error);
    toast.error('Failed to delete meal');
    throw error;
  }
};

// Get meal by ID
export const getMealById = async (mealId: string): Promise<Meal | null> => {
  try {
    const { data: meal, error } = await supabase
      .from('meals')
      .select('*')
      .eq('id', mealId)
      .single();

    if (error) {
      console.error('Error fetching meal:', error);
      return null;
    }

    return meal;
  } catch (error) {
    console.error('Error in getMealById:', error);
    return null;
  }
};

// Search meals by name
export const searchMeals = async (searchQuery: string): Promise<Meal[]> => {
  try {
    const { data: meals, error } = await supabase
      .from('meals')
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error searching meals:', error);
      toast.error('Failed to search meals');
      throw error;
    }

    return meals || [];
  } catch (error) {
    console.error('Error in searchMeals:', error);
    toast.error('Failed to search meals');
    throw error;
  }
};

// Get meals by menu ID
export const getMealsByMenuId = async (menuId: string): Promise<Meal[]> => {
  try {
    const { data: meals, error } = await supabase
      .from('meals')
      .select('*')
      .eq('menu_id', menuId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching meals by menu ID:', error);
      toast.error('Failed to fetch meals');
      throw error;
    }

    return meals || [];
  } catch (error) {
    console.error('Error in getMealsByMenuId:', error);
    toast.error('Failed to load meals');
    throw error;
  }
};

// Get meals by date (Note: meals table doesn't have date column, this function is deprecated)
export const getMealsByDate = async (date: string): Promise<Meal[]> => {
  try {
    // Since meals table doesn't have date column, return empty array or use menu date
    const { data: meals, error } = await supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching meals by date:', error);
      toast.error('Failed to fetch meals');
      throw error;
    }

    return meals || [];
  } catch (error) {
    console.error('Error in getMealsByDate:', error);
    toast.error('Failed to load meals');
    throw error;
  }
};