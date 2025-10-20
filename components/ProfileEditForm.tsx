import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Eye, EyeOff, Check, AlertCircle, Info } from 'lucide-react-native';
import { Profile, CANADIAN_PROVINCES } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { theme } from '@/constants/theme';

interface ProfileEditFormProps {
  profile: Profile;
  onSuccess: () => void;
}

export function ProfileEditForm({ profile, onSuccess }: ProfileEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [showSIN, setShowSIN] = useState(false);

  const [legalName, setLegalName] = useState(profile.legal_name || '');
  const [sin, setSin] = useState('');
  const [addressLine1, setAddressLine1] = useState(profile.mailing_address_line1 || '');
  const [addressLine2, setAddressLine2] = useState(profile.mailing_address_line2 || '');
  const [city, setCity] = useState(profile.mailing_city || '');
  const [postalCode, setPostalCode] = useState(profile.mailing_postal_code || '');
  const [province, setProvince] = useState(profile.province || '');

  const [businessName, setBusinessName] = useState(profile.business_name || '');
  const [businessAddressLine1, setBusinessAddressLine1] = useState(profile.business_address_line1 || '');
  const [businessAddressLine2, setBusinessAddressLine2] = useState(profile.business_address_line2 || '');
  const [businessCity, setBusinessCity] = useState(profile.business_city || '');
  const [businessProvince, setBusinessProvince] = useState(profile.business_province || '');
  const [businessPostalCode, setBusinessPostalCode] = useState(profile.business_postal_code || '');
  const [mainProductService, setMainProductService] = useState(profile.main_product_service || '');
  const [industryCode, setIndustryCode] = useState(profile.industry_code || '');
  const [lastYearOfBusiness, setLastYearOfBusiness] = useState(profile.last_year_of_business || false);
  const [accountingMethod, setAccountingMethod] = useState<'cash' | 'accrual'>(
    profile.accounting_method || 'cash'
  );
  const [fiscalYearStart, setFiscalYearStart] = useState(profile.fiscal_year_start || '');
  const [fiscalYearEnd, setFiscalYearEnd] = useState(profile.fiscal_year_end_date || '');

  const calculateCompleteness = (): number => {
    const fields = [
      legalName,
      sin,
      businessAddressLine1,
      businessCity,
      businessProvince,
      businessPostalCode,
      mainProductService,
      industryCode,
      accountingMethod,
      fiscalYearStart,
      fiscalYearEnd,
    ];

    const filledFields = fields.filter((f) => f && f.trim().length > 0).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  const handleSave = async () => {
    if (!legalName || !sin) {
      const msg = 'Please fill in your legal name and SIN';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Required Fields', msg);
      return;
    }

    if (sin.replace(/\D/g, '').length !== 9) {
      const msg = 'SIN must be 9 digits';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Invalid SIN', msg);
      return;
    }

    if (!mainProductService || !industryCode || !fiscalYearStart || !fiscalYearEnd) {
      const msg = 'Please complete all required business fields';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Required Fields', msg);
      return;
    }

    if (!businessAddressLine1 || !businessCity || !businessProvince || !businessPostalCode) {
      const msg = 'Please complete business address (where you operate from)';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Required Fields', msg);
      return;
    }

    setLoading(true);

    const updates: Partial<Profile> = {
      legal_name: legalName,
      sin_encrypted: sin,
      business_name: businessName || null,
      business_address_line1: businessAddressLine1,
      business_address_line2: businessAddressLine2 || null,
      business_city: businessCity,
      business_province: businessProvince,
      business_postal_code: businessPostalCode,
      main_product_service: mainProductService,
      industry_code: industryCode,
      last_year_of_business: lastYearOfBusiness,
      accounting_method: accountingMethod,
      fiscal_year_start: fiscalYearStart,
      fiscal_year_end_date: fiscalYearEnd,
      profile_completed: completeness === 100,
      profile_completed_at: completeness === 100 ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);

    setLoading(false);

    if (error) {
      const msg = error.message;
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } else {
      const msg = 'Profile updated successfully';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Success', msg);
      onSuccess();
    }
  };

  const formatSIN = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const formatPostalCode = (value: string) => {
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 3) return cleaned;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.completenessBar}>
        <View style={styles.completenessHeader}>
          <Text style={styles.completenessTitle}>Profile Completeness</Text>
          <Text style={styles.completenessPercent}>{completeness}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completeness}%` }]} />
        </View>
        {completeness < 100 && (
          <View style={styles.completenessHint}>
            <Info size={14} color="#6B7280" />
            <Text style={styles.completenessHintText}>
              Complete your profile for accurate T2125 exports
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Legal Name *</Text>
          <TextInput
            style={styles.input}
            value={legalName}
            onChangeText={setLegalName}
            placeholder="Your full legal name"
            placeholderTextColor="#9CA3AF"
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Social Insurance Number (SIN)</Text>
          <View style={styles.sinInputContainer}>
            <TextInput
              style={[styles.input, styles.sinInput]}
              value={showSIN ? formatSIN(sin) : sin ? '•••-•••-•••' : ''}
              onChangeText={(text) => setSin(text.replace(/\D/g, ''))}
              placeholder="123-456-789"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={11}
              editable={!loading && showSIN}
              secureTextEntry={!showSIN}
            />
            <TouchableOpacity
              style={styles.sinToggle}
              onPress={() => setShowSIN(!showSIN)}
            >
              {showSIN ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Encrypted and stored securely</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BUSINESS INFORMATION</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Business Name (Optional)</Text>
          <TextInput
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="e.g., Self-employed – Uber Driver"
            placeholderTextColor="#9CA3AF"
            editable={!loading}
          />
          <Text style={styles.hint}>Leave blank or write "Self-employed – Uber Driver"</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Main Product or Service *</Text>
          <TextInput
            style={styles.input}
            value={mainProductService}
            onChangeText={setMainProductService}
            placeholder="Rideshare transportation"
            placeholderTextColor="#9CA3AF"
            editable={!loading}
          />
          <Text style={styles.hint}>For Uber drivers: "Rideshare transportation" or "Driving services"</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Industry Code (Guide T4002) *</Text>
          <TextInput
            style={styles.input}
            value={industryCode}
            onChangeText={setIndustryCode}
            placeholder="485310"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
          <Text style={styles.hint}>Use 485310 – Taxi service (CRA code for rideshare drivers)</Text>
        </View>

        <View style={styles.field}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setLastYearOfBusiness(!lastYearOfBusiness)}
            disabled={loading}
          >
            <View
              style={[styles.checkboxBox, lastYearOfBusiness && styles.checkboxBoxActive]}
            >
              {lastYearOfBusiness && <Check size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>This is my last year of business</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Only check if you permanently stopped driving</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Accounting Method *</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                accountingMethod === 'cash' && styles.radioButtonActive,
              ]}
              onPress={() => setAccountingMethod('cash')}
              disabled={loading}
            >
              {accountingMethod === 'cash' && (
                <Check size={16} color="#059669" style={styles.checkIcon} />
              )}
              <Text
                style={[
                  styles.radioText,
                  accountingMethod === 'cash' && styles.radioTextActive,
                ]}
              >
                Cash Method
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioButton,
                accountingMethod === 'accrual' && styles.radioButtonActive,
              ]}
              onPress={() => setAccountingMethod('accrual')}
              disabled={loading}
            >
              {accountingMethod === 'accrual' && (
                <Check size={16} color="#059669" style={styles.checkIcon} />
              )}
              <Text
                style={[
                  styles.radioText,
                  accountingMethod === 'accrual' && styles.radioTextActive,
                ]}
              >
                Accrual Method
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Rideshare drivers should use Cash basis (report income when received)</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.fieldHalf]}>
            <Text style={styles.label}>Fiscal Year Start *</Text>
            <TextInput
              style={styles.input}
              value={fiscalYearStart}
              onChangeText={setFiscalYearStart}
              placeholder="2025-01-01"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
          </View>

          <View style={[styles.field, styles.fieldHalf]}>
            <Text style={styles.label}>Fiscal Year End *</Text>
            <TextInput
              style={styles.input}
              value={fiscalYearEnd}
              onChangeText={setFiscalYearEnd}
              placeholder="2025-12-31"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
          </View>
        </View>
        <Text style={styles.hint}>Most drivers use January 1 to December 31</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BUSINESS ADDRESS</Text>
        <Text style={[styles.hint, { marginBottom: 16 }]}>
          For Uber drivers, use your home address (where you operate from)
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Street Address *</Text>
          <TextInput
            style={styles.input}
            value={businessAddressLine1}
            onChangeText={setBusinessAddressLine1}
            placeholder="123 Main Street"
            placeholderTextColor="#9CA3AF"
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Suite/Unit (Optional)</Text>
          <TextInput
            style={styles.input}
            value={businessAddressLine2}
            onChangeText={setBusinessAddressLine2}
            placeholder="Suite 100"
            placeholderTextColor="#9CA3AF"
            editable={!loading}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.fieldHalf]}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              value={businessCity}
              onChangeText={setBusinessCity}
              placeholder="Toronto"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
          </View>

          <View style={[styles.field, styles.fieldHalf]}>
            <Text style={styles.label}>Province *</Text>
            <TextInput
              style={styles.input}
              value={businessProvince}
              onChangeText={(text) => setBusinessProvince(text.toUpperCase())}
              placeholder="ON"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              maxLength={2}
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Postal Code *</Text>
          <TextInput
            style={styles.input}
            value={businessPostalCode}
            onChangeText={(text) => setBusinessPostalCode(formatPostalCode(text))}
            placeholder="A1A 1A1"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            maxLength={7}
            editable={!loading}
          />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  completenessBar: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  completenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  completenessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  completenessPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  completenessHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  completenessHintText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  fieldHalf: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#111827',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  sinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  sinInput: {
    flex: 1,
    paddingRight: 50,
  },
  sinToggle: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  radioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  radioButtonActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  radioText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  radioTextActive: {
    color: '#059669',
    fontWeight: '600',
  },
  checkIcon: {
    marginRight: -2,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  percentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingRight: 14,
  },
  percentField: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#111827',
  },
  percentSign: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    height: 40,
  },
});
