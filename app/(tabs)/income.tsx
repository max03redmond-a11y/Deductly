import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Plus, DollarSign, Calendar, TrendingUp } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { IncomeEntry } from '@/types/database';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { IncomeModal } from '@/components/IncomeModal';

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

  const totalIncome = incomeEntries.reduce((sum, entry) => sum + Number(entry.net_payout), 0);
  const totalGrossIncome = incomeEntries.reduce((sum, entry) => sum + Number(entry.gross_income), 0);
  const totalFees = incomeEntries.reduce((sum, entry) => sum + Number(entry.platform_fees), 0);

  const renderIncomeEntry = ({ item }: { item: IncomeEntry }) => {
    const date = new Date(item.date);
    const dateStr = date.toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        onPress={() => handleEditIncome(item)}
        onLongPress={() => handleDeleteIncome(item.id)}
        style={styles.incomeCard}
      >
        <View style={styles.incomeHeader}>
          <View style={styles.incomeIcon}>
            <DollarSign color={theme.colors.primary} size={20} />
          </View>
          <View style={styles.incomeDetails}>
            <Text style={styles.platform}>{item.platform}</Text>
            <Text style={styles.date}>{dateStr}</Text>
          </View>
          <View style={styles.incomeAmount}>
            <Text style={styles.amount}>${Number(item.net_payout).toFixed(2)}</Text>
            <Text style={styles.grossAmount}>Gross: ${Number(item.gross_income).toFixed(2)}</Text>
          </View>
        </View>
        {item.platform_fees > 0 && (
          <View style={styles.incomeBreakdown}>
            <Text style={styles.feeText}>Fees: -${Number(item.platform_fees).toFixed(2)}</Text>
          </View>
        )}
        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Income" />

      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Net Income</Text>
              <Text style={styles.summaryValue}>${totalIncome.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Gross Income</Text>
              <Text style={styles.summaryValue}>${totalGrossIncome.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Fees</Text>
              <Text style={styles.feeValue}>${totalFees.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        <Button
          onPress={handleAddIncome}
          icon={Plus}
          style={styles.addButton}
        >
          Add Income Entry
        </Button>
      </View>

      {incomeEntries.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No income entries yet"
          description="Start tracking your income by adding your first entry"
          action={
            <Button onPress={handleAddIncome} icon={Plus}>
              Add Income
            </Button>
          }
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

      {incomeEntries.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddIncome}>
          <Plus color="#fff" size={20} />
          <Text style={styles.fabText}>Add Income</Text>
        </TouchableOpacity>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 12,
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
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.success,
  },
  feeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.error,
  },
  list: {
    padding: 20,
  },
  incomeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  platform: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  incomeAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.success,
    marginBottom: 2,
  },
  grossAmount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  incomeBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  breakdownText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  feeText: {
    fontSize: 13,
    color: theme.colors.error,
  },
  notes: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
