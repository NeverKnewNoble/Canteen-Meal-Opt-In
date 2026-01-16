// User related types

export interface User {
  id: string;
  name: string;
  department: string;
}

export interface UserSelectionData {
  user: User;
  optIn: boolean;
}
