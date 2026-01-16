import type { Selection } from '@/types';

export const getUniqueMeals = (selections: Selection[]): string[] => {
  return ['All Meals', ...Array.from(new Set(selections.map(s => s.mealName)))];
};

export const filterSelections = (
  selections: Selection[],
  searchQuery: string,
  mealFilter: string,
  statusFilter: string
): Selection[] => {
  return selections.filter(selection => {
    const matchesSearch = selection.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         selection.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMeal = mealFilter === 'All Meals' || selection.mealName === mealFilter;
    const matchesStatus = statusFilter === 'All' || 
                         (statusFilter === 'Yes' && selection.optedIn) ||
                         (statusFilter === 'No' && !selection.optedIn);
    return matchesSearch && matchesMeal && matchesStatus;
  });
};

export const getSelectionCounts = (selections: Selection[]) => {
  const optedInCount = selections.filter(s => s.optedIn).length;
  const skippedCount = selections.filter(s => !s.optedIn).length;
  return { optedInCount, skippedCount };
};
