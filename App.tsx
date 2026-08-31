import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from '@tanstack/react-query';

import { SignInScreen } from '@/screens/SignInScreen';
import { SignUpScreen } from '@/screens/SignUpScreen';
import { ForgotPasswordScreen } from '@/screens/ForgotPasswordScreen';

import { ProductsScreen } from '@/screens/ProductsScreen';
import { ProductDetailScreen } from '@/screens/ProductDetailScreen';

import { CartScreen } from '@/screens/CartScreen';
import { FavoritesScreen } from '@/screens/FavoritesScreen';
import { CheckoutScreen } from '@/screens/CheckoutScreen';
import { OrderScreen } from '@/screens/OrderScreen';
import { OrdersScreen } from '@/screens/OrdersScreen';

import { Loading } from '@/components/ui';
import { queryClient } from '@/lib/queryClient';
import { SessionProvider, useSession } from '@/session/session';
import type { RootStackParamList, AuthStackParamList } from '@/navigation';
import { colors } from '@/theme/colors';

// Stacks
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<RootStackParamList>();

// Fluxo de Login do app
function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// Fluxo principal da loja
function AppFlow() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 16,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <AppStack.Screen name="Products" component={ProductsScreen} options={{ title: 'Simas Turbo Garage', headerShown: true }} />
      <AppStack.Screen name="ProductDetail" component={ProductDetailScreen} options={({ route }) => ({ title: route.params.name ?? 'Detalhes da Peça' })} />
      <AppStack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Garagem de Favoritos' }} />
      <AppStack.Screen name="Cart" component={CartScreen} options={{ title: 'Meu Carrinho' }} />
      <AppStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Revisão do Pedido' }} />
      <AppStack.Screen name="Order" component={OrderScreen} options={{ title: 'Ordem de Serviço' }} />
      <AppStack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Histórico de Pedidos' }} />
    </AppStack.Navigator>
  );
}

// Verifica estado de Login do usuário
function RootNavigator() {
  const { isLoggedIn, isLoadingSession } = useSession();

  if (isLoadingSession) {
    return <Loading label="Acelerando motores da garagem…" />;
  }

  return isLoggedIn ? <AppFlow /> : <AuthFlow />;
}

export default function App() {
  return (
    <SafeAreaProvider >
      <QueryClientProvider client={queryClient} >
        <SessionProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <StatusBar style="light" />
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}