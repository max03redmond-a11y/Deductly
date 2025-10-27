import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Plus, DollarSign, Calendar, TrendingUp, Trash2 } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { IncomeEntry } from '@/types/database';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { IncomeModal } from '@/components/IncomeModal';
import { TabScreenWrapper } from '@/components/TabScreenWrapper';

export default function IncomeScreen() {
  const { incomeEntries, loadIncomeEntries, removeIncomeEntry, loading } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<IncomeEntry | undefined>();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadIncomeEntries();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncomeEntries();
    setRefreshing(false);
  };

  const handleAddIncome = () => {
    setSelectedEntry(undefined);
    setModalVisible(true);
  };

  const handleEditIncome = (entry: IncomeEntry) => {
    setSelectedEntry(entry);
    setModalVisible(true);
  };

  const handleDeleteIncome = async (id: string) => {
    await removeIncomeEntry(id);
  };

  const totalGrossSales = incomeEntries.reduce((sum, entry) => sum + Number(entry.gross_income), 0);
  const totalGstCollected = incomeEntries.reduce((sum, entry) => sum + Number(entry.gst_collected || 0), 0);
  const totalNetSales = totalGrossSales - totalGstCollected;
  const totalOtherIncome = incomeEntries.reduce((sum, entry) => sum + Number(entry.tips || 0) + Number(entry.bonuses || 0) + Number(entry.other_income || 0), 0);
  const totalGrossBusinessIncome = totalNetSales + totalOtherIncome;

  const renderIncomeEntry = ({ item }: { item: IncomeEntry }) => {
    const date = new Date(item.date);
    const dateStr = date.toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
    });

    const grossIncome = Number(item.gross_income);
    const gstCollected = Number(item.gst_collected || 0);
    const netIncome = grossIncome - gstCollected;

    return (
      <View style={styles.incomeCard}>
        <View style={styles.incomeHeader}>
          <View style={styles.incomeIcon}>
            <DollarSign color={theme.colors.success} size={20} />
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteIncome(item.id)}
            style={styles.deleteButton}
          >
            <Trash2 size={16} color={theme.colors.error} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => handleEditIncome(item)}>
          <Text style={styles.incomeText}>
            {dateStr} – ${grossIncome.toFixed(2)}
          </Text>
          {item.includes_tax && gstCollected > 0 && (
            <Text style={styles.incomeSubtext}>
              Includes ${gstCollected.toFixed(2)} GST/HST (Net: ${netIncome.toFixed(2)})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TabScreenWrapper>
      <View style={styles.container}>
        <PageHeader title="Income" />

      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>T2125 Part 3 - Income</Text>

          <View style={styles.incomeLineItem}>
            <Text style={styles.lineLabel}>3A - Gross Sales</Text>
            <Text style={styles.lineAmount}>${totalGrossSales.toFixed(2)}</Text>
          </View>

          {totalGstCollected > 0 && (
            <View style={styles.incomeLineItem}>
              <Text style={styles.lineLabel}>3B - GST/HST Collected</Text>
              <Text style={[styles.lineAmount, { color: theme.colors.error }]}>-${totalGstCollected.toFixed(2)}</Text>
            </View>
          )}

          <View style={[styles.incomeLineItem, styles.subtotalLine]}>
            <Text style={styles.subtotalLabel}>3C - Subtotal</Text>
            <Text style={styles.subtotalAmount}>${totalNetSales.toFixed(2)}</Text>
          </View>

          {totalOtherIncome > 0 && (
            <View style={styles.incomeLineItem}>
              <Text style={styles.lineLabel}>8230 - Other Income</Text>
              <Text style={styles.lineAmount}>${totalOtherIncome.toFixed(2)}</Text>
            </View>
          )}

          <View style={[styles.incomeLineItem, styles.totalLine]}>
            <Text style={styles.totalLabel}>8299 - Gross Business Income</Text>
            <Text style={styles.totalAmount}>${totalGrossBusinessIncome.toFixed(2)}</Text>
          </View>
        </Card>

        <Button
          title="Add Income"
          onPress={handleAddIncome}
          style={styles.addButton}
        />
      </View>

      {incomeEntries.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No income yet"
          message="Start tracking your income by adding your first sale"
        />
      ) : (
        <FlatList
          data={incomeEntries}
          renderItem={renderIncomeEntry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <IncomeModal
        visible={modalVisible}
        entry={selectedEntry}
        onClose={() => {
          setModalVisible(false);
          setSelectedEntry(undefined);
        }}
      />
      </View>
    </TabScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  incomeLineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  lineLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  lineAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  subtotalLine: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 2,
    paddingTop: 8,
  },
  subtotalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  subtotalAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  totalLine: {
    borderTopWidth: 2,
    borderTopColor: theme.colors.primary,
    marginTop: 6,
    paddingTop: 8,
    backgroundColor: theme.colors.primaryLight,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: -16,
    paddingBottom: 16,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  addButton: {
    width: '100%',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.success,
  },
  feeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.error,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  incomeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  incomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  incomeDetails: {
    flex: 1,
  },
  incomeText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: 8,
  },
  incomeSubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
  netSalesRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netSalesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  netSalesValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
});
