import { http } from './http';
import type { FavoriteItem } from '@/types/api';

// GET /v1/customers/me/favorites — lista as variantes favoritadas pelo comprador.
export async function listFavorites(): Promise<FavoriteItem[]> {
  const { data } = await http.get<FavoriteItem[]>('/customers/me/favorites');
  return data;
}

// POST /v1/customers/me/favorites — adiciona uma variante aos favoritos.
export async function addFavorite(variantId: string): Promise<void> {
  await http.post('/customers/me/favorites', { variantId });
}

// DELETE /v1/customers/me/favorites/:variantId — remove a variante dos favoritos.
export async function removeFavorite(variantId: string): Promise<void> {
  await http.delete(`/customers/me/favorites/${variantId}`);
}
