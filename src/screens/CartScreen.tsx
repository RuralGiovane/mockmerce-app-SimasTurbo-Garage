import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useCart } from '@/hooks/useCart';
import { useCartMutations } from '@/hooks/useCartMutations';
import { useSession } from '@/session/session';
import { money } from '@/lib/format';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { ApiError } from '@/types/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({ navigation }: Props) {
  const { data: cart, isLoading, isError, error, refetch } = useCart();
  const { setQuantity, removeItem } = useCartMutations();
  const { customer, signOut } = useSession();

  if (isLoading) return <Loading label="Carregando carrinho…" />;
  if (isError) return <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />;

  const items = cart?.items ?? [];

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.variantId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.hi}>
            Olá, {customer?.name}. {items.length ? '' : 'Seu carrinho está vazio.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.sub}>
                {money(item.unitPrice)} · subtotal {money(item.subtotal)}
              </Text>
            </View>
            <View style={styles.qtyBox}>
              {}
              <Text
                style={styles.qtyBtn}
                onPress={() => setQuantity.mutate({ variantId: item.variantId, quantity: item.quantity - 1 })}
              >
                −
              </Text>
              <Text style={styles.qty}>{item.quantity}</Text>
              <Text
                style={styles.qtyBtn}
                onPress={() => setQuantity.mutate({ variantId: item.variantId, quantity: item.quantity + 1 })}
              >
                +
              </Text>
            </View>
            <Text style={styles.remove} onPress={() => removeItem.mutate(item.variantId)}>
              remover
            </Text>
          </View>
        )}
        ListFooterComponent={
          items.length ? (
            <View style={styles.footer}>
              <Text style={styles.total}>Total: {money(cart?.total ?? 0)}</Text>
              <Button
                label="Finalizar compra"
                onPress={() => navigation.navigate('Checkout')}
              />
            </View>
          ) : null
        }
      />
      <View style={styles.signout}>
        <Button label="Sair" variant="ghost" onPress={signOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 12, gap: 10 },
  hi: { fontSize: 14, color: '#374151', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f9fafb', borderRadius: 12, padding: 10 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sub: { fontSize: 12, color: '#6b7280' },
  qtyBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { fontSize: 20, fontWeight: '700', color: '#111827', paddingHorizontal: 6 },
  qty: { fontSize: 15, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  remove: { fontSize: 12, color: '#b91c1c', marginLeft: 6 },
  footer: { marginTop: 16, gap: 10 },
  total: { fontSize: 18, fontWeight: '800', color: '#111827', textAlign: 'right' },
  signout: { padding: 12 },
});