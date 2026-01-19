// Selection related types matching Supabase schema
import type { User } from './user';

export interface Selection {
  id: string;
  user_id: string;
  meal_id: string;
  opted_in: boolean;
  created_at?: string;
}

// Extended Selection type for UI display with joined data
export interface SelectionDisplay {
  id: string;
  userName: string;
  department: string;
  mealName: string;
  mealDate: string;
  optedIn: boolean;
  menuName?: string;
}

export interface SelectionFormData {
  user_id: string;
  meal_id: string;
  opted_in: boolean;
}

// Meal selection tracking types
export interface MealSelection {
  mealId: string;
  optIn: boolean | null;
}

export interface UserMealSelections {
  userId: string;
  meals: MealSelection[];
}

export interface UserMealSelectionsWithUser {
  userId: string;
  user: User;
  meals: MealSelection[];
}
