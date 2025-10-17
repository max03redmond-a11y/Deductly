import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { BUSINESS_TYPES } from '@/types/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';

export default function OnboardingStep2() {
  const [businessType, setBusinessType] = useState('');

  const handleNext = async () => {
    if (!businessType) return;

    await AsyncStorage.setItem('onboarding_business_type', businessType);
    router.push('/onboarding/step3');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>2 of 3</Text>
          <Text style={styles.title}>What type of work do you do?</Text>
          <Text style={styles.subtitle}>
            This helps us show relevant deductions
          </Text>
        </View>

        <View style={styles.optionsList}>
          {BUSINESS_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.option,
                businessType === type.value && styles.optionSelected,
              ]}
              onPress={() => setBusinessType(type.value)}
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
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={20} color="#111827" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !businessType && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!businessType}
        >
          <Text style={styles.buttonText}>Continue</Text>
          <ChevronRight size={20} color="#FFFFFF" />
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
  optionsList: {
    gap: 12,
  },
  option: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  optionSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#374151',
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
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
