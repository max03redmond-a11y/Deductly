import { create } from 'zustand';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { AppStore } from '@/types/store';
import { Expense, IncomeEntry } from '@/types/database';

export const useAppStore = create<AppStore>((set, get) => ({
  // Auth State
  user: null,
  profile: null,
  isLoggedIn: false,
  loading: true,

  setUser: (user) => set({ user, isLoggedIn: !!user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  logout: async (clearData = false) => {
    try {
      await supabase.auth.signOut();
      set({ user: null, profile: null, isLoggedIn: false, items: [], incomeEntries: [] });
      router.replace('/auth/sign-in');
    } catch (error: any) {
      console.error('Logout error:', error);
      showToast('Failed to logout: ' + error.message, 'error');
    }
  },

  // Expenses State
  items: [],

  setExpenses: (expenses) => set({ items: expenses }),

  addExpense: (expense) => {
    set((state) => ({
      items: [expense, ...state.items],
    }));
  },

  removeExpense: async (id: string) => {
    const { items, user } = get();
    if (!user) {
      showToast('Please login to delete expenses', 'error');
      return false;
    }

    const expenseToDelete = items.find((e) => e.id === id);

    if (!expenseToDelete) {
      showToast('Expense not found', 'error');
      return false;
    }

    // Optimistic update
    const previousItems = [...items];
    set({ items: items.filter((e) => e.id !== id) });

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('Expense deleted', 'success');
      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      // Rollback on failure
      set({ items: previousItems });
      showToast('Failed to delete expense: ' + error.message, 'error');
      return false;
    }
  },

  clearExpenses: async () => {
    const { user } = get();
    if (!user) {
      showToast('Please login to clear expenses', 'error');
      return;
    }

    try {
      await supabase.from('expenses').delete().eq('user_id', user.id);
      set({ items: [] });
      showToast('All expenses cleared', 'success');
    } catch (error: any) {
      console.error('Clear expenses error:', error);
      showToast('Failed to clear expenses: ' + error.message, 'error');
    }
  },

  loadExpenses: async () => {
    const { user } = get();
    if (!user) {
      set({ items: [] });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      set({ items: data || [] });
    } catch (error: any) {
      console.error('Load expenses error:', error);
      showToast('Failed to load expenses: ' + error.message, 'error');
    }
  },

  // Income State
  incomeEntries: [],

  setIncomeEntries: (entries) => set({ incomeEntries: entries }),

  addIncomeEntry: (entry) => {
    set((state) => ({
      incomeEntries: [entry, ...state.incomeEntries],
    }));
  },

  removeIncomeEntry: async (id: string) => {
    const { incomeEntries, user } = get();
    if (!user) {
      showToast('Please login to delete income entries', 'error');
      return false;
    }

    const entryToDelete = incomeEntries.find((e) => e.id === id);

    if (!entryToDelete) {
      showToast('Income entry not found', 'error');
      return false;
    }

    // Optimistic update
    const previousEntries = [...incomeEntries];
    set({ incomeEntries: incomeEntries.filter((e) => e.id !== id) });

    try {
      const { error } = await supabase
        .from('income_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('Income entry deleted', 'success');
      return true;
    } catch (error: any) {
      console.error('Delete income error:', error);
      // Rollback on failure
      set({ incomeEntries: previousEntries });
      showToast('Failed to delete income entry: ' + error.message, 'error');
      return false;
    }
  },

  loadIncomeEntries: async () => {
    const { user } = get();
    if (!user) {
      set({ incomeEntries: [] });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('income_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      set({ incomeEntries: data || [] });
    } catch (error: any) {
      console.error('Load income entries error:', error);
      showToast('Failed to load income entries: ' + error.message, 'error');
    }
  },

  // UI State
  showToast: (message: string, type = 'info' as const) => {
    showToast(message, type);
  },
}));
