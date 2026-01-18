import type { SelectionDisplay } from '@/types';

export const getUniqueMeals = (selections: SelectionDisplay[]): string[] => {
  return ['All Meals', ...Array.from(new Set(selections.map(s => s.mealName)))];
};

export const getUniqueMenus = (selections: SelectionDisplay[]): string[] => {
  return ['All Menus', ...Array.from(new Set(selections.map(s => s.menuName).filter((menu): menu is string => Boolean(menu))))];
};

export const filterSelections = (
  selections: SelectionDisplay[],
  searchQuery: string,
  mealFilter: string,
  statusFilter: string,
  menuFilter?: string
): SelectionDisplay[] => {
  return selections.filter(selection => {
    const matchesSearch = selection.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         selection.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMeal = mealFilter === 'All Meals' || selection.mealName === mealFilter;
    const matchesStatus = statusFilter === 'All' || 
                         (statusFilter === 'Yes' && selection.optedIn) ||
                         (statusFilter === 'No' && !selection.optedIn);
    const matchesMenu = !menuFilter || menuFilter === 'All Menus' || selection.menuName === menuFilter;
    return matchesSearch && matchesMeal && matchesStatus && matchesMenu;
  });
};

export const getSelectionCounts = (selections: SelectionDisplay[]) => {
  const optedInCount = selections.filter(s => s.optedIn).length;
  const skippedCount = selections.filter(s => !s.optedIn).length;
  return { optedInCount, skippedCount };
};
