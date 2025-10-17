import { Platform, Alert, ToastAndroid } from 'react-native';

export type ToastType = 'success' | 'error' | 'info';

export const showToast = (message: string, type: ToastType = 'info') => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else if (Platform.OS === 'web') {
    // For web, we'll use a simple alert for now
    // In production, use a proper toast library like react-hot-toast
    console.log(`[${type.toUpperCase()}]`, message);
    if (type === 'error') {
      alert(message);
    }
  } else {
    // iOS: use Alert for now
    Alert.alert(type === 'error' ? 'Error' : 'Success', message);
  }
};
