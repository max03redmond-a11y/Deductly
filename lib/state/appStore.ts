import { create } from 'zustand';
import { localDB } from '@/lib/localDatabase';
import { Expense, IncomeRecord, MileageLog, Profile, Asset, Referral } from '@/types/database';
import {
  calculateSummaryTotals,
  calculateCategoryTotals,
  getYTDFilter,
  PeriodFilter,
} from '@/lib/calcs/summary';
import { calculateTaxEstimate, TaxEstimate } from '@/lib/calcs/tax';

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
  clearAllData: () => Promise<void>;
  subscribeToRealtime: () => () => void;
}

const LOCAL_USER_ID = 'local-user';

export const useAppState = create<AppState>((set, get) => ({
  expenses: [],
  income: [],
  mileage: [],
  assets: [],
  referrals: [],
  profile: null,
  userId: LOCAL_USER_ID,
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
    const { expenses } = get();

    try {
      if (expense.id) {
        await localDB.updateExpense(expense.id, expense);
        const updated = await localDB.getExpenses();
        set({ expenses: updated });
      } else {
        const newExpense = await localDB.addExpense({
          user_id: LOCAL_USER_ID,
          date: expense.date || new Date().toISOString().split('T')[0],
          category: expense.category || 'other',
          merchant_name: expense.merchant_name || '',
          amount: expense.amount || 0,
          business_percentage: expense.business_percentage || 100,
          receipt_image_url: expense.receipt_image_url || null,
          notes: expense.notes || null,
          imported_from: expense.imported_from || null,
        });
        set({ expenses: [newExpense, ...expenses] });
      }
    } catch (error) {
      console.error('Failed to upsert expense:', error);
    }
  },

  deleteExpense: async (id) => {
    const { expenses } = get();
    try {
      await localDB.deleteExpense(id);
      set({ expenses: expenses.filter((e) => e.id !== id) });
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  },

  upsertIncome: async (incomeRecord) => {
    const { income } = get();

    try {
      const newIncome = await localDB.addIncome({
        user_id: LOCAL_USER_ID,
        date: incomeRecord.date || new Date().toISOString().split('T')[0],
        source: incomeRecord.source || '',
        amount: incomeRecord.amount || 0,
        trips_completed: incomeRecord.trips_completed || null,
        imported_from: incomeRecord.imported_from || null,
      });
      set({ income: [newIncome, ...income] });
    } catch (error) {
      console.error('Failed to upsert income:', error);
    }
  },

  deleteIncome: async (id) => {
    const { income } = get();
    try {
      await localDB.deleteIncome(id);
      set({ income: income.filter((i) => i.id !== id) });
    } catch (error) {
      console.error('Failed to delete income:', error);
    }
  },

  upsertMileage: async (mileageRecord) => {
    const { mileage } = get();

    try {
      const newMileage = await localDB.addMileage({
        user_id: LOCAL_USER_ID,
        date: mileageRecord.date || new Date().toISOString().split('T')[0],
        start_odometer: mileageRecord.start_odometer || 0,
        end_odometer: mileageRecord.end_odometer || 0,
        distance_km: mileageRecord.distance_km || 0,
        business_km: mileageRecord.business_km || 0,
        purpose: mileageRecord.purpose || null,
        is_business: mileageRecord.is_business ?? true,
      });
      set({ mileage: [newMileage, ...mileage] });
    } catch (error) {
      console.error('Failed to upsert mileage:', error);
    }
  },

  deleteMileage: async (id) => {
    const { mileage } = get();
    try {
      await localDB.deleteMileage(id);
      set({ mileage: mileage.filter((m) => m.id !== id) });
    } catch (error) {
      console.error('Failed to delete mileage:', error);
    }
  },

  updateProfile: async (updates) => {
    try {
      const updatedProfile = await localDB.saveProfile(updates);
      set({ profile: updatedProfile });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  },

  loadAllData: async () => {
    set({ loading: true });

    try {
      const [expenses, income, mileage, assets, profile] = await Promise.all([
        localDB.getExpenses(),
        localDB.getIncome(),
        localDB.getMileage(),
        localDB.getAssets(),
        localDB.getProfile(),
      ]);

      const defaultProfile: Profile = profile || {
        id: LOCAL_USER_ID,
        email: 'offline@local',
        full_name: 'Local User',
        business_name: null,
        province: null,
        vehicle_type: null,
        vehicle_year: null,
        vehicle_make: null,
        vehicle_model: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (!profile) {
        await localDB.saveProfile(defaultProfile);
      }

      set({
        expenses,
        income,
        mileage,
        assets,
        profile: defaultProfile,
        referrals: [],
        loading: false,
        initialized: true,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      set({ loading: false, initialized: true });
    }
  },

  clearAllData: async () => {
    try {
      await localDB.clearAllData();
      set({
        expenses: [],
        income: [],
        mileage: [],
        assets: [],
        referrals: [],
      });
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  },

  subscribeToRealtime: () => {
    return () => {};
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
