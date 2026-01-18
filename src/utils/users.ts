import { supabase } from '@/lib/supabase';
import { toast } from '@/components/alert';
import type { User } from '@/types';

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      throw error;
    }

    return users || [];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    toast.error('Failed to load users');
    throw error;
  }
};

// Create a new user
export const createUser = async (userData: {
  name: string;
  department: string;
}): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: userData.name,
          department: userData.department,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
      throw error;
    }

    toast.success('User created successfully');
    return data;
  } catch (error) {
    console.error('Error in createUser:', error);
    toast.error('Failed to create user');
    throw error;
  }
};

// Edit/update a user
export const updateUser = async (userId: string, userData: {
  name?: string;
  department?: string;
}): Promise<User> => {
  try {
    const updateData: any = {};

    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.department !== undefined) updateData.department = userData.department;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
      throw error;
    }

    toast.success('User updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateUser:', error);
    toast.error('Failed to update user');
    throw error;
  }
};

// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      throw error;
    }

    toast.success('User deleted successfully');
  } catch (error) {
    console.error('Error in deleteUser:', error);
    toast.error('Failed to delete user');
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
};

// Get users by department
export const getUsersByDepartment = async (department: string): Promise<User[]> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('department', department)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users by department:', error);
      throw error;
    }

    return users || [];
  } catch (error) {
    console.error('Error in getUsersByDepartment:', error);
    throw error;
  }
};

// Search users by name
export const searchUsers = async (searchQuery: string): Promise<User[]> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${searchQuery}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
      throw error;
    }

    return users || [];
  } catch (error) {
    console.error('Error in searchUsers:', error);
    toast.error('Failed to search users');
    throw error;
  }
};