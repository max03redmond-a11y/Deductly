import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Card } from './Card';
import { theme } from '@/constants/theme';

interface IncomePart3CCardProps {
  line3A: number;
  line3B: number;
  line3C: number;
  line8230: number;
  line8299: number;
  hasWarning?: boolean;
  warningMessage?: string | null;
  readOnly?: boolean;
}

export function IncomePart3CCard({
  line3A,
  line3B,
  line3C,
  line8230,
  line8299,
  hasWarning = false,
  warningMessage = null,
  readOnly = false,
}: IncomePart3CCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Part 3C — Business Income</Text>

      {hasWarning && warningMessage && (
        <View style={styles.warningBox}>
          <AlertCircle size={16} color={theme.colors.warning} />
          <Text style={styles.warningText}>{warningMessage}</Text>
        </View>
      )}

      <View style={styles.row}>
        <Text style={styles.lineLabel}>3A Gross sales (incl. GST/HST)</Text>
        <Text style={styles.lineValue}>${line3A.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.lineLabel}>3B GST/HST collected</Text>
        <Text style={[styles.lineValue, styles.negativeValue]}>
          ${line3B.toFixed(2)}
        </Text>
      </View>

      <View style={[styles.row, styles.subtotalRow]}>
        <Text style={styles.subtotalLabel}>3C Net sales</Text>
        <Text style={styles.subtotalValue}>${line3C.toFixed(2)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.lineLabel}>8230 Other income</Text>
        <Text style={styles.lineValue}>${line8230.toFixed(2)}</Text>
      </View>
      <Text style={styles.helperText}>Tips, bonuses, referrals</Text>

      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>8299 Gross business income</Text>
        <Text style={styles.totalValue}>${line8299.toFixed(2)}</Text>
      </View>

      <Text style={styles.formulaText}>
        Gross business income = (Gross sales − GST/HST) + Other income
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.warning,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lineLabel: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  lineValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  negativeValue: {
    color: theme.colors.error,
  },
  subtotalRow: {
    paddingTop: 8,
    marginBottom: 0,
  },
  subtotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  subtotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 16,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: -8,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  totalRow: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.success,
  },
  formulaText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
