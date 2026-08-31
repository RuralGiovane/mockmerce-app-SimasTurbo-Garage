export type RootStackParamList = {
  Products: undefined;
  ProductDetail: { id: string; name: string };
  Cart: undefined;
  Favorites: undefined;
  Checkout: undefined;
  Order: { id: string }
  Orders: undefined
};

export type AuthStackParamList = {
  SignIn: undefined
  SignUp: undefined
  ForgotPassword: undefined
}