/**
 * Wealthsimple-inspired Design System
 *
 * A minimalist design system with soft greens and clean typography
 */

export const colors = {
  // Primary Palette
  primary: '#A8E6CF',           // Soft light green
  primaryDark: '#8FD4B5',       // Darker variant for press states
  primaryLight: '#C5F0DC',      // Lighter variant for backgrounds

  // Secondary
  secondary: '#BEE3D0',         // Muted sage
  secondaryLight: '#D4EFE0',    // Very light sage for subtle backgrounds

  // Backgrounds
  background: '#FAFAFA',        // Off-white background
  surface: '#FFFFFF',           // Pure white for cards
  surfaceHover: '#F5F5F5',      // Subtle hover state

  // Text
  text: '#222222',              // Charcoal for titles
  textSecondary: '#555555',     // Grey for body text
  textTertiary: '#888888',      // Light grey for captions
  textDisabled: '#BBBBBB',      // Disabled text

  // Icons
  icon: '#888888',              // Neutral grey icons
  iconActive: '#A8E6CF',        // Active icon (green)
  iconInactive: '#CCCCCC',      // Inactive tab icons

  // Utility Colors
  success: '#059669',           // Success green
  successLight: '#D1FAE5',      // Light success background
  error: '#FF6B6B',             // Error red (soft)
  warning: '#FFD93D',           // Warning yellow
  info: '#A8E6CF',              // Info (primary)

  // Borders & Dividers
  border: '#EEEEEE',            // Very light border
  divider: '#F0F0F0',           // Subtle divider

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)', // Modal backdrop

  // Transparent
  transparent: 'transparent',
};

export const typography = {
  // Font Families
  fontFamily: {
    regular: 'System',          // Default system font
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,                   // Body text
    lg: 18,                     // Titles
    xl: 22,                     // Headers
    '2xl': 24,                  // Large headers
    '3xl': 28,                  // Hero text
    '4xl': 32,                  // Display
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const borderRadius = {
  none: 0,
  sm: 8,
  base: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const layout = {
  // Screen Padding
  screenPadding: spacing.base,
  screenPaddingHorizontal: spacing.base,
  screenPaddingVertical: spacing.lg,

  // Card Padding
  cardPadding: spacing.lg,
  cardPaddingSmall: spacing.base,

  // Section Spacing
  sectionSpacing: spacing['2xl'],
  itemSpacing: spacing.md,

  // Tab Bar
  tabBarHeight: 80,
  tabBarPadding: spacing.base,

  // Header
  headerHeight: 60,
  headerPadding: spacing.base,
};

// Common component styles
export const components = {
  button: {
    primary: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.base,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.base,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...shadows.sm,
    },
    secondary: {
      backgroundColor: colors.transparent,
      paddingVertical: spacing.base,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.base,
      borderWidth: 1.5,
      borderColor: colors.primary,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    disabled: {
      opacity: 0.5,
    },
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.base,
    padding: spacing.lg,
    ...shadows.base,
  },

  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.base,
    padding: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },

  header: {
    backgroundColor: colors.surface,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.base,
  },
};

// Animation durations (in ms)
export const animation = {
  fast: 150,
  base: 250,
  slow: 350,
};

// Gradients
export const gradients = {
  headerGradient: {
    colors: [colors.surface, colors.primaryLight],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  primaryGradient: {
    colors: [colors.primary, colors.primaryDark],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

// Export a complete theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  components,
  animation,
  gradients,
};

export default theme;
