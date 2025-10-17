import { useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { EXPENSE_CATEGORIES } from '@/types/database';
import { TrendingUp, DollarSign, Receipt, ChevronRight, Gift } from 'lucide-react-native';
import { router } from 'expo-router';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { ReferralCard } from '@/components/ReferralCard';
import { useAppState } from '@/lib/state/appStore';
import { calculateSummaryTotals, getYTDFilter } from '@/lib/calcs/summary';

export default function HomeScreen() {
  const { profile } = useAuth();
  const allExpenses = useAppState((state) => state.expenses);
  const income = useAppState((state) => state.income);
  const mileage = useAppState((state) => state.mileage);
  const referrals = useAppState((state) => state.referrals);
  const loading = useAppState((state) => state.loading);
  const initialized = useAppState((state) => state.initialized);
  const userId = useAppState((state) => state.userId);

  const expenses = useMemo(() => allExpenses.slice(0, 5), [allExpenses]);

  const totals = useMemo(() => {
    return calculateSummaryTotals(allExpenses, income, mileage, getYTDFilter());
  }, [allExpenses, income, mileage]);

  useEffect(() => {
    if (profile?.id && profile.id !== userId) {
      useAppState.getState().setUserId(profile.id);
      useAppState.getState().loadAllData();

      const unsubscribe = useAppState.getState().subscribeToRealtime();
      return unsubscribe;
    }
  }, [profile?.id, userId]);

  useFocusEffect(
    useCallback(() => {
      if (initialized && userId) {
        useAppState.getState().loadAllData();
      }
    }, [initialized, userId])
  );

  return (
    <View style={styles.container}>
      <PageHeader
        title={`Good day, ${profile?.full_name?.split(' ')[0] || 'Driver'}`}
        subtitle="Here's your business overview"
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Summary Cards */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/dashboard')}
            activeOpacity={0.7}
          >
            <View style={styles.statIconContainer}>
              <TrendingUp size={20} color="#059669" strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>${totals.totalIncome.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Income YTD</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/expenses')}
            activeOpacity={0.7}
          >
            <View style={styles.statIconContainer}>
              <Receipt size={20} color="#DC2626" strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>${totals.totalExpenses.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Expenses YTD</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.statCard, styles.deductionCard]}
          onPress={() => router.push('/dashboard')}
          activeOpacity={0.7}
        >
          <View style={styles.deductionHeader}>
            <View style={styles.deductionIconContainer}>
              <DollarSign size={24} color="#059669" strokeWidth={2.5} />
            </View>
            <View style={styles.deductionContent}>
              <Text style={styles.deductionLabel}>Est. Tax Deductions</Text>
              <Text style={styles.deductionValue}>${totals.totalDeductible.toFixed(2)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Recent Expenses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT EXPENSES</Text>
            <TouchableOpacity
              onPress={() => router.push('/expenses')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={16} color="#059669" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {!loading && expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              message="Start tracking your business expenses to see them here."
            />
          ) : (
            <View style={styles.expenseGrid}>
              {expenses.map((expense) => {
                const categoryInfo = EXPENSE_CATEGORIES.find((c) => c.value === expense.category);
                const deductibleAmount = expense.amount * (expense.business_percentage / 100);

                return (
                  <View key={expense.id} style={styles.expenseCard}>
                    <View style={styles.expenseHeader}>
                      <View style={styles.expenseIconContainer}>
                        <Receipt size={16} color="#059669" strokeWidth={2} />
                      </View>
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
              })}
            </View>
          )}
        </View>

        {/* Referral Hub */}
        {referrals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.referralTitleContainer}>
                <Gift size={16} color="#059669" strokeWidth={2.5} />
                <Text style={styles.sectionTitle}>RECOMMENDED FINANCIAL SERVICES</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.referralScroll}
            >
              {referrals.map((referral) => (
                <ReferralCard key={referral.id} referral={referral} />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  deductionCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 28,
  },
  deductionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deductionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  deductionContent: {
    flex: 1,
  },
  deductionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 4,
  },
  deductionValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#065F46',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  expenseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  referralTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  referralScroll: {
    paddingRight: 20,
  },
});
