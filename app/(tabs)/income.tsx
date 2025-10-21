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
import { IncomePart3CCard } from '@/components/IncomePart3CCard';
import {
  getIncomeTotalsPart3C,
  calculateIncomeTotalsDisplay,
  IncomeTotalsPart3C,
  IncomeTotalsDisplay,
} from '@/lib/calcs/income';

export default function IncomeScreen() {
  const { incomeEntries, loadIncomeEntries, removeIncomeEntry, loading } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<IncomeEntry | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [incomeTotals, setIncomeTotals] = useState<IncomeTotalsDisplay>({
    line3A: 0,
    line3B: 0,
    line3C: 0,
    line8230: 0,
    line8299: 0,
    hasWarning: false,
    warningMessage: null,
  });

  useEffect(() => {
    loadIncomeEntries();
    loadIncomeTotals();
  }, []);

  const loadIncomeTotals = async () => {
    const totals = await getIncomeTotalsPart3C();
    const display = calculateIncomeTotalsDisplay(totals);
    setIncomeTotals(display);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncomeEntries();
    await loadIncomeTotals();
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
    await loadIncomeTotals();
  };

  const renderIncomeEntry = ({ item }: { item: IncomeEntry }) => {
    const date = new Date(item.date);
    const dateStr = date.toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
    });

    const grossIncome = Number(item.gross_income);
    const gstCollected = Number(item.gst_collected || 0);
    const tips = Number(item.tips || 0);
    const bonuses = Number(item.bonuses || 0);
    const otherIncome = Number(item.other_income || 0);
    const netIncome = grossIncome - gstCollected;
    const totalOtherIncome = tips + bonuses + otherIncome;

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
          {totalOtherIncome > 0 && (
            <Text style={styles.incomeSubtext}>
              Other income: ${totalOtherIncome.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Income" />

      <View style={styles.summaryContainer}>
        <IncomePart3CCard
          line3A={incomeTotals.line3A}
          line3B={incomeTotals.line3B}
          line3C={incomeTotals.line3C}
          line8230={incomeTotals.line8230}
          line8299={incomeTotals.line8299}
          hasWarning={incomeTotals.hasWarning}
          warningMessage={incomeTotals.warningMessage}
        />

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
          description="Start tracking your income by adding your first sale"
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
          loadIncomeTotals();
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
  addButton: {
    width: '100%',
    marginTop: 12,
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
  incomeSubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
});
