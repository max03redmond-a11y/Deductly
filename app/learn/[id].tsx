import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Share, Platform, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Share2, Bookmark, Clock } from 'lucide-react-native';
import { useState } from 'react';
import { ARTICLE_IMAGES, CATEGORY_COLORS, ArticleCategory } from '@/lib/imageCatalog';

type ArticleDetail = {
  id: string;
  title: string;
  category: ArticleCategory;
  readTime: number;
  imageUrl: string;
  content: string;
  author: string;
  publishedDate: string;
};

const ARTICLE_DETAILS: Record<string, ArticleDetail> = {
  '1': {
    id: '1',
    title: 'Understanding GST/HST for Rideshare Drivers',
    category: 'GST/HST',
    readTime: 5,
    imageUrl: ARTICLE_IMAGES.taxes,
    author: 'Deductly Team',
    publishedDate: 'Oct 15, 2025',
    content: `If you're earning income from rideshare or delivery services in Canada, understanding GST/HST is crucial for staying compliant and maximizing your returns.

**When Do You Need to Register?**

You must register for GST/HST when your taxable supplies exceed $30,000 in a single calendar quarter or over the last four consecutive calendar quarters. This includes all your self-employment income, not just rideshare earnings.

**Collecting GST/HST**

Once registered, you must collect GST/HST on your services. Most rideshare platforms handle this automatically, but it's your responsibility to ensure it's done correctly.

**Input Tax Credits (ITCs)**

The advantage of GST/HST registration is claiming Input Tax Credits. You can recover the GST/HST you paid on business expenses like:

• Vehicle maintenance and repairs
• Fuel and oil
• Insurance premiums
• Phone and data plans
• Office supplies

**Filing Requirements**

Depending on your revenue, you'll file GST/HST returns:
• Annual filing if revenues under $1.5 million
• Quarterly filing if between $1.5M-$6M
• Monthly filing if over $6M

**Pro Tips**

1. Keep detailed records of all business expenses
2. Separate personal and business purchases
3. File on time to avoid penalties
4. Consider working with an accountant for complex situations

Remember, GST/HST compliance isn't just about avoiding penalties—it's an opportunity to reduce your tax burden through ITCs.`,
  },
  '2': {
    id: '2',
    title: 'Maximizing Your Mileage Deductions',
    category: 'Mileage',
    readTime: 7,
    imageUrl: ARTICLE_IMAGES.mileage,
    author: 'Deductly Team',
    publishedDate: 'Oct 14, 2025',
    content: `Mileage tracking is one of the most valuable tax deductions for rideshare and delivery drivers. Here's how to maximize this deduction.

**Two Methods to Choose From**

Canada Revenue Agency allows two methods:

1. **Simplified Method**: Claim a per-kilometer rate for business use
2. **Detailed Method**: Claim actual vehicle expenses based on business-use percentage

**The Simplified Method**

For 2025, CRA rates are:
• First 5,000 km: $0.70 per km
• Additional kilometers: $0.64 per km

This method is straightforward but may provide less benefit if you have high vehicle expenses.

**The Detailed Method**

Track your total kilometers and business kilometers, then calculate your business-use percentage. Apply this to actual expenses:

• Fuel and oil
• Maintenance and repairs
• Insurance
• License and registration
• Lease payments or capital cost allowance
• Interest on car loans

**Best Practices for Tracking**

1. Use a mileage tracking app (automatic is best)
2. Record every business trip immediately
3. Note the date, start/end locations, purpose, and distance
4. Keep records for 6 years
5. Document your odometer reading at year start and end

**What Counts as Business Use?**

• Traveling to pick up passengers
• Waiting in high-demand areas
• Driving between deliveries
• Going to vehicle maintenance

What doesn't count:
• Commuting from home to your first pickup
• Personal errands between rides
• Driving home from your last ride

**Audit Protection**

The CRA frequently audits mileage claims. Protect yourself by:
• Using automatic tracking apps
• Keeping a backup manual log
• Photographing your odometer regularly
• Saving all vehicle-related receipts

Proper mileage tracking can save you thousands in taxes annually. Make it a habit from day one.`,
  },
};

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isBookmarked, setIsBookmarked] = useState(false);

  const article = ARTICLE_DETAILS[id || '1'];

  if (!article) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
          Article not found
        </Text>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\nRead more on Deductly`,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const categoryColor = CATEGORY_COLORS[article.category];

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={isDark ? '#F9FAFB' : '#111827'} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Share2 size={22} color={isDark ? '#F9FAFB' : '#111827'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsBookmarked(!isBookmarked)}
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Bookmark
              size={22}
              color={isBookmarked ? '#F59E0B' : isDark ? '#F9FAFB' : '#111827'}
              fill={isBookmarked ? '#F59E0B' : 'none'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroImageContainer}>
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.content}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>

          <Text style={[styles.title, isDark && styles.titleDark]}>
            {article.title}
          </Text>

          <View style={styles.meta}>
            <Text style={[styles.metaText, isDark && styles.metaTextDark]}>
              By {article.author}
            </Text>
            <Text style={[styles.metaDot, isDark && styles.metaDotDark]}>•</Text>
            <Text style={[styles.metaText, isDark && styles.metaTextDark]}>
              {article.publishedDate}
            </Text>
            <Text style={[styles.metaDot, isDark && styles.metaDotDark]}>•</Text>
            <View style={styles.readTimeContainer}>
              <Clock size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text style={[styles.metaText, isDark && styles.metaTextDark]}>
                {article.readTime} min
              </Text>
            </View>
          </View>

          <Text style={[styles.body, isDark && styles.bodyDark]}>
            {article.content}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroImageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#F3F4F6',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
    color: '#111827',
    lineHeight: 38,
    marginBottom: 16,
  },
  titleDark: {
    color: '#F9FAFB',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 28,
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    color: '#6B7280',
  },
  metaTextDark: {
    color: '#9CA3AF',
  },
  metaDot: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  metaDotDark: {
    color: '#6B7280',
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  body: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#374151',
    lineHeight: 28,
  },
  bodyDark: {
    color: '#E5E7EB',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 100,
  },
  errorTextDark: {
    color: '#9CA3AF',
  },
});
