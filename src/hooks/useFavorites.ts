import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listFavorites, addFavorite as addFavoriteService, removeFavorite as removeFavoriteService } from '@/services/favorites';
import { getCustomerFavoritesCache, saveCustomerFavoritesCache } from '@/services/storage';
import { queryKeys } from '@/lib/queryKeys';
import { useSession } from '@/session/session';
import type { FavoriteItem } from '@/types/api';

interface FavoritesQueryResult {
  items: FavoriteItem[];
  isOffline: boolean;
}

export function useFavorites() {
  const { customer } = useSession();
  const customerId = customer?.id ?? '';

  const query = useQuery({
    queryKey: queryKeys.favorites.list(),
    enabled: !!customer,
    queryFn: async (): Promise<FavoritesQueryResult> => {
      try {
        const data = await listFavorites();
        if (customerId) {
          await saveCustomerFavoritesCache(customerId, data);
        }
        return { items: data, isOffline: false };
      } catch (error) {
        // Fallback em caso de modo aviÃ£o / offline
        if (customerId) {
          const cached = await getCustomerFavoritesCache<FavoriteItem>(customerId);
          if (cached && cached.length > 0) {
            return { items: cached, isOffline: true };
          }
        }
        throw error;
      }
    },
  });

  return {
    ...query,
    data: query.data?.items ?? [],
    isOfflineCache: query.data?.isOffline ?? false,
  };
}

export function useFavoriteMutations() {
  const queryClient = useQueryClient();
  const { data: favorites } = useFavorites();

  const add = useMutation({
    mutationFn: (variantId: string) => addFavoriteService(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    },
  });

  const remove = useMutation({
    mutationFn: (variantId: string) => removeFavoriteService(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    },
  });

  function isFavorited(variantId: string): boolean {
    return favorites?.some((item) => item.variantId === variantId) ?? false;
  }

  function toggleFavorite(variantId: string) {
    if (isFavorited(variantId)) {
      remove.mutate(variantId);
    } else {
      add.mutate(variantId);
    }
  }

  return {
    addFavorite: add,
    removeFavorite: remove,
    isFavorited,
    toggleFavorite,
    isPending: add.isPending || remove.isPending,
  };
}