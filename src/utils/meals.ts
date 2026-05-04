import { apiFetch } from '@/utils/api-client';
import { toast } from '@/components/alert';
import type { Meal, MealFormData } from '@/types/meal';

export const getAllMeals = async (): Promise<Meal[]> => {
  try {
    return await apiFetch<Meal[]>('/api/meals');
  } catch (error) {
    console.error('Error in getAllMeals:', error);
    toast.error('Failed to load meals');
    throw error;
  }
};

export const createMeal = async (mealData: MealFormData): Promise<Meal> => {
  try {
    const data = await apiFetch<Meal>('/api/meals', {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
    toast.success('Meal created successfully');
    return data;
  } catch (error) {
    console.error('Error in createMeal:', error);
    toast.error('Failed to create meal');
    throw error;
  }
};

export const updateMeal = async (
  mealId: string,
  mealData: Partial<MealFormData>
): Promise<Meal> => {
  try {
    const data = await apiFetch<Meal>(`/api/meals/${mealId}`, {
      method: 'PATCH',
      body: JSON.stringify(mealData),
    });
    toast.success('Meal updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateMeal:', error);
    toast.error('Failed to update meal');
    throw error;
  }
};

export const deleteMeal = async (mealId: string): Promise<void> => {
  try {
    await apiFetch<{ ok: boolean }>(`/api/meals/${mealId}`, { method: 'DELETE' });
    toast.success('Meal deleted successfully');
  } catch (error) {
    console.error('Error in deleteMeal:', error);
    toast.error('Failed to delete meal');
    throw error;
  }
};

export const getMealById = async (mealId: string): Promise<Meal | null> => {
  try {
    return await apiFetch<Meal>(`/api/meals/${mealId}`);
  } catch {
    return null;
  }
};

export const searchMeals = async (searchQuery: string): Promise<Meal[]> => {
  try {
    const q = new URLSearchParams({ search: searchQuery });
    return await apiFetch<Meal[]>(`/api/meals?${q}`);
  } catch (error) {
    console.error('Error in searchMeals:', error);
    toast.error('Failed to search meals');
    throw error;
  }
};

export const getMealsByMenuId = async (menuId: string): Promise<Meal[]> => {
  try {
    const q = new URLSearchParams({ menuId });
    return await apiFetch<Meal[]>(`/api/meals?${q}`);
  } catch (error) {
    console.error('Error in getMealsByMenuId:', error);
    toast.error('Failed to load meals');
    throw error;
  }
};

export const getMealsByDate = async (_date: string): Promise<Meal[]> => {
  try {
    return await apiFetch<Meal[]>('/api/meals');
  } catch (error) {
    console.error('Error in getMealsByDate:', error);
    toast.error('Failed to load meals');
    throw error;
  }
};
