import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useOrder, useOrderTimeline } from '@/hooks/useOrders';
import { useCancelOrder, usePayOrder } from '@/hooks/useOrderActions';
import { statusColor, statusLabel } from '@/lib/orders';
import { money } from '@/lib/format';
import { Badge, Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError, PaymentMethod } from '@/types/api';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Order'>;

const METHODS: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: 'PIX', label: 'PIX Instantâneo', icon: '⚡' },
  { key: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: '💳' },
  { key: 'BOLETO', label: 'Boleto Bancário', icon: '📄' },
];

export function OrderScreen({ route }: Props) {
  const { id } = route.params;
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);
  const { data: timeline } = useOrderTimeline(id);
  const pay = usePayOrder();
  const cancel = useCancelOrder();

  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [simulate, setSimulate] = useState<'approve' | 'decline'>('approve');

  if (isLoading) return <Loading label="Carregando detalhes do pedido…" />;
  if (isError || !order) return <ErrorState message={(error as ApiError)?.message ?? 'Falha ao buscar pedido'} onRetry={() => refetch()} />;

  const pending = order.status === 'PENDING';
  const paid = order.status === 'PAID';
  const cancelled = order.status === 'CANCELLED';
  const recusado = pay.isSuccess && pay.data?.status === 'PENDING';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Cabeçalho do Pedido */}
      <View style={styles.headerCard}>
        <View style={styles.head}>
          <View>
            <Text style={styles.orderSubtitle}>ORDEM DE SERVIÇO</Text>
            <Text style={styles.pedido}>#{order.id.slice(-8).toUpperCase()}</Text>
          </View>
          <Badge label={statusLabel(order.status)} color={statusColor(order.status)} />
        </View>

        <View style={styles.divider} />

        {/* Itens do Pedido */}
        <View style={styles.itemsList}>
          {order.items.map((it) => (
            <View key={it.variantId} style={styles.itemRow}>
              <Text style={styles.itemQuantity}>{it.quantity}×</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.name} numberOfLines={2}>
                  {it.productName}
                </Text>
                {it.variantName ? <Text style={styles.variantName}>{it.variantName}</Text> : null}
              </View>
              <Text style={styles.sub}>{money(it.subtotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.total}>{money(order.total)}</Text>
        </View>
      </View>

      {/* Alertas de Status */}
      {paid && (
        <View style={styles.successBanner}>
          <Text style={styles.successIcon}>🏁</Text>
          <View style={styles.successTextContainer}>
            <Text style={styles.successTitle}>Pagamento Aprovado!</Text>
            <Text style={styles.successDesc}>Sua peça foi liberada para expedição na garagem.</Text>
          </View>
        </View>
      )}

      {cancelled && (
        <View style={styles.cancelledBanner}>
          <Text style={styles.cancelledTitle}>Pedido Cancelado</Text>
          <Text style={styles.cancelledDesc}>O estoque reservado foi liberado com sucesso.</Text>
        </View>
      )}

      {/* Seção de Pagamento para Pedidos Pendentes */}
      {pending && (
        <View style={styles.payCard}>
          <Text style={styles.sectionTitle}>MÉTODO DE PAGAMENTO</Text>

          <View style={styles.methodsList}>
            {METHODS.map((m) => {
              const active = method === m.key;
              return (
                <Text
                  key={m.key}
                  onPress={() => setMethod(m.key)}
                  style={[styles.methodChip, active && styles.methodChipActive]}
                >
                  {m.icon} {m.label}
                </Text>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>SIMULAÇÃO DE RESPOSTA</Text>
          <View style={styles.simulateRow}>
            <Text
              onPress={() => setSimulate('approve')}
              style={[styles.simChip, simulate === 'approve' && styles.simChipApprove]}
            >
              ✓ Simular Aprovação
            </Text>
            <Text
              onPress={() => setSimulate('decline')}
              style={[styles.simChip, simulate === 'decline' && styles.simChipDecline]}
            >
              ✕ Simular Recusa
            </Text>
          </View>

          {recusado && (
            <View style={styles.declineBanner}>
              <Text style={styles.declineTitle}>⚠️ Pagamento Recusado</Text>
              <Text style={styles.declineDesc}>
                A transação não foi aprovada. Escolha outro método ou mude a simulação para aprovar.
              </Text>
            </View>
          )}

          {pay.isError && (
            <View style={styles.declineBanner}>
              <Text style={styles.declineDesc}>{(pay.error as ApiError).message}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <Button
              label={pay.isPending ? 'Processando transação…' : `Confirmar Pagamento (${method})`}
              onPress={() => pay.mutate({ id: order.id, method, simulate })}
              disabled={pay.isPending}
            />

            <Button
              label={cancel.isPending ? 'Cancelando ordem…' : 'Cancelar Pedido'}
              variant="ghost"
              onPress={() => cancel.mutate(order.id)}
              disabled={cancel.isPending}
            />
          </View>
        </View>
      )}

      {/* Linha do Tempo */}
      {timeline && timeline.length > 0 && (
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>LINHA DO TEMPO DA ORDEM</Text>
          <View style={styles.timelineList}>
            {timeline.map((t, i) => (
              <View key={i} style={styles.tlItem}>
                <View style={styles.tlBullet}>
                  <Text style={styles.tlDot}>•</Text>
                </View>
                <View style={styles.tlContent}>
                  <Text style={styles.tlStatus}>{statusLabel(t.to)}</Text>
                  {t.note ? <Text style={styles.tlNote}>{t.note}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 36,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryLight,
    letterSpacing: 1,
  },
  pedido: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  itemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  itemDetails: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSilver,
  },
  variantName: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sub: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSilver,
    letterSpacing: 0.5,
  },
  total: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primaryLight,
    letterSpacing: 0.5,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.successMuted,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successIcon: {
    fontSize: 32,
  },
  successTextContainer: {
    flex: 1,
    gap: 2,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.success,
  },
  successDesc: {
    fontSize: 13,
    color: colors.textSilver,
  },
  cancelledBanner: {
    backgroundColor: colors.dangerMuted,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.danger,
    gap: 4,
  },
  cancelledTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.danger,
  },
  cancelledDesc: {
    fontSize: 13,
    color: colors.textSilver,
  },
  payCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSilver,
    letterSpacing: 0.8,
  },
  methodsList: {
    gap: 8,
  },
  methodChip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textSilver,
    fontSize: 14,
    fontWeight: '700',
  },
  methodChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
    color: colors.textPrimary,
  },
  simulateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  simChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingVertical: 10,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  simChipApprove: {
    borderColor: colors.success,
    backgroundColor: colors.successMuted,
    color: colors.success,
  },
  simChipDecline: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerMuted,
    color: colors.danger,
  },
  declineBanner: {
    backgroundColor: colors.dangerMuted,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    gap: 4,
  },
  declineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.danger,
  },
  declineDesc: {
    fontSize: 12,
    color: colors.textSilver,
    lineHeight: 18,
  },
  actions: {
    gap: 10,
    marginTop: 6,
  },
  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  timelineList: {
    gap: 12,
  },
  tlItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  tlBullet: {
    width: 20,
    alignItems: 'center',
  },
  tlDot: {
    color: colors.primaryLight,
    fontSize: 20,
    lineHeight: 20,
  },
  tlContent: {
    flex: 1,
    gap: 2,
  },
  tlStatus: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tlNote: {
    fontSize: 12,
    color: colors.textMuted,
  },
});