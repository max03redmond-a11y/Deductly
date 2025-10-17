import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CRACategory } from '@/types/database';

export function useCRACategories() {
  const [categories, setCategories] = useState<CRACategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('cra_categories')
        .select('*')
        .order('code');

      if (fetchError) throw fetchError;

      setCategories(data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading CRA categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryByCode = (code: string): CRACategory | undefined => {
    return categories.find(cat => cat.code === code);
  };

  const getVehicleCategories = (): CRACategory[] => {
    return categories.filter(cat => cat.apply_business_use);
  };

  const getOperatingCategories = (): CRACategory[] => {
    return categories.filter(cat => !cat.apply_business_use && cat.t2125_line !== null);
  };

  return {
    categories,
    loading,
    error,
    getCategoryByCode,
    getVehicleCategories,
    getOperatingCategories,
    reload: loadCategories,
  };
}
