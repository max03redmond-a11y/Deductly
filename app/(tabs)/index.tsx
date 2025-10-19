import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { User, Shield, Building2, Sparkles, ChevronRight, Edit3, FileText } from 'lucide-react-native';
import { CANADIAN_PROVINCES, BUSINESS_TYPES } from '@/types/database';
import { generateDemoData, clearDemoData } from '@/lib/demoData';
import { theme } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProfileEditForm } from '@/components/ProfileEditForm';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_PROFILE: any = {
  id: DEFAULT_USER_ID,
  email: 'driver@example.com',
  full_name: 'Driver',
  province: 'ON',
  business_type: 'rideshare',
  gst_hst_registered: false,
  profile_completed: true,
};

export default function ProfileScreen() {
  const profile = DEFAULT_PROFILE;
  const [demoMode, setDemoMode] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const provinceName = CANADIAN_PROVINCES.find(p => p.value === profile?.province)?.label;
  const businessTypeName = BUSINESS_TYPES.find(b => b.value === profile?.business_type)?.label;

  const handleDemoModeToggle = async (value: boolean) => {
    if (value) {
      setDemoLoading(true);
      try {
        await generateDemoData(profile.id);
        setDemoMode(true);
      } catch (error: any) {
        console.error('Demo data generation error:', error);
        setDemoMode(false);
      } finally {
        setDemoLoading(false);
      }
    } else {
      setDemoLoading(true);
      try {
        await clearDemoData(profile.id);
        setDemoMode(false);
      } catch (error: any) {
        console.error('Demo data clear error:', error);
      } finally {
        setDemoLoading(false);
      }
    }
  };

  const handleEditSuccess = async () => {
    setEditMode(false);
  };

  if (editMode && profile) {
    return (
      <View style={styles.container}>
        <View style={styles.editHeader}>
          <TouchableOpacity onPress={() => setEditMode(false)} style={styles.backButton}>
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.editTitle}>Edit Profile</Text>
          <View style={styles.backButton} />
        </View>
        <ProfileEditForm profile={profile} onSuccess={handleEditSuccess} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.userName}>{profile.full_name}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>
        </View>

        {/* Profile Completeness Banner */}
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

        {/* Account Section */}
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
                <Shield size={20} color={theme.colors.icon} />
              </View>
              <Text style={styles.menuLabel}>Account Security</Text>
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

        {/* Business Details */}
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

        {/* Demo Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>

          <Card>
            <View style={styles.demoModeContainer}>
              <View style={styles.demoModeIconContainer}>
                <Sparkles size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.demoModeContent}>
                <Text style={styles.demoModeTitle}>Demo Mode</Text>
                <Text style={styles.demoModeSubtitle}>
                  {demoMode ? 'Sample data active' : 'Add sample data for testing'}
                </Text>
              </View>
              {demoLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Switch
                  value={demoMode}
                  onValueChange={handleDemoModeToggle}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor={theme.colors.surface}
                  testID="toggle-demo"
                />
              )}
            </View>
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Deductly • Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
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
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
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
  demoModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  demoModeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  demoModeContent: {
    flex: 1,
  },
  demoModeTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  demoModeSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
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
