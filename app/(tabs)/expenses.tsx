import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Plus, Receipt, Trash2, Car } from 'lucide-react-native';
import { Expense, EXPENSE_CATEGORIES, MileageLog } from '@/types/database';
import { EnhancedExpenseModal } from '@/components/EnhancedExpenseModal';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mileageLogs, setMileageLogs] = useState<MileageLog[]>([]);
  const [businessUsePercent, setBusinessUsePercent] = useState(0);

  const loadExpenses = useCallback(async () => {
    const currentYear = new Date().getFullYear();

    const [expensesRes, mileageRes, mileageSettingsRes] = await Promise.all([
      supabase
        .from('expenses')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .order('date', { ascending: false }),
      supabase
        .from('mileage_logs')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .gte('date', `${currentYear}-01-01`)
        .lte('date', `${currentYear}-12-31`),
      supabase
        .from('mileage_settings')
        .select('jan1_odometer_km, current_odometer_km')
        .eq('user_id', DEFAULT_USER_ID)
        .eq('year', currentYear)
        .maybeSingle(),
    ]);

    if (expensesRes.error) {
      console.error('Error loading expenses:', expensesRes.error);
    } else {
      setExpenses(expensesRes.data || []);
    }

    if (mileageRes.data) {
      setMileageLogs(mileageRes.data);

      const businessKm = mileageRes.data
        .filter((log) => log.is_business)
        .reduce((sum, log) => sum + log.distance_km, 0);

      let totalKm = 0;
      if (mileageSettingsRes.data) {
        totalKm = mileageSettingsRes.data.current_odometer_km - mileageSettingsRes.data.jan1_odometer_km;
      }

      const percent = totalKm > 0 ? Math.min(100, Math.max(0, (businessKm / totalKm) * 100)) : 0;
      setBusinessUsePercent(percent);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadExpenses();

    const channel = supabase
      .channel('expenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        loadExpenses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadExpenses]);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  const totalDeductible = expenses.reduce((sum, expense) => {
    return sum + (expense.amount * (expense.business_percentage / 100));
  }, 0);

  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.amount * (expense.business_percentage / 100);
    return acc;
  }, {} as Record<string, number>);

  return (
    <View style={styles.container}>
      <PageHeader
        title="Expenses"
        subtitle={`$${totalDeductible.toFixed(2)} deductible • ${expenses.length} tracked`}
        rightAction={
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Plus size={22} color="#059669" strokeWidth={2.5} />
          </TouchableOpacity>
        }
      />

      {businessUsePercent > 0 && (
        <View style={styles.businessUseBanner}>
          <Car size={18} color="#1E40AF" />
          <Text style={styles.businessUseBannerText}>
            Business-use % applied: <Text style={styles.businessUseBannerValue}>{businessUsePercent.toFixed(1)}%</Text>
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {expenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            message="You haven't logged any expenses yet — tap + to start."
          />
        ) : (
          <>
            {Object.keys(expensesByCategory).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>BY CATEGORY</Text>
                {Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => {
                    const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === category);
                    const percentage = (amount / totalDeductible) * 100;
                    return (
                      <View key={category} style={styles.categoryCard}>
                        <View style={styles.categoryHeader}>
                          <View style={styles.categoryInfo}>
                            <Text style={styles.categoryName}>{categoryInfo?.label || category}</Text>
                            <Text style={styles.categoryPercentage}>{percentage.toFixed(0)}%</Text>
                          </View>
                          <Text style={styles.categoryAmount}>${amount.toFixed(2)}</Text>
                        </View>
                        <View style={styles.categoryBar}>
                          <View
                            style={[
                              styles.categoryBarFill,
                              { width: `${Math.min(percentage, 100)}%` },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RECENT</Text>
              <View style={styles.expenseGrid}>
                {expenses.slice(0, 20).map((expense) => (
                  <ExpenseItem key={expense.id} expense={expense} onDelete={loadExpenses} />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <EnhancedExpenseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadExpenses();
        }}
      />
    </View>
  );
}

function ExpenseItem({ expense, onDelete }: { expense: Expense; onDelete: () => void }) {
  const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === expense.category);
  const deductibleAmount = expense.amount * (expense.business_percentage / 100);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;

    const confirmed = Platform.OS === 'web'
      ? window.confirm(`Delete this expense from ${expense.merchant_name}?`)
      : true;

    if (!confirmed && Platform.OS === 'web') {
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Delete Expense',
        `Delete this expense from ${expense.merchant_name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await performDelete();
            },
          },
        ]
      );
    } else {
      await performDelete();
    }
  };

  const performDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id);

      if (error) {
        console.error('Delete error:', error);
        if (Platform.OS === 'web') {
          alert('Failed to delete expense');
        } else {
          Alert.alert('Error', 'Failed to delete expense');
        }
      } else {
        onDelete();
      }
    } catch (err) {
      console.error('Delete exception:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.expenseCard}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseIconContainer}>
          <Receipt size={16} color="#059669" strokeWidth={2} />
        </View>
        <TouchableOpacity
          onPress={handleDelete}
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
          disabled={deleting}
        >
          <Trash2 size={14} color={deleting ? "#9CA3AF" : "#EF4444"} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <Text style={styles.expenseMerchant} numberOfLines={1}>
        {expense.merchant_name}
      </Text>

      <Text style={styles.expenseCategory} numberOfLines={1}>
        {categoryInfo?.label}
      </Text>

      <View style={styles.expenseFooter}>
        <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
        <Text style={styles.expenseDate}>
          {new Date(expense.date).toLocaleDateString('en-CA', {
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>

      {expense.business_percentage < 100 && (
        <View style={styles.deductibleBadge}>
          <Text style={styles.deductibleText}>
            ${deductibleAmount.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  businessUseBanner: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  businessUseBannerText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#1E40AF',
  },
  businessUseBannerValue: {
    fontFamily: 'Montserrat-Bold',
    color: '#1E40AF',
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
    letterSpacing: 1,
  },
  expenseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  categoryBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 2,
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expenseIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseMerchant: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 10,
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  expenseDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  deductibleBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  deductibleText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
});
