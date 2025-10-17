import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Image } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Gift, Users, ExternalLink, Copy, TrendingUp, Shield, Building2 } from 'lucide-react-native';
import { ReferralPartner, UserReferral, REFERRAL_CATEGORIES } from '@/types/database';

const SAMPLE_PARTNERS: ReferralPartner[] = [
  {
    id: '1',
    name: 'TaxPro CPA Network',
    category: 'tax_filing',
    description: 'Professional tax filing services for self-employed drivers',
    logo_url: null,
    offer_text: 'File your return for only $49 (normally $99). Deductly users save 50%',
    referral_url: 'https://example.com/taxpro',
    commission_amount: 15,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Wealthsimple',
    category: 'investment',
    description: 'Start investing with automated portfolios',
    logo_url: null,
    offer_text: 'Open a TFSA or RRSP and get $25 bonus when you invest $100+',
    referral_url: 'https://www.wealthsimple.com/invite/9WT8PA',
    commission_amount: 10,
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Ownr',
    category: 'business',
    description: 'Incorporate your business online in minutes',
    logo_url: null,
    offer_text: 'Register your business for $49 instead of $89 - exclusive discount',
    referral_url: 'https://example.com/ownr',
    commission_amount: 20,
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Commercial Auto Insurance',
    category: 'insurance',
    description: 'Compare insurance quotes from top providers',
    logo_url: null,
    offer_text: 'Get personalized quotes and save up to 15% on rideshare insurance',
    referral_url: 'https://example.com/insurance',
    commission_amount: 25,
    is_active: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function ReferralsScreen() {
  const { profile } = useAuth();
  const [partners, setPartners] = useState<ReferralPartner[]>(SAMPLE_PARTNERS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userReferralCode, setUserReferralCode] = useState<string>('');
  const [referralStats, setReferralStats] = useState({ clicks: 0, conversions: 0, earned: 0 });

  useEffect(() => {
    loadUserReferrals();
  }, []);

  const loadUserReferrals = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('user_referrals')
      .select('*')
      .eq('user_id', profile.id)
      .eq('referral_type', 'user_to_user')
      .maybeSingle();

    if (data) {
      setUserReferralCode(data.referral_code || '');
    } else {
      const code = await generateReferralCode();
      setUserReferralCode(code);
    }
  };

  const generateReferralCode = async () => {
    if (!profile) return '';

    const { data, error } = await supabase.rpc('generate_referral_code');

    if (data) {
      await supabase.from('user_referrals').insert({
        user_id: profile.id,
        referral_code: data,
        referral_type: 'user_to_user',
        status: 'pending',
      });
      return data;
    }

    return 'DEDUCT' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleShareReferral = async () => {
    try {
      await Share.share({
        message: `Join me on Deductly and track your tax deductions! Use my code: ${userReferralCode}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const filteredPartners = selectedCategory === 'all'
    ? partners
    : partners.filter((p) => p.category === selectedCategory);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Referrals</Text>
          <Text style={styles.headerSubtitle}>Exclusive deals & rewards</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=400' }}
          style={styles.heroImage}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INVITE FRIENDS</Text>
          <View style={styles.referralCard}>
            <Users size={28} color="#52B788" />
            <View style={styles.referralContent}>
              <Text style={styles.referralTitle}>Share Deductly</Text>
              <Text style={styles.referralDescription}>
                Both get $5 off first tax filing
              </Text>
            </View>
          </View>

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Your code</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>{userReferralCode || 'Loading...'}</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Copy size={20} color="#52B788" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={handleShareReferral}>
            <Text style={styles.shareButtonText}>Share Link</Text>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{referralStats.conversions}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${referralStats.earned.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Earned</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PARTNER OFFERS</Text>
          <Text style={styles.sectionDescription}>
            Exclusive deals on services to help you save and grow
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipSelected]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.categoryChipText, selectedCategory === 'all' && styles.categoryChipTextSelected]}>
                All
              </Text>
            </TouchableOpacity>
            {REFERRAL_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[styles.categoryChip, selectedCategory === cat.value && styles.categoryChipSelected]}
                onPress={() => setSelectedCategory(cat.value)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === cat.value && styles.categoryChipTextSelected]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.partnersGrid}>
            {filteredPartners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </View>
        </View>

        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerText}>
            Deductly may receive a commission from these partners. All offers subject to partner terms.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function PartnerCard({ partner }: { partner: ReferralPartner }) {
  const categoryInfo = REFERRAL_CATEGORIES.find((c) => c.value === partner.category);
  const IconMap: Record<string, any> = {
    'tax_filing': Building2,
    'investment': TrendingUp,
    'insurance': Shield,
    'business': Building2,
  };
  const Icon = IconMap[partner.category] || Gift;

  return (
    <View style={styles.partnerCard}>
      <View style={styles.partnerHeader}>
        <View style={styles.partnerIcon}>
          <Icon size={24} color="#2D6A4F" />
        </View>
        <View style={styles.partnerBadge}>
          <Text style={styles.partnerBadgeText}>{categoryInfo?.label}</Text>
        </View>
      </View>
      <Text style={styles.partnerName}>{partner.name}</Text>
      <Text style={styles.partnerDescription}>{partner.description}</Text>
      <View style={styles.offerBox}>
        <Text style={styles.offerText}>{partner.offer_text}</Text>
      </View>
      <TouchableOpacity style={styles.partnerButton}>
        <Text style={styles.partnerButtonText}>Get Offer</Text>
        <ExternalLink size={16} color="#1E5128" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#1E5128',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerContent: {
    gap: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 180,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  referralCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  referralContent: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  referralDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  codeBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDFA',
    padding: 16,
    borderRadius: 12,
  },
  codeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#52B788',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  shareButton: {
    backgroundColor: '#52B788',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  shareButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  categoriesScroll: {
    marginBottom: 20,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#40916C',
  },
  categoryChipSelected: {
    backgroundColor: '#52B788',
    borderColor: '#52B788',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryChipTextSelected: {
    color: '#1F2937',
  },
  partnersGrid: {
    gap: 16,
  },
  partnerCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  partnerIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#2D6A4F',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerBadge: {
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  partnerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  partnerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  partnerDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  offerBox: {
    backgroundColor: '#40916C',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  offerText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 20,
  },
  partnerButton: {
    backgroundColor: '#2D6A4F',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  partnerButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimerSection: {
    backgroundColor: '#2D6A4F',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 40,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
