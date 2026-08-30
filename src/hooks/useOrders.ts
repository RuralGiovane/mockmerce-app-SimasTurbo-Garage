import { useQuery } from '@tanstack/react-query';
import { getOrder, getOrderTimeline, listOrders } from '@/services/orders';
import { queryKeys } from '@/lib/queryKeys';
import { useSession } from '@/session/session';

//Função de Histórico
export function useOrders() {
  const { isLoggedIn } = useSession();
  return useQuery({
    queryKey: queryKeys.orders.list(),
    queryFn: listOrders,
    enabled: isLoggedIn,
  });
}

//Função de detalhes de um pedido
export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
  });
}

//Função de linha do tempo
export function useOrderTimeline(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.timeline(id),
    queryFn: () => getOrderTimeline(id),
    enabled: Boolean(id),
  });
}