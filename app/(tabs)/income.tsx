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

  const totalNetPayout = incomeEntries.reduce((sum, entry) => sum + Number(entry.net_payout), 0);

  const renderIncomeEntry = ({ item }: { item: IncomeEntry }) => {
    const date = new Date(item.date);
    const dateStr = date.toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
    });

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
            {dateStr} – ${Number(item.net_payout).toFixed(2)}
            {item.trips_completed && ` – ${item.trips_completed} trips`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Income" />

      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Net Payout</Text>
              <Text style={styles.summaryValue}>${totalNetPayout.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        <Button
          title="Add Payout"
          onPress={handleAddIncome}
          style={styles.addButton}
        />
      </View>

      {incomeEntries.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No payouts yet"
          description="Start tracking your income by adding your first payout"
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
  incomeText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: 8,
  },
  deleteButton: {
    padding: 4,
  },
});
