import { supabase } from '@/lib/supabase';
import { toast } from '@/components/alert';

// Define Department type (you may want to move this to your types file)
export interface Department {
  id: string;
  name: string;
  created_at: string;
}

// Get all departments
export const getAllDepartments = async (): Promise<Department[]> => {
  try {
    const { data: departments, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
      throw error;
    }

    return departments || [];
  } catch (error) {
    console.error('Error in getAllDepartments:', error);
    toast.error('Failed to load departments');
    throw error;
  }
};

// Create a new department
export const createDepartment = async (departmentData: {
  name: string;
}): Promise<Department> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .insert([
        {
          name: departmentData.name,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating department:', error);
      toast.error('Failed to create department');
      throw error;
    }

    toast.success('Department created successfully');
    return data;
  } catch (error) {
    console.error('Error in createDepartment:', error);
    toast.error('Failed to create department');
    throw error;
  }
};

// Edit/update a department
export const updateDepartment = async (departmentId: string, departmentData: {
  name?: string;
}): Promise<Department> => {
  try {
    const updateData: any = {};

    if (departmentData.name !== undefined) updateData.name = departmentData.name;

    const { data, error } = await supabase
      .from('departments')
      .update(updateData)
      .eq('id', departmentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating department:', error);
      toast.error('Failed to update department');
      throw error;
    }

    toast.success('Department updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateDepartment:', error);
    toast.error('Failed to update department');
    throw error;
  }
};

// Delete a department
export const deleteDepartment = async (departmentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', departmentId);

    if (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
      throw error;
    }

    toast.success('Department deleted successfully');
  } catch (error) {
    console.error('Error in deleteDepartment:', error);
    toast.error('Failed to delete department');
    throw error;
  }
};

// Get department by ID
export const getDepartmentById = async (departmentId: string): Promise<Department | null> => {
  try {
    const { data: department, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', departmentId)
      .single();

    if (error) {
      console.error('Error fetching department:', error);
      return null;
    }

    return department;
  } catch (error) {
    console.error('Error in getDepartmentById:', error);
    return null;
  }
};

// Search departments by name
export const searchDepartments = async (searchQuery: string): Promise<Department[]> => {
  try {
    const { data: departments, error } = await supabase
      .from('departments')
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error searching departments:', error);
      throw error;
    }

    return departments || [];
  } catch (error) {
    console.error('Error in searchDepartments:', error);
    throw error;
  }
};

// Check if department name already exists
export const checkDepartmentExists = async (name: string, excludeId?: string): Promise<boolean> => {
  try {
    let query = supabase
      .from('departments')
      .select('id')
      .ilike('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking department existence:', error);
      return false;
    }

    return (data && data.length > 0) || false;
  } catch (error) {
    console.error('Error in checkDepartmentExists:', error);
    return false;
  }
};