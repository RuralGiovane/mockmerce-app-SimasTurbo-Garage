import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelOrder, checkout, payOrder } from '@/services/orders';
import { queryKeys } from '@/lib/queryKeys';
import type { Order, PaymentMethod } from '@/types/api';

// Faz o checkout do carrinho transformando-o em pedido
export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

// Pega o pedido e escreve direto no cache do "details"
export function usePayOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; method: PaymentMethod; simulate: 'approve' | 'decline' }) =>
      payOrder(v.id, v.method, v.simulate),
    onSuccess: (order: Order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.timeline(order.id) });
    },
  });
}

// Cancela o pedido "removendo" os dados 
export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: (order: Order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.timeline(order.id) });
    },
  });
}