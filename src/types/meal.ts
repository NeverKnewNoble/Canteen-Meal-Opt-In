// Meal related types

export interface Meal {
  id: string;
  name: string;
  description: string;
  menu_id: string;
  created_at?: string;
}

export interface MealFormData {
  name: string;
  description: string;
  menu_id: string;
}

export interface AdminMeal {
  id: string;
  name: string;
  date: string;
  deadline: string;
  status: 'active' | 'completed' | 'upcoming';
}

export interface UpcomingMeal {
  name: string;
  date: string;
  deadline: string;
  status: 'active' | 'upcoming';
}

export interface MealData {
  menuDate: string;
  foodItemDescription: string;
  submissionDeadlineDate: string;
  submissionDeadlineTime: string;
}
