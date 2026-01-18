import { supabase } from '@/lib/supabase';
import { toast } from '@/components/alert';
import type { Selection, SelectionFormData } from '@/types/selection';

// Get all selections
export const getAllSelections = async (): Promise<Selection[]> => {
  try {
    const { data: selections, error } = await supabase
      .from('selections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching selections:', error);
      toast.error('Failed to fetch selections');
      throw error;
    }

    return selections || [];
  } catch (error) {
    console.error('Error in getAllSelections:', error);
    toast.error('Failed to load selections');
    throw error;
  }
};

// Create a new selection
export const createSelection = async (selectionData: SelectionFormData): Promise<Selection> => {
  try {
    const { data, error } = await supabase
      .from('selections')
      .insert([
        {
          user_id: selectionData.user_id,
          meal_id: selectionData.meal_id,
          opted_in: selectionData.opted_in,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating selection:', error);
      toast.error('Failed to create selection');
      throw error;
    }

    toast.success('Selection created successfully');
    return data;
  } catch (error) {
    console.error('Error in createSelection:', error);
    toast.error('Failed to create selection');
    throw error;
  }
};

// Edit/update a selection
export const updateSelection = async (selectionId: string, selectionData: Partial<SelectionFormData>): Promise<Selection> => {
  try {
    const updateData: any = {};

    if (selectionData.user_id !== undefined) updateData.user_id = selectionData.user_id;
    if (selectionData.meal_id !== undefined) updateData.meal_id = selectionData.meal_id;
    if (selectionData.opted_in !== undefined) updateData.opted_in = selectionData.opted_in;

    const { data, error } = await supabase
      .from('selections')
      .update(updateData)
      .eq('id', selectionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating selection:', error);
      toast.error('Failed to update selection');
      throw error;
    }

    toast.success('Selection updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateSelection:', error);
    toast.error('Failed to update selection');
    throw error;
  }
};

// Delete a selection
export const deleteSelection = async (selectionId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('selections')
      .delete()
      .eq('id', selectionId);

    if (error) {
      console.error('Error deleting selection:', error);
      toast.error('Failed to delete selection');
      throw error;
    }

    toast.success('Selection deleted successfully');
  } catch (error) {
    console.error('Error in deleteSelection:', error);
    toast.error('Failed to delete selection');
    throw error;
  }
};

// Get selections by user ID
export const getSelectionsByUserId = async (userId: string): Promise<Selection[]> => {
  try {
    const { data: selections, error } = await supabase
      .from('selections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching selections by user ID:', error);
      toast.error('Failed to fetch user selections');
      throw error;
    }

    return selections || [];
  } catch (error) {
    console.error('Error in getSelectionsByUserId:', error);
    toast.error('Failed to load user selections');
    throw error;
  }
};

// Get selections by meal ID
export const getSelectionsByMealId = async (mealId: string): Promise<Selection[]> => {
  try {
    const { data: selections, error } = await supabase
      .from('selections')
      .select('*')
      .eq('meal_id', mealId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching selections by meal ID:', error);
      toast.error('Failed to fetch meal selections');
      throw error;
    }

    return selections || [];
  } catch (error) {
    console.error('Error in getSelectionsByMealId:', error);
    toast.error('Failed to load meal selections');
    throw error;
  }
};