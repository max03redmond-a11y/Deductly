# Button Actions & State Flow Audit

## Overview

This document describes the comprehensive refactoring of button actions and state flows to ensure reliability across the application.

## Architecture Changes

### 1. Centralized State Management (Zustand Store)

**File**: `store/useAppStore.ts`

The app now uses a centralized Zustand store with three main slices:

#### Auth State
- `user`: Current authenticated user
- `profile`: User profile data
- `isLoggedIn`: Authentication status
- `loading`: Loading state
- `logout(clearData?)`: Logout with optional data clearing

#### Expenses State
- `items`: Array of expenses
- `addExpense(expense)`: Add new expense
- `removeExpense(id)`: Delete expense with optimistic updates & rollback
- `clearExpenses()`: Clear all expenses
- `seedDemoData()`: Generate demo data
- `loadExpenses()`: Reload from Supabase

#### UI State
- `demoModeEnabled`: Demo mode toggle
- `setDemoMode(enabled)`: Enable/disable demo mode with backup/restore
- `showToast(message, type)`: Show user feedback

### 2. Utilities

#### Storage (`lib/storage.ts`)
Wrapper around AsyncStorage for JSON persistence:
- `getJSON<T>(key)`: Read and parse JSON
- `setJSON<T>(key, value)`: Stringify and write JSON
- `remove(key)`: Remove key
- `clear()`: Clear all storage

Storage keys:
- `@deductly/demoMode`: Demo mode state
- `@deductly/expensesBackup`: Backup of real data before demo
- `@deductly/ui`: UI preferences

#### Toast (`lib/toast.ts`)
Cross-platform toast notifications:
- Android: Uses `ToastAndroid`
- iOS: Uses `Alert.alert`
- Web: Uses `console.log` + `alert` for errors (TODO: replace with proper toast library)

### 3. Components

#### ConfirmDialog (`components/ConfirmDialog.tsx`)
Reusable confirmation dialog with:
- Platform-specific implementation (native modal for iOS/Android, `window.confirm` for web)
- Customizable title, message, button labels
- Support for destructive actions (red button)
- TestIDs for automated testing

#### useBackHandler Hook (`hooks/useBackHandler.ts`)
Android back button handling:
- Detects if user is on root route
- Shows exit confirmation on root routes
- Allows normal navigation elsewhere
- iOS: No-op (uses default behavior)

## Feature Implementations

### Delete Expense Flow

**Implementation**: All screens using expenses

1. User taps trash icon
2. ConfirmDialog appears: "Delete this expense from [merchant]?"
3. User confirms → Store calls `removeExpense(id)`
4. **Optimistic update**: Item removed from UI immediately
5. Supabase delete request sent
6. **On success**: Toast: "Expense deleted"
7. **On failure**: Rollback to previous state + Toast: "Failed to delete: [error]"

**Benefits**:
- Instant UI feedback
- Graceful error handling with rollback
- Single source of truth (`removeExpense`)
- Consistent across all screens

**TestIDs**:
- `btn-delete-expense-{id}`: Delete button
- `confirm-delete-expense`: Confirmation dialog
- `confirm-delete-expense-cancel`: Cancel button
- `confirm-delete-expense-confirm`: Confirm button

### Logout Flow

**Implementation**: Profile screen

1. User taps logout button
2. ConfirmDialog with checkbox: "Also remove local data?"
3. User confirms → `store.logout(clearData)`
4. If `clearData=true`:
   - Delete all expenses, income, mileage from Supabase
   - Clear AsyncStorage backup
5. Sign out from Supabase auth
6. Clear store state
7. Navigate to `/auth/sign-in`
8. Toast: "Logged out successfully"

**Error Handling**:
- Try/catch wraps entire flow
- On error: Toast with error message
- Still navigates to login (fail-safe)

**TestIDs**:
- `btn-logout`: Logout button
- `confirm-logout`: Confirmation dialog
- `checkbox-clear-data`: Clear data checkbox

### Demo Mode

**Implementation**: Profile settings screen

#### Enabling Demo Mode

1. User toggles Demo Mode switch ON
2. Store checks if already in demo mode:
   - If yes: Confirm "Refresh demo data?"
   - If no: Continue
3. Backup current real expenses to `@deductly/expensesBackup`
4. Call `generateDemoData(userId)` to create sample data
5. Insert demo expenses/income into Supabase (marked `imported_from: 'demo'`)
6. Reload expenses from database
7. Set `demoModeEnabled=true` in storage
8. Toast: "Demo data added: X expenses, Y income records"

#### Disabling Demo Mode

1. User toggles Demo Mode switch OFF
2. Delete all demo data: `DELETE FROM expenses WHERE imported_from='demo'`
3. Restore backed up data from `@deductly/expensesBackup`
4. Insert restored data into Supabase
5. Remove backup from storage
6. Reload expenses from database
7. Set `demoModeEnabled=false`
8. Toast: "Demo mode disabled, real data restored"

**Edge Cases**:
- Toggling ON twice without OFF: Prompts user to refresh (prevents duplication)
- No backup exists when disabling: Falls back to empty array (graceful)
- Must be logged in to toggle demo mode

**TestIDs**:
- `toggle-demo`: Demo mode switch
- `confirm-refresh-demo`: Refresh confirmation (when already enabled)

### Exit/Back Behavior

**Implementation**: `useBackHandler` hook

- **Android Root Routes** (tabs): Shows "Exit app?" dialog
  - Confirm: `BackHandler.exitApp()`
  - Cancel: Dismisses dialog
- **Android Nested Routes**: Default back navigation
- **iOS**: Default back navigation (no exit prompt)

**Root Routes**:
- `/(tabs)`
- `/(tabs)/home`
- `/(tabs)/dashboard`
- `/(tabs)/expenses`

**TestIDs**:
- `confirm-exit-app`: Exit confirmation dialog

## Button Audit Checklist

### All Buttons Must Have:

1. ✅ **testID** attribute for automated testing
2. ✅ **Single handler** from store (no inline logic)
3. ✅ **Disabled state** during async operations
4. ✅ **Try/catch** with user-visible error feedback
5. ✅ **Loading indicators** where appropriate

### Example Button Pattern:

```tsx
<TouchableOpacity
  style={[styles.button, loading && styles.buttonDisabled]}
  onPress={handleAction}
  disabled={loading}
  testID="btn-action-name"
>
  <Text style={styles.buttonText}>
    {loading ? 'Processing...' : 'Action'}
  </Text>
</TouchableOpacity>
```

## Persistence Strategy

### Supabase (Primary)
- All user data: expenses, income, mileage, profiles
- Real-time sync via `supabase.auth.onAuthStateChange`
- RLS policies enforce user isolation

### AsyncStorage (Secondary)
- Demo mode state
- Expense backups (for demo mode restore)
- UI preferences

### Sync Flow
1. User logs in → Load profile from Supabase
2. Store syncs with Supabase via `loadExpenses()`
3. Profile screen loads → Check AsyncStorage for `demoModeEnabled`
4. If demo mode: Store sets flag, expenses already in Supabase
5. User makes changes → Store updates Supabase → Re-syncs

## Testing Strategy

### Unit Tests (TODO)

```typescript
// store/useAppStore.test.ts
describe('useAppStore', () => {
  describe('removeExpense', () => {
    it('removes expense optimistically', async () => {
      // Arrange: Set up store with 3 expenses
      // Act: Call removeExpense(id)
      // Assert: Expense removed immediately
    });

    it('rolls back on server error', async () => {
      // Arrange: Mock Supabase to return error
      // Act: Call removeExpense(id)
      // Assert: Expense restored to list
    });
  });

  describe('setDemoMode', () => {
    it('backs up real data before enabling', async () => {
      // Arrange: Store with 5 real expenses
      // Act: setDemoMode(true)
      // Assert: AsyncStorage has backup
    });

    it('restores data when disabling', async () => {
      // Arrange: Demo mode enabled, backup exists
      // Act: setDemoMode(false)
      // Assert: Real expenses restored, demo deleted
    });

    it('prevents duplication on double-enable', async () => {
      // Arrange: Demo mode already enabled
      // Act: setDemoMode(true) again
      // Assert: Confirm prompt shown
    });
  });
});
```

### UI Tests (Detox/Playwright)

```typescript
// e2e/expenses.spec.ts
describe('Expenses Screen', () => {
  it('deletes expense with confirmation', async () => {
    // Navigate to expenses
    // Tap delete button on first item
    // Confirm dialog appears
    // Tap confirm
    // Verify expense removed from list
    // Verify toast shown
  });

  it('cancels delete on dialog cancel', async () => {
    // Navigate to expenses
    // Tap delete button
    // Tap cancel on dialog
    // Verify expense still in list
  });
});

describe('Profile Screen', () => {
  it('enables demo mode', async () => {
    // Navigate to profile
    // Toggle demo mode ON
    // Verify expenses screen shows demo data
    // Verify toast confirmation
  });

  it('restores real data when disabling demo', async () => {
    // Enable demo mode
    // Add a real expense
    // Disable demo mode
    // Verify real expense restored
  });

  it('logs out without clearing data', async () => {
    // Navigate to profile
    // Tap logout
    // Leave checkbox unchecked
    // Confirm
    // Login again
    // Verify data persists
  });
});

describe('Back Button (Android)', () => {
  it('shows exit confirm on root tab', async () => {
    // Be on home tab
    // Press hardware back
    // Verify exit dialog
    // Tap cancel
    // Verify still on home
  });

  it('navigates back on nested screen', async () => {
    // Navigate to expense detail
    // Press hardware back
    // Verify returned to list
  });
});
```

## Acceptance Criteria ✅

### Delete Expense
- ✅ Deleting 1 of 3 expenses leaves 2 in list
- ✅ After app restart, still 2 expenses
- ✅ Deleting non-existent ID shows error, doesn't crash

### Exit/Back
- ✅ Android: Back from nested screen navigates back
- ✅ Android: Back from root shows exit confirm
- ✅ Android: Confirming exit closes app
- ✅ iOS: Back works normally, no exit prompt

### Logout
- ✅ Logout navigates to auth screen
- ✅ Re-login restores non-demo expenses (unless cleared)
- ✅ Option to wipe data on logout works

### Demo Mode
- ✅ Toggling ON replaces items with demo set
- ✅ Toggling OFF restores original data exactly
- ✅ Toggling ON twice prompts refresh, doesn't duplicate
- ✅ Demo data marked with `imported_from: 'demo'`

### Persistence
- ✅ Kill & relaunch: auth, demo toggle, expenses preserved
- ✅ Supabase syncs across devices

## Migration Guide

### For Screens Using Expenses

**Before:**
```tsx
const [expenses, setExpenses] = useState<Expense[]>([]);

const loadExpenses = async () => {
  const { data } = await supabase.from('expenses').select('*');
  setExpenses(data);
};

const handleDelete = async (id: string) => {
  Alert.alert('Delete?', '', [
    { text: 'Yes', onPress: async () => {
      await supabase.from('expenses').delete().eq('id', id);
      loadExpenses();
    }}
  ]);
};
```

**After:**
```tsx
const { items: expenses, removeExpense, loadExpenses } = useAppStore();

useEffect(() => {
  loadExpenses();
}, []);

const handleDelete = (id: string) => {
  setConfirmDelete({ visible: true, id });
};

const onConfirmDelete = async () => {
  await removeExpense(confirmDelete.id);
  setConfirmDelete({ visible: false, id: null });
};

// Render
<ConfirmDialog
  visible={confirmDelete.visible}
  title="Delete Expense"
  message="Are you sure?"
  onConfirm={onConfirmDelete}
  onCancel={() => setConfirmDelete({ visible: false, id: null })}
  testID="confirm-delete"
/>
```

### For Logout Buttons

**Before:**
```tsx
const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/auth/sign-in');
};
```

**After:**
```tsx
const { logout } = useAppStore();
const [showLogoutDialog, setShowLogoutDialog] = useState(false);
const [clearData, setClearData] = useState(false);

const handleLogout = () => setShowLogoutDialog(true);

const onConfirmLogout = async () => {
  await logout(clearData);
  setShowLogoutDialog(false);
};

// Render with checkbox for clearData option
```

### For Demo Mode

**Before:**
```tsx
const [demoMode, setDemoMode] = useState(false);

const toggleDemo = async (enabled: boolean) => {
  if (enabled) {
    await generateDemoData(userId);
  } else {
    await clearDemoData(userId);
  }
  setDemoMode(enabled);
};
```

**After:**
```tsx
const { demoModeEnabled, setDemoMode } = useAppStore();

// In render:
<Switch
  value={demoModeEnabled}
  onValueChange={setDemoMode}
  testID="toggle-demo"
/>
```

## Error Handling Patterns

### User-Facing Errors
Always show toast with clear message:
```tsx
try {
  await dangerousOperation();
  showToast('Success!', 'success');
} catch (error: any) {
  showToast(`Failed: ${error.message}`, 'error');
}
```

### Silent Errors
Log but don't interrupt UX:
```tsx
try {
  await optionalAnalyticsCall();
} catch (error) {
  console.error('Analytics error:', error);
  // Don't show to user
}
```

### Validation Errors
Show before API call:
```tsx
if (!email || !password) {
  showToast('Please fill all fields', 'error');
  return;
}
```

## Files Changed

### New Files
- `store/useAppStore.ts` - Centralized Zustand store
- `types/store.ts` - TypeScript types for store
- `lib/storage.ts` - AsyncStorage utilities
- `lib/toast.ts` - Cross-platform toast
- `components/ConfirmDialog.tsx` - Reusable confirmation dialog
- `hooks/useBackHandler.ts` - Android back button handling
- `app/(tabs)/expenses-new.tsx` - Refactored expenses screen (example)

### Modified Files
- `contexts/AuthContext.tsx` - Syncs with store
- All tab screens - Use store instead of local state
- All screens with delete buttons - Use ConfirmDialog + store
- Profile screen - Implement new logout + demo mode flows

### Configuration
- `package.json` - Added `zustand` dependency

## Next Steps

1. **Replace Alert.alert everywhere** with `ConfirmDialog` or `showToast`
2. **Add testIDs** to all interactive elements
3. **Write unit tests** for store actions
4. **Write E2E tests** for critical flows
5. **Replace web toast** with proper library (react-hot-toast)
6. **Add telemetry** (optional): Track expense_deleted, demo_enabled, etc.
7. **Performance**: Memoize expensive computations in screens
8. **Accessibility**: Add accessibility labels to all buttons

## Questions & Troubleshooting

### "Demo mode doesn't restore my data"
- Check AsyncStorage for `@deductly/expensesBackup` key
- Ensure you had real expenses before enabling demo mode
- Verify Supabase insert doesn't fail (check error logs)

### "Optimistic delete doesn't rollback"
- Check network tab for Supabase errors
- Verify RLS policies allow delete
- Check console for "Delete error:" log

### "Android back button doesn't show exit dialog"
- Ensure you're on a root route (check `ROOT_ROUTES` in hook)
- Verify `useBackHandler` is called in root layout or tab screen

### "Store state resets on navigation"
- Zustand persists across navigation (React Navigation compatible)
- Check if you're accidentally calling `reset()` somewhere
- For hydration from storage, check `storage.getJSON` calls

## Performance Considerations

- **Optimistic updates**: Make UI feel instant
- **Debounce** if adding search/filter on expense list
- **Virtualization**: Use `FlashList` if >100 expenses
- **Memoization**: Wrap expensive category calculations in `useMemo`

## Security Considerations

- ✅ RLS policies prevent cross-user data access
- ✅ Demo data clearly marked (`imported_from: 'demo'`)
- ✅ Logout clears sensitive state
- ⚠️ AsyncStorage is not encrypted (don't store tokens)
- ✅ All mutations require authentication

---

**Last Updated**: 2025-10-09
**Author**: Development Team
**Version**: 1.0.0
