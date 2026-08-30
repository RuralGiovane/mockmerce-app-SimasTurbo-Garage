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