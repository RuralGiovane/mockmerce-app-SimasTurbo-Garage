import * as SecureStore from 'expo-secure-store';

const CustomerTokenKey = 'customer_token';

//Salva o token
export async function saveCustomerToken(token: string | null): Promise<void> {
  if (token) {
    await SecureStore.setItemAsync(CustomerTokenKey, token);
  } else {
    await SecureStore.deleteItemAsync(CustomerTokenKey);
  }
}

//Recupera o token salvo no armazenamento do dispositivo
export async function getStoredCustomerToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(CustomerTokenKey);
  } catch {
    return null;
  }
}

// Salva o cache de favoritos do comprador localmente
export async function saveCustomerFavoritesCache(customerId: string, items: unknown[]): Promise<void> {
  try {
    await SecureStore.setItemAsync(`favorites_cache_${customerId}`, JSON.stringify(items));
  } catch {}
}

// Recupera o cache de favoritos que está salvo localmente
export async function getCustomerFavoritesCache<T = unknown>(customerId: string): Promise<T[] | null> {
  try {
    const raw = await SecureStore.getItemAsync(`favorites_cache_${customerId}`);
    return raw ? (JSON.parse(raw) as T[]) : null;
  } catch {
    return null;
  }
}

// Remove o cache de favoritos do comprador no logout
export async function removeCustomerFavoritesCache(customerId: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(`favorites_cache_${customerId}`);
  } catch {}
}
