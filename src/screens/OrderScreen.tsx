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

type Props = NativeStackScreenProps<RootStackParamList, 'Order'>;

const METHODS: { key: PaymentMethod; label: string }[] = [
  { key: 'PIX', label: 'PIX' },
  { key: 'CREDIT_CARD', label: 'Cartão' },
  { key: 'BOLETO', label: 'Boleto' },
];

export function OrderScreen({ route }: Props) {
  const { id } = route.params;
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);
  const { data: timeline } = useOrderTimeline(id);
  const pay = usePayOrder();
  const cancel = useCancelOrder();

  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [simulate, setSimulate] = useState<'approve' | 'decline'>('approve');

  if (isLoading) return <Loading label="Carregando pedido…" />;
  if (isError || !order) return <ErrorState message={(error as ApiError)?.message ?? 'Falha'} onRetry={() => refetch()} />;

  const pending = order.status === 'PENDING';
  const paid = order.status === 'PAID';
  // Pagamento processou mas não aprovou (recusado): continua PENDING.
  const recusado = pay.isSuccess && pay.data?.status === 'PENDING';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.head}>
        <Text style={styles.pedido}>Pedido #{order.id.slice(-6)}</Text>
        <Badge label={statusLabel(order.status)} color={statusColor(order.status)} />
      </View>

      {order.items.map((it) => (
        <View key={it.variantId} style={styles.row}>
          <Text style={styles.name} numberOfLines={2}>
            {it.quantity}× {it.productName}
            {it.variantName ? ` (${it.variantName})` : ''}
          </Text>
          <Text style={styles.sub}>{money(it.subtotal)}</Text>
        </View>
      ))}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.total}>{money(order.total)}</Text>
      </View>

      {paid && <Text style={styles.ok}>✓ Pagamento aprovado. Obrigado!</Text>}

      {pending && (
        <View style={styles.pay}>
          <Text style={styles.section}>Pagamento</Text>

          <View style={styles.chips}>
            {METHODS.map((m) => (
              <Text
                key={m.key}
                onPress={() => setMethod(m.key)}
                style={[styles.chip, method === m.key && styles.chipActive]}
              >
                {m.label}
              </Text>
            ))}
          </View>

          {/* Simulação: aprovar x recusar — para exercitar os dois caminhos. */}
          <View style={styles.chips}>
            <Text
              onPress={() => setSimulate('approve')}
              style={[styles.chip, simulate === 'approve' && styles.chipActive]}
            >
              simular: aprovar
            </Text>
            <Text
              onPress={() => setSimulate('decline')}
              style={[styles.chip, simulate === 'decline' && styles.chipActive]}
            >
              simular: recusar
            </Text>
          </View>

          {recusado && <Text style={styles.erro}>Pagamento recusado. Tente outro método ou aprove a simulação.</Text>}
          {pay.isError && <Text style={styles.erro}>{(pay.error as ApiError).message}</Text>}

          <Button
            label={pay.isPending ? 'Processando…' : 'Pagar'}
            onPress={() => pay.mutate({ id: order.id, method, simulate })}
            disabled={pay.isPending}
          />
          
          <Button
            label={cancel.isPending ? 'Cancelando…' : 'Cancelar pedido'}
            variant="ghost"
            onPress={() => cancel.mutate(order.id)}
            disabled={cancel.isPending}
          />
        </View>
      )}

      {timeline && timeline.length > 0 && (
        <View style={styles.timeline}>
          <Text style={styles.section}>Linha do tempo</Text>
          {timeline.map((t, i) => (
            <View key={i} style={styles.tl}>
              <Text style={styles.tlDot}>•</Text>
              <Text style={styles.tlText}>
                {statusLabel(t.to)}
                {t.note ? ` — ${t.note}` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pedido: { fontSize: 18, fontWeight: '800', color: '#111827' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  name: { flex: 1, fontSize: 14, color: '#374151' },
  sub: { fontSize: 14, fontWeight: '600', color: '#111827' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  totalLabel: { fontSize: 16, color: '#374151' },
  total: { fontSize: 20, fontWeight: '800', color: '#111827' },
  ok: { fontSize: 15, fontWeight: '700', color: '#15803d', marginTop: 8 },
  pay: { marginTop: 12, gap: 10 },
  section: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    overflow: 'hidden',
    color: '#111827',
  },
  chipActive: { borderColor: '#111827', backgroundColor: '#111827', color: '#fff' },
  erro: { color: '#b91c1c', fontSize: 13 },
  timeline: { marginTop: 16, gap: 4 },
  tl: { flexDirection: 'row', gap: 8 },
  tlDot: { color: '#9ca3af' },
  tlText: { flex: 1, fontSize: 13, color: '#374151' },
});