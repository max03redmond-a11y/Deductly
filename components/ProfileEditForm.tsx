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
import { localDB } from '@/lib/localDatabase';
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
  const [businessNumber, setBusinessNumber] = useState(profile.business_number || '');
  const [naicsCode, setNaicsCode] = useState(profile.naics_code || '');
  const [accountingMethod, setAccountingMethod] = useState<'cash' | 'accrual'>(
    profile.accounting_method || 'cash'
  );
  const [fiscalYearStart, setFiscalYearStart] = useState(profile.fiscal_year_start || '');
  const [fiscalYearEnd, setFiscalYearEnd] = useState(profile.fiscal_year_end_date || '');

  const [gstRegistered, setGstRegistered] = useState(profile.gst_hst_registered || false);
  const [gstNumber, setGstNumber] = useState(profile.gst_hst_number || '');
  const [gstMethod, setGstMethod] = useState<'regular' | 'quick'>(
    profile.gst_hst_method || 'regular'
  );

  const [internetUrl1, setInternetUrl1] = useState('');
  const [internetUrl2, setInternetUrl2] = useState('');
  const [internetIncome, setInternetIncome] = useState(
    profile.internet_income_percentage?.toString() || '0'
  );

  useEffect(() => {
    if (profile.internet_business_urls && profile.internet_business_urls.length > 0) {
      setInternetUrl1(profile.internet_business_urls[0] || '');
      setInternetUrl2(profile.internet_business_urls[1] || '');
    }
  }, [profile]);

  const calculateCompleteness = (): number => {
    const fields = [
      legalName,
      sin,
      addressLine1,
      city,
      postalCode,
      province,
      businessName,
      naicsCode,
      accountingMethod,
      fiscalYearStart,
      fiscalYearEnd,
    ];

    const filledFields = fields.filter((f) => f && f.trim().length > 0).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  const handleSave = async () => {
    if (!legalName || !addressLine1 || !city || !postalCode) {
      const msg = 'Please fill in your legal name and mailing address';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Required Fields', msg);
      return;
    }

    if (sin && sin.replace(/\D/g, '').length !== 9) {
      const msg = 'SIN must be 9 digits';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Invalid SIN', msg);
      return;
    }

    if (businessNumber && businessNumber.replace(/\D/g, '').length !== 9) {
      const msg = 'Business number must be 9 digits';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Invalid Business Number', msg);
      return;
    }

    setLoading(true);

    const urls = [internetUrl1, internetUrl2].filter((url) => url.trim().length > 0);

    const updates: Partial<Profile> = {
      legal_name: legalName,
      sin_encrypted: sin,
      mailing_address_line1: addressLine1,
      mailing_address_line2: addressLine2,
      mailing_city: city,
      mailing_postal_code: postalCode,
      province,
      business_name: businessName,
      business_number: businessNumber,
      naics_code: naicsCode,
      accounting_method: accountingMethod,
      fiscal_year_start: fiscalYearStart,
      fiscal_year_end_date: fiscalYearEnd,
      gst_hst_registered: gstRegistered,
      gst_hst_number: gstNumber,
      gst_hst_method: gstMethod,
      internet_business_urls: urls.length > 0 ? urls : null,
      internet_income_percentage: parseFloat(internetIncome) || 0,
      profile_completed: completeness === 100,
      profile_completed_at: completeness === 100 ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    try {
      await localDB.saveProfile(updates);
      setLoading(false);
      const msg = 'Profile updated successfully';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Success', msg);
      onSuccess();
    } catch (error) {
      setLoading(false);
      const msg = 'Failed to update profile';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
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
        <Text style={styles.sectionTitle}>MAILING ADDRESS</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Street Address *</Text>
          <TextInput
            style={styles.input}
            value={addressLine1}
            onChangeText={setAddressLine1}
            placeholder="123 Main Street"
            placeholderTextColor="#9CA3AF"
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Apt/Unit (Optional)</Text>
          <TextInput
            style={styles.input}
            value={addressLine2}
            onChangeText={setAddressLine2}
            placeholder="Unit 456"
            placeholderTextColor="#9CA3AF"
            editable={!loading}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.fieldHalf]}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Toronto"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
          </View>

          <View style={[styles.field, styles.fieldHalf]}>
            <Text style={styles.label}>Postal Code *</Text>
            <TextInput
              style={styles.input}
              value={postalCode}
              onChangeText={(text) => setPostalCode(formatPostalCode(text))}
              placeholder="A1A 1A1"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              maxLength={7}
              editable={!loading}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BUSINESS INFORMATION</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Business Name</Text>
          <TextInput
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Your Business Name"
            placeholderTextColor="#9CA3AF"
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Business Number (BN)</Text>
          <TextInput
            style={styles.input}
            value={businessNumber}
            onChangeText={setBusinessNumber}
            placeholder="123456789"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={9}
            editable={!loading}
          />
          <Text style={styles.hint}>9-digit CRA business number</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>NAICS Code</Text>
          <TextInput
            style={styles.input}
            value={naicsCode}
            onChangeText={setNaicsCode}
            placeholder="485310"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
          <Text style={styles.hint}>6-digit industry classification code</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Accounting Method</Text>
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
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.fieldHalf]}>
            <Text style={styles.label}>Fiscal Year Start</Text>
            <TextInput
              style={styles.input}
              value={fiscalYearStart}
              onChangeText={setFiscalYearStart}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
          </View>

          <View style={[styles.field, styles.fieldHalf]}>
            <Text style={styles.label}>Fiscal Year End</Text>
            <TextInput
              style={styles.input}
              value={fiscalYearEnd}
              onChangeText={setFiscalYearEnd}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GST/HST REGISTRATION</Text>

        <View style={styles.field}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setGstRegistered(!gstRegistered)}
            disabled={loading}
          >
            <View
              style={[styles.checkboxBox, gstRegistered && styles.checkboxBoxActive]}
            >
              {gstRegistered && <Check size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>GST/HST Registered</Text>
          </TouchableOpacity>
        </View>

        {gstRegistered && (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>GST/HST Number</Text>
              <TextInput
                style={styles.input}
                value={gstNumber}
                onChangeText={setGstNumber}
                placeholder="123456789RT0001"
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Filing Method</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    gstMethod === 'regular' && styles.radioButtonActive,
                  ]}
                  onPress={() => setGstMethod('regular')}
                  disabled={loading}
                >
                  {gstMethod === 'regular' && (
                    <Check size={16} color="#059669" style={styles.checkIcon} />
                  )}
                  <Text
                    style={[
                      styles.radioText,
                      gstMethod === 'regular' && styles.radioTextActive,
                    ]}
                  >
                    Regular
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    gstMethod === 'quick' && styles.radioButtonActive,
                  ]}
                  onPress={() => setGstMethod('quick')}
                  disabled={loading}
                >
                  {gstMethod === 'quick' && (
                    <Check size={16} color="#059669" style={styles.checkIcon} />
                  )}
                  <Text
                    style={[
                      styles.radioText,
                      gstMethod === 'quick' && styles.radioTextActive,
                    ]}
                  >
                    Quick Method
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INTERNET BUSINESS ACTIVITIES</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Business Website URL 1 (Optional)</Text>
          <TextInput
            style={styles.input}
            value={internetUrl1}
            onChangeText={setInternetUrl1}
            placeholder="https://example.com"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="url"
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Business Website URL 2 (Optional)</Text>
          <TextInput
            style={styles.input}
            value={internetUrl2}
            onChangeText={setInternetUrl2}
            placeholder="https://example.com"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="url"
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>% of Gross Income from Internet</Text>
          <View style={styles.percentInput}>
            <TextInput
              style={styles.percentField}
              value={internetIncome}
              onChangeText={setInternetIncome}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              editable={!loading}
            />
            <Text style={styles.percentSign}>%</Text>
          </View>
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
