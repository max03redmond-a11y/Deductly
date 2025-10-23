import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, Download, FileText, PieChart, DollarSign, Percent, Info } from 'lucide-react-native';
import { Expense, IncomeEntry, IncomeRecord, MileageLog, Asset, EXPENSE_CATEGORIES, CRACategory } from '@/types/database';
import { PieChart as RNPieChart } from 'react-native-chart-kit';
import { generateT2125Data } from '@/lib/t2125/mapper';
import { generateT2125CSV, downloadCSV } from '@/lib/t2125/csvExport';
import { generateT2125HTML, downloadHTML } from '@/lib/t2125/htmlExport';
import { showToast } from '@/lib/toast';
import ExportModal from '@/components/ExportModal';
import { storage, STORAGE_KEYS } from '@/lib/storage';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_PROFILE: any = { business_name: 'Your Business', id: DEFAULT_USER_ID };

const VEHICLE_EXPENSE_CODES = [
  'GAS_FUEL',
  'LOAN_INTEREST',
  'INSURANCE_AUTO',
  'LIC_REG',
  'REPAIRS_MAINT',
  'LEASE_PAYMENTS',
  'VEHICLE_ELECTRICITY'
];

export default function DashboardScreen() {
  const profile = DEFAULT_PROFILE;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [mileage, setMileage] = useState<MileageLog[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [craCategories, setCraCategories] = useState<CRACategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [mileageSettings, setMileageSettings] = useState<any>(null);
  const [ccaData, setCcaData] = useState<{ ccaDeduction: number; remainingUCC: number } | null>(null);
  const [showCcaTooltip, setShowCcaTooltip] = useState(false);

  const loadData = useCallback(async () => {
    const currentYear = new Date().getFullYear();
    const [expensesRes, incomeRes, mileageRes, assetsRes, categoriesRes, settingsRes] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', profile.id),
      supabase.from('income_entries').select('*').eq('user_id', profile.id),
      supabase.from('mileage_logs').select('*').eq('user_id', profile.id),
      supabase.from('assets').select('*').eq('user_id', profile.id),
      supabase.from('cra_categories').select('*'),
      supabase.from('mileage_settings').select('*').eq('user_id', profile.id).eq('year', currentYear).maybeSingle(),
    ]);

    if (expensesRes.data) setExpenses(expensesRes.data);
    if (incomeRes.data) setIncome(incomeRes.data);
    if (mileageRes.data) setMileage(mileageRes.data);
    if (assetsRes.data) setAssets(assetsRes.data);
    if (categoriesRes.data) setCraCategories(categoriesRes.data);
    if (settingsRes.data) setMileageSettings(settingsRes.data);

    const storedCcaData = await storage.getJSON<{ ccaDeduction: number; remainingUCC: number }>(STORAGE_KEYS.CCA_DATA);
    if (storedCcaData) setCcaData(storedCcaData);

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'income_entries' }, () => {
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

  const totalGrossSales = income.reduce((sum, entry) => sum + Number(entry.gross_income), 0);
  const totalGstCollected = income.reduce((sum, entry) => sum + Number(entry.gst_collected || 0), 0);
  const totalNetSales = totalGrossSales - totalGstCollected;
  const totalOtherIncome = income.reduce((sum, entry) => sum + Number(entry.tips || 0) + Number(entry.bonuses || 0) + Number(entry.other_income || 0), 0);
  const totalIncome = totalNetSales + totalOtherIncome;

  const getCategoryLabel = (categoryCode: string): string => {
    const craCategory = craCategories.find(c => c.code === categoryCode);
    if (craCategory) return craCategory.label;

    const legacyCategory = EXPENSE_CATEGORIES.find(c => c.value === categoryCode);
    return legacyCategory?.label || categoryCode;
  };

  const isVehicleExpense = (categoryCode: string): boolean => {
    return VEHICLE_EXPENSE_CODES.includes(categoryCode);
  };

  const businessKm = mileage
    .filter((log) => log.is_business)
    .reduce((sum, log) => sum + log.distance_km, 0);

  const totalKm = mileageSettings && mileageSettings.jan1_odometer_km && mileageSettings.current_odometer_km
    ? parseFloat(mileageSettings.current_odometer_km) - parseFloat(mileageSettings.jan1_odometer_km)
    : 0;

  const mileageBusinessUsePercentage = totalKm > 0
    ? Math.min(100, Math.max(0, (businessKm / totalKm) * 100))
    : 0;

  const vehicleExpensesByCategory = expenses.reduce((acc, expense) => {
    if (isVehicleExpense(expense.category)) {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const operatingExpensesByCategory = expenses.reduce((acc, expense) => {
    if (!isVehicleExpense(expense.category)) {
      const category = expense.category;
      const deductibleAmount = expense.amount * (expense.business_percentage / 100);
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += deductibleAmount;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalVehicleExpensesBeforeBusinessUse = Object.values(vehicleExpensesByCategory).reduce((sum, val) => sum + val, 0);
  const totalVehicleExpenses = totalVehicleExpensesBeforeBusinessUse * (mileageBusinessUsePercentage / 100);
  const totalOperatingExpenses = Object.values(operatingExpensesByCategory).reduce((sum, val) => sum + val, 0);
  const deductibleCca = ccaData ? ccaData.ccaDeduction * (mileageBusinessUsePercentage / 100) : 0;
  const totalExpenses = totalVehicleExpenses + totalOperatingExpenses + deductibleCca;
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  const expensesByCategory = { ...vehicleExpensesByCategory, ...operatingExpensesByCategory };

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
      const t2125Data = generateT2125Data(profile, expenses, income, mileage, assets, mileageSettings);
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
      const t2125Data = generateT2125Data(profile, expenses, income, mileage, assets, mileageSettings);
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
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionMainTitle}>Overview</Text>

          <View style={styles.taxSummaryCards}>
            <View style={styles.taxCard}>
              <View style={styles.taxCardIcon}>
                <DollarSign size={24} color="#111827" />
              </View>
              <Text style={styles.taxCardLabel}>Gross Business Income</Text>
              <Text style={[styles.taxCardValue, { color: '#111827' }]}>
                ${totalIncome.toFixed(2)}
              </Text>
              <Text style={styles.taxCardSubtext}>Line 8299</Text>
            </View>

            <View style={styles.taxCard}>
              <View style={styles.taxCardIcon}>
                <TrendingDown size={24} color="#DC2626" />
              </View>
              <Text style={styles.taxCardLabel}>Total Expenses</Text>
              <Text style={[styles.taxCardValue, { color: '#DC2626' }]}>
                ${totalExpenses.toFixed(2)}
              </Text>
              <Text style={styles.taxCardSubtext}>Deductible</Text>
            </View>
          </View>

          <View style={styles.taxSummaryCards}>
            <View style={styles.taxCard}>
              <View style={styles.taxCardIcon}>
                <TrendingUp size={24} color={netProfit >= 0 ? '#10B981' : '#DC2626'} />
              </View>
              <Text style={styles.taxCardLabel}>Net Profit</Text>
              <Text style={[styles.taxCardValue, { color: netProfit >= 0 ? '#10B981' : '#DC2626' }]}>
                ${netProfit.toFixed(2)}
              </Text>
              <Text style={styles.taxCardSubtext}>Income - Expenses</Text>
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
              <Text style={styles.sectionTitle}>REVENUE (T2125 PART 3)</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineItemLabel}>3A - Gross Sales (incl. GST/HST)</Text>
              <Text style={styles.lineItemAmount}>${totalGrossSales.toFixed(2)}</Text>
            </View>
            {totalGstCollected > 0 && (
              <View style={styles.lineItem}>
                <Text style={[styles.lineItemLabel, { color: '#DC2626' }]}>3B - GST/HST Collected</Text>
                <Text style={[styles.lineItemAmount, { color: '#DC2626' }]}>-${totalGstCollected.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.lineItem, styles.subtotalLine]}>
              <Text style={styles.subtotalLabel}>3C - Subtotal</Text>
              <Text style={styles.subtotalAmount}>${totalNetSales.toFixed(2)}</Text>
            </View>
            {totalOtherIncome > 0 && (
              <View style={styles.lineItem}>
                <Text style={styles.lineItemLabel}>8230 - Other Income (tips, bonuses)</Text>
                <Text style={styles.lineItemAmount}>${totalOtherIncome.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.lineItem, styles.totalLine]}>
              <Text style={styles.totalLabel}>8299 - Gross Business Income</Text>
              <Text style={styles.totalAmount}>${totalIncome.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.statementSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>VEHICLE EXPENSES</Text>
            </View>

            {Object.entries(vehicleExpensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                return (
                  <View key={category} style={styles.lineItem}>
                    <Text style={styles.lineItemLabel}>{getCategoryLabel(category)}</Text>
                    <Text style={styles.lineItemAmount}>${amount.toFixed(2)}</Text>
                  </View>
                );
              })}

            {Object.keys(vehicleExpensesByCategory).length === 0 && (
              <View style={styles.lineItem}>
                <Text style={[styles.lineItemLabel, { fontStyle: 'italic', color: '#9CA3AF' }]}>
                  No vehicle expenses recorded
                </Text>
                <Text style={styles.lineItemAmount}>$0.00</Text>
              </View>
            )}

            <View style={[styles.lineItem, styles.subtotalLine]}>
              <Text style={styles.subtotalLabel}>Vehicle Expenses Total</Text>
              <Text style={styles.subtotalAmount}>
                ${totalVehicleExpensesBeforeBusinessUse.toFixed(2)}
              </Text>
            </View>

            <View style={styles.lineItem}>
              <Text style={[styles.lineItemLabel, { color: '#6B7280', fontSize: 13 }]}>
                Business Use % (from mileage)
              </Text>
              <Text style={[styles.lineItemAmount, { color: '#6B7280', fontSize: 13 }]}>
                {mileageBusinessUsePercentage.toFixed(1)}%
              </Text>
            </View>

            <View style={[styles.lineItem, styles.deductibleLine]}>
              <Text style={styles.deductibleLineLabel}>Deductible Vehicle Expenses</Text>
              <Text style={styles.deductibleLineAmount}>
                ${totalVehicleExpenses.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.statementSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>OPERATING EXPENSES</Text>
            </View>

            {Object.entries(operatingExpensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                return (
                  <View key={category} style={styles.lineItem}>
                    <Text style={styles.lineItemLabel}>{getCategoryLabel(category)}</Text>
                    <Text style={styles.lineItemAmount}>${amount.toFixed(2)}</Text>
                  </View>
                );
              })}

            {Object.keys(operatingExpensesByCategory).length === 0 && (
              <View style={styles.lineItem}>
                <Text style={[styles.lineItemLabel, { fontStyle: 'italic', color: '#9CA3AF' }]}>
                  No operating expenses recorded
                </Text>
                <Text style={styles.lineItemAmount}>$0.00</Text>
              </View>
            )}

            <View style={[styles.lineItem, styles.deductibleLine]}>
              <Text style={styles.deductibleLineLabel}>Operating Expenses Subtotal</Text>
              <Text style={styles.deductibleLineAmount}>
                ${totalOperatingExpenses.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.statementSection}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.sectionTitle}>VEHICLE DEPRECIATION (CCA)</Text>
                <TouchableOpacity onPress={() => setShowCcaTooltip(!showCcaTooltip)}>
                  <Info size={14} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              {showCcaTooltip && (
                <View style={styles.tooltipBox}>
                  <Text style={styles.tooltipText}>
                    CRA allows you to deduct part of your vehicle's cost each year as depreciation (Capital Cost Allowance). Only the business-use portion is deductible.
                  </Text>
                </View>
              )}
            </View>

            {ccaData ? (
              <>
                <View style={styles.lineItem}>
                  <Text style={styles.lineItemLabel}>Annual CCA Deduction</Text>
                  <Text style={styles.lineItemAmount}>${ccaData.ccaDeduction.toFixed(2)}</Text>
                </View>

                <View style={styles.lineItem}>
                  <Text style={[styles.lineItemLabel, { color: '#6B7280', fontSize: 13 }]}>
                    Business Use % (from mileage)
                  </Text>
                  <Text style={[styles.lineItemAmount, { color: '#6B7280', fontSize: 13 }]}>
                    {mileageBusinessUsePercentage.toFixed(1)}%
                  </Text>
                </View>

                <View style={[styles.lineItem, styles.deductibleLine]}>
                  <Text style={styles.deductibleLineLabel}>Deductible CCA</Text>
                  <Text style={styles.deductibleLineAmount}>
                    ${deductibleCca.toFixed(2)}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.lineItem}>
                <Text style={[styles.lineItemLabel, { fontStyle: 'italic', color: '#9CA3AF' }]}>
                  No CCA calculated yet
                </Text>
                <Text style={styles.lineItemAmount}>$0.00</Text>
              </View>
            )}
          </View>

          <View style={styles.statementSection}>
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

      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </View>
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
  subtotalLine: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
    paddingTop: 12,
  },
  subtotalLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#6B7280',
  },
  subtotalAmount: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#6B7280',
  },
  deductibleLine: {
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    marginTop: 12,
    paddingTop: 12,
    backgroundColor: '#EFF6FF',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deductibleLineLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#1E40AF',
  },
  deductibleLineAmount: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#1E40AF',
  },
  totalLine: {
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
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
  tooltipBox: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  tooltipText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#4B5563',
    lineHeight: 18,
  },
});
