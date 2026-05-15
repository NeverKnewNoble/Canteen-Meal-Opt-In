import { apiFetch } from '@/utils/api-client';
import { toast } from '@/components/alert';
import type { User } from '@/types';

export const getAllUsers = async (): Promise<User[]> => {
  try {
    return await apiFetch<User[]>('/api/users');
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    toast.error('Failed to load users');
    throw error;
  }
};

export const createUser = async (userData: {
  name: string;
  department: string;
}): Promise<User> => {
  try {
    const data = await apiFetch<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: userData.name,
        department: userData.department,
      }),
    });
    toast.success('User created successfully');
    return data;
  } catch (error) {
    console.error('Error in createUser:', error);
    toast.error('Failed to create user');
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  userData: { name?: string; department?: string; can_self_opt_in?: boolean }
): Promise<User> => {
  try {
    const data = await apiFetch<User>(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
    toast.success('User updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateUser:', error);
    toast.error('Failed to update user');
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await apiFetch<{ ok: boolean }>(`/api/users/${userId}`, { method: 'DELETE' });
    toast.success('User deleted successfully');
  } catch (error) {
    console.error('Error in deleteUser:', error);
    toast.error('Failed to delete user');
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    return await apiFetch<User>(`/api/users/${userId}`);
  } catch {
    return null;
  }
};

export const getUsersByDepartment = async (
  department: string
): Promise<User[]> => {
  try {
    const q = new URLSearchParams({ department });
    return await apiFetch<User[]>(`/api/users?${q}`);
  } catch (error) {
    console.error('Error in getUsersByDepartment:', error);
    throw error;
  }
};

export const searchUsers = async (searchQuery: string): Promise<User[]> => {
  try {
    const q = new URLSearchParams({ search: searchQuery });
    return await apiFetch<User[]>(`/api/users?${q}`);
  } catch (error) {
    console.error('Error in searchUsers:', error);
    toast.error('Failed to search users');
    throw error;
  }
};
