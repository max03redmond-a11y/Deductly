import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { CANADIAN_PROVINCES } from '@/types/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight } from 'lucide-react-native';

export default function OnboardingStep1() {
  const [province, setProvince] = useState('');

  const handleNext = async () => {
    if (!province) return;

    await AsyncStorage.setItem('onboarding_province', province);
    router.push('/onboarding/step2');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>1 of 3</Text>
          <Text style={styles.title}>Where are you based?</Text>
          <Text style={styles.subtitle}>
            We'll tailor tax information to your province
          </Text>
        </View>

        <View style={styles.optionsGrid}>
          {CANADIAN_PROVINCES.map((prov) => (
            <TouchableOpacity
              key={prov.value}
              style={[
                styles.option,
                province === prov.value && styles.optionSelected,
              ]}
              onPress={() => setProvince(prov.value)}
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
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !province && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!province}
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  option: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minWidth: '47%',
  },
  optionSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Medium',
    color: '#374151',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  button: {
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
