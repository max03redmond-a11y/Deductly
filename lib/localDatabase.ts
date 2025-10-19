import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, IncomeRecord, MileageLog, Asset, UserProfile } from '@/types/database';

const STORAGE_KEYS = {
  EXPENSES: '@deductly/expenses',
  INCOME: '@deductly/income',
  MILEAGE: '@deductly/mileage',
  ASSETS: '@deductly/assets',
  PROFILE: '@deductly/profile',
  MILEAGE_SETTINGS: '@deductly/mileageSettings',
  REFERRALS: '@deductly/referrals',
} as const;

export interface MileageSettings {
  id: string;
  year: number;
  jan1_odometer_km: number;
  current_odometer_km: number;
  manual_total_km_ytd: number | null;
  updated_at: string;
}

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const localDB = {
  async getExpenses(): Promise<Expense[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading expenses:', error);
      return [];
    }
  },

  async addExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
    const expenses = await this.getExpenses();
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expenses.push(newExpense);
    await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    return newExpense;
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    const expenses = await this.getExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses[index] = {
        ...expenses[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    }
  },

  async deleteExpense(id: string): Promise<void> {
    const expenses = await this.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
  },

  async getIncome(): Promise<IncomeRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.INCOME);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading income:', error);
      return [];
    }
  },

  async addIncome(income: Omit<IncomeRecord, 'id' | 'created_at' | 'updated_at'>): Promise<IncomeRecord> {
    const incomes = await this.getIncome();
    const newIncome: IncomeRecord = {
      ...income,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    incomes.push(newIncome);
    await AsyncStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(incomes));
    return newIncome;
  },

  async deleteIncome(id: string): Promise<void> {
    const incomes = await this.getIncome();
    const filtered = incomes.filter(i => i.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(filtered));
  },

  async getMileage(): Promise<MileageLog[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MILEAGE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading mileage:', error);
      return [];
    }
  },

  async addMileage(mileage: Omit<MileageLog, 'id' | 'created_at' | 'updated_at'>): Promise<MileageLog> {
    const mileages = await this.getMileage();
    const newMileage: MileageLog = {
      ...mileage,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mileages.push(newMileage);
    await AsyncStorage.setItem(STORAGE_KEYS.MILEAGE, JSON.stringify(mileages));
    return newMileage;
  },

  async deleteMileage(id: string): Promise<void> {
    const mileages = await this.getMileage();
    const filtered = mileages.filter(m => m.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.MILEAGE, JSON.stringify(filtered));
  },

  async getMileageSettings(year: number): Promise<MileageSettings | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MILEAGE_SETTINGS);
      const allSettings: MileageSettings[] = data ? JSON.parse(data) : [];
      return allSettings.find(s => s.year === year) || null;
    } catch (error) {
      console.error('Error loading mileage settings:', error);
      return null;
    }
  },

  async saveMileageSettings(settings: Omit<MileageSettings, 'id' | 'updated_at'>): Promise<MileageSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MILEAGE_SETTINGS);
      const allSettings: MileageSettings[] = data ? JSON.parse(data) : [];

      const existingIndex = allSettings.findIndex(s => s.year === settings.year);
      const newSettings: MileageSettings = {
        ...settings,
        id: existingIndex !== -1 ? allSettings[existingIndex].id : generateId(),
        updated_at: new Date().toISOString(),
      };

      if (existingIndex !== -1) {
        allSettings[existingIndex] = newSettings;
      } else {
        allSettings.push(newSettings);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.MILEAGE_SETTINGS, JSON.stringify(allSettings));
      return newSettings;
    } catch (error) {
      console.error('Error saving mileage settings:', error);
      throw error;
    }
  },

  async getAssets(): Promise<Asset[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ASSETS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading assets:', error);
      return [];
    }
  },

  async getProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  },

  async saveProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const existing = await this.getProfile();
      const newProfile: UserProfile = {
        id: existing?.id || 'local-user',
        email: existing?.email || 'offline@local',
        full_name: profile.full_name || existing?.full_name || '',
        business_name: profile.business_name || existing?.business_name || null,
        province: profile.province || existing?.province || null,
        vehicle_type: profile.vehicle_type || existing?.vehicle_type || null,
        vehicle_year: profile.vehicle_year || existing?.vehicle_year || null,
        vehicle_make: profile.vehicle_make || existing?.vehicle_make || null,
        vehicle_model: profile.vehicle_model || existing?.vehicle_model || null,
        created_at: existing?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
      return newProfile;
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  },

  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.EXPENSES),
        AsyncStorage.removeItem(STORAGE_KEYS.INCOME),
        AsyncStorage.removeItem(STORAGE_KEYS.MILEAGE),
        AsyncStorage.removeItem(STORAGE_KEYS.ASSETS),
        AsyncStorage.removeItem(STORAGE_KEYS.MILEAGE_SETTINGS),
        AsyncStorage.removeItem(STORAGE_KEYS.REFERRALS),
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  },
};
