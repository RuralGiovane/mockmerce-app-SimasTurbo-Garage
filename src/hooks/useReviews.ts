import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { canReview, createReview, deleteReview, editReview, getReviews, type ReviewOptions } from '@/services/reviews';
import { useSession } from '@/session/session';
import { queryKeys } from '@/lib/queryKeys';
import type { NovaAvaliacao } from '@/types/avaliacao';
export function useReviews(id: string, options: ReviewOptions = {}) {
  return useInfiniteQuery({ queryKey: ['reviews', id, options], initialPageParam: 1,
    queryFn: ({ pageParam }) => getReviews(id, pageParam, options),
    getNextPageParam: last => last.page * last.pageSize < last.total ? last.page + 1 : undefined });
}
export function useEditReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, review }: { reviewId: string; review: Partial<NovaAvaliacao> }) => editReview(reviewId, review),
    onSuccess: async () => { await Promise.all([
      client.invalidateQueries({ queryKey: ['reviews'] }),
      client.invalidateQueries({ queryKey: ['can-review'] }),
      client.invalidateQueries({ queryKey: queryKeys.products.all }),
    ]); },
  });
}
export function useDeleteReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: async () => { await Promise.all([
      client.invalidateQueries({ queryKey: ['reviews'] }),
      client.invalidateQueries({ queryKey: ['can-review'] }),
      client.invalidateQueries({ queryKey: queryKeys.products.all }),
    ]); },
  });
}
export function useCanReview(id: string) {
  const { customer } = useSession();
  return useQuery({ queryKey: ['can-review', id, customer?.id], queryFn: () => canReview(id), enabled: !!customer });
}
export function useCreateReview(id: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (review: NovaAvaliacao) => createReview(id, review),
    onSuccess: async () => { await Promise.all([
      client.invalidateQueries({ queryKey: ['reviews', id] }),
      client.invalidateQueries({ queryKey: ['can-review', id] }),
      client.invalidateQueries({ queryKey: queryKeys.products.all }),
    ]); } });
}
