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
  const [salesAmount, setSalesAmount] = useState('');
  const [gstAmount, setGstAmount] = useState('');

  useEffect(() => {
    if (entry) {
      setDate(entry.date);
      const gstCollected = Number(entry.gst_collected || 0);
      const grossIncome = Number(entry.gross_income);
      // Calculate sales amount (gross - gst)
      const sales = grossIncome - gstCollected;
      setSalesAmount(sales > 0 ? sales.toString() : grossIncome.toString());
      setGstAmount(gstCollected > 0 ? gstCollected.toString() : '');
    } else {
      resetForm();
    }
  }, [entry, visible]);

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setSalesAmount('');
    setGstAmount('');
  };

  const handleSave = async () => {
    if (!date || !salesAmount) {
      showToast('Please fill in date and sales amount', 'error');
      return;
    }

    const sales = parseFloat(salesAmount) || 0;
    if (sales <= 0) {
      showToast('Sales amount must be greater than zero', 'error');
      return;
    }

    const gstCollected = parseFloat(gstAmount) || 0;
    // Gross sales = Sales + GST/HST
    const grossSales = sales + gstCollected;

    setLoading(true);

    try {
      const incomeData = {
        user_id: DEFAULT_USER_ID,
        date,
        platform: 'Income',
        gross_income: grossSales,
        tips: 0,
        bonuses: 0,
        other_income: 0,
        platform_fees: 0,
        notes: null,
        gst_collected: gstCollected,
        includes_tax: gstCollected > 0,
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

  const sales = parseFloat(salesAmount) || 0;
  const gstCollected = parseFloat(gstAmount) || 0;
  const grossSales = sales + gstCollected;

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
              Sales Amount ($) <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.helperText}>
              Line 3C - Sales before tax
            </Text>
            <TextInput
              style={styles.input}
              value={salesAmount}
              onChangeText={setSalesAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              GST/HST Collected ($)
            </Text>
            <Text style={styles.helperText}>
              Line 3B - GST/HST collected (if applicable)
            </Text>
            <TextInput
              style={styles.input}
              value={gstAmount}
              onChangeText={setGstAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          {sales > 0 && (
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Line 3C - Sales (before tax)</Text>
                <Text style={styles.summaryValue}>${sales.toFixed(2)}</Text>
              </View>
              {gstCollected > 0 && (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Line 3B - GST/HST Collected</Text>
                    <Text style={styles.summaryValueSecondary}>+${gstCollected.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabelBold}>Line 3A - Gross Sales</Text>
                    <Text style={styles.summaryValueBold}>${grossSales.toFixed(2)}</Text>
                  </View>
                </>
              )}
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
  helperText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  summaryBox: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  summaryLabelBold: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  summaryValueSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.success,
  },
  summaryValueBold: {
    fontSize: 20,
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
