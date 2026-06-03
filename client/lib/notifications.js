import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleServiceReminder(vehicleId, nextDateStr) {
  if (Platform.OS === 'web') return;
  if (!nextDateStr || nextDateStr === 'אין נתונים זמינים' || nextDateStr === 'שגיאת טעינה / אין נתונים') return;

  const date = new Date(nextDateStr);
  if (isNaN(date.getTime()) || date <= new Date()) return;

  // ביטול תזכורת קודמת לאותו רכב
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content.data?.vehicleId === vehicleId) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'תזכורת טיפול תקופתי',
      body: `הגיע הזמן לטיפול תקופתי לרכב ${vehicleId}`,
      data: { vehicleId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,    //new Date(Date.now() + 5000),      בדיקה
    },
  });
}
