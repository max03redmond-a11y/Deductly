# Quick Start Guide - Refactored State Management

## For Developers: How to Use the New System

### 1. Using the Store in Your Component

```tsx
import { useAppStore } from '@/store/useAppStore';

function MyComponent() {
  // Get what you need from the store
  const {
    items: expenses,        // Current expenses array
    removeExpense,          // Delete function
    loadExpenses,           // Reload from DB
    user,                   // Current user
    showToast               // Show feedback
  } = useAppStore();

  // Use it!
  const handleDelete = async (id: string) => {
    const success = await removeExpense(id);
    if (success) {
      // Item already removed optimistically
      // Toast already shown
    }
  };

  return (
    <TouchableOpacity
      onPress={() => handleDelete(item.id)}
      testID={`btn-delete-${item.id}`}
    >
      <Text>Delete</Text>
    </TouchableOpacity>
  );
}
```

### 2. Adding a Confirmation Dialog

```tsx
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

function MyComponent() {
  const [confirmDelete, setConfirmDelete] = useState({
    visible: false,
    id: null
  });

  const handleDeleteRequest = (id: string) => {
    setConfirmDelete({ visible: true, id });
  };

  const handleConfirm = async () => {
    await removeExpense(confirmDelete.id);
    setConfirmDelete({ visible: false, id: null });
  };

  return (
    <>
      <Button onPress={() => handleDeleteRequest(item.id)} />

      <ConfirmDialog
        visible={confirmDelete.visible}
        title="Delete Item"
        message="Are you sure?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="destructive"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDelete({ visible: false, id: null })}
        testID="confirm-delete"
      />
    </>
  );
}
```

### 3. Implementing Demo Mode Toggle

```tsx
import { useAppStore } from '@/store/useAppStore';
import { Switch } from 'react-native';

function SettingsScreen() {
  const { demoModeEnabled, setDemoMode, loading } = useAppStore();

  return (
    <Switch
      value={demoModeEnabled}
      onValueChange={setDemoMode}
      disabled={loading}
      testID="toggle-demo"
    />
  );
}
```

### 4. Adding Logout with Options

```tsx
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

function ProfileScreen() {
  const { logout } = useAppStore();
  const [showLogout, setShowLogout] = useState(false);
  const [clearData, setClearData] = useState(false);

  return (
    <>
      <Button
        onPress={() => setShowLogout(true)}
        testID="btn-logout"
      />

      <ConfirmDialog
        visible={showLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={() => {
          logout(clearData);
          setShowLogout(false);
        }}
        onCancel={() => setShowLogout(false)}
        testID="confirm-logout"
      />

      {/* Add checkbox for clearData */}
      <Checkbox
        value={clearData}
        onValueChange={setClearData}
        testID="checkbox-clear-data"
      />
    </>
  );
}
```

### 5. Handling Android Back Button

```tsx
import { useBackHandler } from '@/hooks/useBackHandler';
import { ConfirmDialog } from '@/components/ConfirmDialog';

function RootLayout() {
  const { showExitConfirm, handleExitApp, handleCancelExit } = useBackHandler();

  return (
    <>
      <YourAppContent />

      <ConfirmDialog
        visible={showExitConfirm}
        title="Exit App"
        message="Are you sure you want to exit?"
        confirmText="Exit"
        cancelText="Stay"
        onConfirm={handleExitApp}
        onCancel={handleCancelExit}
        testID="confirm-exit-app"
      />
    </>
  );
}
```

### 6. Loading Data on Screen Mount

```tsx
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

function ExpensesScreen() {
  const { items, loading, loadExpenses, user } = useAppStore();

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]); // Reload when user changes

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <FlatList data={items} ... />
  );
}
```

### 7. Adding New Expense

```tsx
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';

function AddExpenseForm() {
  const { user, addExpense, showToast } = useAppStore();

  const handleSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({ user_id: user.id, ...formData })
        .select()
        .single();

      if (error) throw error;

      // Add to store (optimistic)
      addExpense(data);

      showToast('Expense added', 'success');
    } catch (error) {
      showToast(`Failed: ${error.message}`, 'error');
    }
  };

  return <Form onSubmit={handleSubmit} />;
}
```

## Common Patterns

### ✅ DO: Use testIDs

```tsx
<TouchableOpacity testID="btn-delete-expense">
  <Text>Delete</Text>
</TouchableOpacity>
```

### ✅ DO: Handle Loading States

```tsx
<Button
  disabled={loading}
  style={loading && styles.disabled}
>
  {loading ? 'Deleting...' : 'Delete'}
</Button>
```

### ✅ DO: Show User Feedback

```tsx
try {
  await operation();
  showToast('Success!', 'success');
} catch (error) {
  showToast(`Failed: ${error.message}`, 'error');
}
```

### ❌ DON'T: Use Alert.alert on Web

```tsx
// BAD
Alert.alert('Error', 'Something went wrong');

// GOOD
showToast('Something went wrong', 'error');
// OR
<ConfirmDialog ... />
```

### ❌ DON'T: Manage Expenses State Locally

```tsx
// BAD
const [expenses, setExpenses] = useState([]);

// GOOD
const { items: expenses } = useAppStore();
```

### ❌ DON'T: Inline Delete Logic

```tsx
// BAD
onPress={async () => {
  await supabase.from('expenses').delete().eq('id', id);
  loadExpenses();
}}

// GOOD
onPress={() => handleDelete(id)}
// where handleDelete uses store.removeExpense
```

## Store API Reference

### Auth Slice

| Function | Parameters | Description |
|----------|------------|-------------|
| `setUser` | `user: User \| null` | Update current user |
| `setProfile` | `profile: Profile \| null` | Update user profile |
| `logout` | `clearData?: boolean` | Logout (optional data wipe) |

### Expenses Slice

| Function | Parameters | Description |
|----------|------------|-------------|
| `loadExpenses` | - | Fetch from Supabase |
| `addExpense` | `expense: Expense` | Add to store |
| `removeExpense` | `id: string` | Delete with optimistic update |
| `clearExpenses` | - | Delete all user expenses |
| `seedDemoData` | - | Generate demo expenses/income |

### UI Slice

| Function | Parameters | Description |
|----------|------------|-------------|
| `setDemoMode` | `enabled: boolean` | Toggle demo mode |
| `showToast` | `message: string, type?: 'success' \| 'error' \| 'info'` | Show feedback |

## TestID Naming Convention

| Element Type | Pattern | Example |
|--------------|---------|---------|
| Button | `btn-{action}-{target}` | `btn-delete-expense` |
| Input | `input-{field}` | `input-expense-amount` |
| Toggle | `toggle-{feature}` | `toggle-demo` |
| Dialog | `confirm-{action}` | `confirm-delete` |
| Screen | `{screen}-screen` | `expenses-screen` |
| List Item | `{type}-item-{id}` | `expense-item-123` |

## Debugging Tips

### Store State Not Updating?
```tsx
// Check if you're reading from store correctly
const { items } = useAppStore();
console.log('Current items:', items);

// Verify Supabase sync
await loadExpenses();
```

### Optimistic Update Not Rolling Back?
```tsx
// Check browser console for "Delete error:" log
// Verify RLS policies allow delete
// Check network tab for Supabase response
```

### Demo Mode Not Working?
```tsx
// Check AsyncStorage
import { storage, STORAGE_KEYS } from '@/lib/storage';
const demoState = await storage.getJSON(STORAGE_KEYS.DEMO_MODE);
console.log('Demo mode state:', demoState);

// Check backup
const backup = await storage.getJSON(STORAGE_KEYS.EXPENSES_BACKUP);
console.log('Backup exists:', !!backup);
```

### Toast Not Showing on Web?
```tsx
// Currently using alert() on web - this is expected
// To upgrade: Install react-hot-toast
// Update lib/toast.ts to use toast() for web
```

## Migration Checklist

When updating an existing screen:

- [ ] Import `useAppStore` instead of local state
- [ ] Replace `useState` for expenses with `items` from store
- [ ] Replace manual Supabase calls with store functions
- [ ] Add testIDs to all interactive elements
- [ ] Replace `Alert.alert` with `ConfirmDialog` or `showToast`
- [ ] Add loading/disabled states
- [ ] Wrap async operations in try/catch
- [ ] Test on iOS, Android, and Web

## Questions?

1. Read `BUTTON_AUDIT_README.md` for full details
2. Check `expenses-new.tsx` for complete example
3. Review this guide for common patterns
4. Search codebase for similar implementations

---

**Quick Tip**: When in doubt, copy the pattern from `expenses-new.tsx` - it's the gold standard implementation!
