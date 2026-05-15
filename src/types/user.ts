// User related types

export interface User {
  id: string;
  name: string;
  department: string;
  can_self_opt_in: boolean;
}

export interface UserSelectionData {
  user: User;
  optIn: boolean;
}
