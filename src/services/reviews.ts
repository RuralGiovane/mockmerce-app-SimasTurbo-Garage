import { http } from './http';
import type { Avaliacao, NovaAvaliacao, PodeAvaliar, RespostaAvaliacoes } from '@/types/avaliacao';
import type { ImagePickerAsset } from 'expo-image-picker';

export type ReviewOrder = 'recent' | 'rating_desc' | 'rating_asc';
export type ReviewOptions = { rating?: number; withPhotos?: boolean; order?: ReviewOrder };

export async function getReviews(id: string, page = 1, options: ReviewOptions = {}) {
  const { data } = await http.get<RespostaAvaliacoes>(`/products/${id}/reviews`, {
    params: { page, pageSize: 20, rating: options.rating, withPhotos: options.withPhotos, sort: options.order ?? 'recent' },
  });
  return { ...data, data: data.data.filter(review => !review.hidden) };
}
export async function canReview(id: string) {
  return (await http.get<PodeAvaliar>(`/products/${id}/reviews/can-review`)).data;
}
export async function createReview(id: string, review: NovaAvaliacao) {
  return (await http.post<Avaliacao>(`/products/${id}/reviews`, review)).data;
}
// Como na referência, editar substitui as fotos pela lista enviada.
export async function editReview(reviewId: string, review: Partial<NovaAvaliacao>) {
  return (await http.patch<Avaliacao>(`/reviews/${reviewId}`, review)).data;
}
export async function deleteReview(reviewId: string): Promise<void> {
  await http.delete(`/reviews/${reviewId}`);
}
export async function uploadPhoto(photo: ImagePickerAsset): Promise<string> {
  const form = new FormData();
  // React Native aceita {uri,name,type}; a assinatura DOM declara Blob.
  form.append('file', { uri: photo.uri, name: photo.fileName ?? 'avaliacao.jpg', type: photo.mimeType ?? 'image/jpeg' } as unknown as Blob);
  form.append('folder', 'avaliacoes');
  const { data } = await http.post<{ mediaId?: string; id?: string }>('/uploads', form, {
    headers: { 'Content-Type': undefined }, timeout: 60000,
  });
  const id = data.mediaId ?? data.id;
  if (!id) throw new Error('O upload não retornou o identificador da foto.');
  return id;
}
