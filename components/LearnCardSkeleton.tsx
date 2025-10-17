import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export function LearnCardSkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.imageSkeleton,
          { opacity },
        ]}
      />
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.titleSkeleton,
            { opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.excerptSkeleton1,
            { opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.excerptSkeleton2,
            { opacity },
          ]}
        />
        <View style={styles.footer}>
          <Animated.View
            style={[
              styles.footerSkeleton,
              { opacity },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageSkeleton: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: 16,
  },
  titleSkeleton: {
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 12,
    width: '80%',
  },
  excerptSkeleton1: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 8,
    width: '100%',
  },
  excerptSkeleton2: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 16,
    width: '70%',
  },
  footer: {
    flexDirection: 'row',
  },
  footerSkeleton: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    width: 60,
  },
});
