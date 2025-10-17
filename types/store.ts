import { User } from '@supabase/supabase-js';
import { Profile, Expense, IncomeRecord } from './database';

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoggedIn: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: (clearData?: boolean) => Promise<void>;
}

export interface ExpensesState {
  items: Expense[];
  loading: boolean;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => Promise<boolean>;
  clearExpenses: () => Promise<void>;
  seedDemoData: () => Promise<void>;
  loadExpenses: () => Promise<void>;
}

export interface UIState {
  demoModeEnabled: boolean;
  setDemoMode: (enabled: boolean) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export interface AppStore extends AuthState, ExpensesState, UIState {}
