import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCartItem, removeCartItem, updateCartItem } from '@/services/cart';
import { queryKeys } from '@/lib/queryKeys';

export function useCartMutations() {
  const queryClient = useQueryClient();
  const key = queryKeys.cart.all;

  const addItem = useMutation({
    mutationFn: (v: { variantId: string; quantity: number; name?: string; unitPrice?: number }) =>
      addCartItem(v.variantId, v.quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });

  const setQuantity = useMutation({
    mutationFn: (v: { variantId: string; quantity: number }) => updateCartItem(v.variantId, v.quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });

  const removeItem = useMutation({
    mutationFn: (variantId: string) => removeCartItem(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });

  return { addItem, setQuantity, removeItem };
}