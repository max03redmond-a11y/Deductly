import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { IncomeEntry } from '@/types/database';
import { Button } from './Button';
import { theme } from '@/constants/theme';

interface IncomeModalProps {
  visible: boolean;
  entry?: IncomeEntry;
  onClose: () => void;
}

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export function IncomeModal({ visible, entry, onClose }: IncomeModalProps) {
  const { addIncomeEntry, loadIncomeEntries, showToast } = useAppStore();
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [tripsCompleted, setTripsCompleted] = useState('');

  useEffect(() => {
    if (entry) {
      setDate(entry.date);
      setPayoutAmount(entry.net_payout.toString());
      setTripsCompleted(entry.trips_completed?.toString() || '');
    } else {
      resetForm();
    }
  }, [entry, visible]);

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setPayoutAmount('');
    setTripsCompleted('');
  };

  const handleSave = async () => {
    if (!date || !payoutAmount) {
      showToast('Please fill in date and payout amount', 'error');
      return;
    }

    const payout = parseFloat(payoutAmount) || 0;
    if (payout <= 0) {
      showToast('Payout amount must be greater than zero', 'error');
      return;
    }

    setLoading(true);

    try {
      const incomeData = {
        user_id: DEFAULT_USER_ID,
        date,
        platform: 'Payout',
        gross_income: payout,
        tips: 0,
        bonuses: 0,
        other_income: 0,
        platform_fees: 0,
        notes: null,
      };

      if (entry) {
        const { error } = await supabase
          .from('income_entries')
          .update(incomeData)
          .eq('id', entry.id)
          .eq('user_id', DEFAULT_USER_ID);

        if (error) throw error;
        showToast('Income entry updated', 'success');
      } else {
        const { data, error } = await supabase
          .from('income_entries')
          .insert([incomeData])
          .select()
          .single();

        if (error) throw error;
        if (data) addIncomeEntry(data);
        showToast('Income entry added', 'success');
      }

      await loadIncomeEntries();
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Save income error:', error);
      showToast('Failed to save income entry: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const payout = parseFloat(payoutAmount) || 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{entry ? 'Edit Payout' : 'Add Payout'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color={theme.colors.text} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>
              Date <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Payout Amount ($) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={payoutAmount}
              onChangeText={setPayoutAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>


          {payout > 0 && (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Payout</Text>
              <Text style={styles.summaryValue}>${payout.toFixed(2)}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button variant="outline" onPress={onClose} style={styles.button}>
            Cancel
          </Button>
          <Button onPress={handleSave} loading={loading} style={styles.button}>
            {entry ? 'Update' : 'Add Income'}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryBox: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.success,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  button: {
    flex: 1,
  },
});
