import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, ExternalLink, Gift } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Referral } from '@/types/database';
import { theme } from '@/constants/theme';

export default function ReferralDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferral();
  }, [id]);

  const loadReferral = async () => {
    if (!id) return;

    const { data } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', id)
      .single();

    if (data) setReferral(data);
    setLoading(false);
  };

  const handleOpenLink = async () => {
    if (!referral) return;

    const supported = await Linking.canOpenURL(referral.link_url);
    if (supported) {
      await Linking.openURL(referral.link_url);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={styles.backButton} />
        </View>
      </View>
    );
  }

  if (!referral) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Not Found</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Referral not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Details</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: referral.logo_url }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>{referral.title}</Text>

        {referral.reward_text && (
          <View style={styles.rewardBanner}>
            <Gift size={20} color="#059669" />
            <Text style={styles.rewardText}>{referral.reward_text}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{referral.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why We Recommend This</Text>
          <Text style={styles.description}>
            As a gig worker, having the right financial tools can make a huge difference in managing
            your income, expenses, and taxes. This service is specifically helpful for independent
            contractors and self-employed individuals.
          </Text>
        </View>

        <View style={styles.placeholderSection}>
          <Text style={styles.placeholderTitle}>More Details Coming Soon</Text>
          <Text style={styles.placeholderText}>
            We're working on adding more detailed information about this partner, including:
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Key features and benefits</Text>
            <Text style={styles.featureItem}>• Pricing and plans</Text>
            <Text style={styles.featureItem}>• How to get started</Text>
            <Text style={styles.featureItem}>• Tips for gig workers</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleOpenLink}>
          <Text style={styles.primaryButtonText}>Visit {referral.title}</Text>
          <ExternalLink size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  backButton: {
    minWidth: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    gap: 10,
  },
  rewardText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  placeholderSection: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
    marginBottom: 12,
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: '#1E5128',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#1E5128',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
