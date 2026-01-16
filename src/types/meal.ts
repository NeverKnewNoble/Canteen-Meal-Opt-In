// Meal related types

export interface Meal {
  id: string;
  name: string;
  description: string;
  time: string;
  spots: number;
  totalSpots: number;
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
