import { supabase } from '@/lib/supabase';
import { Expense, IncomeRecord, MileageLog, Profile } from '@/types/database';
import { showToast } from '@/lib/toast';

export interface MutationResult<T> {
  data: T | null;
  error: Error | null;
}

export async function upsertExpense(
  expense: Partial<Expense> & { id?: string; user_id: string }
): Promise<MutationResult<Expense>> {
  try {
    const isUpdate = !!expense.id;

    const payload = {
      ...expense,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = isUpdate
      ? await supabase
          .from('expenses')
          .update(payload)
          .eq('id', expense.id!)
          .select()
          .single()
      : await supabase
          .from('expenses')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select()
          .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Upsert expense error:', error);
    return { data: null, error };
  }
}

export async function deleteExpense(
  id: string,
  userId: string
): Promise<MutationResult<void>> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return { data: null, error: null };
  } catch (error: any) {
    console.error('Delete expense error:', error);
    return { data: null, error };
  }
}

export async function upsertIncome(
  income: Partial<IncomeRecord> & { id?: string; user_id: string }
): Promise<MutationResult<IncomeRecord>> {
  try {
    const isUpdate = !!income.id;

    const payload = {
      ...income,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = isUpdate
      ? await supabase
          .from('income_records')
          .update(payload)
          .eq('id', income.id!)
          .select()
          .single()
      : await supabase
          .from('income_records')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select()
          .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Upsert income error:', error);
    return { data: null, error };
  }
}

export async function deleteIncome(
  id: string,
  userId: string
): Promise<MutationResult<void>> {
  try {
    const { error } = await supabase
      .from('income_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return { data: null, error: null };
  } catch (error: any) {
    console.error('Delete income error:', error);
    return { data: null, error };
  }
}

export async function upsertMileage(
  mileage: Partial<MileageLog> & { id?: string; user_id: string }
): Promise<MutationResult<MileageLog>> {
  try {
    const isUpdate = !!mileage.id;

    const payload = {
      ...mileage,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = isUpdate
      ? await supabase
          .from('mileage_logs')
          .update(payload)
          .eq('id', mileage.id!)
          .select()
          .single()
      : await supabase
          .from('mileage_logs')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select()
          .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Upsert mileage error:', error);
    return { data: null, error };
  }
}

export async function deleteMileage(
  id: string,
  userId: string
): Promise<MutationResult<void>> {
  try {
    const { error } = await supabase
      .from('mileage_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return { data: null, error: null };
  } catch (error: any) {
    console.error('Delete mileage error:', error);
    return { data: null, error };
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<MutationResult<Profile>> {
  try {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { data: null, error };
  }
}

export async function bulkDeleteExpenses(
  ids: string[],
  userId: string
): Promise<MutationResult<void>> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .in('id', ids)
      .eq('user_id', userId);

    if (error) throw error;

    return { data: null, error: null };
  } catch (error: any) {
    console.error('Bulk delete expenses error:', error);
    return { data: null, error };
  }
}
