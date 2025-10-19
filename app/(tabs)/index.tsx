import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/contexts/OfflineContext';
import { User, Edit3, FileText, ChevronRight, Trash2 } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Card } from '@/components/Card';
import { ProfileEditForm } from '@/components/ProfileEditForm';
import { localDB } from '@/lib/localDatabase';
import { useAppState } from '@/lib/state/appStore';

export default function SettingsScreen() {
  const { profile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const clearAllData = useAppState((state) => state.clearAllData);
  const loadAllData = useAppState((state) => state.loadAllData);

  const handleEditSuccess = async () => {
    setEditMode(false);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your expenses, income, mileage logs, and settings. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Success', 'All data has been cleared');
              await loadAllData();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
              console.error(error);
            }
          },
        },
      ]
    );
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
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.userName}>{profile?.full_name || 'Local User'}</Text>
          <Text style={styles.offlineText}>Offline Mode</Text>
        </View>

        <View style={styles.infoCard}>
          <FileText size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            Deductly Beta runs fully offline — your data stays on your device and never leaves it.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={() => setEditMode(true)}>
              <View style={styles.menuIconContainer}>
                <Edit3 size={20} color={theme.colors.icon} />
              </View>
              <Text style={styles.menuLabel}>Edit Tax Profile</Text>
              <ChevronRight size={20} color={theme.colors.iconInactive} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={handleClearData}>
              <View style={[styles.menuIconContainer, styles.deleteIconContainer]}>
                <Trash2 size={20} color="#EF4444" />
              </View>
              <Text style={[styles.menuLabel, styles.deleteLabel]}>Clear Local Data</Text>
              <ChevronRight size={20} color={theme.colors.iconInactive} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Deductly • Version 1.0.0 Beta</Text>
          <Text style={styles.footerSubtext}>100% Offline</Text>
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
  offlineText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    margin: theme.spacing.base,
    padding: theme.spacing.base,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: '#1E40AF',
    lineHeight: 20,
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
  deleteIconContainer: {
    backgroundColor: '#FEF2F2',
  },
  menuLabel: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  deleteLabel: {
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
  },
  footerText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingTop: 50,
    paddingBottom: theme.spacing.base,
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
});
