import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Plus, Receipt, Info, Trash2 } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Expense, EXPENSE_CATEGORIES } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { formatCategoryLabel } from '@/lib/formatters';

export default function ExpensesScreen() {
  const { items: expenses, loading, loadExpenses, removeExpense, user } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ visible: boolean; expense: Expense | null }>({
    visible: false,
    expense: null,
  });

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const handleDeleteRequest = (expense: Expense) => {
    setDeleteConfirm({ visible: true, expense });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.expense) {
      await removeExpense(deleteConfirm.expense.id);
    }
    setDeleteConfirm({ visible: false, expense: null });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ visible: false, expense: null });
  };

  const totalDeductible = expenses.reduce((sum, expense) => {
    return sum + (expense.amount * (expense.business_percentage / 100));
  }, 0);

  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.amount * (expense.business_percentage / 100);
    return acc;
  }, {} as Record<string, number>);

  return (
    <View style={styles.container} testID="expenses-screen">
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerLabel}>Total Deductible (YTD)</Text>
            <Text style={styles.headerAmount}>${totalDeductible.toFixed(2)}</Text>
            <Text style={styles.headerSubtext}>{expenses.length} expenses tracked</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
            testID="btn-add-expense"
          >
            <Plus size={20} color="#1E5128" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E5128" />
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EXPENSES BY CATEGORY</Text>
              {Object.keys(expensesByCategory).length === 0 ? (
                <View style={styles.emptyCard}>
                  <Receipt size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No expenses yet</Text>
                  <Text style={styles.emptySubtext}>Tap the + button to add your first expense</Text>
                </View>
              ) : (
                Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => {
                    const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === category);
                    const categoryLabel = categoryInfo?.label || formatCategoryLabel(category);
                    const percentage = (amount / totalDeductible) * 100;
                    return (
                      <View key={category} style={styles.categoryCard}>
                        <View style={styles.categoryHeader}>
                          <View style={styles.categoryInfo}>
                            <Text style={styles.categoryName}>{categoryLabel}</Text>
                            <Text style={styles.categoryDescription}>{categoryInfo?.description}</Text>
                          </View>
                          <View style={styles.categoryAmountContainer}>
                            <Text style={styles.categoryAmount}>${amount.toFixed(2)}</Text>
                            <Text style={styles.categoryPercentage}>{percentage.toFixed(0)}%</Text>
                          </View>
                        </View>
                        <View style={styles.categoryBar}>
                          <View
                            style={[
                              styles.categoryBarFill,
                              { width: `${Math.min(percentage, 100)}%` },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RECENT EXPENSES</Text>
              {expenses.length > 0 ? (
                expenses.slice(0, 20).map((expense) => (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    onDelete={() => handleDeleteRequest(expense)}
                  />
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptySubtext}>No recent expenses</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <AddExpenseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadExpenses();
        }}
      />

      <ConfirmDialog
        visible={deleteConfirm.visible}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense from ${deleteConfirm.expense?.merchant_name}?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        testID="confirm-delete-expense"
      />
    </View>
  );
}

function ExpenseItem({ expense, onDelete }: { expense: Expense; onDelete: () => void }) {
  const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === expense.category);
  const categoryLabel = expense.category_label || categoryInfo?.label || formatCategoryLabel(expense.category_code || expense.category);
  const deductibleAmount = expense.amount * (expense.business_percentage / 100);

  return (
    <View style={styles.expenseCard} testID={`expense-item-${expense.id}`}>
      <View style={styles.expenseContent}>
        <View style={styles.expenseIconContainer}>
          <Receipt size={20} color="#1E5128" />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseMerchant}>{expense.merchant_name}</Text>
          <View style={styles.expenseMeta}>
            <Text style={styles.expenseCategory}>{categoryLabel}</Text>
            <Text style={styles.expenseDate}>
              {new Date(expense.date).toLocaleDateString('en-CA', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <View style={styles.expenseAmounts}>
          <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
          {expense.business_percentage < 100 && (
            <Text style={styles.expenseDeductible}>
              ${deductibleAmount.toFixed(2)} ({expense.business_percentage}%)
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}
          testID={`btn-delete-expense-${expense.id}`}
        >
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AddExpenseModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user, addExpense, showToast } = useAppStore();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [businessPercentage, setBusinessPercentage] = useState('100');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!merchant || !amount || !category || !user) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const amountNum = parseFloat(amount);
    const percentageNum = parseFloat(businessPercentage);

    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      showToast('Business percentage must be between 0 and 100', 'error');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.from('expenses').insert({
        user_id: user.id,
        date,
        merchant_name: merchant,
        amount: amountNum,
        category,
        business_percentage: percentageNum,
        is_business: percentageNum > 0,
        imported_from: 'manual',
      }).select().single();

      if (error) throw error;

      if (data) {
        addExpense(data);
      }

      setMerchant('');
      setAmount('');
      setCategory('');
      setBusinessPercentage('100');
      showToast('Expense added successfully', 'success');
      onSuccess();
    } catch (error: any) {
      showToast('Failed to add expense: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = EXPENSE_CATEGORIES.find(c => c.value === category);

  return (
    <Modal visible={visible} animationType="slide" transparent testID="add-expense-modal">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TouchableOpacity onPress={onClose} testID="btn-close-modal">
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                editable={!loading}
                testID="input-expense-date"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Merchant</Text>
              <TextInput
                style={styles.input}
                value={merchant}
                onChangeText={setMerchant}
                placeholder="Where did you spend?"
                placeholderTextColor="#9CA3AF"
                editable={!loading}
                testID="input-expense-merchant"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                editable={!loading}
                testID="input-expense-amount"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <Text style={styles.inputHint}>Select the type of expense</Text>
              <View style={styles.categoryGrid}>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryOption,
                      category === cat.value && styles.categoryOptionSelected,
                    ]}
                    onPress={() => setCategory(cat.value)}
                    disabled={loading}
                    testID={`category-${cat.value}`}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        category === cat.value && styles.categoryOptionTextSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedCategory && (
                <View style={styles.categoryDescriptionCard}>
                  <Info size={16} color="#1E5128" />
                  <View style={styles.categoryDescriptionContent}>
                    <Text style={styles.categoryDescriptionText}>
                      {selectedCategory.description}
                    </Text>
                    {selectedCategory.craReference && (
                      <Text style={styles.categoryDescriptionReference}>
                        CRA Ref: {selectedCategory.craReference}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Use Percentage</Text>
              <Text style={styles.inputHint}>
                What percentage was used for business? (Usually 100% for business expenses)
              </Text>
              <View style={styles.percentageButtons}>
                {['100', '75', '50', '25'].map((pct) => (
                  <TouchableOpacity
                    key={pct}
                    style={[
                      styles.percentageButton,
                      businessPercentage === pct && styles.percentageButtonSelected,
                    ]}
                    onPress={() => setBusinessPercentage(pct)}
                    disabled={loading}
                    testID={`percentage-${pct}`}
                  >
                    <Text
                      style={[
                        styles.percentageButtonText,
                        businessPercentage === pct && styles.percentageButtonTextSelected,
                      ]}
                    >
                      {pct}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={businessPercentage}
                onChangeText={setBusinessPercentage}
                placeholder="Custom %"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                editable={!loading}
                testID="input-expense-percentage"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleAdd}
              disabled={loading}
              testID="btn-submit-expense"
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Adding...' : 'Add Expense'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  header: {
    backgroundColor: '#1E5128',
    paddingTop: 30,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtext: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 16,
    letterSpacing: 1,
    paddingHorizontal: 4,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  categoryAmountContainer: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E5128',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: '#1E5128',
    borderRadius: 3,
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  expenseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseMerchant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  expenseMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  expenseCategory: {
    fontSize: 13,
    color: '#6B7280',
  },
  expenseDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  expenseAmounts: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  expenseDeductible: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 16,
    color: '#1E5128',
    fontWeight: '600',
  },
  modalForm: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  categoryOptionSelected: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  categoryOptionText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryOptionTextSelected: {
    color: '#059669',
    fontWeight: '600',
  },
  categoryDescriptionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  categoryDescriptionContent: {
    flex: 1,
  },
  categoryDescriptionText: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 18,
    marginBottom: 6,
  },
  categoryDescriptionReference: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  percentageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  percentageButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  percentageButtonSelected: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  percentageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  percentageButtonTextSelected: {
    color: '#059669',
  },
  submitButton: {
    backgroundColor: '#1E5128',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
