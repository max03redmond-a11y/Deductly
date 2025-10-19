import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Expense, IncomeRecord, MileageLog, Profile, Asset, Referral } from '@/types/database';
import {
  calculateSummaryTotals,
  calculateCategoryTotals,
  getYTDFilter,
  PeriodFilter,
} from '@/lib/calcs/summary';
import { calculateTaxEstimate, TaxEstimate } from '@/lib/calcs/tax';
import * as mutations from '@/lib/api/mutations';

export interface AppState {
  expenses: Expense[];
  income: IncomeRecord[];
  mileage: MileageLog[];
  assets: Asset[];
  referrals: Referral[];
  profile: Profile | null;
  userId: string | null;
  loading: boolean;
  initialized: boolean;

  setExpenses: (expenses: Expense[]) => void;
  setIncome: (income: IncomeRecord[]) => void;
  setMileage: (mileage: MileageLog[]) => void;
  setAssets: (assets: Asset[]) => void;
  setReferrals: (referrals: Referral[]) => void;
  setProfile: (profile: Profile | null) => void;
  setUserId: (userId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;

  upsertExpense: (expense: Partial<Expense> & { id?: string }) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  upsertIncome: (income: Partial<IncomeRecord> & { id?: string }) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  upsertMileage: (mileage: Partial<MileageLog> & { id?: string }) => Promise<void>;
  deleteMileage: (id: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;

  loadAllData: () => Promise<void>;
  subscribeToRealtime: () => () => void;
}

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export const useAppState = create<AppState>((set, get) => ({
  expenses: [],
  income: [],
  mileage: [],
  assets: [],
  referrals: [],
  profile: null,
  userId: DEFAULT_USER_ID,
  loading: false,
  initialized: false,

  setExpenses: (expenses) => set({ expenses }),
  setIncome: (income) => set({ income }),
  setMileage: (mileage) => set({ mileage }),
  setAssets: (assets) => set({ assets }),
  setReferrals: (referrals) => set({ referrals }),
  setProfile: (profile) => set({ profile }),
  setUserId: (userId) => set({ userId }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  upsertExpense: async (expense) => {
    const { userId, expenses } = get();
    if (!userId) return;

    const optimisticExpense = {
      ...expense,
      user_id: userId,
      id: expense.id || crypto.randomUUID(),
      created_at: expense.id ? undefined : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Expense;

    if (expense.id) {
      set({
        expenses: expenses.map((e) =>
          e.id === expense.id ? { ...e, ...optimisticExpense } : e
        ),
      });
    } else {
      set({ expenses: [optimisticExpense, ...expenses] });
    }

    const result = await mutations.upsertExpense({ ...expense, user_id: userId });

    if (result.error) {
      console.error('Failed to upsert expense:', result.error);
      if (!expense.id) {
        set({ expenses: expenses.filter((e) => e.id !== optimisticExpense.id) });
      } else {
        const original = expenses.find((e) => e.id === expense.id);
        if (original) {
          set({
            expenses: expenses.map((e) => (e.id === expense.id ? original : e)),
          });
        }
      }
    } else if (result.data) {
      set({
        expenses: expense.id
          ? expenses.map((e) => (e.id === result.data!.id ? result.data! : e))
          : [result.data, ...expenses.filter((e) => e.id !== optimisticExpense.id)],
      });
    }
  },

  deleteExpense: async (id) => {
    const { userId, expenses } = get();
    if (!userId) return;

    const original = expenses.find((e) => e.id === id);
    set({ expenses: expenses.filter((e) => e.id !== id) });

    const result = await mutations.deleteExpense(id, userId);

    if (result.error && original) {
      console.error('Failed to delete expense:', result.error);
      set({ expenses: [original, ...expenses] });
    }
  },

  upsertIncome: async (incomeRecord) => {
    const { userId, income } = get();
    if (!userId) return;

    const optimisticIncome = {
      ...incomeRecord,
      user_id: userId,
      id: incomeRecord.id || crypto.randomUUID(),
      created_at: incomeRecord.id ? undefined : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as IncomeRecord;

    if (incomeRecord.id) {
      set({
        income: income.map((i) =>
          i.id === incomeRecord.id ? { ...i, ...optimisticIncome } : i
        ),
      });
    } else {
      set({ income: [optimisticIncome, ...income] });
    }

    const result = await mutations.upsertIncome({ ...incomeRecord, user_id: userId });

    if (result.error) {
      console.error('Failed to upsert income:', result.error);
      if (!incomeRecord.id) {
        set({ income: income.filter((i) => i.id !== optimisticIncome.id) });
      } else {
        const original = income.find((i) => i.id === incomeRecord.id);
        if (original) {
          set({
            income: income.map((i) => (i.id === incomeRecord.id ? original : i)),
          });
        }
      }
    } else if (result.data) {
      set({
        income: incomeRecord.id
          ? income.map((i) => (i.id === result.data!.id ? result.data! : i))
          : [result.data, ...income.filter((i) => i.id !== optimisticIncome.id)],
      });
    }
  },

  deleteIncome: async (id) => {
    const { userId, income } = get();
    if (!userId) return;

    const original = income.find((i) => i.id === id);
    set({ income: income.filter((i) => i.id !== id) });

    const result = await mutations.deleteIncome(id, userId);

    if (result.error && original) {
      console.error('Failed to delete income:', result.error);
      set({ income: [original, ...income] });
    }
  },

  upsertMileage: async (mileageRecord) => {
    const { userId, mileage } = get();
    if (!userId) return;

    const optimisticMileage = {
      ...mileageRecord,
      user_id: userId,
      id: mileageRecord.id || crypto.randomUUID(),
      created_at: mileageRecord.id ? undefined : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as MileageLog;

    if (mileageRecord.id) {
      set({
        mileage: mileage.map((m) =>
          m.id === mileageRecord.id ? { ...m, ...optimisticMileage } : m
        ),
      });
    } else {
      set({ mileage: [optimisticMileage, ...mileage] });
    }

    const result = await mutations.upsertMileage({ ...mileageRecord, user_id: userId });

    if (result.error) {
      console.error('Failed to upsert mileage:', result.error);
      if (!mileageRecord.id) {
        set({ mileage: mileage.filter((m) => m.id !== optimisticMileage.id) });
      } else {
        const original = mileage.find((m) => m.id === mileageRecord.id);
        if (original) {
          set({
            mileage: mileage.map((m) => (m.id === mileageRecord.id ? original : m)),
          });
        }
      }
    } else if (result.data) {
      set({
        mileage: mileageRecord.id
          ? mileage.map((m) => (m.id === result.data!.id ? result.data! : m))
          : [result.data, ...mileage.filter((m) => m.id !== optimisticMileage.id)],
      });
    }
  },

  deleteMileage: async (id) => {
    const { userId, mileage } = get();
    if (!userId) return;

    const original = mileage.find((m) => m.id === id);
    set({ mileage: mileage.filter((m) => m.id !== id) });

    const result = await mutations.deleteMileage(id, userId);

    if (result.error && original) {
      console.error('Failed to delete mileage:', result.error);
      set({ mileage: [original, ...mileage] });
    }
  },

  updateProfile: async (updates) => {
    const { userId, profile } = get();
    if (!userId || !profile) return;

    const optimisticProfile = { ...profile, ...updates };
    set({ profile: optimisticProfile });

    const result = await mutations.updateProfile(userId, updates);

    if (result.error) {
      console.error('Failed to update profile:', result.error);
      set({ profile });
    } else if (result.data) {
      set({ profile: result.data });
    }
  },

  loadAllData: async () => {
    const { userId } = get();
    if (!userId) return;

    set({ loading: true });

    const [expensesRes, incomeRes, mileageRes, assetsRes, profileRes, referralsRes] =
      await Promise.all([
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false }),
        supabase
          .from('income_records')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false }),
        supabase
          .from('mileage_logs')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false }),
        supabase
          .from('assets')
          .select('*')
          .eq('user_id', userId)
          .order('purchase_date', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase
          .from('referrals')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
      ]);

    set({
      expenses: expensesRes.data || [],
      income: incomeRes.data || [],
      mileage: mileageRes.data || [],
      assets: assetsRes.data || [],
      profile: profileRes.data || null,
      referrals: referralsRes.data || [],
      loading: false,
      initialized: true,
    });
  },

  subscribeToRealtime: () => {
    const userId = get().userId;
    if (!userId) return () => {};

    const handleExpenseChange = async () => {
      const currentUserId = get().userId;
      if (!currentUserId) return;

      const { data } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', currentUserId)
        .order('date', { ascending: false });
      if (data) set({ expenses: data });
    };

    const handleIncomeChange = async () => {
      const currentUserId = get().userId;
      if (!currentUserId) return;

      const { data } = await supabase
        .from('income_records')
        .select('*')
        .eq('user_id', currentUserId)
        .order('date', { ascending: false });
      if (data) set({ income: data });
    };

    const handleMileageChange = async () => {
      const currentUserId = get().userId;
      if (!currentUserId) return;

      const { data } = await supabase
        .from('mileage_logs')
        .select('*')
        .eq('user_id', currentUserId)
        .order('date', { ascending: false });
      if (data) set({ mileage: data });
    };

    const expensesChannel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${userId}` },
        handleExpenseChange
      )
      .subscribe();

    const incomeChannel = supabase
      .channel('income-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'income_records', filter: `user_id=eq.${userId}` },
        handleIncomeChange
      )
      .subscribe();

    const mileageChannel = supabase
      .channel('mileage-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mileage_logs', filter: `user_id=eq.${userId}` },
        handleMileageChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(expensesChannel);
      supabase.removeChannel(incomeChannel);
      supabase.removeChannel(mileageChannel);
    };
  },
}));

export function useSummaryTotals(filter?: PeriodFilter) {
  const expenses = useAppState((state) => state.expenses);
  const income = useAppState((state) => state.income);
  const mileage = useAppState((state) => state.mileage);

  return calculateSummaryTotals(expenses, income, mileage, filter);
}

export function useCategoryTotals(filter?: PeriodFilter) {
  const expenses = useAppState((state) => state.expenses);
  return calculateCategoryTotals(expenses, filter);
}

export function useTaxEstimate(filter?: PeriodFilter): TaxEstimate {
  const expenses = useAppState((state) => state.expenses);
  const income = useAppState((state) => state.income);
  const mileage = useAppState((state) => state.mileage);
  const assets = useAppState((state) => state.assets);
  const profile = useAppState((state) => state.profile);

  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  return calculateTaxEstimate(expenses, totalIncome, mileage, assets, profile, filter);
}

export const useYTDTotals = () => useSummaryTotals(getYTDFilter());
export const useYTDTaxEstimate = () => useTaxEstimate(getYTDFilter());
