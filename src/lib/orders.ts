type Tone = 'warn' | 'ok' | 'bad' | 'muted';

const LABELS: Record<string, string> = {
  PENDING: 'Aguardando pagamento',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
  FULFILLED: 'Enviado',
  REFUNDED: 'Reembolsado',
};

const TONES: Record<string, Tone> = {
  PENDING: 'warn',
  PAID: 'ok',
  FULFILLED: 'ok',
  CANCELLED: 'bad',
  REFUNDED: 'muted',
};

export function statusLabel(status: string): string {
  return LABELS[status] ?? status;
}

export function statusColor(status: string): string {
  const tone = TONES[status] ?? 'muted';
  return { warn: '#b45309', ok: '#15803d', bad: '#b91c1c', muted: '#6b7280' }[tone];
}