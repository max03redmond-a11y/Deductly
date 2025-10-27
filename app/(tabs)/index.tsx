import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { User, Shield, Building2, ChevronRight, Edit3, FileText, LogOut, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { CANADIAN_PROVINCES, BUSINESS_TYPES } from '@/types/database';
import { theme } from '@/constants/theme';
import { Card } from '@/components/Card';
import { ProfileEditForm } from '@/components/ProfileEditForm';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { router } from 'expo-router';
import { TabScreenWrapper } from '@/components/TabScreenWrapper';

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const provinceName = CANADIAN_PROVINCES.find(p => p.value === profile?.province)?.label;
  const businessTypeName = BUSINESS_TYPES.find(b => b.value === profile?.business_type)?.label;

  const handleEditSuccess = async () => {
    await refreshProfile();
    setHasUnsavedChanges(false);
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (Platform.OS === 'web') {
        if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
          setHasUnsavedChanges(false);
          setEditMode(false);
        }
      } else {
        Alert.alert(
          'Unsaved Changes',
          'You have unsaved changes. Are you sure you want to cancel?',
          [
            { text: 'Keep Editing', style: 'cancel' },
            {
              text: 'Discard Changes',
              style: 'destructive',
              onPress: () => {
                setHasUnsavedChanges(false);
                setEditMode(false);
              },
            },
          ]
        );
      }
    } else {
      setEditMode(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to logout?')) {
        await signOut();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: () => signOut(),
          },
        ]
      );
    }
  };

  const handleDeleteAccount = async () => {
    const confirmMessage = 'This will permanently delete your account and all your data. This action cannot be undone.';

    if (Platform.OS === 'web') {
      if (confirm(confirmMessage)) {
        await performAccountDeletion();
      }
    } else {
      Alert.alert(
        'Delete Account',
        confirmMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => performAccountDeletion(),
          },
        ]
      );
    }
  };

  const performAccountDeletion = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      await supabase.from('expenses').delete().eq('user_id', user.id);
      await supabase.from('income_entries').delete().eq('user_id', user.id);
      await supabase.from('mileage_logs').delete().eq('user_id', user.id);
      await supabase.from('mileage_settings').delete().eq('user_id', user.id);
      await supabase.from('mileage_year').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);

      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) {
        console.log('Note: Could not delete auth user (admin access required)');
      }

      await signOut();
      showToast('Account deleted successfully', 'success');
    } catch (error: any) {
      console.error('Delete account error:', error);
      showToast('Failed to delete account: ' + error.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (editMode) {
    return (
      <View style={styles.container}>
        <View style={styles.editHeader}>
          <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.editTitle}>Edit Profile</Text>
          <View style={styles.cancelButton} />
        </View>
        <ProfileEditForm
          profile={profile}
          onSuccess={handleEditSuccess}
          onChangeDetected={() => setHasUnsavedChanges(true)}
        />
      </View>
    );
  }

  return (
    <TabScreenWrapper>
      <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.userName}>{profile.full_name || 'User'}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>
        </View>

        {profile && !profile.profile_completed && (
          <View style={styles.section}>
            <Card style={styles.completenessCard}>
              <FileText size={24} color="#EF4444" />
              <View style={styles.completenessContent}>
                <Text style={styles.completenessTitle}>Complete Your Tax Profile</Text>
                <Text style={styles.completenessText}>
                  Add your CRA information to enable T2125 exports
                </Text>
              </View>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => setEditMode(true)}
              >
                <Text style={styles.completeButtonText}>Complete</Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={() => setEditMode(true)}>
              <View style={styles.menuIconContainer}>
                <Edit3 size={20} color={theme.colors.icon} />
              </View>
              <Text style={styles.menuLabel}>Edit Tax Profile</Text>
              <ChevronRight size={20} color={theme.colors.iconInactive} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Building2 size={20} color={theme.colors.icon} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Business Information</Text>
                <Text style={styles.menuValue}>{businessTypeName}</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.iconInactive} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session</Text>

          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
                <LogOut size={20} color="#DC2626" />
              </View>
              <Text style={[styles.menuLabel, styles.logoutText]}>Logout</Text>
              <ChevronRight size={20} color={theme.colors.iconInactive} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>

          <Card>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Province</Text>
              <Text style={styles.detailValue}>{provinceName}</Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Business Type</Text>
              <Text style={styles.detailValue}>{businessTypeName}</Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>GST/HST Registered</Text>
              <Text style={styles.detailValue}>
                {profile.gst_hst_registered ? 'Yes' : 'No'}
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          <Card style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteAccount}
              disabled={deleting}
            >
              <View style={[styles.menuIconContainer, styles.dangerIconContainer]}>
                <Trash2 size={20} color="#DC2626" />
              </View>
              <Text style={[styles.menuLabel, styles.dangerText]}>
                {deleting ? 'Deleting Account...' : 'Delete Account'}
              </Text>
              <ChevronRight size={20} color={theme.colors.iconInactive} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Deductly • Version 1.0.0</Text>
        </View>
      </ScrollView>
      </View>
    </TabScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.base,
    backgroundColor: theme.colors.surface,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.base,
  },
  userName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  section: {
    paddingHorizontal: theme.spacing.base,
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.md,
  },
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.base,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  dangerIconContainer: {
    backgroundColor: '#FEE2E2',
  },
  logoutIconContainer: {
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    color: '#DC2626',
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  dangerText: {
    color: '#DC2626',
  },
  menuValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginLeft: 68,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.base,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  detailDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
  },
  footerText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  editTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  backButton: {
    minWidth: 60,
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  cancelButton: {
    minWidth: 80,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  completenessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  completenessContent: {
    flex: 1,
  },
  completenessTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#991B1B',
    marginBottom: theme.spacing.xs,
  },
  completenessText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#DC2626',
  },
  completeButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: 8,
  },
  completeButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
});
