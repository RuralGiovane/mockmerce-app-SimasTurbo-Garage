export type RootStackParamList = {
  Products: undefined;
  ProductDetail: { id: string; name: string };
  Cart: undefined;
  Favorites: undefined;
  Checkout: { pickupPointId?: string; pickupPointName?: string } | undefined;
  Review: { id: string };
  PickupPoints: { select?: boolean } | undefined;
  Profile: undefined;
  Order: { id: string }
  Orders: undefined
};

export type AuthStackParamList = {
  SignIn: undefined
  SignUp: undefined
  ForgotPassword: undefined
}