import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { FileDown, FileSpreadsheet, X, CheckCircle2 } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { generateT2125Data } from '@/lib/t2125/mapper';
import { generateT2125PDF, exportT2125AsPDF } from '@/lib/t2125/pdfExport';
import { generateT2125CSV, downloadCSV } from '@/lib/t2125/csvExport';
import { downloadHTML } from '@/lib/t2125/htmlExport';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { Expense, IncomeRecord, IncomeEntry, MileageLog, Asset } from '@/types/database';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
}

type ExportFormat = 'pdf' | 'csv' | 'html';

export default function ExportModal({ visible, onClose }: ExportModalProps) {
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');

  const profile = useAppStore((state) => state.profile);

  const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';
  const currentYear = new Date().getFullYear();
  const lastName = profile?.full_name?.split(' ').pop()?.toLowerCase() || 'export';

  const handleExport = async () => {
    if (exporting) return;

    setExporting(true);

    try {
      // Fetch all data from Supabase
      const [expensesRes, incomeEntriesRes, mileageRes, assetsRes, profileRes, settingsRes] = await Promise.all([
        supabase.from('expenses').select('*').eq('user_id', DEFAULT_USER_ID),
        supabase.from('income_entries').select('*').eq('user_id', DEFAULT_USER_ID),
        supabase.from('mileage_logs').select('*').eq('user_id', DEFAULT_USER_ID),
        supabase.from('assets').select('*').eq('user_id', DEFAULT_USER_ID),
        supabase.from('profiles').select('*').eq('id', DEFAULT_USER_ID).maybeSingle(),
        supabase.from('mileage_settings').select('*').eq('user_id', DEFAULT_USER_ID).eq('year', currentYear).maybeSingle(),
      ]);

      if (expensesRes.error) {
        console.error('Expenses fetch error:', expensesRes.error);
        throw new Error(`Failed to fetch expenses: ${expensesRes.error.message}`);
      }
      if (incomeEntriesRes.error) {
        console.error('Income fetch error:', incomeEntriesRes.error);
        throw new Error(`Failed to fetch income: ${incomeEntriesRes.error.message}`);
      }
      if (mileageRes.error) {
        console.error('Mileage fetch error:', mileageRes.error);
        throw new Error(`Failed to fetch mileage: ${mileageRes.error.message}`);
      }

      // Assets table might not exist yet, so we'll handle it gracefully
      const assets = assetsRes.error ? [] : ((assetsRes.data || []) as Asset[]);
      if (assetsRes.error) {
        console.warn('Assets fetch error (continuing without assets):', assetsRes.error);
      }

      const expenses = (expensesRes.data || []) as Expense[];
      const incomeEntries = (incomeEntriesRes.data || []) as IncomeEntry[];
      const mileage = (mileageRes.data || []) as MileageLog[];
      const userProfile = profileRes.data || profile;
      const mileageSettings = settingsRes.data || null;

      // Load CCA data from storage
      const ccaData = await storage.getJSON<{ ccaDeduction: number; remainingUCC: number }>(STORAGE_KEYS.CCA_DATA);

      console.log('Export data counts:', {
        expenses: expenses.length,
        income: incomeEntries.length,
        mileage: mileage.length,
        assets: assets.length,
        ccaData: ccaData,
      });

      const t2125Data = generateT2125Data(userProfile, expenses, incomeEntries, mileage, assets, mileageSettings, ccaData);

      console.log('T2125 generated:', {
        name: t2125Data.identification.yourName,
        totalIncome: t2125Data.part3c_income.line8299_grossBusinessIncome,
        totalExpenses: t2125Data.part4_expenses.line9368_totalExpenses,
        ccaDeduction: t2125Data.part4_expenses.line9936_cca,
        assetsCount: assets.length,
      });

      const filename = `T2125_${currentYear}_${lastName}`;

      switch (selectedFormat) {
        case 'pdf': {
          const pdfHTML = generateT2125PDF(t2125Data);
          console.log('HTML generated, length:', pdfHTML.length);
          console.log('HTML starts with:', pdfHTML.substring(0, 200));
          await exportT2125AsPDF(pdfHTML, `${filename}.pdf`);
          showToast('PDF export started! Check your downloads or print dialog.', 'success');
          break;
        }
        case 'csv': {
          const csvContent = generateT2125CSV(t2125Data);
          await downloadCSV(csvContent, `${filename}.csv`);
          showToast('CSV exported successfully!', 'success');
          break;
        }
        case 'html': {
          const htmlContent = generateT2125PDF(t2125Data);
          await downloadHTML(htmlContent, `${filename}.html`);
          showToast('HTML report exported successfully!', 'success');
          break;
        }
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Export error:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      showToast(`Export failed: ${errorMessage}`, 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Export T2125 Report</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              Generate your CRA T2125 Statement of Business Activities for tax year {currentYear}
            </Text>

            <View style={styles.infoBox}>
              <CheckCircle2 size={20} color={theme.colors.success} />
              <Text style={styles.infoText}>
                All your income, expenses, and mileage data will be automatically mapped to CRA line numbers
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Select Export Format</Text>

            <TouchableOpacity
              style={[
                styles.formatOption,
                selectedFormat === 'pdf' && styles.formatOptionSelected,
              ]}
              onPress={() => setSelectedFormat('pdf')}
            >
              <View style={styles.formatIcon}>
                <FileDown size={24} color={selectedFormat === 'pdf' ? theme.colors.primary : theme.colors.textSecondary} />
              </View>
              <View style={styles.formatDetails}>
                <Text style={[
                  styles.formatTitle,
                  selectedFormat === 'pdf' && styles.formatTitleSelected,
                ]}>
                  PDF Report (Recommended)
                </Text>
                <Text style={styles.formatDescription}>
                  Print-ready CRA-compliant format. Perfect for your accountant or tax software.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.formatOption,
                selectedFormat === 'csv' && styles.formatOptionSelected,
              ]}
              onPress={() => setSelectedFormat('csv')}
            >
              <View style={styles.formatIcon}>
                <FileSpreadsheet size={24} color={selectedFormat === 'csv' ? theme.colors.primary : theme.colors.textSecondary} />
              </View>
              <View style={styles.formatDetails}>
                <Text style={[
                  styles.formatTitle,
                  selectedFormat === 'csv' && styles.formatTitleSelected,
                ]}>
                  CSV Spreadsheet
                </Text>
                <Text style={styles.formatDescription}>
                  Import into Excel, Google Sheets, or accounting software. Includes all line items.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.formatOption,
                selectedFormat === 'html' && styles.formatOptionSelected,
              ]}
              onPress={() => setSelectedFormat('html')}
            >
              <View style={styles.formatIcon}>
                <FileDown size={24} color={selectedFormat === 'html' ? theme.colors.primary : theme.colors.textSecondary} />
              </View>
              <View style={styles.formatDetails}>
                <Text style={[
                  styles.formatTitle,
                  selectedFormat === 'html' && styles.formatTitleSelected,
                ]}>
                  HTML Report
                </Text>
                <Text style={styles.formatDescription}>
                  View in any web browser. Easy to share via email or cloud storage.
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>What's Included:</Text>
              <Text style={styles.summaryItem}>✓ Part 1: Business identification</Text>
              <Text style={styles.summaryItem}>✓ Part 2: Internet business activities</Text>
              <Text style={styles.summaryItem}>✓ Part 3: Income (Line 8000, 8299)</Text>
              <Text style={styles.summaryItem}>✓ Part 4: All expense categories (8521-9945)</Text>
              <Text style={styles.summaryItem}>✓ Chart A: Motor vehicle expenses</Text>
              <Text style={styles.summaryItem}>✓ Detailed expense breakdown</Text>
              <Text style={styles.summaryItem}>✓ Net income calculation</Text>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>📋 Important:</Text>
              <Text style={styles.warningText}>
                This export is for reference only. Use NETFILE-certified tax software (TurboTax, Wealthsimple Tax) or the official T2125 PDF from canada.ca to file with CRA.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={exporting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
              onPress={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <FileDown size={20} color="#fff" />
                  <Text style={styles.exportButtonText}>
                    Export {selectedFormat.toUpperCase()}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
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
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  formatOption: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  formatOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#f0f9ff',
  },
  formatIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatDetails: {
    flex: 1,
  },
  formatTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  formatTitleSelected: {
    color: theme.colors.primary,
  },
  formatDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  summaryBox: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  summaryItem: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
