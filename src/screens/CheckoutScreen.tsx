import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useOrderActions';
import { money } from '@/lib/format';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const { data: cart, isLoading, isError, error, refetch } = useCart();
  const checkout = useCheckout();

  if (isLoading) return <Loading label="Carregando carrinho…" />;
  if (isError) return <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />;

  const items = cart?.items ?? [];
  const vazio = items.length === 0;

  function confirmar() {
    checkout.mutate(undefined, {
      // Nota: .replace substitui a tela de checkout e não permite voltar para o carrinho quando ele ja virou um pedido.
      onSuccess: (order) => navigation.replace('Order', { id: order.id }),
    });
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.variantId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.h}>Revise seu pedido</Text>}
        ListEmptyComponent={<Text style={styles.empty}>Seu carrinho está vazio.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name} numberOfLines={2}>
              {item.quantity}× {item.name}
            </Text>
            <Text style={styles.sub}>{money(item.subtotal)}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>{money(cart?.total ?? 0)}</Text>
        </View>
        {checkout.isError && (
          <Text style={styles.erro}>{(checkout.error as ApiError).message}</Text>
        )}
        <Button
          label={checkout.isPending ? 'Criando pedido…' : 'Confirmar pedido'}
          onPress={confirmar}
          disabled={vazio || checkout.isPending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16, gap: 8 },
  h: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  name: { flex: 1, fontSize: 14, color: '#374151' },
  sub: { fontSize: 14, fontWeight: '600', color: '#111827' },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 24 },
  footer: { padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, color: '#374151' },
  total: { fontSize: 20, fontWeight: '800', color: '#111827' },
  erro: { color: '#b91c1c', fontSize: 13 },
});