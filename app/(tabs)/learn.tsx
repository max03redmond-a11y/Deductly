import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import { LearnCard, LearnArticle } from '@/components/LearnCard';
import { LearnCardSkeleton } from '@/components/LearnCardSkeleton';
import { ARTICLE_IMAGES } from '@/lib/imageCatalog';
import { theme } from '@/constants/theme';

const ARTICLES: LearnArticle[] = [
  {
    id: '1',
    title: 'Understanding GST/HST for Rideshare Drivers',
    excerpt: 'Learn when you need to register for GST/HST, how to collect it, and claim input tax credits on business expenses.',
    category: 'GST/HST',
    readTime: 5,
    imageUrl: ARTICLE_IMAGES.taxes,
  },
  {
    id: '2',
    title: 'Maximizing Your Mileage Deductions',
    excerpt: 'Track every business kilometer to claim maximum deductions. We break down the simplified and detailed methods.',
    category: 'Mileage',
    readTime: 7,
    imageUrl: ARTICLE_IMAGES.mileage,
  },
  {
    id: '4',
    title: 'Smart Tax Planning for Self-Employed',
    excerpt: 'Set aside the right amount throughout the year, use RRSP contributions, and minimize your tax bill legally.',
    category: 'Tax Planning',
    readTime: 8,
    imageUrl: ARTICLE_IMAGES.planning,
  },
  {
    id: '5',
    title: 'Operating as a Small Business',
    excerpt: 'Separate accounts, professional record-keeping, and business strategies to maximize profitability and minimize stress.',
    category: 'Business',
    readTime: 6,
    imageUrl: ARTICLE_IMAGES.business,
  },
  {
    id: '6',
    title: 'Insurance Options for Gig Workers',
    excerpt: 'Protect your income and vehicle with the right insurance. Learn about commercial policies and what your current coverage may miss.',
    category: 'Insurance',
    readTime: 5,
    imageUrl: ARTICLE_IMAGES.insurance,
  },
  {
    id: '7',
    title: 'Receipt Management Made Simple',
    excerpt: 'Best practices for organizing receipts, digital scanning tools, and what the CRA requires for proof of expenses.',
    category: 'Write-offs',
    readTime: 4,
    imageUrl: ARTICLE_IMAGES.notebook,
  },
  {
    id: '8',
    title: 'Building Emergency Savings',
    excerpt: 'Irregular income requires a different approach to savings. Learn how to build a cushion for slow months and emergencies.',
    category: 'Business',
    readTime: 6,
    imageUrl: ARTICLE_IMAGES.savings,
  },
];

const { width } = Dimensions.get('window');
const COLUMN_GAP = 16;
const SIDE_PADDING = 20;
const NUM_COLUMNS = width > 600 ? 2 : 1;
const CARD_WIDTH = NUM_COLUMNS === 2
  ? (width - SIDE_PADDING * 2 - COLUMN_GAP) / 2
  : width - SIDE_PADDING * 2;

export default function LearnScreen() {
  const [loading, setLoading] = useState(false);

  const handleArticlePress = useCallback((article: LearnArticle) => {
    router.push({
      pathname: '/learn/[id]',
      params: { id: article.id },
    });
  }, []);

  const renderHeader = () => (
    <>
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.primaryLight]}
        style={styles.hero}
      >
        <Text style={styles.greeting}>Tax Resources</Text>
        <Text style={styles.heroTitle}>Learn</Text>
      </LinearGradient>
      <View style={styles.contentHeader}>
        <Text style={styles.sectionTitle}>
          FEATURED ARTICLES
        </Text>
      </View>
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <BookOpen size={48} color="#9CA3AF" />
      <Text style={styles.emptyText}>
        No articles yet
      </Text>
      <Text style={styles.emptySubtext}>
        Check back soon for helpful tax tips
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: LearnArticle }) => (
    <View style={{ width: CARD_WIDTH }}>
      <LearnCard article={item} onPress={() => handleArticlePress(item)} />
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        {[1, 2].map((i) => (
          <View key={i} style={{ width: CARD_WIDTH }}>
            <LearnCardSkeleton />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={ARTICLES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        key={NUM_COLUMNS}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        columnWrapperStyle={NUM_COLUMNS === 2 ? styles.row : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={50}
        initialNumToRender={6}
        windowSize={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.base,
    paddingBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  heroTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  contentHeader: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.base,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    paddingHorizontal: SIDE_PADDING,
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.base,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  loadingFooter: {
    flexDirection: NUM_COLUMNS === 2 ? 'row' : 'column',
    paddingHorizontal: SIDE_PADDING,
    justifyContent: 'space-between',
  },
});
