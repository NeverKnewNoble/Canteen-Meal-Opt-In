import type { Meal, User, UserSelection } from '@/types';

export const updateUserSelection = (
  userSelections: UserSelection[],
  userId: string,
  optIn: boolean | null
): UserSelection[] => {
  return userSelections.map(selection =>
    selection.userId === userId ? { ...selection, optIn } : selection
  );
};

export const initializeUserSelections = (users: User[]): UserSelection[] => {
  return users.map(user => ({ userId: user.id, optIn: null }));
};

export const areAllSelectionsComplete = (userSelections: UserSelection[]): boolean => {
  return userSelections.every(selection => selection.optIn !== null);
};

export const getTomorrowMeal = (meals: Meal[]): Meal => {
  return { ...meals[0], name: "Rice with Chicken Curry" };
};
