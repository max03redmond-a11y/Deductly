import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { CRACategory } from '@/types/database';
import { CategorySelector } from './CategorySelector';
import { useCRACategories } from '@/hooks/useCRACategories';

interface EnhancedExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export function EnhancedExpenseModal({
  visible,
  onClose,
  onSuccess,
}: EnhancedExpenseModalProps) {
  const { categories, loading: categoriesLoading, getVehicleCategories } = useCRACategories();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('');
  const [amountBeforeTax, setAmountBeforeTax] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CRACategory | null>(null);
  const [businessPercentage, setBusinessPercentage] = useState('100');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [mileageBusinessUse, setMileageBusinessUse] = useState<number>(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (visible) {
      setDate(new Date().toISOString().split('T')[0]);
      setVendor('');
      setAmountBeforeTax('');
      setTaxAmount('');
      setSelectedCategory(null);
      setBusinessPercentage('100');
      setNotes('');
      loadMileageBusinessUse();
    }
  }, [visible]);

  const loadMileageBusinessUse = async () => {
    const currentYear = new Date().getFullYear();
    const { data } = await supabase
      .from('mileage_settings')
      .select('jan1_odometer_km, current_odometer_km')
      .eq('user_id', DEFAULT_USER_ID)
      .eq('year', currentYear)
      .maybeSingle();

    if (data && isMountedRef.current) {
      const totalKm = data.current_odometer_km - data.jan1_odometer_km;
      if (totalKm > 0) {
        const { data: logs } = await supabase
          .from('mileage_logs')
          .select('distance_km, is_business')
          .eq('user_id', DEFAULT_USER_ID)
          .gte('date', `${currentYear}-01-01`)
          .lte('date', `${currentYear}-12-31`);

        if (logs && isMountedRef.current) {
          const businessKm = logs
            .filter(log => log.is_business)
            .reduce((sum, log) => sum + log.distance_km, 0);
          const percentage = Math.min(100, Math.max(0, (businessKm / totalKm) * 100));
          setMileageBusinessUse(percentage);
        }
      }
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory.apply_business_use && mileageBusinessUse > 0) {
        setBusinessPercentage(mileageBusinessUse.toFixed(1));
      } else {
        setBusinessPercentage(selectedCategory.default_business_use_target.toString());
      }
    }
  }, [selectedCategory, mileageBusinessUse]);

  const calculateTotalAmount = (): number => {
    const beforeTax = parseFloat(amountBeforeTax) || 0;
    const tax = parseFloat(taxAmount) || 0;
    return beforeTax + tax;
  };

  const calculateDeductibleAmount = (): number => {
    const total = calculateTotalAmount();
    const percentage = parseFloat(businessPercentage) || 0;
    return (total * percentage) / 100;
  };

  const handleAdd = async () => {
    if (!vendor || !amountBeforeTax || !selectedCategory) {
      const message = 'Please fill in vendor, amount, and select a category';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    const beforeTax = parseFloat(amountBeforeTax);
    const tax = parseFloat(taxAmount) || 0;
    const percentageNum = parseFloat(businessPercentage);

    if (isNaN(beforeTax) || beforeTax <= 0) {
      const message = 'Please enter a valid amount';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      const message = 'Business percentage must be between 0 and 100';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    setLoading(true);

    const totalAmount = calculateTotalAmount();
    const deductibleAmount = calculateDeductibleAmount();

    const { error } = await supabase.from('expenses').insert({
      user_id: DEFAULT_USER_ID,
      date,
      vendor,
      merchant_name: vendor,
      amount_before_tax: beforeTax,
      tax_paid_hst: tax,
      total_amount: totalAmount,
      amount: totalAmount,
      tax_amount: tax,
      deductible_amount: deductibleAmount,
      category_code: selectedCategory.code,
      category_label: selectedCategory.label,
      category: selectedCategory.code,
      business_percentage: percentageNum,
      is_business: percentageNum > 0,
      itc_eligible: selectedCategory.itc_eligible,
      notes,
      imported_from: 'manual',
    });

    if (error) {
      const message = error.message;
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      setLoading(false);
    } else {
      setLoading(false);
      onSuccess();
    }
  };

  const totalAmount = calculateTotalAmount();
  const deductibleAmount = calculateDeductibleAmount();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlayBackground} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Add Expense</Text>
              <Text style={styles.modalSubtitle}>Track a new business expense</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            nestedScrollEnabled={true}
            bounces={true}
          >
            {/* Step 1: Basic Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>BASIC INFORMATION</Text>

              <View style={styles.row}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Date</Text>
                  <TextInput
                    style={styles.input}
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Vendor</Text>
                  <TextInput
                    style={styles.input}
                    value={vendor}
                    onChangeText={setVendor}
                    placeholder="e.g., Esso, Canadian Tire"
                    placeholderTextColor="#9CA3AF"
                    editable={!loading}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>

            {/* Step 2: Amount */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AMOUNT</Text>

              <View style={styles.amountGrid}>
                <View style={styles.amountItem}>
                  <Text style={styles.label}>Before Tax</Text>
                  <View style={styles.dollarInput}>
                    <Text style={styles.dollarSign}>$</Text>
                    <TextInput
                      style={styles.amountField}
                      value={amountBeforeTax}
                      onChangeText={setAmountBeforeTax}
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="decimal-pad"
                      editable={!loading}
                    />
                  </View>
                </View>

                <View style={styles.amountItem}>
                  <Text style={styles.label}>HST/GST</Text>
                  <View style={styles.dollarInput}>
                    <Text style={styles.dollarSign}>$</Text>
                    <TextInput
                      style={styles.amountField}
                      value={taxAmount}
                      onChangeText={setTaxAmount}
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="decimal-pad"
                      editable={!loading}
                    />
                  </View>
                </View>
              </View>

              {totalAmount > 0 && (
                <View style={styles.totalBanner}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
                </View>
              )}
            </View>

            {/* Step 3: Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CATEGORY</Text>
              {categoriesLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading categories...</Text>
                </View>
              ) : (
                <CategorySelector
                  categories={categories}
                  selectedCode={selectedCategory?.code || null}
                  onSelect={setSelectedCategory}
                  disabled={loading}
                />
              )}
            </View>

            {/* Step 4: Business Use */}
            {selectedCategory && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>BUSINESS USE</Text>

                {selectedCategory.apply_business_use ? (
                  <View style={styles.autoCalculatedCard}>
                    <Text style={styles.autoCalculatedLabel}>
                      Vehicle Expense - Auto-Calculated
                    </Text>
                    <View style={styles.autoPercentageDisplay}>
                      <Text style={styles.autoPercentageValue}>
                        {businessPercentage}%
                      </Text>
                      <Text style={styles.autoPercentageSubtext}>
                        Based on your mileage business-use %
                      </Text>
                    </View>
                    {mileageBusinessUse === 0 && (
                      <Text style={styles.warningText}>
                        ⚠️ Set your odometer readings in Mileage tab to calculate business-use %
                      </Text>
                    )}
                  </View>
                ) : (
                  <>
                    <Text style={styles.sectionHint}>
                      What percentage of this expense was for business?
                    </Text>

                    <View style={styles.percentageGrid}>
                      {['100', '75', '50', '25'].map((pct) => (
                        <TouchableOpacity
                          key={pct}
                          style={[
                            styles.percentageChip,
                            businessPercentage === pct && styles.percentageChipActive,
                          ]}
                          onPress={() => setBusinessPercentage(pct)}
                          disabled={loading}
                        >
                          {businessPercentage === pct && (
                            <Check size={14} color="#059669" style={styles.checkIcon} />
                          )}
                          <Text
                            style={[
                              styles.percentageText,
                              businessPercentage === pct && styles.percentageTextActive,
                            ]}
                          >
                            {pct}%
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.customPercentageRow}>
                      <Text style={styles.customLabel}>Or enter custom %:</Text>
                      <View style={styles.percentageInput}>
                        <TextInput
                          style={styles.percentageField}
                          value={businessPercentage}
                          onChangeText={setBusinessPercentage}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="decimal-pad"
                      editable={!loading}
                    />
                    <Text style={styles.percentSign}>%</Text>
                  </View>
                </View>
                  </>
                )}

                {deductibleAmount > 0 && (
                  <View style={styles.deductibleBanner}>
                    <View>
                      <Text style={styles.deductibleLabel}>Deductible Amount</Text>
                      <Text style={styles.deductibleHint}>
                        {businessPercentage}% business use
                      </Text>
                    </View>
                    <Text style={styles.deductibleAmount}>
                      ${deductibleAmount.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Step 5: Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>NOTES (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional details..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>
          </ScrollView>

          {/* Fixed Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleAdd}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Adding Expense...' : 'Add Expense'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    padding: 8,
    marginTop: -4,
  },
  modalBody: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionHint: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  row: {
    marginBottom: 16,
  },
  inputWrapper: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  notesInput: {
    minHeight: 90,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  amountGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  amountItem: {
    flex: 1,
  },
  dollarInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingLeft: 16,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 4,
  },
  amountField: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    padding: 16,
    paddingLeft: 0,
  },
  totalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  autoCalculatedCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  autoCalculatedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  autoPercentageDisplay: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  autoPercentageValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1E40AF',
  },
  autoPercentageSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#D97706',
    marginTop: 12,
    textAlign: 'center',
  },
  percentageGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  percentageChip: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  percentageChipActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  percentageText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  percentageTextActive: {
    color: '#059669',
  },
  checkIcon: {
    marginRight: -2,
  },
  customPercentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },
  customLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  percentageInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingRight: 14,
    width: 100,
  },
  percentageField: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    padding: 12,
    textAlign: 'right',
  },
  percentSign: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  deductibleBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  deductibleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 2,
  },
  deductibleHint: {
    fontSize: 12,
    color: '#3B82F6',
  },
  deductibleAmount: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#1E5128',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#1E5128',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  flex1: {
    flex: 1,
  },
  modalOverlayBackground: {
    flex: 1,
  },
});
