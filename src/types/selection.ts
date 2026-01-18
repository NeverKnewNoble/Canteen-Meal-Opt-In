// Selection related types matching Supabase schema

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
