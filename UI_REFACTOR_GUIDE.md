# Wealthsimple UI Refactor Guide

## Overview

This guide documents the complete UI refactoring to match Wealthsimple's minimalist design system.

## Design System

### Color Palette

**Before:**
- Primary: Dark green (#1E5128)
- Background: Light grey (#F9FAFB)
- Mixed color schemes across screens

**After:**
- Primary: Soft light green (#A8E6CF)
- Secondary: Muted sage (#BEE3D0)
- Background: Off-white (#FAFAFA)
- Surface: Pure white (#FFFFFF)
- Text: Charcoal (#222222) / Grey (#555555)
- Icons: Neutral grey (#888888)

### Typography

**Before:**
- Montserrat font family
- Inconsistent font sizes
- Mixed weight usage

**After:**
- System font (clean, native)
- Consistent scale: 12px → 14px → 16px → 18px → 22px → 24px
- Weight hierarchy: Regular (400) → Medium (500) → Semibold (600) → Bold (700)

### Spacing & Layout

**Before:**
- Inconsistent padding (12px, 16px, 20px, 24px)
- Mixed border radius values

**After:**
- Consistent spacing scale: 4 → 8 → 12 → 16 → 20 → 24 → 32 → 40 → 48
- Standard border radius: 12px (base), 16px (large)
- Unified card padding: 20px
- Screen padding: 16px horizontal

### Shadows

**Before:**
- Varied shadow implementations
- Elevation values mixed with iOS shadows

**After:**
- Unified shadow system
- Subtle shadows (shadowOpacity: 0.1, elevation: 2)
- Consistent across all cards

## Component Library

### Button Component (`components/Button.tsx`)

```tsx
<Button
  title="Add Expense"
  onPress={handlePress}
  variant="primary"      // or "secondary"
  fullWidth
  testID="btn-add"
/>
```

**Features:**
- Primary: Filled light green background
- Secondary: Outlined with green border
- Disabled: 50% opacity
- Loading: Shows spinner
- Full width by default

### Card Component (`components/Card.tsx`)

```tsx
<Card padding="default">
  <Text>Card content</Text>
</Card>
```

**Features:**
- White background
- 12px border radius
- Subtle shadow
- Padding variants: none, small, default

## Screen-by-Screen Changes

### 1. Tab Bar (`app/(tabs)/_layout.tsx`)

**Before:**
- Black active icons
- Grey borders
- Mixed padding
- Height: 70px

**After:**
- Light green (#A8E6CF) active icons
- No borders, subtle shadow
- Consistent spacing (8px top, 12px bottom)
- Height: 80px
- Clean, minimal look

**Visual Changes:**
- Icons use outline style
- Active tab has green tint
- Smooth transitions between tabs
- White background with shadow elevation

---

### 2. Home Screen (`app/(tabs)/home.tsx`)

**Before:**
```tsx
// Dark green header (#1E5128)
// Mixed card styles
// Inconsistent spacing
// Dark colored accent elements
```

**After:**
```tsx
import { theme } from '@/constants/theme';

// Light green gradient header
background: LinearGradient (white → light green)

// Unified card styling
<Card style={styles.summaryCard}>
  <Text style={styles.cardTitle}>Year to Date</Text>
  ...
</Card>

// Consistent spacing
padding: theme.spacing.base
margin: theme.spacing.md
```

**Key Changes:**
- Header: Gradient from white to soft green (#C5F0DC)
- Cards: Pure white with subtle shadows
- Typography: 22px bold headers, 16px body
- Spacing: 16px padding, 12px gaps
- Icons: Grey outline style (#888888)
- All buttons use theme colors

---

### 3. Expenses Screen (`app/(tabs)/expenses.tsx`)

**Before:**
- Dark green header
- Heavy shadows
- Mixed button styles
- Cluttered layout

**After:**
```tsx
// Header with gradient
<LinearGradient
  colors={theme.gradients.headerGradient.colors}
  style={styles.header}
>
  <Text style={styles.headerAmount}>$5,432.10</Text>
</LinearGradient>

// Clean card layout
<Card>
  <View style={styles.categoryRow}>
    <Text style={styles.categoryName}>Fuel</Text>
    <Text style={styles.categoryAmount}>$1,234</Text>
  </View>
  <ProgressBar
    value={45}
    color={theme.colors.primary}
  />
</Card>

// Modern delete button
<TouchableOpacity style={styles.deleteButton}>
  <Trash2 size={18} color={theme.colors.error} />
</TouchableOpacity>
```

**Key Changes:**
- Soft green accent on category bars
- White cards with 20px padding
- Minimalist expense items
- Light green add button
- Clean delete icons (no red background)
- Subtle dividers between items

---

### 4. Dashboard/Reports Screen (`app/(tabs)/dashboard.tsx`)

**Before:**
- Colorful charts
- Multiple accent colors
- Dense information layout

**After:**
```tsx
// Clean header
<View style={styles.headerSection}>
  <Text style={styles.title}>Your Reports</Text>
  <Text style={styles.subtitle}>Tax year 2025</Text>
</View>

// Minimalist stat cards
<Card>
  <View style={styles.statRow}>
    <View style={styles.iconContainer}>
      <TrendingUp size={24} color={theme.colors.primary} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statLabel}>Total Income</Text>
      <Text style={styles.statValue}>$45,230</Text>
    </View>
  </View>
</Card>

// Subtle chart colors
<PieChart
  data={chartData}
  colors={[
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.primaryLight,
  ]}
/>
```

**Key Changes:**
- Green-tinted charts and graphs
- White card backgrounds
- Soft color palette (no bright colors)
- Clear data hierarchy
- Breathing room between elements
- 24px section spacing

---

### 5. Profile Screen (`app/(tabs)/index.tsx`)

**Before:**
- Dark green header
- Multiple card backgrounds
- Dense layout

**After:**
```tsx
// Clean profile header
<View style={styles.profileHeader}>
  <View style={styles.avatarContainer}>
    <User size={48} color={theme.colors.primary} />
  </View>
  <Text style={styles.userName}>John Doe</Text>
  <Text style={styles.userEmail}>john@example.com</Text>
</View>

// Settings list
<Card>
  <TouchableOpacity style={styles.settingRow}>
    <Shield size={20} color={theme.colors.icon} />
    <Text style={styles.settingLabel}>Account Security</Text>
    <ChevronRight size={20} color={theme.colors.icon} />
  </TouchableOpacity>
</Card>

// Demo mode toggle
<Card>
  <View style={styles.toggleRow}>
    <Sparkles size={20} color={theme.colors.primary} />
    <Text style={styles.toggleLabel}>Demo Mode</Text>
    <Switch
      value={demoMode}
      trackColor={{
        false: theme.colors.border,
        true: theme.colors.primary
      }}
    />
  </View>
</Card>
```

**Key Changes:**
- Large circular avatar placeholder
- List-style settings menu
- Clean dividers (1px, light grey)
- Green switch toggles
- Logout button in secondary style
- Minimal decoration

---

### 6. Learn Screen (`app/(tabs)/learn.tsx`)

**Before:**
- Colorful article cards
- Mixed imagery
- Dense text

**After:**
```tsx
// Category tabs
<ScrollView horizontal>
  <TouchableOpacity style={styles.categoryTab}>
    <Text style={styles.categoryText}>Tax Basics</Text>
  </TouchableOpacity>
</ScrollView>

// Article cards
<Card>
  <View style={styles.articleHeader}>
    <View style={styles.iconBadge}>
      <BookOpen size={24} color={theme.colors.primary} />
    </View>
  </View>
  <Text style={styles.articleTitle}>
    Understanding Business Deductions
  </Text>
  <Text style={styles.articleExcerpt}>
    Learn what expenses you can deduct...
  </Text>
  <Button
    title="Read More"
    variant="secondary"
    onPress={handleRead}
  />
</Card>
```

**Key Changes:**
- Minimalist article cards
- Green icon badges
- Clean typography
- Secondary buttons for actions
- Ample white space
- Easy to scan layout

---

## Modal & Form Updates

### Add Expense Modal

**Before:**
- Full modal overlay
- Mixed form styling
- Cluttered inputs

**After:**
```tsx
<Modal visible={visible} animationType="slide">
  <SafeAreaView style={styles.modal}>
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>Add Expense</Text>
      <TouchableOpacity onPress={onClose}>
        <X size={24} color={theme.colors.icon} />
      </TouchableOpacity>
    </View>

    <ScrollView style={styles.modalContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Merchant</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Shell Gas"
          placeholderTextColor={theme.colors.textTertiary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selected === cat.id && styles.categoryChipSelected
              ]}
            >
              <Text style={styles.categoryChipText}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>

    <View style={styles.modalFooter}>
      <Button
        title="Add Expense"
        onPress={handleSubmit}
        fullWidth
      />
    </View>
  </SafeAreaView>
</Modal>
```

**Key Changes:**
- Clean header with X button
- Light grey input backgrounds
- Category chips (not buttons)
- Selected state: light green background
- Fixed footer with primary button
- Consistent padding throughout

---

## Implementation Checklist

### Phase 1: Foundation ✅
- [x] Create `constants/theme.ts`
- [x] Create `components/Button.tsx`
- [x] Create `components/Card.tsx`
- [x] Update tab bar styling

### Phase 2: Screens (In Progress)
- [ ] Update Home screen
- [ ] Update Expenses screen
- [ ] Update Dashboard screen
- [ ] Update Profile screen
- [ ] Update Learn screen

### Phase 3: Modals & Forms
- [ ] Add Expense modal
- [ ] Edit modals
- [ ] Confirmation dialogs
- [ ] Auth screens

### Phase 4: Polish
- [ ] Add fade-in animations
- [ ] Button press animations (scale)
- [ ] Tab transition effects
- [ ] Loading states

---

## Usage Guide

### Importing Theme

```tsx
import { theme } from '@/constants/theme';

// Use theme values
backgroundColor: theme.colors.primary
padding: theme.spacing.base
fontSize: theme.typography.fontSize.lg
borderRadius: theme.borderRadius.base
...theme.shadows.base
```

### Creating Themed Styles

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.base,
  },
  header: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  card: {
    ...theme.components.card,
    marginBottom: theme.spacing.base,
  },
  button: {
    ...theme.components.button.primary,
  },
});
```

### Using Gradients

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

<LinearGradient
  colors={theme.gradients.headerGradient.colors}
  start={theme.gradients.headerGradient.start}
  end={theme.gradients.headerGradient.end}
  style={styles.header}
>
  {/* Content */}
</LinearGradient>
```

---

## Animation Examples

### Fade In on Mount

```tsx
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

function MyScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animation.base,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Content */}
    </Animated.View>
  );
}
```

### Button Press Scale

```tsx
import { Pressable, Animated } from 'react-native';

function AnimatedButton({ onPress, children }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
```

---

## Before/After Summary

### Visual Comparison

| Element | Before | After |
|---------|--------|-------|
| Primary Color | Dark green (#1E5128) | Light green (#A8E6CF) |
| Background | Grey (#F9FAFB) | Off-white (#FAFAFA) |
| Cards | Mixed shadows | Subtle (opacity: 0.1) |
| Typography | Montserrat, mixed sizes | System, consistent scale |
| Buttons | Dark green filled | Light green filled |
| Icons | Mixed colors | Grey (#888888) |
| Spacing | Inconsistent | 16px base system |
| Border Radius | Mixed (8-16px) | 12px standard |
| Tab Bar | Black active | Green active (#A8E6CF) |
| Headers | Dark green | White → green gradient |

### User Experience Improvements

1. **Consistency**: Every screen follows the same design language
2. **Clarity**: Clear visual hierarchy with typography scale
3. **Breathing Room**: Generous spacing reduces cognitive load
4. **Modern**: Minimalist aesthetic aligns with Wealthsimple
5. **Accessible**: High contrast text, clear touch targets
6. **Professional**: Clean, trustworthy appearance

---

## Testing Checklist

- [ ] All screens use theme colors
- [ ] No inline color values (#hex codes)
- [ ] Consistent spacing throughout
- [ ] Typography scale applied
- [ ] Shadows match theme
- [ ] Buttons use Button component
- [ ] Cards use Card component
- [ ] Tab bar shows green active state
- [ ] Animations smooth (250ms)
- [ ] Forms use theme inputs
- [ ] Modals have consistent styling

---

## Next Steps

1. Complete screen refactoring
2. Add subtle animations
3. Test on iOS and Android
4. Verify accessibility (contrast ratios)
5. Performance testing
6. User feedback

---

**Status**: Foundation Complete, Screens In Progress
**Updated**: 2025-10-09
**Design System**: Wealthsimple Minimalist
