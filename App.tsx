import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SignInScreen } from '@/screens/SignInScreen'
import { SignUpScreen } from '@/screens/SignUpScreen'
import { ForgotPasswordScreen } from '@/screens/ForgotPasswordScreen'

import { ProductsScreen } from '@/screens/ProductsScreen';
import { ProductDetailScreen } from '@/screens/ProductDetailScreen';

import { CartScreen } from '@/screens/CartScreen';
import { CheckoutScreen } from '@/screens/CheckoutScreen'
import { OrderScreen } from '@/screens/OrderScreen'
import { OrdersScreen } from '@/screens/OrdersScreen'

import { ApiError } from '@/types/api';
import { queryClient } from '@/lib/queryClient';
import { SessionProvider } from '@/session/session';
import type { RootStackParamList, AuthStackParamList } from '@/navigation';

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

// Fluxo normal do app
function AppFlow() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Products" component={ProductsScreen} options={{ title: "SimasTurboGarage" }} />
      <AppStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
      <AppStack.Screen name="Cart" component={CartScreen} options={{ title: 'Carrinho' }} />
      <AppStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <AppStack.Screen name="Order" component={OrderScreen} options={{ title: 'Pedido' }} />
      <AppStack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Meus pedidos' }} />

    </AppStack.Navigator>
  )
}

// Verifica estado de Login do usuario
function RootNavigator() {
  const { isLoggedIn } = useState();
  return isLoggedIn ? <AppFlow /> : <AuthFlow />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient} >
        <SessionProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <StatusBar style="dark" />
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
