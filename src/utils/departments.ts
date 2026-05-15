import { apiFetch } from '@/utils/api-client';
import { toast } from '@/components/alert';
import { Department } from '@/types/department';

export const getAllDepartments = async (): Promise<Department[]> => {
  try {
    return await apiFetch<Department[]>('/api/departments');
  } catch (error) {
    console.error('Error in getAllDepartments:', error);
    toast.error('Failed to load departments');
    throw error;
  }
};

export const createDepartment = async (departmentData: {
  name: string;
}): Promise<Department> => {
  try {
    const data = await apiFetch<Department>('/api/departments', {
      method: 'POST',
      body: JSON.stringify({ name: departmentData.name }),
    });
    toast.success('Department created successfully');
    return data;
  } catch (error) {
    console.error('Error in createDepartment:', error);
    const message = error instanceof Error ? error.message : 'Failed to create department';
    toast.error(message);
    throw error;
  }
};

export const updateDepartment = async (
  departmentId: string,
  departmentData: { name?: string }
): Promise<Department> => {
  try {
    if (departmentData.name === undefined) {
      const d = await getDepartmentById(departmentId);
      if (!d) throw new Error('Department not found');
      return d;
    }
    const data = await apiFetch<Department>(`/api/departments/${departmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: departmentData.name }),
    });
    toast.success('Department updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateDepartment:', error);
    toast.error('Failed to update department');
    throw error;
  }
};

export const deleteDepartment = async (departmentId: string): Promise<void> => {
  try {
    await apiFetch<{ ok: boolean }>(`/api/departments/${departmentId}`, {
      method: 'DELETE',
    });
    toast.success('Department deleted successfully');
  } catch (error) {
    console.error('Error in deleteDepartment:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete department';
    toast.error(message);
    throw error;
  }
};

export const getDepartmentById = async (
  departmentId: string
): Promise<Department | null> => {
  try {
    return await apiFetch<Department>(`/api/departments/${departmentId}`);
  } catch {
    return null;
  }
};

export const searchDepartments = async (
  searchQuery: string
): Promise<Department[]> => {
  try {
    const q = new URLSearchParams({ q: searchQuery });
    return await apiFetch<Department[]>(`/api/departments?${q}`);
  } catch (error) {
    console.error('Error in searchDepartments:', error);
    throw error;
  }
};

export const checkDepartmentExists = async (
  name: string,
  excludeId?: string
): Promise<boolean> => {
  try {
    const q = new URLSearchParams({ name });
    if (excludeId) q.set('excludeId', excludeId);
    const { exists } = await apiFetch<{ exists: boolean }>(
      `/api/departments/check?${q}`
    );
    return exists;
  } catch (error) {
    console.error('Error in checkDepartmentExists:', error);
    return false;
  }
};
