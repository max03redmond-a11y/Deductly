import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { CANADIAN_PROVINCES, BUSINESS_TYPES } from '@/types/database';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function ProfileSetupScreen() {
  const [province, setProvince] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [gstHstRegistered, setGstHstRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!province || !businessType) {
      if (Platform.OS === 'web') {
        alert('Please select both province and business type');
      } else {
        Alert.alert('Error', 'Please select both province and business type');
      }
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('profiles').insert({
      id: DEFAULT_USER_ID,
      email: 'driver@example.com',
      province,
      business_type: businessType,
      gst_hst_registered: gstHstRegistered,
    });

    if (error) {
      if (Platform.OS === 'web') {
        alert('Error: ' + error.message);
      } else {
        Alert.alert('Error', error.message);
      }
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Set Up Your Profile</Text>
        <Text style={styles.subtitle}>Help us customize Deductly for your needs</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Province</Text>
          <View style={styles.optionsGrid}>
            {CANADIAN_PROVINCES.map((prov) => (
              <TouchableOpacity
                key={prov.value}
                style={[
                  styles.option,
                  province === prov.value && styles.optionSelected,
                ]}
                onPress={() => setProvince(prov.value)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.optionText,
                    province === prov.value && styles.optionTextSelected,
                  ]}
                >
                  {prov.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Type of Work Do You Do?</Text>
          <View style={styles.optionsList}>
            {BUSINESS_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.optionFull,
                  businessType === type.value && styles.optionSelected,
                ]}
                onPress={() => setBusinessType(type.value)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.optionText,
                    businessType === type.value && styles.optionTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GST/HST Registration</Text>
          <Text style={styles.sectionDescription}>
            Are you registered for GST/HST? (Required if you earn over $30,000/year)
          </Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                !gstHstRegistered && styles.toggleOptionSelected,
              ]}
              onPress={() => setGstHstRegistered(false)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.toggleText,
                  !gstHstRegistered && styles.toggleTextSelected,
                ]}
              >
                Not Registered
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                gstHstRegistered && styles.toggleOptionSelected,
              ]}
              onPress={() => setGstHstRegistered(true)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.toggleText,
                  gstHstRegistered && styles.toggleTextSelected,
                ]}
              >
                Registered
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Complete Setup'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E5128',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E5128',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  optionSelected: {
    backgroundColor: '#1E5128',
    borderColor: '#1E5128',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  optionsList: {
    gap: 12,
  },
  optionFull: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  toggleOptionSelected: {
    backgroundColor: '#1E5128',
    borderColor: '#1E5128',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  toggleTextSelected: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#1E5128',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
