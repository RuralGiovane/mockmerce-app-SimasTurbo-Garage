import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { useSession } from '@/session/session';
import { getStoreMessages, type StoreMessage } from '@/services/notifications';
import { default_channel, notificationsGranted, PrepareAndroidChannel } from '@/lib/notifications';
import { flushNotificationNavigation, queueNotificationProduct } from '@/lib/notificationNavigation';
type Status = 'checking' | 'undetermined' | 'granted' | 'denied' | 'unavailable';
type Value = { status: Status; error: string; messages: StoreMessage[]; busy: boolean; enable: () => Promise<void>; refresh: () => Promise<void> };
const Context = createContext<Value | null>(null);
export function NotificationProvider({ children }: { children: ReactNode }) {
  const { customer } = useSession();
  const [status, setStatus] = useState<Status>('checking');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<StoreMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const running = useRef(new Set<string>());
  const user = useRef(customer?.id);
  user.current = customer?.id;
  const refresh = useCallback(async (requestPermission = false) => {
    if (!customer || running.current.has(customer.id)) return;
    const owner = customer.id;
    running.current.add(owner); setBusy(true); setError('');
    try {
      let granted = false;
      if (Platform.OS === 'web') { setStatus('unavailable'); } else {
        try {
          await PrepareAndroidChannel();
          let permission = await Notifications.getPermissionsAsync();
          // Só o botão do perfil autoriza a solicitação de permissão.
          if (requestPermission && permission.canAskAgain && !notificationsGranted(permission)) {
            permission = await Notifications.requestPermissionsAsync();
          }
          if (owner !== user.current) return;
          granted = notificationsGranted(permission);
          setStatus(granted ? 'granted' : permission.status === 'undetermined' ? 'undetermined' : 'denied');
        } catch {
          if (owner !== user.current) return;
          setStatus('unavailable');
        }
      }
      const history = await getStoreMessages();
      if (owner !== user.current) return;
      setMessages(history);
      if (!granted) return;
      const key = `notification_seen_${owner}`;
      const saved = await SecureStore.getItemAsync(key);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      const seen = new Set<string>(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []);
      for (const message of history) {
        if (owner !== user.current) return;
        if (seen.has(message.id)) continue;
        await Notifications.scheduleNotificationAsync({
          identifier: `store-${owner}-${message.id}`,
          content: { title: message.title, body: message.body, data: { ...message.data, notificationCustomerId: owner } },
          trigger: Platform.OS === 'android' ? { channelId: default_channel } : null,
        });
        seen.add(message.id);
        // Persiste após cada agendamento: uma falha não repete o lote inteiro.
        await SecureStore.setItemAsync(key, JSON.stringify([...seen].slice(-50)));
      }
    } catch (e) {
      if (owner === user.current) { setError(e instanceof Error ? e.message : 'Não foi possível carregar os avisos.'); }
    } finally { running.current.delete(owner); if (owner === user.current) setBusy(false); }
  }, [customer]);
  useEffect(() => {
    setMessages([]); setStatus('checking');
    void refresh();
    const app = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); });
    return () => app.remove();
  }, [refresh]);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let active = true;
    const handled = new Set<string>();
    function receive(response: Notifications.NotificationResponse | null) {
      if (!response || !active) return;
      const notification = response.notification;
      if (handled.has(notification.request.identifier)) return;
      const data = notification.request.content.data ?? {};
      if (data.notificationCustomerId && data.notificationCustomerId !== user.current) return;
      handled.add(notification.request.identifier);
      queueNotificationProduct(data); flushNotificationNavigation();
      void Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
    }
    const listener = Notifications.addNotificationResponseReceivedListener(receive);
    void Notifications.getLastNotificationResponseAsync().then(receive).catch(() => undefined);
    return () => { active = false; listener.remove(); };
  }, [customer?.id]);
  return <Context.Provider value={{ status, error, messages, busy, enable: () => refresh(true), refresh: () => refresh() }}>{children}</Context.Provider>;
}
export function useNotifications() {
  const value = useContext(Context);
  if (!value) throw new Error('useNotifications requer NotificationProvider.');
  return value;
}
