import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Clock, Bookmark } from 'lucide-react-native';
import { ArticleCategory, CATEGORY_COLORS } from '@/lib/imageCatalog';

export type LearnArticle = {
  id: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  readTime: number;
  imageUrl: string;
};

type LearnCardProps = {
  article: LearnArticle;
  onPress: () => void;
};

export function LearnCard({ article, onPress }: LearnCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const categoryColor = CATEGORY_COLORS[article.category];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`Read article: ${article.title}`}
      accessibilityRole="button"
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={[styles.categoryPill, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{article.category}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text
          style={styles.title}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {article.title}
        </Text>

        <Text
          style={styles.excerpt}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {article.excerpt}
        </Text>

        <View style={styles.footer}>
          <View style={styles.readTime}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.readTimeText}>
              {article.readTime} min
            </Text>
          </View>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark
              size={18}
              color={isBookmarked ? '#F59E0B' : '#9CA3AF'}
              fill={isBookmarked ? '#F59E0B' : 'none'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  categoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.3,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 26,
  },
  excerpt: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readTimeText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    color: '#6B7280',
  },
});
