import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { requestNotificationPermission } from '../lib/notifications';
import { AlertHost } from '../lib/alert';

const PUBLIC_ROUTES = ['index', 'register', 'forgot-password'];

function AuthGuard({ children }) {
  const router = useRouter();
  const segments = useSegments();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const check = async () => {
      const token = await AsyncStorage.getItem('token');
      const currentRoute = segments[0] ?? 'index';
      const isPublic = PUBLIC_ROUTES.some(r => currentRoute.startsWith(r));

      if (!token && !isPublic) {
        router.replace('/');
      } else if (token && currentRoute === 'index') {
        router.replace('/home');
      }

      setChecking(false);
    };
    check();
  }, [segments]);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3949ab" />
      </View>
    );
  }

  return children;
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthGuard>
        <Stack screenOptions={{ title: '' }} />
      </AuthGuard>
      <AlertHost />
    </GestureHandlerRootView>
  );
}
