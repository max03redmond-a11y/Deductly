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
  const [platform, setPlatform] = useState('');
  const [grossIncome, setGrossIncome] = useState('');
  const [platformFees, setPlatformFees] = useState('');
  const [tripsCompleted, setTripsCompleted] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (entry) {
      setDate(entry.date);
      setPlatform(entry.platform);
      setGrossIncome(entry.gross_income.toString());
      setPlatformFees(entry.platform_fees.toString());
      setTripsCompleted(entry.trips_completed?.toString() || '');
      setNotes(entry.notes || '');
    } else {
      resetForm();
    }
  }, [entry, visible]);

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setPlatform('');
    setGrossIncome('');
    setPlatformFees('0');
    setTripsCompleted('');
    setNotes('');
  };

  const handleSave = async () => {
    if (!date || !platform || !grossIncome) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const incomeData = {
        user_id: DEFAULT_USER_ID,
        date,
        platform,
        gross_income: parseFloat(grossIncome) || 0,
        tips: 0,
        bonuses: 0,
        other_income: 0,
        platform_fees: parseFloat(platformFees) || 0,
        trips_completed: tripsCompleted ? parseInt(tripsCompleted) : null,
        notes: notes || null,
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

  const netPayout =
    (parseFloat(grossIncome) || 0) -
    (parseFloat(platformFees) || 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{entry ? 'Edit Income' : 'Add Income'}</Text>
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
              Platform <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={platform}
              onChangeText={setPlatform}
              placeholder="e.g., Uber, DoorDash, Lyft"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Gross Income <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={grossIncome}
              onChangeText={setGrossIncome}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Platform Fees</Text>
            <TextInput
              style={styles.input}
              value={platformFees}
              onChangeText={setPlatformFees}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Number of Trips</Text>
            <TextInput
              style={styles.input}
              value={tripsCompleted}
              onChangeText={setTripsCompleted}
              placeholder="Optional"
              keyboardType="number-pad"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              multiline
              numberOfLines={3}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Net Payout</Text>
            <Text style={styles.summaryValue}>${netPayout.toFixed(2)}</Text>
          </View>
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
