import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform, TextInput, Modal, Switch } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Receipt, Trash2, Car, Info } from 'lucide-react-native';
import { Expense, EXPENSE_CATEGORIES, MileageLog } from '@/types/database';
import { EnhancedExpenseModal } from '@/components/EnhancedExpenseModal';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { formatCategoryLabel } from '@/lib/formatters';

const TOOLTIPS = {
  vehicleClass: 'The CRA uses vehicle classes to determine how much of your car\'s value you can depreciate each year for tax purposes.\n\n• Class 10: Vehicles costing $30,000 or less (before tax)\n• Class 10.1: Vehicles costing over $30,000 (before tax, capped at $30,000 for CCA)\n• Class 54: Zero-emission or electric vehicles\n\nAll vehicle classes depreciate at 30% per year using the declining balance method.',
  purchasePrice: 'The cost of your vehicle including taxes and fees.',
  openingUCC: 'The remaining undepreciated cost from last year. Enter 0 if this is your first year.',
  ccaRate: 'Automatically filled based on vehicle class.',
  salePrice: 'If you sold your car this year, enter the amount received.',
  yearPurchased: 'The year you started using the vehicle for Uber.',
  halfYearRule: 'In the first year you use your vehicle for Uber, the CRA only allows you to claim half of your normal depreciation. Leave this on for your first year, and off for later years.',
};

const getCCARate = (vehicleClass: '10' | '10.1' | '54'): number => {
  return 30;
};

export default function ExpensesScreen() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mileageLogs, setMileageLogs] = useState<MileageLog[]>([]);
  const [businessUsePercent, setBusinessUsePercent] = useState(0);
  const [activeTab, setActiveTab] = useState<'expenses' | 'depreciation'>('expenses');

  const [vehicleClass, setVehicleClass] = useState<'10' | '10.1' | '54'>('10');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [openingUCC, setOpeningUCC] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [yearPurchased, setYearPurchased] = useState(new Date().getFullYear().toString());
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [halfYearRule, setHalfYearRule] = useState(true);
  const [ccaResults, setCcaResults] = useState<{
    ccaDeduction: number;
    remainingUCC: number;
  } | null>(null);

  const loadExpenses = useCallback(async () => {
    if (!user) return;

    const currentYear = new Date().getFullYear();

    const [expensesRes, mileageRes, mileageSettingsRes] = await Promise.all([
      supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false }),
      supabase
        .from('mileage_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', `${currentYear}-01-01`)
        .lte('date', `${currentYear}-12-31`),
      supabase
        .from('mileage_settings')
        .select('jan1_odometer_km, current_odometer_km')
        .eq('user_id', user.id)
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
  }, [user]);

  useEffect(() => {
    if (user) {
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
    }
  }, [loadExpenses, user]);

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

  const calculateCCA = () => {
    const purchasePriceNum = parseFloat(purchasePrice) || 0;
    const openingUCCNum = parseFloat(openingUCC) || 0;
    const salePriceNum = parseFloat(salePrice) || 0;
    const ccaRate = getCCARate(vehicleClass) / 100;

    if (purchasePriceNum <= 0) {
      if (Platform.OS === 'web') {
        alert('Please enter valid Purchase Price');
      } else {
        Alert.alert('Invalid Input', 'Please enter valid Purchase Price');
      }
      return;
    }

    const baseAmount = halfYearRule ? purchasePriceNum / 2 : purchasePriceNum;
    const ccaDeduction = baseAmount * ccaRate;
    const remainingUCC = openingUCCNum - ccaDeduction;

    const results = {
      ccaDeduction,
      remainingUCC: Math.max(0, remainingUCC),
    };

    setCcaResults(results);
    storage.setJSON(STORAGE_KEYS.CCA_DATA, results);
  };

  useEffect(() => {
    if (ccaResults) {
      calculateCCA();
    }
  }, [halfYearRule]);

  return (
    <View style={styles.container}>
      <PageHeader
        title="Expenses"
        subtitle={`$${totalDeductible.toFixed(2)} deductible • ${expenses.length} tracked`}
        rightAction={
          activeTab === 'expenses' ? (
            <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
              <Plus size={22} color="#059669" strokeWidth={2.5} />
            </TouchableOpacity>
          ) : null
        }
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expenses' && styles.tabActive]}
          onPress={() => setActiveTab('expenses')}
        >
          <Text style={[styles.tabText, activeTab === 'expenses' && styles.tabTextActive]}>
            Vehicle & Operating Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'depreciation' && styles.tabActive]}
          onPress={() => setActiveTab('depreciation')}
        >
          <Text style={[styles.tabText, activeTab === 'depreciation' && styles.tabTextActive]}>
            Vehicle Depreciation (CCA)
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'expenses' ? (
        <>
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
                    const categoryLabel = categoryInfo?.label || formatCategoryLabel(category);
                    const percentage = (amount / totalDeductible) * 100;
                    return (
                      <View key={category} style={styles.categoryCard}>
                        <View style={styles.categoryHeader}>
                          <View style={styles.categoryInfo}>
                            <Text style={styles.categoryName}>{categoryLabel}</Text>
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
        </>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.ccaFormContainer}>
            <Text style={styles.ccaFormTitle}>Capital Cost Allowance (CCA)</Text>
            <Text style={styles.ccaFormSubtitle}>Track vehicle depreciation for tax purposes</Text>

            <View style={styles.formField}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Vehicle Class</Text>
                <TouchableOpacity onPress={() => setShowTooltip('vehicleClass')}>
                  <Info size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[styles.segment, vehicleClass === '10' && styles.segmentActive]}
                  onPress={() => setVehicleClass('10')}
                >
                  <Text style={[styles.segmentText, vehicleClass === '10' && styles.segmentTextActive]}>
                    Class 10
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, vehicleClass === '10.1' && styles.segmentActive]}
                  onPress={() => setVehicleClass('10.1')}
                >
                  <Text style={[styles.segmentText, vehicleClass === '10.1' && styles.segmentTextActive]}>
                    Class 10.1
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, vehicleClass === '54' && styles.segmentActive]}
                  onPress={() => setVehicleClass('54')}
                >
                  <Text style={[styles.segmentText, vehicleClass === '54' && styles.segmentTextActive]}>
                    Class 54
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formField}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleLabelContainer}>
                  <Text style={styles.fieldLabel}>Half-Year Rule (first year only)</Text>
                  <TouchableOpacity onPress={() => setShowTooltip('halfYearRule')}>
                    <Info size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <Switch
                  value={halfYearRule}
                  onValueChange={setHalfYearRule}
                  trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                  thumbColor={halfYearRule ? '#059669' : '#F3F4F6'}
                  ios_backgroundColor="#D1D5DB"
                />
              </View>
            </View>

            <View style={styles.formField}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Vehicle Purchase Price</Text>
                <TouchableOpacity onPress={() => setShowTooltip('purchasePrice')}>
                  <Info size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  style={styles.input}
                  value={purchasePrice}
                  onChangeText={setPurchasePrice}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.formField}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Opening UCC Balance</Text>
                <TouchableOpacity onPress={() => setShowTooltip('openingUCC')}>
                  <Info size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  style={styles.input}
                  value={openingUCC}
                  onChangeText={setOpeningUCC}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.formField}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>CCA Rate</Text>
                <TouchableOpacity onPress={() => setShowTooltip('ccaRate')}>
                  <Info size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={[styles.inputContainer, styles.inputDisabled]}>
                <TextInput
                  style={styles.input}
                  value={`${getCCARate(vehicleClass)}%`}
                  editable={false}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.formField}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Vehicle Sale Price (Optional)</Text>
                <TouchableOpacity onPress={() => setShowTooltip('salePrice')}>
                  <Info size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  style={styles.input}
                  value={salePrice}
                  onChangeText={setSalePrice}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.formField}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Year Purchased</Text>
                <TouchableOpacity onPress={() => setShowTooltip('yearPurchased')}>
                  <Info size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.inputContainer}
                value={yearPurchased}
                onChangeText={setYearPurchased}
                placeholder={new Date().getFullYear().toString()}
                keyboardType="number-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity style={styles.calculateButton} onPress={calculateCCA}>
              <Text style={styles.calculateButtonText}>Calculate CCA</Text>
            </TouchableOpacity>

            {ccaResults && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>CCA Calculation Results</Text>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>CCA Deduction for this Year:</Text>
                  <Text style={styles.resultValue}>${ccaResults.ccaDeduction.toFixed(2)}</Text>
                </View>

                <View style={[styles.resultRow, styles.resultRowLast]}>
                  <Text style={styles.resultLabel}>Remaining UCC Balance:</Text>
                  <Text style={styles.resultValueSecondary}>
                    ${ccaResults.remainingUCC.toFixed(2)}
                  </Text>
                </View>

                <Text style={styles.resultsNote}>
                  (carry forward to next year)
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <Modal
        visible={showTooltip !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTooltip(null)}
      >
        <TouchableOpacity
          style={styles.tooltipOverlay}
          activeOpacity={1}
          onPress={() => setShowTooltip(null)}
        >
          <View style={styles.tooltipContainer}>
            <View style={styles.tooltipContent}>
              <Text style={styles.tooltipText}>
                {showTooltip && TOOLTIPS[showTooltip as keyof typeof TOOLTIPS]}
              </Text>
              <TouchableOpacity
                style={styles.tooltipButton}
                onPress={() => setShowTooltip(null)}
              >
                <Text style={styles.tooltipButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function ExpenseItem({ expense, onDelete }: { expense: Expense; onDelete: () => void }) {
  const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === expense.category);
  const categoryLabel = expense.category_label || categoryInfo?.label || formatCategoryLabel(expense.category_code || expense.category);
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
        {categoryLabel}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#D1FAE5',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    color: '#6B7280',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#059669',
    fontFamily: 'Montserrat-Bold',
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
  ccaFormContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  ccaFormTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  ccaFormSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  formField: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#374151',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#059669',
    fontFamily: 'Montserrat-Bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 48,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
  },
  inputPrefix: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#6B7280',
    marginRight: 4,
  },
  inputSuffix: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#6B7280',
    marginLeft: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#111827',
    padding: 0,
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tooltipContainer: {
    width: '100%',
    maxWidth: 400,
  },
  tooltipContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  tooltipText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 20,
  },
  tooltipButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  tooltipButtonText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
  },
  calculateButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  calculateButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
  },
  resultsContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  resultsTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#059669',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#BBF7D0',
  },
  resultRowLast: {
    borderBottomWidth: 0,
  },
  resultLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#374151',
    flex: 1,
  },
  resultValue: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#059669',
  },
  resultValueSecondary: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#6B7280',
  },
  resultsNote: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
