import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useOrders } from '@/hooks/useOrders';
import { statusColor, statusLabel } from '@/lib/orders';
import { money } from '@/lib/format';
import { Badge, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

export function OrdersScreen({ navigation }: Props) {
  const { data, isLoading, isError, error, refetch, isFetching } = useOrders();

  if (isLoading) return <Loading label="Carregando pedidos…" />;
  if (isError) return <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />;

  return (
    <FlatList
      style={styles.container}
      data={data ?? []}
      keyExtractor={(o) => o.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => refetch()} />}
      ListEmptyComponent={<Text style={styles.empty}>Você ainda não fez pedidos.</Text>}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => navigation.navigate('Order', { id: item.id })}>
          <View style={styles.top}>
            <Text style={styles.pedido}>#{item.id.slice(-6)}</Text>
            <Badge label={statusLabel(item.status)} color={statusColor(item.status)} />
          </View>
          <Text style={styles.sub}>
            {item.items.length} {item.items.length === 1 ? 'item' : 'itens'} · {money(item.total)}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 12, gap: 10 },
  card: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, gap: 6 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pedido: { fontSize: 15, fontWeight: '700', color: '#111827' },
  sub: { fontSize: 13, color: '#6b7280' },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 40 },
});