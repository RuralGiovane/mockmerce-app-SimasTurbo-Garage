import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation';
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
let pendingProduct: string | null = null;
export function queueNotificationProduct(data: Record<string, unknown>) {
  if (typeof data.produtoId === 'string' && data.produtoId.trim()) pendingProduct = data.produtoId;
}
export function clearNotificationNavigation() { pendingProduct = null; }
export function flushNotificationNavigation() {
  if (!pendingProduct || !navigationRef.isReady()) return;
  if (!navigationRef.getRootState()?.routeNames.includes('ProductDetail')) return;
  const id = pendingProduct; pendingProduct = null;
  navigationRef.navigate('ProductDetail', { id, name: 'Detalhes da peça' });
}
