import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const { user, loading, profile } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (profile?.profile_completed) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding/profile-setup');
        }
      } else {
        router.replace('/auth/sign-in');
      }
    }
  }, [user, loading, profile]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1E5128" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
