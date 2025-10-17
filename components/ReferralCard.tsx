import { View, Text, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import { ExternalLink, Gift } from 'lucide-react-native';
import { Referral } from '@/types/database';
import { theme } from '@/constants/theme';

interface ReferralCardProps {
  referral: Referral;
}

export function ReferralCard({ referral }: ReferralCardProps) {
  const handlePress = async () => {
    const supported = await Linking.canOpenURL(referral.link_url);
    if (supported) {
      await Linking.openURL(referral.link_url);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: referral.logo_url }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {referral.title}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {referral.description}
      </Text>

      {referral.reward_text && (
        <View style={styles.rewardBanner}>
          <Gift size={14} color="#059669" />
          <Text style={styles.rewardText} numberOfLines={1}>
            {referral.reward_text}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.learnMoreButton}>
          <Text style={styles.learnMoreText}>Learn More</Text>
          <ExternalLink size={14} color="#1E5128" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  logo: {
    width: 36,
    height: 36,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
    minHeight: 40,
  },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  learnMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E5128',
  },
});
