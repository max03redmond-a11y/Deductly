import { useEffect, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const ROOT_ROUTES = ['/(tabs)', '/(tabs)/home', '/(tabs)/dashboard', '/(tabs)/expenses'];

export function useBackHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backAction = () => {
      const isRootRoute = ROOT_ROUTES.some((route) => pathname.includes(route));

      if (isRootRoute) {
        setShowExitConfirm(true);
        return true; // Prevent default back behavior
      }

      return false; // Allow default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [pathname]);

  const handleExitApp = () => {
    BackHandler.exitApp();
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  return {
    showExitConfirm,
    handleExitApp,
    handleCancelExit,
  };
}
