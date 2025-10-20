import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { useState } from 'react';
import { Info, HelpCircle, X } from 'lucide-react-native';
import { CRACategory } from '@/types/database';
import { theme } from '@/constants/theme';

interface CategorySelectorProps {
  categories: CRACategory[];
  selectedCode: string | null;
  onSelect: (category: CRACategory) => void;
  disabled?: boolean;
}

export function CategorySelector({
  categories,
  selectedCode,
  onSelect,
  disabled = false,
}: CategorySelectorProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailCategory, setDetailCategory] = useState<CRACategory | null>(null);

  const selectedCategory = categories.find(cat => cat.code === selectedCode);

  const handleShowDetails = (category: CRACategory) => {
    setDetailCategory(category);
    setShowDetailsModal(true);
  };

  const vehicleExpenseCodes = [
    'GAS_FUEL',
    'LOAN_INTEREST',
    'INSURANCE_AUTO',
    'LIC_REG',
    'REPAIRS_MAINT',
    'LEASE_PAYMENTS',
    'VEHICLE_ELECTRICITY'
  ];

  const vehicleCategories = categories.filter(cat =>
    vehicleExpenseCodes.includes(cat.code)
  );

  const operatingCategories = categories.filter(
    cat => !vehicleExpenseCodes.includes(cat.code) && cat.t2125_line !== null
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>VEHICLE EXPENSES</Text>
      <Text style={styles.sectionHint}>Apply business-use % to these costs</Text>
      <View style={styles.categoryGrid}>
        {vehicleCategories.map((cat) => (
          <CategoryButton
            key={cat.code}
            category={cat}
            selected={selectedCode === cat.code}
            onSelect={onSelect}
            onShowDetails={handleShowDetails}
            disabled={disabled}
          />
        ))}
      </View>

      <Text style={[styles.sectionLabel, { marginTop: 24 }]}>OPERATING EXPENSES</Text>
      <Text style={styles.sectionHint}>Business costs and admin</Text>
      <View style={styles.categoryGrid}>
        {operatingCategories.map((cat) => (
          <CategoryButton
            key={cat.code}
            category={cat}
            selected={selectedCode === cat.code}
            onSelect={onSelect}
            onShowDetails={handleShowDetails}
            disabled={disabled}
          />
        ))}
      </View>

      {selectedCategory && (
        <View style={styles.selectedCard}>
          <View style={styles.selectedHeader}>
            <Info size={16} color="#1E5128" />
            <Text style={styles.selectedTitle}>{selectedCategory.label}</Text>
          </View>
          <Text style={styles.selectedDescription}>
            {selectedCategory.explanation_short}
          </Text>
          {selectedCategory.t2125_line && (
            <Text style={styles.selectedReference}>
              T2125 Line: {selectedCategory.t2125_line}
              {selectedCategory.itc_eligible && ' • ITC Eligible ✓'}
            </Text>
          )}
          <TouchableOpacity
            onPress={() => handleShowDetails(selectedCategory)}
            style={styles.learnMoreButton}
          >
            <HelpCircle size={14} color="#1E5128" />
            <Text style={styles.learnMoreText}>Learn more</Text>
          </TouchableOpacity>
        </View>
      )}

      <CategoryDetailsModal
        visible={showDetailsModal}
        category={detailCategory}
        onClose={() => setShowDetailsModal(false)}
      />
    </View>
  );
}

interface CategoryButtonProps {
  category: CRACategory;
  selected: boolean;
  onSelect: (category: CRACategory) => void;
  onShowDetails: (category: CRACategory) => void;
  disabled: boolean;
}

function CategoryButton({
  category,
  selected,
  onSelect,
  onShowDetails,
  disabled,
}: CategoryButtonProps) {
  return (
    <View style={styles.categoryButtonWrapper}>
      <TouchableOpacity
        style={[
          styles.categoryButton,
          selected && styles.categoryButtonSelected,
        ]}
        onPress={() => onSelect(category)}
        disabled={disabled}
      >
        <View style={styles.categoryButtonContent}>
          <Text
            style={[
              styles.categoryButtonText,
              selected && styles.categoryButtonTextSelected,
            ]}
            numberOfLines={2}
          >
            {category.label}
          </Text>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => onShowDetails(category)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <HelpCircle size={14} color={selected ? "#059669" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

interface CategoryDetailsModalProps {
  visible: boolean;
  category: CRACategory | null;
  onClose: () => void;
}

function CategoryDetailsModal({
  visible,
  category,
  onClose,
}: CategoryDetailsModalProps) {
  if (!category) return null;

  const rules = category.explanation_rules?.split('.').filter(r => r.trim().length > 0) || [];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>{category.label}</Text>
              {category.t2125_line && (
                <Text style={styles.modalSubtitle}>
                  T2125 Line {category.t2125_line}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>What is this?</Text>
              <Text style={styles.detailText}>
                {category.explanation_short}
              </Text>
            </View>

            {rules.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>CRA Rules & Guidelines</Text>
                {rules.map((rule, index) => (
                  <View key={index} style={styles.ruleItem}>
                    <Text style={styles.ruleBullet}>•</Text>
                    <Text style={styles.ruleText}>{rule.trim()}.</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Tax Treatment</Text>
              <View style={styles.tagContainer}>
                {category.itc_eligible && (
                  <View style={[styles.tag, styles.tagGreen]}>
                    <Text style={styles.tagText}>ITC Eligible</Text>
                  </View>
                )}
                {category.apply_business_use && (
                  <View style={[styles.tag, styles.tagBlue]}>
                    <Text style={styles.tagText}>
                      Apply Business Use %
                    </Text>
                  </View>
                )}
                {category.default_business_use_target < 100 && (
                  <View style={[styles.tag, styles.tagOrange]}>
                    <Text style={styles.tagText}>
                      {category.default_business_use_target}% Deductible
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
              <Text style={styles.tipsText}>
                Keep all receipts for 6 years. We timestamp and store them for you.
              </Text>
              {category.apply_business_use && (
                <Text style={styles.tipsText}>
                  Apply business-use %. We'll use your mileage to right-size vehicle and phone costs.
                </Text>
              )}
              {category.code === 'MEALS_CLIENT' && (
                <Text style={styles.tipsText}>
                  Meals for riders only are 50% deductible. Personal meals aren't deductible.
                </Text>
              )}
              {(category.code === 'LEASE_PAYMENTS' || category.code === 'LOAN_INTEREST') && (
                <Text style={styles.tipsText}>
                  Lease and loan interest have CRA monthly caps; we'll apply them automatically.
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
    letterSpacing: 1,
  },
  sectionHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButtonWrapper: {
    width: '48%',
    marginBottom: 0,
  },
  categoryButton: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  categoryButtonSelected: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  categoryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  categoryButtonTextSelected: {
    color: '#059669',
    fontWeight: '600',
  },
  infoButton: {
    padding: 2,
  },
  selectedCard: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  selectedDescription: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
    marginBottom: 8,
  },
  selectedReference: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 8,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    fontSize: 12,
    color: '#1E5128',
    fontWeight: '600',
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ruleBullet: {
    fontSize: 14,
    color: '#1E5128',
    marginRight: 8,
    fontWeight: '700',
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagGreen: {
    backgroundColor: '#D1FAE5',
  },
  tagBlue: {
    backgroundColor: '#DBEAFE',
  },
  tagOrange: {
    backgroundColor: '#FED7AA',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  tipsSection: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
    marginBottom: 6,
  },
});
