import { create } from 'zustand';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { showToast } from '@/lib/toast';
import { generateDemoData, clearDemoData } from '@/lib/demoData';
import { AppStore } from '@/types/store';
import { Expense } from '@/types/database';

const DEFAULT_USER_ID = '63dca12f-937b-4760-8f7d-c50dafcaaef3';

export const useAppStore = create<AppStore>((set, get) => ({
  // Auth State (deprecated but kept for compatibility)
  user: null,
  profile: null,
  isLoggedIn: true,
  loading: false,

  setUser: (user) => set({ user, isLoggedIn: true }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  logout: async (clearData = false) => {
    console.log('Logout not available without authentication');
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
    const { items } = get();
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
        .eq('id', id)
        .eq('user_id', DEFAULT_USER_ID);

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
    try {
      await supabase.from('expenses').delete().eq('user_id', DEFAULT_USER_ID);
      set({ items: [] });
      showToast('All expenses cleared', 'success');
    } catch (error: any) {
      console.error('Clear expenses error:', error);
      showToast('Failed to clear expenses: ' + error.message, 'error');
    }
  },

  seedDemoData: async () => {
    try {
      set({ loading: true });

      // Generate and insert demo data
      const result = await generateDemoData(DEFAULT_USER_ID);

      // Reload expenses
      await get().loadExpenses();

      showToast(
        `Demo data added: ${result.expensesCount} expenses, ${result.incomeCount} income records`,
        'success'
      );
    } catch (error: any) {
      console.error('Seed demo data error:', error);
      showToast('Failed to seed demo data: ' + error.message, 'error');
    } finally {
      set({ loading: false });
    }
  },

  loadExpenses: async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .order('date', { ascending: false });

      if (error) throw error;

      set({ items: data || [] });
    } catch (error: any) {
      console.error('Load expenses error:', error);
      showToast('Failed to load expenses: ' + error.message, 'error');
    }
  },

  // UI State
  demoModeEnabled: false,

  setDemoMode: async (enabled: boolean) => {
    const { demoModeEnabled, items } = get();

    try {
      set({ loading: true });

      if (enabled) {
        // Enabling demo mode
        if (demoModeEnabled) {
          // Already in demo mode - offer to refresh
          const refresh = confirm('Demo mode is already enabled. Refresh demo data?');
          if (!refresh) {
            set({ loading: false });
            return;
          }

          // Clear existing demo data
          await clearDemoData(DEFAULT_USER_ID);
        } else {
          // Backup current real data (non-demo expenses)
          const realExpenses = items.filter((e) => e.imported_from !== 'demo');
          await storage.setJSON(STORAGE_KEYS.EXPENSES_BACKUP, realExpenses);
        }

        // Seed demo data
        await get().seedDemoData();
        await storage.setJSON(STORAGE_KEYS.DEMO_MODE, true);
        set({ demoModeEnabled: true });

      } else {
        // Disabling demo mode
        await clearDemoData(DEFAULT_USER_ID);

        // Restore backed up data
        const backup = await storage.getJSON<Expense[]>(STORAGE_KEYS.EXPENSES_BACKUP);

        if (backup && backup.length > 0) {
          // Restore real expenses
          const { error } = await supabase.from('expenses').insert(backup);
          if (error) throw error;
        }

        await storage.remove(STORAGE_KEYS.EXPENSES_BACKUP);
        await storage.remove(STORAGE_KEYS.DEMO_MODE);

        await get().loadExpenses();
        set({ demoModeEnabled: false });

        showToast('Demo mode disabled, real data restored', 'success');
      }
    } catch (error: any) {
      console.error('Toggle demo mode error:', error);
      showToast('Failed to toggle demo mode: ' + error.message, 'error');
    } finally {
      set({ loading: false });
    }
  },

  showToast: (message: string, type = 'info' as const) => {
    showToast(message, type);
  },
}));

// Initialize demo mode state from storage on app start
storage.getJSON<boolean>(STORAGE_KEYS.DEMO_MODE).then((enabled) => {
  if (enabled) {
    useAppStore.setState({ demoModeEnabled: true });
  }
});
