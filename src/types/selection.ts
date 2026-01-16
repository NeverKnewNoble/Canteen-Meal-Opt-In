// Selection related types

export interface Selection {
  id: string;
  userName: string;
  department: string;
  mealName: string;
  mealDate: string;
  optedIn: boolean;
}

export interface UserSelection {
  userId: string;
  optIn: boolean | null;
}
