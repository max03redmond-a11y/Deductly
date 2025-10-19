import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Dimensions, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, Plus, Download, FileText, PieChart, DollarSign, Percent, FileSpreadsheet } from 'lucide-react-native';
import { Expense, IncomeRecord, MileageLog, Asset, EXPENSE_CATEGORIES } from '@/types/database';
import { PieChart as RNPieChart } from 'react-native-chart-kit';
import { generateT2125Data } from '@/lib/t2125/mapper';
import { generateT2125CSV, downloadCSV } from '@/lib/t2125/csvExport';
import { generateT2125HTML, downloadHTML } from '@/lib/t2125/htmlExport';
import { showToast } from '@/lib/toast';
import ExportModal from '@/components/ExportModal';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_PROFILE: any = { business_name: 'Your Business', id: DEFAULT_USER_ID };

export default function DashboardScreen() {
  const profile = DEFAULT_PROFILE;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [mileage, setMileage] = useState<MileageLog[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const loadData = useCallback(async () => {
    const [expensesRes, incomeRes, mileageRes, assetsRes] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', profile.id),
      supabase.from('income_records').select('*').eq('user_id', profile.id),
      supabase.from('mileage_logs').select('*').eq('user_id', profile.id),
      supabase.from('assets').select('*').eq('user_id', profile.id),
    ]);

    if (expensesRes.data) setExpenses(expensesRes.data);
    if (incomeRes.data) setIncome(incomeRes.data);
    if (mileageRes.data) setMileage(mileageRes.data);
    if (assetsRes.data) setAssets(assetsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to real-time changes
    const expensesChannel = supabase
      .channel('dashboard-expenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        loadData();
      })
      .subscribe();

    const incomeChannel = supabase
      .channel('dashboard-income-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'income_records' }, () => {
        loadData();
      })
      .subscribe();

    const mileageChannel = supabase
      .channel('dashboard-mileage-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mileage_logs' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(expensesChannel);
      supabase.removeChannel(incomeChannel);
      supabase.removeChannel(mileageChannel);
    };
  }, [loadData]);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalIncome = income.reduce((sum, record) => sum + record.amount, 0);

  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category;
    const deductibleAmount = expense.amount * (expense.business_percentage / 100);
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += deductibleAmount;
    return acc;
  }, {} as Record<string, number>);

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  const totalKm = mileage.reduce((sum, log) => sum + log.distance_km, 0);
  const businessKm = mileage.reduce((sum, log) => sum + log.business_km, 0);

  const TAX_RATE = 0.25;
  const totalDeductible = totalExpenses;
  const estimatedTaxSavings = totalDeductible * TAX_RATE;

  const chartColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#6366F1', '#EF4444'];

  const chartData = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([category, amount], index) => {
      const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === category);
      return {
        name: categoryInfo?.label || category,
        amount: amount,
        color: chartColors[index % chartColors.length],
        legendFontColor: '#6B7280',
        legendFontSize: 13,
      };
    });

  const handleExportT2125CSV = async () => {
    try {
      const t2125Data = generateT2125Data(profile, expenses, income, mileage, assets);
      const csvContent = generateT2125CSV(t2125Data);
      await downloadCSV(csvContent, `t2125_export_${new Date().getFullYear()}.csv`);
      showToast('T2125 CSV exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', 'Failed to export T2125 data. Please try again.');
    }
  };

  const handleExportT2125HTML = async () => {
    try {
      const t2125Data = generateT2125Data(profile, expenses, income, mileage, assets);
      const htmlContent = generateT2125HTML(t2125Data);
      await downloadHTML(htmlContent, `t2125_report_${new Date().getFullYear()}.html`);
      showToast('T2125 report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', 'Failed to export T2125 report. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerLabel}>Year to Date</Text>
            <Text style={styles.headerCompany}>{profile?.business_name || 'Your Business'}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAddIncomeModal(true)} style={styles.addButton}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionMainTitle}>Tax Analytics</Text>

          <View style={styles.taxSummaryCards}>
            <View style={styles.taxCard}>
              <View style={styles.taxCardIcon}>
                <DollarSign size={24} color="#3B82F6" />
              </View>
              <Text style={styles.taxCardLabel}>Total Deductible</Text>
              <Text style={[styles.taxCardValue, { color: '#3B82F6' }]}>
                ${totalDeductible.toFixed(2)}
              </Text>
            </View>

            <View style={styles.taxCard}>
              <View style={styles.taxCardIcon}>
                <Percent size={24} color="#10B981" />
              </View>
              <Text style={styles.taxCardLabel}>Est. Tax Savings</Text>
              <Text style={[styles.taxCardValue, { color: '#10B981' }]}>
                ${estimatedTaxSavings.toFixed(2)}
              </Text>
              <Text style={styles.taxCardSubtext}>at 25% rate</Text>
            </View>
          </View>

          {chartData.length > 0 && (
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <PieChart size={20} color="#111827" />
                <Text style={styles.chartTitle}>Expenses by Category</Text>
              </View>
              <View style={styles.chartWrapper}>
                <RNPieChart
                  data={chartData}
                  width={Dimensions.get('window').width - 80}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  center={[10, 0]}
                  absolute
                  hasLegend={true}
                />
              </View>
            </View>
          )}

          <View style={styles.exportSection}>
            <View style={styles.exportHeader}>
              <FileText size={20} color="#111827" />
              <Text style={styles.exportTitle}>CRA T2125 Export</Text>
            </View>
            <Text style={styles.exportDescription}>
              Export your business data to CRA T2125 format with all income, expenses, and deductions pre-calculated
            </Text>
            <TouchableOpacity
              style={styles.exportButtonMain}
              onPress={() => setShowExportModal(true)}
            >
              <Download size={20} color="#FFFFFF" />
              <Text style={styles.exportButtonMainText}>Export T2125</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statementContainer}>
          <View style={styles.statementHeader}>
            <Text style={styles.statementTitle}>Income Statement</Text>
            <Text style={styles.statementPeriod}>January 1 - December 31, 2025</Text>
          </View>

          <View style={styles.statementSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>REVENUE</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineItemLabel}>Gross Income</Text>
              <Text style={styles.lineItemAmount}>${totalIncome.toFixed(2)}</Text>
            </View>
            <View style={[styles.lineItem, styles.totalLine]}>
              <Text style={styles.totalLabel}>Total Revenue</Text>
              <Text style={styles.totalAmount}>${totalIncome.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.statementSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>OPERATING EXPENSES</Text>
            </View>

            {Object.entries(expensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === category);
                return (
                  <View key={category} style={styles.lineItem}>
                    <Text style={styles.lineItemLabel}>{categoryInfo?.label || category}</Text>
                    <Text style={styles.lineItemAmount}>${amount.toFixed(2)}</Text>
                  </View>
                );
              })}

            {Object.keys(expensesByCategory).length === 0 && (
              <View style={styles.lineItem}>
                <Text style={[styles.lineItemLabel, { fontStyle: 'italic', color: '#9CA3AF' }]}>
                  No expenses recorded
                </Text>
                <Text style={styles.lineItemAmount}>$0.00</Text>
              </View>
            )}

            <View style={[styles.lineItem, styles.totalLine]}>
              <Text style={styles.totalLabel}>Total Expenses</Text>
              <Text style={[styles.totalAmount, { color: '#DC2626' }]}>
                ${totalExpenses.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={[styles.statementSection, styles.netIncomeSection]}>
            <View style={styles.lineItem}>
              <Text style={styles.netIncomeLabel}>NET INCOME</Text>
              <View style={styles.netIncomeContainer}>
                {netProfit >= 0 ? (
                  <TrendingUp size={20} color="#059669" />
                ) : (
                  <TrendingDown size={20} color="#DC2626" />
                )}
                <Text style={[styles.netIncomeAmount, { color: netProfit >= 0 ? '#059669' : '#DC2626' }]}>
                  ${netProfit.toFixed(2)}
                </Text>
              </View>
            </View>
            <Text style={styles.profitMargin}>
              Profit Margin: {profitMargin.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.metricsSection}>
          <Text style={styles.metricsSectionTitle}>KEY METRICS</Text>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Business KM</Text>
              <Text style={styles.metricValue}>{businessKm.toFixed(0)}</Text>
              <Text style={styles.metricSubtext}>of {totalKm.toFixed(0)} total km</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Avg. per Trip</Text>
              <Text style={styles.metricValue}>
                ${income.length > 0 ? (totalIncome / income.reduce((sum, i) => sum + (i.trips_completed || 0), 0) || 0).toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.metricSubtext}>per completed trip</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Revenue/KM</Text>
              <Text style={styles.metricValue}>
                ${businessKm > 0 ? (totalIncome / businessKm).toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.metricSubtext}>earned per km</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Cost/KM</Text>
              <Text style={styles.metricValue}>
                ${businessKm > 0 ? (totalExpenses / businessKm).toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.metricSubtext}>cost per km</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      <AddIncomeModal
        visible={showAddIncomeModal}
        onClose={() => setShowAddIncomeModal(false)}
        onSuccess={() => {
          setShowAddIncomeModal(false);
          loadData();
        }}
      />

      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </View>
  );
}

function AddIncomeModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const profile = DEFAULT_PROFILE;
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [trips, setTrips] = useState('');
  const [loading, setLoading] = useState(false);

  const INCOME_SOURCES = ['Uber', 'Lyft', 'DoorDash', 'Skip The Dishes', 'Cash', 'Other'];

  const handleAdd = async () => {
    if (!source || !amount || !profile) {
      if (Platform.OS === 'web') {
        alert('Please fill in required fields');
      } else {
        Alert.alert('Error', 'Please fill in required fields');
      }
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      if (Platform.OS === 'web') {
        alert('Please enter a valid amount');
      } else {
        Alert.alert('Error', 'Please enter a valid amount');
      }
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('income_records').insert({
      user_id: profile.id,
      date,
      source,
      amount: amountNum,
      trips_completed: trips ? parseInt(trips) : null,
      imported_from: 'manual',
    });

    if (error) {
      if (Platform.OS === 'web') {
        alert('Error: ' + error.message);
      } else {
        Alert.alert('Error', error.message);
      }
      setLoading(false);
    } else {
      setSource('');
      setAmount('');
      setTrips('');
      setLoading(false);
      onSuccess();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Income</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <Text style={styles.inputLabel}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />

            <Text style={styles.inputLabel}>Source</Text>
            <View style={styles.sourceGrid}>
              {INCOME_SOURCES.map((src) => (
                <TouchableOpacity
                  key={src}
                  style={[
                    styles.sourceOption,
                    source === src && styles.sourceOptionSelected,
                  ]}
                  onPress={() => setSource(src)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.sourceOptionText,
                      source === src && styles.sourceOptionTextSelected,
                    ]}
                  >
                    {src}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              editable={!loading}
            />

            <Text style={styles.inputLabel}>Trips Completed (Optional)</Text>
            <TextInput
              style={styles.input}
              value={trips}
              onChangeText={setTrips}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleAdd}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Adding...' : 'Add Income'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    color: '#6B7280',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  headerCompany: {
    fontSize: 28,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#000000',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  analyticsSection: {
    marginBottom: 20,
  },
  sectionMainTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  taxSummaryCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  taxCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  taxCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  taxCardLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  taxCardValue: {
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 4,
  },
  taxCardSubtext: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    color: '#9CA3AF',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
  },
  chartWrapper: {
    alignItems: 'center',
  },
  statementContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statementHeader: {
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statementTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statementPeriod: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#9CA3AF',
  },
  statementSection: {
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    color: '#9CA3AF',
    letterSpacing: 1.2,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  lineItemLabel: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    color: '#4B5563',
  },
  lineItemAmount: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
  },
  totalLine: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 12,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
  },
  totalAmount: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
  },
  netIncomeSection: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: -24,
    marginBottom: -24,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  netIncomeLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    color: '#6B7280',
    letterSpacing: 1.2,
  },
  netIncomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  netIncomeAmount: {
    fontSize: 28,
    fontFamily: 'Montserrat-SemiBold',
  },
  profitMargin: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 8,
  },
  metricsSection: {
    marginBottom: 16,
  },
  metricsSectionTitle: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    color: '#9CA3AF',
    letterSpacing: 1.2,
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 26,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    color: '#D1D5DB',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
  },
  modalClose: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#000000',
  },
  modalForm: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    color: '#374151',
    marginBottom: 10,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    color: '#111827',
  },
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sourceOption: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  sourceOptionSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  sourceOptionText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#6B7280',
  },
  sourceOptionTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },
  submitButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  exportSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  exportTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
  },
  exportDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  exportButtons: {
    gap: 12,
  },
  exportButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  exportButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
  exportButtonTextSecondary: {
    color: '#3B82F6',
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
  exportButtonMain: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  exportButtonMainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
});
