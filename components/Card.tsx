import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'default';
  testID?: string;
}

export function Card({ children, style, padding = 'default', testID }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        padding === 'small' && styles.smallPadding,
        padding === 'none' && styles.noPadding,
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...theme.components.card,
  },
  smallPadding: {
    padding: theme.spacing.base,
  },
  noPadding: {
    padding: 0,
  },
});
