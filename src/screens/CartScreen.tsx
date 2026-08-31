import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCart } from '@/hooks/useCart';
import { useCartMutations } from '@/hooks/useCartMutations';
import { useSession } from '@/session/session';
import { money } from '@/lib/format';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { ApiError } from '@/types/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({ navigation }: Props) {
  const { data: cart, isLoading, isError, error, refetch } = useCart();
  const { setQuantity, removeItem } = useCartMutations();
  const { customer } = useSession();

  if (isLoading) return <Loading label="Carregando carrinho da garagem…" />;
  if (isError) return <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />;

  const items = cart?.items ?? [];

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.variantId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerBox}>
            <Text style={styles.greeting}>GARAGEM DE COMPRAS</Text>
            <Text style={styles.customerName}>
              Piloto: <Text style={styles.boldWhite}>{customer?.name ?? 'Cliente'}</Text>
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
            <Text style={styles.emptySubtitle}>
              Você ainda não adicionou peças ou turbinas ao seu pedido.
            </Text>
            <View style={styles.exploreBtn}>
              <Button
                label="Explorar Catálogo de Peças"
                onPress={() => navigation.navigate('Products')}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.unitPrice}>Unitário: {money(item.unitPrice)}</Text>
              <Text style={styles.subtotal}>Subtotal: {money(item.subtotal)}</Text>
            </View>

            <View style={styles.actionsColumn}>
              <View style={styles.qtyBox}>
                <Pressable
                  style={({ pressed }) => [styles.qtyBtn, pressed && styles.btnPressed]}
                  onPress={() => setQuantity.mutate({ variantId: item.variantId, quantity: item.quantity - 1 })}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </Pressable>

                <Text style={styles.qty}>{item.quantity}</Text>

                <Pressable
                  style={({ pressed }) => [styles.qtyBtn, pressed && styles.btnPressed]}
                  onPress={() => setQuantity.mutate({ variantId: item.variantId, quantity: item.quantity + 1 })}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [styles.removeBtn, pressed && styles.btnPressed]}
                onPress={() => removeItem.mutate(item.variantId)}
              >
                <Text style={styles.removeText}>🗑️ Remover</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListFooterComponent={
          items.length ? (
            <View style={styles.footer}>
              <View style={styles.totalCard}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL DO PEDIDO</Text>
                  <Text style={styles.totalValue}>{money(cart?.total ?? 0)}</Text>
                </View>
              </View>

              <Button
                label="Avançar para o Checkout →"
                onPress={() => navigation.navigate('Checkout')}
              />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 14,
    gap: 12,
    paddingBottom: 36,
  },
  headerBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryLight,
    letterSpacing: 1,
  },
  customerName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  boldWhite: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  unitPrice: {
    fontSize: 12,
    color: colors.textMuted,
  },
  subtotal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryLight,
    marginTop: 2,
  },
  actionsColumn: {
    alignItems: 'flex-end',
    gap: 8,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  qty: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    minWidth: 26,
    textAlign: 'center',
  },
  removeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.dangerMuted,
  },
  removeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
  },
  btnPressed: {
    opacity: 0.7,
  },
  footer: {
    marginTop: 16,
    gap: 14,
  },
  totalCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSilver,
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primaryLight,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  exploreBtn: {
    width: '100%',
    maxWidth: 280,
  },
});