import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setCustomerToken, setUnauthorizedHandler } from '@/services/http';
import { login as loginService, register as registerService, getMe } from '@/services/auth';
import { saveCustomerToken, getStoredCustomerToken } from '@/services/storage';
import type { Customer } from '@/types/api';

interface SessionValue {
  customer: Customer | null;
  isLoggedIn: boolean;
  isLoadingSession: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const queryClient = useQueryClient();

  const signOut = useCallback(async () => {
    setCustomerToken(null);
    await saveCustomerToken(null);
    setCustomer(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = await getStoredCustomerToken();
        if (storedToken) {
          setCustomerToken(storedToken);
          const customerData = await getMe();
          setCustomer(customerData);
        }
      } catch {
        setCustomerToken(null);
        await saveCustomerToken(null);
        setCustomer(null);
      } finally {
        setIsLoadingSession(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo<SessionValue>(
    () => ({
      customer,
      isLoggedIn: customer !== null,
      isLoadingSession,
      async signIn(email, password) {
        const res = await loginService(email, password);
        setCustomerToken(res.token);
        await saveCustomerToken(res.token);
        setCustomer(res.customer);
      },
      async signUp(name, email, password) {
        const res = await registerService(name, email, password);
        setCustomerToken(res.token);
        await saveCustomerToken(res.token);
        setCustomer(res.customer);
      },
      signOut,
    }),
    [customer, isLoadingSession, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession precisa estar dentro de <SessionProvider>.');
  return ctx;
}