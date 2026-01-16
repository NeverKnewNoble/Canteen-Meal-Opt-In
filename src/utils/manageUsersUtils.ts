import type { User } from '@/types';

export const filterUsers = (
  users: User[],
  searchQuery: string
): User[] => {
  return users.filter(user => {
    return user.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
};

export const createNewUser = (
  name: string,
  department: string,
  existingUsers: User[]
): User => {
  return {
    id: String(existingUsers.length + 1),
    name: name.trim(),
    department,
  };
};

export const isDepartmentValid = (
  departmentName: string,
  existingDepartments: string[]
): boolean => {
  return Boolean(departmentName.trim()) && !existingDepartments.includes(departmentName.trim());
};

export const isUserValid = (
  userName: string,
  userDepartment: string
): boolean => {
  return Boolean(userName.trim()) && Boolean(userDepartment);
};
