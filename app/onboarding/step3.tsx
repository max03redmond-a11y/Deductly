import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check, ChevronLeft } from 'lucide-react-native';

const DEFAULT_USER_ID = 'default-user';

export default function OnboardingStep3() {
  const [gstHstRegistered, setGstHstRegistered] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (gstHstRegistered === null) return;

    setLoading(true);

    const province = await AsyncStorage.getItem('onboarding_province');
    const businessType = await AsyncStorage.getItem('onboarding_business_type');

    if (!province || !businessType) {
      if (Platform.OS === 'web') {
        alert('Missing onboarding data');
      } else {
        Alert.alert('Error', 'Missing onboarding data');
      }
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: DEFAULT_USER_ID,
      email: 'driver@example.com',
      province,
      business_type: businessType,
      gst_hst_registered: gstHstRegistered,
    }, {
      onConflict: 'id'
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

    await AsyncStorage.multiRemove(['onboarding_province', 'onboarding_business_type']);
    setLoading(false);
    router.replace('/(tabs)');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>3 of 3</Text>
          <Text style={styles.title}>GST/HST Registration</Text>
          <Text style={styles.subtitle}>
            Are you registered for GST/HST?
          </Text>
          <Text style={styles.helpText}>
            Required if you earn over $30,000/year
          </Text>
        </View>

        <View style={styles.optionsList}>
          <TouchableOpacity
            style={[
              styles.option,
              gstHstRegistered === false && styles.optionSelected,
            ]}
            onPress={() => setGstHstRegistered(false)}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionTextContainer}>
                <Text
                  style={[
                    styles.optionTitle,
                    gstHstRegistered === false && styles.optionTitleSelected,
                  ]}
                >
                  Not Registered
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    gstHstRegistered === false && styles.optionDescriptionSelected,
                  ]}
                >
                  I don't collect GST/HST on my services
                </Text>
              </View>
              {gstHstRegistered === false && (
                <View style={styles.checkmark}>
                  <Check size={20} color="#FFFFFF" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              gstHstRegistered === true && styles.optionSelected,
            ]}
            onPress={() => setGstHstRegistered(true)}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionTextContainer}>
                <Text
                  style={[
                    styles.optionTitle,
                    gstHstRegistered === true && styles.optionTitleSelected,
                  ]}
                >
                  Registered
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    gstHstRegistered === true && styles.optionDescriptionSelected,
                  ]}
                >
                  I have a GST/HST registration number
                </Text>
              </View>
              {gstHstRegistered === true && (
                <View style={styles.checkmark}>
                  <Check size={20} color="#FFFFFF" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={20} color="#111827" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, (gstHstRegistered === null || loading) && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={gstHstRegistered === null || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Setting up...' : 'Get Started'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
  },
  header: {
    marginBottom: 40,
  },
  stepIndicator: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    lineHeight: 24,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#9CA3AF',
    marginTop: 8,
  },
  optionsList: {
    gap: 12,
  },
  option: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  optionSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#FFFFFF',
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
  },
  optionDescriptionSelected: {
    color: '#D1D5DB',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minWidth: 100,
  },
  backButtonText: {
    color: '#111827',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  button: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
});
