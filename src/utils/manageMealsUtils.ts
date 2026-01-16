import type { AdminMeal, MealData } from '@/types';

export const filterMeals = (
  meals: AdminMeal[],
  searchQuery: string,
  statusFilter: string
): AdminMeal[] => {
  return meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || meal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
};

export const getStatusColor = (status: string): string => {
  switch(status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    case 'upcoming': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const createNewMeal = (
  mealData: MealData,
  existingMeals: AdminMeal[]
): AdminMeal => {
  return {
    id: String(existingMeals.length + 1),
    name: mealData.foodItemDescription,
    date: mealData.menuDate,
    deadline: `${mealData.submissionDeadlineDate} ${mealData.submissionDeadlineTime}`,
    status: 'upcoming'
  };
};
