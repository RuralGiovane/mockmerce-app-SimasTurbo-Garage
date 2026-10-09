import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { colors } from '@/theme/colors';
export const default_channel = 'store-messages';
Notifications.setNotificationHandler({ handleNotification: async () => ({
  shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true,
}) });
export async function PrepareAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(default_channel, {
    name: 'Avisos da Simas Turbo Garage', importance: Notifications.AndroidImportance.HIGH,
    lightColor: colors.primary,
  });
}
export function notificationsGranted(permission: Notifications.NotificationPermissionsStatus) {
  return permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}
