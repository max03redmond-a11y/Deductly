import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAppState } from '@/lib/state/appStore';
import { Profile } from '@/types/database';

interface OfflineContextType {
  profile: Profile | null;
  loading: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const profile = useAppState((state) => state.profile);
  const loading = useAppState((state) => state.loading);
  const initialized = useAppState((state) => state.initialized);
  const loadAllData = useAppState((state) => state.loadAllData);
  const updateProfile = useAppState((state) => state.updateProfile);

  useEffect(() => {
    if (!initialized) {
      loadAllData();
    }
  }, [initialized, loadAllData]);

  return (
    <OfflineContext.Provider
      value={{
        profile,
        loading,
        updateProfile,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an OfflineProvider');
  }
  return context;
}
