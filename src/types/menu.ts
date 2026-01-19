// Menu related types matching Supabase schema

export type MenuStatus = 'active' | 'completed' | 'upcoming';

export interface Menu {
  id: string;
  name: string;
  date: string;
  deadline: string;
  status: MenuStatus;
  todays_special?: string | null; // Make nullable to avoid foreign key constraint
  meals?: MenuMeal[]; // Array of meals in this menu
  created_at?: string;
}

export interface MenuMeal {
  id: string;
  name: string;
  description: string;
  menu_id: string;
  created_at?: string;
}

export interface MenuFormData {
  name: string;
  date: string;
  deadline: string;
  status: MenuStatus;
}

